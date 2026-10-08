import type { StaticImageData } from "next/image";
import type { ThemeKey } from "../lib/constants";
import nintendoLogo from "../../../public/nintendo_direct_logo.svg";
import playstationLogo from "../../../public/state_of_play.png";
import xboxLogo from "../../../public/xbox-game-studios.png";

// Any size or shape works: the card scales logos to fit its header
export const PLATFORM_LOGOS: Partial<Record<ThemeKey, StaticImageData>> = {
  nintendoDirect: nintendoLogo,
  playstationStateOfPlay: playstationLogo,
  xbox: xboxLogo,
};
