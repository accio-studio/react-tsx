import { FwooshOptions } from "fwoosh";
import path from "path";

import ActionsPanelPlugin from "@fwoosh/panel-actions/plugin";
import DesignsPanel from "@fwoosh/panel-designs";
import PropsPanelPlugin from "@fwoosh/panel-props";
import SourcePanelPlugin from "@fwoosh/panel-source";
import ReactPlugin, { Story, StoryMeta as ReactStoryMeta } from "@fwoosh/react";
import MeasurePanelPlugin from "@fwoosh/tool-measure";
import ViewportTool from "@fwoosh/tool-viewport";
import ZoomPanelPlugin from "@fwoosh/tool-zoom";

export const config = {
  title: "@accio-ui/ui",
  syntaxTheme: "poimandres",
  setup: path.resolve("./config/fwoosh-setup.ts"),
  theme: path.resolve("./config/fwoosh-theme.ts"),
  componentOverrides: path.resolve("./config/fwoosh-overrides.tsx"),
  stories: ["stories/*.stories.(mdx|tsx)"],
  docgen: {
    include: ["**/src/**/*.{ts,tsx}"],
  },
  plugins: [
    new DesignsPanel({ hideWithoutParams: true }),
    new PropsPanelPlugin(),
    new SourcePanelPlugin(),
    new ActionsPanelPlugin(),
    new ZoomPanelPlugin(),
    new MeasurePanelPlugin(),
    new ViewportTool(),
    new ReactPlugin({
      docgenOptions: {
        propFilter: (prop) => {
          return prop.parent
            ? !(prop.parent.fileName.includes("@types/react") || prop.parent.fileName.includes("@emotion"))
            : true;
        },
      },
    }),
  ],
} satisfies FwooshOptions;

declare global {
  type ReactMeta = ReactStoryMeta<typeof config>;
  type ReactStory = Story<ReactMeta>;
}
