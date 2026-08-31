export const ORBIT_DURATION = 90000;
export const normalizeAngle = (angle) => ((angle % 360) + 360) % 360;

export function angleAtTime(start, time, duration = ORBIT_DURATION) {
  return normalizeAngle(start - (Number(time ?? 0) / duration) * 360);
}

export function orbitLayout(count) {
  const step = 360 / count;
  return {
    step,
    chord: 2 * Math.sin(Math.PI / count),
    depth: Math.cos(Math.PI / count),
  };
}

// Only one compositor animation: no permanent JS frame loop or React updates.
export function createOrbitController(element) {
  let angle = 0;
  let animation = null;
  const write = () => { element.style.transform = "rotateY(" + angle + "deg)"; };
  const pause = () => {
    if (!animation) return;
    angle = angleAtTime(angle, animation.currentTime);
    animation.cancel();
    animation = null;
    write();
  };
  return {
    play() {
      if (animation || typeof element.animate !== "function") return;
      animation = element.animate([
        { transform: "rotateY(" + angle + "deg)" },
        { transform: "rotateY(" + (angle - 360) + "deg)" },
      ], { duration: ORBIT_DURATION, iterations: Infinity, easing: "linear" });
    },
    pause,
    getAngle() {
      return animation ? angleAtTime(angle, animation.currentTime) : angle;
    },
    setAngle(next) {
      pause();
      angle = normalizeAngle(next);
      write();
    },
    rotateBy(delta) {
      pause();
      angle = normalizeAngle(angle + delta);
      write();
    },
    dispose: pause,
  };
}
