"use client"

import { useEffect, useState, ReactElement } from "react"
import { CreditCard, Download, Filter, Loader2, MapPin, MoreVertical, PenIcon, Plus, Printer, RefreshCw, Search, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { Textarea } from "@/components/ui/textarea"
import DashboardLayout from "@/components/dashboard-layout"
import { supabase } from "@/utils/supabase"
import { addPayment, deletePayment } from "@/services/db"
import { useAuthStore } from "@/store/auth"
import { toast } from "@/hooks/use-toast"

interface FormData {
  vendorName: string;
  amount: string;
  type: string;
  location: string;
  notes: string;
  payment_type: string;
  payment_method: string;
  ref_no: string;
  payer_id: string;
}

interface Collection {
  id: string;
  vendor: {
    name: string;
    initials: string;
  };
  amount: string;
  date: string;
  last_modified: string;
  status: string;
  location: string;
  type: string;
  notes?: string;
  ref_no: string;
}

export default function CollectionsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [collections, setCollections] = useState<Collection[]>([])
  const [payers, setPayers] = useState<any[]>([])
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { user } = useAuthStore()

  const fetchCollections = async () => {
    setIsLoading(true)
    try {
      const { data: paymentsWithPayers, error } = await supabase
        .from("payment")
        .select(`
          *,
          payer: payer_id (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .order('updated_at', { ascending: false })
      if (error) {
        console.error(error)
        return
      }

      const collections = (paymentsWithPayers || []).map((payment) => ({
        id: payment.id,
        vendor: {
          name: `${payment.payer?.first_name} ${payment.payer?.last_name}`,
          initials: `${payment.payer?.first_name[0]}${payment.payer?.last_name[0]}`,
        },
        ref_no: payment.ref_no,
        amount: payment.amount.toString(),
        date: payment.created_at,
        last_modified: payment.updated_at,
        status: payment.status,
        location: payment.location,
        type: payment.type || "Business",
        notes: payment.notes,
      }))
      setCollections(collections)
    } catch (error) {
      console.error('Error fetching collections:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  useEffect(() => {
    fetchCollections()
  }, [])

  const handleNewCollection = async (formData: FormData) => {
    try {
      setIsLoading(true)
      
      if (!formData.payer_id) {
        throw new Error('Please select a payer')
      }

      // Create the payment object
      const payment = {
        payer_id: formData.payer_id,
        amount: parseFloat(formData.amount),
        payment_type: formData.payment_type,
        payment_method: formData.payment_method,
        location: formData.location,
        status: "pending",
        notes: formData.notes,
        type: formData.type,
        ref_no: formData.ref_no,
        created_by: user?.id,
        updated_at: new Date().toISOString()
      }

      // Save to database
      const savedPayment = await addPayment(payment)
      
      // Update local state
      const payer = payers.find(p => p.id === formData.payer_id)
      const newCollection: Collection = {
        id: savedPayment[0].id,
        vendor: {
          name: payer ? `${payer.first_name} ${payer.last_name}` : 'Unknown Payer',
          initials: payer ? `${payer.first_name[0]}${payer.last_name[0]}` : 'UP',
        },
        amount: formData.amount,
        date: new Date().toISOString(),
        last_modified: new Date().toISOString(),
        status: "Pending",
        location: formData.location,
        type: formData.type,
        notes: formData.notes,
        ref_no: formData.ref_no,
      }

      setCollections([newCollection, ...collections])
    } catch (error) {
      console.error('Error saving payment:', error)
      toast({
        title: "Error",
        description: "Failed to save payment. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditCollection = async (formData: FormData, collectionId: string) => {
    try {
      setIsLoading(true)

      // Update the payment object
      const payment = {
        amount: parseFloat(formData.amount),
        payment_type: formData.payment_type,
        payment_method: formData.payment_method,
        location: formData.location,
        notes: formData.notes,
        type: formData.type,
        updated_at: new Date().toISOString()
      }

      // Update in database
      const { data, error } = await supabase
        .from('payment')
        .update(payment)
        .eq('id', collectionId)
        .select(`
          *,
          payer: payer_id (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .single()

      if (error) throw error

      // Update local state
      const updatedCollection: Collection = {
        id: data.id,
        vendor: {
          name: `${data.payer?.first_name} ${data.payer?.last_name}`,
          initials: `${data.payer?.first_name[0]}${data.payer?.last_name[0]}`,
        },
        amount: data.amount.toString(),
        date: data.created_at,
        last_modified: data.updated_at,
        status: data.status,
        location: data.location,
        type: data.type || "Business",
        notes: data.notes,
        ref_no: data.ref_no,
      }

      setCollections(collections.map(c => 
        c.id === collectionId ? updatedCollection : c
      ))

      toast({
        title: "Success",
        description: "Collection updated successfully.",
        variant: "default"
      })
    } catch (error) {
      console.error('Error updating payment:', error)
      toast({
        title: "Error",
        description: "Failed to update payment. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Collections</h1>
          <p className="text-gray-500">Manage and track all tax collections</p>
        </div>

        <NewCollectionDialog onSave={handleNewCollection} />
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Collection Records</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input type="search" placeholder="Search collections..." className="pl-8 w-full sm:w-[250px]" />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={fetchCollections}
                  disabled={isLoading}
                >
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
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="synced">Synced</TabsTrigger>
              </TabsList>

              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium w-[15%]">Vendor</th>
                        <th className="h-12 px-4 text-left align-middle font-medium w-[12%]">Ref No</th>
                        <th className="h-12 px-4 text-left align-middle font-medium w-[8%]">Amount</th>
                        <th className="h-12 px-4 text-left align-middle font-medium w-[15%]">Created</th>
                        <th className="h-12 px-4 text-left align-middle font-medium w-[15%]">Modified</th>
                        <th className="h-12 px-4 text-left align-middle font-medium w-[8%]">Status</th>
                        <th className="h-12 px-4 text-left align-middle font-medium w-[8%]">Location</th>
                        <th className="h-12 px-4 text-right align-middle font-medium w-[5%]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {collections.map((collection) => (
                        <tr
                          key={collection.id}
                          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        >
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback>{collection.vendor.initials}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{collection.vendor.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            <p className="font-mono text-sm whitespace-nowrap">{collection.ref_no}</p>
                          </td>
                          <td className="p-4 align-middle font-medium">${collection.amount}</td>
                          <td className="p-4 align-middle text-gray-700">
                            <span className="text-sm">{formatDate(collection.date)}</span>
                          </td>
                          <td className="p-4 align-middle text-gray-700">
                            <span className="text-sm">{formatDate(collection.last_modified)}</span>
                          </td>
                          <td className="p-4 align-middle">
                            <Badge variant={collection.status === "Synced" ? "default" : "outline"}>
                              {collection.status}
                            </Badge>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center text-gray-700">
                              <MapPin className="h-3.5 mr-1 text-gray-500 flex-shrink-0" />
                              <span className="text-sm truncate">{collection.location || "Not recorded"}</span>
                            </div>
                          </td>
                          <td className="p-4 align-middle text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setSelectedCollection(collection)
                                  setIsViewDialogOpen(true)
                                }}>
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedCollection(collection)
                                  setIsEditDialogOpen(true)
                                }}>
                                  <PenIcon className="h-4 w-4 mr-2" />
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                      deletePayment(collection.id).then((response) => {
                                        toast({
                                          title: "Payment Deleted",
                                          description: "The payment has been successfully deleted.",
                                          variant: 'default'
                                        })
                                      }).catch((error) => {
                                        console.error("Error deleting payment:", error)
                                        toast({
                                          title: "Error",
                                          description: "Failed to delete payment. Please try again.",
                                          variant: 'destructive'
                                        })
                                      })
                                      setCollections((prev) => prev.filter((c) => c.id !== collection.id))
                                    }
                                  }
                                >
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

      {selectedCollection && (
        <>
          <ViewCollectionDialog
            collection={selectedCollection}
            open={isViewDialogOpen}
            onOpenChange={setIsViewDialogOpen}
          />
          <EditCollectionDialog
            collection={selectedCollection}
            onSave={(formData) => selectedCollection && handleEditCollection(formData, selectedCollection.id)}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
          />
        </>
      )}
    </DashboardLayout>
  )
}

