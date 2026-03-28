import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "../components/ui/button";
import { 
  Activity, 
  BrainCircuit, 
  TrendingUp, 
  Users, 
  Zap, 
  BarChart3, 
  Settings, 
  MessageSquare, 
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  FileText,
  Store,
  Calendar,
  ShoppingBag
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { auth } from "../firebase";
import { onAuthStateChanged, User } from "firebase/auth";

const TypewriterText = () => {
  const { language } = useLanguage();
  const wordsAr = ["المقالات", "الزيارات", "الأرباح", "الانتشار"];
  const wordsEn = ["Articles", "Traffic", "Profits", "Reach"];
  const words = language === 'ar' ? wordsAr : wordsEn;
  
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[index];
    const typeSpeed = isDeleting ? 50 : 150;

    const timer = setTimeout(() => {
      if (!isDeleting && text === currentWord) {
        setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && text === "") {
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % words.length);
      } else {
        setText(currentWord.substring(0, text.length + (isDeleting ? -1 : 1)));
      }
    }, typeSpeed);

    return () => clearTimeout(timer);
  }, [text, isDeleting, index, words]);

  return (
    <span className="text-primary inline-block min-w-[150px]">
      {text}
      <span className="animate-pulse">|</span>
    </span>
  );
};

export default function Home() {
  const { language } = useLanguage();
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

  return (
    <div className={`flex flex-col min-h-screen ${language === 'ar' ? 'dir-rtl' : 'dir-ltr'}`}>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-7xl font-black tracking-tight mb-6"
          >
            {language === 'ar' ? 'ضاعف ' : 'Multiply your blog\'s '}
            <TypewriterText /> 
            {language === 'ar' ? ' مدونتك... ' : '... '}
            <br />
            <span className="text-muted-foreground font-bold">
              {language === 'ar' ? 'بذكاء اصطناعي متطور' : 'With Advanced AI'}
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {language === 'ar' 
              ? 'Blogger AI Scheduler يساعدك على إنشاء مقالات احترافية، متوافقة مع SEO، وجدولتها للنشر التلقائي على مدونات Blogger الخاصة بك.' 
              : 'Blogger AI Scheduler helps you create professional, SEO-friendly articles and schedule them for automatic publication on your Blogger blogs.'}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto">
                  {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                  {language === 'ar' ? <ArrowLeft className="mr-2 h-5 w-5" /> : <ArrowRight className="ml-2 h-5 w-5" />}
                </Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto">
                  {language === 'ar' ? 'ابدأ الآن مجاناً' : 'Start Now for Free'}
                  {language === 'ar' ? <ArrowLeft className="mr-2 h-5 w-5" /> : <ArrowRight className="ml-2 h-5 w-5" />}
                </Button>
              </Link>
            )}
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg w-full sm:w-auto">
              {language === 'ar' ? 'شاهد كيف يعمل' : 'See how it works'}
            </Button>
          </motion.div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-muted rounded-full blur-3xl opacity-50 -z-10" />
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-6"
            >
              <FileText className="h-8 w-8 text-white" />
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              {language === 'ar' ? 'هل تعاني من ضيق الوقت لكتابة المحتوى؟' : 'Struggling to find time for content writing?'}
            </h2>
            <div className="text-xl text-primary-foreground/80 space-y-4 leading-relaxed">
              <p>{language === 'ar' ? 'كتابة مقالات يومية أمر مجهد ومكلف' : 'Writing daily articles is exhausting and expensive'}</p>
              <p>{language === 'ar' ? 'تحتاج إلى بحث، تنسيق، وتحسين SEO لكل مقال' : 'You need research, formatting, and SEO optimization for every post'}</p>
              <p className="font-semibold text-white">
                {language === 'ar' ? 'ربما التكلفة • ربما الوقت • ربما نقص الأفكار' : 'Maybe cost • Maybe time • Maybe lack of ideas'}
              </p>
              <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10">
                <p className="font-bold text-2xl text-white mb-2">
                  {language === 'ar' ? 'الحل؟' : 'The Solution?'}
                </p>
                <p>
                  {language === 'ar' ? 'أتمتة عملية إنشاء المحتوى بالكامل بذكاء اصطناعي يفهم تخصصك' : 'Automate the entire content creation process with AI that understands your niche'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                {language === 'ar' ? 'هنا يأتي دور Blogger AI' : 'This is where Blogger AI comes in'}
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed mb-12">
                {language === 'ar' ? (
                  <>
                    نحن لا نكتب لك فقط<br/>
                    بل ننسق، نحسن SEO، ونجدول النشر تلقائياً<br/>
                    بدل أن تقضي ساعات في الكتابة، دع الذكاء الاصطناعي يقوم بالمهمة
                  </>
                ) : (
                  <>
                    We don't just write for you<br/>
                    We format, optimize SEO, and schedule publication automatically<br/>
                    Instead of spending hours writing, let AI do the job
                  </>
                )}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              {language === 'ar' ? 'كيف يعمل النظام؟' : 'How does it work?'}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: Store, 
                title: language === 'ar' ? "ربط مدونتك" : "Connect Your Blog", 
                desc: language === 'ar' ? "اربط حساب Blogger الخاص بك بضغطة زر واحدة" : "Connect your Blogger account with a single click" 
              },
              { 
                icon: BrainCircuit, 
                title: language === 'ar' ? "توليد المحتوى" : "AI Generation", 
                desc: language === 'ar' ? "أدخل الكلمات المفتاحية وسيقوم الذكاء الاصطناعي بالباقي" : "Enter keywords and let AI do the rest" 
              },
              { 
                icon: Calendar, 
                title: language === 'ar' ? "جدولة النشر" : "Schedule Posting", 
                desc: language === 'ar' ? "اختر الوقت المناسب وسيقوم النظام بالنشر تلقائياً" : "Choose the right time and the system will post automatically" 
              },
              { 
                icon: TrendingUp, 
                title: language === 'ar' ? "نمو مستمر" : "Continuous Growth", 
                desc: language === 'ar' ? "حافظ على نشاط مدونتك وزد من عدد زوارك يومياً" : "Keep your blog active and increase your daily visitors" 
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl border border-border bg-background shadow-sm hover:shadow-md transition-all"
              >
                <div className="h-12 w-12 bg-muted rounded-2xl flex items-center justify-center mb-6">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-muted/50 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {language === 'ar' ? 'ابدأ في أتمتة مدونتك اليوم' : 'Start automating your blog today'}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            {language === 'ar' 
              ? 'انضم إلى مئات المدونين الذين يوفرون وقتهم وجهدهم باستخدام الذكاء الاصطناعي.' 
              : 'Join hundreds of bloggers who save their time and effort using AI.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto">
                  {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                </Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto">
                  {language === 'ar' ? 'ابدأ الآن' : 'Start Now'}
                </Button>
              </Link>
            )}
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg w-full sm:w-auto">
              {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
