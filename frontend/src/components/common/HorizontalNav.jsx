import { useRef, useEffect, useState } from "react"
import { cn } from "../../utils/cn"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"

export function HorizontalNav({ items, activeItem, onItemClick, className }) {
  const [showScrollButtons, setShowScrollButtons] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const navRef = useRef(null)

  const checkScroll = () => {
    if (!navRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = navRef.current

    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    setShowScrollButtons(scrollWidth > clientWidth)
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener("resize", checkScroll)
    return () => window.removeEventListener("resize", checkScroll)
  }, [items])

  const scrollLeft = () => {
    if (!navRef.current) return
    navRef.current.scrollBy({ left: -200, behavior: "smooth" })
  }

  const scrollRight = () => {
    if (!navRef.current) return
    navRef.current.scrollBy({ left: 200, behavior: "smooth" })
  }

  // Scroll active item into view
  useEffect(() => {
    if (!navRef.current || !activeItem) return

    const activeElement = navRef.current.querySelector(`[data-item-id="${activeItem}"]`)
    if (activeElement) {
      const { offsetLeft, offsetWidth } = activeElement
      const { scrollLeft, clientWidth } = navRef.current

      // Check if the active element is not fully visible
      if (offsetLeft < scrollLeft || offsetLeft + offsetWidth > scrollLeft + clientWidth) {
        navRef.current.scrollTo({
          left: offsetLeft - clientWidth / 2 + offsetWidth / 2,
          behavior: "smooth",
        })
      }
    }
  }, [activeItem])

  return (
    <div className={cn("relative", className)}>
      {showScrollButtons && (
        <>
          <button
            onClick={scrollLeft}
            className={cn(
              "absolute left-0 top-1/2 z-10 -translate-y-1/2 h-8 w-8 flex items-center justify-center bg-background text-foreground rounded-none shadow-md",
              !canScrollLeft && "opacity-0 pointer-events-none",
            )}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={scrollRight}
            className={cn(
              "absolute right-0 top-1/2 z-10 -translate-y-1/2 h-8 w-8 flex items-center justify-center bg-background text-foreground rounded-none shadow-md",
              !canScrollRight && "opacity-0 pointer-events-none",
            )}
            disabled={!canScrollRight}
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}

      <div
        ref={navRef}
        className="scrollbar-hide overflow-x-auto flex items-center space-x-1 py-2 px-4"
        onScroll={checkScroll}
      >
        {items.map((item) => (
          <motion.button
            key={item.id}
            data-item-id={item.id}
            onClick={() => onItemClick(item.id)}
            className={cn(
              "relative whitespace-nowrap px-4 py-2 text-sm font-medium rounded-none transition-colors",
              activeItem === item.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
            )}
            whileTap={{ scale: 0.97 }}
          >
            <span className="flex items-center gap-2">
              {item.icon && <item.icon size={16} />}
              {item.label}
            </span>
            {activeItem === item.id && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-none"
                layoutId="activeIndicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default HorizontalNav
