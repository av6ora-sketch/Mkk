import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { 
  TrendingUp, 
  Zap, 
  CheckCircle2,
  FileText,
  Store,
  ShieldCheck,
  Clock,
  Search,
  PenTool,
  MousePointer2,
  Target,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  BrainCircuit
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { auth } from "../firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export default function Home() {
  const { language, t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const { hash } = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace("#", ""));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [hash]);

  const isRtl = language === 'ar';

  return (
    <div className={`flex flex-col min-h-screen ${isRtl ? 'dir-rtl' : 'dir-ltr'}`}>
      {/* 1. Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 
            className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.1]"
          >
            {t('home.heroTitle')}
          </h1>
          <p 
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            {t('home.heroDesc')}
          </p>
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Link to={user ? "/dashboard" : "/register"}>
              <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto font-bold rounded-full">
                {user ? t('sidebar.dashboard') : t('home.startFree')}
                {isRtl ? <ChevronLeft className="mr-2 h-5 w-5" /> : <ChevronRight className="ml-2 h-5 w-5" />}
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg w-full sm:w-auto rounded-full" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
              {t('home.seeHow')}
            </Button>
          </div>
          
          <div
            className="flex items-center justify-center gap-6 text-sm font-medium text-muted-foreground"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              {t('home.trustLine').split(' - ')[0]}
            </span>
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {t('home.trustLine').split(' - ')[1]}
            </span>
            <span className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              {t('home.trustLine').split(' - ')[2]}
            </span>
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
      </section>

      {/* 2. Problem Section */}
      <section id="problem" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div
                className=""
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-destructive">
                  {t('home.problemTitle')}
                </h2>
                <p className="text-xl mb-8 font-medium">
                  {t('home.problemDesc')}
                </p>
                <ul className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <li key={i} className="flex items-start gap-3 text-lg">
                      <div className="mt-1.5 h-2 w-2 rounded-full bg-destructive shrink-0" />
                      {t(`home.problemItem${i}` as any)}
                    </li>
                  ))}
                </ul>
                <div className="mt-10 p-6 bg-destructive/10 border border-destructive/20 rounded-2xl">
                  <p className="text-xl font-bold text-destructive">
                    {t('home.problemResult')}
                  </p>
                </div>
              </div>
              <div
                className="relative"
              >
                <div className="aspect-square bg-destructive/5 rounded-3xl flex items-center justify-center">
                  <FileText className="h-32 w-32 text-destructive/20" />
                </div>
                <div className="absolute -top-4 -right-4 p-4 bg-white shadow-xl rounded-2xl border border-border">
                  <TrendingUp className="h-8 w-8 text-destructive rotate-180" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Solution Section */}
      <section id="solution" className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div
                className="order-2 md:order-1 relative"
              >
                <div className="aspect-square bg-primary/5 rounded-3xl flex items-center justify-center">
                  <Zap className="h-32 w-32 text-primary/20" />
                </div>
                <div className="absolute -bottom-4 -left-4 p-4 bg-white shadow-xl rounded-2xl border border-border">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div
                className="order-1 md:order-2"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">
                  {t('home.solutionTitle')}
                </h2>
                <p className="text-xl mb-8 font-medium">
                  {t('home.solutionDesc')}
                </p>
                <ul className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <li key={i} className="flex items-start gap-3 text-lg">
                      <CheckCircle2 className="mt-1 h-6 w-6 text-primary shrink-0" />
                      {t(`home.solutionItem${i}` as any)}
                    </li>
                  ))}
                </ul>
                <div className="mt-10 p-6 bg-primary/10 border border-primary/20 rounded-2xl">
                  <p className="text-xl font-bold text-primary">
                    {t('home.solutionResult')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('home.featuresTitle')}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { icon: PenTool, title: t('home.feature1Title'), desc: t('home.feature1Desc') },
              { icon: Search, title: t('home.feature2Title'), desc: t('home.feature2Desc') },
              { icon: Zap, title: t('home.feature3Title'), desc: t('home.feature3Desc') },
              { icon: ShieldCheck, title: t('home.feature4Title'), desc: t('home.feature4Desc') },
              { icon: Clock, title: t('home.feature5Title'), desc: t('home.feature5Desc') },
              { icon: Sparkles, title: t('home.solutionTitle'), desc: t('home.solutionDesc') }
            ].map((feature, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl border border-border bg-background hover:shadow-lg transition-all group"
              >
                <div className="h-14 w-14 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('home.howTitle')}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 -z-10" />
            
            {[
              { icon: Store, step: t('home.howStep1') },
              { icon: Target, step: t('home.howStep2') },
              { icon: BrainCircuit, step: t('home.howStep3') },
              { icon: Zap, step: t('home.howStep4') }
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center"
              >
                <div className="h-16 w-16 bg-primary text-white rounded-full flex items-center justify-center mb-6 shadow-xl relative">
                  <item.icon className="h-8 w-8" />
                  <div className="absolute -top-2 -right-2 h-7 w-7 bg-white text-primary text-sm font-bold rounded-full flex items-center justify-center border-2 border-primary">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-lg font-bold">{item.step}</h3>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <p className="inline-flex items-center gap-2 px-6 py-3 bg-primary/5 text-primary font-bold rounded-full">
              <Clock className="h-5 w-5" />
              {t('home.howTime')}
            </p>
          </div>
        </div>
      </section>

      {/* 6. Use Cases */}
      <section id="use-cases" className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              {t('home.useCasesTitle')}
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-6 bg-white/10 rounded-2xl border border-white/10"
                >
                  <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                    <MousePointer2 className="h-5 w-5" />
                  </div>
                  <p className="text-lg font-medium">{t(`home.useCase${i}` as any)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Social Proof */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t('home.socialTitle')}
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {t('home.socialDesc')}
            </p>
          </div>
        </div>
      </section>

      {/* 8. Pricing Hook */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto p-12 bg-background border-2 border-primary rounded-[3rem] text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <TrendingUp className="h-64 w-64" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t('home.pricingTitle')}
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              {t('home.pricingDesc')}
            </p>
            <Link to="/subscriptions">
              <Button size="lg" className="h-14 px-12 text-lg font-bold rounded-full">
                {t('home.viewPlans')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 9. Final CTA */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <div
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              {t('home.finalTitle')}
            </h2>
            <p className="text-xl text-muted-foreground mb-12">
              {t('home.finalDesc')}
            </p>
            <Link to={user ? "/dashboard" : "/register"}>
              <Button size="lg" className="h-16 px-12 text-xl font-bold rounded-full shadow-xl hover:scale-105 transition-transform">
                {user ? t('sidebar.dashboard') : t('home.createAccount')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer-like simple line */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} AI Vision Beyond. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
