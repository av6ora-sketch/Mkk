import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { 
  Users, 
  ShoppingCart, 
  BrainCircuit, 
  RefreshCcw, 
  Mail, 
  Store,
  Lightbulb,
  Loader2
} from "lucide-react";
import { db, auth } from "../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useLanguage } from "../../contexts/LanguageContext";

import { handleFirestoreError, OperationType } from "../../lib/firestore-error";

export default function DashboardOverview() {
  const { t, language } = useLanguage();
  const [dailyTip, setDailyTip] = useState("");
  const [loading, setLoading] = useState(true);
  const [storeCount, setStoreCount] = useState(0);
  const [pageViews, setPageViews] = useState(0);
  const [addCarts, setAddCarts] = useState(0);

  const tipsEn = [
    "Pro Tip: Offering a 10% discount in the first 15 minutes of cart abandonment increases recovery by 30%.",
    "Pro Tip: Make sure your return policy is clear; it's the second most common reason for cart abandonment.",
    "Pro Tip: Use personalized emails with the customer's name to increase open rates.",
    "Pro Tip: Add customer reviews on the checkout page to build trust."
  ];

  const tipsAr = [
    "نصيحة اليوم: تقديم خصم 10% في أول 15 دقيقة من ترك السلة يزيد نسبة الاسترجاع بـ 30%.",
    "نصيحة اليوم: تأكد من وضوح سياسة الاسترجاع، فهي السبب الثاني لترك السلة.",
    "نصيحة اليوم: استخدم رسائل البريد الإلكتروني المخصصة باسم العميل لزيادة معدل الفتح.",
    "نصيحة اليوم: أضف تقييمات العملاء في صفحة الدفع لزيادة الثقة."
  ];

  useEffect(() => {
    // Select a random tip for the day (simulated)
    const today = new Date().getDay();
    const tips = language === 'ar' ? tipsAr : tipsEn;
    setDailyTip(tips[today % tips.length]);
  }, [language]);

  useEffect(() => {
    let unsubStores: (() => void) | undefined;
    let unsubEvents: (() => void) | undefined;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      // Clean up previous listeners if any
      if (unsubStores) unsubStores();
      if (unsubEvents) unsubEvents();

      if (user) {
        // Fetch stores count
        const qStores = query(collection(db, "stores"), where("uid", "==", user.uid));
        unsubStores = onSnapshot(qStores, (snapshot) => {
          setStoreCount(snapshot.size);
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, "stores");
        });

        // Fetch events count
        const qEvents = query(collection(db, "events"), where("ownerId", "==", user.uid));
        unsubEvents = onSnapshot(qEvents, (snapshot) => {
          let views = 0;
          let carts = 0;
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.eventType === "page_view") views++;
            if (data.eventType === "add_to_cart") carts++;
          });
          setPageViews(views);
          setAddCarts(carts);
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, "events");
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubStores) unsubStores();
      if (unsubEvents) unsubEvents();
    };
  }, []);

  const stats = [
    { title: t('sidebar.stores'), value: storeCount.toString(), icon: Store, color: "text-blue-500" },
    { title: t('analytics.totalVisitors'), value: pageViews.toLocaleString(), icon: Users, color: "text-green-500" },
    { title: t('analytics.addedToCart'), value: addCarts.toLocaleString(), icon: ShoppingCart, color: "text-orange-500" },
    { title: language === 'ar' ? "المشاكل المحللة" : "Analyzed Issues", value: "0", icon: BrainCircuit, color: "text-purple-500" },
    { title: language === 'ar' ? "نسبة رجوع العملاء" : "Customer Return Rate", value: "0%", icon: RefreshCcw, color: "text-teal-500" },
    { title: language === 'ar' ? "الرسائل المرسلة" : "Messages Sent", value: "0", icon: Mail, color: "text-pink-500" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary text-primary-foreground p-6 rounded-2xl flex items-start gap-4 shadow-lg"
      >
        <div className="bg-white/20 p-3 rounded-xl">
          <Lightbulb className="h-6 w-6 text-yellow-300" />
        </div>
        <div>
          <h3 className="font-bold text-lg mb-1">{t('overview.proTip')}</h3>
          <p className="text-primary-foreground/80">{dailyTip}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('overview.recoveryPerformance')}</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center bg-muted/20 rounded-md border border-dashed border-border m-6 mt-0">
            <span className="text-muted-foreground">{language === 'ar' ? 'رسم بياني يوضح الأداء' : 'Performance Chart'}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('overview.abandonmentReasons')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { reason: language === 'ar' ? "تكلفة الشحن مرتفعة" : "High Shipping Cost", percent: 45 },
              { reason: language === 'ar' ? "مقارنة الأسعار" : "Comparing Prices", percent: 25 },
              { reason: language === 'ar' ? "عملية دفع معقدة" : "Complex Checkout", percent: 15 },
              { reason: language === 'ar' ? "عدم توفر طريقة الدفع المفضلة" : "Preferred Payment Unavailable", percent: 10 },
              { reason: language === 'ar' ? "أسباب أخرى" : "Other Reasons", percent: 5 },
            ].map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{item.reason}</span>
                  <span className="font-medium">{item.percent}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full" 
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
