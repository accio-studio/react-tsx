import React from "react";

export function If<T extends unknown>(props: {
  test: T;
  children: React.ReactNode | React.ReactNode[] | ((arg: T) => React.ReactNode);
}) {
  if (typeof props.children === "function" && props.test) {
    return <>{props.children(props.test)}</>;
  }
  return <>{props.test ? props.children : null}</>;
}
