import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
const Button = React.forwardRef(({ variant = "primary", size = "md", loading = false, children, className = "", ...props }, ref) => {
    const baseClass = "font-medium rounded-lg transition-colors flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed";
    const variantClass = {
        primary: "bg-blue-900 text-white hover:bg-blue-800",
        secondary: "bg-slate-200 text-slate-900 hover:bg-slate-300",
        danger: "bg-red-600 text-white hover:bg-red-700",
        ghost: "text-slate-600 hover:bg-slate-100",
    }[variant];
    const sizeClass = {
        sm: "px-3 py-1 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
    }[size];
    return (_jsxs("button", { ref: ref, className: `${baseClass} ${variantClass} ${sizeClass} ${className}`, disabled: loading || props.disabled, ...props, children: [loading ? _jsx("span", { className: "animate-spin", children: "\u23F3" }) : null, children] }));
});
Button.displayName = "Button";
export default Button;
