import { useId } from "@react-aria/utils";

export interface GrainProps {
  baseFraquency?: number;
  numOctaves?: number;
  children?: React.ReactNode;
}

export function Grain(props: GrainProps) {
  const { children, baseFraquency = 0.65, numOctaves = 3 } = props;
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
