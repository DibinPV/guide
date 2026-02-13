import { Card } from "../Card";

export default {
  title: "UI/Card",
  component: Card
};

export const Default = {
  render: () => (
    <Card>
      <h3 className="text-h3">Card Title</h3>
      <p className="text-sm text-muted">Some supporting text.</p>
    </Card>
  )
};
