"use client"

import { useState } from "react"
import { Building2, CreditCard, Loader2, Pencil, Phone, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { supabase } from "@/utils/supabase"
import { useToast } from "@/components/ui/use-toast"

interface VendorProfileProps {
  vendor: {
    id: string
    first_name: string
    last_name: string
    company_name: string
    tin: string
    phone: string
    email: string
    vendor: boolean
    property_owner: boolean
    business_type: string
    location: string
    notes: string
  }
  categories: Array<{ id: string; name: string }>
  onClose: () => void
  onUpdate: () => void
}

export default function VendorProfile({ vendor, categories, onClose, onUpdate }: VendorProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState(vendor)
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from("payer")
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          company_name: formData.company_name,
          tin: formData.tin,
          phone: formData.phone,
          email: formData.email,
          vendor: formData.vendor,
          property_owner: formData.property_owner,
          business_type: formData.business_type,
          location: formData.location,
          notes: formData.notes,
        })
        .eq("id", vendor.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Vendor profile updated successfully",
        variant: "default"
      })
      setIsEditing(false)
      onUpdate()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update vendor profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vendor Profile</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edit the vendor's information below."
              : "View the vendor's profile information."}
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
                  disabled={!isEditing}
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
                  disabled={!isEditing}
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
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tin">TIN</Label>
              <Input
                id="tin"
                name="tin"
                value={formData.tin}
                onChange={handleChange}
                disabled={!isEditing}
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
                  disabled={!isEditing}
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
                  disabled={!isEditing}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_type">Business Type</Label>
              <Select
                value={formData.business_type}
                onValueChange={(value) => handleSelectChange("business_type", value)}
                disabled={!isEditing}
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
              <Label htmlFor="location">Address</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="vendor"
                checked={formData.vendor}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, vendor: checked }))
                }
                disabled={!isEditing}
              />
              <Label htmlFor="vendor">Is Vendor</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="property_owner"
                checked={formData.property_owner}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, property_owner: checked }))
                }
                disabled={!isEditing}
              />
              <Label htmlFor="property_owner">Is Property Owner</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <DialogFooter>
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    setFormData(vendor)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </>
            ) : (
              <Button type="button" onClick={() => setIsEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 