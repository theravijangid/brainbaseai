import { AnalyticsPage } from "./analytics-client";

export const metadata = {
  title: "Analytics — BrainbaseAI",
  description: "Conversation volume, knowledge usage and agent performance.",
};

export default function RoutePage(props: any) {
  return <AnalyticsPage {...props} />;
}
