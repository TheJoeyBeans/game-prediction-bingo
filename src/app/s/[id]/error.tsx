"use client";

import { startTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CardMessage from "../../components/CardMessage";
import Button, { buttonStyles } from "../../components/ui/Button";

// Shown when the card can't be loaded (e.g. the database is unreachable), never for expired cards
export default function CardError({ reset }: { reset: () => void }) {
  const router = useRouter();

  // Refetch on the server, then re-render this segment
  const handleRetry = () =>
    startTransition(() => {
      router.refresh();
      reset();
    });

  return (
    <CardMessage
      title="We couldn't load this card"
      actions={
        <>
          <Button variant="primary" size="lg" onClick={handleRetry}>
            Try again
          </Button>
          <Link href="/" className={buttonStyles("secondary", "lg")}>
            Make a new card
          </Link>
        </>
      }
    >
      Something went wrong on our end, not with your link. Try again in a
      minute.
    </CardMessage>
  );
}
