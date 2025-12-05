import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Label = forwardRef(({ 
  className,
  children,
  ...props 
}, ref) => {
  return (
    <label
      className={cn("form-label", className)}
      ref={ref}
      {...props}
    >
      {children}
    </label>
  );
});

Label.displayName = "Label";

export default Label;