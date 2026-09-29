import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpRight, Check, FileDown, FolderKanban, LayoutDashboard, LogOut, Palette, Plus, Save, Settings, Shield, Trash2, Upload } from "lucide-react";
import { useSite } from "../lib/SiteContext";
import { adminRequest as request, getGoogleClient, googleSignIn, googleSignOut } from "../lib/google-admin";
import AdminAccess, { GoogleAvatar } from "./AdminAccess";
import "./admin-panel.css";

const jsonOptions = (method, data) => ({ method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
const tabs = [["Overview", LayoutDashboard], ["Projects", FolderKanban], ["Website", Settings], ["Appearance", Palette], ["Admin access", Shield]];
const labels = { name: "Full name", brand: "Navigation name", suffix: "Brand suffix", logo: "Logo letter", pageTitle: "Browser page title", portrait: "Profile image URL", title: "Heading", highlight: "Gradient heading", badge: "Availability badge", button: "Main button label", intro: "Introduction", description: "Description", response: "Response time", skills: "Skills heading", skillsDescription: "Skills introduction", projects: "Projects heading", projectsDescription: "Projects introduction", github: "GitHub URL", upwork: "Upwork URL", fiverr: "Fiverr URL", url: "Website URL", downloadUrl: "APK / download URL", image: "Cover image URL", downloadName: "Download filename", liveLabel: "Website button label", challenge: "Challenge", solution: "Approach", role: "Role / tagline", location: "Location label", education: "Education", university: "University", availability: "Opportunities", email: "Email address", category: "Category", domain: "Download badge", eyebrow: "Small heading" };
function Field({ field, value, onChange, type }) {
  const multiline = ["description", "intro", "challenge", "solution", "projectsDescription", "skillsDescription"].includes(field);
  return <label className={multiline ? "admin-field is-wide" : "admin-field"}><span>{labels[field] || field}</span>{multiline ? <textarea value={value || ""} onChange={(event) => onChange(event.target.value)} rows={3} maxLength={4000} /> : <input type={type || "text"} value={value || ""} onChange={(event) => onChange(event.target.value)} maxLength={4000} />}</label>;
}
function UploadField({ label, accept, onUploaded, onError }) {
  const [busy, setBusy] = useState(false);
  return <label className="admin-upload"><Upload size={16} /> {busy ? "Uploading… Please keep this page open" : label}<input type="file" accept={accept} disabled={busy} onChange={async (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    setBusy(true);
    try {
      const maximum = file.name.toLowerCase().endsWith(".apk") ? 160 * 1024 * 1024 : 8 * 1024 * 1024;
      if (file.size > maximum) throw new Error("Images: max 8 MB. APKs: max 160 MB.");
      const result = await request(`upload?name=${encodeURIComponent(file.name)}`, { method: "POST", headers: { "Content-Type": "application/octet-stream" }, body: file });
      onUploaded(result.url, file.name);
    } catch (error) { onError(error.message); }
    finally { setBusy(false); event.target.value = ""; }
  }} /></label>;
}

export default function AdminPanel() {
  const { site, setSite, connected } = useSite();
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const [configured, setConfigured] = useState(false);
  const [draft, setDraft] = useState(null);
  const [tab, setTab] = useState("Overview");
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const dirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(site);
  useEffect(() => {
    let active = true; let subscription; let refreshTimer;
    const refresh = async () => {
      try {
        const client = await getGoogleClient();
        if (!active) return;
        setConfigured(Boolean(client));
        if (!client) { setChecking(false); return; }
        const { data } = await client.auth.getSession();
        const result = await request("session");
        if (!active) return;
        setAuthenticated(result.authenticated); setUser(result.user);
        if (data.session && !result.authenticated) setError("This Google account does not have admin access. Sign out and use the owner account or ask the owner to add you.");
        if (result.authenticated) { setError(""); window.history.replaceState({}, "", "/admin"); }
      } catch (issue) { if (active) setError(issue.message); }
      finally { if (active) setChecking(false); }
    };
    refresh();
    getGoogleClient().then((client) => {
      if (!active || !client) return;
      subscription = client.auth.onAuthStateChange(() => {
        window.clearTimeout(refreshTimer);
        refreshTimer = window.setTimeout(refresh, 0);
      }).data.subscription;
    }).catch(() => {});
    return () => { active = false; window.clearTimeout(refreshTimer); subscription?.unsubscribe(); };
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const data = draft || site;
  const edit = (section, field, value) => { setNotice(""); setDraft((previous) => ({ ...(previous || site), [section]: { ...(previous || site)[section], [field]: value } })); };
  const editProject = (id, field, value) => setDraft((previous) => { const base = previous || site; return { ...base, projects: base.projects.map((item) => item.id === id ? { ...item, [field]: value } : item) }; });
  const project = data.projects.find((item) => item.id === selected);
  const save = async () => {
    setBusy(true); setError(""); setNotice("");
    try { const saved = await request("content", jsonOptions("PUT", data)); setSite(saved); setDraft(null); setNotice("Published. Your website is up to date."); }
    catch (issue) { setError(issue.message); }
    finally { setBusy(false); }
  };
  const addProject = () => {
    const id = `project-${Date.now().toString(36)}`;
    setDraft({ ...data, projects: [...data.projects, { id, number: String(data.projects.length + 1).padStart(2, "0"), title: "New project", category: "Web Experience", description: "", url: "", downloadUrl: "", image: "", tags: [], highlights: [], accent: "cyan", role: "", challenge: "", solution: "", domain: "Android APK", downloadName: "", liveLabel: "Live website" }] });
    setSelected(id); setTab("Projects");
  };
  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "portfolio-content-backup.json"; anchor.click(); URL.revokeObjectURL(url);
  };
  if (!authenticated) return <main className="admin-root admin-login"><div className="admin-login-card"><span className="admin-brandmark"><Shield size={25} /></span><p className="admin-eyebrow">HAMDAN / STUDIO</p><h1>Your website.<br /><em>Your control.</em></h1><p>Use your authorized Google account to manage your portfolio.</p><button className="google-login-button" disabled={busy || checking || !configured} onClick={async () => { setBusy(true); setError(""); try { await googleSignIn(); } catch (issue) { setError(issue.message); setBusy(false); } }}><span className="google-letter">G</span>{checking ? "Checking connection…" : busy ? "Opening Google…" : "Continue with Google"}</button>{!checking && !configured && <div className="admin-error">Google login is ready in the code. Connect the Ham-tech Supabase project and enable its Google provider to activate sign-in.</div>}{error && <p className="admin-error" role="alert">{error}</p>}{configured && <button className="google-switch-account" onClick={async () => { await googleSignOut(); setError(""); setBusy(false); }}>Sign out / switch Google account</button>}<small>Access is restricted to the owner and admins invited by the owner. Password login is disabled.</small><a href="/">← Back to portfolio</a></div></main>;
  return <div className="admin-root admin-layout">
    <aside className="admin-sidebar"><a className="admin-brand" href="/"><span className="admin-brandmark">H</span><span>{data.profile.brand}<small>STUDIO / ADMIN</small></span></a><nav aria-label="Admin navigation">{tabs.map(([name, Icon]) => <button key={name} className={tab === name ? "active" : ""} onClick={() => setTab(name)}><Icon size={18} />{name}</button>)}</nav><div className="admin-sidebar-bottom">{user && <div className="admin-account compact"><GoogleAvatar user={user} /><div><strong>{user.name || user.email}</strong><small>{user.role}</small></div></div>}<span className="admin-server"><i /> {connected ? "Content server connected" : "Content server unavailable"}</span><a href="/" target="_blank" rel="noreferrer">View website <ArrowUpRight size={16} /></a><button onClick={async () => { try { await googleSignOut(); setAuthenticated(false); setUser(null); setDraft(null); } catch (issue) { setError(issue.message); } }}><LogOut size={16} /> Sign out</button></div></aside>
    <main className="admin-workspace"><header className="admin-toolbar"><div><span className="admin-eyebrow">YOUR CREATIVE WORKSPACE</span><h1>{tab}</h1></div><div className="admin-toolbar-actions"><span>{dirty ? "Unsaved changes" : "All changes saved"}</span><button className="admin-primary" disabled={busy || !dirty || !connected} onClick={save}><Save size={16} />{busy ? "Publishing…" : "Publish changes"}</button></div></header>
      {error && <div className="admin-error" role="alert">{error}<button onClick={() => setError("")}>Dismiss</button></div>}{notice && <div className="admin-notice" role="status"><Check size={16} />{notice}</div>}
      {!connected && <p className="admin-error">The content server is unavailable. Start the Node server to manage your website.</p>}
      {tab === "Overview" && <><section className="admin-welcome"><div><span className="admin-eyebrow">MAKE IT YOURS</span><h2>Great work deserves<br /><em>a place to shine.</em></h2><p>Add your next project, refine your story, or give your portfolio a fresh look.</p><button className="admin-primary" onClick={addProject}><Plus size={17} /> Add a project</button></div><div className="admin-orbit" aria-hidden="true"><span>H</span></div></section><div className="admin-stats"><div><FolderKanban /><strong>{data.projects.length}</strong><span>Published projects</span></div><div><FileDown /><strong>{data.projects.filter((item) => item.downloadUrl).length}</strong><span>App downloads</span></div><div><Palette /><strong>{data.appearance.motion ? "On" : "Off"}</strong><span>Website animation</span></div></div><section className="admin-card"><h2>Everything in one place</h2><p>Projects manages your work and downloadable apps. Website edits your profile, page sections and skills. Appearance controls motion, theme and the assistant. Publish changes when you are ready.</p><div className="admin-button-row"><button onClick={exportBackup}><FileDown size={16} /> Export content backup</button><label className="admin-upload"><Upload size={16} /> Import content backup<input type="file" accept=".json,application/json" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; try { if (file.size > 1024 * 1024) throw new Error("Backup must be smaller than 1 MB."); const parsed = JSON.parse(await file.text()); if (!parsed.profile || !Array.isArray(parsed.projects) || !parsed.appearance || !Array.isArray(parsed.capabilities) || !parsed.hero || !parsed.about || !parsed.contact || !parsed.headings) throw new Error("Invalid portfolio backup."); setDraft({ ...parsed, revision: site.revision }); setNotice("Backup loaded as a draft. Review it before publishing."); } catch (issue) { setError(issue.message); } event.target.value = ""; }} /></label></div><small>Content exports include links, not uploaded files. Back up the server data directory to preserve images and APKs.</small></section></>}
      {tab === "Projects" && <div className="admin-project-layout"><section className="admin-card admin-project-list"><div className="admin-card-heading"><h2>Your projects <span>{data.projects.length}</span></h2><button aria-label="Add project" onClick={addProject}><Plus size={18} /></button></div>{data.projects.map((item, index) => <div key={item.id} className={selected === item.id ? "admin-project-row selected" : "admin-project-row"}><button onClick={() => setSelected(item.id)}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{item.title}</strong><small>{item.category}</small></div></button><div><button aria-label={`Move ${item.title} up`} disabled={index === 0} onClick={() => { const items = [...data.projects]; [items[index - 1], items[index]] = [items[index], items[index - 1]]; setDraft({ ...data, projects: items }); }}><ArrowUp size={13} /></button><button aria-label={`Move ${item.title} down`} disabled={index === data.projects.length - 1} onClick={() => { const items = [...data.projects]; [items[index + 1], items[index]] = [items[index], items[index + 1]]; setDraft({ ...data, projects: items }); }}><ArrowDown size={13} /></button></div></div>)}{!data.projects.length && <p>No projects yet. Add your first one.</p>}</section><section className="admin-card">{project ? <><div className="admin-card-heading"><div><span className="admin-eyebrow">PROJECT EDITOR</span><h2>{project.title}</h2></div><button className="admin-danger" aria-label="Delete selected project" onClick={() => setDeleteId(project.id)}><Trash2 size={17} /></button></div>{deleteId === project.id && <div className="admin-error">Remove this project from your draft? Uploaded files will be kept.<div className="admin-button-row"><button onClick={() => { setDraft({ ...data, projects: data.projects.filter((item) => item.id !== project.id) }); setSelected(null); setDeleteId(null); }}>Remove project</button><button onClick={() => setDeleteId(null)}>Cancel</button></div></div>}<div className="admin-fields">{["title", "category", "description", "url", "downloadUrl", "image", "downloadName", "liveLabel", "domain", "role", "challenge", "solution"].map((field) => <Field key={field} field={field} value={project[field]} onChange={(value) => editProject(project.id, field, value)} />)}<Field field="Tags (comma separated)" value={project.tags.join(", ")} onChange={(value) => editProject(project.id, "tags", value.split(",").map((item) => item.trim()))} /><Field field="Highlights (comma separated)" value={project.highlights.join(", ")} onChange={(value) => editProject(project.id, "highlights", value.split(",").map((item) => item.trim()))} /><label className="admin-field"><span>Card accent</span><select value={project.accent} onChange={(event) => editProject(project.id, "accent", event.target.value)}>{["cyan", "violet", "orange", "pink"].map((color) => <option key={color}>{color}</option>)}</select></label></div><div className="admin-button-row"><UploadField label="Upload cover image" accept=".jpg,.jpeg,.png,.webp" onError={setError} onUploaded={(url) => editProject(project.id, "image", url)} /><UploadField label="Upload Android APK" accept=".apk" onError={setError} onUploaded={(url, name) => { setDraft((previous) => { const base = previous || site; return { ...base, projects: base.projects.map((item) => item.id === project.id ? { ...item, downloadUrl: url, downloadName: name, category: "Mobile App", domain: "Android APK" } : item) }; }); }} /></div><small>Images up to 8 MB · APKs up to 160 MB. Upload, then publish to show the file on your website.</small></> : <div className="admin-empty"><FolderKanban size={35} /><h2>Select a project</h2><p>Choose a project on the left, or add something new.</p><button className="admin-primary" onClick={addProject}><Plus size={16} />Add project</button></div>}</section></div>}
      {tab === "Website" && <>{["profile", "hero", "about", "contact", "headings"].map((section) => <section key={section} className="admin-card"><h2>{section === "profile" ? "Identity, contact & SEO" : section.charAt(0).toUpperCase() + section.slice(1)}</h2><div className="admin-fields">{Object.entries(data[section]).map(([field, value]) => <Field key={field} field={field} value={value} onChange={(next) => edit(section, field, next)} />)}</div>{section === "profile" && <UploadField label="Upload profile photo" accept=".jpg,.jpeg,.png,.webp" onError={setError} onUploaded={(url) => edit("profile", "portrait", url)} />}</section>)}<section className="admin-card"><h2>Skills & capabilities</h2>{data.capabilities.map((item) => <details className="admin-capability" key={item.key}><summary>{item.title}</summary><div className="admin-fields">{["title", "eyebrow", "description", "image"].map((field) => <Field key={field} field={field} value={item[field]} onChange={(value) => setDraft({ ...data, capabilities: data.capabilities.map((entry) => entry.key === item.key ? { ...entry, [field]: value } : entry) })} />)}<Field field="Skills (comma separated)" value={item.stack.join(", ")} onChange={(value) => setDraft({ ...data, capabilities: data.capabilities.map((entry) => entry.key === item.key ? { ...entry, stack: value.split(",").map((word) => word.trim()) } : entry) })} /></div></details>)}</section></>}
      {tab === "Appearance" && <section className="admin-card"><h2>Set the mood.</h2><p>Fine-tune the experience across your portfolio.</p>{[["background", "Live background", "Aurora, floating particles and orbital motion"], ["motion", "Screen animations", "Scroll reveals and animated interface elements"], ["assistant", "Portfolio assistant", "Show the assistant chat launcher"]].map(([key, title, description]) => <label className="admin-toggle" key={key}><div><strong>{title}</strong><span>{description}</span></div><input type="checkbox" checked={data.appearance[key]} onChange={(event) => edit("appearance", key, event.target.checked)} /></label>)}<div className="admin-fields"><label className="admin-field"><span>Default theme for new visitors</span><select value={data.appearance.theme} onChange={(event) => edit("appearance", "theme", event.target.value)}><option value="dark">Dark</option><option value="light">Light</option></select></label><Field field="Accent color" type="color" value={data.appearance.accent} onChange={(value) => edit("appearance", "accent", value)} /></div></section>}
      {tab === "Admin access" && user && <AdminAccess user={user} />}
    </main>
  </div>;
}
