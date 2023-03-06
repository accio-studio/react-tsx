import React from "react";

type Props<T> = {
  test: T;
} & (
  | {
      then: React.ReactNode | Array<React.ReactNode> | ((arg: NonNullable<T>) => React.ReactNode);
      else?: React.ReactNode | Array<React.ReactNode>;
    }
  | {
      else: React.ReactNode | Array<React.ReactNode>;
    }
  | {
      children:
        | React.ReactNode
        | Array<React.ReactNode>
        | ((arg: NonNullable<T>) => React.ReactNode | Array<React.ReactNode>);
      fallback?: React.ReactNode | Array<React.ReactNode>;
    }
  | {
      fallback: React.ReactNode | Array<React.ReactNode>;
    }
  | {
      children:
        | React.ReactNode
        | ((arg: NonNullable<T>) => React.ReactNode)
        | [React.ReactNode, React.ReactNode]
        | [(arg: NonNullable<T>) => React.ReactNode, React.ReactNode];
    }
);

/**
 * ### <If />
 * @example
 * ```tsx
 * <If test={true}>
 *  A
 *  B
 * </If>
 * // will render "A"
 * <If test={false}>
 *  A
 *  B
 * </If>
 * // will render "B"
 * ```
 * @see https://github.com/accio-studio/react-tsx
 */
export function If<T extends unknown>(props: Props<T>): JSX.Element {
  if (!("then" in props || "else" in props || "children" in props || "fallback" in props)) {
    throw new Error("If component must have at least one child or `then` / `else` props");
  }

  if ("then" in props) {
    if (props.else && !props.test) return <>{props.else}</>;
    return <>{props.then}</>;
  }

  if ("else" in props) {
    if (!props.test) return <>{props.else}</>;
    return <>{null}</>;
  }

  if ("fallback" in props) {
    if (!props.test) return <>{props.fallback}</>;
    if ("children" in props) return <>{props.children}</>;
    return <>{null}</>;
  }

  const children = Array.isArray(props.children) ? props.children : [props.children];

  if (children.length > 2) {
    throw new Error("If component must have at most two children");
  }

  return (
    <>
      {React.Children.map(
        children.map((child) => {
          if (typeof child === "function") {
            return child((props.test ?? {}) as NonNullable<T>);
          }
          return child;
        }),
        (child, index) => {
          if (props.test && index === 0) return child;
          if (!props.test && index === 1) return child;
          return null;
        },
      )}
    </>
  );
}

export const IfElse = If;

export const Else = React.Fragment;
