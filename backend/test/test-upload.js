// Test the /upload endpoint and display the structured response
const http = require("http");
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "sample-resume.pdf");
const fileData = fs.readFileSync(filePath);
const fileName = "sample-resume.pdf";
const boundary = "----TestBoundary" + Date.now();

// Build multipart/form-data body
const header = Buffer.from(
  `--${boundary}\r\nContent-Disposition: form-data; name="resume"; filename="${fileName}"\r\nContent-Type: application/pdf\r\n\r\n`
);
const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
const body = Buffer.concat([header, fileData, footer]);

const options = {
  hostname: "localhost",
  port: 5000,
  path: "/upload",
  method: "POST",
  headers: {
    "Content-Type": `multipart/form-data; boundary=${boundary}`,
    "Content-Length": body.length,
  },
};

const req = http.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    console.log(`Status: ${res.statusCode}\n`);
    const parsed = JSON.parse(data);

    if (parsed.error) {
      console.log("Error:", parsed.error);
      return;
    }

    // Show cleanText preview
    console.log("=== cleanText (first 300 chars) ===");
    console.log(parsed.cleanText?.substring(0, 300));
    console.log("\n");

    // Show each section
    console.log("=== Sections ===");
    for (const [name, content] of Object.entries(parsed.sections || {})) {
      console.log(`\n--- ${name.toUpperCase()} ---`);
      console.log(content || "(not detected)");
    }
  });
});

req.on("error", (err) => console.error("Request failed:", err.message));
req.write(body);
req.end();
