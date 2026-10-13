import { EVENTS, getEvent } from "../lib/events";
import { OG_SIZE, renderOgImage } from "../lib/ogImage";

export const alt = "Prediction bingo card maker";
export const size = OG_SIZE;
export const contentType = "image/png";

// Built once per event at deploy time
export const generateStaticParams = () =>
  EVENTS.map((event) => ({ event: event.slug }));

export default function Image({ params }: { params: { event: string } }) {
  const event = getEvent(params.event);
  return renderOgImage({
    title: event ? `${event.name} Bingo` : "Video Game Bingo",
    subtitle: "Make a prediction bingo card and play along live",
    themeKey: event?.themeKey ?? "classicBingo",
  });
}
