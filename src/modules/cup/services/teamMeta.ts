const teamFlags: Record<string, string> = {
  Alemania: '🇩🇪',
  Argelia: '🇩🇿',
  Arabia: '🇸🇦',
  'Arabia Saudí': '🇸🇦',
  'Arabia Saudita': '🇸🇦',
  Argentina: '🇦🇷',
  Australia: '🇦🇺',
  Austria: '🇦🇹',
  Bélgica: '🇧🇪',
  Bolivia: '🇧🇴',
  Bosnia: '🇧🇦',
  'Bosnia y Herzegovina': '🇧🇦',
  Brasil: '🇧🇷',
  'Cabo Verde': '🇨🇻',
  Camerún: '🇨🇲',
  Canadá: '🇨🇦',
  Catar: '🇶🇦',
  Chile: '🇨🇱',
  Colombia: '🇨🇴',
  'Corea del Sur': '🇰🇷',
  'Costa Rica': '🇨🇷',
  'Costa de Marfil': '🇨🇮',
  Croacia: '🇭🇷',
  Curazao: '🇨🇼',
  Dinamarca: '🇩🇰',
  Ecuador: '🇪🇨',
  Egipto: '🇪🇬',
  Escocia: '🏴',
  Eslovaquia: '🇸🇰',
  Eslovenia: '🇸🇮',
  España: '🇪🇸',
  'Estados Unidos': '🇺🇸',
  Francia: '🇫🇷',
  Gales: '🏴',
  Ghana: '🇬🇭',
  Grecia: '🇬🇷',
  Haití: '🇭🇹',
  Honduras: '🇭🇳',
  Inglaterra: '🏴',
  Irán: '🇮🇷',
  Irak: '🇮🇶',
  Irlanda: '🇮🇪',
  'Irlanda del Norte': '🇬🇧',
  Italia: '🇮🇹',
  Jamaica: '🇯🇲',
  Japón: '🇯🇵',
  Jordania: '🇯🇴',
  Kosovo: '🇽🇰',
  'Macedonia del Norte': '🇲🇰',
  Marruecos: '🇲🇦',
  México: '🇲🇽',
  Nigeria: '🇳🇬',
  Noruega: '🇳🇴',
  'Nueva Caledonia': '🇳🇨',
  'Nueva Zelanda': '🇳🇿',
  'Países Bajos': '🇳🇱',
  Panamá: '🇵🇦',
  Paraguay: '🇵🇾',
  Perú: '🇵🇪',
  Polonia: '🇵🇱',
  Portugal: '🇵🇹',
  'RD Congo': '🇨🇩',
  'RD de Congo': '🇨🇩',
  'República Checa': '🇨🇿',
  'República de Corea': '🇰🇷',
  'República de Irlanda': '🇮🇪',
  'RI de Irán': '🇮🇷',
  Rumania: '🇷🇴',
  Senegal: '🇸🇳',
  Serbia: '🇷🇸',
  Sudáfrica: '🇿🇦',
  Suecia: '🇸🇪',
  Suiza: '🇨🇭',
  Surinam: '🇸🇷',
  Túnez: '🇹🇳',
  Turquía: '🇹🇷',
  Ucrania: '🇺🇦',
  Uruguay: '🇺🇾',
  Uzbekistán: '🇺🇿',
  Venezuela: '🇻🇪',
};

const aliases: Record<string, string> = {
  'Algeria': 'Argelia',
  'Belgium': 'Bélgica',
  'Bosnia and Herzegovina': 'Bosnia y Herzegovina',
  'Bosnia/Herzegovina': 'Bosnia y Herzegovina',
  'Brazil': 'Brasil',
  'Cameroon': 'Camerún',
  'Canada': 'Canadá',
  'Cape Verde': 'Cabo Verde',
  'Cape Verde Islands': 'Cabo Verde',
  'Chile': 'Chile',
  'Colombia': 'Colombia',
  'Congo DR': 'RD Congo',
  'Costa Rica': 'Costa Rica',
  "Côte d'Ivoire": 'Costa de Marfil',
  'Croatia': 'Croacia',
  'Curacao': 'Curazao',
  'Curaçao': 'Curazao',
  'Czechia': 'República Checa',
  'Czech Republic': 'República Checa',
  'Denmark': 'Dinamarca',
  'DR Congo': 'RD Congo',
  'Ecuador': 'Ecuador',
  'Egypt': 'Egipto',
  'England': 'Inglaterra',
  'France': 'Francia',
  'Germany': 'Alemania',
  'Ghana': 'Ghana',
  'Haiti': 'Haití',
  'Honduras': 'Honduras',
  'IR Iran': 'RI de Irán',
  'Iran': 'RI de Irán',
  'Iraq': 'Irak',
  'Italy': 'Italia',
  'Ivory Coast': 'Costa de Marfil',
  'Jamaica': 'Jamaica',
  'Japan': 'Japón',
  'Jordan': 'Jordania',
  'Korea Republic': 'República de Corea',
  'Mexico': 'México',
  'Morocco': 'Marruecos',
  'Netherlands': 'Países Bajos',
  'New Caledonia': 'Nueva Caledonia',
  'New Zealand': 'Nueva Zelanda',
  'Norway': 'Noruega',
  'North Macedonia': 'Macedonia del Norte',
  'Northern Ireland': 'Irlanda del Norte',
  'Panama': 'Panamá',
  'Paraguay': 'Paraguay',
  'Peru': 'Perú',
  'Qatar': 'Catar',
  'Republic of Ireland': 'República de Irlanda',
  'Romania': 'Rumania',
  'Saudi Arabia': 'Arabia Saudí',
  'Scotland': 'Escocia',
  'Senegal': 'Senegal',
  'Serbia': 'Serbia',
  'Slovakia': 'Eslovaquia',
  'Slovenia': 'Eslovenia',
  'South Africa': 'Sudáfrica',
  'South Korea': 'República de Corea',
  'Spain': 'España',
  'Suriname': 'Surinam',
  'Sweden': 'Suecia',
  'Switzerland': 'Suiza',
  'Tunisia': 'Túnez',
  'Turkey': 'Turquía',
  'Türkiye': 'Turquía',
  'USA': 'Estados Unidos',
  'Ukraine': 'Ucrania',
  'United States': 'Estados Unidos',
  'Uruguay': 'Uruguay',
  'Uzbekistan': 'Uzbekistán',
  'Venezuela': 'Venezuela',
  'Wales': 'Gales',
  'Irlanda': 'República de Irlanda',
  'Irán': 'RI de Irán',
  'Macedonia': 'Macedonia del Norte',
};

function normalizeTeamName(team: string) {
  return team
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/&/g, 'and')
    .replace(/[.'’]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

const normalizedTeamFlags = Object.fromEntries(
  Object.entries(teamFlags).map(([team, flag]) => [normalizeTeamName(team), flag]),
);

const normalizedAliases = Object.fromEntries(
  Object.entries(aliases).map(([alias, canonical]) => [normalizeTeamName(alias), canonical]),
);

function resolveSingleTeamFlag(team: string) {
  const normalized = normalizeTeamName(team);
  const canonical = normalizedAliases[normalized] ?? team.trim();
  return normalizedTeamFlags[normalizeTeamName(canonical)] ?? '🏳️';
}

export function getTeamFlag(team: string) {
  if (team.includes('/')) {
    return team
      .split('/')
      .map((name) => resolveSingleTeamFlag(name))
      .join(' ');
  }

  return resolveSingleTeamFlag(team);
}
