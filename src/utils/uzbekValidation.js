export const UZ_OPERATOR_CODES = new Set([
  '20', '33', '50', '55', '77', '88',
  '90', '91', '93', '94', '95', '97', '98', '99',
]);

/**
 * Kiritilgan telefon matnidan oxirgi 9 ta O'zbekiston raqamini ajratib oladi.
 * Masalan: "+998 90 123-45-67" -> "901234567"
 */
export function extractUzLocalDigits(raw) {
  if (!raw) return '';
  let digits = String(raw).trim().replace(/\D/g, '');
  if (digits.startsWith('998') && digits.length > 9) {
    digits = digits.slice(3);
  }
  return digits.slice(0, 9);
}

/**
 * 9 ta raqamni chiroyli ko'rinishga keltiradi: "90 123 45 67"
 */
export function formatUzLocalSpaced(localDigits) {
  const d = String(localDigits || '').replace(/\D/g, '').slice(0, 9);
  const parts = [];
  if (d.length > 0) parts.push(d.slice(0, 2));
  if (d.length > 2) parts.push(d.slice(2, 5));
  if (d.length > 5) parts.push(d.slice(5, 7));
  if (d.length > 7) parts.push(d.slice(7, 9));
  return parts.join(' ');
}

/**
 * Kiritilgan raqamni trim qilib, O'zbekiston mobil raqami ekanligini tekshiradi.
 * To'g'ri bo'lsa '+998XXXXXXXXX', aks holda null qaytaradi.
 */
export function normalizeUzPhone(raw) {
  if (!raw) return null;
  const digits = String(raw).trim().replace(/\D/g, '');

  let full = '';
  if (digits.length === 9) {
    full = '998' + digits;
  } else if (digits.length === 12 && digits.startsWith('998')) {
    full = digits;
  } else {
    return null;
  }

  if (!UZ_OPERATOR_CODES.has(full.slice(3, 5))) {
    return null;
  }
  return '+' + full;
}

/**
 * Jadval va kartochkalarda chiroyli chiqarish: "+998 90 123 45 67"
 */
export function formatUzPhoneDisplay(raw) {
  const norm = normalizeUzPhone(raw);
  if (!norm) return raw || '—';
  return `+998 ${formatUzLocalSpaced(norm.slice(4))}`;
}

export function cleanNamePart(raw) {
  return String(raw || '').trim().replace(/\s+/g, ' ');
}

/**
 * Familiya oxiriga qarab jinsni avtomatik aniqlash:
 * - 'a', 'а', 'qizi' bilan tugasa -> 'female'
 * - 'v', 'в', "o'g'li", 'ogli' bilan tugasa -> 'male'
 */
export function detectGenderFromLastName(lastName) {
  const ln = cleanNamePart(lastName).toLowerCase();
  if (!ln) return '';
  if (ln.endsWith('a') || ln.endsWith('а') || ln.endsWith('qizi')) {
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
