// ============================================================
// ATS Matcher — Keyword-based Resume vs Job Description Scoring
// Extracts important keywords from a job description, compares
// them against resume text, and returns a match report.
// ============================================================

// ------------------------------------------------------------
// 1. Keyword Dictionary
//    Curated list of skills, tools, and roles that ATS systems
//    typically scan for.  Kept as a flat Set for O(1) lookups.
// ------------------------------------------------------------

const KNOWN_SKILLS = new Set([
  // Programming languages
  "javascript", "typescript", "python", "java", "c", "c++", "c#",
  "ruby", "go", "golang", "rust", "php", "swift", "kotlin", "scala",
  "r", "matlab", "perl", "dart", "lua", "elixir", "haskell",
  "objective-c", "shell", "bash", "powershell", "sql", "nosql",
  "html", "css", "sass", "less",

  // Frontend frameworks & libraries
  "react", "reactjs", "react.js", "angular", "angularjs", "vue",
  "vuejs", "vue.js", "nextjs", "next.js", "nuxt", "nuxtjs",
  "svelte", "ember", "backbone", "jquery", "bootstrap", "tailwind",
  "tailwindcss", "material-ui", "chakra-ui", "redux", "mobx",
  "webpack", "vite", "rollup", "parcel",

  // Backend frameworks
  "node", "nodejs", "node.js", "express", "expressjs", "fastify",
  "nestjs", "django", "flask", "fastapi", "spring", "springboot",
  "spring boot", "rails", "ruby on rails", "laravel", "asp.net",
  ".net", "dotnet",

  // Databases
  "mongodb", "mongoose", "mysql", "postgresql", "postgres", "sqlite",
  "redis", "elasticsearch", "dynamodb", "cassandra", "firebase",
  "firestore", "supabase", "mariadb", "oracle", "couchdb",
  "neo4j", "graphql", "prisma", "sequelize", "knex",

  // Cloud & DevOps
  "aws", "amazon web services", "azure", "gcp", "google cloud",
  "docker", "kubernetes", "k8s", "terraform", "ansible", "jenkins",
  "circleci", "github actions", "gitlab ci", "ci/cd", "cicd",
  "nginx", "apache", "linux", "ubuntu", "devops", "cloudflare",
  "heroku", "vercel", "netlify", "digitalocean", "lambda",
  "serverless", "microservices",

  // Data & AI/ML
  "machine learning", "deep learning", "artificial intelligence",
  "ai", "ml", "nlp", "natural language processing",
  "computer vision", "tensorflow", "pytorch", "keras", "scikit-learn",
  "pandas", "numpy", "matplotlib", "jupyter", "data science",
  "data analysis", "data engineering", "big data", "spark",
  "hadoop", "kafka", "airflow", "etl", "power bi", "tableau",

  // Mobile
  "react native", "flutter", "ionic", "android", "ios", "xcode",
  "swiftui", "jetpack compose",

  // Testing
  "jest", "mocha", "chai", "cypress", "playwright", "selenium",
  "puppeteer", "junit", "pytest", "testing", "unit testing",
  "integration testing", "tdd", "bdd",

  // Tools & methodologies
  "git", "github", "gitlab", "bitbucket", "jira", "confluence",
  "slack", "figma", "postman", "swagger", "openapi",
  "agile", "scrum", "kanban", "rest", "restful", "api",
  "graphql", "grpc", "websocket", "oauth", "jwt",
  "sso", "authentication", "authorization",

  // Soft skills & roles (commonly scanned)
  "leadership", "communication", "teamwork", "problem solving",
  "critical thinking", "project management",
]);

const KNOWN_ROLES = new Set([
  "developer", "engineer", "architect", "designer", "analyst",
  "manager", "lead", "senior", "junior", "intern", "consultant",
  "administrator", "devops engineer", "data scientist",
  "data analyst", "data engineer", "frontend developer",
  "backend developer", "full stack developer", "fullstack developer",
  "software engineer", "software developer", "web developer",
  "mobile developer", "qa engineer", "test engineer",
  "machine learning engineer", "cloud engineer", "site reliability engineer",
  "product manager", "project manager", "scrum master",
  "technical lead", "tech lead", "cto", "vp engineering",
]);

