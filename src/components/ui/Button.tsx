import { forwardRef } from "react";
import { cn } from "../../utils/className";

export type ButtonRef = React.ComponentRef<"button">;
export type ButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  pressed?: boolean;
};

export const Button = forwardRef<ButtonRef, ButtonProps>((props, ref) => {
  const { children, className, type = "button", pressed = false, ...buttonProps } = props;
  return (
    <button ref={ref} type={type} className={cn("button", className)} aria-pressed={pressed} {...buttonProps}>
      {children}
    </button>
  );
});

Button.displayName = "Button";
