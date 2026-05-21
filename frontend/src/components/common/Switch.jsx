import React, { forwardRef } from "react"
import { cn } from "../../utils/cn"

export const Switch = forwardRef(({ className, checked, onCheckedChange, disabled, id, ...props }, ref) => {
  const [isChecked, setIsChecked] = React.useState(checked || false)

  React.useEffect(() => {
    if (checked !== undefined) {
      setIsChecked(checked)
    }
  }, [checked])

  const handleToggle = (event) => {
    const newValue = event.target.checked

    if (checked === undefined) {
      setIsChecked(newValue)
    }

    if (onCheckedChange) {
      onCheckedChange(newValue)
    }
  }

  return (
    <label
      className={cn(
        "relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-none transition-colors",
        isChecked ? "bg-primary" : "bg-input",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      htmlFor={id}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        id={id}
        ref={ref}
        checked={isChecked}
        onChange={handleToggle}
        disabled={disabled}
        {...props}
      />
      <span
        className={cn(
          "pointer-events-none absolute mx-[2px] h-[20px] w-[20px] rounded-none bg-background shadow-lg ring-0 transition-transform",
          isChecked ? "translate-x-5" : "translate-x-0",
        )}
        aria-hidden="true"
      />
    </label>
  )
})

Switch.displayName = "Switch"
