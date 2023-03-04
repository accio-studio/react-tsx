import { describe, test, expect, expectTypeOf } from "vitest";
import { render, screen } from "@testing-library/react";
import { If } from "../src/If";

describe("<If />", () => {
  test("If show chidren if condition is truthy", () => {
    const condition = {};
    const wrapper = render(
      <div data-testid="if">
        <If test={condition}>A</If>
      </div>,
    );
    expect(wrapper).toBeTruthy();
    expect(screen.getByTestId("if")).toMatchInlineSnapshot(`
      <div
        data-testid="if"
      >
        A
      </div>
    `);
  });
  test("If show function-as-a-chidren if condition is truthy", () => {
    const condition = { test: "Truthy" };
    render(
      <div data-testid="if">
        <If test={condition}>
          {(res) => {
            expectTypeOf(res).toEqualTypeOf<typeof condition>();
            return <>{res.test}</>;
          }}
        </If>
      </div>,
    );
    expect(screen.getByTestId("if")).toMatchInlineSnapshot(`
      <div
        data-testid="if"
      >
        Truthy
      </div>
    `);
  });
});
