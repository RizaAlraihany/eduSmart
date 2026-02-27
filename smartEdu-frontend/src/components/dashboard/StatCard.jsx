import React from "react";

const StatCard = ({ title, value, icon: Icon, color = "blue", trend }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
    indigo: "from-indigo-500 to-indigo-600",
  };

  return (
    <div className={`stat-card ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-white/80 text-sm font-medium mb-1">{title}</div>
          <div className="text-white text-3xl font-bold">{value}</div>
          {trend && <div className="text-white/80 text-xs mt-2">{trend}</div>}
        </div>
        {Icon && (
          <div className="flex-shrink-0">
            <Icon className="w-12 h-12 text-white/30" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
