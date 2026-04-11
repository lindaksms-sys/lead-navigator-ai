import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Building2, CreditCard, LogOut, Phone, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Agencies", href: "/admin/agencies", icon: Building2 },
  { label: "Billing", href: "/admin/billing", icon: CreditCard },
  { label: "Event Logs", href: "/admin/logs", icon: ScrollText },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link to="/admin" className="flex items-center gap-2 font-bold text-lg">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Phone className="h-4 w-4 text-primary-foreground" />
              </div>
              Admin
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate("/"); }}>
            <LogOut className="h-4 w-4 mr-1" /> Logout
          </Button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>
    </div>
  );
}
