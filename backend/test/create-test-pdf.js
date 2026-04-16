// Generate a realistic test resume PDF with section headings
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const outPath = path.join(__dirname, "sample-resume.pdf");
const doc = new PDFDocument();
const stream = fs.createWriteStream(outPath);

doc.pipe(stream);

// --- Header ---
doc.fontSize(22).text("John Doe", { align: "center" });
doc.fontSize(12).text("Software Engineer", { align: "center" });
doc.moveDown(0.5);
doc.text("Email: john.doe@email.com | Phone: +1-555-123-4567", { align: "center" });
doc.text("LinkedIn: linkedin.com/in/johndoe | GitHub: github.com/johndoe", { align: "center" });

// --- Summary ---
doc.moveDown();
doc.fontSize(14).text("Summary");
doc.fontSize(11).text(
  "Results-driven software engineer with 5+ years of experience building scalable web applications and microservices. Passionate about clean code, CI/CD, and cross-functional team leadership."
);

// --- Experience ---
doc.moveDown();
doc.fontSize(14).text("Experience");
doc.moveDown(0.3);
doc.fontSize(12).text("Senior Software Engineer — TechCorp Inc.");
doc.fontSize(10).text("Jan 2021 – Present | San Francisco, CA");
doc.fontSize(11)
  .text("- Architected and deployed 12 microservices handling 50k RPM")
  .text("- Led migration from monolith to event-driven architecture")
  .text("- Mentored 4 junior engineers through code reviews and pairing sessions");
doc.moveDown(0.3);
doc.fontSize(12).text("Software Engineer — WebStart LLC");
doc.fontSize(10).text("Jun 2018 – Dec 2020 | Austin, TX");
doc.fontSize(11)
  .text("- Built RESTful APIs consumed by 200k+ monthly active users")
  .text("- Reduced page load time by 40% through caching and lazy loading")
  .text("- Implemented CI/CD pipelines using GitHub Actions and Docker");

// --- Education ---
doc.moveDown();
doc.fontSize(14).text("Education");
doc.moveDown(0.3);
doc.fontSize(12).text("B.S. Computer Science — Massachusetts Institute of Technology");
doc.fontSize(10).text("2014 – 2018 | Cambridge, MA");
doc.fontSize(11).text("GPA: 3.8 / 4.0 — Dean's List all semesters");

// --- Skills ---
doc.moveDown();
doc.fontSize(14).text("Skills");
doc.fontSize(11)
  .text("Languages: JavaScript, TypeScript, Python, Go, SQL")
  .text("Frameworks: React, Next.js, Express, FastAPI, Django")
  .text("Cloud & DevOps: AWS (Lambda, ECS, S3), Docker, Kubernetes, Terraform")
  .text("Databases: PostgreSQL, MongoDB, Redis, DynamoDB")
  .text("Tools: Git, Jira, Figma, Datadog, Sentry");

// --- Projects ---
doc.moveDown();
doc.fontSize(14).text("Projects");
doc.moveDown(0.3);
doc.fontSize(12).text("ResumeAI — AI-powered resume analyzer");
doc.fontSize(11)
  .text("- Built a Node.js backend that extracts and structures PDF resume text")
  .text("- Integrated OpenAI API for skill-gap analysis and improvement suggestions");
doc.moveDown(0.3);
doc.fontSize(12).text("DevDash — Developer productivity dashboard");
doc.fontSize(11)
  .text("- Real-time GitHub, Jira, and Slack metrics aggregated in one view")
  .text("- React frontend with SSR via Next.js; deployed on Vercel");

doc.end();

// Wait for the file to be fully written before exiting
stream.on("finish", () => {
  console.log(`Test PDF created at: ${outPath}`);
  console.log(`File size: ${fs.statSync(outPath).size} bytes`);
});

stream.on("error", (err) => {
  console.error("Failed to write PDF:", err.message);
  process.exit(1);
});
