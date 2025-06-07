"use client"

import { useEffect, useState } from "react"
import { Building2, CreditCard, Download, Filter, Loader2, MoreVertical, Phone, Plus, Search, User } from "lucide-react"
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
import DashboardLayout from "@/components/dashboard-layout"
import { BUSINESS_TYPES } from "@/utils/constants"
import { Switch } from "@/components/ui/switch"
import { supabase } from "@/utils/supabase"
import { addPayer } from "@/services/db"
import CategoryManagement from "./components/CategoryManagement"
import { useToast } from "@/components/ui/use-toast"
import VendorProfile from "./components/VendorProfile"

interface Vendor {
  id: string
  tin: string
  name: string
  initials: string
  type: string
  properties: boolean
  phone: string
  email: string
  address: string
  status: string
  lastPayment: string
}

interface Category {
  id: string
  name: string
  description: string
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<any>(null)
  const { toast } = useToast()

  const handleNewVendor = async (formData: any) => {
    setIsLoading(true)
    try {
      const payer = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        company_name: formData.company_name,
        tin: formData.tin,
        phone: formData.phone,
        email: formData.email,
        vendor: formData.isVendor,
        property_owner: formData.property,
        business_type: formData.type,
        notes: formData.notes,
        location: formData.address,
      }

      await addPayer(payer)
      toast({
        title: "Success",
        description: "Vendor added successfully",
      })
      fetchVendors()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add vendor",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchVendors = async () => {
    const { data, error } = await supabase
      .from("payer")
      .select("*")
      .is("deleted_at", null)

    if (error) {
      console.error(error)
      return
    }

    const vendors = data.map((vendor) => ({
      id: vendor.id,
      tin: vendor.tin,
      name: vendor.first_name + " " + vendor.last_name,
      initials: vendor.first_name[0] + vendor.last_name[0],
      type: vendor.business_type,
      properties: vendor.property_owner,
      phone: vendor.phone,
      email: vendor.email,
      address: vendor.location,
      status: vendor.vendor ? "Active" : "Inactive",
      lastPayment: vendor.last_payment_date,
    }))

    setVendors(vendors)
  }

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("payer_categories")
      .select("*")
      .order("name")

    if (error) {
      console.error(error)
      return
    }

