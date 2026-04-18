const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const doc = new PDFDocument();
const outputPath = path.join(__dirname, "..", "frontend", "public", "johndoe_resume.pdf");
const desktopPath = path.join(__dirname, "..", "johndoe_resume.pdf");

doc.pipe(fs.createWriteStream(outputPath));
doc.pipe(fs.createWriteStream(desktopPath));

doc.fontSize(24).text("John Doe", { align: "center" });
doc.moveDown();
doc.fontSize(12).text("Email: john.doe@example.com | Phone: (555) 123-4567 | Location: New York, NY", { align: "center" });
doc.moveDown(2);

doc.fontSize(16).text("Summary", { underline: true });
doc.fontSize(12).text("Highly motivated Software Engineer with 5 years of experience in full-stack web development. Passionate about building seamless user experiences and scalable backend architectures. Adept at agile methodologies and continuous integration paradigms.");
doc.moveDown();

doc.fontSize(16).text("Experience", { underline: true });
doc.fontSize(14).text("Senior Frontend Engineer - Tech Innovations Inc.", { continued: true }).fontSize(12).text(" (2020 - Present)");
doc.text("• Developed and maintained scalable React applications, improving performance by 40%.");
doc.text("• Collaborated with backend engineers to consume RESTful APIs using Node.js and Express.");
doc.text("• Built reusable components using modern CSS frameworks like Tailwind CSS.");
doc.moveDown();

doc.fontSize(14).text("Web Developer - Digital Solutions LLC", { continued: true }).fontSize(12).text(" (2018 - 2020)");
doc.text("• Created responsive website layouts using HTML5, vanilla JavaScript, and CSS.");
doc.text("• Migrated legacy jQuery codebase to modern React paradigms.");
doc.moveDown();

doc.fontSize(16).text("Skills", { underline: true });
doc.fontSize(12).text("Languages: JavaScript (ES6+), TypeScript, Python, HTML, CSS");
doc.text("Frameworks/Libraries: React.js, Next.js, Node.js, Express, Tailwind CSS");
doc.text("Tools: Git, Docker, Webpack, Vite, AWS S3");
doc.moveDown();

doc.fontSize(16).text("Education", { underline: true });
doc.fontSize(14).text("Bachelor of Science in Computer Science");
doc.fontSize(12).text("University of Technology (2014 - 2018)");

doc.end();

console.log("Successfully generated test PDF at: " + desktopPath);
