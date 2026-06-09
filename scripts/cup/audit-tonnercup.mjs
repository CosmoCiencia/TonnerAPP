import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const AUDIT_PREFIX = 'tonner-audit';
const PASSWORD_PREFIX = 'TonnerAudit';

function loadDotEnv() {
  try {
    const raw = readFileSync('.env', 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (!match) continue;
      const [, key, value] = match;
      if (!process.env[key]) {
        process.env[key] = value.replace(/^["']|["']$/g, '');
      }
    }
  } catch {
    // The script can also run with exported env vars only.
  }
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}. Export it or set it in .env before running this audit.`);
  }
  return value;
}

function shellStep(label, command, args, options = {}) {
  process.stdout.write(`- ${label} ... `);
  try {
    execFileSync(command, args, {
      encoding: 'utf8',
      stdio: options.quiet ? ['ignore', 'pipe', 'pipe'] : 'ignore',
    });
    console.log('OK');
  } catch (error) {
    console.log('FAIL');
    if (error.stdout) console.error(String(error.stdout));
    if (error.stderr) console.error(String(error.stderr));
    throw error;
  }
}

function parseSupabaseJson(output) {
  const trimmedOutput = output.trim();
  if (trimmedOutput.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmedOutput);
      if (Array.isArray(parsed)) return { rows: parsed };
    } catch {
      // Fall through to mixed-output parsing.
    }
  }

  const objects = [];
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < output.length; index += 1) {
    const char = output[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
    } else if (char === '{') {
      if (depth === 0) start = index;
      depth += 1;
    } else if (char === '}') {
      depth -= 1;

      if (depth === 0 && start !== -1) {
        objects.push(output.slice(start, index + 1));
        start = -1;
      }
    }
  }

  for (const candidate of objects.toReversed()) {
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed)) return { rows: parsed };
      if (Array.isArray(parsed.rows) && parsed.rows.length > 0) return parsed;
    } catch {
      // Try the next JSON-like block.
    }
  }

  for (const candidate of objects.toReversed()) {
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed)) return { rows: parsed };
      if (Array.isArray(parsed.rows)) return parsed;
    } catch {
      // Try the next JSON-like block.
    }
  }

  throw new Error(`Could not find a complete Supabase JSON object with rows:\n${output}`);
}

function dbQuery(sql) {
  const output = execFileSync('supabase', ['db', 'query', '--linked', '--output', 'json', sql], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return parseSupabaseJson(output).rows ?? [];
}

function getOptionalEnv(name) {
  return process.env[name]?.trim() || null;
}

function readVaultSecret(name) {
  const envValue = getOptionalEnv(name);
  if (envValue) return envValue;

  const rows = dbQuery(`
    select decrypted_secret as value
    from vault.decrypted_secrets
    where name = ${sqlLiteral(name)}
      and decrypted_secret is not null
    limit 1
  `);

  return rows[0]?.value?.trim() || null;
}

function sqlLiteral(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function pass(message) {
  console.log(`PASS ${message}`);
}

async function invokeFunction(supabaseUrl, secret, name, body) {
  const response = await fetch(`${supabaseUrl}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-tonner-sync-secret': secret,
    },
    body: JSON.stringify(body ?? {}),
  });
  const text = await response.text();
  let payload = null;

  try {
    payload = JSON.parse(text);
  } catch {
    payload = text;
  }

  assert(response.ok, `${name} HTTP ${response.status}: ${text}`);
  return payload;
}

async function createAuditUser({ supabaseUrl, anonKey, email, password, fullName, participantType, accessCode }) {
  const supabase = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  assert(!signUpError, `${participantType} signUp failed: ${signUpError?.message}`);
  assert(signUpData.session?.access_token, `${participantType} signUp did not return an active session.`);
  assert(signUpData.user?.id, `${participantType} signUp did not return a user id.`);

  const { data: profile, error: profileError } = await supabase
    .rpc('upsert_own_customer_profile', {
      profile_full_name: fullName,
      access_code: accessCode ?? null,
      requested_cup_user_type: participantType,
    })
    .single();

  assert(!profileError, `${participantType} profile RPC failed: ${profileError?.message}`);
  assert(profile?.cup_user_type === participantType, `${participantType} profile stored ${profile?.cup_user_type}.`);

  return {
    supabase,
    userId: signUpData.user.id,
    email,
    participantType,
  };
}