    setCategories(data || [])
  }

  const handleViewProfile = async (vendorId: string) => {
    const { data, error } = await supabase
      .from("payer")
      .select("*")
      .eq("id", vendorId)
      .single()

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load vendor profile",
        variant: "destructive",
      })
      return
    }

    setSelectedVendor(data)
  }

  useEffect(() => {
    fetchVendors()
    fetchCategories()
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Vendors</h1>
            <p className="text-gray-500">Manage taxpayers and their information</p>
          </div>

          <NewVendorDialog onSave={handleNewVendor} categories={categories} isLoading={isLoading} />
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>Vendor Directory</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input type="search" placeholder="Search vendors..." className="pl-8 w-full sm:w-[250px]" />
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
                  <TabsTrigger value="business">Business</TabsTrigger>
                  <TabsTrigger value="property">Property</TabsTrigger>
                </TabsList>

                <div className="rounded-md border">
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">TIN</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Type</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Contact</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Last Payment</th>
                          <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        {vendors.map((vendor) => (
                          <tr
                            key={vendor.id}
                            className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                          >
                            <td className="p-4 align-middle">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                  <AvatarFallback>{vendor.initials}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{vendor.name}</p>
                                  <p className="text-xs text-gray-500">{vendor.address || "No address"}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 align-middle">{vendor.tin}</td>
                            <td className="p-4 align-middle">{vendor.type}</td>
                            <td className="p-4 align-middle">
                              <div className="space-y-1">
                                <div className="flex items-center text-gray-700">
                                  <Phone className="h-3.5 w-3.5 mr-1 text-gray-500" />
                                  <span className="text-sm">{vendor.phone || "N/A"}</span>
                                </div>
                                <div className="flex items-center text-gray-700">
                                  <User className="h-3.5 w-3.5 mr-1 text-gray-500" />
                                  <span className="text-sm">{vendor.email || "N/A"}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 align-middle">
                              <Badge variant={vendor.status === "Active" ? "default" : "outline"}>{vendor.status}</Badge>
                            </td>
                            <td className="p-4 align-middle text-gray-700">{vendor.lastPayment}</td>
                            <td className="p-4 align-middle text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewProfile(vendor.id)}>
                                    <User className="h-4 w-4 mr-2" />
                                    View Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Collect Payment
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Building2 className="h-4 w-4 mr-2" />
                                    Manage Properties
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

          {/* <Card>
            <CardHeader>
              <CardTitle>Category Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryManagement />
            </CardContent>
          </Card> */}
        </div>
      </div>

      {selectedVendor && (
        <VendorProfile
          vendor={selectedVendor}
          categories={categories}
          onClose={() => setSelectedVendor(null)}
          onUpdate={() => {
            fetchVendors()
            setSelectedVendor(null)
          }}
        />
      )}
    </DashboardLayout>
  )
}

function NewVendorDialog({ onSave, categories, isLoading }: { onSave: (data: any) => void, categories: Category[], isLoading: boolean }) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    company_name: "",
    tin: "",
    phone: "",
    email: "",
    type: "",
    isVendor: true,
    property: false,
    address: "",
    notes: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    setFormData({
      first_name: "",
      last_name: "",
      company_name: "",
      tin: "",
      phone: "",
      email: "",
      type: "",
      isVendor: true,
      property: false,
      address: "",
      notes: "",
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Vendor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Vendor</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new vendor profile.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tin">TIN</Label>
              <Input
                id="tin"
                name="tin"
                value={formData.tin}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Business Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange("type", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isVendor"
                checked={formData.isVendor}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isVendor: checked }))
                }
              />
              <Label htmlFor="isVendor">Is Vendor</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="property"
                checked={formData.property}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, property: checked }))
                }
              />
              <Label htmlFor="property">Is Property Owner</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const sampleVendors = [
  {
    id: 1,
    name: "Johnson Enterprises",
    initials: "JE",
    type: "Business",
    properties: 3,
    phone: "555-123-4567",
    email: "contact@johnsonent.com",
    address: "123 Business Park",
    status: "Active",
    lastPayment: "Apr 17, 2025",
  },
  {
    id: 2,
    name: "Sarah's Boutique",
    initials: "SB",
    type: "Business",
    properties: 1,
    phone: "555-987-6543",
    email: "sarah@boutique.com",
    address: "45 Fashion Avenue",
    status: "Active",
    lastPayment: "Apr 10, 2025",
  },
  {
    id: 3,
    name: "Green Valley Farms",
    initials: "GV",
    type: "Agricultural",
    properties: 5,
    phone: "555-456-7890",
    email: "info@greenvalley.com",
    address: "Rural Route 7",
    status: "Active",
    lastPayment: "Apr 5, 2025",
  },
  {
    id: 4,
    name: "Tech Solutions Inc.",
    initials: "TS",
    type: "Business",
    properties: 2,
    phone: "555-789-0123",
    email: "support@techsolutions.com",
    address: "78 Tech Hub",
    status: "Active",
    lastPayment: "Apr 12, 2025",
  },
  {
    id: 5,
    name: "Riverside Apartments",
    initials: "RA",
    type: "Property",
    properties: 12,
    phone: "555-234-5678",
    email: "management@riverside.com",
    address: "100 Riverside Drive",
    status: "Active",
    lastPayment: "Apr 1, 2025",
  },
  {
    id: 6,
    name: "City Pharmacy",
    initials: "CP",
    type: "Business",
    properties: 1,
    phone: "555-345-6789",
    email: "info@citypharmacy.com",
    address: "56 Health District",
    status: "Active",
    lastPayment: "Apr 19, 2025",
  },
  {
    id: 7,
    name: "Metro Hardware",
    initials: "MH",
    type: "Business",
    properties: 1,
    phone: "555-567-8901",
    email: "sales@metrohardware.com",
    address: "89 Industrial Zone",
    status: "Active",
    lastPayment: "Apr 18, 2025",
  },
  {
    id: 8,
    name: "Fresh Foods Market",
    initials: "FF",
    type: "Business",
    properties: 2,
    phone: "555-678-9012",
    email: "info@freshfoods.com",
    address: "34 Market Square",
    status: "Active",
    lastPayment: "Apr 18, 2025",
  },
]
