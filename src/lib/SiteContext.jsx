import { createContext, useContext, useEffect, useState } from "react";
import { defaultSite } from "../data/site";

const SiteContext = createContext({ site: defaultSite, setSite: () => {}, connected: false });
export function SiteProvider({ children }) {
  const [site, setSite] = useState(defaultSite);
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch("/api/site", { cache: "no-store" });
        if (!response.ok) throw new Error("Content service unavailable");
        const data = await response.json();
        if (active && data.profile && Array.isArray(data.projects)) { setSite(data); setConnected(true); }
      } catch { if (active) setConnected(false); }
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => { active = false; window.removeEventListener("focus", refresh); };
  }, []);
  useEffect(() => {
    document.title = site.profile.pageTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", site.profile.description);
    document.documentElement.style.setProperty("--site-accent", site.appearance.accent);
    document.documentElement.classList.toggle("motion-disabled", !site.appearance.motion);
  }, [site]);
  return <SiteContext.Provider value={{ site, setSite, connected }}>{children}</SiteContext.Provider>;
}
// This hook intentionally shares the provider's private context.
// oxlint-disable-next-line react/only-export-components
export const useSite = () => useContext(SiteContext);
