import type { ButtonHTMLAttributes } from "react";

const VARIANTS = {
  primary:
    "bg-accent-500 text-white shadow-[0_8px_30px_-8px_var(--color-accent-500)] hover:bg-accent-400 disabled:bg-ink-700 disabled:text-mist-500 disabled:shadow-none",
  secondary:
    "bg-ink-800/90 text-mist-100 ring-1 ring-inset ring-white/10 hover:bg-ink-700 disabled:text-mist-500",
  ghost:
    "text-mist-300 hover:bg-white/5 hover:text-mist-100 disabled:text-mist-500",
};

const SIZES = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-13 px-6 text-base",
};

export type ButtonVariant = keyof typeof VARIANTS;
export type ButtonSize = keyof typeof SIZES;

// Shared so links can look like buttons too
export const buttonStyles = (
  variant: ButtonVariant = "secondary",
  size: ButtonSize = "md"
) =>
  `inline-flex items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]}`;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = ({
  variant,
  size,
  className = "",
  type = "button",
  ...props
}: ButtonProps) => (
  <button
    type={type}
    className={`${buttonStyles(variant, size)} ${className}`}
    {...props}
  />
);

export default Button;
