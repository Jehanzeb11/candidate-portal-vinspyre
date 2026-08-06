import * as React from "react"
import { cn } from "@/utils/cn"

export interface RadioGroupContextType {
  value: string | undefined
  onChange: (value: string) => void
  disabled?: boolean
}

const RadioGroupContext = React.createContext<RadioGroupContextType | undefined>(undefined)

function useRadioGroup() {
  const context = React.useContext(RadioGroupContext)
  if (!context) {
    throw new Error("RadioGroupItem must be used within RadioGroup")
  }
  return context
}

interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, disabled, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(value ?? "")

    const handleChange = (newValue: string) => {
      setInternalValue(newValue)
      onValueChange?.(newValue)
    }

    return (
      <RadioGroupContext.Provider
        value={{
          value: value ?? internalValue,
          onChange: handleChange,
          disabled,
        }}
      >
        <div
          ref={ref}
          className={cn("grid gap-2", className)}
          {...props}
        />
      </RadioGroupContext.Provider>
    )
  }
)
RadioGroup.displayName = "RadioGroup"

interface RadioGroupItemProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  id: string
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, id, disabled, ...props }, ref) => {
    const { value, onChange, disabled: groupDisabled } = useRadioGroup()
    const isDisabled = disabled || groupDisabled

    return (
      <div className="flex items-center">
        <input
          ref={ref}
          type="radio"
          id={id}
          disabled={isDisabled}
          checked={value === props.value}
          onChange={(e) => {
            if (e.target.checked && props.value) {
              onChange(String(props.value))
            }
          }}
          className={cn(
            "h-4 w-4 rounded-full border border-primary cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
