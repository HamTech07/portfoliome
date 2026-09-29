import { projects, capabilities, freelanceProfiles } from "../data/portfolio.js";

// A transparent, deterministic fallback, not a substitute for a language model.
export function portfolioAnswer(question, site) {
  const catalog = site?.projects || projects;
  const services = site?.capabilities || capabilities;
  const profiles = site?.profile || freelanceProfiles;
  const name = site?.profile?.name || "Hamdan";
  const text = question.toLowerCase();
  const project = catalog.find((item) => text.includes(item.title.toLowerCase()) || text.includes(item.id));
  if (project) return `${project.title}: ${project.description}\n${project.downloadUrl || project.url}`;
  if (/hire|contact|upwork|fiverr|available|availability|rabta|price|cost|budget/.test(text)) {
    return `You can contact ${name} about availability and pricing through Upwork or Fiverr.\nUpwork: ${profiles.upwork}\nFiverr: ${profiles.fiverr}`;
  }
  if (/mobile|android|apk|download|app/.test(text)) {
    return catalog.filter((item) => item.category === "Mobile App" || item.downloadUrl).map((item) => `${item.title}: ${item.description}\n${item.downloadUrl || item.url}`).join("\n\n") || "No mobile projects are currently published.";
  }
  if (/project|work|portfolio|website|web site/.test(text)) {
    return catalog.map((item) => `${item.title} — ${item.category}\n${item.downloadUrl || item.url}`).join("\n\n") || "No projects are currently published.";
  }
  if (/build|skill|stack|service|react|flutter|develop|kya|bana/.test(text)) {
    return `${name} works across ${services.map((item) => item.title).join(", ")}. Skills include ${[...new Set(services.flatMap((item) => item.stack))].join(", ")}.`;
  }
  return `I can show verified portfolio information about ${name}’s projects, skills, mobile apps and hiring links. For other questions or current availability, please contact ${name} through the Contact section.`;
}
