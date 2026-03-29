import { useLanguage } from "../../contexts/LanguageContext";

export default function AdminRoles() {
  const { language } = useLanguage();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {language === 'ar' ? 'الأدوار والصلاحيات' : 'Roles & Permissions'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'ar' ? 'إدارة أدوار وصلاحيات المستخدمين' : 'Manage user roles and permissions'}
        </p>
      </div>
      <div className="p-8 text-center text-muted-foreground border rounded-xl bg-card">
        {language === 'ar' ? 'قريباً...' : 'Coming soon...'}
      </div>
    </div>
  );
}
