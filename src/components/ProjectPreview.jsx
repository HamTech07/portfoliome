import { ArrowUpRight, Bot, Check, Globe, Leaf, ScanLine, ShoppingBag, Sparkles, Trophy } from "lucide-react";
import "./project-previews.css";

function BrowserFrame({ project, children, variant = "" }) {
  return <div className={`project-browser preview-${variant}`} aria-hidden="true"><div className="preview-browser-bar"><i /><i /><i /><span>{project.title.toLowerCase().replaceAll(" ", "")} / preview</span></div>{children}</div>;
}

export default function ProjectPreview({ project }) {
  if (project.id === "rock-ai") return (
    <div className="project-device" aria-hidden="true">
      <div className="device-island" />
      <div className="device-topline"><Bot size={13} /> ROCK AI <span>01</span></div>
      <div className="specimen-scan"><div className="mineral-shape" /><ScanLine size={100} /><div className="scan-beam" /></div>
      <strong>A little curiosity.<br />A world to discover.</strong>
      <div className="device-bottom"><span>ROCK DETECTIVE</span><span>↗</span></div>
    </div>
  );
  if (project.id === "techora") return (
    <div className="project-browser" aria-hidden="true">
      <div className="preview-browser-bar"><i /><i /><i /><span>techorapakistan.com</span></div>
      <div className="techora-preview"><span>TECHORA / PAKISTAN</span><Globe size={55} strokeWidth={1} /><strong>Ideas meet<br /><em>possibility.</em></strong><div className="preview-lines"><i /><i /></div><span className="preview-cta">EXPLORE TECHORA ↗</span></div>
    </div>
  );
  if (project.id === "juna") return <BrowserFrame project={project} variant="commerce"><div className="commerce-preview"><header><strong>JUNA.</strong><ShoppingBag size={13} /></header><span>THE EVERYDAY EDIT</span><h4>Good things.<br /><em>Great finds.</em></h4><div className="preview-products"><div><i className="product-bag" /><span>ESSENTIALS</span></div><div><i className="product-bottle" /><span>DAILY PICKS</span></div></div><div className="preview-shopping-footer">Discover the collection <ArrowUpRight size={12} /></div></div></BrowserFrame>;
  if (project.id === "ecourish") return <BrowserFrame project={project} variant="editorial"><div className="editorial-preview"><header><Leaf size={15} /><strong>ECOURISH</strong><span>EXPLORE</span></header><div className="editorial-art"><i /><i /><i /><span>Ideas that<br />keep growing.</span></div><div className="editorial-grid"><span>Discover<br /><b>A fresh perspective.</b></span><ArrowUpRight size={22} /></div></div></BrowserFrame>;
  if (project.id === "besports") return <BrowserFrame project={project} variant="sports"><div className="sports-preview"><header><Trophy size={13} /><strong>BESPORTS / ARENA</strong></header><h4>BUILT FOR<br /><em>THE GAME.</em></h4><div className="preview-court"><i /><Trophy size={29} /></div><div className="sports-fixture"><span>TOURNAMENTS</span><b>PLAY. COMPETE.</b><ArrowUpRight size={13} /></div></div></BrowserFrame>;
  if (project.id === "caloverse") return <div className="caloverse-preview" aria-hidden="true"><div className="nutrition-orbit"><Leaf size={21} /><span>Every day.<br /><b>A little better.</b></span></div><div className="preview-real-phone"><div className="device-island" /><img src="/images/caloverse/daily_progress_dashboard.jpg" alt="" width="520" height="1280" loading="lazy" decoding="async" /></div><span className="nutrition-label">CALOVERSE / NUTRITION</span></div>;
  if (project.id === "ai-agile") return <BrowserFrame project={project} variant="agile"><div className="agile-preview"><header><Sparkles size={13} /><strong>AI AGILE</strong><i /></header><h4>Less busywork.<br /><em>More momentum.</em></h4><div className="preview-chat"><Bot size={15} /><div><i /><i /><i /></div></div><div className="preview-tasks">{["Plan the next move", "Connect the workflow", "Build what matters"].map((item) => <div key={item}><Check size={10} /><span>{item}</span></div>)}</div><div className="preview-prompt">Your next idea starts here <ArrowUpRight size={12} /></div></div></BrowserFrame>;
  return <BrowserFrame project={project} variant="generic"><div className="generic-preview"><Globe size={33} /><span>{project.category}</span><strong>{project.title}</strong><div className="preview-lines"><i /><i /></div><span>EXPLORE PROJECT ↗</span></div></BrowserFrame>;
}
