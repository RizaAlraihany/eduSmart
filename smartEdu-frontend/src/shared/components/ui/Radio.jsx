import React from "react";

const Radio = ({
  label,
  name,
  value,
  checked,
  onChange,
  disabled,
  className = "",
}) => {
  return (
    <label
      className={`flex items-center cursor-pointer gap-2 ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500 transition-colors"
      />
      {label && (
        <span className="text-sm font-medium text-gray-700">{label}</span>
      )}
    </label>
  );
};

export default Radio;
