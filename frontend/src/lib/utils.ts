export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (date: string | Date) => {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "NEW":
      return "#9CA3AF";
    case "OPEN":
      return "#3B82F6";
    case "PROCESSING":
      return "#FBBF24";
    case "RESOLVED":
      return "#10B981";
    case "CLOSED":
      return "#64748B";
    default:
      return "#6B7280";
  }
};

export const getCategoryBadgeColor = (category: string) => {
  switch (category) {
    case "GENERAL_QUESTION":
      return "bg-blue-100 text-blue-800";
    case "TECHNICAL_QUESTION":
      return "bg-purple-100 text-purple-800";
    case "REFUND_REQUEST":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const cn = (...classes: any[]) => {
  return classes.filter(Boolean).join(" ");
};
