import { If } from "@accio-ui/react-tsx";
import { useState } from "react";

export function IfElseExample() {
  const [value, setValue] = useState(false);
  return (
    <div className="grid gap-4 place-items-center">
      <If test={value}>
        <div>Show me if condition is true</div>
        <div>Show me if condition is false</div>
      </If>
      <button onClick={() => setValue(!value)}>Toggle</button>
    </div>
  );
}
