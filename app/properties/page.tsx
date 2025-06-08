"use client"

import { useEffect, useState } from "react"
import { Building2, CreditCard, Download, Filter, Home, Loader2, MoreVertical, Plus, Search, RefreshCw, PenIcon, Trash } from "lucide-react"
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
import { PROPERTY_TYPES } from "@/utils/constants"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/utils/supabase"
import { addProperty } from "@/services/db"

interface Property {
  id: number;
  property_ref_no: string;
  address: string;
  geo_location: string;
  assess_payment: string;
  payment_expiry_date: string;
  type: string;
  notes: string;
  images: string;
  last_modified_date: string;
  owner: string;
  payer: {
    first_name: string;
    last_name: string;
  };
}

interface Owner {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface ViewPropertyDialogProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

function ViewPropertyDialog({ property, isOpen, onClose }: ViewPropertyDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Property Details</DialogTitle>
          <DialogDescription>
            View detailed information about the property
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Basic Information */}
          <div className="col-span-1 space-y-4">
            <div>
              <Label className="text-sm font-medium">Property Reference</Label>
              <p className="font-mono text-sm mt-1">{property.property_ref_no}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Address</Label>
              <p className="text-sm mt-1">{property.address}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Type</Label>
              <p className="text-sm mt-1">{property.type}</p>
            </div>
          </div>

