---
draft: true
title: <If />
description: If component allows to render children only if condition is true
keywords:
  - headless
  - primitives
  - react
tags:
  - react
  - velcro
---
import { IfElseExample } from "./examples";

# `<If />`

## `<If />` with one/two children

If component allows to render children only if condition is true

<IfElseExample />

```ts twoslash
// @filename app/example.tsx
// title app/example.tsx
// lineNumbers
import { If } from "@accio-ui/react-tsx";

/**
 * @prop {unknown} test - Condition to show if condition is truthy.
 * @prop {React.ReactNode | (arg: NonNullable<T>) => React.ReactNode} children
 * - First child will be shown if condition is truthy.
 * - Second one – if it is falsy.
 */
const condition = false;
<If test={condition}>
            // ^?
  <>Show me if condition is true</>
  <>Show me if condition is false</>
</If>;
```
