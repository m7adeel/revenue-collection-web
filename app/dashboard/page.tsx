"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BarChart3, CreditCard, DollarSign, Layers, MoreVertical, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import DashboardLayout from "@/components/dashboard-layout"
import { supabase } from "@/utils/supabase"
import { getNewPayers, getRecentPayments, getRecentpayers, getTodayCollections, getpayersVisited } from "@/services/db"

interface User {
  name: string
  role: string
  lastSync?: string
}

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: string
  change: string
  isPositive: boolean
}

interface ActionCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

interface CollectionItemProps {
  collection: {
    id: number
    vendor: {
      name: string
      initials: string
    }
    amount: string
    date: string
    status: string
  }
}

interface VendorItemProps {
  vendor: {
    id: number
    name: string
    initials: string
    type: string
    properties: number
    email: string
    phone: string
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [pendingSync, setPendingSync] = useState(5)
  const [isLoading, setIsLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [todayCollections, setTodayCollections] = useState(0)

  const [payersVisited, setpayersVisited] = useState({
    today: 0,
    yesterday: 0,
    changePercentage: 0
  })
  const [recentCollections, setRecentCollections] = useState([]);
  const [recentpayers, setRecentpayers] = useState([]);
  const [collectionAmount, setCollectionAmount] = useState({
    today: 0,
    yesterday: 0,
    changePercentage: 0
  });
  const [newPayers, setNewPayers] = useState({
    today: 0,
    yesterday: 0,
    changePercentage: 0
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Set initial online status
    setIsOnline(navigator.onLine)

    // Simulate loading data
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [router])

  useEffect(() => {
    const fetchTodayCollections = async () => {
      const { data, error } = await supabase.from("payment").select("*").eq("created_at", new Date().toISOString())
      if (error) {
        console.error("Error fetching today's collections:", error)
      } else {
        setTodayCollections(data.length)
      }
    }
    fetchTodayCollections()
  }, [])

  useEffect(()=> {
    getTodayCollections().then((data) => setCollectionAmount(data));
    getNewPayers().then((data) => setNewPayers(data));

    getpayersVisited().then((data) => {
      setpayersVisited(data)
    });

    getRecentPayments().then((data) => {
      const transformedData = data.map(payment => ({
        id: payment.id,
        vendor: {
          name: payment.payer_name || "Unknown",
          initials: payment.payer_name ? payment.payer_name.split(" ").map(n => n[0]).join("") : "U"
        },
        amount: payment.amount.toFixed(2),
        date: new Date(payment.created_at).toLocaleString(),
        status: payment.status || "Pending"
      }))
      setRecentCollections(transformedData)
    })

    getRecentpayers().then((data) => {
      const transformedpayers = data.map(vendor => ({
        id: vendor.id,
        name: `${vendor.first_name} ${vendor.last_name}`,
        initials: `${vendor.first_name[0]}${vendor.last_name[0]}`.toUpperCase(),
        type: vendor.business_type || "Unknown",
        properties: 0, // Placeholder, adjust as needed
        email: vendor.email || "N/A",
        phone: vendor.phone
      }))

      setRecentpayers(transformedpayers)
    })
  },[])

  const handleSync = async () => {
    if (!isOnline) return

    setIsSyncing(true)

    // Simulate sync process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setPendingSync(0)
    setIsSyncing(false)

    // Update last sync time
    if (user) {
      const updatedUser = { ...user, lastSync: new Date().toISOString() }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
  }

  const handleNavigation = () => {
    setSheetOpen(false)
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">
          Welcome back, {user?.name || "User"}.{" "}
          {isOnline ? "You're online." : "You're working offline. Data will sync when you reconnect."}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
          title="Today's Collections"
          value={`$${collectionAmount.today.toFixed(2)}`}
          change={`${collectionAmount.changePercentage.toFixed(2)}%`}
          isPositive={true}
        />
        <StatCard
          icon={<Users className="h-5 w-5 text-emerald-600" />}
          title="Payers Visited"
          value={`${payersVisited.today || 0}`}
          change={`${payersVisited.changePercentage.toFixed(2)}%`}
          isPositive={true}
        />
        <StatCard
          icon={<Layers className="h-5 w-5 text-emerald-600" />}
          title="New Payers"
          value={`${newPayers.today}`}
          change={`${newPayers.changePercentage.toFixed(2)}%`}
          isPositive={true}
        />
        {/* <StatCard
          icon={<CreditCard className="h-5 w-5 text-emerald-600" />}
          title="Offline Transactions"
          value={pendingSync.toString()}
          change=""
          isPositive={false}
        /> */}
      </div>

      {/* Recent Activity */}
      <div className="mb-6">
        <Tabs defaultValue="collections">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <TabsList>
              <TabsTrigger value="collections">Collections</TabsTrigger>
              <TabsTrigger value="payers">Payers</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="collections" className="space-y-4">
            <Card>
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Recent Collections</CardTitle>
                    <CardDescription>Your latest tax collection activities</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push("/collections")}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border-t">
                  {recentCollections.map((collection) => (
                    <CollectionItem key={collection.id} collection={collection} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payers" className="space-y-4">
            <Card>
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Recent Payers</CardTitle>
                    <CardDescription>Recently added or updated payers</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push("/payers")}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border-t">
                  {recentpayers.map((vendor) => (
                    <VendorItem key={vendor.id} vendor={vendor} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Link href="/collections" className="w-full">
            <ActionCard
              icon={<CreditCard className="h-6 w-6 text-emerald-600" />}
              title="New Collection"
              description="Record a new tax payment"
            />
          </Link>
          <Link href="/payers" className="w-full">
            <ActionCard
              icon={<Users className="h-6 w-6 text-emerald-600" />}
              title="Add Vendor"
              description="Register a new taxpayer"
            />
          </Link>
          <Link href="/properties" className="w-full">
            <ActionCard
              icon={<Layers className="h-6 w-6 text-emerald-600" />}
              title="Add Property"
              description="Register a new property"
            />
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}

function StatCard({ icon, title, value, change, isPositive }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            {change && (
              <p className={`text-xs mt-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
                {change} from yesterday
              </p>
            )}
          </div>
          <div className="bg-emerald-50 p-3 rounded-full">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function ActionCard({ icon, title, description }: ActionCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className="bg-emerald-50 p-3 rounded-full mb-3">{icon}</div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function CollectionItem({ collection }: CollectionItemProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50">
      <div className="flex items-center space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback>{collection.vendor.initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{collection.vendor.name}</p>
          <p className="text-sm text-gray-500">{collection.date}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <p className="font-semibold">${collection.amount}</p>
        <Badge variant={collection.status === "Synced" ? "default" : "outline"}>{collection.status}</Badge>
      </div>
    </div>
  )
}

function VendorItem({ vendor }: VendorItemProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50">
      <div className="flex items-center space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback>{vendor.initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{vendor.name}</p>
          <p className="text-sm text-gray-500">
            {vendor.phone} • {vendor.email}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm">
          View
        </Button>
        <Button variant="outline" size="sm">
          Collect
        </Button>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Skeleton */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r">
        <div className="p-4 border-b">
          <Skeleton className="h-8 w-40" />
        </div>

        <div className="flex-1 py-4 px-2 space-y-2">
          {Array(7)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div>
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col">
        {/* Header Skeleton */}
        <header className="bg-white border-b h-16 flex items-center justify-between px-4 lg:px-6">
          <Skeleton className="h-8 w-8 lg:hidden" />
          <Skeleton className="h-10 w-64 md:w-80" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-8 rounded-full lg:hidden" />
          </div>
        </header>

        {/* Main Content Skeleton */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="mb-6">
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-6 w-16 mb-1" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-12 w-12 rounded-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* Recent Activity Skeleton */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-10 w-48" />
            </div>

            <Card>
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-9 w-20" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border-t">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border-b">
                        <div className="flex items-center space-x-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-32 mb-1" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-6 w-16" />
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Skeleton */}
          <div>
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center">
                        <Skeleton className="h-12 w-12 rounded-full mb-3" />
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

const recentpayers = [
  {
    id: 1,
    name: "Johnson Enterprises",
    initials: "JE",
    type: "Commercial",
    properties: 3,
  },
  {
    id: 2,
    name: "Sarah's Boutique",
    initials: "SB",
    type: "Retail",
    properties: 1,
  },
  {
    id: 3,
    name: "Green Valley Farms",
    initials: "GV",
    type: "Agricultural",
    properties: 5,
  },
  {
    id: 4,
    name: "Tech Solutions Inc.",
    initials: "TS",
    type: "Commercial",
    properties: 2,
  },
  {
    id: 5,
    name: "Riverside Apartments",
    initials: "RA",
    type: "Residential",
    properties: 12,
  },
]
