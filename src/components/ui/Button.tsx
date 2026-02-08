import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "gold" | "outline";
  children: React.ReactNode;
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  const baseStyles = "px-6 py-3 rounded uppercase font-semibold tracking-wide transition-all duration-300 transform hover:-translate-y-1";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-gray-800",
    gold: "bg-accent text-white hover:bg-accent-hover shadow-lg hover:shadow-xl",
    outline: "border border-primary text-primary hover:bg-primary hover:text-white"
  };

  const finalClass = `${baseStyles} ${variants[variant]} ${className || ""}`;

  return (
    <button className={finalClass} {...props} />
  );
}