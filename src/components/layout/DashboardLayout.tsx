import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Store, 
  BarChart3, 
  FileText, 
  CreditCard, 
  User, 
  LifeBuoy,
  LogOut,
  Activity,
  Menu,
  X,
  Loader2,
  Settings
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { useLanguage } from "../../contexts/LanguageContext";
import { auth } from "../../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login');
      } else if (user.email === 'contact@avbora.online' || user.email === 'av6ora@gmail.com') {
        navigate('/admin');
      } else {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const sidebarLinks = [
    { name: t('sidebar.overview'), href: "/dashboard", icon: LayoutDashboard },
    { name: t('sidebar.stores'), href: "/dashboard/stores", icon: Store },
    { name: t('sidebar.analytics'), href: "/dashboard/analytics", icon: BarChart3 },
    { name: t('sidebar.reports'), href: "/dashboard/reports", icon: FileText },
    { name: t('sidebar.plans'), href: "/dashboard/plans", icon: CreditCard },
    { name: t('sidebar.profile'), href: "/dashboard/profile", icon: User },
    { name: t('sidebar.support'), href: "/dashboard/support", icon: LifeBuoy },
    { name: t('sidebar.settings'), href: "/dashboard/settings", icon: Settings },
  ];

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
        `fixed inset-y-0 ${language === 'ar' ? 'right-0 border-l' : 'left-0 border-r'} z-50 w-72 border-border bg-background flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shadow-2xl lg:shadow-none`,
        isSidebarOpen ? "translate-x-0" : (language === 'ar' ? "translate-x-full" : "-translate-x-full")
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2" onClick={() => setIsSidebarOpen(false)}>
            <Activity className="h-6 w-6 text-black" />
            <span className="font-bold text-xl tracking-tight">{t('app.name')}</span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
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
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                {link.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            {t('nav.logout')}
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
            {sidebarLinks.find(l => l.href === location.pathname)?.name || t('nav.dashboard')}
          </h1>
        </header>
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
