import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Upload from "./components/Upload";
import Analysis from "./components/Analysis";
import ATS from "./components/ATS";

/* ── Navigation Link ── */
function NavLink({ href, children, active }) {
  return (
    <a href={href} className={`nav-link ${active ? "active" : ""}`}>
      {children}
    </a>
  );
}

/* ── Feature Pill Card ── */
function FeaturePill({ icon, title, subtitle, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.05, y: -4 }}
      className="feature-pill"
    >
      <div className="pill-icon">{icon}</div>
      <p
        className="text-sm font-bold font-[family-name:var(--font-family-display)]"
        style={{ color: "var(--color-neon-cyan)" }}
      >
        {title}
      </p>
      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
        {subtitle}
      </p>
    </motion.div>
  );
}

export default function App() {
  const [uploadData, setUploadData] = useState(null);

  const handleUploadSuccess = (data) => {
    setUploadData(data);
    setTimeout(() => {
      document.getElementById("analysis")?.scrollIntoView({ behavior: "smooth" });
    }, 400);
  };

  const hasUpload = !!uploadData?.cleanText;

  return (
    <div className="relative min-h-screen flex flex-col items-center overflow-x-hidden">
      {/* ── Ambient Orbs ── */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* ── Sticky Glassmorphism Navbar ── */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 inset-x-0 z-50"
        style={{
          background: "rgba(5, 8, 22, 0.75)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "rgba(0, 229, 255, 0.08)",
                border: "1px solid rgba(0, 229, 255, 0.18)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
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

      {/* ── Main Content — Everything Centered ── */}
      <main className="flex-1 w-full flex flex-col items-center pt-16">
        {/* ─── Hero Section ─── */}
        <section className="relative w-full flex flex-col items-center text-center px-4 sm:px-6 pt-20 pb-16 sm:pt-28 sm:pb-20 md:pt-32 md:pb-24">
          {/* Gradient mesh glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, rgba(0,229,255,0.07) 0%, rgba(124,58,237,0.05) 35%, transparent 65%)",
              filter: "blur(50px)",
            }}
          />

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8"
            style={{
              background: "rgba(124, 58, 237, 0.08)",
              border: "1px solid rgba(124, 58, 237, 0.2)",
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

          {/* ─── Main Heading ─── */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="relative font-[family-name:var(--font-family-display)] font-extrabold leading-tight max-w-4xl px-2 break-words"
            style={{ fontSize: "clamp(2rem, 6vw, 3.75rem)" }}
          >
            Analyze Your Resume.{" "}
            <span
              className="inline-block"
              style={{
                background: "linear-gradient(135deg, #00e5ff, #7c3aed)",
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
            className="relative mt-5 max-w-2xl leading-relaxed px-2"
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "clamp(0.875rem, 2.5vw, 1.125rem)",
            }}
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
            className="relative btn-cta-glow mt-10"
          >
            GET STARTED →
          </motion.a>

          {/* Feature Pills */}
          <div className="relative grid grid-cols-3 gap-3 sm:gap-5 mt-12 sm:mt-16 w-full max-w-xs sm:max-w-md md:max-w-lg mx-auto">
            <FeaturePill
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              }
              title="PDF Upload"
              subtitle="Drag & Drop"
              delay={0.7}
            />
            <FeaturePill
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              }
              title="AI Analysis"
              subtitle="Smart Insights"
              delay={0.8}
            />
            <FeaturePill
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              }
              title="ATS Matching"
              subtitle="Score & Compare"
              delay={0.9}
            />
          </div>

          {/* Ping keyframe */}
          <style>{`
            @keyframes ping {
              75%, 100% { transform: scale(2); opacity: 0; }
            }
          `}</style>
        </section>

        {/* ─── Functional Sections — max-w-6xl centered container ─── */}
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
          <div className="flex flex-col items-center gap-10 sm:gap-14">
            {/* Upload */}
            <div className="w-full max-w-2xl">
              <Upload onUploadSuccess={handleUploadSuccess} />
            </div>

            {/* AI Analysis — revealed after upload */}
            <AnimatePresence>
              {hasUpload && (
                <motion.div
                  key="analysis-section"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6 }}
                  className="w-full max-w-4xl"
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
                  className="w-full max-w-4xl"
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
                  className="w-full max-w-4xl"
                >
                  <div className="glass-card glass-card-hover p-6 sm:p-8 md:p-10 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background: "rgba(59, 130, 246, 0.08)",
                          border: "1px solid rgba(59, 130, 246, 0.15)",
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon-blue)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <polyline points="10 9 9 9 8 9" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="section-title">Extracted Sections</h2>
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                          Parsed from your resume
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(uploadData.sections).map(([key, value], i) => (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.08 * i, duration: 0.4 }}
                          whileHover={{ scale: 1.01, y: -2 }}
                          className="glass-card glass-card-hover p-4 sm:p-5 transition-all duration-300 cursor-default break-words"
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
          className="w-full text-center py-8 px-4 text-xs"
          style={{
            color: "var(--color-text-muted)",
            borderTop: "1px solid rgba(255,255,255,0.04)",
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