// ------------------------------------------------------------
// 2. extractKeywords(text)
//    Pulls relevant keywords from the given text by matching
//    against the known dictionaries.  Returns a deduplicated
//    array of lowercase keywords.
// ------------------------------------------------------------

function extractKeywords(text) {
  if (!text || typeof text !== "string") return [];

  const lowerText = text.toLowerCase();
  const found = new Set();

  // Check multi-word terms first (e.g. "react native", "spring boot")
  for (const skill of KNOWN_SKILLS) {
    if (skill.includes(" ") || skill.includes(".") || skill.includes("/")) {
      if (lowerText.includes(skill)) {
        found.add(skill);
      }
    }
  }

  for (const role of KNOWN_ROLES) {
    if (role.includes(" ")) {
      if (lowerText.includes(role)) {
        found.add(role);
      }
    }
  }

  // Tokenise into single words for single-word lookups
  const words = lowerText.match(/[a-z0-9#+.]+/g) || [];

  for (const word of words) {
    if (KNOWN_SKILLS.has(word)) {
      found.add(word);
    }
    if (KNOWN_ROLES.has(word)) {
      found.add(word);
    }
  }

  return Array.from(found);
}

// ------------------------------------------------------------
// 3. matchResumeToJob(resumeText, jobDescription)
//    Core matching logic.  Returns a report object with:
//      • matchScore        — percentage (0-100)
//      • matchedSkills     — keywords found in both texts
//      • missingSkills     — keywords in JD but NOT in resume
//      • recommendations   — actionable advice string
// ------------------------------------------------------------

function matchResumeToJob(resumeText, jobDescription) {
  // Extract keywords from the job description (the "target" set)
  const jobKeywords = extractKeywords(jobDescription);

  if (jobKeywords.length === 0) {
    return {
      matchScore: 0,
      matchedSkills: [],
      missingSkills: [],
      recommendations:
        "Could not extract any recognisable skills or tools from the job description. " +
        "Try providing a more detailed description with specific technologies and requirements.",
    };
  }

  // Normalise resume text once for lookups
  const resumeLower = resumeText.toLowerCase();

  const matchedSkills = [];
  const missingSkills = [];

  for (const keyword of jobKeywords) {
    if (resumeLower.includes(keyword)) {
      matchedSkills.push(keyword);
    } else {
      missingSkills.push(keyword);
    }
  }

  // Calculate match percentage
  const matchScore = Math.round((matchedSkills.length / jobKeywords.length) * 100);

  // Build recommendations based on the score
  const recommendations = buildRecommendations(matchScore, missingSkills);

  return {
    matchScore,
    matchedSkills,
    missingSkills,
    recommendations,
  };
}

// ------------------------------------------------------------
// 4. buildRecommendations(score, missing)
//    Generates contextual advice based on the match result.
// ------------------------------------------------------------

function buildRecommendations(score, missingSkills) {
  const tips = [];

  if (score === 100) {
    tips.push("Excellent! Your resume covers all the key skills in this job description.");
    tips.push("Consider highlighting relevant project experience for each matched skill.");
    return tips.join(" ");
  }

  if (score >= 75) {
    tips.push("Great match! You're close to a perfect fit.");
  } else if (score >= 50) {
    tips.push("Decent match, but there's room for improvement.");
  } else if (score >= 25) {
    tips.push("Low match — your resume is missing several key requirements.");
  } else {
    tips.push("Very low match — this role may require significant skill gaps to be addressed.");
  }

  if (missingSkills.length > 0) {
    const display = missingSkills.map((s) => capitalize(s));
    tips.push(`Add the following missing skills to your resume: ${display.join(", ")}.`);
  }

  tips.push("Include relevant projects or certifications that demonstrate these skills.");
  tips.push("Use exact terminology from the job description to improve ATS compatibility.");

  return tips.join(" ");
}

// Simple capitalise helper ("react.js" → "React.js")
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ------------------------------------------------------------
// Exports
// ------------------------------------------------------------
module.exports = { extractKeywords, matchResumeToJob };
