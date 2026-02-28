import React, { forwardRef } from "react";
import { CalendarDays } from "lucide-react";

/**
 * Modern DatePicker Component
 * Premium SaaS style inspired by Notion/Linear/Stripe
 */
const DatePicker = forwardRef(
  (
    {
      label,
      hint,
      required = false,
      error,
      className = "",
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
            <CalendarDays className="w-4 h-4 text-gray-400 flex-shrink-0 transition-colors group-focus-within:text-indigo-500" />

            <input
              ref={ref}
              type="date"
              name={name}
              value={value}
              onChange={onChange}
              className="flex-1 text-sm font-medium text-gray-900 bg-transparent outline-none
                [&::-webkit-calendar-picker-indicator]:opacity-0
                [&::-webkit-calendar-picker-indicator]:absolute
                [&::-webkit-calendar-picker-indicator]:inset-0
                [&::-webkit-calendar-picker-indicator]:w-full
                [&::-webkit-calendar-picker-indicator]:h-full
                [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              {...props}
            />
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
          /* Modern Calendar Popup Styling */
          input[type="date"]::-webkit-calendar-picker-indicator {
            cursor: pointer;
          }

          /* Date input field styling */
          input[type="date"]::-webkit-datetime-edit {
            padding: 0;
          }

          input[type="date"]::-webkit-datetime-edit-fields-wrapper {
            padding: 0;
          }

          input[type="date"]::-webkit-datetime-edit-text {
            color: #9ca3af;
            padding: 0 2px;
          }

          input[type="date"]::-webkit-datetime-edit-month-field,
          input[type="date"]::-webkit-datetime-edit-day-field,
          input[type="date"]::-webkit-datetime-edit-year-field {
            color: #111827;
            font-weight: 500;
            padding: 2px 4px;
            border-radius: 6px;
            transition: all 0.15s;
          }

          input[type="date"]::-webkit-datetime-edit-month-field:focus,
          input[type="date"]::-webkit-datetime-edit-day-field:focus,
          input[type="date"]::-webkit-datetime-edit-year-field:focus {
            background-color: #eef2ff;
            color: #4f46e5;
            outline: none;
          }

          /* Placeholder styling when empty */
          input[type="date"]:invalid::-webkit-datetime-edit {
            color: #d1d5db;
          }
        `}</style>
      </div>
    );
  },
);

DatePicker.displayName = "DatePicker";

export default DatePicker;
