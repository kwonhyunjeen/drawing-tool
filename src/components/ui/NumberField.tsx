import { forwardRef } from "react";
import { cn } from "../../utils/className";

export type NumberFieldRef = React.ComponentRef<"input">;
export type NumberFieldProps = Omit<React.ComponentPropsWithoutRef<"input">, "type">;

export const NumberField = forwardRef<NumberFieldRef, NumberFieldProps>((props, ref) => {
  const { children, className, ...inputProps } = props;
  return (
    <input ref={ref} type="number" className={cn("number-field", className)} {...inputProps}>
      {children}
    </input>
  );
});

NumberField.displayName = "NumberField";
