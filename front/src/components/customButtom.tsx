import React from "react";

interface CustomButtonProps {
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: "gray" | "orange" | "blue";
  width?: string;
  height?: string;
  className?:string;
}
const CustomButton: React.FC<CustomButtonProps> = ({
  type = "button",
  onClick,
  disabled = false,
  children,
  variant = "gray",
  width = "md:w-52",
  height = "h-13",
  className = "",
}) => {
  const baseClasses =
    "font-bold font-inter py-3 px-6 rounded-lg shadow-sm shadow-slate-300 duration-300 ";

  const variantClasses = {
    gray: "bg-gray-200 text-gray-700 hover:bg-gray-300",
    orange: "bg-orange-600 text-white hover:bg-blue-800",
    blue: "bg-[#10375C] text-white hover:bg-[#1e40af]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${width} ${height} ${className}`}
    >
      {children}
    </button>
  );
};

export default CustomButton;