import React, { PropsWithChildren } from "react";

type ReactNode = Exclude<React.ReactNode, React.ReactFragment>;

type Props<T> = {
  test: T;
} & (
  | {
      then: React.ReactNode | ((arg: NonNullable<T>) => React.ReactNode);
      else?: React.ReactNode;
    }
  | {
      else: React.ReactNode;
    }
  | {
      children: ReactNode | ((arg: NonNullable<T>) => React.ReactNode);
      fallback?: React.ReactNode;
    }
  | {
      fallback: React.ReactNode;
    }
  | {
      children:
        | ReactNode
        | ((arg: NonNullable<T>) => React.ReactNode)
        | [ReactNode, ...ReactNode[]]
        | [(arg: NonNullable<T>) => React.ReactNode, ...ReactNode[]];
    }
);

/**
 * ### `<If />`
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
 * @see https://github.com/accio-studio/react-tsx#if
 */
export function If<T extends unknown>(props: Props<T>): JSX.Element {
  if (!("then" in props || "else" in props || "children" in props || "fallback" in props)) {
    throw new Error("If component must have at least one child or `then` / `else` props");
  }

  if ("then" in props) {
    if (!props.test) return <>{props.else}</>;
    if (typeof props.then === "function") {
      return <>{props.then(props.test)}</>;
    }
    return <>{props.then}</>;
  }

  if ("else" in props) {
    if (!props.test) return <>{props.else}</>;
    return <>{null}</>;
  }

  if ("fallback" in props) {
    if (!props.test) return <>{props.fallback}</>;
    if ("children" in props) {
      if (typeof props.children === "function") {
        return <>{props.children(props.test)}</>;
      }
      return <>{props.children}</>;
    }
    return <>{null}</>;
  }

  const children = Array.isArray(props.children) ? props.children : [props.children];
  const count = children.length;
  let hasElseIf = false;

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
          hasElseIf ||= React.isValidElement(child) && child.type === ElseIf;
          if (React.isValidElement(child) && child.type === Else && index < count - 1) {
            throw new Error("Else must be last child");
          }
          if (props.test && index === 0) return child;
          if (!props.test && hasElseIf && index > 0 && index < count - 1) return child;
          if (!props.test && index === count - 1) return child;
          if (!hasElseIf && index > 1) {
            throw new Error("If component must have at most two children");
          }
          return null;
        },
      )}
    </>
  );
}
If.ElseIf = If;
If.Else = React.Fragment;

export const ElseIf = <T extends unknown>(props: Props<T>) => <If {...props} />;

export const Else = (props: PropsWithChildren) => <React.Fragment {...props} />;
