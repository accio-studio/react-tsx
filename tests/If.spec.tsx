import { render } from "@testing-library/react";
import { describe, expect, expectTypeOf, test, vi } from "vitest";
import { Else, If, IfElse } from "../src";
import { ErrorBoundary, renderElement } from "./test-utils";

describe("<If /> with children", () => {
  test("If shows children if condition is truthy", () => {
    const truthy = renderElement(
      <If test={{}}>
        <div>A</div>
        <div>B</div>
      </If>,
    );
    expect(truthy).toMatchInlineSnapshot('"<div>A</div>"');
  });
  test("If shows second child if condition is falsy", () => {
    const falsy = renderElement(
      <If test={null}>
        <div>A</div>
        <div>B</div>
      </If>,
    );
    expect(falsy).toMatchInlineSnapshot('"<div>B</div>"');
  });
  test("If show function-as-a-children if condition is truthy", () => {
    const condition = { test: "A" };
    const truthy = renderElement(
      <If test={condition}>
        {(res) => {
          expectTypeOf(res).toEqualTypeOf<typeof condition>();
          return <div>{res.test}</div>;
        }}
        <div>B</div>
      </If>,
    );
    expect(truthy).toMatchInlineSnapshot('"<div>A</div>"');
  });
  test("If with FAAC shows second child if condition is falsy", () => {
    const truthy = renderElement(
      <If test={null as { test: string } | null}>
        {(res) => {
          expectTypeOf(res).toEqualTypeOf<{ test: string }>();
          return <div>{res.test}</div>;
        }}
        <div>B</div>
      </If>,
    );
    expect(truthy).toMatchInlineSnapshot('"<div>B</div>"');
  });
  test("If throw error when there is no children", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary
        fallbackRender={(error) => {
          expect(error.message).toBe("If component must have at least one child or `then` / `else` props");
          return null;
        }}
      >
        {/* @ts-expect-error - If throw error when there is no children */}
        <If test={{}} />
      </ErrorBoundary>,
    );
  });
  test("If throw error when there is too match children", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary
        fallbackRender={(error) => {
          expect(error.message).toBe("If component must have at most two children");
          return null;
        }}
      >
        {/* TODO: @ts-expect-error - If component must have at most two children */}
        <If test={{}}>
          <div>A</div>
          <div>B</div>
          <div>C</div>
        </If>
      </ErrorBoundary>,
    );
  });
});

describe("<If /> with <IfElse /> <Else />", () => {
  test("If shows Else if condition is falsy", () => {
    const truthy = renderElement(
      <If test={null}>
        <div>A</div>
        <Else>B</Else>
      </If>,
    );
    expect(truthy).toMatchInlineSnapshot('"B"');
  });
  test("If shows IfElse if condition is falsy", () => {
    const falsy = renderElement(
      <If test={null}>
        <div>A</div>
        <IfElse test={{}}>B</IfElse>
      </If>,
    );
    expect(falsy).toMatchInlineSnapshot('"B"');
  });
  test("If shows Else in IfElse if conditions is falsy", () => {
    const falsy = renderElement(
      <If test={null}>
        <div>A</div>
        <IfElse test={null}>
          <div>B</div>
          <Else>C</Else>
        </IfElse>
      </If>,
    );
    expect(falsy).toMatchInlineSnapshot('"C"');
  });
  test("If show function-as-a-children if condition is truthy", () => {
    const condition = { test: "A" };
    const truthy = renderElement(
      <If test={condition}>
        {(res) => {
          expectTypeOf(res).toEqualTypeOf<typeof condition>();
          return <div>{res.test}</div>;
        }}
        <Else>B</Else>
      </If>,
    );
    expect(truthy).toMatchInlineSnapshot('"<div>A</div>"');
  });
});

describe("<If /> with `then` and `else` props", () => {
  test("If shows then if condition is truthy", () => {
    const truthy = renderElement(<If test={{}} then={<div>A</div>} else={<div>B</div>} />);
    expect(truthy).toMatchInlineSnapshot('"<div>A</div>"');
  });
  test("If shows `else` if condition is falsy", () => {
    const falsy = renderElement(<If test={null} then={<div>A</div>} else={<div>B</div>} />);
    expect(falsy).toMatchInlineSnapshot('"<div>B</div>"');
  });
  test("If shows `else` without `then` if condition is falsy", () => {
    const falsy = renderElement(<If test={null} else={<div>B</div>} />);
    expect(falsy).toMatchInlineSnapshot('"<div>B</div>"');
  });
  test("If show `then` render props if condition is truthy", () => {
    const condition = { test: "A" };
    const truthy = renderElement(
      <If
        test={condition}
        then={(res) => {
          expectTypeOf(res).toEqualTypeOf<typeof condition>();
          return <div>{res.test}</div>;
        }}
        else={<div>B</div>}
      />,
    );
    expect(truthy).toMatchInlineSnapshot('""');
  });
});

describe("<If /> with `fallback` prop", () => {
  test("If shows children if condition is truthy", () => {
    const truthy = renderElement(
      <If test={{}} fallback={<div>B</div>}>
        <div>A</div>
      </If>,
    );
    expect(truthy).toMatchInlineSnapshot('"<div>A</div>"');
  });
  test("If shows `fallback` if condition is falsy", () => {
    const falsy = renderElement(
      <If test={null} fallback={<div>B</div>}>
        <div>A</div>
      </If>,
    );
    expect(falsy).toMatchInlineSnapshot('"<div>B</div>"');
  });
  test("If shows `fallback` whithout children if condition is falsy", () => {
    const falsy = renderElement(<If test={null} fallback={<div>B</div>} />);
    expect(falsy).toMatchInlineSnapshot('"<div>B</div>"');
  });
  test("If show function-as-a-children if condition is truthy", () => {
    const condition = { test: "A" };
    const truthy = renderElement(
      <If test={condition} fallback={<div>B</div>}>
        {(res) => {
          expectTypeOf(res).toEqualTypeOf<typeof condition>();
          return <div>{res.test}</div>;
        }}
      </If>,
    );
    expect(truthy).toMatchInlineSnapshot('""');
  });
});
