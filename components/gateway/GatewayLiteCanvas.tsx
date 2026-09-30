"use client";

import { useEffect, useRef } from "react";
import type { GatewayPose } from "@/lib/gateway/choreography";
import type { GatewaySceneController } from "@/lib/gateway/scene";
import { LITE_TIMING, shouldRenderLite } from "@/lib/gateway/lite";

export function GatewayLiteCanvas({ pose, mobile }: { pose: GatewayPose; mobile: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef(pose);
  const mobileRef = useRef(mobile);
  const invalidateRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    poseRef.current = pose;
    mobileRef.current = mobile;
    invalidateRef.current();
  }, [pose, mobile]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = canvas?.closest<HTMLElement>(".gl-hero");
    if (!canvas || !hero) return;
    let controller: GatewaySceneController | null = null;
    let disposed = false;
    let loading = false;
    let visible = false;
    let dirty = true;
    let frame = 0;
    let previous = 0;
    let settlingUntil = 0;
    let renders = 0;
    let width = 0;
    let height = 0;
    let dpr = 0;

    const schedule = () => {
      if (!disposed && controller && visible && !document.hidden && !frame) frame = requestAnimationFrame(render);
    };
    const invalidate = () => {
      dirty = true;
      settlingUntil = performance.now() + (poseRef.current.reducedMotion ? 0 : LITE_TIMING.feedback);
      schedule();
    };
    const render = (now: number) => {
      frame = 0;
      if (disposed || !controller || !shouldRenderLite({ visible, hidden: document.hidden, dirty, settlingUntil, now, reducedMotion: poseRef.current.reducedMotion })) return;
      const bounds = canvas.getBoundingClientRect();
      const nextDpr = Math.min(devicePixelRatio || 1, mobileRef.current ? 1.25 : 1.5);
      if (bounds.width !== width || bounds.height !== height || nextDpr !== dpr) {
        width = bounds.width; height = bounds.height; dpr = nextDpr;
        controller.resize(width, height, dpr);
      }
      try {
        controller.setTarget(poseRef.current);
        controller.tick(previous ? Math.min(0.05, (now - previous) / 1000) : 1 / 60);
        controller.render();
        canvas.dataset.ready = "true";
        canvas.dataset.renderCount = String(++renders);
        previous = now;
        dirty = false;
      } catch {
        controller.dispose(); controller = null;
        canvas.dataset.ready = "false";
        return; // Static HTML and navigation remain intact.
      }
      if (shouldRenderLite({ visible, hidden: document.hidden, dirty, settlingUntil, now, reducedMotion: poseRef.current.reducedMotion })) schedule();
    };
    const load = async () => {
      if (loading || controller || disposed || !visible || document.hidden) return;
      loading = true;
      try {
        const { createGatewayScene } = await import("@/lib/gateway/scene");
        if (disposed) return;
        controller = createGatewayScene(canvas, invalidate);
        invalidate();
      } catch {
        canvas.dataset.ready = "false";
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) { void load(); invalidate(); }
      else { cancelAnimationFrame(frame); frame = 0; }
    });
    observer.observe(hero);
    const resize = new ResizeObserver(invalidate);
    resize.observe(canvas);
    const onVisibility = () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
      else { previous = 0; void load(); invalidate(); }
    };
    const onPointer = (event: PointerEvent) => {
      if (!visible || mobileRef.current || poseRef.current.reducedMotion || !controller) return;
      const rect = canvas.getBoundingClientRect();
      controller.setPointer?.(((event.clientX - rect.left) / rect.width) * 2 - 1, 1 - ((event.clientY - rect.top) / rect.height) * 2);
      invalidate();
    };
    invalidateRef.current = invalidate;
    document.addEventListener("visibilitychange", onVisibility);
    hero.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect(); resize.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      hero.removeEventListener("pointermove", onPointer);
      invalidateRef.current = () => undefined;
      controller?.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="gl-canvas" aria-hidden="true" tabIndex={-1} />;
}
