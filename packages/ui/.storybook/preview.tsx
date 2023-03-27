import type { Preview } from "@storybook/react";
import React from "react";

import "../src/colors";
import "../src/globals.css";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  globalTypes: {
    scheme: {
      name: "Scheme",
      description: "Select a color scheme",
      defaultValue: "all",
      toolbar: {
        icon: "mirror",
        items: ["all", "light", "dark"],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const { scheme } = context.globals;
      if (scheme === "light") {
        return (
          <div className="grid w-full h-full p-12 place-items-center bg-slate2">
            <Story />
          </div>
        );
      }
      if (scheme === "dark") {
        return (
          <div className="grid w-full h-full p-12 place-items-center dark bg-slate2">
            <Story />
          </div>
        );
      }
      return (
        <div className="grid w-full h-full grid-cols-2">
          <div className="grid p-12 place-items-center bg-slate2">
            <Story />
          </div>
          <div className="grid p-12 place-items-center dark bg-slate2">
            <Story />
          </div>
        </div>
      );
    },
  ],
};

export default preview;
