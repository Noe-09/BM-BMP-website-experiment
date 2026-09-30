export type LiteStage = "signature" | "tunnel" | "selector";
export type LiteOptions = { mobile?: boolean; returning?: boolean; reducedMotion?: boolean; skipped?: boolean };
export type LiteFrame = { stage: LiteStage; progress: number };
export const LITE_TIMING = { signature: 750, desktopTunnel: 1500, mobileTunnel: 1000, feedback: 220 } as const;

export function getLiteFrame(elapsed: number, options: LiteOptions = {}): LiteFrame {
  if (options.returning || options.reducedMotion || options.skipped) return { stage: "selector", progress: 1 };
  const duration = options.mobile ? LITE_TIMING.mobileTunnel : LITE_TIMING.desktopTunnel;
  if (elapsed < LITE_TIMING.signature) return { stage: "signature", progress: options.mobile ? 0.58 : 0.34 };
  if (elapsed >= LITE_TIMING.signature + duration) return { stage: "selector", progress: 1 };
  const t = Math.max(0, (elapsed - LITE_TIMING.signature) / duration);
  const eased = t * t * (3 - 2 * t);
  // One passage-to-emergence movement. Mobile starts closer to emergence.
  const start = options.mobile ? 0.58 : 0.34;
  return { stage: "tunnel", progress: start + (1 - start) * eased };
}

export function shouldRenderLite(input: { visible: boolean; hidden: boolean; dirty: boolean; settlingUntil: number; now: number; reducedMotion: boolean }): boolean {
  return input.visible && !input.hidden && (input.dirty || (!input.reducedMotion && input.now < input.settlingUntil));
}
