import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
  placeholder?: string;
  label?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, value, onChange, placeholder, className, label, error, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLSelectElement>(null);

    // Sync external refs
    React.useImperativeHandle(ref, () => innerRef.current!);

    // Handle clicks outside to close dropdown
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Get current label
    const selectedOption = options.find((opt) => String(opt.value) === String(value));
    const currentLabel = selectedOption ? selectedOption.label : placeholder || "Select option...";

    const handleOptionSelect = (optValue: string) => {
      if (innerRef.current) {
        innerRef.current.value = optValue;
      }
      if (onChange) {
        onChange({
          target: {
            value: optValue,
            name: props.name,
          },
        } as any);
      }
      setIsOpen(false);
    };

    return (
      <div ref={containerRef} className="relative w-full text-slate-800">
        {label && (
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        
        {/* Hidden native select for standard HTML forms, accessibility and React Hook Form */}
        <select
          ref={innerRef}
          value={value}
          onChange={onChange}
          style={{ display: "none" }}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Visible Custom Dropdown Toggle */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-4 py-2 bg-white border border-slate-300 hover:border-blue-400 rounded-lg text-sm text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer ${
            error ? "border-red-500 focus:ring-red-500" : ""
          } ${className || ""}`}
        >
          <span className={selectedOption ? "text-slate-900" : "text-slate-400"}>
            {currentLabel}
          </span>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform duration-250 ${
              isOpen ? "transform rotate-180 text-blue-500" : ""
            }`}
          />
        </button>

        {/* Dropdown Options Box */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1.5 bg-white border border-slate-200/80 rounded-xl shadow-lg max-h-60 overflow-y-auto animate-fade-in py-1">
            {placeholder && (
              <button
                type="button"
                onClick={() => handleOptionSelect("")}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-50 transition-colors"
              >
                {placeholder}
              </button>
            )}
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleOptionSelect(opt.value)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    isSelected
                      ? "bg-sky-50 text-sky-700 font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}

        {error && <p className="text-red-500 text-xs mt-1 font-semibold">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
