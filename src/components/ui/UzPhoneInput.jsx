import { CheckCircle2, AlertCircle } from 'lucide-react';
import {
  formatUzLocalSpaced,
  normalizeUzPhone,
} from '../../utils/uzbekValidation';

function getLocalDigitsFromProp(val) {
  if (!val) return '';
  const str = String(val).trim();
  let digits = str.replace(/\D/g, '');
  if (str.startsWith('+998') || (digits.startsWith('998') && digits.length >= 12)) {
    digits = digits.slice(3);
  }
  return digits.slice(0, 9);
}

export default function UzPhoneInput({
  label,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  placeholder = '90 123 45 67',
}) {
  const localDigits = getLocalDigitsFromProp(value);
  const formattedLocal = formatUzLocalSpaced(localDigits);
  const isComplete = localDigits.length === 9;
  const isValid = isComplete && Boolean(normalizeUzPhone(`+998${localDigits}`));

  const handleInput = (e) => {
    const raw = e.target.value;
    let digits = raw.replace(/\D/g, '');
    if (raw.trim().startsWith('+998') || (digits.startsWith('998') && digits.length >= 12)) {
      digits = digits.slice(3);
    }
    digits = digits.slice(0, 9);
    onChange(digits ? `+998${digits}` : '');
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          {label}
        </label>
      )}

      <div
        className={`flex items-center rounded-xl border bg-white overflow-hidden transition focus-within:ring-2 focus-within:ring-sky-500/25 ${
          error || (isComplete && !isValid)
            ? 'border-red-300 bg-red-50/20 focus-within:border-red-500'
            : isValid
            ? 'border-emerald-300 focus-within:border-emerald-500'
            : 'border-sky-200 focus-within:border-sky-500'
        }`}
      >
        <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-sky-50/90 border-r border-sky-200/80 text-sm font-bold text-sky-900 select-none shrink-0">
          <span>🇺🇿</span>
          <span>+998</span>
        </div>

        <input
          type="tel"
          inputMode="numeric"
          value={formattedLocal}
          onChange={handleInput}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="w-full px-3.5 py-2.5 text-sm font-medium text-slate-800 bg-transparent outline-none placeholder:text-slate-400 tracking-wide"
        />

        <div className="pr-3 shrink-0">
          {isValid && (
            <CheckCircle2 size={17} className="text-emerald-500 anim-pop" />
          )}
          {isComplete && !isValid && (
            <AlertCircle size={17} className="text-red-500 anim-pop" />
          )}
        </div>
      </div>

      {isComplete && !isValid && !error && (
        <p className="text-xs text-red-600 mt-1.5 font-medium">
          Operator kodi noto'g'ri (masalan: 90, 91, 93, 94, 95, 97, 98, 99, 33, 88, 77, 50, 20)
        </p>
      )}
      {error && (
        <p className="text-xs text-red-600 mt-1.5 font-medium">{error}</p>
      )}
    </div>
  );
}
