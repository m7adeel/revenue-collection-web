"use client"

import { useEffect, useState, ReactElement } from "react"
import { CreditCard, Download, Filter, Loader2, MapPin, MoreVertical, Plus, Printer, Search } from "lucide-react"
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
import { addPayment } from "@/services/db"
import { useAuthStore } from "@/store/auth"

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
  id: number;
  vendor: {
    name: string;
    initials: string;
  };
  amount: string;
  date: string;
  status: string;
  location: string;
  type: string;
  notes?: string;
}

export default function CollectionsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [collections, setCollections] = useState<Collection[]>([])
  const [payers, setPayers] = useState<any[]>([])
  const { user } = useAuthStore()

  useEffect(() => {
    const fetchCollections = async () => {
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
      if (error) {
        console.error(error)
      }

      const collections = (paymentsWithPayers || []).map((payment) => ({
        id: payment.id,
        vendor: {
          name: `${payment.payer?.first_name} ${payment.payer?.last_name}`,
          initials: `${payment.payer?.first_name[0]}${payment.payer?.last_name[0]}`,
        },
        amount: payment.amount.toString(),
        date: payment.created_at,
        status: payment.status,
        location: payment.location,
        type: payment.type || "Business",
        notes: payment.notes,
      }))
      setCollections(collections)
    }
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
        created_by: user?.id
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
        date: new Date().toLocaleString(),
        status: "Pending",
        location: formData.location,
        type: formData.type,
        notes: formData.notes,
      }

      setCollections([newCollection, ...collections])
    } catch (error) {
      console.error('Error saving payment:', error)
      // You might want to show an error toast/notification here
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
                        <th className="h-12 px-4 text-left align-middle font-medium">Vendor</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Amount</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Location</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
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
                          <td className="p-4 align-middle font-medium">${collection.amount}</td>
                          <td className="p-4 align-middle text-gray-700">{collection.date}</td>
                          <td className="p-4 align-middle">
                            <Badge variant={collection.status === "Synced" ? "default" : "outline"}>
                              {collection.status}
                            </Badge>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center text-gray-700">
                              <MapPin className="h-3.5 w-3.5 mr-1 text-gray-500" />
                              <span className="text-sm">{collection.location || "Not recorded"}</span>
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
                                <DropdownMenuItem>
                                  <Printer className="h-4 w-4 mr-2" />
                                  Print Receipt
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <MapPin className="h-4 w-4 mr-2" />
                                  View on Map
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
