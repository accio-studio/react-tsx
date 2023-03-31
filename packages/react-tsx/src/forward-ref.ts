// @see: https://fettblog.eu/typescript-react-generic-forward-refs

import React from "react";

declare function _forwardRef<T, P = {}>(
  render: (props: P, ref: React.Ref<T>) => React.ReactElement | null,
): (props: P & React.RefAttributes<T>) => React.ReactElement | null;
// rome-ignore lint/correctness/noUndeclaredVariables: <explanation>
type _ForwardRef = typeof _forwardRef;

export type ForwardRef = _ForwardRef;
export const forwardRef = React.forwardRef as ForwardRef;
