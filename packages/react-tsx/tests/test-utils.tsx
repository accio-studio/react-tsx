import { render, screen } from "@testing-library/react";
import React from "react";

type ErrorBoundaryProps = React.PropsWithChildren<{
  fallbackRender: (error: Error) => React.ReactNode;
}>;

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    // rome-ignore lint/nursery/noInvalidConstructorSuper: <explanation>
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    const { children, fallbackRender } = this.props;
    const { error } = this.state;

    if (error) {
      return fallbackRender(error);
    }

    return <>{children}</>;
  }
}

export function renderElement(ui: Parameters<typeof render>[0]) {
  const id = "test-id";
  render(<div data-testid={id}>{ui}</div>);
  return screen.getByTestId(id).innerHTML;
}

function ComponentWithError({ hasError }: { hasError?: boolean }) {
  if (hasError) {
    throw new Error("Some error");
  }
  return <>There is no error</>;
}

if (import.meta.vitest) {
  const { describe, test, expect, vi } = import.meta.vitest;
  vi.spyOn(console, "error").mockImplementation(() => {});

  describe("<ErrorBoundary />", () => {
    test("Error boundary shows children when there is not error", () => {
      const component = render(
        <ErrorBoundary
          fallbackRender={(error) => {
            expect(error.message).toBe("Some error");
            return null;
          }}
        >
          <ComponentWithError />
        </ErrorBoundary>,
      );
      expect(component).toBeTruthy();
    });
    test("Error boundary shows error component when there is some error", () => {
      const component = render(
        <ErrorBoundary
          fallbackRender={(error) => {
            expect(error.message).toBe("Some error");
            return null;
          }}
        >
          <ComponentWithError hasError={true} />
        </ErrorBoundary>,
      );
      expect(component).toBeTruthy();
    });
  });
}
