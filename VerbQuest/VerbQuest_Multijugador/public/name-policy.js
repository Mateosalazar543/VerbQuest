/* Reglas compartidas: cliente y servidor */
(function (root, makePolicy) {
  'use strict';

  const policy = makePolicy();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = policy;
  }

  if (root) root.VerbQuestNamePolicy = policy;

})(typeof globalThis === 'undefined' ? null : globalThis, function () {
  'use strict';

  const MAX_LENGTH = 22;

  const BAD_NAME =
    'Ese nombre no está permitido. Elige uno respetuoso y diferente.';

  const INVALID_NAME =
    'Usa de 2 a 22 caracteres: letras, números, espacios, puntos, guiones o guion bajo.';

  // Coincidencias completas para evitar falsos positivos.
  const blockedWords = new Set([
    'puta', 'puto', 'putas', 'putos', 'putita', 'putito', 'putazo',
    'mierda', 'mierdas', 'hpta', 'hpt',
    'hijueputa', 'hijoputa', 'hijaputa',
    'malparido', 'malparida', 'gonorrea', 'carechimba', 'chimba',
    'marica', 'marico', 'maricon', 'maricona',
    'pendejo', 'pendeja', 'idiota', 'imbecil',
    'estupido', 'estupida', 'cabron', 'cabrona',
    'verga', 'mamaguevo', 'culero', 'culera',
    'zorra', 'perra',

    'fuck', 'fucker', 'fucking', 'motherfucker',
    'shit', 'bullshit', 'bitch', 'bitches',
    'asshole', 'cunt', 'pussy', 'slut', 'whore',
    'nigger', 'nigga', 'faggot', 'fag',
    'retard', 'retarded',

    'nazi', 'hitler', 'kkk',
    'porn', 'porno', 'pornhub', 'xxx',
    'nudes', 'sex', 'sexo', 'sexy',

    'admin', 'administrator', 'administrador',
    'moderator', 'moderador', 'staff',
    'support', 'soporte', 'system', 'sistema',
    'oficial', 'official', 'verbquest'
  ]);

  // Fragmentos distintivos dentro de nombres compuestos.
  const blockedFragments = [
    'hijueput', 'hijoput', 'malparid',
    'carechimb', 'gonorrea', 'pendej',
    'motherfuck', 'fuck', 'bullshit',
    'asshole', 'bitch', 'nigger', 'nigga',
    'faggot', 'retard', 'pornograf',
    'pornhub', 'onlyfans', 'verbquest'
  ];

  const reserved =
    /^(?:admin|administrator|administrador|moderator|moderador|staff|support|soporte|system|sistema|oficial|official|nazi|hitler|kkk)\d*$/;

  const link =
    /(?:https?:\/\/|www\.|\.(?:com|net|org|io|gg|co)\b|@)/i;

  const leet = {
    '0': 'o',
    '1': 'i',
    '3': 'e',
    '4': 'a',
    '5': 's',
    '7': 't',
    '8': 'b'
  };

  function fold(value) {
    return value.normalize('NFKD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .replace(/[0134578]/g, digit => leet[digit]);
  }

  function condensed(value) {
    return value.replace(/(.)\1{2,}/g, '$1');
  }

  function isBlocked(value) {
    const chunks = fold(value)
      .split(/[^a-z0-9]+/)
      .filter(Boolean);

    const combined = chunks.join('');

    const raw = value.normalize('NFKD')
      .replace(/\p{M}/gu, '')
      .toLowerCase();

    const rawChunks = raw
      .split(/[^a-z0-9]+/)
      .filter(Boolean);

    if (
      rawChunks.some(part => reserved.test(part)) ||
      reserved.test(rawChunks.join(''))
    ) {
      return true;
    }

    const alternatives = [
      ...chunks,
      combined,
      condensed(combined)
    ];

    return alternatives.some(part =>
      blockedWords.has(part) ||
      reserved.test(part) ||
      blockedFragments.some(fragment => part.includes(fragment)) ||
      blockedWords.has(part.replace(/^\d+|\d+$/g, ''))
    );
  }

  function validateName(value) {
    if (typeof value !== 'string') {
      return { ok: false, error: INVALID_NAME };
    }

    const name = value.normalize('NFKC')
      .trim()
      .replace(/\s+/gu, ' ');

    const length = Array.from(name).length;

    if (length < 2 || length > MAX_LENGTH) {
      return { ok: false, error: INVALID_NAME };
    }

    // Permitir letras latinas, tildes, números y
    // puntuación habitual en nombres.
    // Rechazar caracteres invisibles y otros alfabetos
    // que podrían usarse para evadir el filtro.
    if (
      !/^[\p{Script=Latin}\p{M}\p{Nd} ._'’-]+$/u.test(name) ||
      !/\p{Script=Latin}/u.test(name) ||
      link.test(name)
    ) {
      return { ok: false, error: INVALID_NAME };
    }

    if (isBlocked(name)) {
      return { ok: false, error: BAD_NAME };
    }

    return { ok: true, name };
  }

  function moderateName(value) {
    const result = validateName(value);

    if (!result.ok) {
      throw new Error(result.error);
    }

    return result.name;
  }

  return { validateName, moderateName };
});
