import { action } from "@fwoosh/panel-actions";
import * as React from "react";

import { Button } from "../src";

export const meta: ReactMeta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    // designs: "https://www.figma.com/file/LKQ4FJ4bTnCSjedbRpk931/Sample-File",
  },
};

/**
 * The default story.
 *
 * Describe you **stories** with the _full power of markdown_!
 *
 * > Even quote things!
 */
export const Playground: ReactStory = () => {
  return (
    <div className="p-24">
      <Button onPress={action("onClick")}>Click me</Button>
    </div>
  );
};

// Playground.parameters = {
//   designs: {
//     spec: "https://www.figma.com/file/LKQ4FJ4bTnCSjedbRpk931/Sample-File?node-id=1%3A2",
//   },
// };
