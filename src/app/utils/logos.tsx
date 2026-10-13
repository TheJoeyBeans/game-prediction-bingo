import type { StaticImageData } from "next/image";
import type { ThemeKey } from "../lib/constants";
import nintendoLogo from "../../../public/nintendo_direct_logo.svg";
import playstationLogo from "../../../public/state_of_play.png";
import xboxLogo from "../../../public/xbox-game-studios.png";
import gameAwardsLogo from "../../../public/the-game-awards-logo.png";

interface PlatformLogo {
  image: StaticImageData;
  // Logos with their own background fill the frame instead of sitting on white
  hasBackground?: boolean;
}

// Any size or shape works: the card scales logos to fit its header
export const PLATFORM_LOGOS: Partial<Record<ThemeKey, PlatformLogo>> = {
  nintendoDirect: { image: nintendoLogo },
  playstationStateOfPlay: { image: playstationLogo },
  xbox: { image: xboxLogo },
  gameAwards: { image: gameAwardsLogo, hasBackground: true },
};
