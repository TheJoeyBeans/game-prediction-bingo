import Link from "next/link";
import CardMessage from "../../components/CardMessage";
import { buttonStyles } from "../../components/ui/Button";
import { ArrowRightIcon } from "../../components/ui/icons";

export default function CardNotFound() {
  return (
    <CardMessage
      title="We couldn't find this card"
      actions={
        <Link href="/" className={buttonStyles("primary", "lg")}>
          Make a new card <ArrowRightIcon />
        </Link>
      }
    >
      It may have been removed after a period of inactivity, or the link may be
      mistyped. It only takes a minute to make a new one.
    </CardMessage>
  );
}
