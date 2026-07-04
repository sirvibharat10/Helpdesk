import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
const Textarea = React.forwardRef(({ label, error, className = "", ...props }, ref) => {
    return (_jsxs("div", { className: "w-full", children: [label && (_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-2", children: label })), _jsx("textarea", { ref: ref, className: `w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-colors ${error ? "border-red-500" : ""} ${className}`, ...props }), error && _jsx("p", { className: "text-red-600 text-sm mt-1", children: error })] }));
});
Textarea.displayName = "Textarea";
export default Textarea;
