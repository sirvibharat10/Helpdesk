import React from "react";

interface BadgeProps {
  variant?: "new" | "open" | "processing" | "resolved" | "closed" | "default";
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  children,
  className = "",
}) => {
  const variantClass = {
    new: "bg-gray-100 text-gray-800",
    open: "bg-blue-100 text-blue-800",
    processing: "bg-yellow-100 text-yellow-800",
    resolved: "bg-green-100 text-green-800",
    closed: "bg-slate-100 text-slate-800",
    default: "bg-slate-100 text-slate-800",
  }[variant];

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variantClass} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
