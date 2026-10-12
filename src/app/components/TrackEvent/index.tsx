"use client";

import { useEffect, useRef } from "react";
import { sendGTMEvent } from "@next/third-parties/google";

// Sends one analytics event when a page mounts, so server-rendered pages can report views
const TrackEvent = ({
  event,
  params,
}: {
  event: string;
  params?: Record<string, string | number | boolean>;
}) => {
  // Dev mode runs effects twice; only report once
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    sendGTMEvent({ event, ...params });
  }, [event, params]);

  return null;
};

export default TrackEvent;
