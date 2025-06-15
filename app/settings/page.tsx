"use client"

import { useEffect, useState } from "react"
import { Bell, Database, Loader2, Lock, RefreshCw, Save, Shield, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import DashboardLayout from "@/components/dashboard-layout"
import { createAdmin, getUserData, updatePassword, updateUser } from "@/services/db"
import { PAYMENT_METHODS, USER_ROLES } from "@/utils/constants"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const { toast } = useToast()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")


  const [user, setUser] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    role: "collector",
    first_name: "John",
    last_name: "Doe",
    phone: "",
    default_payment_method: "",
    profile: ''
  })

  const [newAdmin, setNewAdmin] = useState({
    active: true,
    first_name: "",
    last_name: "",
    phone: "",
    profile: "",
    default_payment_method: "",
    user_auth_id: "",
    email: "",
    password: "",
  })

  useEffect(() => {
    getUserData().then((data) => {
      setUser(data)
    })
  }, [])

  const handleSaveProfile = () => {
    updateUser(user).then(() => {
      toast({
        title: "Success",
        description: "Profile updated successfully",
        variant: 'default'
      })
    }).catch((error) => {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      })
    })
  }

  const handleSync = () => {
    setIsSyncing(true)

    // Simulate syncing
    setTimeout(() => {
      setIsSyncing(false)
    }, 2000)
  }

  const handleAdminChange = (field: string, value: string | boolean) => {
    setNewAdmin(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddAdmin = () => {
    createAdmin(newAdmin.email, newAdmin.password, newAdmin)
      .then(() => {
        toast({
          title: "Success",
          description: "Admin user created successfully",
          variant: 'default'
        })
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "Failed to create admin user",
          variant: "destructive"
        })
      })
  }

  const updateUserPassword = () => {
    const currentPassword = (document.getElementById('current-password') as HTMLInputElement).value;
    const newPassword = (document.getElementById('new-password') as HTMLInputElement).value;
    const confirmPassword = (document.getElementById('confirm-password') as HTMLInputElement).value;

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirm password do not match",
        variant: "destructive"
      });
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "All password fields are required",
        variant: "destructive"
      });
      return;
    }

    updatePassword(currentPassword, newPassword).then(() => {
      toast({
        title: "Success",
        description: "Password updated successfully",
        variant: 'default'
      })
    }
    ).catch((error) => {
      toast({
        title: "Error",
        description: `Failed to update password ${error.message}`,
        variant: "destructive"
      })
    });
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-500">Manage your account and application settings</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="sync">Sync</TabsTrigger>
          {/* <TabsTrigger value="notifications">Notifications</TabsTrigger> */}
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input
                    id="first-name"
                    value={user.first_name || ""}
                    onChange={(e) => setUser({ ...user, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input
                    id="last-name"
                    value={user.last_name || ""}
                    onChange={(e) => setUser({ ...user, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    disabled
                    id="email"
                    type="email"
                    value={user.email}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={user.phone || ""}
                    onChange={(e) => setUser({ ...user, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-payment">Default Payment Method</Label>
                <Select
                  value={user.default_payment_method || ""}
                  onValueChange={(value) => setUser({ ...user, default_payment_method: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select default payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((item) => {
                      return (
                        <SelectItem value={item}>{item}</SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile">Profile</Label>
                <Input
                  disabled
                  id="profile"
                  value={user.profile || ""}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sync Settings</CardTitle>
              <CardDescription>Manage how your data syncs with the central server</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Connection Status</Label>
                  <div className="flex items-center text-sm">
                    {isOnline ? (
                      <>
                        <Wifi className="h-4 w-4 mr-1 text-emerald-600" />
                        <span className="text-emerald-600">Online</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="text-gray-500">Offline</span>
                      </>
                    )}
                  </div>
                </div>
                <Button variant="outline" onClick={handleSync} disabled={!isOnline || isSyncing}>
                  {isSyncing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sync Now
                    </>
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-sync">Auto Sync</Label>
                  <p className="text-sm text-gray-500">Automatically sync data when online</p>
                </div>
                <Switch id="auto-sync" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sync-on-wifi">Sync on Wi-Fi Only</Label>
                  <p className="text-sm text-gray-500">Only sync when connected to Wi-Fi</p>
                </div>
                <Switch id="sync-on-wifi" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sync-frequency">Sync Frequency</Label>
                <Select defaultValue="15">
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Every 5 minutes</SelectItem>
                    <SelectItem value="15">Every 15 minutes</SelectItem>
                    <SelectItem value="30">Every 30 minutes</SelectItem>
                    <SelectItem value="60">Every hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sync-notifications">Sync Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications when data syncs</p>
                </div>
                <Switch id="sync-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="collection-notifications">Collection Reminders</Label>
                  <p className="text-sm text-gray-500">Receive reminders for scheduled collections</p>
                </div>
                <Switch id="collection-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="system-notifications">System Updates</Label>
                  <p className="text-sm text-gray-500">Receive notifications about system updates</p>
                </div>
                <Switch id="system-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <Switch id="email-notifications" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Bell className="mr-2 h-4 w-4" />
                Save Notification Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={updateUserPassword}>
                <Lock className="mr-2 h-4 w-4" />
                Update Password
              </Button>
            </CardFooter>
          </Card>

          {user.profile.toLowerCase() == 'admin' &&
            <Card>
              <CardHeader>
                <CardTitle>Add Admin User</CardTitle>
                <CardDescription>Add a new administrator to the system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="admin-active">Active Status</Label>
                    <p className="text-sm text-gray-500">Enable or disable the admin account</p>
                  </div>
                  <Switch
                    id="admin-active"
                    checked={newAdmin.active}
                    onCheckedChange={(checked) => handleAdminChange('active', checked)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-first-name">First Name</Label>
                    <Input
                      id="admin-first-name"
                      placeholder="Enter first name"
                      value={newAdmin.first_name}
                      onChange={(e) => handleAdminChange('first_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-last-name">Last Name</Label>
                    <Input
                      id="admin-last-name"
                      placeholder="Enter last name"
                      value={newAdmin.last_name}
                      onChange={(e) => handleAdminChange('last_name', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="Enter email address"
                      value={newAdmin.email}
                      onChange={(e) => handleAdminChange('email', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Enter password"
                      value={newAdmin.password}
                      onChange={(e) => handleAdminChange('password', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-phone">Phone Number</Label>
                    <Input
                      id="admin-phone"
                      type="tel"
                      placeholder="Enter phone number"
                      value={newAdmin.phone}
                      onChange={(e) => handleAdminChange('phone', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-role">Role</Label>
                    <Select
                      value={newAdmin.profile}
                      onValueChange={(value) => handleAdminChange('profile', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select admin role" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(USER_ROLES).map(([key, value]) => <SelectItem value={key} key={key}>{value}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-payment-method">Default Payment Method</Label>
                  <Select
                    value={newAdmin.default_payment_method}
                    onValueChange={(value) => handleAdminChange('default_payment_method', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select default payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* <div className="space-y-2">
                <Label htmlFor="admin-auth-id">User Auth ID</Label>
                <Input 
                  id="admin-auth-id" 
                  placeholder="Enter Supabase Auth ID"
                  value={newAdmin.user_auth_id}
                  onChange={(e) => handleAdminChange('user_auth_id', e.target.value)}
                />
                <p className="text-sm text-gray-500">This ID will be provided by Supabase Auth after user registration</p>
              </div> */}

                <div className="pt-4 space-y-2 text-sm text-gray-500">
                  <p>Created by: {user.first_name} {user.last_name}</p>
                  <p>Created date: {new Date().toLocaleDateString()}</p>
                  <p>Last modified by: {user.first_name} {user.last_name}</p>
                  <p>Last modified date: {new Date().toLocaleDateString()}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleAddAdmin}>
                  <Shield className="mr-2 h-4 w-4" />
                  Add Admin User
                </Button>
              </CardFooter>
            </Card>}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}
