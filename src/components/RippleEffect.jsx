import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

function RippleEffect({ active, children }) {
  const [count, setCount] = useState(0);
  const prevActive = useRef(false);

  useEffect(() => {
    if (active && !prevActive.current) {
      setCount((c) => c + 1);
    }
    prevActive.current = active;
  }, [active]);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {children}
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            key={count}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "rgba(111,228,255,0.5)",
              marginTop: -10,
              marginLeft: -10,
              pointerEvents: "none",
              zIndex: 10,
            }}
            initial={{ scale: 0, opacity: 0.9 }}
            animate={{ scale: 20, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default RippleEffect;
