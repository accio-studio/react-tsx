import { Code } from "bright";
import type { MDXComponents } from "mdx/types";
import { Fira_Code } from "next/font/google";

const font = Fira_Code({ subsets: ["latin"] });

Code.theme = "github-dark";
Code.codeClassName = font.className;
Code.titleClassName = font.className;
Code.lineNumbers = false;

Code.extensions = [
  {
    name: "lineNumbers",
    // @ts-expect-error types are wrong
    beforeHighlight: (props, annotations) => {
      if (annotations.length > 0) {
        return { ...props, lineNumbers: true };
      }
    },
  },
  // {
  //   name: "mark",
  //   InlineAnnotation: ({ children, query }) => <mark style={{ background: query }}>{children}</mark>,
  //   MultilineAnnotation: ({ children, query }) => <div style={{ background: query }}>{children}</div>,
  // },
  // {
  //   name: "focus",
  //   MultilineAnnotation: ({ children }) => <div style={{ filter: "contrast(0.3)" }}>{children}</div>,
  //   beforeHighlight: (props, focusAnnotations) => {
  //     if (focusAnnotations.length === 0) return props;
  //     const lineCount = props.code.split("\n").length;
  //     const ranges = focusAnnotations.flatMap((a) => a.ranges);
  //     let newRanges = [{ fromLineNumber: 1, toLineNumber: lineCount }];
  //     for (const range of ranges) {
  //       const { fromLineNumber, toLineNumber } = range;
  //       newRanges = newRanges.flatMap((r) => {
  //         if (r.fromLineNumber > toLineNumber || r.toLineNumber < fromLineNumber) return [r];
  //         if (r.fromLineNumber >= fromLineNumber && r.toLineNumber <= toLineNumber) return [];
  //         if (r.fromLineNumber < fromLineNumber && r.toLineNumber > toLineNumber)
  //           return [
  //             {
  //               fromLineNumber: r.fromLineNumber,
  //               toLineNumber: fromLineNumber - 1,
  //             },
  //             {
  //               fromLineNumber: toLineNumber + 1,
  //               toLineNumber: r.toLineNumber,
  //             },
  //           ];
  //         if (r.fromLineNumber < fromLineNumber)
  //           return [
  //             {
  //               fromLineNumber: r.fromLineNumber,
  //               toLineNumber: fromLineNumber - 1,
  //             },
  //           ];
  //         if (r.toLineNumber > toLineNumber)
  //           return [
  //             {
  //               fromLineNumber: toLineNumber + 1,
  //               toLineNumber: r.toLineNumber,
  //             },
  //           ];
  //       });
  //     }
  //     const newAnnotations = props.annotations.filter((a) => a.name !== "focus");
  //     newAnnotations.push({
  //       name: "focus",
  //       ranges: newRanges,
  //     });
  //     return { ...props, annotations: newAnnotations };
  //   },
  // },
  // number: {
  //   InlineAnnotation: ({ children, content }) => (
  //     <input defaultValue={content} type="number" min={0} max={99} />
  //   ),
  // },
  // offset: {
  //   // change line numbers
  // },
  {
    name: "title",
    // @ts-expect-error types are wrong
    beforeHighlight: (props, annotations) => {
      if (annotations.length > 0) {
        return { ...props, title: annotations[0].query };
      }
    },
  },
  // twoSlash: {
  //   beforeHighlight: (props, query) => {
  //     const annotations = []
  //     const newCode = ""
  //     return {
  //       ...props,
  //       annotations: [...props.annotations, ...annotations],
  //       code: newCode,
  //     }
  //   },
  //   AnnotationComponent: ({ children, query }) => {},
  // },
];

export function useMDXComponents(components: MDXComponents) {
  return { ...components, pre: Code };
}
