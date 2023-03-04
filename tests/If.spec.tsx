import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { If } from "../src/If";

describe("<If />", () => {
  test("If mounts properly", () => {
    const wrapper = render(
      <div data-testid="if">
        <If test={true}>A</If>
      </div>
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
  test;
});
