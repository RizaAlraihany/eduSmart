import React from "react";

const Input = ({
  type = "text",
  label,
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  hint,
  required = false,
  disabled = false,
  className = "",
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex items-center gap-1.5 mb-1.5">
          <label className="text-sm font-semibold text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          {hint && (
            <span className="text-xs text-gray-400 font-normal">{hint}</span>
          )}
        </div>
      )}

      <div
        className={`
        flex items-center gap-2.5 h-11 px-3.5
        bg-white border rounded-xl transition-all duration-150
        ${
          error
            ? "border-red-300 ring-1 ring-red-300"
            : "border-gray-200 hover:border-gray-300 focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400"
        }
        ${disabled ? "bg-gray-50 opacity-60 cursor-not-allowed" : ""}
      `}
      >
        {Icon && <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 text-sm text-gray-900 bg-transparent outline-none placeholder:text-gray-300 disabled:cursor-not-allowed min-w-0"
          {...props}
        />
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
};

export default Input;
