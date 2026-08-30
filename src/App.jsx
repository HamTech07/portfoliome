import { lazy, Suspense } from "react";
import Navbar from "./components/NavbarStudio";
import Hero from "./components/HeroStudio";
import Skills from "./components/SkillsStudio";
import About from "./components/AboutStudio";
import Contact from "./components/ContactStudio";
import Footer from "./components/FooterStudio";
import { ExperienceBoundary, SectionSkeleton } from "./components/ExperienceBoundary";
import ScrollProgress from "./components/ScrollProgress";

const Projects = lazy(() => import("./components/Projects"));

export default function App() {
  return (
    <ExperienceBoundary>
      <div className="site-shell min-h-screen">
        <ScrollProgress />
        <Navbar />
        <main>
          <Hero />
          <Skills />
          <Suspense fallback={<SectionSkeleton />}>
            <Projects />
          </Suspense>
          <About />
          <Contact />
        </main>
        <Footer />
      </div>
    </ExperienceBoundary>
  );
}
