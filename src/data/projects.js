/**
 * =============================================================================
 * Projects Data
 * =============================================================================
 * Each project is an object in the array below. The portfolio renders them as cards
 * and automatically provides dynamic category filtering.
 *
 * Field guide:
 *   id              – Unique identifier (e.g. "placement-prediction-model")
 *   title           – Project name shown on the card
 *   description     – Accurate summary for the card view
 *   longDescription – Detailed description
 *   technologies    – Array of technologies/libraries used
 *   image           – Path to image in /public (e.g. "/projects/my-screenshot.png") or ""
 *   github          – GitHub repository URL or "" (empty will cleanly omit the button)
 *   liveDemo        – Live demo URL or "" (empty will cleanly omit the button)
 *   featured        – true to highlight prominently, false otherwise
 *   category        – Used for filtering (e.g. "Machine Learning", "Python", "Java", "C/C++", "Web Development")
 *   date            – Approximate date or year
 * =============================================================================
 */

const projects = [
  {
    id: "placement-prediction-model",
    title: "Placement Prediction Model",
    description:
      "Performed data preprocessing, trained multiple machine-learning algorithms and evaluated model performance using standard evaluation metrics.",
    longDescription:
      "A complete machine learning project focused on predicting placement outcomes. The pipeline covers data cleaning, exploratory data analysis, data preprocessing, training multiple algorithms (including Logistic Regression, Decision Trees, and KNN), and evaluating performance with standard metrics.",
    technologies: ["Python", "Pandas", "NumPy", "Scikit-learn"],
    image: "",
    github: "https://github.com/AbhishekAgrawal71",
    liveDemo: "",
    featured: true,
    category: "Machine Learning",
    date: "2025",
  },
  {
    id: "memory-management-simulator",
    title: "Memory Management Simulator",
    description:
      "Built a simulator for memory allocation strategies including First Fit, Best Fit, and Worst Fit.",
    longDescription:
      "Simulates dynamic memory partitioning and operating system allocation algorithms. Models memory blocks, processes, and allocation/deallocation strategies to compare First Fit, Best Fit, and Worst Fit behaviors under varying memory loads.",
    technologies: ["C++", "Python"],
    image: "",
    github: "https://github.com/AbhishekAgrawal71",
    liveDemo: "",
    featured: false,
    category: "C/C++",
    date: "2025",
  },
  {
    id: "library-management-system",
    title: "Library Management System",
    description:
      "Built using object-oriented programming principles with functionality for book issue, book return, search, and inventory management.",
    longDescription:
      "Object-oriented software designed to manage library operations cleanly. Encapsulates book and member entities, handles transactions, tracks availability, and allows rapid search across catalog records.",
    technologies: ["Java"],
    image: "",
    github: "https://github.com/AbhishekAgrawal71",
    liveDemo: "",
    featured: false,
    category: "Java",
    date: "2025",
  },
  {
    id: "student-record-management",
    title: "Student Record Management System",
    description:
      "Console-based student record system implementing CRUD operations, file handling, and search functionality.",
    longDescription:
      "A reliable record management tool featuring persistent disk storage through file I/O. Supports adding, viewing, updating, deleting, and searching student profiles efficiently.",
    technologies: ["C", "Python"],
    image: "",
    github: "https://github.com/AbhishekAgrawal71",
    liveDemo: "",
    featured: false,
    category: "Python",
    date: "2024",
  },
];

export default projects;
