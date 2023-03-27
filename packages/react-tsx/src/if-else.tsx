import { forwardRef } from "./forward-ref";
import React from "react";

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

const _If = forwardRef(<T extends unknown>(props: Props<T>, ref: React.ForwardedRef<unknown>) => {
  if (!("then" in props || "else" in props || "children" in props || "fallback" in props)) {
    throw new Error("If component must have at least one child or `then` / `else` props");
  }

  if ("then" in props) {
    if (!props.test) return Fragment(props.else);
    if (typeof props.then === "function") {
      return Fragment(props.then(props.test));
    }
    return Fragment(props.then);
  }

  if ("else" in props) {
    if (!props.test) return Fragment(props.else);
    return Fragment(null);
  }

  if ("fallback" in props) {
    if (!props.test) return Fragment(props.fallback);
    if ("children" in props) {
      if (typeof props.children === "function") {
        return Fragment(props.children(props.test));
      }
      return Fragment(props.children);
    }
    return Fragment(null);
  }

  const children = Array.isArray(props.children) ? props.children : [props.children];
  const count = children.length;
  let hasElseIf = false;

  return Fragment(
    React.Children.map(
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
        if (props.test && index === 0) return createReactElement(child, ref);
        if (!props.test && hasElseIf && index > 0 && index < count - 1) return createReactElement(child, ref);
        if (!props.test && index === count - 1) return createReactElement(child, ref);
        if (!hasElseIf && index > 1) {
          throw new Error("If component must have at most two children");
        }
        return null;
      },
    ),
  );
});

/**
 * ### `<ElseIf />`
 * @example
 * ```tsx
 * <If test={false}>
 *  A
 *  <ElseIf test={true}>
 *    B
 *    C
 *  </ElseIf>
 * </If>
 * // will render "B"
 * ```
 * @see https://github.com/accio-studio/react-tsx#if
 */
export const ElseIf = _If;

/**
 * ### `<Else />`
 * @example
 * ```tsx
 * <If test={false}>
 *  A
 *  <Else>B</Else>
 * </If>
 * // will render "B"
 * ```
 * @see https://github.com/accio-studio/react-tsx#if
 */
export const Else = forwardRef((props: React.PropsWithChildren, ref) => {
  return React.createElement(
    React.Fragment,
    undefined,
    React.Children.map(props.children, (child) => {
      return createReactElement(child, ref);
    }),
  );
});

function createReactElement(child: React.ReactNode, ref: React.Ref<unknown>) {
  return React.isValidElement(child) ? React.createElement(child.type, { ...(child.props ?? {}), ref }) : child;
}

function Fragment(...children: Array<React.ReactNode>) {
  return React.createElement(React.Fragment, undefined, ...children);
}

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
export const If = Object.assign(_If, {
  /**
   * ### `<ElseIf />`
   * @example
   * ```tsx
   * <If test={false}>
   *  A
   *  <If.ElseIf test={true}>
   *    B
   *    C
   *  </If.ElseIf>
   * </If>
   * // will render "B"
   * ```
   * @see https://github.com/accio-studio/react-tsx#if
   */
  ElseIf,
  /**
   * ### `<Else />`
   * @example
   * ```tsx
   * <If test={false}>
   *  A
   *  <If.Else>B</If.Else>
   * </If>
   * // will render "B"
   * ```
   * @see https://github.com/accio-studio/react-tsx#if
   */
  Else,
});