          {/* Middle Column - Related Information */}
          <div className="col-span-1 space-y-4">
            <div>
              <Label className="text-sm font-medium">Owner</Label>
              <p className="text-sm mt-1">{property.payer.first_name} {property.payer.last_name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Assessment Payment</Label>
              <p className="text-sm mt-1">${property.assess_payment}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Payment Expiry Date</Label>
              <p className="text-sm mt-1">{new Date(property.payment_expiry_date).toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Geo Location</Label>
              <p className="text-sm mt-1">{property.geo_location}</p>
            </div>
          </div>

          {/* Right Column - Audit Information */}
          <div className="col-span-1 space-y-4">
            <div>
              <Label className="text-sm font-medium">Last Modified</Label>
              <p className="text-sm mt-1">{new Date(property.last_modified_date).toLocaleDateString()}</p>
            </div>
            {property.notes && (
              <div>
                <Label className="text-sm font-medium">Notes</Label>
                <p className="text-sm mt-1 bg-gray-50 p-2 rounded">{property.notes}</p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface EditPropertyDialogProps {
  property: Property;
  owners: Owner[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: any) => void;
}

function EditPropertyDialog({ property, owners, isOpen, onClose, onSave }: EditPropertyDialogProps) {
  const [formData, setFormData] = useState({
    id: property.id,
    property_ref_no: property.property_ref_no,
    ownerId: property.owner,
    address: property.address,
    geo_location: property.geo_location,
    assess_payment: property.assess_payment,
    payment_expiry_date: property.payment_expiry_date,
    type: property.type,
    notes: property.notes,
    images: property.images ? property.images.split(',') : []
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.ownerId) {
      newErrors.ownerId = "Owner is required"
    }
    if (!formData.address) {
      newErrors.address = "Address is required"
    }
    if (!formData.type) {
      newErrors.type = "Property type is required"
    }
    if (!formData.assess_payment) {
      newErrors.assess_payment = "Assessment payment is required"
    }
    if (!formData.payment_expiry_date) {
      newErrors.payment_expiry_date = "Payment expiry date is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Failed to update property:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Property</DialogTitle>
          <DialogDescription>
            Update property information
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column - Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="property_ref_no">Property Reference</Label>
                <Input
                  id="property_ref_no"
                  name="property_ref_no"
                  value={formData.property_ref_no}
                  className="font-mono"
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="address" className="required">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={errors.address ? "border-red-500" : ""}
                />
                {errors.address && (
                  <p className="text-sm text-red-500 mt-1">{errors.address}</p>
                )}
              </div>
              <div>
                <Label htmlFor="type" className="required">Property Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-500 mt-1">{errors.type}</p>
                )}
              </div>
            </div>

            {/* Right Column - Related Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="ownerId">Owner</Label>
                <Input
                  id="ownerId"
                  name="ownerId"
                  value={property.payer.first_name + " " + property.payer.last_name}
                  className="bg-gray-50"
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="assess_payment" className="required">Assessment Payment</Label>
                <Input
                  id="assess_payment"
                  name="assess_payment"
                  type="number"
                  value={formData.assess_payment}
                  onChange={handleChange}
                  className={errors.assess_payment ? "border-red-500" : ""}
                />
                {errors.assess_payment && (
                  <p className="text-sm text-red-500 mt-1">{errors.assess_payment}</p>
                )}
              </div>
              <div>
                <Label htmlFor="payment_expiry_date" className="required">Payment Expiry Date</Label>
                <Input
                  id="payment_expiry_date"
                  name="payment_expiry_date"
                  type="date"
                  value={formData.payment_expiry_date}
                  onChange={handleChange}
                  className={errors.payment_expiry_date ? "border-red-500" : ""}
                />
                {errors.payment_expiry_date && (
                  <p className="text-sm text-red-500 mt-1">{errors.payment_expiry_date}</p>
                )}
              </div>
              <div>
                <Label htmlFor="geo_location">Geo Location</Label>
                <Input
                  id="geo_location"
                  name="geo_location"
                  value={formData.geo_location}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="h-20"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Update Property</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [owners, setOwners] = useState<Owner[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleNewProperty = async (formData: any) => {
    try {
      const newProperty = await addProperty({
        owner: formData.ownerId,
        property_ref_no: formData.property_ref_no,
        address: formData.address,
        geo_location: formData.geo_location,
        assess_payment: formData.assess_payment,
        payment_expiry_date: formData.payment_expiry_date,
        type: formData.type,
        notes: formData.notes,
        images: formData.images.join(',')
      });
      
      await refreshProperties()
    } catch (error) {
      console.error('Failed to add property:', error)
    }
  }

  const handleEditProperty = async (formData: any) => {
    try {
      const { data, error } = await supabase
        .from('property')
        .update({
          owner: formData.ownerId,
          address: formData.address,
          geo_location: formData.geo_location,
          assess_payment: formData.assess_payment,
          payment_expiry_date: formData.payment_expiry_date,
          type: formData.type,
          notes: formData.notes,
          images: formData.images.join(','),
          last_modified_date: new Date().toISOString()
        })
        .eq('id', formData.id)
      
      if (error) throw error
      
      await refreshProperties()
    } catch (error) {
      console.error('Failed to update property:', error)
    }
  }

  const refreshProperties = async () => {
    const { data: propertiesWithOwners, error } = await supabase
      .from("property")
      .select(`
        *,
        payer: owner (
          id,
          first_name,
          last_name,
          email
        )
      `)
    
    if (error) {
      console.error(error)
    } else {
      setProperties(propertiesWithOwners)
    }
  }

  const handleViewProperty = (property: Property) => {
    setSelectedProperty(property)
    setIsViewDialogOpen(true)
  }

  const handleEditClick = (property: Property) => {
    setSelectedProperty(property)
    setIsEditDialogOpen(true)
  }

  const filteredProperties = properties.filter((property) => {
    const matchesSearch = 
      property.property_ref_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.geo_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${property.payer.first_name} ${property.payer.last_name}`.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === "all" || property.type.toLowerCase() === selectedType.toLowerCase();

    return matchesSearch && matchesType;
  });

  useEffect(() => {
    const fetchData = async () => {
      // Fetch properties
      const { data: propertiesWithOwners, error: propertiesError } = await supabase
        .from("property")
        .select(`
          *,
          payer: owner (
            id,
            first_name,
            last_name,
            email
          )
        `)
      
      if (propertiesError) {
        console.error('Error fetching properties:', propertiesError)
      } else {
        setProperties(propertiesWithOwners)
      }

      // Fetch owners
      const { data: owners, error: ownersError } = await supabase
        .from("payer")
        .select("id, first_name, last_name, email")
        .eq("property_owner", true)
      
      if (ownersError) {
        console.error('Error fetching owners:', ownersError)
      } else {
        setOwners(owners)
      }
    }

    fetchData()
  }, [])

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Properties</h1>
          <p className="text-gray-500">Manage taxable properties and their details</p>
        </div>

        <NewPropertyDialog onSave={handleNewProperty} owners={owners} />
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Property Registry</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input 
                    type="search" 
                    placeholder="Search properties..." 
                    className="pl-8 w-full sm:w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
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
            <Tabs defaultValue="all" value={selectedType} onValueChange={setSelectedType}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                {PROPERTY_TYPES.map((type) => (
                  <TabsTrigger key={type} value={type}>{type}</TabsTrigger>
                ))}
              </TabsList>

              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium">Ref No</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Property</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Type</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Owner</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Assessment</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Expiry Date</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Last Modified</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {filteredProperties.map((property) => (
                        <tr
                          key={property.id}
                          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        >
                          <td className="p-4 align-middle">
                            <Badge variant="outline">{property.property_ref_no}</Badge>
                          </td>
                          <td className="p-4 align-middle">
                            <div>
                              <p className="font-medium">{property.address}</p>
                              <p className="text-xs text-gray-500">{property.geo_location}</p>
                            </div>
                          </td>
                          <td className="p-4 align-middle">{property.type}</td>
                          <td className="p-4 align-middle">{property.payer.first_name} {property.payer.last_name}</td>
                          <td className="p-4 align-middle font-medium">${property.assess_payment}</td>
                          <td className="p-4 align-middle">{new Date(property.payment_expiry_date).toLocaleDateString()}</td>
                          <td className="p-4 align-middle text-gray-700">{new Date(property.last_modified_date).toLocaleDateString()}</td>
                          <td className="p-4 align-middle text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewProperty(property)}>
                                  <Building2 className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditClick(property)}>
                                  <PenIcon className="h-4 w-4 mr-2" />
                                  Edit Property
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
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

      {selectedProperty && (
        <>
          <ViewPropertyDialog
            property={selectedProperty}
            isOpen={isViewDialogOpen}
            onClose={() => {
              setIsViewDialogOpen(false)
              setSelectedProperty(null)
            }}
          />
          <EditPropertyDialog
            property={selectedProperty}
            owners={owners}
            isOpen={isEditDialogOpen}
            onClose={() => {
              setIsEditDialogOpen(false)
              setSelectedProperty(null)
            }}
            onSave={handleEditProperty}
          />
        </>
      )}
    </DashboardLayout>
  )
}

interface NewPropertyDialogProps {
  onSave: (formData: any) => void;
  owners: Owner[];
}

function NewPropertyDialog({ onSave, owners }: NewPropertyDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    property_ref_no: `PROP-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900) + 100}`,
    ownerId: "",
    address: "",
    geo_location: "",
    assess_payment: "",
    payment_expiry_date: "",
    type: "",
    notes: "",
    images: [] as string[]
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const regenerateRefNo = () => {
    setFormData(prev => ({
      ...prev,
      property_ref_no: `PROP-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900) + 100}`
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.ownerId) {
      newErrors.ownerId = "Owner is required"
    }
    if (!formData.address) {
      newErrors.address = "Address is required"
    }
    if (!formData.type) {
      newErrors.type = "Property type is required"
    }
    if (!formData.assess_payment) {
      newErrors.assess_payment = "Assessment payment is required"
    }
    if (!formData.payment_expiry_date) {
      newErrors.payment_expiry_date = "Payment expiry date is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await onSave(formData)
      setIsOpen(false)
      setFormData({
        property_ref_no: `PROP-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900) + 100}`,
        ownerId: "",
        address: "",
        geo_location: "",
        assess_payment: "",
        payment_expiry_date: "",
        type: "",
        notes: "",
        images: []
      })
      setErrors({})
    } catch (error) {
      console.error('Failed to save property:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Add New Property</DialogTitle>
          <DialogDescription>
            Create a new property record with all required information
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column - Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="property_ref_no">Property Reference</Label>
                <div className="flex gap-2">
                  <Input
                    id="property_ref_no"
                    name="property_ref_no"
                    value={formData.property_ref_no}
                    className="font-mono"
                    readOnly
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={regenerateRefNo}
                    title="Regenerate Reference Number"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="address" className="required">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={errors.address ? "border-red-500" : ""}
                />
                {errors.address && (
                  <p className="text-sm text-red-500 mt-1">{errors.address}</p>
                )}
              </div>
              <div>
                <Label htmlFor="type" className="required">Property Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-500 mt-1">{errors.type}</p>
                )}
              </div>
            </div>

            {/* Right Column - Related Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="ownerId" className="required">Owner</Label>
                <Select
                  value={formData.ownerId}
                  onValueChange={(value) => handleSelectChange("ownerId", value)}
                >
                  <SelectTrigger className={errors.ownerId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {owners.map((owner) => (
                      <SelectItem key={owner.id} value={owner.id}>
                        {owner.first_name} {owner.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.ownerId && (
                  <p className="text-sm text-red-500 mt-1">{errors.ownerId}</p>
                )}
              </div>
              <div>
                <Label htmlFor="assess_payment" className="required">Assessment Payment</Label>
                <Input
                  id="assess_payment"
                  name="assess_payment"
                  type="number"
                  value={formData.assess_payment}
                  onChange={handleChange}
                  className={errors.assess_payment ? "border-red-500" : ""}
                />
                {errors.assess_payment && (
                  <p className="text-sm text-red-500 mt-1">{errors.assess_payment}</p>
                )}
              </div>
              <div>
                <Label htmlFor="payment_expiry_date" className="required">Payment Expiry Date</Label>
                <Input
                  id="payment_expiry_date"
                  name="payment_expiry_date"
                  type="date"
                  value={formData.payment_expiry_date}
                  onChange={handleChange}
                  className={errors.payment_expiry_date ? "border-red-500" : ""}
                />
                {errors.payment_expiry_date && (
                  <p className="text-sm text-red-500 mt-1">{errors.payment_expiry_date}</p>
                )}
              </div>
              <div>
                <Label htmlFor="geo_location">Geo Location</Label>
                <Input
                  id="geo_location"
                  name="geo_location"
                  value={formData.geo_location}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="h-20"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Property</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
