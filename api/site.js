import { createClient } from "@supabase/supabase-js";
import { defaultSite } from "../src/data/site.js";

function send(response, status, body) {
  response.status(status).setHeader("Cache-Control", "no-store").json(body);
}

export default async function handler(_request, response) {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key) return send(response, 200, defaultSite);
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await supabase.rpc("portfolio_site_content");
  if (error || !data?.profile || !Array.isArray(data.projects)) return send(response, 200, defaultSite);
  return send(response, 200, data);
}
