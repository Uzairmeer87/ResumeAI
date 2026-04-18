import { motion } from "framer-motion";

export default function Loader({ text = "Processing..." }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-4 py-10"
    >
      {/* Spinning ring */}
      <div className="relative w-16 h-16">
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: "var(--color-neon-cyan)",
            borderRightColor: "var(--color-neon-purple)",
            animation: "spin 1s linear infinite",
          }}
        />
        <div
          className="absolute inset-2 rounded-full border-2 border-transparent"
          style={{
            borderBottomColor: "var(--color-neon-blue)",
            borderLeftColor: "var(--color-neon-pink)",
            animation: "spin 1.5s linear infinite reverse",
          }}
        />
        {/* Center dot */}
        <div
          className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{
            background: "var(--color-neon-cyan)",
            boxShadow: "0 0 12px var(--color-neon-cyan)",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      </div>

      <p
        className="text-sm font-medium tracking-wide"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {text}
      </p>

      {/* Inline keyframes */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(0.8); }
          50%      { opacity: 1; transform: translate(-50%, -50%) scale(1.3); }
        }
      `}</style>
    </motion.div>
  );
}
