// src/components/ui/currency-input.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

interface CurrencyInputProps
  extends Omit<React.ComponentProps<'input'>, 'type' | 'value' | 'onChange'> {
  /** Nilai numerik sebagai string (tanpa titik) atau number, misal: "1500000" */
  value: string | number | undefined;
  /** Dipanggil dengan nilai bersih tanpa titik, misal: "1500000" */
  onChange: (rawValue: string) => void;
  /** Prefix currency, default "Rp" */
  prefix?: string;
  /** Maksimal jumlah digit angka */
  maxDigits?: number;
}

/**
 * CurrencyInput — input harga yang:
 * - Tampilkan dengan format titik ribuan: "1.500.000"
 * - Simpan ke state sebagai string angka murni: "1500000"
 * - Menggunakan type="text" untuk menghindari bug browser type="number"
 *
 * @example
 * <CurrencyInput
 *   value={formData.price}
 *   onChange={(raw) => updateFormData({ price: raw })}
 *   placeholder="Contoh: 1.500.000"
 * />
 */
const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, prefix = 'Rp', placeholder, maxDigits, ...props }, ref) => {
    // Format angka dengan titik ribuan: 1500000 → "1.500.000"
    const formatDisplay = (raw: string | number | undefined): string => {
      if (raw === undefined || raw === null || raw === '') return '';
      let numStr = String(raw);
      if (/^\d+\.\d+$/.test(numStr)) {
        numStr = String(Math.round(parseFloat(numStr)));
      }
      const cleaned = numStr.replace(/\D/g, ''); // hapus semua non-digit
      if (!cleaned) return '';
      // Format dengan titik sebagai pemisah ribuan
      return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    // State internal untuk nilai yang ditampilkan (dengan titik)
    const [displayValue, setDisplayValue] = React.useState<string>(
      () => formatDisplay(value)
    );

    // Sync dari parent jika value berubah dari luar (misal saat load edit form)
    const prevValueRef = React.useRef<string | number | undefined>(value);
    React.useEffect(() => {
      let newRaw = String(value ?? '');
      if (/^\d+\.\d+$/.test(newRaw)) {
        newRaw = String(Math.round(parseFloat(newRaw)));
      }
      newRaw = newRaw.replace(/\D/g, '');

      let prevRaw = String(prevValueRef.current ?? '');
      if (/^\d+\.\d+$/.test(prevRaw)) {
        prevRaw = String(Math.round(parseFloat(prevRaw)));
      }
      prevRaw = prevRaw.replace(/\D/g, '');

      if (newRaw !== prevRaw) {
        setDisplayValue(formatDisplay(value));
        prevValueRef.current = value;
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputVal = e.target.value;

      // Hapus semua karakter bukan digit
      const rawDigits = inputVal.replace(/\D/g, '');

      // Batasi panjang maksimal (default 15 digit jika tidak disediakan)
      const limit = maxDigits ?? 15;
      if (rawDigits.length > limit) return;

      // Update display (dengan format titik)
      const formatted = formatDisplay(rawDigits);
      setDisplayValue(formatted);

      // Kirim nilai bersih ke parent
      onChange(rawDigits);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Izinkan: angka, backspace, delete, arrow keys, tab, ctrl shortcuts
      const allowedKeys = [
        'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
        'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        'Home', 'End',
      ];
      const isCtrlA = e.ctrlKey && e.key === 'a';
      const isCtrlC = e.ctrlKey && e.key === 'c';
      const isCtrlV = e.ctrlKey && e.key === 'v';
      const isCtrlX = e.ctrlKey && e.key === 'x';
      const isDigit = /^\d$/.test(e.key);

      if (!isDigit && !allowedKeys.includes(e.key) && !isCtrlA && !isCtrlC && !isCtrlV && !isCtrlX) {
        e.preventDefault();
      }

      props.onKeyDown?.(e);
    };

    return (
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none select-none">
            {prefix}
          </span>
        )}
        <input
          {...props}
          ref={ref}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? '0'}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background py-2 text-base ring-offset-background',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            prefix ? 'pl-8 pr-3' : 'px-3',
            className,
          )}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput };
