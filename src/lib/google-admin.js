import { createClient } from "@supabase/supabase-js";

let clientPromise;
export function getGoogleClient() {
  if (!clientPromise) clientPromise = (async () => {
    const response = await fetch("/api/admin/config", { cache: "no-store" });
    if (!response.ok) throw new Error("The admin server is unavailable.");
    const config = await response.json();
    if (!config.configured) return null;
    return createClient(config.url, config.publishableKey, { auth: { flowType: "pkce", detectSessionInUrl: true, persistSession: true, autoRefreshToken: true, storageKey: "hamdan-portfolio-google-auth" } });
  })().catch((error) => { clientPromise = null; throw error; });
  return clientPromise;
}
export async function adminRequest(path, options = {}) {
  const client = await getGoogleClient();
  const { data } = client ? await client.auth.getSession() : { data: {} };
  const response = await fetch(`/api/admin/${path}`, { ...options, headers: { ...options.headers, ...(data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {}) } });
  const result = await response.json().catch(() => ({ error: "Admin server unavailable." }));
  if (!response.ok || result.error) throw new Error(result.error || "Request failed.");
  return result;
}
export async function googleSignIn() {
  const oauthError = new URLSearchParams(window.location.search).get("error_description");
  if (oauthError) throw new Error(oauthError);
  const client = await getGoogleClient();
  if (!client) throw new Error("Ham-tech Supabase configuration is still required on the server.");
  const { error } = await client.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/admin`, scopes: "openid email profile", queryParams: { prompt: "select_account" } } });
  if (error) throw error;
}
export async function googleSignOut() {
  const client = await getGoogleClient();
  if (client) { const { error } = await client.auth.signOut({ scope: "local" }); if (error) throw error; }
}

export async function uploadAdminFile(file) {
  const client = await getGoogleClient();
  if (!client) throw new Error("Supabase is not configured.");
  const { data } = await client.auth.getSession();
  if (!data.session) throw new Error("Sign in before uploading files.");
  const extension = file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp|apk)$/)?.[0];
  if (!extension) throw new Error("Upload a JPG, PNG, WebP or APK file.");
  const path = `${crypto.randomUUID()}${extension}`;
  const { error } = await client.storage.from("portfolio-media").upload(path, file, { contentType: file.type || undefined, upsert: false });
  if (error) throw new Error(error.message);
  return client.storage.from("portfolio-media").getPublicUrl(path).data.publicUrl;
}
