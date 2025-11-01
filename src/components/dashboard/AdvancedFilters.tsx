import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  Search,
  SlidersHorizontal
} from "lucide-react"
import { format } from "date-fns"

export interface FilterConfig {
  search?: string
  status?: string
  tier?: string
  dateRange?: {
    from: Date
    to: Date
  }
  minAmount?: number
  maxAmount?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

interface AdvancedFiltersProps {
  filters: FilterConfig
  onFiltersChange: (filters: FilterConfig) => void
  showStatusFilter?: boolean
  showTierFilter?: boolean
  showAmountFilter?: boolean
  showDateFilter?: boolean
  placeholder?: string
  className?: string
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  showStatusFilter = true,
  showTierFilter = true,
  showAmountFilter = true,
  showDateFilter = true,
  placeholder = "Search...",
  className = ""
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const updateFilter = (key: keyof FilterConfig, value: string | { from: Date; to: Date } | { min: number; max: number }) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "rejected", label: "Rejected" }
  ]

  const tierOptions = [
    { value: "all", label: "All Tiers" },
    { value: "explorer", label: "Explorer" },
    { value: "pioneer", label: "Pioneer" },
    { value: "champion", label: "Champion" },
    { value: "legend", label: "Legend" }
  ]

  const sortOptions = [
    { value: "created_at", label: "Date Created" },
    { value: "updated_at", label: "Last Updated" },
    { value: "amount", label: "Amount" },
    { value: "name", label: "Name" },
    { value: "earnings", label: "Earnings" },
    { value: "referrals", label: "Referrals" }
  ]

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Quick Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={placeholder}
            value={filters.search || ""}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Advanced Filters</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="h-auto p-1 text-xs"
                >
                  Clear All
                </Button>
              </div>

              {/* Status Filter */}
              {showStatusFilter && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Status</Label>
                  <Select
                    value={filters.status || "all"}
                    onValueChange={(value) => updateFilter("status", value === "all" ? undefined : value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Tier Filter */}
              {showTierFilter && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Tier</Label>
                  <Select
                    value={filters.tier || "all"}
                    onValueChange={(value) => updateFilter("tier", value === "all" ? undefined : value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tierOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Amount Range */}
              {showAmountFilter && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Amount Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minAmount || ""}
                      onChange={(e) => updateFilter("minAmount", e.target.value ? Number(e.target.value) : undefined)}
                      className="h-8"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxAmount || ""}
                      onChange={(e) => updateFilter("maxAmount", e.target.value ? Number(e.target.value) : undefined)}
                      className="h-8"
                    />
                  </div>
                </div>
              )}

              {/* Date Range */}
              {showDateFilter && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Date Range</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-8 justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {filters.dateRange?.from ? (
                          filters.dateRange.to ? (
                            <>
                              {format(filters.dateRange.from, "LLL dd")} -{" "}
                              {format(filters.dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(filters.dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={filters.dateRange?.from}
                        selected={filters.dateRange}
                        onSelect={(range) => updateFilter("dateRange", range)}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {/* Sort Options */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Sort By</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={filters.sortBy || "created_at"}
                    onValueChange={(value) => updateFilter("sortBy", value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.sortOrder || "desc"}
                    onValueChange={(value) => updateFilter("sortOrder", value as "asc" | "desc")}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Newest First</SelectItem>
                      <SelectItem value="asc">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="text-xs">
              Search: {filters.search}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto w-auto p-0 ml-1"
                onClick={() => updateFilter("search", undefined)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary" className="text-xs">
              Status: {filters.status}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto w-auto p-0 ml-1"
                onClick={() => updateFilter("status", undefined)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.tier && (
            <Badge variant="secondary" className="text-xs">
              Tier: {filters.tier}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto w-auto p-0 ml-1"
                onClick={() => updateFilter("tier", undefined)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {(filters.minAmount || filters.maxAmount) && (
            <Badge variant="secondary" className="text-xs">
              Amount: ${filters.minAmount || 0} - ${filters.maxAmount || "∞"}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto w-auto p-0 ml-1"
                onClick={() => {
                  updateFilter("minAmount", undefined)
                  updateFilter("maxAmount", undefined)
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.dateRange && (
            <Badge variant="secondary" className="text-xs">
              Date: {format(filters.dateRange.from, "MMM dd")} - {format(filters.dateRange.to || filters.dateRange.from, "MMM dd")}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto w-auto p-0 ml-1"
                onClick={() => updateFilter("dateRange", undefined)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}