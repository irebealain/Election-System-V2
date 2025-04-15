"use client"

import React, { forwardRef } from "react"
import { cn } from "../../utils/cn"

export const AccessibleSwitch = forwardRef(
  ({ className, checked, onCheckedChange, disabled, id, label, description, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(checked || false)
    const [hasFocus, setHasFocus] = React.useState(false)
    const uniqueId = React.useRef(id || `switch-${React.useId()}`).current

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
      <div className="flex items-center justify-between space-x-2">
        {(label || description) && (
          <div className="space-y-0.5">
            {label && (
              <label htmlFor={uniqueId} className="text-sm font-medium cursor-pointer">
                {label}
              </label>
            )}
            {description && (
              <p id={`${uniqueId}-description`} className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}
        <div
          className={cn(
            "relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full transition-colors",
            isChecked ? "bg-primary" : "bg-input",
            hasFocus && "ring-2 ring-offset-2 ring-primary",
            disabled && "cursor-not-allowed opacity-50",
            className,
          )}
        >
          <input
            type="checkbox"
            className="sr-only"
            id={uniqueId}
            ref={ref}
            checked={isChecked}
            onChange={handleToggle}
            disabled={disabled}
            onFocus={() => setHasFocus(true)}
            onBlur={() => setHasFocus(false)}
            aria-describedby={description ? `${uniqueId}-description` : undefined}
            {...props}
          />
          <span
            className={cn(
              "pointer-events-none absolute mx-[2px] h-[20px] w-[20px] rounded-full bg-background shadow-lg ring-0 transition-transform",
              isChecked ? "translate-x-5" : "translate-x-0",
            )}
            aria-hidden="true"
          />
        </div>
      </div>
    )
  },
)

AccessibleSwitch.displayName = "AccessibleSwitch"