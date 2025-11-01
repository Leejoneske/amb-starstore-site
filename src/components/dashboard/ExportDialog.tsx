import { useState } from "react";

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { 
  Download, 
  FileText, 
  Calendar as CalendarIcon,
  Database,
  FileSpreadsheet,
  FileJson
} from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface ExportConfig {
  format: "csv" | "json" | "xlsx"
  dateRange?: {
    from: Date
    to?: Date
  }
  includeFields: string[]
  dataType: "applications" | "ambassadors" | "transactions" | "all"
}

interface ExportDialogProps {
  data?: Record<string, unknown>[]
  dataType?: "applications" | "ambassadors" | "transactions"
  trigger?: React.ReactNode
  onExport?: (config: ExportConfig) => void
}

export function ExportDialog({ 
  data, 
  dataType = "applications", 
  trigger,
  onExport 
}: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<ExportConfig>({
    format: "csv",
    includeFields: [],
    dataType: dataType
  })
  const { toast } = useToast()

  const fieldOptions = {
    applications: [
      { id: "full_name", label: "Full Name" },
      { id: "email", label: "Email" },
      { id: "status", label: "Status" },
      { id: "created_at", label: "Application Date" },
      { id: "experience", label: "Experience" },
      { id: "why_join", label: "Why Join" },
      { id: "referral_strategy", label: "Referral Strategy" }
    ],
    ambassadors: [
      { id: "name", label: "Name" },
      { id: "email", label: "Email" },
      { id: "tier", label: "Current Tier" },
      { id: "referral_code", label: "Referral Code" },
      { id: "total_referrals", label: "Total Referrals" },
      { id: "total_earnings", label: "Total Earnings" },
      { id: "status", label: "Status" },
      { id: "created_at", label: "Join Date" }
    ],
    transactions: [
      { id: "ambassador_name", label: "Ambassador" },
      { id: "amount", label: "Amount" },
      { id: "commission", label: "Commission" },
      { id: "status", label: "Status" },
      { id: "date", label: "Transaction Date" },
      { id: "tier", label: "Tier at Transaction" },
      { id: "stars", label: "Stars Awarded" }
    ]
  }

  const handleFieldToggle = (fieldId: string, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      includeFields: checked 
        ? [...prev.includeFields, fieldId]
        : prev.includeFields.filter(id => id !== fieldId)
    }))
  }

  const handleSelectAll = () => {
    const allFields = fieldOptions[config.dataType].map(field => field.id)
    setConfig(prev => ({
      ...prev,
      includeFields: allFields
    }))
  }

  const handleDeselectAll = () => {
    setConfig(prev => ({
      ...prev,
      includeFields: []
    }))
  }

  const handleExport = async () => {
    if (config.includeFields.length === 0) {
      toast({
        title: "No Fields Selected",
        description: "Please select at least one field to export.",
        variant: "destructive"
      })
      return
    }

    try {
      if (onExport) {
        await onExport(config)
      } else {
        // Default export logic
        await performExport(config)
      }
      
      setIsOpen(false)
      toast({
        title: "Export Successful",
        description: `Data exported as ${config.format.toUpperCase()} file.`,
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting data.",
        variant: "destructive"
      })
    }
  }

  const performExport = async (exportConfig: ExportConfig) => {
    if (!data) return

    let exportData = data
    
    // Apply date filter if specified
    if (exportConfig.dateRange?.from) {
      exportData = data.filter(item => {
        const itemDate = new Date((item.created_at as string) || (item.date as string))
        return itemDate >= exportConfig.dateRange!.from && 
               (!exportConfig.dateRange!.to || itemDate <= exportConfig.dateRange!.to)
      })
    }

    // Filter fields
    const filteredData = exportData.map(item => {
      const filtered: Record<string, unknown> = {}
      exportConfig.includeFields.forEach(field => {
        filtered[field] = item[field]
      })
      return filtered
    })

    // Generate file based on format
    let content: string
    let mimeType: string
    let extension: string

    switch (exportConfig.format) {
      case "csv":
        content = convertToCSV(filteredData)
        mimeType = "text/csv"
        extension = "csv"
        break
      case "json":
        content = JSON.stringify(filteredData, null, 2)
        mimeType = "application/json"
        extension = "json"
        break
      case "xlsx":
        // For XLSX, we'll use CSV for now (can be enhanced with a library like xlsx)
        content = convertToCSV(filteredData)
        mimeType = "text/csv"
        extension = "csv"
        break
      default:
        throw new Error("Unsupported format")
    }

    // Download file
    const blob = new Blob([content], { type: mimeType })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${exportConfig.dataType}_export_${format(new Date(), "yyyy-MM-dd")}.${extension}`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const convertToCSV = (data: Record<string, unknown>[]) => {
    if (data.length === 0) return ""
    
    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(","),
      ...data.map(row => 
        headers.map(header => `"${(row[header] || "").toString().replace(/"/g, '""')}"`).join(",")
      )
    ].join("\n")
    
    return csvContent
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Export Data
          </DialogTitle>
          <DialogDescription>
            Configure your data export settings and download your data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Data Type Selection */}
          <div className="space-y-2">
            <Label>Data Type</Label>
            <Select
              value={config.dataType}
              onValueChange={(value) => setConfig(prev => ({ 
                ...prev, 
                dataType: value as ExportConfig['dataType'],
                includeFields: [] // Reset fields when changing data type
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="applications">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Applications
                  </div>
                </SelectItem>
                <SelectItem value="ambassadors">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Ambassadors
                  </div>
                </SelectItem>
                <SelectItem value="transactions">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Transactions
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select
              value={config.format}
              onValueChange={(value) => setConfig(prev => ({ ...prev, format: value as ExportConfig['format'] }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Comma Separated)</SelectItem>
                <SelectItem value="json">JSON (JavaScript Object)</SelectItem>
                <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {config.dateRange?.from ? (
                    config.dateRange.to ? (
                      <>
                        {format(config.dateRange.from, "LLL dd")} -{" "}
                        {format(config.dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(config.dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>All dates</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={config.dateRange?.from}
                  selected={config.dateRange}
                  onSelect={(range) => setConfig(prev => ({ ...prev, dateRange: range as { from: Date; to?: Date } | undefined }))}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Field Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Fields to Include</Label>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSelectAll}
                  className="h-auto py-1 px-2 text-xs"
                >
                  Select All
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleDeselectAll}
                  className="h-auto py-1 px-2 text-xs"
                >
                  Clear
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-2 border rounded">
              {fieldOptions[config.dataType].map((field) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.id}
                    checked={config.includeFields.includes(field.id)}
                    onCheckedChange={(checked) => handleFieldToggle(field.id, checked as boolean)}
                  />
                  <Label 
                    htmlFor={field.id} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
            
            {config.includeFields.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {config.includeFields.length} field{config.includeFields.length !== 1 ? 's' : ''} selected
              </Badge>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export {config.format.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}