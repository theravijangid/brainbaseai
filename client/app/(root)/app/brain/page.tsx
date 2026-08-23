import { BrainPage } from "./brain-client";

export const metadata = {
  title: "Company Brain — BrainbaseAI",
  description: "Ask questions against your company knowledge with citations.",
};

export default function RoutePage(props: any) {
  return <BrainPage {...props} />;
}
