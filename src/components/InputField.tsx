import React, { forwardRef } from "react";
import Image from "next/image";

interface InputFieldProps {
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  iconSrc?: string;
  font?: string;
  fontSize?: string;
  backgroundColor?: string;
  dashedBorder?: boolean;
  className?: string;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      type = "text",
      placeholder = "",
      icon,
      iconSrc,
      font = "5by7",
      fontSize = "16px",
      backgroundColor = "#f0f0f0",
      dashedBorder = false,
      className = "",
    },
    ref
  ) => {
    const containerStyle: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      backgroundColor,
      borderRadius: "16px",
      padding: "12px 20px",
      width: "100%",
      borderBottom: dashedBorder ? "2px dashed #aaa" : "none",
      gap: "12px",
    };

    const inputStyle: React.CSSProperties = {
      flex: 1,
      border: "none",
      outline: "none",
      backgroundColor: "transparent",
      fontFamily: font,
      fontSize,
      color: "#000",
    };

    return (
      <div style={containerStyle} className={className}>
        {iconSrc ? (
          <Image src={iconSrc} alt="icon" width={20} height={20} />
        ) : (
          icon
        )}
        <input
          type={type}
          placeholder={placeholder}
          ref={ref}
          style={inputStyle}
        />
      </div>
    );
  }
);

InputField.displayName = "InputField";

export default InputField;
