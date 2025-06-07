"use client"

import { useState } from "react"
import {
  BarChart,
  BarChart3,
  Calendar,
  Download,
  FileText,
  Loader2,
  PieChart,
  Plus,
  Printer,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import DashboardLayout from "@/components/dashboard-layout"

export default function ReportsPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportType, setReportType] = useState("collections")
  const [timeframe, setTimeframe] = useState("week")

  const handleGenerateReport = () => {
    setIsGenerating(true)

    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false)
    }, 2000)
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-gray-500">Generate and view collection reports and analytics</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate New Report</DialogTitle>
              <DialogDescription>Select the type of report and timeframe you want to generate.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="report-type" className="text-right">
                  Report Type
                </Label>
                <div className="col-span-3">
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="collections">Collections Summary</SelectItem>
                      <SelectItem value="collectors">Collector Performance</SelectItem>
                      <SelectItem value="vendors">Vendor Compliance</SelectItem>
                      <SelectItem value="areas">Area Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="timeframe" className="text-right">
                  Timeframe
                </Label>
                <div className="col-span-3">
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {timeframe === "custom" && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="start-date" className="text-right">
                      Start Date
                    </Label>
                    <div className="col-span-3">
                      <Input id="start-date" type="date" />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="end-date" className="text-right">
                      End Date
                    </Label>
                    <div className="col-span-3">
                      <Input id="end-date" type="date" />
                    </div>
                  </div>
                </>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="format" className="text-right">
                  Format
                </Label>
                <div className="col-span-3">
                  <Select defaultValue="pdf">
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleGenerateReport} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Report"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <Tabs defaultValue="dashboard">
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="saved">Saved Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Collections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$12,450.00</div>
                  <p className="text-xs text-emerald-600 flex items-center mt-1">
                    <span className="i-lucide-trending-up mr-1"></span>
                    +15% from last week
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87%</div>
                  <p className="text-xs text-emerald-600 flex items-center mt-1">
                    <span className="i-lucide-trending-up mr-1"></span>
                    +5% from last week
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Collectors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-gray-500 flex items-center mt-1">Out of 10 total collectors</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pending Sync</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <div className="mt-1">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Sync Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Collections by Day</CardTitle>
                      <CardDescription>Daily collection amounts for the past week</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      This Week
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[300px] flex items-center justify-center">
                    <BarChart3 className="h-16 w-16 text-gray-300" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Collections by Type</CardTitle>
                      <CardDescription>Breakdown of collections by tax type</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      This Month
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[300px] flex items-center justify-center">
                    <PieChart className="h-16 w-16 text-gray-300" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Collector Performance</CardTitle>
                    <CardDescription>Collection amounts by collector</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    This Month
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[300px] flex items-center justify-center">
                  <BarChart className="h-16 w-16 text-gray-300" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedReports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{report.title}</CardTitle>
                      <div className="bg-gray-100 p-2 rounded-full">
                        <FileText className="h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                    <CardDescription>{report.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{report.date}</span>
                      </div>
                      <div>
                        <Badge variant="outline">{report.type}</Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">
                      <Printer className="h-4 w-4 mr-1" />
                      Print
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

function Badge({ children, variant = "default" }) {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
  const variantClasses = {
    default: "bg-emerald-100 text-emerald-800",
    outline: "border border-gray-200 text-gray-800",
  }

  return <span className={`${baseClasses} ${variantClasses[variant]}`}>{children}</span>
}

const savedReports = [
  {
    id: 1,
    title: "Monthly Collections Summary",
    description: "Summary of all collections for April 2025",
    date: "Apr 19, 2025",
    type: "PDF",
  },
  {
    id: 2,
    title: "Collector Performance Q1",
    description: "Performance analysis of all collectors for Q1 2025",
    date: "Apr 10, 2025",
    type: "Excel",
  },
  {
    id: 3,
    title: "Vendor Compliance Report",
    description: "Analysis of vendor payment compliance",
    date: "Apr 5, 2025",
    type: "PDF",
  },
  {
    id: 4,
    title: "Area Analysis - Downtown",
    description: "Collection analysis for Downtown district",
    date: "Mar 28, 2025",
    type: "PDF",
  },
  {
    id: 5,
    title: "Weekly Collections",
    description: "Collections for week of April 12-18, 2025",
    date: "Apr 18, 2025",
    type: "CSV",
  },
  {
    id: 6,
    title: "Tax Type Breakdown",
    description: "Analysis of collections by tax type",
    date: "Apr 15, 2025",
    type: "Excel",
  },
]
