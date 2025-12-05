import React from "react";
import Badge from "@/components/atoms/Badge";

const StatusBadge = ({ status, type = "stock" }) => {
  const getStatusConfig = () => {
    if (type === "stock") {
      switch (status?.toLowerCase()) {
        case "in-stock":
          return { variant: "success", label: "In Stock" };
        case "low-stock":
          return { variant: "warning", label: "Low Stock" };
        case "out-of-stock":
          return { variant: "error", label: "Out of Stock" };
        default:
          return { variant: "default", label: status || "Unknown" };
      }
    }
    
    if (type === "order") {
      switch (status?.toLowerCase()) {
        case "pending":
          return { variant: "warning", label: "Pending" };
        case "processing":
          return { variant: "info", label: "Processing" };
        case "completed":
          return { variant: "success", label: "Completed" };
        case "cancelled":
          return { variant: "default", label: "Cancelled" };
        default:
          return { variant: "default", label: status || "Unknown" };
      }
    }
    
    return { variant: "default", label: status || "Unknown" };
  };

  const { variant, label } = getStatusConfig();

  return <Badge variant={variant}>{label}</Badge>;
};

export default StatusBadge;