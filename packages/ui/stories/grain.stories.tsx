import type { Meta, StoryObj } from "@storybook/react";

import { Grain } from "../src/grain";

const meta = {
  title: "Example/Grain",
  component: Grain,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof Grain>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Defaut: Story = {
  args: {
    children: "Grain",
  },
};
