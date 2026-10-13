import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CardMaker from "../components/CardMaker";
import EventContent from "../components/EventContent";
import JsonLd from "../components/JsonLd";
import { SITE_URL } from "../lib/constants";
import { EVENTS, getEvent, type ShowcaseEvent } from "../lib/events";

type Params = { params: Promise<{ event: string }> };

// One static page per event, built at deploy time; any other top-level path is a 404
export const dynamicParams = false;

export const generateStaticParams = () =>
  EVENTS.map((event) => ({ event: event.slug }));

// The share image comes from opengraph-image.tsx in this folder
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const event = getEvent((await params).event);
  if (!event) return {};

  const path = `/${event.slug}`;
  return {
    title: event.title,
    description: event.description,
    alternates: { canonical: path },
    openGraph: {
      title: event.title,
      description: event.description,
      url: path,
      siteName: "Video Game Prediction Bingo",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: event.description,
    },
  };
}

const structuredData = (event: ShowcaseEvent) => {
  const url = `${SITE_URL}/${event.slug}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: event.heading,
      url,
      description: event.description,
      applicationCategory: "GameApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: event.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Video Game Bingo", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: `${event.name} Bingo`, item: url },
      ],
    },
  ];
};

export default async function EventPage({ params }: Params) {
  const event = getEvent((await params).event);
  if (!event) notFound();

  return (
    <>
      <JsonLd data={structuredData(event)} />
      <CardMaker
        heading={event.heading}
        intro={event.intro}
        initialThemeKey={event.themeKey}
        starter={{ eventName: event.name, predictions: event.starterPredictions }}
      >
        <EventContent event={event} />
      </CardMaker>
    </>
  );
}
