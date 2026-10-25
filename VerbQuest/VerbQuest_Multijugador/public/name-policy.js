/* Politica de nombres compartida por el servidor y el navegador. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (root) root.VerbQuestNamePolicy = api;
})(typeof globalThis !== 'undefined' ? globalThis : null, function () {
  'use strict';

  const BLOCKED_MESSAGE =
    'Nombre no permitido. Elige uno respetuoso.';

  const INVALID_MESSAGE =
    'Escribe de 2 a 22 caracteres usando letras, números, espacios o guiones.';

  // Palabras completas para reducir falsos positivos.
  const bannedWords = new Set([
    'puta', 'puto', 'putas', 'putos', 'putita', 'putito', 'putazo',
    'mierda', 'mierdas', 'hpta', 'hpt', 'hp', 'hdp',
    'hijueputa', 'hijoputa', 'hijaputa', 'malparido', 'malparida',
    'gonorrea', 'carechimba', 'marica', 'marico', 'maricon',
    'pendejo', 'pendeja', 'idiota', 'imbecil', 'estupido', 'estupida',
    'cabron', 'cabrona', 'verga', 'mamaguevo', 'culero', 'culera',
    'zorra', 'perra',
    'fuck', 'fucker', 'fucking', 'motherfucker',
    'shit', 'bullshit', 'bitch', 'bitches', 'asshole', 'cunt',
    'pussy', 'slut', 'whore', 'nigger', 'nigga', 'faggot', 'fag',
    'retard', 'retarded',
    'nazi', 'hitler', 'kkk',
    'porno', 'porn', 'pornhub', 'xxx', 'nudes', 'sexo', 'sex',
    'admin', 'administrator', 'administrador',
    'moderator', 'moderador', 'staff', 'support',
    'soporte', 'system', 'sistema',
    'oficial', 'official', 'verbquest'
  ]);

  // Raices distintivas para detectar palabras concatenadas.
  const strongRoots = [
    'hijueput', 'hijoput', 'hijaput', 'malparid',
    'carechimb', 'gonorrea', 'mamaguev', 'pendej',
    'mierda', 'motherfuck', 'bullshit', 'asshole',
    'faggot', 'nigger', 'nigga', 'fuck',
    'bitch', 'pornhub', 'verbquest'
  ];

  const reservedPrefix =
    /^(?:admin|moderador|moderator|staff|support|soporte|system|sistema|oficial|official)[a-z0-9]*$/;

  const leet = {
    '0': 'o',
    '1': 'i',
    '3': 'e',
    '4': 'a',
    '5': 's',
    '7': 't',
    '8': 'b'
  };

  function fold(text) {
    return text.normalize('NFKD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .replace(/[0134578]/g, digit => leet[digit]);
  }

  function simplify(text) {
    return text.replace(/(.)\1{2,}/g, '$1');
  }

  function blocked(name) {
    // Enlaces, correos y etiquetas HTML.
    if (/(?:https?:\/\/|www\.|\.(?:com|net|org|io|gg|co)\b|@|[<>])/i.test(name)) {
      return true;
    }

    const originalParts = name.toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean);

    const parts = fold(name)
      .split(/[^a-z0-9]+/)
      .filter(Boolean);

    const joined = parts.join('');

    const variants = [
      ...parts,
      joined,
      simplify(joined)
    ];

    // Detectar insultos con sufijos numericos.
    for (const part of originalParts) {
      if (/\d+$/.test(part)) {
        variants.push(fold(part.replace(/\d+$/, '')));
      }
    }

    // Abreviaturas: P3rro.hp, h.p, HP2026, etc.
    if (originalParts.some(part =>
      /^(?:hp|hpt|hpta|hdp)\d*$/.test(part)
    )) return true;

    if (/(?:^|[^a-z])(?:hp|hpt|hpta|hdp)(?:$|[^a-z])/.test(fold(name))) {
      return true;
    }

    if (/(?:hp|hpt|hpta|hdp)$/.test(joined)) {
      return true;
    }

    return variants.some(value =>
      bannedWords.has(value) ||
      reservedPrefix.test(value) ||
      strongRoots.some(root => value.includes(root))
    );
  }

  function validateName(input) {
    if (typeof input !== 'string') {
      return {
        ok: false,
        code: 'NAME_INVALID',
        error: INVALID_MESSAGE
      };
    }

    const name = input.normalize('NFKC')
      .trim()
      .replace(/\s+/gu, ' ');

    const size = Array.from(name).length;

    if (size < 2 || size > 22) {
      return {
        ok: false,
        code: 'NAME_INVALID',
        error: INVALID_MESSAGE
      };
    }

    if (blocked(name)) {
      return {
        ok: false,
        code: 'NAME_BLOCKED',
        error: BLOCKED_MESSAGE
      };
    }

    if (
      !/^[\p{Script=Latin}\p{M}\p{Nd} ._'’-]+$/u.test(name) ||
      !/\p{Script=Latin}/u.test(name)
    ) {
      return {
        ok: false,
        code: 'NAME_INVALID',
        error: INVALID_MESSAGE
      };
    }

    return { ok: true, name };
  }

  function moderateName(input) {
    const result = validateName(input);

    if (!result.ok) {
      const error = new Error(result.error);
      error.code = result.code;
      throw error;
    }

    return result.name;
  }

  return { validateName, moderateName };
});
