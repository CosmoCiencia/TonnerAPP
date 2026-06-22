import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.87.1';

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
  'access-control-allow-methods': 'POST, OPTIONS',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'content-type': 'application/json; charset=utf-8',
    },
  });
}

function requireEnv(name: string): string {
  const value = Deno.env.get(name)?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'Method not allowed.' }, 405);
  }

  try {
    const authorization = request.headers.get('authorization')?.trim();

    if (!authorization?.toLowerCase().startsWith('bearer ')) {
      return jsonResponse({ ok: false, error: 'Debes iniciar sesión para eliminar tu cuenta.' }, 401);
    }

    const supabaseUrl = requireEnv('SUPABASE_URL');
    const supabaseAnonKey = requireEnv('SUPABASE_ANON_KEY');
    const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();

    if (userError || !userData.user) {
      console.warn('[delete-account] Invalid user session:', userError?.message);
      return jsonResponse({ ok: false, error: 'La sesión no es válida. Inicia sesión nuevamente.' }, 401);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userData.user.id, false);

    if (deleteError) {
      console.error('[delete-account] User deletion failed:', deleteError.message);
      return jsonResponse({ ok: false, error: 'No se pudo eliminar la cuenta.' }, 500);
    }

    console.info(`[delete-account] Deleted user ${userData.user.id}.`);
    return jsonResponse({ ok: true });
  } catch (error) {
    console.error('[delete-account] Unexpected error:', error);
    return jsonResponse({ ok: false, error: 'No se pudo eliminar la cuenta.' }, 500);
  }
});
