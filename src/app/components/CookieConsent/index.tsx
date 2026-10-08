"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Script from "next/script";
import { GoogleTagManager } from "@next/third-parties/google";
import Button from "../ui/Button";
import {
  clearGoogleCookies,
  grantGoogleConsent,
  readChoice,
  saveChoice,
  type ConsentChoice,
} from "../../lib/consent";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const ADSENSE_SRC =
  "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9515363363004095";

const ConsentContext = createContext({ openCookieSettings: () => {} });

export const useConsent = () => useContext(ConsentContext);

// Google Tag Manager and AdSense load only after the visitor accepts
const CookieConsent = ({ children }: { children: ReactNode }) => {
  const [choice, setChoice] = useState<ConsentChoice | null>(null);
  const [bannerOpen, setBannerOpen] = useState(false);

  useEffect(() => {
    const saved = readChoice();
    if (saved === "accepted") grantGoogleConsent();
    setChoice(saved);
    setBannerOpen(saved === null);
  }, []);

  const handleChoice = (next: ConsentChoice) => {
    saveChoice(next);
    setBannerOpen(false);

    if (choice === "accepted" && next === "rejected") {
      // Loaded scripts can't be unloaded, so clear their cookies and start a fresh page
      clearGoogleCookies();
      window.location.reload();
      return;
    }

    if (next === "accepted") grantGoogleConsent();
    setChoice(next);
  };

  return (
    <ConsentContext.Provider
      value={{ openCookieSettings: () => setBannerOpen(true) }}
    >
      {children}

      {choice === "accepted" && (
        <>
          {GTM_ID && <GoogleTagManager gtmId={GTM_ID} />}
          <Script src={ADSENSE_SRC} crossOrigin="anonymous" />
        </>
      )}

      {bannerOpen && (
        <div
          role="dialog"
          aria-label="Cookie consent"
          className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 rounded-2xl bg-ink-800/95 p-4 shadow-2xl ring-1 ring-white/10 backdrop-blur sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:p-5"
        >
          <p className="mb-4 text-sm text-mist-300">
            We&apos;d like to use cookies for analytics and to show personalized
            ads. Nothing loads unless you accept, and you can change your choice
            anytime from &ldquo;Cookie settings&rdquo; on the home page.
          </p>
          <div className="flex gap-2">
            {/* Equal weight for both choices; the current one is highlighted when reopened */}
            {(["accepted", "rejected"] as const).map((option) => (
              <Button
                key={option}
                variant={choice === option ? "primary" : "secondary"}
                className="w-full"
                onClick={() => handleChoice(option)}
              >
                {option === "accepted" ? "Accept" : "Reject"}
              </Button>
            ))}
          </div>
        </div>
      )}
    </ConsentContext.Provider>
  );
};

export default CookieConsent;
