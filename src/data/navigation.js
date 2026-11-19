/**
 * =============================================================================
 * Navigation Configuration
 * =============================================================================
 * Defines the navigation bar items and their scroll targets.
 * Dynamic sections (like Certificates and Research) hide automatically when empty.
 * =============================================================================
 */

import certificates from "./certificates";
import publications from "./publications";

const navigation = [
  { id: "home",          label: "Home",          href: "#home" },
  { id: "about",         label: "About",         href: "#about" },
  { id: "experience",    label: "Experience",    href: "#experience" },
  { id: "projects",      label: "Projects",      href: "#projects" },
  { id: "skills",        label: "Skills",        href: "#skills" },
  { id: "education",     label: "Education",     href: "#education" },
  {
    id: "certificates",
    label: "Certificates",
    href: "#certificates",
    hidden: !certificates || certificates.length === 0,
  },
  { id: "achievements",  label: "Achievements",  href: "#achievements" },
  {
    id: "research",
    label: "Research",
    href: "#research",
    hidden: !publications || publications.length === 0,
  },
  { id: "contact",       label: "Contact",       href: "#contact" },
];

export const navigationItems = navigation;
export default navigation;
