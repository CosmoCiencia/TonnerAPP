const teamFlags: Record<string, string> = {
  Argelia: '🇩🇿',
  Arabia: '🇸🇦',
  'Arabia Saudí': '🇸🇦',
  Argentina: '🇦🇷',
  Australia: '🇦🇺',
  Austria: '🇦🇹',
  Bélgica: '🇧🇪',
  Bolivia: '🇧🇴',
  'Bosnia': '🇧🇦',
  'Bosnia y Herzegovina': '🇧🇦',
  Brasil: '🇧🇷',
  'Cabo Verde': '🇨🇻',
  Canadá: '🇨🇦',
  Catar: '🇶🇦',
  Colombia: '🇨🇴',
  Croacia: '🇭🇷',
  Curazao: '🇨🇼',
  Dinamarca: '🇩🇰',
  Ecuador: '🇪🇨',
  Egipto: '🇪🇬',
  Escocia: '🏴',
  Eslovaquia: '🇸🇰',
  España: '🇪🇸',
  'Estados Unidos': '🇺🇸',
  Francia: '🇫🇷',
  Gales: '🏴',
  Alemania: '🇩🇪',
  Ghana: '🇬🇭',
  Haití: '🇭🇹',
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
  Noruega: '🇳🇴',
  'Nueva Caledonia': '🇳🇨',
  'Nueva Zelanda': '🇳🇿',
  'Países Bajos': '🇳🇱',
  Panamá: '🇵🇦',
  Paraguay: '🇵🇾',
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
  Sudáfrica: '🇿🇦',
  Surinam: '🇸🇷',
  Suiza: '🇨🇭',
  Suecia: '🇸🇪',
  Túnez: '🇹🇳',
  Turquía: '🇹🇷',
  Ucrania: '🇺🇦',
  Uruguay: '🇺🇾',
  Uzbekistán: '🇺🇿',
};

const aliases: Record<string, string> = {
  'Corea del Sur': 'República de Corea',
  'Korea Republic': 'República de Corea',
  'South Korea': 'República de Corea',
  'Saudi Arabia': 'Arabia Saudí',
  'Iran': 'RI de Irán',
  'Irán': 'RI de Irán',
  Netherlands: 'Países Bajos',
  USA: 'Estados Unidos',
  Qatar: 'Catar',
  Bosnia: 'Bosnia y Herzegovina',
  'Bosnia/Herzegovina': 'Bosnia y Herzegovina',
  Irlanda: 'República de Irlanda',
  'Macedonia': 'Macedonia del Norte',
};

function resolveSingleTeamFlag(team: string) {
  const trimmed = team.trim();
  const canonical = aliases[trimmed] ?? trimmed;
  return teamFlags[canonical] ?? '🏳️';
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
