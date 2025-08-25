import { useState, useEffect, forwardRef } from "react"
import ApperIcon from "@/components/ApperIcon"
import Input from "@/components/atoms/Input"
import Button from "@/components/atoms/Button"
import { cn } from "@/utils/cn"

const SearchBar = forwardRef(({ 
  onSearch, 
  placeholder = "Search tasks...", 
  className,
  initialValue = ""
}, ref) => {
  const [searchText, setSearchText] = useState(initialValue)
  const [isFocused, setIsFocused] = useState(false)

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchText)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchText, onSearch])

  const handleClear = () => {
    setSearchText("")
    onSearch("")
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClear()
    }
  }

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <ApperIcon 
            name="Search" 
            size={16} 
            className={cn(
              "transition-colors",
              isFocused ? "text-primary-500" : "text-gray-400"
            )}
          />
        </div>
        
        <Input
          ref={ref}
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "pl-10 pr-10 transition-all duration-200",
            isFocused ? "ring-2 ring-primary-500/20 border-primary-500" : "",
            searchText ? "bg-primary-50/50" : ""
          )}
        />
        
        {searchText && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="p-1 h-auto hover:bg-gray-200 rounded-full"
              title="Clear search"
            >
              <ApperIcon name="X" size={14} className="text-gray-400 hover:text-gray-600" />
            </Button>
          </div>
        )}
      </div>
      
      {/* Search suggestions/results count could go here */}
      {searchText && (
        <div className="absolute top-full left-0 right-0 mt-1 text-xs text-gray-500 px-3">
          Searching for "{searchText}"...
        </div>
      )}
    </div>
  )
})

SearchBar.displayName = "SearchBar"

export default SearchBar