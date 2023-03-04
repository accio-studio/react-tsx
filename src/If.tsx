import React from "react";

export function If(props: { test: unknown; children: React.ReactNode }) {
  return <>{props.test ? props.children : null}</>;
}
