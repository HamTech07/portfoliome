import { createClient } from "@supabase/supabase-js";

export const OWNER_EMAIL = "hamdanamir2005@gmail.com";
export function createGoogleAuth(env = process.env) {
  const url = env.SUPABASE_URL?.trim();
  const key = env.SUPABASE_PUBLISHABLE_KEY?.trim();
  const configured = Boolean(url && key);
  function client(token) {
    return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }, global: { headers: { Authorization: `Bearer ${token}` } } });
  }
  return {
    config: () => ({ configured, ownerEmail: OWNER_EMAIL, ...(configured ? { url, publishableKey: key } : {}) }),
    async verify(request) {
      if (!configured) return null;
      const token = /^Bearer (\S+)$/.exec(request.headers.authorization || "")?.[1];
      if (!token) return null;
      const supabase = client(token);
      const { data: identity, error } = await supabase.auth.getUser(token);
      if (error || !identity.user) return null;
      const { data: member, error: roleError } = await supabase.rpc("portfolio_admin_session");
      if (roleError) throw Object.assign(new Error("Supabase admin schema is not ready. Apply the portfolio setup SQL."), { status: 503 });
      if (!member || member.userId !== identity.user.id || !["owner", "admin"].includes(member.role)) return null;
      return { ...member, token };
    },
    async members(actor, action = "list", email = null) {
      if (actor.role !== "owner") throw Object.assign(new Error("Only the owner can manage admins."), { status: 403 });
      const { data, error } = await client(actor.token).rpc("portfolio_admin_members", { action, member_email: email });
      if (error) throw Object.assign(new Error(error.message), { status: 400 });
      return data;
    },
  };
}
