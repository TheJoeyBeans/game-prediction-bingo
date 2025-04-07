"use client";

import { useState, useEffect } from "react";
import { GoogleTagManager } from "@next/third-parties/google";
import Cookies from "js-cookie";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID as string;

const CookieConsent = () => {
  const [cookieState, setCookieState] = useState("not-answered");

  useEffect(() => {
    const state = Cookies.get("cookie-consent-state");
    if (state) setCookieState(state);
  }, []);

  const handleConsent = (state: string) => {
    Cookies.set("cookie-consent-state", state, { expires: 365 });
    setCookieState(state);
  };

  if (cookieState === "accepted") {
    return <GoogleTagManager gtmId={GTM_ID} />;
  }

  if (cookieState === "rejected") {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 shadow-lg rounded-xl p-4 w-full text-center max-w-md z-50">
      <p className="text-sm text-gray-700 mb-3">
        We use cookies to improve your experience. Do you accept?
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => handleConsent("accepted")}
          className="w-full px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
        >
          Accept
        </button>
        <button
          onClick={() => handleConsent("rejected")}
          className="w-full px-4 py-2 text-sm font-medium bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition curisor-pointer"
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
