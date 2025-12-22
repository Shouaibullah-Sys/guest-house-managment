//components/FeaturedButton.tsx

import { motion, MotionProps } from "framer-motion";
import { ReactNode } from "react";

export const Button = ({
  children,
  variant = "primary",
  className = "",
  onClick,
  disabled = false,
  glow = false,
  ...motionProps
}: {
  children?: ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "default"
    | "gradient"
    | "gold"
    | "silver"
    | "platinum"
    | "danger";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  glow?: boolean;
} & MotionProps) => {
  const baseClasses =
    "px-8 py-3 rounded-full font-semibold transition-all relative overflow-hidden";

  // Glow classes for each variant
  const glowClasses = {
    gold: "glow-gold",
    silver: "glow-silver",
    platinum: "glow-platinum",
    primary: "glow-gold",
    gradient: "glow-gold",
  };

  const glowClass =
    glow && variant in glowClasses
      ? glowClasses[variant as keyof typeof glowClasses]
      : "";

  const variantClasses = {
    primary: `bg-gradient-to-r from-gold to-amber-700 text-dark ${glowClass}`,
    secondary:
      "border border-silver/30 text-silver hover:border-gold hover:text-gold",
    gradient:
      "bg-gradient-to-r from-amber-500 via-yellow-500 to-gold text-dark group",
    gold: `bg-gradient-to-r from-gold to-amber-700 text-dark ${glowClass}`,
    silver: `bg-gradient-to-r from-silver to-gray-600 text-dark ${glowClass}`,
    platinum: `bg-gradient-to-r from-platinum to-gray-400 text-dark ${glowClass}`,
    danger: "bg-gradient-to-r from-red-500 to-red-700 text-white",
    outline:
      "border border-silver/30 text-silver hover:border-silver hover:bg-silver/5",
    default: "bg-gradient-to-r from-gray-700 to-gray-900 text-silver",
  };

  const disabledClasses = "opacity-50 cursor-not-allowed";

  const defaultMotionProps = {
    whileHover: disabled ? {} : { scale: 1.05 },
    whileTap: disabled ? {} : { scale: 0.95 },
    ...motionProps,
  };

  return (
    <motion.button
      {...defaultMotionProps}
      className={`${baseClasses} ${variantClasses[variant]} ${
        disabled ? disabledClasses : ""
      } ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {variant === "gradient" && !disabled && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-full group-hover:translate-x-full"></span>
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};
