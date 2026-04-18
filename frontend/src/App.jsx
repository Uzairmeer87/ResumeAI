import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Upload from "./components/Upload";
import Analysis from "./components/Analysis";
import ATS from "./components/ATS";

/* ── Navigation Link ── */
function NavLink({ href, children, active }) {
  return (
    <a
      href={href}
      className="relative text-sm font-medium transition-all duration-300 hover:drop-shadow-[0_0_6px_rgba(0,240,255,0.5)] py-1"
      style={{ color: active ? "var(--color-neon-cyan)" : "var(--color-text-secondary)" }}
      onMouseEnter={(e) => (e.target.style.color = "var(--color-neon-cyan)")}
      onMouseLeave={(e) => (e.target.style.color = active ? "var(--color-neon-cyan)" : "var(--color-text-secondary)")}
    >
      {children}
    </a>
  );
}

/* ── Stat Card in Hero ── */
function StatCard({ icon, value, label, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.05, y: -4 }}
      className="glass-card glass-card-hover p-5 text-center cursor-default transition-all duration-300"
    >
      <span className="text-2xl">{icon}</span>
      <p
        className="text-lg font-bold mt-1.5 font-[family-name:var(--font-family-display)]"
        style={{ color: "var(--color-neon-cyan)" }}
      >
        {value}
      </p>
      <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </p>
    </motion.div>
  );
}

export default function App() {
  const [uploadData, setUploadData] = useState(null);

  const handleUploadSuccess = (data) => {
    setUploadData(data);
    // Smooth scroll to analysis section after render
    setTimeout(() => {
      document.getElementById("analysis")?.scrollIntoView({ behavior: "smooth" });
    }, 400);
  };

  const hasUpload = !!uploadData?.cleanText;

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* ── Ambient Orbs ── */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* ── Sticky Navbar ── */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl"
        style={{
          background: "rgba(5, 8, 22, 0.8)",
          borderBottom: "1px solid rgba(0, 240, 255, 0.08)",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "rgba(0, 240, 255, 0.1)",
                border: "1px solid rgba(0, 240, 255, 0.2)",
              }}
            >
              <span className="text-sm">⚡</span>
            </div>
            <span
              className="font-bold text-lg font-[family-name:var(--font-family-display)]"
              style={{ color: "var(--color-neon-cyan)" }}
            >
              ResumeAI
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <NavLink href="#upload">Upload</NavLink>
            <NavLink href="#analysis" active={hasUpload}>Analysis</NavLink>
            <NavLink href="#ats" active={hasUpload}>ATS Match</NavLink>
          </div>
        </div>
      </motion.nav>

      {/* ── Main Content ── */}
      <main className="flex-1 pt-16">
        {/* ─── Hero Section ─── */}
        <section className="relative flex flex-col items-center justify-center text-center px-6 py-24 md:py-32">
          {/* Subtitle badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6"
            style={{
              background: "rgba(168, 85, 247, 0.1)",
              border: "1px solid rgba(168, 85, 247, 0.25)",
              color: "var(--color-neon-purple)",
            }}
          >
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{
                  background: "var(--color-neon-purple)",
                  animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
                }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ background: "var(--color-neon-purple)" }}
              />
            </span>
            AI-Powered Resume Intelligence
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="font-[family-name:var(--font-family-display)] font-extrabold text-4xl sm:text-5xl md:text-6xl leading-tight max-w-4xl"
          >
            Analyze Your Resume.{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, var(--color-neon-cyan), var(--color-neon-purple), var(--color-neon-pink))",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Beat the ATS.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-5 text-base sm:text-lg max-w-2xl leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Upload your resume, get AI-powered feedback, and compare it
            against any job description — all in seconds.
          </motion.p>

          {/* CTA */}
          <motion.a
            href="#upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.97 }}
            className="btn-neon mt-8"
            style={{ fontSize: "1rem", padding: "0.9rem 2.5rem" }}
          >
            Get Started →
          </motion.a>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-5 mt-14 w-full max-w-md">
            <StatCard icon="📄" value="PDF" label="Upload" delay={0.7} />
            <StatCard icon="🤖" value="AI" label="Analysis" delay={0.8} />
            <StatCard icon="🎯" value="ATS" label="Matching" delay={0.9} />
          </div>

          {/* Ping keyframe */}
          <style>{`
            @keyframes ping {
              75%, 100% { transform: scale(2); opacity: 0; }
            }
          `}</style>
        </section>

        {/* ─── Functional Sections — Centered Container ─── */}
        <div className="w-full max-w-5xl mx-auto px-6 pb-24">
          <div className="space-y-12">
            {/* Upload */}
            <Upload onUploadSuccess={handleUploadSuccess} />

            {/* AI Analysis — revealed after upload */}
            <AnimatePresence>
              {hasUpload && (
                <motion.div
                  key="analysis-section"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6 }}
                >
                  <Analysis cleanText={uploadData.cleanText} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ATS Match — revealed after upload */}
            <AnimatePresence>
              {hasUpload && (
                <motion.div
                  key="ats-section"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                >
                  <ATS cleanText={uploadData.cleanText} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Extracted Sections — revealed after upload */}
            <AnimatePresence>
              {uploadData?.sections && (
                <motion.section
                  key="extracted-section"
                  id="extracted"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="w-full"
                >
                  <div className="glass-card glass-card-hover p-8 md:p-10 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background: "rgba(59, 130, 246, 0.08)",
                          border: "1px solid rgba(59, 130, 246, 0.15)",
                        }}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--color-neon-blue)"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <polyline points="10 9 9 9 8 9" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="section-title" style={{ fontSize: "1.35rem" }}>
                          Extracted Sections
                        </h2>
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                          Parsed from your resume
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {Object.entries(uploadData.sections).map(([key, value], i) => (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.08 * i, duration: 0.4 }}
                          whileHover={{ scale: 1.01, y: -1 }}
                          className="glass-card glass-card-hover p-4 transition-all duration-300 cursor-default"
                        >
                          <h3
                            className="text-sm font-semibold mb-2 capitalize"
                            style={{ color: "var(--color-neon-cyan)" }}
                          >
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </h3>
                          <div
                            className="text-sm leading-relaxed"
                            style={{ color: "var(--color-text-secondary)" }}
                          >
                            {Array.isArray(value) ? (
                              value.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {value.map((item, j) => (
                                    <span key={j} className="skill-chip skill-chip-green">
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p style={{ color: "var(--color-text-muted)" }}>—</p>
                              )
                            ) : value ? (
                              <p className="whitespace-pre-wrap">{value}</p>
                            ) : (
                              <p style={{ color: "var(--color-text-muted)" }}>—</p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ─── Footer ─── */}
        <footer
          className="text-center py-8 text-xs"
          style={{
            color: "var(--color-text-muted)",
            borderTop: "1px solid rgba(0, 240, 255, 0.06)",
          }}
        >
          <p>
            Built with{" "}
            <span style={{ color: "var(--color-neon-cyan)" }}>⚡</span>{" "}
            ResumeAI — AI-Powered Resume Analyzer & ATS Matcher
          </p>
        </footer>
      </main>
    </div>
  );
}
