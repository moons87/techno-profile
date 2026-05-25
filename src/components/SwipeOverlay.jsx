import { useTransform } from "framer-motion";
import { motion } from "framer-motion";

function SwipeOverlay({ dragX }) {
  const likeOpacity = useTransform(dragX, [30, 120], [0, 1], { clamp: true });
  const skipOpacity = useTransform(dragX, [-120, -30], [1, 0], { clamp: true });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 28,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 2,
      }}
    >
      {/* Green LIKE background overlay */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(110,255,140,0.28)",
          opacity: likeOpacity,
        }}
      />

      {/* Red SKIP background overlay */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(255,90,90,0.28)",
          opacity: skipOpacity,
        }}
      />

      {/* LIKE stamp */}
      <motion.div
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          rotate: -20,
          border: "3px solid #6eff8c",
          borderRadius: 8,
          padding: "4px 14px",
          color: "#6eff8c",
          fontSize: "2.2rem",
          fontWeight: 900,
          opacity: likeOpacity,
          userSelect: "none",
        }}
      >
        LIKE
      </motion.div>

      {/* SKIP stamp */}
      <motion.div
        style={{
          position: "absolute",
          top: 24,
          right: 24,
          rotate: 20,
          border: "3px solid #ff6b6b",
          borderRadius: 8,
          padding: "4px 14px",
          color: "#ff6b6b",
          fontSize: "2.2rem",
          fontWeight: 900,
          opacity: skipOpacity,
          userSelect: "none",
        }}
      >
        SKIP
      </motion.div>
    </div>
  );
}

export default SwipeOverlay;
