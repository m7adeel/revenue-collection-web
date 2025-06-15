"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { BarChart3, Building2, CreditCard, Home, Layers, LogOut, MapPin, Menu, Settings, Users, X, Banknote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuthStore } from "@/providers/authStoreProvider"
import { supabase } from "@/utils/supabase"
import { toast } from "./ui/use-toast"
import { getUserData } from "@/services/utils"

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [open, setOpen] = useState(false)
  const [userData, setUserData] = useState(null)
  const { user: storeUser,signOut } = useAuthStore()

  useEffect(() => {
    supabase.auth.getUser().then(res => {
      if(!res.data.user) {
        router.replace("/login")
      } else {
        getUserData().then(data => {
          setUserData(data)
        })
      }
    })
  }, [])

  const handleLogout = () => {
    supabase.auth.signOut().then(res => {
      router.replace("/login")
    })
  }

  const isActive = (path) => {
    return pathname === path
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r h-screen sticky top-0">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-emerald-600" />
            <span className="font-bold text-xl">Parity</span>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <nav className="space-y-1 px-2 py-4">
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
            <Link href="/payers" className="block">
              <Button variant={isActive("/payers") ? "secondary" : "ghost"} className="w-full justify-start">
                <Users className="h-5 w-5" />
                <span className="ml-3">Payers</span>
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
                {/* <Layers className="h-5 w-5" /> */}
                <Banknote className="h-5 w-5"/>
                <span className="ml-3">Invoices</span>
              </Button>
            </Link>
            <Link href="/collectors" className="block">
              <Button variant={isActive("/collectors") ? "secondary" : "ghost"} className="w-full justify-start">
                <MapPin className="h-5 w-5" />
                <span className="ml-3">Collectors</span>
              </Button>
            </Link>
            <Link href="/settings" className="block">
              <Button variant={isActive("/settings") ? "secondary" : "ghost"} className="w-full justify-start">
                <Settings className="h-5 w-5" />
                <span className="ml-3">Settings</span>
              </Button>
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                {userData?.first_name?.[0]}{userData?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{userData?.first_name || "User"}</p>
                <p className="text-xs text-gray-500 capitalize">{userData?.profile || "Collector"}</p>
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
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