function NewCollectionDialog({ onSave }: { onSave: (data: FormData) => void }): ReactElement {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    vendorName: "",
    amount: "",
    type: "Business",
    location: "",
    notes: "",
    payment_type: "",
    payment_method: "",
    ref_no: "",
    payer_id: "",
  })
  const [open, setOpen] = useState(false)
  const [payers, setPayers] = useState<any[]>([])

  useEffect(() => {
    const fetchPayers = async () => {
      const { data, error } = await supabase
        .from('payer')
        .select('id, first_name, last_name')
      
      if (error) {
        console.error('Error fetching payers:', error)
        return
      }
      
      setPayers(data || [])
    }
    
    fetchPayers()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate processing
    setTimeout(() => {
      onSave(formData)
      setIsLoading(false)
      setFormData({
        vendorName: "",
        amount: "",
        type: "Business",
        location: "",
        notes: "",
        payment_type: "",
        payment_method: "",
        ref_no: "",
        payer_id: "",
      })
      setOpen(false)
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Collection
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Record New Collection</DialogTitle>
            <DialogDescription>
              Enter the details of the tax collection. This will be saved offline until synced.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payer_id" className="text-right">
                Payer
              </Label>
              <div className="col-span-3">
                <Select value={formData.payer_id} onValueChange={(value) => handleSelectChange("payer_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payer" />
                  </SelectTrigger>
                  <SelectContent>
                    {payers.map((payer) => (
                      <SelectItem key={payer.id} value={payer.id}>
                        {payer.first_name} {payer.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ref_no" className="text-right">
                Reference No
              </Label>
              <div className="col-span-3">
                <Input id="ref_no" name="ref_no" value={formData.ref_no} onChange={handleChange} placeholder="PMT-1111-1111"/>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vendorName" className="text-right">
                Vendor
              </Label>
              <div className="col-span-3">
                <Input id="vendorName" name="vendorName" value={formData.vendorName} onChange={handleChange} required />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <div className="col-span-3">
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <div className="col-span-3">
                <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Property">Property</SelectItem>
                    <SelectItem value="Income">Income</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payment_type" className="text-right">
                Payment Type
              </Label>
              <div className="col-span-3">
                <Select value={formData.payment_type} onValueChange={(value) => handleSelectChange("payment_type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payment_method" className="text-right">
                Payment Method
              </Label>
              <div className="col-span-3">
                <Select value={formData.payment_method} onValueChange={(value) => handleSelectChange("payment_method", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POS">POS</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Bank">Bank</SelectItem>
                    <SelectItem value="Mobile App">Mobile App</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <div className="col-span-3">
                <Input id="location" name="location" value={formData.location} onChange={handleChange} />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Additional information about this collection"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Collection"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ViewCollectionDialog({
  collection,
  open,
  onOpenChange,
}: {
  collection: Collection
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Collection Details</DialogTitle>
          <DialogDescription>
            View the complete details of collection {collection.id}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-6 py-4">
          {/* Left Column - Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-500">Reference Number</Label>
                <p className="font-mono font-medium">{collection.ref_no}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Amount</Label>
                <p className="font-medium">${collection.amount}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Status</Label>
                <Badge variant={collection.status === "Synced" ? "default" : "outline"}>
                  {collection.status}
                </Badge>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Type</Label>
                <p>{collection.type}</p>
              </div>
            </div>
          </div>

          {/* Middle Column - Related Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Related Information</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-500">Vendor</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{collection.vendor.initials}</AvatarFallback>
                  </Avatar>
                  <p className="font-medium">{collection.vendor.name}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Location</Label>
                <div className="flex items-center text-gray-700 mt-1">
                  <MapPin className="h-3.5 w-3.5 mr-1 text-gray-500" />
                  <span>{collection.location || "Not recorded"}</span>
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Notes</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p className="whitespace-pre-wrap text-sm">
                    {collection.notes || 'No notes provided'}
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
                <Label className="text-sm text-gray-500">Created Date</Label>
                <p>{new Date(collection.date).toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Last Modified</Label>
                <p>{new Date(collection.date).toLocaleDateString()}</p>
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

function EditCollectionDialog({
  collection,
  onSave,
  open,
  onOpenChange,
}: {
  collection: Collection
  onSave: (formData: FormData) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    vendorName: collection.vendor.name,
    amount: collection.amount,
    type: collection.type,
    location: collection.location,
    notes: collection.notes || "",
    payment_type: "",
    payment_method: "",
    ref_no: collection.ref_no,
    payer_id: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSave(formData)
      onOpenChange(false)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Collection</DialogTitle>
          <DialogDescription>
            Update collection information
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="ref_no">Reference Number</Label>
                <Input
                  id="ref_no"
                  name="ref_no"
                  value={formData.ref_no}
                  className="font-mono bg-gray-50"
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="amount" className="required">Amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Property">Property</SelectItem>
                    <SelectItem value="Income">Income</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Middle Column - Related Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="vendorName">Vendor</Label>
                <Input
                  id="vendorName"
                  name="vendorName"
                  value={formData.vendorName}
                  className="bg-gray-50"
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="payment_type">Payment Type</Label>
                <Select value={formData.payment_type} onValueChange={(value) => handleSelectChange("payment_type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right Column - Additional Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select value={formData.payment_method} onValueChange={(value) => handleSelectChange("payment_method", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POS">POS</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Bank">Bank</SelectItem>
                    <SelectItem value="Mobile App">Mobile App</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Additional information about this collection"
                  className="h-32"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
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

const sampleCollections = [
  {
    id: 1,
    vendor: { name: "ABC Grocery Store", initials: "AG" },
    amount: "350.00",
    date: "Today, 10:30 AM",
    status: "Pending",
    location: "Main Street",
    type: "Business",
  },
  {
    id: 2,
    vendor: { name: "XYZ Electronics", initials: "XE" },
    amount: "520.00",
    date: "Today, 9:15 AM",
    status: "Synced",
    location: "Commerce Avenue",
    type: "Sales",
  },
  {
    id: 3,
    vendor: { name: "City Pharmacy", initials: "CP" },
    amount: "180.00",
    date: "Yesterday, 4:45 PM",
    status: "Synced",
    location: "Health District",
    type: "Business",
  },
  {
    id: 4,
    vendor: { name: "Metro Hardware", initials: "MH" },
    amount: "275.00",
    date: "Yesterday, 2:30 PM",
    status: "Synced",
    location: "Industrial Zone",
    type: "Business",
  },
  {
    id: 5,
    vendor: { name: "Fresh Foods Market", initials: "FF" },
    amount: "420.00",
    date: "Apr 18, 11:20 AM",
    status: "Synced",
    location: "Market Square",
    type: "Sales",
  },
  {
    id: 6,
    vendor: { name: "Johnson Enterprises", initials: "JE" },
    amount: "850.00",
    date: "Apr 17, 3:45 PM",
    status: "Synced",
    location: "Business Park",
    type: "Property",
  },
  {
    id: 7,
    vendor: { name: "Tech Solutions Inc.", initials: "TS" },
    amount: "620.00",
    date: "Apr 16, 10:15 AM",
    status: "Synced",
    location: "Tech Hub",
    type: "Business",
  },
  {
    id: 8,
    vendor: { name: "Riverside Apartments", initials: "RA" },
    amount: "1250.00",
    date: "Apr 15, 2:30 PM",
    status: "Synced",
    location: "Riverside Drive",
    type: "Property",
  },
]