async function savePredictionAndCheckRanking(auditUser, matchId) {
  const { data: prediction, error: predictionError } = await auditUser.supabase
    .from('cup_predictions')
    .upsert(
      {
        user_id: auditUser.userId,
        match_id: matchId,
        prediction_result: 'home',
        predicted_home: 1,
        predicted_away: 0,
        predicted_scorer_player_id: null,
        predicted_scorer_name: null,
      },
      { onConflict: 'user_id,match_id' },
    )
    .select('id,user_id,match_id,prediction_result,predicted_home,predicted_away')
    .single();

  assert(!predictionError, `${auditUser.participantType} prediction failed: ${predictionError?.message}`);
  assert(prediction?.user_id === auditUser.userId, `${auditUser.participantType} prediction saved for wrong user.`);

  const { data: ranking, error: rankingError } = await auditUser.supabase
    .from('cup_ranking_view')
    .select('position,user_id,cup_user_type,total_points,exact_hits,prediction_count')
    .order('position', { ascending: true });

  assert(!rankingError, `${auditUser.participantType} ranking failed: ${rankingError?.message}`);
  assert(ranking?.some((row) => row.user_id === auditUser.userId), `${auditUser.participantType} ranking does not include audit user.`);
  assert(
    (ranking ?? []).every((row) => row.cup_user_type === auditUser.participantType),
    `${auditUser.participantType} ranking leaked another cup_user_type.`,
  );
}

async function assertPredictionLockedAfterKickoff({ supabase, userId, matchId }) {
  const { error } = await supabase
    .from('cup_predictions')
    .upsert(
      {
        user_id: userId,
        match_id: matchId,
        prediction_result: 'home',
        predicted_home: 1,
        predicted_away: 0,
      },
      { onConflict: 'user_id,match_id' },
    );

  assert(error, 'RLS did not block a prediction for a past match.');
}

function cleanupAuditData({ emails, tempMatchId }) {
  const cleanupErrors = [];

  if (tempMatchId) {
    try {
      dbQuery(`delete from public.cup_matches where id = ${sqlLiteral(tempMatchId)};`);
    } catch (error) {
      cleanupErrors.push(`temp match cleanup failed: ${error.message}`);
    }
  }

  if (emails.length > 0) {
    try {
      dbQuery(`delete from auth.users where email in (${emails.map(sqlLiteral).join(',')});`);
    } catch (error) {
      cleanupErrors.push(`audit user cleanup failed: ${error.message}`);
    }
  }

  if (cleanupErrors.length > 0) {
    console.warn('WARN cleanup finished with issues:');
    for (const error of cleanupErrors) console.warn(`- ${error}`);
  }
}

loadDotEnv();

const supabaseUrl = requireEnv('VITE_SUPABASE_URL').replace(/\/$/, '');
const anonKey = requireEnv('VITE_SUPABASE_ANON_KEY');
const syncSecret = requireEnv('SYNC_CUP_SECRET');
const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
const password = `${PASSWORD_PREFIX}-${stamp}!12345`;
const auditEmails = [];
let tempMatchId = '';

