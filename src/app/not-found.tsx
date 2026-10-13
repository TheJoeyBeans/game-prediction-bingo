import Link from "next/link";
import CardMessage from "./components/CardMessage";
import { buttonStyles } from "./components/ui/Button";
import { ArrowRightIcon } from "./components/ui/icons";

export default function NotFound() {
  return (
    <CardMessage
      title="Page not found"
      actions={
        <Link href="/" className={buttonStyles("primary", "lg")}>
          Make a bingo card <ArrowRightIcon />
        </Link>
      }
    >
      This page doesn&apos;t exist, but you can still make a card for the next
      showcase.
    </CardMessage>
  );
}
