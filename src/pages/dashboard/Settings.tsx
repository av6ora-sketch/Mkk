import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Mail, Shield, Save, Loader2, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { db, auth } from "@/src/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function DashboardSettings() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [smtpSettings, setSmtpSettings] = useState({
    host: "",
    port: "587",
    user: "",
    pass: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      if (!auth.currentUser) return;
      try {
        const docRef = doc(db, "settings", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSmtpSettings(docSnap.data().smtp || { host: "", port: "587", user: "", pass: "" });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (e: any) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setSaving(true);
    setSuccess(false);
    try {
      await setDoc(doc(db, "settings", auth.currentUser.uid), {
        smtp: smtpSettings,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle>{language === 'ar' ? "إعدادات البريد الإلكتروني (SMTP)" : "Email Settings (SMTP)"}</CardTitle>
          </div>
          <CardDescription>
            {language === 'ar' 
              ? "قم بضبط إعدادات SMTP الخاصة بك لإرسال رسائل البريد الإلكتروني التلقائية للسلات المتروكة." 
              : "Configure your SMTP settings to send automated abandonment emails."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="host">{language === 'ar' ? "خادم SMTP" : "SMTP Host"}</label>
                <Input 
                  id="host" 
                  placeholder="smtp.example.com" 
                  value={smtpSettings.host}
                  onChange={(e) => setSmtpSettings({ ...smtpSettings, host: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="port">{language === 'ar' ? "المنفذ (Port)" : "Port"}</label>
                <Input 
                  id="port" 
                  placeholder="587" 
                  value={smtpSettings.port}
                  onChange={(e) => setSmtpSettings({ ...smtpSettings, port: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="user">{language === 'ar' ? "اسم المستخدم / البريد" : "Username / Email"}</label>
                <Input 
                  id="user" 
                  type="email"
                  placeholder="user@example.com" 
                  value={smtpSettings.user}
                  onChange={(e) => setSmtpSettings({ ...smtpSettings, user: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="pass">{language === 'ar' ? "كلمة المرور" : "Password"}</label>
                <Input 
                  id="pass" 
                  type="password"
                  placeholder="••••••••" 
                  value={smtpSettings.pass}
                  onChange={(e) => setSmtpSettings({ ...smtpSettings, pass: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                {language === 'ar' ? "يتم تشفير بياناتك وحفظها بأمان." : "Your data is encrypted and saved securely."}
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    {language === 'ar' ? "جاري الحفظ..." : "Saving..."}
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 ml-2 text-green-500" />
                    {language === 'ar' ? "تم الحفظ" : "Saved"}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 ml-2" />
                    {language === 'ar' ? "حفظ الإعدادات" : "Save Settings"}
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="text-sm font-medium mb-4">{language === 'ar' ? "اختبار الإرسال" : "Test Sending"}</h3>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder={language === 'ar' ? "بريد الاختبار" : "Test Email"} 
                id="test-email"
              />
              <Button variant="outline" onClick={async () => {
                const email = (document.getElementById('test-email') as HTMLInputElement).value;
                if (!email) return;
                try {
                  const res = await fetch('/api/send-abandonment-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      email, 
                      storeName: "Avbora Test", 
                      cartUrl: "#",
                      ownerId: auth.currentUser?.uid
                    })
                  });
                  const data = await res.json();
                  alert(data.message || data.error);
                } catch (e) {
                  alert("Error connecting to server");
                }
              }}>
                {language === 'ar' ? "إرسال تجربة" : "Send Test"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-100 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-blue-900">
            {language === 'ar' ? "كيف يعمل تتبع السلة؟" : "How does cart tracking work?"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>
            {language === 'ar' 
              ? "1. يقوم كود التتبع باكتشاف متى يضيف العميل منتجاً للسلة أو يدخل صفحة الدفع." 
              : "1. The tracking code detects when a customer adds a product to the cart or enters the checkout page."}
          </p>
          <p>
            {language === 'ar' 
              ? "2. إذا غادر العميل صفحة الدفع دون إكمال الطلب، يتم تسجيل 'سلة متروكة'." 
              : "2. If the customer leaves the checkout page without completing the order, an 'Abandoned Cart' is recorded."}
          </p>
          <p>
            {language === 'ar' 
              ? "3. سيقوم النظام قريباً بإرسال بريد إلكتروني تلقائي للعميل (إذا توفر بريده) لتذكيره بإكمال الطلب." 
              : "3. The system will soon automatically send an email to the customer (if their email is available) to remind them to complete the order."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
