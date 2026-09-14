import { ThemeProvider } from "./context/ThemeContext";
import { useApi } from "./hooks/useApi";
import {
  fallbackProfile,
  fallbackSkills,
  fallbackExperience,
  fallbackAchievements,
  fallbackProjects,
} from "./data/fallbackData";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Experience from "./components/Experience";
import Achievements from "./components/Achievements";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import ScrollTopButton from "./components/ScrollTopButton";

function PageContent() {
  const { data: profile } = useApi("/api/profile", fallbackProfile);
  const { data: skills } = useApi("/api/skills", fallbackSkills);
  const { data: experience } = useApi("/api/experience", fallbackExperience);
  const { data: achievements } = useApi("/api/achievements", fallbackAchievements);
  const { data: projects } = useApi("/api/projects", fallbackProjects);

  return (
    <>
      <Navbar profile={profile} />
      <main>
        <Hero profile={profile} />
        <About profile={profile} />
        <Skills skills={skills} />
        <Experience experience={experience} />
        <Achievements achievements={achievements} />
        <Projects projects={projects} />
        <Contact profile={profile} />
      </main>
      <Footer profile={profile} />
      <ScrollTopButton />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <PageContent />
    </ThemeProvider>
  );
}
