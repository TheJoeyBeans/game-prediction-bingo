import EventLinks from "../EventLinks";
import type { ShowcaseEvent } from "../../lib/events";

// Under an event's card maker: links to the other events, then a collapsed About section.
// Search engines still read collapsed text, so it helps the page rank without getting in the way
const EventContent = ({ event }: { event: ShowcaseEvent }) => (
  <>
    <section className="mt-16 sm:mt-24">
      <h2 className="font-display text-2xl font-bold tracking-tight text-mist-100 sm:text-3xl">
        More showcase bingo
      </h2>
      <div className="mt-6">
        <EventLinks exclude={event.slug} />
      </div>
    </section>

    <details className="group mt-12 max-w-3xl rounded-2xl bg-ink-900/80 ring-1 ring-inset ring-veil/10">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 font-display font-semibold text-mist-100 sm:p-5 [&::-webkit-details-marker]:hidden">
        About {event.name} bingo
        <span
          aria-hidden="true"
          className="text-xl leading-none text-mist-500 transition-transform duration-150 group-open:rotate-45"
        >
          +
        </span>
      </summary>

      <div className="space-y-6 px-4 pb-5 sm:px-5">
        <div className="space-y-4 leading-relaxed text-mist-300">
          {event.about.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <dl className="divide-y divide-veil/10 border-t border-veil/10">
          {event.faq.map((item) => (
            <div key={item.question} className="py-4">
              <dt className="font-semibold text-mist-100">{item.question}</dt>
              <dd className="mt-1.5 leading-relaxed text-mist-300">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </details>
  </>
);

export default EventContent;
