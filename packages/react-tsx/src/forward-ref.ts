// @see: https://fettblog.eu/typescript-react-generic-forward-refs

import React from "react";

declare function _forwardRef<T, P = {}>(
  render: (props: P, ref: React.Ref<T>) => React.ReactElement | null,
): (props: P & React.RefAttributes<T>) => React.ReactElement | null;
type _ForwardRef = typeof _forwardRef;

export interface ForwardRef extends _ForwardRef {}
export const forwardRef = React.forwardRef as ForwardRef;
