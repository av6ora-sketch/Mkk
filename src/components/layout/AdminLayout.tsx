import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  FileText, 
  User, 
  LogOut,
  Activity,
  ShieldAlert,
  Menu,
  X,
  Loader2,
  LifeBuoy,
  Shield
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { useLanguage } from "../../contexts/LanguageContext";
import { auth, db } from "@/src/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
      } else {
        const isSuperAdmin = user.email === 'contact@avbora.online' || user.email === 'av6ora@gmail.com';
        if (isSuperAdmin) {
          setPermissions({
            manage_users: true,
            manage_stores: true,
            manage_support: true,
            view_reports: true,
            manage_roles: true
          });
          setIsLoading(false);
        } else {
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists() && userDoc.data().permissions) {
              setPermissions(userDoc.data().permissions);
              setIsLoading(false);
            } else {
              navigate('/dashboard');
            }
          } catch (error) {
            console.error("Error fetching user permissions:", error);
            navigate('/dashboard');
          }
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const sidebarLinks = [
    { name: language === 'ar' ? "نظرة عامة" : "Overview", href: "/admin", icon: LayoutDashboard, show: true },
    { name: language === 'ar' ? "المستخدمين" : "Users", href: "/admin/users", icon: Users, show: permissions.manage_users },
    { name: language === 'ar' ? "المتاجر المربوطة" : "Connected Stores", href: "/admin/stores", icon: Store, show: permissions.manage_stores },
    { name: language === 'ar' ? "التقارير" : "Reports", href: "/admin/reports", icon: FileText, show: permissions.view_reports },
    { name: language === 'ar' ? "تذاكر الدعم" : "Support Tickets", href: "/admin/support", icon: LifeBuoy, show: permissions.manage_support },
    { name: language === 'ar' ? "الأدوار والصلاحيات" : "Roles & Permissions", href: "/admin/roles", icon: Shield, show: permissions.manage_roles },
    { name: language === 'ar' ? "حساب المدير" : "Admin Profile", href: "/admin/profile", icon: User, show: true },
  ].filter(link => link.show);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/30 relative">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        `fixed inset-y-0 ${language === 'ar' ? 'right-0 border-l' : 'left-0 border-r'} z-50 w-72 border-border bg-primary text-primary-foreground flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shadow-2xl lg:shadow-none`,
        isSidebarOpen ? "translate-x-0" : (language === 'ar' ? "translate-x-full" : "-translate-x-full")
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-primary-foreground/10">
          <Link to="/" className="flex items-center gap-2" onClick={() => setIsSidebarOpen(false)}>
            <Activity className="h-6 w-6" />
            <span className="font-bold text-xl tracking-tight">Avbora Admin</span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="px-6 py-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground/60">
          <ShieldAlert className="h-4 w-4" />
          {language === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
        </div>
        <nav className="flex-1 overflow-y-auto py-2 px-4 space-y-1.5">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary-foreground text-primary shadow-md shadow-black/10" 
                    : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-primary-foreground/70")} />
                {link.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-primary-foreground/10">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-red-400/10 hover:text-red-200 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden w-full">
        <header className="h-16 flex items-center px-4 lg:px-8 border-b border-border bg-background gap-4 sticky top-0 z-30">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold tracking-tight">
            {sidebarLinks.find(l => l.href === location.pathname)?.name || (language === 'ar' ? "لوحة الإدارة" : "Admin Panel")}
          </h1>
        </header>
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
