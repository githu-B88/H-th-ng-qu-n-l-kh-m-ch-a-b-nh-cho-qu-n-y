import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from 'lucide-react';
import { formatDateToVN, parseVNToISODate } from '../../utils/dateFormat';

interface DateInputProps {
  id?: string;
  value?: string; // Expects ISO 'YYYY-MM-DD' or ''
  onChange: (isoValue: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  min?: string;
  max?: string;
}

export const DateInput: React.FC<DateInputProps> = ({
  id,
  value = '',
  onChange,
  placeholder = 'dd/mm/yyyy',
  className = '',
  disabled = false,
  required = false,
  min,
  max
}) => {
  const [displayText, setDisplayText] = useState<string>(() => formatDateToVN(value));
  const hiddenDateInputRef = useRef<HTMLInputElement>(null);

  // Sync when external value changes
  useEffect(() => {
    const formatted = formatDateToVN(value);
    setDisplayText(formatted);
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let text = e.target.value;
    setDisplayText(text);

    // If empty
    if (!text.trim()) {
      onChange('');
      return;
    }

    // If fully matches dd/mm/yyyy
    const parts = text.split('/');
    if (parts.length === 3 && parts[2].length === 4) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const y = parseInt(parts[2], 10);
      if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1900 && y <= 2100) {
        const iso = parseVNToISODate(text);
        onChange(iso);
      }
    }
  };

  const handleBlur = () => {
    if (!displayText.trim()) {
      onChange('');
      return;
    }

    // Try parsing loose format (e.g. 1/2/2024 -> 01/02/2024)
    const formatted = formatDateToVN(displayText);
    if (formatted && formatted.includes('/')) {
      setDisplayText(formatted);
      const iso = parseVNToISODate(formatted);
      if (iso) {
        onChange(iso);
        return;
      }
    }

    // If invalid, revert back to external value
    setDisplayText(formatDateToVN(value));
  };

  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pickedISO = e.target.value;
    if (pickedISO) {
      setDisplayText(formatDateToVN(pickedISO));
      onChange(pickedISO);
    } else {
      setDisplayText('');
      onChange('');
    }
  };

  const openCalendarPicker = () => {
    if (disabled) return;
    try {
      if (hiddenDateInputRef.current) {
        if ('showPicker' in hiddenDateInputRef.current) {
          hiddenDateInputRef.current.showPicker();
        } else {
          hiddenDateInputRef.current.focus();
        }
      }
    } catch {
      hiddenDateInputRef.current?.focus();
    }
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <input
        id={id}
        type="text"
        value={displayText}
        onChange={handleTextChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        maxLength={10}
        className="w-full py-1.5 pr-8 pl-2.5 bg-transparent text-xs text-slate-800 focus:outline-none placeholder:text-slate-400 font-medium"
      />

      <button
        type="button"
        tabIndex={-1}
        onClick={openCalendarPicker}
        disabled={disabled}
        title="Chọn ngày từ lịch (dd/mm/yyyy)"
        className="absolute right-2 text-slate-400 hover:text-sky-600 focus:outline-none transition-colors disabled:opacity-40"
      >
        <Calendar className="w-3.5 h-3.5" />
      </button>

      {/* Hidden native input used purely to leverage browser's date picker popup */}
      <input
        ref={hiddenDateInputRef}
        type="date"
        value={value || ''}
        min={min}
        max={max}
        onChange={handleNativeDateChange}
        tabIndex={-1}
        className="sr-only"
        aria-hidden="true"
      />
    </div>
  );
};
