"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { deriveGatewayPose } from "@/lib/gateway/choreography";
import { deriveDestinationInteraction } from "@/lib/gateway/briefing";
import { getLiteFrame, type LiteFrame } from "@/lib/gateway/lite";
import type { GatewayDivision } from "@/lib/gateway/state";
import { GatewayLiteCanvas } from "./GatewayLiteCanvas";

const SEEN_KEY = "bmpGatewayLiteSeen";

export function GatewayLite() {
  // SSR has no presentation gate. The permanent HTML selector is always usable.
  const [frame, setFrame] = useState<LiteFrame>({ stage: "selector", progress: 1 });
  const [profile, setProfile] = useState({ mobile: false, reducedMotion: true });
  const [preview, setPreview] = useState<GatewayDivision | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const hero = host?.closest<HTMLElement>(".gl-hero");
    if (!hero) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = matchMedia("(pointer: coarse)");
    let returning = false;
    try { returning = localStorage.getItem(SEEN_KEY) === "1"; localStorage.setItem(SEEN_KEY, "1"); } catch { /* Navigation never requires storage. */ }
    let raf = 0;
    let done = false;
    const started = performance.now();
    const finish = () => {
      done = true;
      cancelAnimationFrame(raf);
      setFrame({ stage: "selector", progress: 1 });
    };
    const updateProfile = () => {
      setProfile({ mobile: coarse.matches || innerWidth < 640, reducedMotion: reduced.matches });
      if (reduced.matches) finish();
    };
    const tick = (now: number) => {
      const next = getLiteFrame(now - started, { mobile: coarse.matches || innerWidth < 640, reducedMotion: reduced.matches, returning });
      setFrame(next);
      if (next.stage === "selector") done = true;
      if (!done) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(now => { updateProfile(); if (!done) tick(now); });
    const onVisibility = () => { if (document.hidden) finish(); };
    const intersection = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) finish(); });
    intersection.observe(hero);
    const onClick = (event: Event) => {
      const link = event.target instanceof Element ? event.target.closest("a") : null;
      if (link) finish(); // No preventDefault, router gate or delayed navigation.
    };
    const onPreview = (event: Event) => {
      if (event.type === "pointerover" && coarse.matches) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-world]") : null;
      const world = link?.dataset.world;
      const next = world === "visuals" || world === "creator" || world === "technical" ? world : null;
      setPreview(next);
      if (next) hero.dataset.activeWorld = next;
      else delete hero.dataset.activeWorld;
    };
    const clearPreview = () => {
      setPreview(null);
      delete hero.dataset.activeWorld;
    };
    hero.addEventListener("click", onClick);
    hero.addEventListener("pointerover", onPreview);
    hero.addEventListener("focusin", onPreview);
    hero.addEventListener("pointerleave", clearPreview);
    hero.addEventListener("focusout", clearPreview);
    document.addEventListener("visibilitychange", onVisibility);
    reduced.addEventListener("change", updateProfile);
    coarse.addEventListener("change", updateProfile);
    return () => {
      cancelAnimationFrame(raf);
      intersection.disconnect();
      hero.removeEventListener("click", onClick);
      hero.removeEventListener("pointerover", onPreview);
      hero.removeEventListener("focusin", onPreview);
      hero.removeEventListener("pointerleave", clearPreview);
      hero.removeEventListener("focusout", clearPreview);
      document.removeEventListener("visibilitychange", onVisibility);
      reduced.removeEventListener("change", updateProfile);
      coarse.removeEventListener("change", updateProfile);
    };
  }, []);

  const pose = useMemo(() => deriveGatewayPose({
    travelProgress: frame.progress,
    briefingProgress: 0,
    exitProgress: 0,
    selectedDivision: null,
    interactions: deriveDestinationInteraction({ previewDivision: preview, selectedDivision: null, briefingProgress: 0 }),
    reducedMotion: profile.reducedMotion,
    coarsePointer: profile.mobile,
  }), [frame.progress, preview, profile]);

  return (
    <div ref={hostRef} className="gl-presentation" data-stage={frame.stage} aria-hidden="true">
      <GatewayLiteCanvas pose={pose} mobile={profile.mobile} />
      <div className="gl-signature"><span>BMP</span><span>CREATIVE × TECHNOLOGY × PRODUCTS</span></div>
    </div>
  );
}
