import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-200"
              : "border-slate-300 focus:border-transparent focus:ring-blue-900"
          } ${className}`}
          {...props}
        />
        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export default Textarea;
