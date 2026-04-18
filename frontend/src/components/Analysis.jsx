import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "./Loader";

const API_BASE = "http://localhost:5000";

const SECTION_META = {
  summary:     { icon: "📋", label: "Summary",     color: "var(--color-neon-cyan)"   },
  strengths:   { icon: "💪", label: "Strengths",   color: "var(--color-neon-green)"  },
  weaknesses:  { icon: "⚠️",  label: "Weaknesses",  color: "var(--color-neon-red)"    },
  suggestions: { icon: "💡", label: "Suggestions", color: "var(--color-neon-purple)" },
};

export default function Analysis({ cleanText }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      console.log("[Analysis] Sending to", `${API_BASE}/analyze`);

      const res = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cleanText }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error (${res.status})`);
      }

      const data = await res.json();
      console.log("[Analysis] Success:", Object.keys(data));
      setResult(data);
    } catch (err) {
      console.error("[Analysis] Failed:", err);
      if (err.name === "TypeError" && err.message === "Failed to fetch") {
        setError("Cannot connect to backend. Make sure the server is running at " + API_BASE);
      } else {
        setError(err.message || "Analysis failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* Parse AI response into display sections */
  const parseSections = (data) => {
    if (!data) return [];

    // Structured response from backend
    if (data.summary || data.strengths || data.weaknesses || data.suggestions) {
      return [
        data.summary     && { key: "summary",     ...SECTION_META.summary,     content: data.summary     },
        data.strengths   && { key: "strengths",   ...SECTION_META.strengths,   content: data.strengths   },
        data.weaknesses  && { key: "weaknesses",  ...SECTION_META.weaknesses,  content: data.weaknesses  },
        data.suggestions && { key: "suggestions", ...SECTION_META.suggestions, content: data.suggestions },
      ].filter(Boolean);
    }

    // Single text block
    if (data.analysis || data.text || data.result) {
      return [{
        key: "summary",
        ...SECTION_META.summary,
        label: "AI Analysis",
        content: data.analysis || data.text || data.result,
      }];
    }

    // Fallback
    return [{ key: "summary", ...SECTION_META.summary, label: "AI Analysis", content: JSON.stringify(data, null, 2) }];
  };

  const sections = parseSections(result);

  const cardVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.97 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { delay: i * 0.12, duration: 0.5, ease: "easeOut" },
    }),
  };

  return (
    <motion.section
      id="analysis"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      <div className="glass-card glass-card-hover p-8 md:p-10 transition-all duration-300">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(168, 85, 247, 0.08)", border: "1px solid rgba(168, 85, 247, 0.15)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon-purple)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <h2 className="section-title" style={{ fontSize: "1.35rem" }}>AI-Powered Analysis</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              Strengths, weaknesses & actionable suggestions
            </p>
          </div>
        </div>

        {/* Trigger Button */}
        {!result && !loading && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAnalyze}
            disabled={loading}
            className="btn-neon btn-neon-purple w-full mt-6"
            id="analyze-btn"
          >
            ✨ Analyze Resume with AI
          </motion.button>
        )}

        {/* Loader */}
        {loading && <Loader text="AI is analyzing your resume..." />}

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="error-banner mt-4"
            >
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {sections.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="mt-6 space-y-4"
            >
              {sections.map((section, i) => (
                <motion.div
                  key={section.key}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="glass-card glass-card-hover p-5 transition-all duration-300 cursor-default"
                  style={{
                    borderLeftWidth: "3px",
                    borderLeftStyle: "solid",
                    borderLeftColor: section.color,
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{section.icon}</span>
                    <h3
                      className="font-semibold text-base"
                      style={{ color: section.color }}
                    >
                      {section.label}
                    </h3>
                  </div>
                  <div
                    className="text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {Array.isArray(section.content)
                      ? section.content.map((item, j) => (
                          <p key={j} className="mb-1.5 flex gap-2">
                            <span style={{ color: section.color }}>•</span>
                            <span>{item}</span>
                          </p>
                        ))
                      : section.content}
                  </div>
                </motion.div>
              ))}

              {/* Re-analyze button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAnalyze}
                disabled={loading}
                className="btn-neon btn-neon-purple w-full mt-2"
              >
                🔄 Re-Analyze
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
