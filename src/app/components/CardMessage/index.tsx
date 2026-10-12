import type { CSSProperties, ReactNode } from "react";
import Backdrop from "../ui/Backdrop";
import Wordmark from "../ui/Wordmark";
import { THEMES } from "../../lib/constants";

// Full-page message for card links that can't be shown, such as expired or unreachable cards
const CardMessage = ({
  title,
  children,
  actions,
}: {
  title: string;
  children: ReactNode;
  actions: ReactNode;
}) => (
  <div
    className="relative flex min-h-dvh flex-col"
    style={{ "--event": THEMES.classicBingo.accentColor } as CSSProperties}
  >
    <Backdrop />

    <header className="mx-auto flex w-full max-w-7xl items-center px-4 py-5 sm:px-6 lg:px-8">
      <Wordmark className="text-lg" />
    </header>

    <main className="flex flex-1 items-center justify-center px-4 pb-16">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-base text-mist-300">{children}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {actions}
        </div>
      </div>
    </main>
  </div>
);

export default CardMessage;
