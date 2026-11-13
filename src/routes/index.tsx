import { createFileRoute } from "@tanstack/react-router";
import { getGateStatus, getLoveContent } from "@/lib/love.functions";
import { LoginGate } from "@/components/love/LoginGate";
import { LoveExperience } from "@/components/love/LoveExperience";
import { LoadingHeart } from "@/components/love/LoadingHeart";

export const Route = createFileRoute("/")({
  // Nothing private is fetched until the server confirms the password session.
  loader: async () => {
    const { unlocked } = await getGateStatus();
    if (!unlocked) return { unlocked: false as const };
    const data = await getLoveContent();
    return { unlocked: true as const, ...data };
  },
  head: () => ({
    meta: [
      { title: "A Little World Just For You ❤️" },
      { name: "description", content: "Only someone special can enter this little world." },
      { property: "og:title", content: "A Little World Just For You ❤️" },
      { property: "og:description", content: "Only someone special can enter this little world." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  pendingComponent: () => <LoadingHeart label="Opening your little world…" />,
  component: Index,
});

function Index() {
  const data = Route.useLoaderData();
  if (!data.unlocked) return <LoginGate />;
  return <LoveExperience initial={{ content: data.content, urls: data.urls }} />;
}
