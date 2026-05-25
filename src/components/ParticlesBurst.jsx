import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const COLORS = ["#6fe4ff", "#91ffa7", "#ffc978", "#ff7c93", "#c4b6ff", "#b9f8ff"];

function ParticlesBurst({ burst }) {
  const [activeKey, setActiveKey] = useState(null);

  useEffect(() => {
    if (burst > 0) setActiveKey(Date.now());
  }, [burst]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 20,
      }}
    >
      <AnimatePresence>
        {activeKey !== null &&
          Array.from({ length: 24 }, (_, i) => (
            <motion.div
              key={`${activeKey}-${i}`}
              style={{
                position: "absolute",
                top: -20,
                left: `${(i * 13) % 100}%`,
                width: 8 + (i % 3) * 4,
                height: 16 + (i % 4) * 5,
                borderRadius: 4,
                background: COLORS[i % 6],
              }}
              initial={{ y: -20, opacity: 0, rotate: 0, x: 0 }}
              animate={{
                y: 380,
                opacity: [0, 1, 1, 0],
                rotate: (i % 2 === 0 ? 1 : -1) * (180 + i * 22),
                x: (i % 2 === 0 ? 1 : -1) * (20 + (i % 40)),
              }}
              transition={{
                duration: 1.6 + (i % 4) * 0.18,
                delay: (i % 6) * 0.06,
                ease: "easeIn",
              }}
            />
          ))}
      </AnimatePresence>
    </div>
  );
}

export default ParticlesBurst;
