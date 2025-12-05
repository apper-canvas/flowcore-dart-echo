import React from "react";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const MetricCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendDirection = "up",
  className 
}) => {
  const trendColor = trendDirection === "up" ? "text-success" : "text-error";
  const trendIcon = trendDirection === "up" ? "TrendingUp" : "TrendingDown";

  return (
    <div className={cn("card p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
          <ApperIcon name={icon} className="w-6 h-6 text-primary" />
        </div>
        {trend && (
          <div className={cn("flex items-center gap-1 text-sm", trendColor)}>
            <ApperIcon name={trendIcon} className="w-4 h-4" />
            <span className="font-medium">{trend}</span>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
          {value}
        </h3>
        <p className="text-sm text-gray-600 font-medium">{title}</p>
      </div>
    </div>
  );
};

export default MetricCard;