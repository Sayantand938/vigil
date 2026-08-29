import { useState } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { Menu, X, LayoutDashboard, Timer, History, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Timer", path: "/timer", icon: Timer },
    { name: "History", path: "/history", icon: History },
    { name: "Settings", path: "/settings", icon: Settings },
]

export function Layout() {
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const location = useLocation()

    const NavLinks = ({ onClick }: { onClick?: () => void }) => (
        <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path
                const Icon = item.icon
                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        onClick={onClick}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-muted",
                            isActive && "bg-muted font-medium"
                        )}
                    >
                        <Icon className="size-4" />
                        {item.name}
                    </Link>
                )
            })}
        </nav>
    )

    return (
        <div className="flex min-h-screen">
            {/* Desktop Sidebar */}
            <aside className="hidden w-64 flex-col border-r bg-background p-4 md:flex">
                <div className="mb-6 flex justify-center">
                    <span className="font-bold text-xl">Vigil</span>   {/* changed to font-bold */}
                </div>
                <NavLinks />
            </aside>

            {/* Mobile Header with Burger + Logo */}
            <div className="fixed left-0 right-0 top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
                <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                    <SheetTrigger>
                        <Button variant="ghost" size="icon">
                            <Menu className="size-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-4">
                        <div className="mb-6 flex items-center justify-between">
                            <span className="font-bold text-xl">Vigil</span>   {/* changed */}
                            <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)}>
                                <X className="size-5" />
                            </Button>
                        </div>
                        <NavLinks onClick={() => setIsMobileOpen(false)} />
                    </SheetContent>
                </Sheet>
                <span className="font-bold text-xl">Vigil</span>   {/* changed */}
                <div className="w-8" />
            </div>

            {/* Main Content */}
            <main className="flex-1 bg-muted/10 md:ml-0">
                <div className="container mx-auto p-4 pt-20 md:pt-6">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}