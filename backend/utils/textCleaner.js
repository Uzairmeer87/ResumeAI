// ============================================================
// utils/textCleaner.js
// Cleans and structures raw resume text for AI analysis.
// No external NLP libraries — pure string/regex processing.
// ============================================================

// ------------------------------------------------------------
// Section header keywords used for detection.
// Each key is the normalised section name; the array holds
// common variations found in real-world resumes.
// ------------------------------------------------------------
const SECTION_KEYWORDS = {
  skills: [
    "skills",
    "technical skills",
    "core competencies",
    "competencies",
    "technologies",
    "tech stack",
    "tools",
    "proficiencies",
    "areas of expertise",
    "key skills",
  ],
  education: [
    "education",
    "academic background",
    "qualifications",
    "academic qualifications",
    "degrees",
    "certifications",
    "academic details",
  ],
  experience: [
    "experience",
    "work experience",
    "professional experience",
    "employment history",
    "work history",
    "career history",
    "professional background",
    "employment",
  ],
  projects: [
    "projects",
    "personal projects",
    "academic projects",
    "key projects",
    "notable projects",
    "side projects",
    "project work",
  ],
};

// We also track "other" headings so we know where one section
// ends and the next begins, even if it's not one we extract.
const OTHER_HEADINGS = [
  "summary",
  "objective",
  "profile",
  "about me",
  "about",
  "interests",
  "hobbies",
  "languages",
  "awards",
  "honors",
  "achievements",
  "publications",
  "references",
  "volunteer",
  "volunteering",
  "contact",
  "personal information",
  "personal details",
  "declaration",
];

// ============================================================
// 1. cleanResumeText(rawText)
//    Accepts raw extracted text, returns an object with
//    cleanText (string) and sections (object).
// ============================================================
function cleanResumeText(rawText) {
  // Guard: handle null / undefined / non-string input
  if (!rawText || typeof rawText !== "string") {
    return {
      cleanText: "",
      sections: {
        skills: "",
        education: "",
        experience: "",
        projects: "",
      },
    };
  }

  // ----- Step 1: Basic cleaning -----
  let text = rawText;

  // Remove non-printable / control characters (keep newlines & tabs)
  text = text.replace(/[^\S\n\t]+/g, " ");

  // Collapse multiple blank lines into a single blank line
  text = text.replace(/\n{3,}/g, "\n\n");

  // Remove leading/trailing whitespace on every line
  text = text
    .split("\n")
    .map((line) => line.trim())
    .join("\n");

  // Remove common PDF artefacts (bullet chars, page numbers, etc.)
  text = text.replace(/\f/g, "");                  // form-feed
  text = text.replace(/\r/g, "");                  // carriage-return
  text = text.replace(/•|▪|◦|►|●|○|➢|➤|→|–/g, "-"); // normalise bullets
  text = text.replace(/\bPage\s*\d+\s*(of\s*\d+)?\b/gi, ""); // "Page 1 of 3"

  // Collapse runs of dashes / underscores / equals used as dividers
  text = text.replace(/[-_=]{3,}/g, "");

  // Final trim
  const cleanText = text.trim();

  // ----- Step 2: Section extraction -----
  const sections = extractSections(cleanText);

  return { cleanText, sections };
}

// ============================================================
// 2. extractSections(text)
//    Splits the cleaned text into named sections using simple
//    keyword matching on lines that look like headings.
// ============================================================
function extractSections(text) {
  const result = {
    skills: "",
    education: "",
    experience: "",
    projects: "",
  };

  // Build a combined list of ALL known headings (tracked + other)
  // so we can detect where any section boundary is.
  const allKeywords = [];

  for (const [section, keywords] of Object.entries(SECTION_KEYWORDS)) {
    for (const kw of keywords) {
      allKeywords.push({ keyword: kw, section });
    }
  }

  for (const kw of OTHER_HEADINGS) {
    allKeywords.push({ keyword: kw, section: null }); // null = not extracted
  }

  // Sort longest-first so "work experience" matches before "experience"
  allKeywords.sort((a, b) => b.keyword.length - a.keyword.length);

  // Split into lines and walk through them
  const lines = text.split("\n");

  let currentSection = null; // which tracked section we're in
  let sectionBuffer = [];    // accumulates lines for currentSection

  for (const line of lines) {
    const detected = detectHeading(line, allKeywords);

    if (detected !== undefined) {
      // We hit a new heading — flush the buffer for the previous section
      if (currentSection && sectionBuffer.length > 0) {
        result[currentSection] = sectionBuffer.join("\n").trim();
      }

      // Start the new section (null means "other", so we skip its content)
      currentSection = detected;
      sectionBuffer = [];
    } else if (currentSection) {
      // We're inside a tracked section — collect the line
      sectionBuffer.push(line);
    }
  }

  // Flush the last section
  if (currentSection && sectionBuffer.length > 0) {
    result[currentSection] = sectionBuffer.join("\n").trim();
  }

  return result;
}

// ============================================================
// 3. detectHeading(line, allKeywords)
//    Returns the section name if the line is a heading,
//    null if it's an "other" heading, or undefined if it's not
//    a heading at all.
// ============================================================
function detectHeading(line, allKeywords) {
  // Headings are usually short, standalone lines
  const stripped = line
    .replace(/[^a-zA-Z0-9\s]/g, "") // remove symbols
    .trim()
    .toLowerCase();

  // Skip empty lines or lines that are too long to be a heading
  if (!stripped || stripped.split(/\s+/).length > 6) {
    return undefined;
  }

  for (const { keyword, section } of allKeywords) {
    // Exact match or very close (e.g. "SKILLS:" → "skills")
    if (stripped === keyword || stripped === keyword + "s") {
      return section; // string or null
    }
  }

  return undefined; // not a heading
}

// ============================================================
// Exports
// ============================================================
module.exports = { cleanResumeText };
