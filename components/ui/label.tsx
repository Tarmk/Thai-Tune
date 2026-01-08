import type React from "react"

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ children, ...props }) => {
  return (
    <label
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      {...props}
    >
      {children}
    </label>
  )
}
