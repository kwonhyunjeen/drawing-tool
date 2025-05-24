import { forwardRef } from "react";
import { cn } from "../utils/className";

export type ColorPickerRef = React.ComponentRef<"input">;
export type ColorPickerProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  "type"
>;

export const ColorPicker = forwardRef<ColorPickerRef, ColorPickerProps>(
  (props, ref) => {
    const { children, className, ...inputProps } = props;
    return (
      <input
        ref={ref}
        type="color"
        className={cn("color-picker", className)}
        {...inputProps}
      >
        {children}
      </input>
    );
  },
);

ColorPicker.displayName = "ColorPicker";
