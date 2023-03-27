import { type AriaButtonProps, useButton } from "@react-aria/button";
import { type VariantProps, cva } from "cva";
import * as React from "react";
import { twMerge } from "tailwind-merge";

const buttonVariants = cva(
  [
    "bg-blue7 text-blue11",
    "border border-solid border-blue10",
    "outline-[10px] outline-offset-4 outline-transparent",
    "focus-visible:outline-blue6",
  ],
  {
    variants: {
      size: {
        small: ["px-4 py-2 rounded-sm"],
        medium: ["px-6", "py-4 rounded-md"],
        large: ["px-8", "py-6 rounded-lg"],
      },
      isPressed: {
        false: "",
        true: "bg-blue6",
      },
    },
    defaultVariants: {
      size: "small",
      isPressed: false,
    },
  },
);
export interface ButtonVariants extends VariantProps<typeof buttonVariants> {}
export const button = (variants: ButtonVariants, className?: string) => twMerge(buttonVariants(variants), className);

export interface ButtonProps extends AriaButtonProps<"button"> {
  value?: string;
  className?: string;
}

export function Button(props: ButtonProps & React.HTMLAttributes<"button"> & ButtonVariants) {
  let { children, size, className } = props;
  let ref = React.useRef<HTMLButtonElement>(null);
  let { buttonProps, isPressed } = useButton(
    {
      ...props,
      // elementType: 'span'
    },
    ref,
  );

  return (
    <button {...buttonProps} className={button({ size, isPressed }, className)} ref={ref}>
      {children}
    </button>
  );
}
