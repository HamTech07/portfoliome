export function sceneQuality(compact) {
  return compact
    ? { dpr: 1, fps: 30, knotSegments: 96, tubeSegments: 12, ringSegments: 64, particles: 80 }
    : { dpr: 1.25, fps: 60, knotSegments: 128, tubeSegments: 16, ringSegments: 96, particles: 160 };
}

// Demand rendering must not keep a background RAF alive after leaving the hero.
export function startFrameLoop(invalidate, fps, environment = globalThis) {
  const interval = 1000 / fps;
  let previous;
  let frame;
  let stopped = false;
  const tick = (timestamp) => {
    if (stopped) return;
    if (previous === undefined || timestamp - previous >= interval - 0.5) {
      const overshoot = previous === undefined ? 0 : Math.max(0, timestamp - previous - interval) % interval;
      previous = timestamp - overshoot;
      invalidate();
    }
    frame = environment.requestAnimationFrame(tick);
  };
  frame = environment.requestAnimationFrame(tick);
  return () => {
    stopped = true;
    environment.cancelAnimationFrame(frame);
  };
}

export function observeSceneActivity(element, onChange, environment = globalThis) {
  const { document } = environment;
  let inView = false;
  let scrolling = false;
  let resumeTimer;
  let previous;
  const publish = () => {
    const active = inView && document.visibilityState === "visible" && !scrolling;
    if (active !== previous) {
      previous = active;
      onChange(active);
    }
  };
  const observer = new environment.IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    publish();
  }, { threshold: 0 });
  const onScroll = () => {
    if (!inView || document.visibilityState !== "visible") return;
    scrolling = true;
    publish();
    environment.clearTimeout(resumeTimer);
    resumeTimer = environment.setTimeout(() => {
      scrolling = false;
      publish();
    }, 150);
  };
  observer.observe(element);
  document.addEventListener("visibilitychange", publish);
  environment.addEventListener("scroll", onScroll, { passive: true });
  publish();
  return () => {
    observer.disconnect();
    document.removeEventListener("visibilitychange", publish);
    environment.removeEventListener("scroll", onScroll);
    environment.clearTimeout(resumeTimer);
  };
}
