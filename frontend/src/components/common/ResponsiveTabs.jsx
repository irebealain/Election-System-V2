import React, { useRef, useState, useEffect } from "react"
import { cn } from "../../utils/cn"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Tabs, TabsList } from "./Tabs"

export function ResponsiveTabs({ className, children, defaultValue, ...props }) {
  const [showScrollButtons, setShowScrollButtons] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const tabsListRef = useRef(null)

  const checkScroll = () => {
    if (!tabsListRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = tabsListRef.current

    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    setShowScrollButtons(scrollWidth > clientWidth)
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener("resize", checkScroll)
    return () => window.removeEventListener("resize", checkScroll)
  }, [])

  const scrollLeft = () => {
    if (!tabsListRef.current) return
    tabsListRef.current.scrollBy({ left: -200, behavior: "smooth" })
  }

  const scrollRight = () => {
    if (!tabsListRef.current) return
    tabsListRef.current.scrollBy({ left: 200, behavior: "smooth" })
  }

  // Clone TabsList to add ref and onScroll
  const enhancedChildren = React.Children.map(children, (child) => {
    if (child.type === TabsList) {
      return React.cloneElement(child, {
        ref: tabsListRef,
        onScroll: checkScroll,
        className: cn("scrollbar-hide overflow-x-auto", showScrollButtons && "mx-8", child.props.className),
      })
    }
    return child
  })

  return (
    <div className={cn("relative", className)}>
      <Tabs defaultValue={defaultValue} {...props}>
        {showScrollButtons && (
          <>
            <button
              onClick={scrollLeft}
              className={cn(
                "absolute left-0 top-0 z-10 h-10 w-8 flex items-center justify-center bg-muted text-muted-foreground rounded-none",
                !canScrollLeft && "opacity-50 cursor-not-allowed",
              )}
              disabled={!canScrollLeft}
              aria-label="Scroll tabs left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={scrollRight}
              className={cn(
                "absolute right-0 top-0 z-10 h-10 w-8 flex items-center justify-center bg-muted text-muted-foreground rounded-none",
                !canScrollRight && "opacity-50 cursor-not-allowed",
              )}
              disabled={!canScrollRight}
              aria-label="Scroll tabs right"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
        {enhancedChildren}
      </Tabs>
    </div>
  )
}

export { TabsTrigger, TabsContent } from "./Tabs"
