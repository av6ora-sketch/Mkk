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
  MousePointerClick,
  Video,
  SplitSquareHorizontal,
  Target,
  ShoppingBag
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { auth } from "../firebase";
import { onAuthStateChanged, User } from "firebase/auth";

const TypewriterText = () => {
  const { language } = useLanguage();
  const wordsAr = ["المبيعات", "الأرباح", "العملاء", "التحويلات"];
  const wordsEn = ["Sales", "Profits", "Customers", "Conversions"];
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
            {language === 'ar' ? 'زود ' : 'Increase your store\'s '}
            <TypewriterText /> 
            {language === 'ar' ? ' متجرك... ' : '... '}
            <br />
            <span className="text-muted-foreground font-bold">
              {language === 'ar' ? 'بدون زيادة عدد الزوار' : 'Without increasing traffic'}
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {language === 'ar' 
              ? 'Avbora يحلل سلوك عملائك في الوقت الحقيقي، يفهم سبب ترددهم، ويتدخل بعروض ورسائل ذكية تحولهم إلى عملاء يدفعون.' 
              : 'Avbora analyzes your customers\' behavior in real-time, understands their hesitation, and intervenes with smart offers and messages that turn them into paying customers.'}
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
                  {language === 'ar' ? 'متابعة' : 'Continue'}
                  {language === 'ar' ? <ArrowLeft className="mr-2 h-5 w-5" /> : <ArrowRight className="ml-2 h-5 w-5" />}
                </Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto">
                  {language === 'ar' ? 'ابدأ الآن' : 'Start Now'}
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
              <Users className="h-8 w-8 text-white" />
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              {language === 'ar' ? 'أنت تخسر عملاء كل يوم... بدون أن تعرف السبب' : 'You lose customers every day... without knowing why'}
            </h2>
            <div className="text-xl text-primary-foreground/80 space-y-4 leading-relaxed">
              <p>{language === 'ar' ? 'معظم زوار متجرك يغادرون بدون شراء' : 'Most of your store visitors leave without buying'}</p>
              <p>{language === 'ar' ? 'ليس لأنهم لا يريدون المنتج... بل لأن هناك شيء منعهم' : 'Not because they don\'t want the product... but because something stopped them'}</p>
              <p className="font-semibold text-white">
                {language === 'ar' ? 'ربما السعر • ربما عدم الثقة • ربما التردد' : 'Maybe the price • Maybe lack of trust • Maybe hesitation'}
              </p>
              <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10">
                <p className="font-bold text-2xl text-white mb-2">
                  {language === 'ar' ? 'المشكلة؟' : 'The Problem?'}
                </p>
                <p>
                  {language === 'ar' ? 'أنت لا ترى السبب الحقيقي ولا تتدخل في الوقت المناسب' : 'You don\'t see the real reason and you don\'t intervene in time'}
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
                {language === 'ar' ? 'هنا يأتي دور Avbora' : 'This is where Avbora comes in'}
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed mb-12">
                {language === 'ar' ? (
                  <>
                    Avbora لا يعرض لك أرقام فقط<br/>
                    بل يحول سلوك العملاء إلى قرارات فورية<br/>
                    بدل أن تخسر العميل، نساعدك على إقناعه في اللحظة الحاسمة
                  </>
                ) : (
                  <>
                    Avbora doesn't just show you numbers<br/>
                    It turns customer behavior into instant decisions<br/>
                    Instead of losing the customer, we help you convince them at the crucial moment
                  </>
                )}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: language === 'ar' ? 50 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {language === 'ar' ? 'من نحن' : 'About Us'}
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {language === 'ar' 
                  ? 'Avbora هو نظام ذكي مصمم لمساعدة المتاجر الإلكترونية على زيادة مبيعاتها من خلال فهم سلوك العملاء والتفاعل معه بشكل مباشر.' 
                  : 'Avbora is a smart system designed to help e-commerce stores increase their sales by understanding customer behavior and interacting with it directly.'}
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {language === 'ar' 
                  ? 'شعارنا، الذي يتميز بموجة النشاط (Activity Wave)، يمثل مهمتنا الأساسية: المراقبة المستمرة وتحليل نبض عملك لإبقائه حياً ومزدهراً. نحن لا نقدم تقارير فقط، نحن نبني نظامًا يتخذ قرارات تساعدك على البيع أكثر.' 
                  : 'Our logo, featuring an Activity Wave, represents our core mission: continuously monitoring and analyzing the pulse of your business to keep it alive and thriving. We don\'t just provide reports, we build a system that makes decisions to help you sell more.'}
              </p>
              <div className="p-6 bg-background rounded-2xl border border-border shadow-sm">
                <p className="font-bold text-xl">
                  {language === 'ar' ? 'هدفنا بسيط:' : 'Our goal is simple:'}
                </p>
                <p className="text-muted-foreground mt-2">
                  {language === 'ar' ? 'تحويل كل زائر محتمل إلى فرصة بيع حقيقية' : 'Turn every potential visitor into a real sales opportunity'}
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative h-[400px] rounded-3xl overflow-hidden border border-border bg-background shadow-xl flex items-center justify-center"
            >
              <Activity className="h-32 w-32 text-black" />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              {language === 'ar' ? 'كيف يعمل Avbora؟' : 'How does Avbora work?'}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: Activity, 
                title: language === 'ar' ? "تحليل سلوك الزائر" : "Visitor Behavior Analysis", 
                desc: language === 'ar' ? "نراقب كيف يتفاعل العميل مع متجرك لحظة بلحظة" : "We monitor how the customer interacts with your store moment by moment" 
              },
              { 
                icon: BrainCircuit, 
                title: language === 'ar' ? "فهم سبب التردد" : "Understanding Hesitation", 
                desc: language === 'ar' ? "نحدد لماذا لم يكمل عملية الشراء" : "We determine why they didn't complete the purchase" 
              },
              { 
                icon: Zap, 
                title: language === 'ar' ? "تدخل ذكي" : "Smart Intervention", 
                desc: language === 'ar' ? "نقدم عرض أو رسالة مناسبة لكل حالة" : "We provide the right offer or message for each case" 
              },
              { 
                icon: TrendingUp, 
                title: language === 'ar' ? "تحسين مستمر" : "Continuous Improvement", 
                desc: language === 'ar' ? "نتعلم من النتائج لنزيد الأداء مع الوقت" : "We learn from the results to increase performance over time" 
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

      {/* Features */}
      <section id="features" className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              {language === 'ar' ? 'مميزات تجعل Avbora أداة بيع حقيقية' : 'Features that make Avbora a real sales tool'}
            </h2>
          </div>
          
          {/* Platform Compatibility Sub-section */}
          <div className="mb-20">
            <h3 className="text-2xl font-bold mb-10 text-center text-white/90">
              {language === 'ar' ? 'نتوافق مع جميع المنصات' : 'Compatible with all platforms'}
            </h3>
            <div className="flex flex-wrap justify-center gap-6 md:gap-10 opacity-80">
              {[
                { name: "Salla", nameAr: "سلة" },
                { name: "Zid", nameAr: "زد" },
                { name: "Shopify", nameAr: "شوبيفاي" },
                { name: "WooCommerce", nameAr: "ووكومرس" },
                { name: "Odoo", nameAr: "أودو" },
                { name: "Custom", nameAr: "موقع مخصص" }
              ].map((p, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 hover:bg-white/20 transition-colors">
                    <ShoppingBag className="h-8 w-8 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white/70">
                    {language === 'ar' ? p.nameAr : p.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                icon: BarChart3, 
                title: language === 'ar' ? "تحليل سلوك العملاء بعمق" : "Deep Customer Behavior Analysis", 
                desc: language === 'ar' ? "لا نعرض بيانات فقط... بل نفسرها" : "We don't just show data... we interpret it" 
              },
              { 
                icon: MessageSquare, 
                title: language === 'ar' ? "تدخلات مخصصة" : "Custom Interventions", 
                desc: language === 'ar' ? "كل عميل يحصل على تجربة مختلفة حسب سلوكه" : "Every customer gets a different experience based on their behavior" 
              },
              { 
                icon: TrendingUp, 
                title: language === 'ar' ? "زيادة معدل التحويل" : "Increase Conversion Rate", 
                desc: language === 'ar' ? "تحويل الزوار المترددين إلى مشترين" : "Convert hesitating visitors into buyers" 
              },
              { 
                icon: MousePointerClick, 
                title: language === 'ar' ? "الخرائط الحرارية" : "Heatmaps", 
                desc: language === 'ar' ? "اكتشف أين ينقر زوارك وما الذي يتجاهلونه" : "Discover where your visitors click and what they ignore" 
              },
              { 
                icon: Video, 
                title: language === 'ar' ? "تسجيل الجلسات" : "Session Recording", 
                desc: language === 'ar' ? "شاهد كيف يتصفح المستخدمون متجرك كأنك تقف خلفهم" : "Watch how users navigate your store as if you were standing behind them" 
              },
              { 
                icon: SplitSquareHorizontal, 
                title: language === 'ar' ? "اختبار A/B" : "A/B Testing", 
                desc: language === 'ar' ? "اختبر رسائل وعروض مختلفة لمعرفة ما يحقق أفضل مبيعات" : "Test different messages and offers to see what drives the best sales" 
              },
              { 
                icon: Target, 
                title: language === 'ar' ? "تحليل مسار التحويل" : "Funnel Analysis", 
                desc: language === 'ar' ? "حدد بالضبط أين تفقد عملائك في عملية الشراء" : "Identify exactly where you lose your customers in the buying process" 
              },
              { 
                icon: FileText, 
                title: language === 'ar' ? "تقارير قابلة للتنفيذ" : "Actionable Reports", 
                desc: language === 'ar' ? "نخبرك ماذا تفعل... وليس ماذا حدث فقط" : "We tell you what to do... not just what happened" 
              },
              { 
                icon: Settings, 
                title: language === 'ar' ? "سهولة الاستخدام" : "Ease of Use", 
                desc: language === 'ar' ? "تركيب سريع بدون تعقيد" : "Quick installation without complexity" 
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <feature.icon className="h-8 w-8 text-white mb-4" />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-primary-foreground/70">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-12">
            {language === 'ar' ? 'النتيجة التي تبحث عنها' : 'The Result You Are Looking For'}
          </h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-12">
            {[
              language === 'ar' ? "زيادة في المبيعات" : "Increase in Sales",
              language === 'ar' ? "تحسين في تجربة المستخدم" : "Improvement in User Experience",
              language === 'ar' ? "تقليل في خسارة العملاء" : "Reduction in Customer Loss"
            ].map((result, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 text-xl font-semibold"
              >
                <CheckCircle2 className="h-8 w-8 text-primary" />
                {result}
              </motion.div>
            ))}
          </div>
          <p className="text-2xl font-bold text-muted-foreground">
            {language === 'ar' ? 'Avbora ليس تكلفة... ' : 'Avbora is not a cost... '}
            <span className="text-primary">
              {language === 'ar' ? 'بل استثمار يحقق عائد' : 'but an investment that yields a return'}
            </span>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-muted/50 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {language === 'ar' ? 'ابدأ في تحويل الزوار إلى عملاء اليوم' : 'Start converting visitors into customers today'}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            {language === 'ar' 
              ? 'إذا كان متجرك يستقبل زوار ولا يحقق المبيعات المطلوبة، فالمشكلة ليست في عدد الزوار... بل في طريقة التعامل معهم. Avbora هو الحل.' 
              : 'If your store receives visitors but does not achieve the desired sales, the problem is not the number of visitors... but how you deal with them. Avbora is the solution.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto">
                  {language === 'ar' ? 'متابعة' : 'Continue'}
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
              {language === 'ar' ? 'اطلب عرض' : 'Request a Demo'}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
