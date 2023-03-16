import { Else, ElseIf, If } from "../src/if-else";
import { ErrorBoundary, renderElement } from "./test-utils";
import React from "react";
import { describe, expect, expectTypeOf, test, vi } from "vitest";

describe("<If /> with children", () => {
  test("If shows children if condition is truthy", () => {
    const result = renderElement(
      <If test={{}}>
        <>A</>
        <>B</>
      </If>,
    );
    expect(result).toMatchInlineSnapshot('"A"');
  });
  test("If shows second child if condition is falsy", () => {
    const result = renderElement(
      <If test={null}>
        <>A</>
        <>B</>
      </If>,
    );
    expect(result).toMatchInlineSnapshot('"B"');
  });
  test("If show function-as-a-children if condition is truthy", () => {
    const condition = { test: "A" };
    const result = renderElement(
      <If test={condition}>
        {(res) => {
          expectTypeOf(res).toEqualTypeOf<typeof condition>();
          return <>{res.test}</>;
        }}
        <>B</>
      </If>,
    );
    expect(result).toMatchInlineSnapshot('"A"');
  });
  test("If with FAAC shows second child if condition is falsy", () => {
    const result = renderElement(
      <If test={null as { test: string } | null}>
        {(res) => {
          expectTypeOf(res).toEqualTypeOf<{ test: string }>();
          return <>{res.test}</>;
        }}
        <>B</>
      </If>,
    );
    expect(result).toMatchInlineSnapshot('"B"');
  });
  test("If throw error when there is no children", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const result = renderElement(
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
    expect(result).toMatchInlineSnapshot('""');
  });
  test("If throw error when there is too match children", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const result = renderElement(
      <ErrorBoundary
        fallbackRender={(error) => {
          expect(error.message).toBe("If component must have at most two children");
          return null;
        }}
      >
        <If test={{}}>
          <>A</>
          <>B</>
          <>C</>
        </If>
      </ErrorBoundary>,
    );
    expect(result).toMatchInlineSnapshot('""');
  });
});

describe("<If /> with <Else />", () => {
  test("If shows first child if condition is truthy", () => {
    const result = renderElement(
      <If test={{}}>
        <>A</>
        <Else>B</Else>
      </If>,
    );
    expect(result).toMatchInlineSnapshot('"A"');
  });
  test("If shows ElseIf if condition is falsy", () => {
    const result = renderElement(
      <If test={null}>
        <>A</>
        <ElseIf test={{}}>
          <>B</>
        </ElseIf>
      </If>,
    );
    expect(result).toMatchInlineSnapshot('"B"');
  });
  test("If shows Else in ElseIf if conditions is falsy", () => {
    const result = renderElement(
      <If test={null}>
        <>A</>
        <ElseIf test={null}>
          <>B</>
          <Else>C</Else>
        </ElseIf>
      </If>,
    );
    expect(result).toMatchInlineSnapshot('"C"');
  });
  test("If works with recurcive <ElseIf /> and <Else />", () => {
    const result = renderElement(
      <If test={null}>
        <>A</>
        <ElseIf test={null}>
          <>B</>
          <Else>C</Else>
        </ElseIf>
        <ElseIf test={null}>
          <>D</>
          <ElseIf test={{}}>
            <>E</>
            <Else>F</Else>
          </ElseIf>
          <Else>G</Else>
        </ElseIf>
        <Else>H</Else>
      </If>,
    );
    expect(result).toMatchInlineSnapshot('"CEGH"');
  });
  test("If with If.Else and If.ElseIf if conditions is falsy", () => {
    const result = renderElement(
      <If test={null}>
        <>A</>
        <If.ElseIf test={null}>
          <>B</>
          <If.Else>C</If.Else>
        </If.ElseIf>
      </If>,
    );
    expect(result).toMatchInlineSnapshot('"C"');
  });
  test("If show function-as-a-children if condition is truthy", () => {
    const condition = { test: "A" };
    const result = renderElement(
      <If test={condition}>
        {(res) => {
          expectTypeOf(res).toEqualTypeOf<typeof condition>();
          return <>{res.test}</>;
        }}
        <Else>B</Else>
      </If>,
    );
    expect(result).toMatchInlineSnapshot('"A"');
  });
  test("If throw error when <Else /> is not last child", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const result = renderElement(
      <ErrorBoundary
        fallbackRender={(error) => {
          expect(error.message).toBe("Else must be last child");
          return null;
        }}
      >
        <If test={{}}>
          <Else>A</Else>
          <>B</>
        </If>
      </ErrorBoundary>,
    );
    expect(result).toMatchInlineSnapshot('""');
  });
});

