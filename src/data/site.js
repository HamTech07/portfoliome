import { projects, capabilities, freelanceProfiles } from "./portfolio.js";

export const defaultSite = {
  revision: 0,
  profile: {
    name: "Muhammad Hamdan Amir", brand: "Hamdan", suffix: ".dev", logo: "H",
    email: "hamdanamir2005@gmail.com", github: "https://github.com/HamTech07",
    upwork: freelanceProfiles.upwork, fiverr: freelanceProfiles.fiverr,
    role: "Full-stack · Mobile · Game developer", location: "Based in Pakistan",
    portrait: "/images/Profile1.jpeg", pageTitle: "Muhammad Hamdan Amir — Developer Portfolio",
    description: "Full-stack, mobile and AI developer portfolio of Muhammad Hamdan Amir.",
  },
  hero: {
    badge: "Available for ambitious digital products", title: "I engineer ideas into", highlight: "immersive products.",
    description: "Muhammad Hamdan Amir — a full-stack MERN, Flutter, React Native and game developer building fast, thoughtful experiences across web, mobile and interactive worlds.",
    button: "Explore selected work",
  },
  about: {
    title: "Curious by nature. Precise by practice.",
    intro: "I’m Muhammad Hamdan Amir, a Computer Science student and multidisciplinary developer. I enjoy taking a product from its first rough idea to a refined experience—connecting interface detail with the engineering underneath it.",
    description: "My work spans full-stack web development, Flutter and React Native app-development skills, Unity game systems and user-centered interface design.",
    education: "Computer Science", university: "University of Management & Technology", availability: "Freelance, internship & full-time",
  },
  contact: { badge: "Available for new projects", title: "Have an idea worth building?", description: "Let’s turn it into a fast, memorable and genuinely useful digital product.", response: "Usually responds within 24–48 hours" },
  headings: { skills: "One developer. Multiple dimensions.", skillsDescription: "Open a capability to see the products and interface work behind it.", projects: "Live ideas, shipped to the web.", projectsDescription: "Explore focused products across web, mobile and AI automation. Try a live experience or take an Android app with you." },
  appearance: { background: true, motion: true, assistant: true, theme: "dark", accent: "#22d3ee" },
  projects, capabilities,
};
