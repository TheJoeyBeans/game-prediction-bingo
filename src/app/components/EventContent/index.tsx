import EventLinks from "../EventLinks";
import type { ShowcaseEvent } from "../../lib/events";

const headingStyles =
  "font-display text-2xl font-bold tracking-tight text-mist-100 sm:text-3xl";

// Written content under an event's card maker: how to play, what to expect, FAQ and related events
const EventContent = ({ event }: { event: ShowcaseEvent }) => (
  <>
    <article className="mt-16 max-w-3xl space-y-12 sm:mt-24">
      {event.sections.map((section) => (
        <section key={section.heading}>
          <h2 className={headingStyles}>{section.heading}</h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-mist-300">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      ))}

      <section>
        <h2 className={headingStyles}>{event.name} bingo FAQ</h2>
        <dl className="mt-4 divide-y divide-white/10 border-y border-white/10">
          {event.faq.map((item) => (
            <div key={item.question} className="py-5">
              <dt className="font-semibold text-mist-100">{item.question}</dt>
              <dd className="mt-2 leading-relaxed text-mist-300">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </article>

    <section className="mt-16 sm:mt-24">
      <h2 className={headingStyles}>More showcase bingo</h2>
      <div className="mt-6">
        <EventLinks exclude={event.slug} />
      </div>
    </section>
  </>
);

export default EventContent;
