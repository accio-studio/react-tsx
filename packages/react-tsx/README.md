# react-tsx

Headless primitives for react

## If

### `<If />` with one/two children

If component allows to render children only if condition is true

```tsx
import { If } from "@accio-studio/react-tsx";

<If test={condition}>
  <>Show me if conditioin is true</>
  <>Show me if conditioin is false</>
</If>;
/**
 * @prop {unknown} test - Condition to show if condition is truthy.
 * @prop {React.ReactNode | (arg: NonNullable<T>) => React.ReactNode} children - First child will be shown if condition is truthy, second one – if it is falsy.
 */
```

or use `<Else />` and `<IfElse />` and function-as-a-child to get access to `NonNulable<typeof test>` value

```tsx
import { If, IfElse, Else } from '@accio-studio/react-tsx'

<If
 test={{arg: "A"}}
>
 {(data) => <>{data.arg}</>
 //              ^? { arg: string }
 <Else>B</Else>}
// will render "A"
<If test={false}>
 <>A</>
 <ElseIf test={true}>
  <>B</>
  <Else>C</Else>
 </ElseIf>
</If>
// will render "B"
<If test={false}>
 <>A</>
 <If.ElseIf test={false}>
  <>B</>
  <If.Else>C</If.Else>
 </If.ElseIf>
</If>
// will render "C"
```

### `<If />` with `then` and `else`

If component must have `then` or `else` props.

```tsx
<If
 test={true}
 then={<>A</>}
 else={<>B</>}
/>
// will render "A"
<If
 test={false}
 then={<>A</>}
 else={<>B</>}
/>
// will render "B"
/**
 * @prop {unknown} test - Condition to show if condition is truthy.
 * @prop {React.ReactNode | (arg: NonNullable<T>) => React.ReactNode} then - Content to show if condition is truthy
 * @prop {React.ReactNode} else - Content to show if condition is falsy.
*/
```

### `<If />` with `fallback`

If component must have at least one child or `fallback` prop.

```tsx
<If test={true} fallback={B}>
 A
</If>
// will render "A"
<If test={false} fallback={B}>
 A
</If>
// will render "B"
/**
* @prop {unknown} test - Condition to show if condition is truthy.
* @prop {React.ReactNode} children - Content to show if condition is truthy.
* @prop {React.ReactNode} fallback - Content to show if condition is falsy.
```

## Switch

```tsx
import { Switch } from "@accio-studio/react-tsx";

const union = "idle" | "loading" | "error" | "success";

<Switch expression={union} exhaustive>
  <Switch.Case value={"idle"}>Idle</Switch.Case>
  <Switch.Case value={"loading"}>Loading</Switch.Case>
  <Switch.Case value={"error"}>Error</Switch.Case>
  {/* <Switch.Case value={"success"}>Success</Switch.Case> */}
  {/* <Switch.Default>Default</Switch.Default> */}
</Switch>;
// will cause of type error because of `exhaustive` prop
```

## Progress

- [x] `<If />`
  - [x] `<ElseIf />`
  - [x] `<Else />`
- [ ] `<Switch />`
- [ ] `<Match />`
- [ ] `<For />`

## Credits

- React Velcro
  - [react-loops](https://github.com/leebyron/react-loops)
  - [react-condition](https://github.com/andrewfluck/react-condition)
