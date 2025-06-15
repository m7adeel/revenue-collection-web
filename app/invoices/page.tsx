"use client"

import { useEffect, useState } from "react"
import { Building2, CreditCard, Download, Filter, Home, Loader2, MoreVertical, Plus, Search, RefreshCw, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardLayout from "@/components/dashboard-layout"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/utils/supabase"
import { INVOICE_STATUS } from "@/utils/constants"
import { useAuthStore } from "@/providers/authStoreProvider"
import { addInvoice, deleteInvoice } from "@/services/db"
import { Table, TableBody, TableHeader, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

interface Payer {
  id: number
  first_name: string
  last_name: string
  email: string
}

interface Property {
  id: number
  address: string
  type: string
}

interface Invoice {
  id: string
  date: string
  amount_due: number
  due_date: string
  notes: string
  status: string
  ref_no: string
  last_modified_date: string
  payer?: Payer
  created_by?: {
    id: string
    first_name: string
    last_name: string
    phone: string
  }
}

interface FilterState {
  search: string
  status: string
  dateRange: {
    start: string
    end: string
  }
  amountRange: {
    min: string
    max: string
  }
  payer: string
}

interface NewInvoiceFormData {
  ref_no: string
  payer: string
  amount_due: number
  due_date: string
  notes: string
  status: string
}

export default function Invoices() {
  const { toast } = useToast();

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [payers, setPayers] = useState<Payer[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    dateRange: {
      start: '',
      end: ''
    },
    amountRange: {
      min: '',
      max: ''
    },
    payer: ''
  })
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const { user } = useAuthStore()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Fetch invoices
      const { data: invoicesWithPayers, error: invoicesError } = await supabase
        .from("invoice")
        .select(`
          *,
          payer: payer (
            id,
            first_name,
            last_name,
            email
          ),
          created_by: user (
            id,
            first_name,
            last_name,
            phone
          )
        `)

      if (invoicesError) {
        console.error('Error fetching invoices:', invoicesError)
        toast({
          title: "Error",
          description: "Failed to fetch invoices",
          variant: "destructive"
        })
        return
      }

      setInvoices(invoicesWithPayers || [])
      setFilteredInvoices(invoicesWithPayers || [])
      setTotalItems(invoicesWithPayers?.length || 0)

      // Fetch payers
      const { data: payers, error: payersError } = await supabase
        .from("payer")
        .select("id, first_name, last_name, email")

      if (payersError) {
        console.error('Error fetching payers:', payersError)
        toast({
          title: "Error",
          description: "Failed to fetch payers",
          variant: "destructive"
        })
        return
      }

      setPayers(payers || [])

      // Fetch properties
      const { data: properties, error: propertiesError } = await supabase
        .from("property")
        .select("id, address, type")

      if (propertiesError) {
        console.error('Error fetching properties:', propertiesError)
        toast({
          title: "Error",
          description: "Failed to fetch properties",
          variant: "destructive"
        })
        return
      }

      setProperties(properties || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleNewInvoice = async (formData: NewInvoiceFormData) => {
    try {
      setIsLoading(true)
      
      if (!formData.payer) {
        throw new Error('Please select a payer')
      }

      // Create the invoice object
      const invoice = {
        payer: formData.payer,
        amount_due: Number(formData.amount_due),
        due_date: formData.due_date,
        notes: formData.notes,
        status: INVOICE_STATUS.UNPAID,
        ref_no: formData.ref_no
      }

      // Save to database
      const savedInvoice = await addInvoice(invoice)
      
      // Update local state
      const newInvoice: Invoice = {
        id: savedInvoice[0].id,
        date: new Date().toISOString(),
        amount_due: Number(formData.amount_due),
        due_date: formData.due_date,
        notes: formData.notes,
        status: INVOICE_STATUS.UNPAID,
        payer: Number(formData.payer),
        ref_no: formData.ref_no,
        last_modified_date: new Date().toISOString(),
      }

      setInvoices([newInvoice, ...invoices])
    } catch (error) {
      console.error('Error saving invoice:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditInvoice = async (formData: NewInvoiceFormData) => {
    try {
      setIsLoading(true)
      
      if (!selectedInvoice) return

      // Create the update object
      const updateData = {
        payer: formData.payer.id,
        amount_due: Number(formData.amount_due),
        due_date: formData.due_date,
        notes: formData.notes,
        ref_no: formData.ref_no,
        status: formData.status,
        last_modified_date: new Date().toISOString(),
      }

      // Update in database
      const { data: updatedInvoice, error } = await supabase
        .from('invoice')
        .update(updateData)
        .eq('id', selectedInvoice.id)
        .select(`
          *,
          payer: payer (
            id,
            first_name,
            last_name,
            email
          ),
          created_by: user (
            id,
            first_name,
            last_name,
            phone
          )
        `)
        .single()

      if (error) {
        throw error
      }

      // Update local state
      setInvoices(invoices.map(invoice => 
        invoice.id === selectedInvoice.id ? updatedInvoice : invoice
      ))

      setIsEditDialogOpen(false)
    } catch (error) {
      console.error('Error updating invoice:', error)
      // You might want to show an error toast/notification here
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const filtered = invoices.filter(invoice => {
      // Search filter
      const searchMatch = filters.search === '' || 
        invoice.ref_no.toLowerCase().includes(filters.search.toLowerCase()) ||
        `${invoice.payer?.first_name} ${invoice.payer?.last_name}`.toLowerCase().includes(filters.search.toLowerCase())

      // Status filter
      const statusMatch = filters.status === '' || invoice.status === filters.status

      // Date range filter
      const dateMatch = (!filters.dateRange.start || new Date(invoice.due_date) >= new Date(filters.dateRange.start)) &&
        (!filters.dateRange.end || new Date(invoice.due_date) <= new Date(filters.dateRange.end))

      // Amount range filter
      const amountMatch = (!filters.amountRange.min || invoice.amount_due >= Number(filters.amountRange.min)) &&
        (!filters.amountRange.max || invoice.amount_due <= Number(filters.amountRange.max))

      // Payer filter
      const payerMatch = filters.payer === '' || invoice.payer === Number(filters.payer)

      return searchMatch && statusMatch && dateMatch && amountMatch && payerMatch
    })

    setFilteredInvoices(filtered)
  }, [invoices, filters])

  // Calculate paginated data
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-gray-500">Manage invoices and their details</p>
        </div>

        <NewInvoiceDialog onSave={handleNewInvoice} payers={payers} properties={properties} />
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Invoice Registry</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input 
                    type="search" 
                    placeholder="Search invoices..." 
                    className="pl-8 w-full sm:w-[250px]"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
                <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Filter Invoices</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Status</Label>
                        <Select 
                          value={filters.status} 
                          onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All</SelectItem>
                            {Object.values(INVOICE_STATUS).map((status) => (
                              <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Date Range</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="date"
                            value={filters.dateRange.start}
                            onChange={(e) => setFilters(prev => ({
                              ...prev,
                              dateRange: { ...prev.dateRange, start: e.target.value }
                            }))}
                          />
                          <Input
                            type="date"
                            value={filters.dateRange.end}
                            onChange={(e) => setFilters(prev => ({
                              ...prev,
                              dateRange: { ...prev.dateRange, end: e.target.value }
                            }))}
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>Amount Range</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            placeholder="Min"
                            value={filters.amountRange.min}
                            onChange={(e) => setFilters(prev => ({
                              ...prev,
                              amountRange: { ...prev.amountRange, min: e.target.value }
                            }))}
                          />
                          <Input
                            type="number"
                            placeholder="Max"
                            value={filters.amountRange.max}
                            onChange={(e) => setFilters(prev => ({
                              ...prev,
                              amountRange: { ...prev.amountRange, max: e.target.value }
                            }))}
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>Payer</Label>
                        <Select 
                          value={filters.payer} 
                          onValueChange={(value) => setFilters(prev => ({ ...prev, payer: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select payer" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All</SelectItem>
                            {payers.map((payer) => (
                              <SelectItem key={payer.id} value={payer.id.toString()}>
                                {`${payer.first_name} ${payer.last_name}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => setFilters({
                          search: '',
                          status: '',
                          dateRange: { start: '', end: '' },
                          amountRange: { min: '', max: '' },
                          payer: ''
                        })}
                      >
                        Reset Filters
                      </Button>
                      <Button onClick={() => setIsFilterOpen(false)}>Apply Filters</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={fetchData} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
                <TabsTrigger value="partially_paid">Partially Paid</TabsTrigger>
              </TabsList>

              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium">Reference</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Payer</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Amount Due</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Due Date</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Created By</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {filteredInvoices.map((invoice) => (
                        <tr
                          key={invoice.id}
                          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        >
                          <td className="p-4 align-middle">
                            <div>
                              <p className="font-medium">{invoice.ref_no}</p>
                              <p className="text-xs text-gray-500">{new Date(invoice.date).toLocaleDateString()}</p>
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            {invoice.payer ? `${invoice.payer.first_name} ${invoice.payer.last_name}` : 'Unknown'}
                          </td>
                          <td className="p-4 align-middle font-medium">${invoice.amount_due.toFixed(2)}</td>
                          <td className="p-4 align-middle">{new Date(invoice.due_date).toLocaleDateString()}</td>
                          <td className="p-4 align-middle">
                            <Badge variant={invoice.status === INVOICE_STATUS.PAID ? "default" : "outline"}>
                              {invoice.status}
                            </Badge>
                          </td>
                          <td className="p-4 align-middle">{invoice.created_by ? `${invoice.created_by.first_name} ${invoice.created_by.last_name}` : 'Unknown'}</td>
                          <td className="p-4 align-middle text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setSelectedInvoice(invoice)
                                  setIsViewDialogOpen(true)
                                }}>
                                  <Building2 className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedInvoice(invoice)
                                  setIsEditDialogOpen(true)
                                }}>
                                  <Home className="h-4 w-4 mr-2" />
                                  Edit Invoice
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  deleteInvoice(invoice.id)
                                  setInvoices(invoices.filter(inv => inv.id !== invoice.id))
                                }}>
                                  <Trash className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {selectedInvoice && (
        <>
          <ViewInvoiceDialog
            invoice={selectedInvoice}
            open={isViewDialogOpen}
            onOpenChange={setIsViewDialogOpen}
          />
          <EditInvoiceDialog
            invoice={selectedInvoice}
            payers={payers}
            properties={properties}
            onSave={handleEditInvoice}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
          />
        </>
      )}
    </DashboardLayout>
  )
}

function generateReferenceNumber() {
  const prefix = 'INV'
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${prefix}-${timestamp}-${random}`
}

function NewInvoiceDialog({ 
  onSave, 
  payers, 
  properties 
}: { 
  onSave: (formData: NewInvoiceFormData) => void
  payers: Payer[]
  properties: Property[]
}) {
  const [formData, setFormData] = useState<NewInvoiceFormData>({
    ref_no: generateReferenceNumber(),
    payer: '',
    payer: '',
    amount_due: 0,
    due_date: '',
    notes: '',
    status: INVOICE_STATUS.UNPAID
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.amount_due) {
      newErrors.amount_due = 'Amount is required'
    } else if (Number(formData.amount_due) <= 0) {
      newErrors.amount_due = 'Amount must be positive'
    }

    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required'
    } else if (new Date(formData.due_date) <= new Date()) {
      newErrors.due_date = 'Due date must be in the future'
    }

    if (!formData.payer) {
      newErrors.payer = 'Payer is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await onSave(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new invoice
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-6 py-4">
            {/* Left Column - Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ref_no">Reference Number</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="ref_no"
                      name="ref_no"
                      value={formData.ref_no}
                      disabled
                      className="bg-gray-50 font-mono"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setFormData(prev => ({ ...prev, ref_no: generateReferenceNumber() }))}
                      title="Generate new reference number"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Auto-generated reference number</p>
                </div>
                <div>
                  <Label htmlFor="amount_due">Amount Due</Label>
                  <Input
                    id="amount_due"
                    name="amount_due"
                    type="number"
                    value={formData.amount_due}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={errors.amount_due ? "border-red-500" : ""}
                  />
                  {errors.amount_due && (
                    <p className="text-sm text-red-500 mt-1">{errors.amount_due}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    name="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={handleChange}
                    className={errors.due_date ? "border-red-500" : ""}
                  />
                  {errors.due_date && (
                    <p className="text-sm text-red-500 mt-1">{errors.due_date}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    name="status"
                    defaultValue={INVOICE_STATUS.UNPAID}
                    disabled
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={INVOICE_STATUS.UNPAID}>Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Right Column - Related Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Related Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="payer">Payer</Label>
                  <Select
                    name="payer"
                    value={formData.payer}
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, payer: value }))
                      if (errors.payer) {
                        setErrors(prev => ({ ...prev, payer: '' }))
                      }
                    }}
                  >
                    <SelectTrigger className={errors.payer ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select payer" />
                    </SelectTrigger>
                    <SelectContent>
                      {payers.map((payer) => (
                        <SelectItem key={payer.id} value={payer.id.toString()}>
                          {payer.first_name} {payer.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.payer && (
                    <p className="text-sm text-red-500 mt-1">{errors.payer}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Add any additional notes..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Invoice'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ViewInvoiceDialog({
  invoice,
  open,
  onOpenChange,
}: {
  invoice: Invoice
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
          <DialogDescription>
            View the complete details of invoice {invoice.ref_no}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-6 py-4">
          {/* Left Column - Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-500">Reference Number</Label>
                <p className="font-mono">{invoice.ref_no}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Amount Due</Label>
                <p className="text-lg font-semibold">${invoice.amount_due.toFixed(2)}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Due Date</Label>
                <p>{new Date(invoice.due_date).toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Status</Label>
                <Badge variant={invoice.status === INVOICE_STATUS.PAID ? "default" : "outline"}>
                  {invoice.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Middle Column - Related Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Related Information</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-500">Payer</Label>
                <div className="space-y-1">
                  <p className="font-medium">
                    {invoice.payer ? `${invoice.payer.first_name} ${invoice.payer.last_name}` : 'Unknown'}
                  </p>
                  {invoice.payer?.email && (
                    <p className="text-sm text-gray-500">{invoice.payer.email}</p>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Notes</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p className="whitespace-pre-wrap text-sm">
                    {invoice.notes || 'No notes provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Audit Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Audit Information</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-500">Created By</Label>
                <div className="space-y-1">
                  <p className="font-medium">
                    {invoice.created_by ? `${invoice.created_by.first_name} ${invoice.created_by.last_name}` : 'Unknown'}
                  </p>
                  {invoice.created_by?.phone && (
                    <p className="text-sm text-gray-500">{invoice.created_by.phone}</p>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Created Date</Label>
                <p>{new Date(invoice.date).toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Last Modified</Label>
                <p>{new Date(invoice.last_modified_date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditInvoiceDialog({
  invoice,
  payers,
  properties,
  onSave,
  open,
  onOpenChange,
}: {
  invoice: Invoice
  payers: Payer[]
  properties: Property[]
  onSave: (formData: NewInvoiceFormData) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [formData, setFormData] = useState<NewInvoiceFormData>({
    ref_no: invoice.ref_no,
    payer: invoice.payer ? `${invoice.payer.first_name} ${invoice.payer.last_name}` : '',
    payer: invoice.payer.toString(),
    amount_due: Number(invoice.amount_due),
    due_date: invoice.due_date,
    notes: invoice.notes || '',
    status: invoice.status
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.amount_due) {
      newErrors.amount_due = 'Amount is required'
    } else if (Number(formData.amount_due) <= 0) {
      newErrors.amount_due = 'Amount must be positive'
    }

    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await onSave(formData)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Edit Invoice</DialogTitle>
          <DialogDescription>
            Update the invoice details
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-3 gap-6 py-4">
            {/* Left Column - Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ref_no">Reference Number</Label>
                  <Input
                    id="ref_no"
                    name="ref_no"
                    value={formData.ref_no}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="amount_due">Amount Due</Label>
                  <Input
                    id="amount_due"
                    name="amount_due"
                    type="number"
                    value={formData.amount_due}
                    onChange={handleChange}
                    className={errors.amount_due ? "border-red-500" : ""}
                  />
                  {errors.amount_due && (
                    <p className="text-sm text-red-500 mt-1">{errors.amount_due}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    name="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={handleChange}
                    className={errors.due_date ? "border-red-500" : ""}
                  />
                  {errors.due_date && (
                    <p className="text-sm text-red-500 mt-1">{errors.due_date}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    name="status"
                    defaultValue={invoice.status}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(INVOICE_STATUS).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Middle Column - Related Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Related Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="payer">Payer</Label>
                  <Input
                    id="payer"
                    value={`${invoice.payer?.first_name} ${invoice.payer?.last_name}`}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Add any additional notes..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Audit Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Audit Information</h3>
              <div className="space-y-4">
                <div>
                  <Label>Created By</Label>
                  <Input
                    value={`${invoice.created_by?.first_name} ${invoice.created_by?.last_name}`}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label>Created Date</Label>
                  <Input
                    value={new Date(invoice.date).toLocaleDateString()}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label>Last Modified</Label>
                  <Input
                    value={new Date(invoice.last_modified_date).toLocaleDateString()}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}