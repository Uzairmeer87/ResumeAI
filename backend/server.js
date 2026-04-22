// ============================================================
// AI Resume Analyzer — Backend Service
// A REST API that accepts PDF resumes, extracts text, cleans
// it, and provides AI-powered analysis via Hugging Face.
// ============================================================

// Load environment variables from .env (must be first)
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const { cleanResumeText } = require("./utils/textCleaner");
const { analyzeResume } = require("./services/aiService");
const { matchResumeToJob } = require("./utils/atsMatcher");

// ------------------------------------------------------------
// 1. Express App Setup
// ------------------------------------------------------------
const app = express();
const PORT = 5000;

// Enable CORS so any frontend can communicate with this API
app.use(cors());

// Parse JSON bodies (useful for future endpoints)
app.use(express.json());

// ------------------------------------------------------------
// 2. Multer Configuration — File Upload Handling
// ------------------------------------------------------------

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure where and how files are stored on disk
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    // Prefix with timestamp to avoid name collisions
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// Only allow PDF files (validate MIME type)
const fileFilter = (_req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true); // accept
  } else {
    cb(new Error("Only PDF files are allowed"), false); // reject
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});

// ------------------------------------------------------------
// 3. Helper — safely delete a file from disk
// ------------------------------------------------------------
function cleanupFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) console.error(`Cleanup failed for ${filePath}:`, err.message);
  });
}

// ------------------------------------------------------------
// 4. Routes
// ------------------------------------------------------------

// Health-check endpoint
app.get("/", (_req, res) => {
  res.json({
    message: "AI Resume Analyzer API is running",
    endpoints: {
      upload: "POST /upload — Upload a PDF resume for text extraction",
      analyze: "POST /analyze — AI-powered resume analysis (send { cleanText })",
      match: "POST /match — ATS matching (send { resumeText, jobDescription })",
    },
  });
});

// POST /upload — Upload a PDF and extract its text
app.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    // 4a. Validate that a file was actually uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Please attach a PDF resume." });
    }

    const filePath = req.file.path;

    // 4b. Read the PDF file from disk
    const pdfBuffer = fs.readFileSync(filePath);

    // 4c. Extract text using pdf-parse — try with lenient options first
    let pdfData = null;

    try {
      // First attempt: standard parsing
      pdfData = await pdfParse(pdfBuffer);
    } catch (firstErr) {
      console.warn("Standard PDF parse failed, retrying with lenient options:", firstErr.message);
      try {
        // Second attempt: lenient options — skip problematic internal checks
        pdfData = await pdfParse(pdfBuffer, {
          // Disable the built-in test file check that pdf-parse v1.1.1 uses
          pagerender: function (pageData) {
            let renderOptions = {
              normalizeWhitespace: true,
              disableCombineTextItems: false,
            };
            return pageData.getTextContent(renderOptions).then(function (textContent) {
              let text = "";
              for (let item of textContent.items) {
                text += item.str + " ";
              }
              return text;
            });
          },
        });
      } catch (secondErr) {
        console.warn("Lenient PDF parse also failed:", secondErr.message);
        // If both attempts fail, try reading as raw buffer with minimal options
        try {
          pdfData = await pdfParse(pdfBuffer, { max: 0 });
        } catch (thirdErr) {
          console.error("All PDF parse attempts failed:", thirdErr.message);
          throw thirdErr;
        }
      }
    }

    // 4d. Cleanup — remove the temp file immediately after processing
    cleanupFile(filePath);

    // 4e. Get the extracted text (may be empty for scanned/image-only PDFs)
    const rawText = (pdfData && pdfData.text) ? pdfData.text : "";

    // 4f. Clean and structure the extracted text
    const { cleanText, sections } = cleanResumeText(rawText);

    // 4g. Warn if no text was extracted but don't reject the PDF
    if (!cleanText || cleanText.trim().length === 0) {
      return res.status(200).json({
        rawText: rawText,
        cleanText: "",
        sections: { skills: "", education: "", experience: "", projects: "" },
        warning: "No readable text could be extracted. The PDF may be image-based or scanned. Try a text-based PDF.",
      });
    }

    // 4h. Return structured response
    return res.status(200).json({
      rawText,
      cleanText,
      sections,
    });
  } catch (err) {
    // If a file was uploaded before the error, clean it up
    if (req.file?.path) {
      cleanupFile(req.file.path);
    }

    console.error("PDF extraction error:", err.message);
    
    // Provide a helpful error message instead of rejecting
    return res.status(500).json({
      error: "Could not process this PDF. Please try re-saving it as a standard PDF (e.g. using 'Print to PDF') and upload again.",
      detail: err.message,
    });
  }
});

// POST /analyze — Send cleaned text to AI for feedback
app.post("/analyze", async (req, res) => {
  try {
    const { cleanText } = req.body;

    // Validate input
    if (!cleanText || typeof cleanText !== "string" || cleanText.trim().length < 20) {
      return res.status(400).json({
        error: "Please provide 'cleanText' in the request body (minimum 20 characters).",
      });
    }

    console.log("🤖 Sending resume to AI for analysis...");

    // Call Hugging Face via our aiService
    const analysis = await analyzeResume(cleanText);

    console.log("✅ AI analysis complete.");

    return res.status(200).json(analysis);
  } catch (err) {
    console.error("AI analysis error:", err.message);

    // Distinguish between config errors and API errors
    if (err.message.includes("HF_API_KEY")) {
      return res.status(500).json({ error: err.message });
    }

    return res.status(500).json({
      error: "AI analysis failed. The model may be loading — try again in 30 seconds.",
      detail: err.message,
    });
  }
});

// POST /match — Compare resume against a job description (ATS scoring)
app.post("/match", (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    // --- Input validation ---
    if (!resumeText || typeof resumeText !== "string" || resumeText.trim().length === 0) {
      return res.status(400).json({
        error: "'resumeText' is required and must be a non-empty string.",
      });
    }

    if (!jobDescription || typeof jobDescription !== "string" || jobDescription.trim().length === 0) {
      return res.status(400).json({
        error: "'jobDescription' is required and must be a non-empty string.",
      });
    }

    console.log("📊 Running ATS match analysis...");

    const result = matchResumeToJob(resumeText, jobDescription);

    console.log(`✅ ATS match complete — Score: ${result.matchScore}%`);

    return res.status(200).json(result);
  } catch (err) {
    console.error("ATS match error:", err.message);
    return res.status(500).json({
      error: "ATS matching failed. Please try again.",
      detail: err.message,
    });
  }
});

// ------------------------------------------------------------
// 5. Global Error Handler (catches Multer errors, etc.)
// ------------------------------------------------------------
app.use((err, _req, res, _next) => {
  // Multer-specific errors (wrong file type, size exceeded, etc.)
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }

  // Custom errors thrown from fileFilter
  if (err.message === "Only PDF files are allowed") {
    return res.status(400).json({ error: err.message });
  }

  // Catch-all
  console.error("Unhandled error:", err.message);
  return res.status(500).json({ error: "An internal server error occurred." });
});

// ------------------------------------------------------------
// 6. Start the Server
// ------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`\n🚀  Resume Analyzer API is live at http://localhost:${PORT}\n`);
});
