import { useLanguage } from "../../contexts/LanguageContext";

export default function AdminReports() {
  const { language } = useLanguage();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {language === 'ar' ? 'التقارير' : 'Reports'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'ar' ? 'عرض تقارير النظام' : 'View system reports'}
        </p>
      </div>
      <div className="p-8 text-center text-muted-foreground border rounded-xl bg-card">
        {language === 'ar' ? 'قريباً...' : 'Coming soon...'}
      </div>
    </div>
  );
}
