import { useState } from "react"
import { cn } from "@/utils/cn"
import Input from "@/components/atoms/Input"

const ColorPicker = ({ value, onChange, className }) => {
  const [showCustom, setShowCustom] = useState(false)
  
  const presetColors = [
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#10B981", // Emerald
    "#3B82F6", // Blue
    "#F59E0B", // Amber
    "#EF4444", // Red
    "#6366F1", // Indigo
    "#84CC16", // Lime
    "#F97316", // Orange
    "#8B5A2B", // Brown
    "#6B7280", // Gray
    "#1F2937"  // Dark Gray
  ]

  const handleColorClick = (color) => {
    onChange(color)
    setShowCustom(false)
  }

  const handleCustomColorChange = (e) => {
    onChange(e.target.value)
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap gap-2">
        {presetColors.map((color) => (
          <button
            key={color}
            type="button"
            className={cn(
              "w-8 h-8 rounded-full border-2 transition-all hover:scale-110",
              value === color ? "border-gray-400 shadow-md" : "border-gray-200 hover:border-gray-300"
            )}
            style={{ backgroundColor: color }}
            onClick={() => handleColorClick(color)}
            title={`Select ${color}`}
          />
        ))}
        
        <button
          type="button"
          className={cn(
            "w-8 h-8 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-500 hover:border-gray-500 transition-all",
            showCustom && "bg-gray-50"
          )}
          onClick={() => setShowCustom(!showCustom)}
          title="Custom color"
        >
          +
        </button>
      </div>
      
      {showCustom && (
        <div className="flex items-center gap-2">
          <Input
            type="color"
            value={value}
            onChange={handleCustomColorChange}
            className="w-16 h-8 p-1 cursor-pointer"
          />
          <Input
            type="text"
            value={value}
            onChange={handleCustomColorChange}
            placeholder="#000000"
            className="font-mono text-sm flex-1"
            maxLength={7}
          />
        </div>
      )}
      
      {value && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div
            className="w-4 h-4 rounded border border-gray-300"
            style={{ backgroundColor: value }}
          />
          <span>Selected: {value}</span>
        </div>
      )}
    </div>
  )
}

export default ColorPicker