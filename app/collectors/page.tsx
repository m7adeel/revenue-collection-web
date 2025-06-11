"use client"

import { useEffect, useState } from "react"
import { Building2, CreditCard, Download, Filter, Home, Loader2, MapPin, MoreVertical, Plus, Search, RefreshCw, Users, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import DashboardLayout from "@/components/dashboard-layout"
import { supabase } from "@/utils/supabase"
import { useAuthStore } from "@/providers/authStoreProvider"
import { toast } from "@/hooks/use-toast"
import { deletePayer } from "@/services/db"

interface Collector {
  id: string
  first_name: string
  last_name: string
  phone: string
  profile: string
  active: boolean
  created_date: string
  last_modified_date: string
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
}

interface NewCollectorFormData {
  first_name: string
  last_name: string
  phone: string
  profile: string
  email: string
  password: string
}

export default function CollectorsPage() {
  const [collectors, setCollectors] = useState<Collector[]>([])
  const [filteredCollectors, setFilteredCollectors] = useState<Collector[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCollector, setSelectedCollector] = useState<Collector | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    dateRange: {
      start: '',
      end: ''
    }
  })
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const { user } = useAuthStore()

  useEffect(() => {
    const fetchCollectors = async () => {
      try {
        const { data: collectors, error } = await supabase
          .from("user")
          .select(`
            *
          `)

        if (error) {
          console.error('Error fetching collectors:', error)
          return
        }

        setCollectors(collectors || [])
        setFilteredCollectors(collectors || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCollectors()
  }, [])

  useEffect(() => {
    const filtered = collectors.filter(collector => {
      // Search filter
      const searchMatch = filters.search === '' || 
        `${collector.first_name} ${collector.last_name}`.toLowerCase().includes(filters.search.toLowerCase()) ||
        collector.phone.toLowerCase().includes(filters.search.toLowerCase())

      // Status filter
      const statusMatch = filters.status === '' || 
        (filters.status === 'active' && collector.active) ||
        (filters.status === 'inactive' && !collector.active)

      // Date range filter
      const dateMatch = (!filters.dateRange.start || new Date(collector.created_date) >= new Date(filters.dateRange.start)) &&
        (!filters.dateRange.end || new Date(collector.created_date) <= new Date(filters.dateRange.end))

      return searchMatch && statusMatch && dateMatch
    })

    setFilteredCollectors(filtered)
  }, [collectors, filters])

  const handleNewCollector = async (formData: NewCollectorFormData) => {
    try {
      setIsLoading(true)

      if(formData.profile.toLowerCase() === 'admin') {
        toast({
          title: 'Error',
          description: 'Cannot create a collector with profile "admin". Please choose a different profile.',
          variant: 'destructive'
        })
        return
      }

      await fetch('/api/create-collector', {
        method: 'POST',
        body: JSON.stringify(formData)
      }).then((res) => {
        if (res.ok) {
          setCollectors([formData, ...collectors])
          setIsLoading(false)

          toast({
            title: 'Collector Created',
            description: `Collector ${formData.first_name} ${formData.last_name} has been created successfully.`,
            variant: 'default'
          })
        }
        throw new Error('Failed to create collector')
      }).catch((error) => {
        console.error('Error creating collector:', error)
        toast({
          title: 'Error',
          description: 'Failed to create collector. Please try again.',
          variant: 'destructive'
        })
      })
      
    } catch (error) {
      console.error('Error creating collector:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditCollector = async (formData: NewCollectorFormData) => {
    try {
      setIsLoading(true)
      
      if (!selectedCollector) return

      const { data: collector, error } = await supabase
        .from('user')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          profile: formData.profile,
          last_modified_date: new Date().toISOString(),
        })
        .eq('id', selectedCollector.id)
        .select()
        .single()

      if (error) throw error

      setCollectors(collectors.map(c => 
        c.id === selectedCollector.id ? collector : c
      ))

      toast({
        title: 'Collector Updated',
        description: `Collector ${formData.first_name} ${formData.last_name} has been updated successfully.`,
        variant: 'default'
      })

      setIsEditDialogOpen(false)
    } catch (error) {
      console.error('Error updating collector:', error)

      toast({
        title: 'Error',
        description: 'Failed to update collector. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Collectors</h1>
          <p className="text-gray-500">Manage collectors and their details</p>
        </div>

        <NewCollectorDialog onSave={handleNewCollector} />
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Collector Registry</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input 
                    type="search" 
                    placeholder="Search collectors..." 
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
                      <DialogTitle>Filter Collectors</DialogTitle>
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
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
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
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => setFilters({
                          search: '',
                          status: '',
                          dateRange: { start: '', end: '' }
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
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>

              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Phone</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Created Date</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {filteredCollectors.map((collector) => (
                        <tr
                          key={collector.id}
                          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        >
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>
                                  {collector.first_name[0]}{collector.last_name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{`${collector.first_name} ${collector.last_name}`}</p>
                                <p className="text-xs text-gray-500">{collector.profile}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 align-middle">{collector.phone}</td>
                          <td className="p-4 align-middle">
                            <Badge variant={collector.active ? "default" : "outline"}>
                              {collector.active ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="p-4 align-middle">
                            {new Date(collector.created_date).toLocaleDateString()}
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
                                  setSelectedCollector(collector)
                                  setIsViewDialogOpen(true)
                                }}>
                                  <Building2 className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedCollector(collector)
                                  setIsEditDialogOpen(true)
                                }}>
                                  <Home className="h-4 w-4 mr-2" />
                                  Edit Collector
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  // deletePayer(collector.id)
                                  toast({
                                    title: 'Collector Deleted',
                                    description: `Collector ${collector.first_name} ${collector.last_name} has been deleted.`,
                                    variant: 'default'
                                  })
                                  setCollectors(prev => prev.filter(c => c.id !== collector.id))
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

      {selectedCollector && (
        <>
          <ViewCollectorDialog
            collector={selectedCollector}
            open={isViewDialogOpen}
            onOpenChange={setIsViewDialogOpen}
          />
          <EditCollectorDialog
            collector={selectedCollector}
            onSave={handleEditCollector}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
          />
        </>
      )}
    </DashboardLayout>
  )
}

function NewCollectorDialog({ 
  onSave 
}: { 
  onSave: (formData: NewCollectorFormData) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<NewCollectorFormData>({
    first_name: '',
    last_name: '',
    phone: '',
    profile: '',
    email: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSave(formData)
      setIsOpen(false)
      setFormData({
        first_name: '',
        last_name: '',
        phone: '',
        profile: '',
        email: '',
        password: ''
      })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Collector
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Collector</DialogTitle>
          <DialogDescription>
            Create a new collector account with their details
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile">Profile</Label>
              <Input
                id="profile"
                value={formData.profile}
                onChange={(e) => setFormData(prev => ({ ...prev, profile: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
              />
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
                'Create Collector'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ViewCollectorDialog({
  collector,
  open,
  onOpenChange,
}: {
  collector: Collector
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Collector Details</DialogTitle>
          <DialogDescription>
            View the complete details of collector {collector.first_name} {collector.last_name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-6 py-4">
          {/* Left Column - Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-500">Full Name</Label>
                <p className="font-medium">{`${collector.first_name} ${collector.last_name}`}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Phone</Label>
                <p>{collector.phone}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Status</Label>
                <Badge variant={collector.active ? "default" : "outline"}>
                  {collector.active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Middle Column - Related Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Related Information</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-500">Profile</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p className="whitespace-pre-wrap text-sm">
                    {collector.profile || 'No profile information provided'}
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
                    {collector.created_by ? `${collector.created_by.first_name} ${collector.created_by.last_name}` : 'Unknown'}
                  </p>
                  {collector.created_by?.phone && (
                    <p className="text-sm text-gray-500">{collector.created_by.phone}</p>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Created Date</Label>
                <p>{new Date(collector.created_date).toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Last Modified</Label>
                <p>{new Date(collector.last_modified_date).toLocaleDateString()}</p>
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

function EditCollectorDialog({
  collector,
  onSave,
  open,
  onOpenChange,
}: {
  collector: Collector
  onSave: (formData: NewCollectorFormData) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<NewCollectorFormData>({
    first_name: collector.first_name,
    last_name: collector.last_name,
    phone: collector.phone,
    profile: collector.profile,
    email: '',
    password: ''
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Collector</DialogTitle>
          <DialogDescription>
            Update collector information
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile">Profile</Label>
              <Input
                id="profile"
                value={formData.profile}
                onChange={(e) => setFormData(prev => ({ ...prev, profile: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
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
