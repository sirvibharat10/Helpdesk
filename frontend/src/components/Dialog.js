import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { X } from "lucide-react";
const Dialog = ({ open, onOpenChange, title, children, }) => {
    if (!open)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", onClick: () => onOpenChange(false), children: _jsxs("div", { className: "bg-white rounded-xl shadow-xl max-w-md w-full mx-4", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex justify-between items-center p-6 border-b border-slate-200", children: [_jsx("h2", { className: "text-xl font-bold text-slate-900", children: title }), _jsx("button", { onClick: () => onOpenChange(false), className: "text-slate-400 hover:text-slate-600", children: _jsx(X, { size: 20 }) })] }), _jsx("div", { className: "p-6", children: children })] }) }));
};
export default Dialog;
