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
