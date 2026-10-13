import { notFound } from "next/navigation";
import CardMaker from "../components/CardMaker";
import EventContent from "../components/EventContent";
import { EVENTS, getEvent } from "../lib/events";

// One static page per event, built at deploy time; any other top-level path is a 404
export const dynamicParams = false;

export const generateStaticParams = () =>
  EVENTS.map((event) => ({ event: event.slug }));

export default async function EventPage({
  params,
}: {
  params: Promise<{ event: string }>;
}) {
  const event = getEvent((await params).event);
  if (!event) notFound();

  return (
    <CardMaker
      heading={event.heading}
      intro={event.intro}
      initialThemeKey={event.themeKey}
      starter={{ eventName: event.name, predictions: event.starterPredictions }}
    >
      <EventContent event={event} />
    </CardMaker>
  );
}
