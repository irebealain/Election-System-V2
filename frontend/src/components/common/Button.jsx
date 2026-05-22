import { forwardRef } from "react"
import { Link } from "react-router-dom"
import { cn } from "../../utils/cn"
import { motion } from "framer-motion"

// Create a motion-enabled Link component
const MotionLink = motion(Link);

const Button = forwardRef(
  ({ children, className, variant = "default", size = "default", asChild = false, href, to, ...props }, ref) => {
    // Determine the component based on props
    const Comp = asChild ? motion.button : to ? MotionLink : href ? motion.a : motion.button

    const baseStyles =
      "inline-flex items-center justify-center rounded-[20px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"

    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border border-input hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "underline-offset-4 hover:underline text-primary",
    }

    const sizes = {
      default: "h-10 py-2 px-4",
      sm: "h-9 px-3",
      lg: "h-11 px-8",
      icon: "h-10 w-10",
    }

    const linkProps = to ? { to } : href ? { href } : {}

    return (
      <Comp 
        className={cn(baseStyles, variants[variant], sizes[size], className)} 
        ref={ref} 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...linkProps} 
        {...props}
      >
        {children}
      </Comp>
    )
  },
)

Button.displayName = "Button"

export default Button
