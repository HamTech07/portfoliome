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
  let stepAnimation = null;
  const write = () => { element.style.transform = "rotateY(" + angle + "deg)"; };
  const cancelStep = () => {
    if (!stepAnimation) return;
    stepAnimation.onfinish = null;
    stepAnimation.cancel();
    stepAnimation = null;
    write();
  };
  const pause = () => {
    cancelStep();
    if (!animation) return;
    angle = angleAtTime(angle, animation.currentTime);
    animation.cancel();
    animation = null;
    write();
  };
  return {
    play() {
      if (animation || stepAnimation || typeof element.animate !== "function") return;
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
    stepBy(delta, onComplete) {
      pause();
      const start = angle;
      const end = start + delta;
      angle = normalizeAngle(end);
      if (typeof element.animate !== "function") {
        write();
        onComplete?.();
        return;
      }
      const currentStep = element.animate([
        { transform: "rotateY(" + start + "deg)" },
        { transform: "rotateY(" + end + "deg)" },
      ], { duration: 460, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" });
      stepAnimation = currentStep;
      currentStep.onfinish = () => {
        if (stepAnimation !== currentStep) return;
        stepAnimation = null;
        write();
        onComplete?.();
      };
    },
    dispose: pause,
  };
}
