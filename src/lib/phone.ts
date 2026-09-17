const EASTERN_DIGITS = /[٠-٩۰-۹]/g;

/** يحوّل الأرقام العربية (٠١٢) والفارسية (۰۱۲) إلى 012 */
export function toLatinDigits(value: string) {
  return value.replace(EASTERN_DIGITS, (digit) => {
    const code = digit.charCodeAt(0);
    return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660);
  });
}

/** يرجع رقم الموبايل المصري بصيغة 01XXXXXXXXX، أو null لو الرقم غير صالح */
export function normalizeEgyptianMobile(value: string) {
  const digits = toLatinDigits(value)
    .replace(/[^\d+]/g, "")
    .replace(/^(?:\+|00)?20(?=1)/, "0")
    .replace(/^(?=1[0125]\d{8}$)/, "0");

  return /^01[0125]\d{8}$/.test(digits) ? digits : null;
}
