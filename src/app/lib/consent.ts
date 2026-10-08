export type ConsentChoice = "accepted" | "rejected";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const STORAGE_KEY = "consent-choice";

const consentSignals = (granted: boolean) => {
  const value = granted ? "granted" : "denied";
  return {
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
    analytics_storage: value,
  };
};

// Runs before any Google tag so Consent Mode starts as "denied" everywhere
export const CONSENT_DEFAULTS_SCRIPT = `window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments);};gtag('consent','default',${JSON.stringify(
  consentSignals(false)
)});`;

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

const GOOGLE_COOKIE = /^(_ga|_gid|_gat|_gcl|__gads|__gpi|__eoi|FCNEC)/;

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
