import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { User, Mail, Shield, Lock } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

export default function AdminProfile() {
  const { language } = useLanguage();

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{language === 'ar' ? 'حساب المدير' : 'Admin Profile'}</h2>
        <p className="text-muted-foreground">{language === 'ar' ? 'إدارة معلومات الدخول الخاصة بمدير النظام.' : 'Manage login information for the system administrator.'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full border-4 border-background shadow-sm bg-primary flex items-center justify-center text-primary-foreground">
                  <Shield className="h-10 w-10" />
                </div>
              </div>
              <h3 className="font-bold text-lg">{language === 'ar' ? 'مدير النظام' : 'System Administrator'}</h3>
              <p className="text-sm text-muted-foreground">Avbora Admin</p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                <Shield className="h-3.5 w-3.5" />
                {language === 'ar' ? 'صلاحيات كاملة' : 'Full Access'}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'معلومات الدخول' : 'Login Information'}</CardTitle>
              <CardDescription>{language === 'ar' ? 'تحديث بيانات الاتصال وكلمة المرور الخاصة بك.' : 'Update your contact details and password.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</label>
                  <div className="relative">
                    <Mail className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-2.5 h-4 w-4 text-muted-foreground`} />
                    <Input defaultValue="contact@avbora.online" dir="ltr" className={`${language === 'ar' ? 'text-right pr-10' : 'text-left pl-10'} bg-muted/50`} readOnly />
                  </div>
                  <p className="text-xs text-muted-foreground">{language === 'ar' ? 'لا يمكن تغيير البريد الإلكتروني الأساسي للمدير.' : 'The primary admin email cannot be changed.'}</p>
                </div>

                <div className="space-y-2 pt-4 border-t border-border">
                  <label className="text-sm font-medium">{language === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}</label>
                  <div className="relative">
                    <Lock className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-2.5 h-4 w-4 text-muted-foreground`} />
                    <Input type="password" defaultValue="Shi#no2011" dir="ltr" className={`${language === 'ar' ? 'text-right pr-10' : 'text-left pl-10'}`} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}</label>
                  <div className="relative">
                    <Lock className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-2.5 h-4 w-4 text-muted-foreground`} />
                    <Input type="password" placeholder="••••••••" dir="ltr" className={`${language === 'ar' ? 'text-right pr-10' : 'text-left pl-10'}`} />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="button">{language === 'ar' ? 'تحديث كلمة المرور' : 'Update Password'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
