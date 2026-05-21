import { createContext, useContext, useState, useEffect } from "react"
import { cn } from "../../utils/cn"

// Create context for tabs state management
const TabsContext = createContext(null)

export default function Tabs({ defaultValue, value, onValueChange, className, children, ...props }) {
  const [selectedTab, setSelectedTab] = useState(value || defaultValue || "")

  // Update internal state when controlled value changes
  useEffect(() => {
    if (value !== undefined) {
      setSelectedTab(value)
    }
  }, [value])

  const handleTabChange = (newValue) => {
    if (value === undefined) {
      setSelectedTab(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <TabsContext.Provider value={{ selectedTab, handleTabChange }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, children, ...props }) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-none bg-muted p-4 text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({ value, className, children, disabled = false, ...props }) {
  const { selectedTab, handleTabChange } = useContext(TabsContext)
  const isSelected = selectedTab === value

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isSelected}
      aria-controls={`tabpanel-${value}`}
      disabled={disabled}
      data-state={isSelected ? "active" : "inactive"}
      onClick={() => handleTabChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-none px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isSelected ? "bg-background text-foreground shadow-sm" : "hover:bg-background/50 hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, className, children, forceMount = false, ...props }) {
  const { selectedTab } = useContext(TabsContext)
  const isSelected = selectedTab === value

  if (!forceMount && !isSelected) {
    return null
  }

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      data-state={isSelected ? "active" : "inactive"}
      tabIndex={isSelected ? 0 : -1}
      hidden={!isSelected}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isSelected ? "animate-in fade-in-0 zoom-in-95" : "animate-out fade-out-0 zoom-out-95",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
