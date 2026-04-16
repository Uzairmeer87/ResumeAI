// Test the /analyze endpoint with sample resume text
const http = require("http");

const cleanText = `John Doe
Software Engineer
Email: john.doe@email.com | Phone: +1-555-123-4567
LinkedIn: linkedin.com/in/johndoe | GitHub: github.com/johndoe

Experience
Senior Software Engineer - TechCorp Inc.
Jan 2021 - Present | San Francisco, CA
- Architected and deployed 12 microservices handling 50k RPM
- Led migration from monolith to event-driven architecture
- Mentored 4 junior engineers through code reviews and pairing sessions

Software Engineer - WebStart LLC
Jun 2018 - Dec 2020 | Austin, TX
- Built RESTful APIs consumed by 200k+ monthly active users
- Reduced page load time by 40% through caching and lazy loading
- Implemented CI/CD pipelines using GitHub Actions and Docker

Education
B.S. Computer Science - Massachusetts Institute of Technology
2014 - 2018 | Cambridge, MA
GPA: 3.8 / 4.0 - Dean's List all semesters

Skills
Languages: JavaScript, TypeScript, Python, Go, SQL
Frameworks: React, Next.js, Express, FastAPI, Django
Cloud & DevOps: AWS (Lambda, ECS, S3), Docker, Kubernetes, Terraform
Databases: PostgreSQL, MongoDB, Redis, DynamoDB
Tools: Git, Jira, Figma, Datadog, Sentry

Projects
ResumeAI - AI-powered resume analyzer
- Built a Node.js backend that extracts and structures PDF resume text
- Integrated OpenAI API for skill-gap analysis and improvement suggestions

DevDash - Developer productivity dashboard
- Real-time GitHub, Jira, and Slack metrics aggregated in one view
- React frontend with SSR via Next.js; deployed on Vercel`;

const body = JSON.stringify({ cleanText });

const options = {
  hostname: "localhost",
  port: 5000,
  path: "/analyze",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
  },
};

console.log("Sending resume to /analyze endpoint...\n");

const req = http.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    console.log(`Status: ${res.statusCode}\n`);
    try {
      const parsed = JSON.parse(data);
      if (parsed.error) {
        console.log("Error:", parsed.error);
        if (parsed.detail) console.log("Detail:", parsed.detail);
        return;
      }
      for (const [key, value] of Object.entries(parsed)) {
        console.log(`=== ${key.toUpperCase()} ===`);
        console.log(value || "(empty)");
        console.log();
      }
    } catch {
      console.log("Raw response:", data);
    }
  });
});

req.on("error", (err) => console.error("Request failed:", err.message));
req.write(body);
req.end();
