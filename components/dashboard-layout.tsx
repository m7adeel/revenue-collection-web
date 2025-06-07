"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { BarChart3, Building2, CreditCard, Home, Layers, LogOut, MapPin, Menu, Settings, Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuthStore } from "@/providers/authStoreProvider"

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [open, setOpen] = useState(false)
  const { user: storeUser,signOut } = useAuthStore()

  useEffect(() => {
    // Check if user is logged in
    // const storedUser = localStorage.getItem("user")
    if (!storeUser) {
      router.push("/login")
      return
    }

    setUser(storeUser)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    signOut()
    router.push("/login")
  }

  const handleNavigation = () => {
    setOpen(false)
  }

  const isActive = (path) => {
    return pathname === path
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-emerald-600" />
            <span className="font-bold text-xl">Parity</span>
          </div>
        </div>

        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            <Link href="/dashboard" className="block">
              <Button variant={isActive("/dashboard") ? "secondary" : "ghost"} className="w-full justify-start">
                <Home className="h-5 w-5" />
                <span className="ml-3">Dashboard</span>
              </Button>
            </Link>
            <Link href="/collections" className="block">
              <Button variant={isActive("/collections") ? "secondary" : "ghost"} className="w-full justify-start">
                <CreditCard className="h-5 w-5" />
                <span className="ml-3">Collections</span>
              </Button>
            </Link>
            <Link href="/vendors" className="block">
              <Button variant={isActive("/vendors") ? "secondary" : "ghost"} className="w-full justify-start">
                <Users className="h-5 w-5" />
                <span className="ml-3">Vendors</span>
              </Button>
            </Link>
            <Link href="/properties" className="block">
              <Button variant={isActive("/properties") ? "secondary" : "ghost"} className="w-full justify-start">
                <Layers className="h-5 w-5" />
                <span className="ml-3">Properties</span>
              </Button>
            </Link>
            <Link href="/invoices" className="block">
              <Button variant={isActive("/invoices") ? "secondary" : "ghost"} className="w-full justify-start">
                <Layers className="h-5 w-5" />
                <span className="ml-3">Invoices</span>
              </Button>
            </Link>
            <Link href="/collectors" className="block">
              <Button variant={isActive("/map") ? "secondary" : "ghost"} className="w-full justify-start">
                <MapPin className="h-5 w-5" />
                <span className="ml-3">Map View</span>
              </Button>
            </Link>
            <Link href="/reports" className="block">
              <Button variant={isActive("/reports") ? "secondary" : "ghost"} className="w-full justify-start">
                <BarChart3 className="h-5 w-5" />
                <span className="ml-3">Reports</span>
              </Button>
            </Link>
            <Link href="/settings" className="block">
              <Button variant={isActive("/settings") ? "secondary" : "ghost"} className="w-full justify-start">
                <Settings className="h-5 w-5" />
                <span className="ml-3">Settings</span>
              </Button>
            </Link>
          </nav>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{user?.name || "User"}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || "Collector"}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b h-16 flex items-center px-4 lg:px-6">
          <div className="flex items-center lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-6 w-6 text-emerald-600" />
                    <span className="font-bold text-xl">Parity</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <ScrollArea className="h-[calc(100vh-8rem)]">
                  <nav className="space-y-1 p-4">
                    <div onClick={handleNavigation}>
                      <Link href="/dashboard" className="block">
                        <Button
                          variant={isActive("/dashboard") ? "secondary" : "ghost"}
                          className="w-full justify-start"
                        >
                          <Home className="h-5 w-5" />
                          <span className="ml-3">Dashboard</span>
                        </Button>
                      </Link>
                    </div>
                    <div onClick={handleNavigation}>
                      <Link href="/collections" className="block">
                        <Button
                          variant={isActive("/collections") ? "secondary" : "ghost"}
                          className="w-full justify-start"
                        >
                          <CreditCard className="h-5 w-5" />
                          <span className="ml-3">Collections</span>
                        </Button>
                      </Link>
                    </div>
                    <div onClick={handleNavigation}>
                      <Link href="/vendors" className="block">
                        <Button variant={isActive("/vendors") ? "secondary" : "ghost"} className="w-full justify-start">
                          <Users className="h-5 w-5" />
                          <span className="ml-3">Vendors</span>
                        </Button>
                      </Link>
                    </div>
                    <div onClick={handleNavigation}>
                      <Link href="/properties" className="block">
                        <Button
                          variant={isActive("/properties") ? "secondary" : "ghost"}
                          className="w-full justify-start"
                        >
                          <Layers className="h-5 w-5" />
                          <span className="ml-3">Properties</span>
                        </Button>
                      </Link>
                    </div>
                    <div onClick={handleNavigation}>
                      <Link href="/collectors" className="block">
                        <Button variant={isActive("/collectors") ? "secondary" : "ghost"} className="w-full justify-start">
                          <MapPin className="h-5 w-5" />
                          <span className="ml-3">Map View</span>
                        </Button>
                      </Link>
                    </div>
                    <div onClick={handleNavigation}>
                      <Link href="/reports" className="block">
                        <Button variant={isActive("/reports") ? "secondary" : "ghost"} className="w-full justify-start">
                          <BarChart3 className="h-5 w-5" />
                          <span className="ml-3">Reports</span>
                        </Button>
                      </Link>
                    </div>
                    <div onClick={handleNavigation}>
                      <Link href="/settings" className="block">
                        <Button
                          variant={isActive("/settings") ? "secondary" : "ghost"}
                          className="w-full justify-start"
                        >
                          <Settings className="h-5 w-5" />
                          <span className="ml-3">Settings</span>
                        </Button>
                      </Link>
                    </div>
                  </nav>
                </ScrollArea>

                <div className="p-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user?.name || "User"}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role || "Collector"}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleLogout}>
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="ml-auto flex items-center space-x-4">
            <Avatar className="h-8 w-8 lg:hidden">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
