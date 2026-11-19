/**
 * =============================================================================
 * Skills
 * =============================================================================
 * Each entry represents a skill category rendered as a card with an icon.
 *
 * Field guide:
 *   category – The heading displayed on the card.
 *   icon     – A Lucide icon name (https://lucide.dev/icons). Examples:
 *              "Code", "Globe", "Brain", "Library", "Cpu", "Wrench"
 *   skills   – Array of skill name strings shown as tags inside the card.
 *
 * To add a new category, copy one of the objects below and fill it in.
 * To add a skill, just append a string to the relevant `skills` array.
 * =============================================================================
 */

const skills = [
  // ── Programming Languages ─────────────────────────────────────────────────
  {
    category: "Programming Languages",
    icon: "Code",             // Lucide: <Code />
    skills: ["Python", "Java", "C", "C++", "JavaScript"],
  },

  // ── Web Development ───────────────────────────────────────────────────────
  {
    category: "Web Development",
    icon: "Globe",            // Lucide: <Globe />
    skills: ["HTML", "CSS", "JavaScript"],
  },

  // ── Machine Learning ──────────────────────────────────────────────────────
  {
    category: "Machine Learning",
    icon: "Brain",            // Lucide: <Brain />
    skills: [
      "Machine Learning",
      "Supervised Learning",
      "Unsupervised Learning",
      "Linear Regression",
      "Logistic Regression",
      "Decision Trees",
      "KNN",
      "Data Preprocessing",
      "Model Evaluation",
    ],
  },

  // ── Libraries & Frameworks ────────────────────────────────────────────────
  {
    category: "Libraries",
    icon: "Library",          // Lucide: <Library />
    skills: ["NumPy", "Pandas", "Scikit-learn", "Matplotlib"],
  },

  // ── Core Computer Science ─────────────────────────────────────────────────
  {
    category: "Core Computer Science",
    icon: "Cpu",              // Lucide: <Cpu />
    skills: [
      "Data Structures & Algorithms",
      "DBMS",
      "Computer Networks",
      "Computer Organization & Architecture",
      "Operating Systems",
      "Software Engineering",
      "Object-Oriented Programming",
    ],
  },

  // ── Tools & Platforms ─────────────────────────────────────────────────────
  {
    category: "Tools",
    icon: "Wrench",           // Lucide: <Wrench />
    skills: ["Git", "GitHub", "MySQL", "VS Code", "Google Colab", "Linux"],
  },
];

export default skills;
