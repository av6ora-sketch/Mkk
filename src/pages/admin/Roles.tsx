import { useLanguage } from "../../contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Shield, User, Check } from "lucide-react";

export default function AdminRoles() {
  const { language } = useLanguage();
  
  const roles = [
    {
      id: 'admin',
      name: language === 'ar' ? 'مدير النظام' : 'Administrator',
      description: language === 'ar' ? 'صلاحيات كاملة للتحكم في النظام وإدارة المستخدمين.' : 'Full access to control the system and manage users.',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      permissions: [
        language === 'ar' ? 'إدارة جميع المستخدمين' : 'Manage all users',
        language === 'ar' ? 'عرض وإدارة جميع المتاجر' : 'View and manage all stores',
        language === 'ar' ? 'إدارة تذاكر الدعم' : 'Manage support tickets',
        language === 'ar' ? 'الوصول إلى تقارير النظام' : 'Access system reports',
        language === 'ar' ? 'تعديل إعدادات المنصة' : 'Modify platform settings'
      ]
    },
    {
      id: 'user',
      name: language === 'ar' ? 'مستخدم عادي' : 'Standard User',
      description: language === 'ar' ? 'صلاحيات محدودة لاستخدام المنصة وإنشاء المحتوى.' : 'Limited access to use the platform and create content.',
      icon: User,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      permissions: [
        language === 'ar' ? 'إنشاء وإدارة المحتوى الخاص به' : 'Create and manage own content',
        language === 'ar' ? 'ربط متاجر Blogger الخاصة به' : 'Connect own Blogger stores',
        language === 'ar' ? 'فتح تذاكر دعم' : 'Open support tickets',
        language === 'ar' ? 'تعديل الملف الشخصي' : 'Edit profile'
      ]
    }
  ];

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
      
      <div className="grid gap-6 md:grid-cols-2">
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <Card key={role.id} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${role.bgColor.replace('100', '500')}`} />
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${role.bgColor}`}>
                    <Icon className={`h-6 w-6 ${role.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{role.name}</CardTitle>
                    <CardDescription className="mt-1">{role.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h4 className="font-medium mb-3 text-sm">
                  {language === 'ar' ? 'الصلاحيات:' : 'Permissions:'}
                </h4>
                <ul className="space-y-2">
                  {role.permissions.map((permission, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{permission}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
