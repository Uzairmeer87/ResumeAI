import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "./Loader";

const API_BASE = "http://localhost:5000";

export default function Upload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const inputRef = useRef(null);

  /* ── Drag handlers ── */
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped?.type === "application/pdf") {
      setFile(dropped);
      setError("");
      setSuccess(false);
    } else {
      setError("Only PDF files are accepted.");
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setError("");
      setSuccess(false);
    }
  };

  /* ── Upload to backend ── */
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      console.log("[Upload] Sending PDF to", `${API_BASE}/upload`);

      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
        // NOTE: Do NOT set Content-Type for FormData — browser sets multipart boundary automatically
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error (${res.status})`);
      }

      const data = await res.json();
      console.log("[Upload] Success — extracted", data.cleanText?.length, "chars");
      setSuccess(true);
      onUploadSuccess(data);
    } catch (err) {
      console.error("[Upload] Failed:", err);
      if (err.name === "TypeError" && err.message === "Failed to fetch") {
        setError("Cannot connect to backend. Make sure the server is running at " + API_BASE);
      } else {
        setError(err.message || "Upload failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Format file size ── */
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <motion.section
      id="upload"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      <div className="glass-card glass-card-hover p-8 md:p-10 transition-all duration-300">
        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(0, 240, 255, 0.08)", border: "1px solid rgba(0, 240, 255, 0.15)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon-cyan)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <div>
            <h2 className="section-title" style={{ fontSize: "1.35rem" }}>Upload Your Resume</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>PDF format • Max 10 MB</p>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          className={`drop-zone ${dragActive ? "active" : ""}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
            id="resume-file-input"
          />

          {/* Upload Icon */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(0, 240, 255, 0.06)",
              border: "1px solid rgba(0, 240, 255, 0.15)",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-neon-cyan)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>

          <div className="text-center">
            <p className="font-medium" style={{ color: "var(--color-text-primary)" }}>
              Drag & drop your resume here
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
              or click to browse
            </p>
          </div>
        </div>

        {/* Selected file info */}
        <AnimatePresence>
          {file && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
              style={{
                background: "rgba(0, 240, 255, 0.04)",
                border: "1px solid rgba(0, 240, 255, 0.12)",
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(0, 240, 255, 0.08)" }}
                >
                  <span className="text-sm">📎</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {formatSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setSuccess(false);
                  setError("");
                  if (inputRef.current) inputRef.current.value = "";
                }}
                className="text-xs px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105"
                style={{
                  color: "var(--color-neon-red)",
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                }}
              >
                Remove
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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

        {/* Success */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="success-banner mt-4"
            >
              ✅ Resume uploaded and parsed successfully!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Button / Loader */}
        {loading ? (
          <Loader text="Extracting text from PDF..." />
        ) : (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleUpload}
            disabled={!file || loading}
            className="btn-neon w-full mt-6"
            id="upload-btn"
          >
            🚀 Upload & Extract
          </motion.button>
        )}
      </div>
    </motion.section>
  );
}
