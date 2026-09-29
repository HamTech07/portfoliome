import { useEffect, useState } from "react";
import { Shield, Trash2, UserPlus } from "lucide-react";
import { adminRequest } from "../lib/google-admin";

export function GoogleAvatar({ user, size = "" }) {
  const [failed, setFailed] = useState(false);
  const valid = /^https:\/\/[a-z0-9.-]+\.googleusercontent\.com\//i.test(user?.avatar || "");
  return <span className={`google-avatar ${size}`}>{valid && !failed ? <img src={user.avatar} alt={`${user.name || user.email} profile`} referrerPolicy="no-referrer" onError={() => setFailed(true)} /> : (user?.name || user?.email || "A").slice(0, 1).toUpperCase()}</span>;
}

export default function AdminAccess({ user }) {
  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState(null);
  useEffect(() => { if (user.role === "owner") adminRequest("members").then((data) => setMembers(data.members)).catch((issue) => setError(issue.message)); }, [user.role]);
  const change = async (method, address) => {
    setBusy(true); setError("");
    try { const result = await adminRequest("members", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: address }) }); setMembers(result.members); setEmail(""); setRemoving(null); }
    catch (issue) { setError(issue.message); }
    finally { setBusy(false); }
  };
  return <><section className="admin-card"><div className="admin-account"><GoogleAvatar user={user} size="large" /><div><span className="admin-eyebrow">GOOGLE ACCOUNT · {user.role.toUpperCase()}</span><h2>{user.name || user.email}</h2><p>{user.email}</p></div></div><p>Google handles your sign-in. Your profile photo appears automatically after a successful login.</p></section><section className="admin-card"><h2><Shield size={18} /> Admin access</h2>{user.role === "owner" ? <><p>Only you can give or remove admin access. Added admins can edit portfolio content, but cannot manage other admins or remove the owner.</p><form className="admin-invite" onSubmit={(event) => { event.preventDefault(); change("POST", email); }}><label className="admin-field"><span>Google-account email</span><input type="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="person@gmail.com" /></label><button className="admin-primary" disabled={busy}><UserPlus size={16} /> Add admin</button></form><small>This grants access; it does not send an email. Share your /admin link with the new admin.</small>{error && <p className="admin-error" role="alert">{error}</p>}<div className="admin-members">{members.map((member) => <div className="admin-member" key={member.email}><GoogleAvatar user={member} /><div><strong>{member.name || member.email}</strong><span>{member.email} · {member.role}</span></div>{member.role === "owner" ? <span className="owner-badge">Protected owner</span> : removing === member.email ? <div className="admin-button-row"><button disabled={busy} onClick={() => change("DELETE", member.email)}>Confirm removal</button><button onClick={() => setRemoving(null)}>Cancel</button></div> : <button className="admin-danger" aria-label={`Remove ${member.email} admin access`} onClick={() => setRemoving(member.email)}><Trash2 size={16} /></button>}</div>)}</div></> : <p>Only the owner can add or remove admins. Your access is checked again for every save and upload.</p>}</section></>;
}
