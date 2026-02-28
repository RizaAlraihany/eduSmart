import React from "react";

const Card = ({
  children,
  className = "",
  padding = "md",
  hover = false,
  glass = false,
}) => {
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={`
      ${glass ? "bg-white/80 backdrop-blur-sm" : "bg-white"}
      rounded-3xl border border-gray-200/50 shadow-xl
      ${hover ? "hover:shadow-2xl hover:-translate-y-1 transition-all duration-300" : ""}
      ${paddings[padding]}
      ${className}
    `}
    >
      {children}
    </div>
  );
};

export default Card;
