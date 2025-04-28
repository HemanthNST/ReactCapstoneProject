import React, { useState } from "react";

interface ButtonProps {
  xPadding?: number;
  yPadding?: number;
  color?: string;
  textColor?: string;
  rounded?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  font?: string;
  fontSize?: string;
  outlined?: boolean;
  children: React.ReactNode;
  href?: string;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  xPadding = 32,
  yPadding = 12,
  color = "#D71921",
  textColor = "#ffffff",
  rounded = true,
  onClick,
  font,
  fontSize = "16px",
  outlined = false,
  href,
  className = "",
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const darkenColor = (hex: string, factor = 0.2) => {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.max(0, (num >> 16) - 255 * factor);
    const g = Math.max(0, ((num >> 8) & 0x00ff) - 255 * factor);
    const b = Math.max(0, (num & 0x0000ff) - 255 * factor);
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  };

  const backgroundColor = outlined
    ? isHovered
      ? darkenColor(color)
      : "transparent"
    : isHovered
    ? darkenColor(color)
    : color;

  const buttonTextColor = outlined
    ? isHovered
      ? textColor
      : color
    : textColor;

  const borderColor = outlined ? darkenColor(color) : "none";

  const style: React.CSSProperties = {
    padding: `${yPadding}px ${xPadding}px`,
    backgroundColor,
    color: buttonTextColor,
    border: outlined ? `1px solid ${borderColor}` : "none",
    borderRadius: rounded ? "9999px" : "4px",
    font: font ? `${font}, sans-serif` : "inherit",
    fontSize,
    fontWeight: 500,
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
  };

  if (href) {
    return (
      <a
        href={href}
        className={className}
        style={style}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      style={style}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
    >
      {children}
    </button>
  );
};

export default Button;
