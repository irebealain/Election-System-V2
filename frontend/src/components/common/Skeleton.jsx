import { cn } from "../../utils/cn"
import { motion } from "framer-motion"

function Skeleton({ className, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{
        repeat: Infinity,
        repeatType: "reverse",
        duration: 1,
        ease: "easeInOut",
      }}
      className={cn("rounded-[20px] bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
