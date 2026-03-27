import { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { Button } from "../ui/button";
import { Activity, Menu, X } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { auth } from "../../firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export default function MainLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-black" />
            <span className="font-bold text-xl tracking-tight">{t('app.name')}</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link to="/#about" className="hover:text-primary transition-colors">{t('nav.about')}</Link>
            <Link to="/#how-it-works" className="hover:text-primary transition-colors">{t('nav.howItWorks')}</Link>
            <Link to="/#features" className="hover:text-primary transition-colors">{t('nav.features')}</Link>
          </nav>
          
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button>{language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">{t('nav.login')}</Button>
                </Link>
                <Link to="/register">
                  <Button>{t('nav.register')}</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background p-4 space-y-4 shadow-lg absolute w-full">
            <nav className="flex flex-col space-y-4 text-sm font-medium text-muted-foreground">
              <Link to="/#about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary transition-colors">{t('nav.about')}</Link>
              <Link to="/#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary transition-colors">{t('nav.howItWorks')}</Link>
              <Link to="/#features" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary transition-colors">{t('nav.features')}</Link>
            </nav>
            <div className="flex flex-col gap-3 pt-4 border-t border-border">
              {user ? (
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full">{language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">{t('nav.login')}</Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full">{t('nav.register')}</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border bg-background py-12">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-black" />
            <span className="font-bold text-xl tracking-tight">{t('app.name')}</span>
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-primary">{t('footer.privacy')}</Link>
            <Link to="/terms" className="hover:text-primary">{t('footer.terms')}</Link>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} {t('app.name')}. {t('footer.rights')}
          </p>
        </div>
      </footer>
    </div>
  );
}
