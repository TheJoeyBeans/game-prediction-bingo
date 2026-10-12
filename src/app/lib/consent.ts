export type ConsentChoice = "accepted" | "rejected";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const STORAGE_KEY = "consent-choice";

// The site shows no ads, so ad signals stay denied even after the visitor accepts
const consentSignals = (granted: boolean) => ({
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: granted ? "granted" : "denied",
});

// Runs before any Google tag. Starts denied, or granted for a visitor who already accepted,
// so events fired as a page loads count under the visitor's saved choice
export const CONSENT_DEFAULTS_SCRIPT = `window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments);};(function(){var accepted=false;try{accepted=localStorage.getItem(${JSON.stringify(
  STORAGE_KEY
)})==="accepted";}catch(e){}gtag('consent','default',accepted?${JSON.stringify(
  consentSignals(true)
)}:${JSON.stringify(consentSignals(false))});})();`;

export const grantGoogleConsent = () => {
  window.gtag?.("consent", "update", consentSignals(true));
};

// Storage can be unavailable (private browsing, blocked site data); treat that as "not answered"
export const readChoice = (): ConsentChoice | null => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "accepted" || value === "rejected" ? value : null;
  } catch {
    return null;
  }
};

export const saveChoice = (choice: ConsentChoice) => {
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // The choice still applies for this page view
  }
};

const GOOGLE_COOKIE = /^(_ga|_gid|_gat)/;

// Remove first-party Google cookies when consent is withdrawn
export const clearGoogleCookies = () => {
  const host = window.location.hostname;
  const rootDomain = host.split(".").slice(-2).join(".");
  const domains = ["", host, `.${host}`, `.${rootDomain}`];

  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0].trim();
    if (!GOOGLE_COOKIE.test(name)) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
};
