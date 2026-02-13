import { Button } from "../Button";

export default {
  title: "UI/Button",
  component: Button
};

export const Primary = {
  args: { children: "Primary", variant: "primary" }
};

export const Secondary = {
  args: { children: "Secondary", variant: "secondary" }
};

export const Ghost = {
  args: { children: "Ghost", variant: "ghost" }
};