try {
  console.log('TonnerCup audit started.');

  shellStep('build', 'npm', ['run', 'build']);
  shellStep('lint', 'npm', ['run', 'lint']);
  shellStep('production dependency audit', 'npm', ['audit', '--audit-level=high', '--omit=dev']);

  const secretChecks = dbQuery(`
    select name, decrypted_secret is not null as configured
    from vault.decrypted_secrets
    where name in ('CUP_INTERNAL_ACCESS_CODE', 'CUP_DISTRIBUTOR_ACCESS_CODE', 'SYNC_CUP_SECRET')
  `);
  const configuredSecretNames = new Set(secretChecks.filter((row) => row.configured).map((row) => row.name));
  const internalCode = readVaultSecret('CUP_INTERNAL_ACCESS_CODE');
  const distributorCode = readVaultSecret('CUP_DISTRIBUTOR_ACCESS_CODE');
  const vaultSyncSecretConfigured = configuredSecretNames.has('SYNC_CUP_SECRET') || Boolean(getOptionalEnv('SYNC_CUP_SECRET'));
  const configuredList = [...configuredSecretNames].sort().join(', ') || 'none';

  assert(internalCode, `Vault/env is missing CUP_INTERNAL_ACCESS_CODE. Configured Vault secrets: ${configuredList}.`);
  assert(distributorCode, `Vault/env is missing CUP_DISTRIBUTOR_ACCESS_CODE. Configured Vault secrets: ${configuredList}.`);
  assert(vaultSyncSecretConfigured, `Vault/env is missing SYNC_CUP_SECRET. Configured Vault secrets: ${configuredList}.`);
  pass('Vault secrets are configured');

  const migrations = execFileSync('supabase', ['migration', 'list'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  assert(/\b016\s+\|\s+016\b/.test(migrations), 'Migration 016 is not applied remotely.');
  assert(/\b017\s+\|\s+017\b/.test(migrations), 'Migration 017 is not applied remotely.');
  pass('critical migrations are applied remotely');

  const cronRows = dbQuery(`
    select jobname, schedule, active
    from cron.job
    where jobname in ('tonnercup-sync-live', 'tonnercup-calculate-points', 'tonnercup-sync-standard')
    order by jobname
  `);
  const cronByName = new Map(cronRows.map((row) => [row.jobname, row]));
  assert(cronByName.get('tonnercup-sync-live')?.active, 'tonnercup-sync-live cron is not active.');
  assert(cronByName.get('tonnercup-calculate-points')?.active, 'tonnercup-calculate-points cron is not active.');
  assert(cronByName.get('tonnercup-sync-standard')?.active, 'tonnercup-sync-standard cron is not active.');
  pass('cron jobs are active');

  const dataChecks = dbQuery(`
    select 'matches_total' as check_name, count(*)::int as count from public.cup_matches
    union all select 'matches_future', count(*)::int from public.cup_matches where date > now()
    union all select 'team_players', count(*)::int from public.cup_team_players
    union all select 'profiles_without_type', count(*)::int from public.profiles where cup_user_type is null or cup_user_type not in ('public','internal','distributor')
    union all select 'predictions_without_profile', count(*)::int from public.cup_predictions p left join public.profiles pr on pr.id = p.user_id where pr.id is null
    union all select 'predictions_without_match', count(*)::int from public.cup_predictions p left join public.cup_matches m on m.id = p.match_id where m.id is null
    union all select 'matches_missing_api_fixture', count(*)::int from public.cup_matches where api_fixture_id is null
    union all select 'matches_missing_team_id', count(*)::int from public.cup_matches where home_team_id is null or away_team_id is null
    union all select 'matches_missing_logos', count(*)::int from public.cup_matches where home_team_logo is null or away_team_logo is null
    union all select 'players_without_name', count(*)::int from public.cup_team_players where player_name is null or btrim(player_name) = ''
  `);
  const checks = Object.fromEntries(dataChecks.map((row) => [row.check_name, row.count]));
  assert(checks.matches_total >= 72, `Expected at least 72 matches, got ${checks.matches_total}.`);
  assert(checks.matches_future > 0, 'No future matches are available.');
  assert(checks.team_players > 0, 'No team players are loaded.');
  for (const checkName of [
    'profiles_without_type',
    'predictions_without_profile',
    'predictions_without_match',
    'matches_missing_api_fixture',
    'matches_missing_team_id',
    'matches_missing_logos',
    'players_without_name',
  ]) {
    assert(checks[checkName] === 0, `${checkName} = ${checks[checkName]}.`);
  }
  pass(`remote data is consistent (${checks.matches_total} matches, ${checks.team_players} players)`);

  const firstFutureMatch = dbQuery(`
    select id, home_team_name, away_team_name, date
    from public.cup_matches
    where date > now()
    order by date asc
    limit 1
  `)[0];
  assert(firstFutureMatch?.id, 'Could not find a future match for prediction tests.');
  pass(`future match available: ${firstFutureMatch.home_team_name} vs ${firstFutureMatch.away_team_name}`);

  const livePayload = await invokeFunction(supabaseUrl, syncSecret, 'sync-cup-fixtures', {
    mode: 'live',
    league: 1,
    season: 2026,
  });
  assert(livePayload.ok === true, 'sync-cup-fixtures live did not return ok=true.');
  pass('live sync function responds');

  const standardPayload = await invokeFunction(supabaseUrl, syncSecret, 'sync-cup-fixtures', {
    mode: 'standard',
    targets: [{ league: 1, season: 2026 }],
  });
  assert(standardPayload.ok === true, 'sync-cup-fixtures standard did not return ok=true.');
  assert(standardPayload.upserted >= 1, 'standard sync did not upsert any fixtures.');
  pass(`standard sync function responds (${standardPayload.upserted} fixtures)`);

  const pointsPayload = await invokeFunction(supabaseUrl, syncSecret, 'calculate-cup-points', {});
  assert(pointsPayload.ok === true, 'calculate-cup-points did not return ok=true.');
  pass('points calculation function responds');

  const unauthorized = await fetch(`${supabaseUrl}/functions/v1/calculate-cup-points`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-tonner-sync-secret': 'wrong-secret',
    },
    body: '{}',
  });
  assert(unauthorized.status === 401, `Wrong sync secret returned HTTP ${unauthorized.status}, expected 401.`);
  pass('internal functions reject wrong sync secret');

  const users = [];
  const scenarios = [
    { participantType: 'public', accessCode: null },
    { participantType: 'internal', accessCode: internalCode },
    { participantType: 'distributor', accessCode: distributorCode },
  ];

  for (const scenario of scenarios) {
    const email = `${AUDIT_PREFIX}-${scenario.participantType}-${stamp}@example.com`;
    auditEmails.push(email);
    const user = await createAuditUser({
      supabaseUrl,
      anonKey,
      email,
      password,
      fullName: `Tonner Audit ${scenario.participantType}`,
      ...scenario,
    });
    users.push(user);
    pass(`${scenario.participantType} registration stores correct cup_user_type`);
  }

  for (const user of users) {
    await savePredictionAndCheckRanking(user, firstFutureMatch.id);
    pass(`${user.participantType} prediction saves and ranking stays isolated`);
  }

  tempMatchId = `${AUDIT_PREFIX}-past-${stamp}`;
  dbQuery(`
    insert into public.cup_matches (
      id, api_fixture_id, league_id, season, round, stage, group_name, date,
      status_short, status_long, home_team_id, home_team_name, away_team_id, away_team_name, raw
    ) values (
      ${sqlLiteral(tempMatchId)}, -${Date.now()}, 1, 2026, 'Audit', 'Fase de grupos', 'Z',
      now() - interval '1 hour', 'NS', 'Not Started', 999001, 'Audit Home', 999002, 'Audit Away', '{}'::jsonb
    )
  `);
  await assertPredictionLockedAfterKickoff({
    supabase: users[0].supabase,
    userId: users[0].userId,
    matchId: tempMatchId,
  });
  pass('RLS blocks predictions after kickoff');

  const recentRuns = dbQuery(`
    select d.jobid, j.jobname, d.status, d.start_time
    from cron.job_run_details d
    join cron.job j on j.jobid = d.jobid
    where j.jobname in ('tonnercup-sync-live', 'tonnercup-calculate-points', 'tonnercup-sync-standard')
    order by d.start_time desc
    limit 12
  `);
  assert(recentRuns.some((row) => row.jobname === 'tonnercup-sync-live' && row.status === 'succeeded'), 'No recent successful live sync cron run found.');
  assert(recentRuns.some((row) => row.jobname === 'tonnercup-calculate-points' && row.status === 'succeeded'), 'No recent successful points cron run found.');
  pass('recent cron runs are succeeding');

  console.log('\nTONNERCUP AUDIT PASSED');
} finally {
  cleanupAuditData({ emails: auditEmails, tempMatchId });
}
