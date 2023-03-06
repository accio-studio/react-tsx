# react-tsx

Headless primitives for react

## <If />

### <If /> with one/two children

If component allows to render children only if condition is true

```tsx
<If test={condition}>
  <>Show me if conditioin is true</>
  <>Show me if conditioin is false</>
</If>
/**
 * @prop {unknown} test - Condition to show if condition is truthy.
 * @prop {React.ReactNode} children - First child will be shown if condition is truthy, second one – if it is falsy.
 */
```

### <If /> with `then` and `else`

If component must have `then` or `else` props.

```tsx
<If
 test={true}
 then={<div>A</div>}
 else={<div>B</div>}
/>
// will render "A"
<If
 test={true}
 then={<div>A</div>}
 else={<div>B</div>}
/>
// will render "B"
/**
 * @prop {unknown} test - Condition to show if condition is truthy.
 * @prop {React.ReactNode | (arg: NonNullable<T>) => React.ReactNode} then - Content to show if condition is truthy
 * @prop {React.ReactNode} else - Content to show if condition is falsy.
*/
```

### <If /> with `fallback`

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
