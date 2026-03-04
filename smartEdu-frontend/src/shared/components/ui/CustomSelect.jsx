import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Modern Select Component
 * Premium SaaS style inspired by Notion/Linear/Stripe
 */
const CustomSelect = forwardRef(
  (
    {
      label,
      hint,
      required = false,
      error,
      icon: Icon,
      className = "",
      children,
      value,
      onChange,
      name,
      ...props
    },
    ref,
  ) => {
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

        <div className="relative group">
          <div
            className={`
            flex items-center gap-2.5 h-11 px-3.5
            bg-white border rounded-xl
            transition-all duration-200
            ${
              error
                ? "border-red-300 ring-2 ring-red-100"
                : "border-gray-200 hover:border-gray-300 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100"
            }
          `}
          >
            {Icon && (
              <Icon className="w-4 h-4 text-gray-400 flex-shrink-0 transition-colors group-focus-within:text-indigo-500" />
            )}

            <select
              ref={ref}
              name={name}
              value={value}
              onChange={onChange}
              className="flex-1 text-sm font-medium text-gray-900 bg-transparent outline-none appearance-none cursor-pointer pr-2"
              {...props}
            >
              {children}
            </select>

            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 pointer-events-none transition-transform group-focus-within:text-indigo-500 group-focus-within:rotate-180 duration-200" />
          </div>
        </div>

        {error && (
          <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        <style jsx>{`
          /* Modern Select Dropdown Styling */
          select {
            background-image: none;
          }

          select option {
            padding: 12px 16px;
            font-size: 14px;
            font-weight: 500;
            color: #111827;
            background-color: #ffffff;
            transition: all 0.15s;
          }

          select option:hover {
            background-color: #eef2ff;
            color: #4f46e5;
          }

          select option:checked {
            background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
            color: #ffffff;
            font-weight: 600;
          }

          /* Empty state styling */
          select:invalid {
            color: #9ca3af;
          }

          select option[value=""] {
            color: #9ca3af;
          }

          /* Focus states */
          select:focus option:checked {
            background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
          }
        `}</style>
      </div>
    );
  },
);

CustomSelect.displayName = "CustomSelect";

export default CustomSelect;