describe("<If /> with `then` and `else` props", () => {
  test("If shows then if condition is truthy", () => {
    const result = renderElement(<If test={{}} then={<>A</>} else={<>B</>} />);
    expect(result).toMatchInlineSnapshot('"A"');
  });
  test("If shows `else` if condition is falsy", () => {
    const result = renderElement(<If test={null} then={<>A</>} else={<>B</>} />);
    expect(result).toMatchInlineSnapshot('"B"');
  });
  test("If shows `else` without `then` if condition is falsy", () => {
    const result = renderElement(<If test={null} else={<>B</>} />);
    expect(result).toMatchInlineSnapshot('"B"');
  });
  test("If show `then` render props if condition is truthy", () => {
    const condition = { test: "A" };
    const result = renderElement(
      <If
        test={condition}
        then={(res) => {
          expectTypeOf(res).toEqualTypeOf<typeof condition>();
          return <>{res.test}</>;
        }}
        else={<>B</>}
      />,
    );
    expect(result).toMatchInlineSnapshot('"A"');
  });
});

describe("<If /> with `fallback` prop", () => {
  test("If shows children if condition is truthy", () => {
    const result = renderElement(
      <If test={{}} fallback={<>B</>}>
        <>A</>
      </If>,
    );
    expect(result).toMatchInlineSnapshot('"A"');
  });
  test("If shows `fallback` if condition is falsy", () => {
    const result = renderElement(
      <If test={null} fallback={<>B</>}>
        <>A</>
      </If>,
    );
    expect(result).toMatchInlineSnapshot('"B"');
  });
  test("If shows `fallback` whithout children if condition is falsy", () => {
    const result = renderElement(<If test={null} fallback={<>B</>} />);
    expect(result).toMatchInlineSnapshot('"B"');
  });
  test("If show function-as-a-children if condition is truthy", () => {
    const condition = { test: "A" };
    const result = renderElement(
      <If test={condition} fallback={<>B</>}>
        {(res) => {
          expectTypeOf(res).toEqualTypeOf<typeof condition>();
          return <>{res.test}</>;
        }}
      </If>,
    );
    expect(result).toMatchInlineSnapshot('"A"');
  });
});

describe("<If /> forwards ref", () => {
  test("If pass ref to first child if condition is truthy", () => {
    const ref = React.createRef<HTMLDivElement>();
    const result = renderElement(
      <If test={{}} ref={ref}>
        <div>A</div>
        <div>B</div>
      </If>,
    );
    expect(ref.current?.innerHTML).toMatchInlineSnapshot('"A"');
    expect(result).toMatchInlineSnapshot('"<div>A</div>"');
  });
  test("If pass ref to second child if condition is falsy", () => {
    const ref = React.createRef<HTMLDivElement>();
    const result = renderElement(
      <If test={null} ref={ref}>
        <div>A</div>
        <div>B</div>
      </If>,
    );
    expect(ref.current?.innerHTML).toMatchInlineSnapshot('"B"');
    expect(result).toMatchInlineSnapshot('"<div>B</div>"');
  });
  test("If pass ref to next child if condition is falsy", () => {
    const ref = React.createRef<HTMLDivElement>();
    const result = renderElement(
      <If test={null} ref={ref}>
        <div>A</div>
        <ElseIf test={null}>
          <div>B</div>
          <Else>
            <div>C</div>
          </Else>
        </ElseIf>
      </If>,
    );
    expect(ref.current?.innerHTML).toMatchInlineSnapshot('"C"');
    expect(result).toMatchInlineSnapshot('"<div>C</div>"');
  });
  test("If pass ref to next child on <If.Else> if condition is falsy", () => {
    const ref = React.createRef<HTMLDivElement>();
    const result = renderElement(
      <If test={null} ref={ref}>
        <div>A</div>
        <If.ElseIf test={null}>
          <div>B</div>
          <If.Else>
            <div>C</div>
          </If.Else>
        </If.ElseIf>
      </If>,
    );
    expect(ref.current?.innerHTML).toMatchInlineSnapshot('"C"');
    expect(result).toMatchInlineSnapshot('"<div>C</div>"');
  });
  test("If do not pass ref to <Else /> child if it is not DOM element", () => {
    const ref = React.createRef<HTMLDivElement>();
    const result = renderElement(
      <If test={null} ref={ref}>
        <div>A</div>
        <Else>B</Else>
      </If>,
    );
    expect(ref.current?.innerHTML).toMatchInlineSnapshot("undefined");
    expect(result).toMatchInlineSnapshot('"B"');
  });
});
