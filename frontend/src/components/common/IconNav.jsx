import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { cn } from "../../utils/cn"

function IconNav({ items, className }) {
  const location = useLocation()
  const [hoveredItem, setHoveredItem] = useState(null)

  return (
    <div className={cn("flex flex-row space-y-1 align-center gap-4 bg-background py-1 px-2 rounded-[40px]", className)}>
      {items.map((item, index) => {
        const isActive = location.pathname === item.href || location.pathname.startsWith(item.href)

        return (
          <Link
            key={index}
            to={item.href}
            className={cn(
              "relative flex h-10 items-center self-center rounded-[20px] px-4 py-2 text-sm font-medium transition-all !mt-0",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
            onMouseEnter={() => setHoveredItem(index)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div className="flex items-center">
              {item.icon && <item.icon className="h-5 w-5" />}
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{
                  width: hoveredItem === index || isActive ? "auto" : 0,
                  opacity: hoveredItem === index || isActive ? 1 : 0,
                }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <span className="ml-2">{item.label}</span>
              </motion.div>
            </div>
            {item.badge && (
              <div className="ml-auto">
                <item.badge />
              </div>
            )}
          </Link>
        )
      })}
    </div>
  )
}

export default IconNav
