import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "./Loader";

const API_BASE = "http://localhost:5000";

/* ── Circular Progress Ring ── */
function CircularScore({ score }) {
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 75) return "var(--color-neon-green)";
    if (score >= 50) return "var(--color-neon-cyan)";
    if (score >= 25) return "#f59e0b";
    return "var(--color-neon-red)";
  };

  const getLabel = () => {
    if (score >= 75) return "Strong Match";
    if (score >= 50) return "Good Match";
    if (score >= 25) return "Needs Work";
    return "Low Match";
  };

  const color = getColor();

  return (
    <div className="circular-progress">
      <svg width="160" height="160" viewBox="0 0 140 140">
        <circle className="track" cx="70" cy="70" r={radius} />
        <motion.circle
          className="fill"
          cx="70"
          cy="70"
          r={radius}
          stroke={color}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </svg>
      <div className="score-text">
        <motion.span
          className="text-3xl font-bold font-[family-name:var(--font-family-display)]"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {score}%
        </motion.span>
        <span className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
          {getLabel()}
        </span>
      </div>
    </div>
  );
}

/* ── Keyword Progress Bar ── */
function SkillBar({ matched, total }) {
  const pct = total > 0 ? Math.round((matched / total) * 100) : 0;

  const getBarColor = () => {
    if (pct >= 75) return "linear-gradient(90deg, var(--color-neon-green), var(--color-neon-cyan))";
    if (pct >= 50) return "linear-gradient(90deg, var(--color-neon-cyan), var(--color-neon-purple))";
    if (pct >= 25) return "linear-gradient(90deg, #f59e0b, var(--color-neon-cyan))";
    return "linear-gradient(90deg, var(--color-neon-red), #f59e0b)";
  };

  return (
    <div className="w-full mt-3">
      <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>
        <span>{matched} of {total} keywords matched</span>
        <span>{pct}%</span>
      </div>
      <div
        className="h-2.5 rounded-full overflow-hidden"
        style={{ background: "rgba(0, 229, 255, 0.06)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: getBarColor() }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        />
      </div>
    </div>
  );
}

export default function ATS({ cleanText }) {
  const [jobDesc, setJobDesc] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* Reset when cleanText changes (new upload) */
  useEffect(() => {
    setResult(null);
    setError("");
  }, [cleanText]);

  const handleMatch = async () => {
    if (!jobDesc.trim()) {
      setError("Please enter a job description.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      console.log("[ATS] Sending match request to", `${API_BASE}/match`);

      const res = await fetch(`${API_BASE}/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: cleanText,
          jobDescription: jobDesc,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error (${res.status})`);
      }

      const data = await res.json();
      console.log("[ATS] Match complete — Score:", data.matchScore + "%");
      setResult(data);
    } catch (err) {
      console.error("[ATS] Failed:", err);
      if (err.name === "TypeError" && err.message === "Failed to fetch") {
        setError("Cannot connect to backend. Make sure the server is running at " + API_BASE);
      } else {
        setError(err.message || "ATS matching failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const chipVariant = {
    hidden: { opacity: 0, scale: 0.7, y: 8 },
    visible: (i) => ({
      opacity: 1, scale: 1, y: 0,
      transition: { delay: i * 0.04, duration: 0.3, ease: "easeOut" },
    }),
  };

  const totalKeywords = (result?.matchedSkills?.length || 0) + (result?.missingSkills?.length || 0);

  return (
    <motion.section
      id="ats"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      <div className="glass-card glass-card-hover p-6 sm:p-8 md:p-10 transition-all duration-300">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(0, 229, 255, 0.06)", border: "1px solid rgba(0, 229, 255, 0.12)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon-cyan)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <div>
            <h2 className="section-title">ATS Match Score</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              Compare resume vs job description
            </p>
          </div>
        </div>

        {/* Job Description Input */}
        <label
          htmlFor="job-desc"
          className="block text-sm font-medium mb-2 mt-6"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Paste the Job Description
        </label>
        <textarea
          id="job-desc"
          className="textarea-glass"
          placeholder="Paste the full job description here — the more detail, the better the match analysis..."
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
          rows={5}
          style={{ minHeight: "120px" }}
        />

        {/* Character counter */}
        <p className="text-right text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
          {jobDesc.length} characters
        </p>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="error-banner mt-3"
            >
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Match Button / Loader */}
        {loading ? (
          <Loader text="Running ATS analysis..." />
        ) : (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMatch}
            disabled={loading || !jobDesc.trim()}
            className="btn-neon w-full mt-5 py-3"
            id="match-btn"
          >
            🔍 Run ATS Match
          </motion.button>
        )}

        {/* ── Results ── */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-8 space-y-6"
            >
              {/* Score Ring + Bar */}
              <div className="flex flex-col items-center gap-4 py-2">
                <CircularScore score={result.matchScore} />
                <SkillBar
                  matched={result.matchedSkills?.length || 0}
                  total={totalKeywords}
                />
              </div>

              {/* Matched + Missing Skills — 1 col mobile, 2 col md+ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.matchedSkills?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-5 sm:p-6"
                  >
                    <h3
                      className="text-sm font-semibold mb-3 flex items-center gap-2"
                      style={{ color: "var(--color-neon-green)" }}
                    >
                      <span>✅</span> Matched Skills ({result.matchedSkills.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedSkills.map((skill, i) => (
                        <motion.span
                          key={skill}
                          custom={i}
                          initial="hidden"
                          animate="visible"
                          variants={chipVariant}
                          whileHover={{ scale: 1.1, y: -2 }}
                          className="skill-chip skill-chip-green cursor-default"
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {result.missingSkills?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card p-5 sm:p-6"
                  >
                    <h3
                      className="text-sm font-semibold mb-3 flex items-center gap-2"
                      style={{ color: "var(--color-neon-red)" }}
                    >
                      <span>❌</span> Missing Skills ({result.missingSkills.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.missingSkills.map((skill, i) => (
                        <motion.span
                          key={skill}
                          custom={i}
                          initial="hidden"
                          animate="visible"
                          variants={chipVariant}
                          whileHover={{ scale: 1.1, y: -2 }}
                          className="skill-chip skill-chip-red cursor-default"
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Recommendations */}
              {result.recommendations && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="glass-card p-5 sm:p-6"
                  style={{
                    borderLeftWidth: "3px",
                    borderLeftStyle: "solid",
                    borderLeftColor: "var(--color-neon-purple)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span>💡</span>
                    <h3 className="font-semibold text-sm" style={{ color: "var(--color-neon-purple)" }}>
                      Recommendations
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed break-words" style={{ color: "var(--color-text-secondary)" }}>
                    {result.recommendations}
                  </p>
                </motion.div>
              )}

              {/* Re-run */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMatch}
                disabled={loading}
                className="btn-neon w-full py-3"
              >
                🔄 Re-Run Match
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
