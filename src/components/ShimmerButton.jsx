import { motion } from "framer-motion";

function ShimmerButton({ children, ...props }) {
  return (
    <button {...props} style={{ position: "relative", overflow: "hidden", ...props.style }}>
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)",
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
        transition={{ duration: 2.2, ease: "linear", repeat: Infinity, repeatDelay: 1.4 }}
      />
    </button>
  );
}

export default ShimmerButton;
