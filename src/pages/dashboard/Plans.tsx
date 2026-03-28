import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { auth, db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useLanguage } from "../../contexts/LanguageContext";

import { handleFirestoreError, OperationType } from "../../lib/firestore-error";

export default function Plans() {
  const { t, language } = useLanguage();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!auth.currentUser) return;
      try {
        const docRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCurrentPlan(docSnap.data().plan);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, "users");
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchPlan();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSelectPlan = async (planName: string) => {
    if (!auth.currentUser) return;
    setSubmitting(planName);
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { plan: planName });
      setCurrentPlan(planName);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "users");
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const plansData = [
    {
      name: language === 'ar' ? "الأساسية" : "Basic",
      price: "$49",
      desc: language === 'ar' ? "مثالية للمتاجر الناشئة" : "Perfect for startup stores",
      features: language === 'ar' ? 
        ["تتبع حتى 10,000 زائر شهرياً", "تحليل أسباب ترك السلة", "إرسال 1,000 رسالة استرجاع", "تقارير أسبوعية", "دعم عبر البريد الإلكتروني"] :
        ["Track up to 10,000 visitors/month", "Analyze cart abandonment reasons", "Send 1,000 recovery messages", "Weekly reports", "Email support"],
      button: language === 'ar' ? "اختر الأساسية" : "Choose Basic",
      variant: "outline" as const
    },
    {
      name: language === 'ar' ? "الاحترافية" : "Professional",
      price: "$99",
      desc: language === 'ar' ? "الأكثر شعبية للمتاجر النامية" : "Most popular for growing stores",
      features: language === 'ar' ? 
        ["تتبع حتى 50,000 زائر شهرياً", "تحليل متقدم لسلوك المستخدم", "إرسال 5,000 رسالة استرجاع", "تقارير يومية وتوصيات ذكية", "دعم فني على مدار الساعة", "تخصيص رسائل الاسترجاع"] :
        ["Track up to 50,000 visitors/month", "Advanced user behavior analysis", "Send 5,000 recovery messages", "Daily reports & smart recommendations", "24/7 technical support", "Customize recovery messages"],
      button: language === 'ar' ? "اختر الاحترافية" : "Choose Professional",
      variant: "default" as const,
      popular: true
    },
    {
      name: language === 'ar' ? "المؤسسات" : "Enterprise",
      price: "$199",
      desc: language === 'ar' ? "للمتاجر الكبيرة ذات الزيارات العالية" : "For large stores with high traffic",
      features: language === 'ar' ? 
        ["تتبع زوار غير محدود", "تحليل شامل مع الذكاء الاصطناعي", "رسائل استرجاع غير محدودة", "تقارير مخصصة للإدارة", "مدير حساب مخصص", "ربط مع أدوات خارجية (API)"] :
        ["Unlimited visitor tracking", "Comprehensive AI analysis", "Unlimited recovery messages", "Custom management reports", "Dedicated account manager", "External tools integration (API)"],
      button: language === 'ar' ? "اختر المؤسسات" : "Choose Enterprise",
      variant: "outline" as const
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-3xl font-bold tracking-tight mb-4">{t('sidebar.plans')}</h2>
        <p className="text-muted-foreground">{language === 'ar' ? 'خطط مرنة تناسب حجم أعمالك وتساعدك على زيادة مبيعاتك.' : 'Flexible plans that fit your business size and help you increase sales.'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plansData.map((plan, i) => (
          <Card key={i} className={`relative flex flex-col ${plan.popular ? 'border-primary shadow-lg scale-105 z-10' : 'border-border'}`}>
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                {language === 'ar' ? 'الأكثر طلباً' : 'Most Popular'}
              </div>
            )}
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
              <CardDescription>{plan.desc}</CardDescription>
              <div className="mt-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{language === 'ar' ? '/شهرياً' : '/month'}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-4">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                variant={currentPlan === plan.name ? "secondary" : plan.variant} 
                className="w-full h-12"
                disabled={currentPlan === plan.name || submitting === plan.name}
                onClick={() => handleSelectPlan(plan.name)}
              >
                {submitting === plan.name ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : currentPlan === plan.name ? (
                  language === 'ar' ? "الباقة الحالية" : "Current Plan"
                ) : (
                  plan.button
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
