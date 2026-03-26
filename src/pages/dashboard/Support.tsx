import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Mail, MessageSquare, LifeBuoy, Lightbulb } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

export default function Support() {
  const { t, language } = useLanguage();

  const faqs = language === 'ar' ? [
    { q: "كيف أقوم بربط متجري؟", a: "يمكنك ربط متجرك من خلال صفحة المتاجر ونسخ كود التتبع ولصقه في وسم head في موقعك." },
    { q: "متى تظهر التحليلات؟", a: "تظهر التحليلات فوراً بعد تركيب الكود وبدء زيارة العملاء لمتجرك." },
    { q: "كيف أقوم بترقية باقتي؟", a: "من خلال صفحة حسابي، يمكنك اختيار ترقية الباقة واختيار الخطة المناسبة." }
  ] : [
    { q: "How do I connect my store?", a: "You can connect your store through the Stores page by copying the tracking code and pasting it into the head tag of your website." },
    { q: "When do analytics appear?", a: "Analytics appear immediately after installing the code and customers start visiting your store." },
    { q: "How do I upgrade my plan?", a: "Through the My Account page, you can choose to upgrade your plan and select the appropriate one." }
  ];

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-4 bg-primary/5 rounded-full mb-4">
          <LifeBuoy className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">{t('sidebar.support')}</h2>
        <p className="text-muted-foreground">{language === 'ar' ? 'فريق الدعم الفني متواجد دائماً للإجابة على استفساراتك.' : 'Our technical support team is always available to answer your inquiries.'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-primary/20 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              {language === 'ar' ? 'تواصل معنا عبر البريد' : 'Contact us via email'}
            </CardTitle>
            <CardDescription>
              {language === 'ar' ? 'أرسل استفسارك وسنقوم بالرد عليك في أقرب وقت ممكن.' : 'Send your inquiry and we will respond to you as soon as possible.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{language === 'ar' ? 'الموضوع' : 'Subject'}</label>
                <Input placeholder={language === 'ar' ? 'عنوان رسالتك' : 'Your message title'} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{language === 'ar' ? 'الرسالة' : 'Message'}</label>
                <textarea 
                  className="flex min-h-[120px] w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary resize-none"
                  placeholder={language === 'ar' ? 'اكتب تفاصيل مشكلتك أو استفسارك هنا...' : 'Write the details of your problem or inquiry here...'}
                />
              </div>
              <Button className="w-full">{language === 'ar' ? 'إرسال الرسالة' : 'Send Message'}</Button>
            </form>
            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground mb-1">{language === 'ar' ? 'أو راسلنا مباشرة على:' : 'Or email us directly at:'}</p>
              <a href="mailto:contact@avbora.online" className="font-semibold text-primary hover:underline">
                contact@avbora.online
              </a>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                {language === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="pb-4 border-b border-border last:border-0 last:pb-0">
                  <h4 className="font-semibold text-sm mb-1">{faq.q}</h4>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="bg-white/20 p-3 rounded-xl shrink-0">
                <Lightbulb className="h-6 w-6 text-yellow-300" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">{language === 'ar' ? 'نصائح لتطوير المنصة' : 'Tips to improve the platform'}</h3>
                <p className="text-primary-foreground/80 text-sm leading-relaxed mb-4">
                  {language === 'ar' ? 'هل لديك فكرة أو اقتراح لتطوير Avbora؟ نحن نستمع لعملائنا دائماً لتحسين خدماتنا.' : 'Do you have an idea or suggestion to improve Avbora? We always listen to our customers to improve our services.'}
                </p>
                <a href="mailto:contact@avbora.online?subject=اقتراح تطوير" className="inline-flex items-center text-sm font-semibold hover:underline">
                  {language === 'ar' ? 'أرسل اقتراحك' : 'Send your suggestion'} <Mail className={`h-4 w-4 ${language === 'ar' ? 'mr-2' : 'ml-2'}`} />
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
