import { render } from "@testing-library/react";
import { describe, expect, expectTypeOf, test, vi } from "vitest";
import { Else, If, IfElse as ElseIf } from "../src/if";
import { ErrorBoundary, renderElement } from "./test-utils";

describe("<If /> with children", () => {
  test("If shows children if condition is truthy", () => {
    const truthy = renderElement(
      <If test={{}}>
        <>A</>
        <>B</>
      </If>
    );
    expect(truthy).toMatchInlineSnapshot('"A"');
  });
  test("If shows second child if condition is falsy", () => {
    const falsy = renderElement(
      <If test={null}>
        <>A</>
        <>B</>
      </If>
    );
    expect(falsy).toMatchInlineSnapshot('"B"');
  });
  test("If show function-as-a-children if condition is truthy", () => {
    const condition = { test: "A" };
    const truthy = renderElement(
      <If test={condition}>
        {(res) => {
          expectTypeOf(res).toEqualTypeOf<typeof condition>();
          return <>{res.test}</>;
        }}
        <>B</>
      </If>
    );
    expect(truthy).toMatchInlineSnapshot('"A"');
  });
  test("If with FAAC shows second child if condition is falsy", () => {
    const truthy = renderElement(
      <If test={null as { test: string } | null}>
        {(res) => {
          expectTypeOf(res).toEqualTypeOf<{ test: string }>();
          return <>{res.test}</>;
        }}
        <>B</>
      </If>
    );
    expect(truthy).toMatchInlineSnapshot('"B"');
  });
  test("If throw error when there is no children", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary
        fallbackRender={(error) => {
          expect(error.message).toBe(
            "If component must have at least one child or `then` / `else` props"
          );
          return null;
        }}
      >
        {/* @ts-expect-error - If throw error when there is no children */}
        <If test={{}} />
      </ErrorBoundary>
    );
  });
  test("If throw error when there is too match children", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary
        fallbackRender={(error) => {
          expect(error.message).toBe(
            "If component must have at most two children"
          );
          return null;
        }}
      >
        {/* @ts-expect-error - If component must have at most two children */}
        <If test={{}}>
          <>A</>
          <>B</>
          <>C</>
        </If>
      </ErrorBoundary>
    );
  });
});

describe("<If /> with <IfElse /> <Else />", () => {
  test("If shows Else if condition is falsy", () => {
    const truthy = renderElement(
      <If test={null}>
        <>A</>
        <Else>B</Else>
      </If>
    );
    expect(truthy).toMatchInlineSnapshot('"B"');
  });
  test("If shows IfElse if condition is falsy", () => {
    const falsy = renderElement(
      <If test={null}>
        <>A</>
        <ElseIf test={{}}>
          <>B</>
        </ElseIf>
      </If>
    );
    expect(falsy).toMatchInlineSnapshot('"B"');
  });
  test("If shows Else in IfElse if conditions is falsy", () => {
    const falsy = renderElement(
      <If test={null}>
        <>A</>
        <ElseIf test={null}>
          <>B</>
          <Else>C</Else>
        </ElseIf>
      </If>
    );
    expect(falsy).toMatchInlineSnapshot('"C"');
  });
  test("If show function-as-a-children if condition is truthy", () => {
    const condition = { test: "A" };
    const truthy = renderElement(
      <If test={condition}>
        {(res) => {
          expectTypeOf(res).toEqualTypeOf<typeof condition>();
          return <>{res.test}</>;
        }}
        <Else>B</Else>
      </If>
    );
    expect(truthy).toMatchInlineSnapshot('"A"');
  });
});

describe("<If /> with `then` and `else` props", () => {
  test("If shows then if condition is truthy", () => {
    const truthy = renderElement(<If test={{}} then={<>A</>} else={<>B</>} />);
    expect(truthy).toMatchInlineSnapshot('"A"');
  });
  test("If shows `else` if condition is falsy", () => {
    const falsy = renderElement(<If test={null} then={<>A</>} else={<>B</>} />);
    expect(falsy).toMatchInlineSnapshot('"B"');
  });
  test("If shows `else` without `then` if condition is falsy", () => {
    const falsy = renderElement(<If test={null} else={<>B</>} />);
    expect(falsy).toMatchInlineSnapshot('"B"');
  });
  test("If show `then` render props if condition is truthy", () => {
    const condition = { test: "A" };
    const truthy = renderElement(
      <If
        test={condition}
        then={(res) => {
          expectTypeOf(res).toEqualTypeOf<typeof condition>();
          return <>{res.test}</>;
        }}
        else={<>B</>}
      />
    );
    expect(truthy).toMatchInlineSnapshot('"A"');
  });
});

describe("<If /> with `fallback` prop", () => {
  test("If shows children if condition is truthy", () => {
    const truthy = renderElement(
      <If test={{}} fallback={<>B</>}>
        <>A</>
      </If>
    );
    expect(truthy).toMatchInlineSnapshot('"A"');
  });
  test("If shows `fallback` if condition is falsy", () => {
    const falsy = renderElement(
      <If test={null} fallback={<>B</>}>
        <>A</>
      </If>
    );
    expect(falsy).toMatchInlineSnapshot('"B"');
  });
  test("If shows `fallback` whithout children if condition is falsy", () => {
    const falsy = renderElement(<If test={null} fallback={<>B</>} />);
    expect(falsy).toMatchInlineSnapshot('"B"');
  });
  test("If show function-as-a-children if condition is truthy", () => {
    const condition = { test: "A" };
    const truthy = renderElement(
      <If test={condition} fallback={<>B</>}>
        {(res) => {
          expectTypeOf(res).toEqualTypeOf<typeof condition>();
          return <>{res.test}</>;
        }}
      </If>
    );
    expect(truthy).toMatchInlineSnapshot('"A"');
  });
});
