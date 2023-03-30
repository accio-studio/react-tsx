import { mergeProps, useId } from "@react-aria/utils";
import { cva } from "cva";
import { ClassValue } from "cva/dist/types";
import React from "react";
import { twMerge } from "tailwind-merge";

export interface GrainProps {
  preset?: Presets;
  baseFraquency?: number;
  numOctaves?: number;
  className?: string;
  children?: React.ReactNode;
}

export function Grain(props: GrainProps) {
  const { children, baseFraquency = 0.65, numOctaves = 3 } = useGrainProps(props);
  const id = useId();

  return (
    <>
      <div className="relative w-24 h-24 isolate">
        <div
          className="absolute inset-0 filter contrast-150 brightness-150 from-black/50 to-black/50"
          style={{
            background: [
              "linear-gradient(to right, var(--tw-gradient-stops))",
              `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise-${id}'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${baseFraquency}' numOctaves='${numOctaves}' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise-${id})'/%3E%3C/svg%3E")`,
            ].join(", "),
          }}
        />
        <div className="absolute inset-0 bg-blue8/50" />
        <div className="relative">{children}</div>
      </div>
    </>
  );
}

const presets = {
  default: {
    baseFraquency: 0.65,
    numOctaves: 3,
  },
} as const;
type Presets = keyof typeof presets;

const grain = cva(["isolate relative", "before:absolute before:inset-0 filter contrast-150 brightness-150"], {
  variants: {
    preset: {
      default: "",
    } satisfies Record<Presets, ClassValue>,
  },
  defaultVariants: {
    preset: "default",
  },
});

export function useGrainProps(props: GrainProps) {
  const { preset, className } = props;
  const style: React.CSSProperties = {};

  return mergeProps(props, {
    className: twMerge(grain({ preset }), className),
    style,
  });
}
