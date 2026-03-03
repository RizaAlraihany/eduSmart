import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

/**
 * Select — Reusable modern dropdown component
 *
 * Props:
 *   options      - array of { value, label, disabled? }
 *   value        - nilai yang dipilih saat ini
 *   onChange     - callback (value) => void
 *   placeholder  - teks saat belum ada pilihan
 *   label        - label di atas dropdown
 *   error        - pesan error (string)
 *   disabled     - disable seluruh dropdown
 *   className    - class tambahan untuk wrapper
 *   size         - 'sm' | 'md' (default: 'md')
 *
 * Contoh:
 *   <Select
 *     label="Status"
 *     options={[{ value: 'aktif', label: 'Aktif' }, { value: 'nonaktif', label: 'Non-Aktif' }]}
 *     value={form.status}
 *     onChange={(val) => setForm(prev => ({ ...prev, status: val }))}
 *   />
 */
const Select = ({
  options = [],
  value,
  onChange,
  placeholder = "Pilih...",
  label,
  error,
  disabled = false,
  className = "",
  size = "md",
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = options.find((o) => o.value === value);

  // Tutup dropdown saat klik di luar komponen
  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keyboard support
  const handleKeyDown = (e) => {
    if (e.key === "Escape") setOpen(false);
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!disabled) setOpen((o) => !o);
    }
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-xs rounded-lg",
    md: "px-3.5 py-2.5 text-sm rounded-xl",
  };

  return (
    <div className={`relative w-full ${className}`} ref={ref}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={[
          "w-full flex items-center justify-between gap-2 bg-white border transition-all duration-150 outline-none",
          sizeClasses[size],
          open
            ? "border-indigo-500 ring-2 ring-indigo-500 ring-offset-1 shadow-md"
            : "border-gray-200 shadow-sm hover:border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1",
          disabled
            ? "opacity-50 cursor-not-allowed bg-gray-50"
            : "cursor-pointer",
          error ? "border-red-400 focus:ring-red-400" : "",
        ].join(" ")}
      >
        <span
          className={selected ? "text-gray-900 font-medium" : "text-gray-400"}
        >
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown list */}
      {open && (
        <div
          role="listbox"
          className={[
            "absolute z-50 w-full mt-1.5 bg-white border border-gray-100 shadow-xl overflow-auto",
            "py-1.5 max-h-60",
            size === "sm" ? "rounded-lg" : "rounded-xl",
            // simple fade-in via CSS animation
            "animate-[fadeSlideIn_0.1s_ease-out]",
          ].join(" ")}
          style={{ animation: "fadeSlideIn 0.1s ease-out" }}
        >
          {options.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-400 text-center">
              Tidak ada pilihan
            </p>
          ) : (
            options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={value === opt.value}
                disabled={opt.disabled}
                onClick={() => {
                  if (!opt.disabled) {
                    onChange(opt.value);
                    setOpen(false);
                  }
                }}
                className={[
                  "w-full flex items-center justify-between gap-3 text-left transition-colors duration-100",
                  size === "sm" ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm",
                  value === opt.value
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                  opt.disabled
                    ? "opacity-40 cursor-not-allowed"
                    : "cursor-pointer",
                ].join(" ")}
              >
                <span>{opt.label}</span>
                {value === opt.value && (
                  <Check className="w-3.5 h-3.5 flex-shrink-0 text-indigo-600" />
                )}
              </button>
            ))
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
};

export default Select;
