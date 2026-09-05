import { AnimatePresence, motion, useMotionValueEvent, useTransform } from "framer-motion";
import { Code2, Download, Layers3, Smartphone, Workflow } from "lucide-react";
import { useState } from "react";

const phases = ["Arrival", "Unlock", "System reveal", "Ready to ship"];

export default function ScrollStory({ progress, reducedMotion = false, compact = false, style }) {
  const [phase, setPhase] = useState(reducedMotion ? 3 : 0);
  const deviceX = useTransform(progress, [0, 0.2, 0.38, 1], [-280, -60, 0, 28]);
  const deviceY = useTransform(progress, [0, 0.38, 1], [90, 0, -24]);
  const deviceScale = useTransform(progress, [0, 0.38, 1], [0.82, 1, 0.94]);
  const deviceRotate = useTransform(progress, [0, 0.38, 1], [24, 0, -5]);
  const coverRotate = useTransform(progress, [0.2, 0.42, 0.65], [0, -28, -82]);
  const revealOpacity = useTransform(progress, [0.28, 0.44], [0, 1]);
  const screenScale = useTransform(progress, [0.25, 0.58], [0.88, 1]);
  const panelDistance = compact ? 126 : 215;
  const leftX = useTransform(progress, [0.48, 0.78], [0, -panelDistance]);
  const rightX = useTransform(progress, [0.54, 0.84], [0, panelDistance]);
  const panelOpacity = useTransform(progress, [0.45, 0.62], [0, 1]);
  const stageGlow = useTransform(progress, [0.05, 0.45, 1], [0.2, 0.7, 0.42]);

  useMotionValueEvent(progress, "change", (value) => {
    if (reducedMotion) return;
    const next = value < 0.25 ? 0 : value < 0.5 ? 1 : value < 0.78 ? 2 : 3;
    setPhase((current) => current === next ? current : next);
  });

  const settledDevice = { x: 28, y: -24, scale: 0.94, rotateY: -5 };
  const settledCover = { rotateY: -82 };
  const settledReveal = { opacity: 1, scale: 1 };

  return (
    <motion.div className="scroll-story" style={style} aria-hidden="true">
      <motion.div className="story-halo" style={{ opacity: reducedMotion ? 0.42 : stageGlow }} />

      <div className="story-phase">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={phase} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: "easeOut" }}>
            {String(phase + 1).padStart(2, "0")} · {phases[phase]}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="story-stage">
        <motion.div className="story-float story-float-left" style={reducedMotion ? { x: -panelDistance, opacity: 1 } : { x: leftX, opacity: panelOpacity }}>
          <span className="story-float-icon"><Layers3 size={18} /></span>
          <strong>04 shipped projects</strong>
          <small>Web + Android</small>
        </motion.div>

        <motion.div className="story-float story-float-right" style={reducedMotion ? { x: panelDistance, opacity: 1 } : { x: rightX, opacity: panelOpacity }}>
          <span className="story-float-icon"><Workflow size={18} /></span>
          <strong>Connected systems</strong>
          <small>Web · Mobile · AI</small>
        </motion.div>

        <div className="story-device-anchor">
        <motion.div
          className="story-device"
          style={reducedMotion ? settledDevice : { x: deviceX, y: deviceY, scale: deviceScale, rotateY: deviceRotate }}
        >
          <div className="story-device-bar">
            <span className="story-window-dots"><i /><i /><i /></span>
            <span>hamdan.build / production</span>
            <span className="story-online"><i /> online</span>
          </div>

          <motion.div className="story-workspace" style={reducedMotion ? settledReveal : { opacity: revealOpacity, scale: screenScale }}>
            <aside>
              <span className="is-active"><Code2 size={16} /></span>
              <span><Smartphone size={16} /></span>
              <span><Workflow size={16} /></span>
            </aside>
            <div className="story-workspace-main">
              <div className="story-console-label">Latest Android build</div>
              <div className="story-project-row">
                <div><strong>Caloverse</strong><span>Mobile application</span></div>
                <span className="story-apk"><Download size={13} /> APK</span>
              </div>
              <div className="story-signal-grid">
                <div><span>Frontend</span><i><b style={{ width: "88%" }} /></i></div>
                <div><span>Mobile</span><i><b style={{ width: "92%" }} /></i></div>
                <div><span>Automation</span><i><b style={{ width: "76%" }} /></i></div>
              </div>
              <div className="story-code-lines"><i /><i /><i /><i /></div>
            </div>
          </motion.div>

          <motion.div className="story-cover" style={reducedMotion ? settledCover : { rotateY: coverRotate }}>
            <div className="story-cover-mark">H</div>
            <div><strong>Build system</strong><span>Scroll to open</span></div>
            <i className="story-cover-hinge" />
          </motion.div>
        </motion.div>
        </div>
      </div>

      <div className="story-progress" aria-hidden="true">
        {phases.map((label, index) => <i key={label} className={index <= phase ? "is-active" : ""} />)}
      </div>
    </motion.div>
  );
}
