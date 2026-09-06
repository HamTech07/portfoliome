import { ArrowLeft, ArrowRight, Hand, Link2, Pause, Play, RotateCcw } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Fragment, useEffect, useRef, useState } from "react";
import { techStack } from "../data/portfolio";
import { observeSceneActivity } from "../lib/scene-performance";
import { createOrbitController, orbitLayout } from "../lib/stack-orbit";

const layout = orbitLayout(techStack.length);

function BrandLogo({ technology }) {
  return (
    <img
      src={"/logos/" + technology.logo + ".svg"}
      alt=""
      width={technology.wide ? 104 : 40}
      height="40"
      loading="lazy"
      decoding="async"
      draggable="false"
      className={technology.wide ? "brand-logo brand-logo-wide" : "brand-logo"}
    />
  );
}

export default function WorkingStack() {
  const section = useRef(null);
  const rotor = useRef(null);
  const controller = useRef(null);
  const drag = useRef(null);
  const dragFrame = useRef(null);
  const [active, setActive] = useState(false);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  const playing = active && !paused && !reducedMotion;

  useEffect(() => {
    const orbit = createOrbitController(rotor.current);
    controller.current = orbit;
    return () => {
      orbit.dispose();
      controller.current = null;
      cancelAnimationFrame(dragFrame.current);
    };
  }, []);

  useEffect(() => observeSceneActivity(section.current, setActive), []);

  useEffect(() => {
    if (playing) controller.current?.play();
    else controller.current?.pause();
  }, [playing]);

  const rotate = (direction) => {
    if (reducedMotion) {
      controller.current?.rotateBy(direction * layout.step);
      return;
    }
    controller.current?.stepBy(direction * layout.step, () => {
      if (playing) controller.current?.play();
    });
  };

  const endDrag = (event) => {
    if (!drag.current || event.pointerId !== drag.current.id) return;
    const shouldResume = drag.current.dragging && drag.current.resume;
    if (drag.current.next !== undefined) controller.current?.setAngle(drag.current.next);
    drag.current = null;
    cancelAnimationFrame(dragFrame.current);
    dragFrame.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    event.currentTarget.classList.remove("is-dragging");
    if (shouldResume) controller.current?.play();
  };

  return (
    <section ref={section} className="working-stack mt-10" aria-labelledby="working-stack-title">
      <div className="working-stack-header">
        <div>
          <span className="card-eyebrow"><Link2 size={14} /> Connected toolkit</span>
          <h3 id="working-stack-title">Working stack<span>.</span></h3>
          <p>One connected stack. Endless ways to build.</p>
        </div>
        <div className="orbit-controls" aria-label="Working stack rotation controls">
          <button type="button" onClick={() => rotate(1)} aria-label="Rotate stack left"><ArrowLeft size={17} /></button>
          <button type="button" className="orbit-play" onClick={() => setPaused((value) => !value)} disabled={Boolean(reducedMotion)} aria-label={paused ? "Resume automatic stack rotation" : "Pause automatic stack rotation"} aria-pressed={paused}>
            {paused || reducedMotion ? <Play size={15} /> : <Pause size={15} />}
            <span>{reducedMotion ? "Motion reduced" : paused ? "Resume" : "Pause"}</span>
          </button>
          <button type="button" onClick={() => rotate(-1)} aria-label="Rotate stack right"><ArrowRight size={17} /></button>
          <button type="button" onClick={() => { controller.current?.setAngle(0); if (playing) controller.current?.play(); }} aria-label="Reset stack rotation"><RotateCcw size={16} /></button>
        </div>
      </div>

      <div
        className="orbit-stage"
        tabIndex={0}
        role="group"
        aria-label="Interactive 360-degree working stack"
        aria-describedby="orbit-instructions"
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            rotate(event.key === "ArrowLeft" ? 1 : -1);
          } else if (event.key === "Home") {
            event.preventDefault();
            controller.current?.setAngle(0);
            if (playing) controller.current?.play();
          }
        }}
        onPointerDown={(event) => {
          if (!event.isPrimary || event.button !== 0) return;
          drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, angle: controller.current?.getAngle() ?? 0, resume: playing, dragging: false };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const current = drag.current;
          if (!current || current.id !== event.pointerId) return;
          const dx = event.clientX - current.x;
          if (Math.abs(dx) < 5 || Math.abs(dx) < Math.abs(event.clientY - current.y)) return;
          if (!current.dragging) {
            current.dragging = true;
            controller.current?.pause();
            current.angle = controller.current?.getAngle() ?? current.angle;
          }
          current.next = current.angle + dx * 0.32;
          event.currentTarget.classList.add("is-dragging");
          if (dragFrame.current !== null) return;
          dragFrame.current = requestAnimationFrame(() => {
            if (drag.current?.next !== undefined) controller.current?.setAngle(drag.current.next);
            dragFrame.current = null;
          });
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
      >
        <div className="orbit-plane" aria-hidden="true">
          <div ref={rotor} className="orbit-rotor">
            {techStack.map((technology, index) => (
              <Fragment key={technology.name}>
                <div className="orbit-chain" style={{
                  "--link-width": layout.chord,
                  "--link-depth": layout.depth,
                  transform: "rotateY(" + ((index + 0.5) * layout.step) + "deg) translateZ(calc(var(--orbit-radius) * var(--link-depth)))",
                }} />
                <div className="orbit-node" style={{ transform: "rotateY(" + (index * layout.step) + "deg) translateZ(var(--orbit-radius))" }}>
                  <div className="orbit-logo-pad"><BrandLogo technology={technology} /></div>
                  <strong>{technology.name}</strong>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
        <div className="orbit-center-note" aria-hidden="true"><span>360°</span> Built to connect</div>
      </div>

      <div className="orbit-footer">
        <p id="orbit-instructions"><Hand size={15} /> Drag or swipe horizontally · ← → keys rotate · Home resets</p>
        <span className="orbit-status"><i className={playing ? "is-live" : ""} />{playing ? "Live rotation" : "Rotation paused"}</span>
      </div>

      <details className="stack-directory">
        <summary>Explore all {techStack.length} technologies</summary>
        <div className="stack-directory-grid">
          {techStack.map((technology) => (
            <motion.div key={technology.name} whileHover={{ scale: 1.02 }} className="stack-directory-item">
              <div className="directory-logo"><BrandLogo technology={technology} /></div>
              <div><strong>{technology.name}</strong><span>{technology.category}</span></div>
            </motion.div>
          ))}
        </div>
      </details>
    </section>
  );
}
