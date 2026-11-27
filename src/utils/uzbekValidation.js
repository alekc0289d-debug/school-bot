// O'zbekiston mobil operator kodlari
const UZ_OPERATOR_CODES = new Set([
  '20', '33', '50', '55', '77', '88',
  '90', '91', '93', '94', '95', '97', '98', '99',
]);

/**
 * Kiritilgan telefon raqamni trim qilib, +998XXXXXXXXX ko'rinishiga keltiradi.
 * Noto'g'ri bo'lsa null qaytaradi.
 */
export function normalizeUzPhone(raw) {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  const digits = trimmed.replace(/\D/g, '');

  let full = '';
  if (digits.length === 9) {
    full = '998' + digits;
  } else if (digits.length === 12 && digits.startsWith('998')) {
    full = digits;
  } else {
    return null;
  }

  const op = full.slice(3, 5);
  if (!UZ_OPERATOR_CODES.has(op)) {
    return null;
  }

  return '+' + full;
}

export function formatUzPhoneDisplay(raw) {
  const norm = normalizeUzPhone(raw);
  if (!norm) return raw || '—';
  const d = norm.slice(1); // 998XXXXXXXXX
  return `+${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10, 12)}`;
}

export function cleanNamePart(raw) {
  return String(raw || '')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Familiya oxiriga qarab jinsni aniqlash:
 * - "a" (yoki "ova", "eva", "qizi", kirill "а") bilan tugasa -> 'female' (Qiz bola)
 * - "v" (yoki "ov", "ev", "o'g'li", kirill "в") bilan tugasa -> 'male' (O'g'il bola)
 */
export function detectGenderFromLastName(lastName) {
  const ln = cleanNamePart(lastName).toLowerCase();
  if (!ln) return '';
  if (
    ln.endsWith('a') ||
    ln.endsWith('а') ||
    ln.endsWith('qizi')
  ) {
    return 'female';
  }
  if (
    ln.endsWith('v') ||
    ln.endsWith('в') ||
    ln.endsWith("o'g'li") ||
    ln.endsWith('ogli')
  ) {
    return 'male';
  }
  return '';
}
