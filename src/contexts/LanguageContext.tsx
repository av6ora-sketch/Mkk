import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // General
    'app.name': 'Avbora',
    'app.description': 'Turn Visitors into Customers',
    'nav.about': 'About Us',
    'nav.howItWorks': 'How it Works',
    'nav.features': 'Features',
    'nav.login': 'Login',
    'nav.register': 'Get Started',
    'nav.dashboard': 'Dashboard',
    'nav.admin': 'Admin',
    'nav.logout': 'Logout',
    
    // Dashboard Sidebar
    'sidebar.overview': 'Overview',
    'sidebar.stores': 'Stores',
    'sidebar.analytics': 'Analytics',
    'sidebar.reports': 'Reports',
    'sidebar.plans': 'Plans',
    'sidebar.profile': 'Profile',
    'sidebar.support': 'Support',
    'sidebar.settings': 'Settings',
    
    // Profile
    'profile.title': 'My Profile',
    'profile.description': 'Manage your personal information and subscription details.',
    'profile.personalInfo': 'Personal Information',
    'profile.updateContact': 'Update your contact details.',
    'profile.firstName': 'First Name',
    'profile.lastName': 'Last Name',
    'profile.email': 'Email Address',
    'profile.emailDesc': 'Email address cannot be changed currently.',
    'profile.phone': 'Phone Number',
    'profile.country': 'Country',
    'profile.saveChanges': 'Save Changes',
    'profile.saving': 'Saving...',
    'profile.subscriptionDetails': 'Subscription Details',
    'profile.currentPlan': 'Current Plan',
    'profile.language': 'Language',
    'profile.languageDesc': 'Choose your preferred language for the dashboard.',
    
    // Stores
    'stores.title': 'Connected Stores',
    'stores.description': 'Manage your stores and connect new ones.',
    'stores.addNew': 'Connect New Store',
    'stores.addStoreTitle': 'Add New Store',
    'stores.addStoreDesc': 'Enter store details to get your tracking code.',
    'stores.storeName': 'Store Name (e.g., Elegance Store)',
    'stores.storeUrl': 'https://your-store.com',
    'stores.generateCode': 'Generate Tracking Code',
    'stores.codeGenerated': 'Code Generated Successfully',
    'stores.copyCodeDesc': 'Copy the following code and paste it into the <head> tag of all your store pages.',
    'stores.copyCode': 'Copy Code',
    'stores.close': 'Close',
    'stores.viewDetails': 'View Store Details',
    'stores.noStores': 'No Stores Connected',
    'stores.noStoresDesc': 'Connect your first store to start tracking data.',
    'stores.active': 'Active',
    'stores.pending': 'Pending Connection',
    'stores.visitorsThisMonth': 'Visitors This Month',
    'stores.conversionRate': 'Conversion Rate',
    
    // Store Details
    'storeDetails.waitingData': 'Waiting for Data',
    'storeDetails.waitingDataDesc': 'We haven\'t received any data from your store yet. Please make sure to add the following tracking code in the <head> tag of all your store pages.',
    'storeDetails.verifyInstall': 'Verify Installation',
    'storeDetails.verifying': 'Verifying...',
    'storeDetails.activated': 'Activated',
    'storeDetails.totalVisits': 'Total Visits',
    'storeDetails.addCarts': 'Add to Carts',
    'storeDetails.totalEvents': 'Total Events',
    'storeDetails.liveEvents': 'Live Event Log',
    'storeDetails.liveEventsDesc': 'Latest data coming from your tracking code.',
    'storeDetails.noEvents': 'No events recorded yet.',
    
    // Analytics
    'analytics.title': 'Analytics',
    'analytics.description': 'Detailed insights into your store\'s performance and customer behavior.',
    'analytics.totalVisitors': 'Total Visitors',
    'analytics.abandonedCarts': 'Abandoned Carts',
    'analytics.recoveredCarts': 'Recovered Carts',
    'analytics.recoveryRate': 'Recovery Rate',
    'analytics.revenueRecovered': 'Revenue Recovered',
    'analytics.conversionFunnel': 'Conversion Funnel',
    'analytics.visitors': 'Visitors',
    'analytics.productViews': 'Product Views',
    'analytics.addedToCart': 'Added to Cart',
    'analytics.purchases': 'Purchases',
    
    // Reports
    'reports.title': 'Reports',
    'reports.description': 'Generate and download detailed reports for your stores.',
    'reports.selectStore': 'Select Store',
    'reports.allStores': 'All Stores',
    'reports.dateRange': 'Date Range',
    'reports.last7Days': 'Last 7 Days',
    'reports.last30Days': 'Last 30 Days',
    'reports.thisMonth': 'This Month',
    'reports.lastMonth': 'Last Month',
    'reports.generateReport': 'Generate Report',
    'reports.downloadPdf': 'Download PDF',
    'reports.downloadCsv': 'Download CSV',
    'reports.recentReports': 'Recent Reports',
    'reports.noReports': 'No reports generated yet.',
    
    // Overview
    'overview.welcome': 'Welcome back',
    'overview.description': 'Here is what\'s happening with your stores today.',
    'overview.proTip': 'Pro Tip',
    'overview.recoveryPerformance': 'Recovery Performance (Last 7 Days)',
    'overview.abandonmentReasons': 'Top Reasons for Cart Abandonment',
    
    // Plans
    'plans.title': 'Subscription Plans',
    'plans.description': 'Choose the plan that fits your business needs.',
    'plans.current': 'Current Plan',
    'plans.subscribe': 'Subscribe',
    'plans.basic': 'Basic',
    'plans.pro': 'Professional',
    'plans.enterprise': 'Enterprise',
    
    // Support
    'support.title': 'Help & Support',
    'support.description': 'Get help with your account or contact our support team.',
    'support.faq': 'Frequently Asked Questions',
    'support.contactUs': 'Contact Us',
    'support.subject': 'Subject',
    'support.message': 'Message',
    'support.send': 'Send Message',
    
    // Footer
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.contact': 'Contact Us',
    'footer.rights': 'All rights reserved.',
  },
  ar: {
    // General
    'app.name': 'Avbora',
    'app.description': 'حوّل زوارك إلى عملاء',
    'nav.about': 'من نحن',
    'nav.howItWorks': 'كيف يعمل',
    'nav.features': 'المميزات',
    'nav.login': 'تسجيل الدخول',
    'nav.register': 'ابدأ الآن',
    'nav.dashboard': 'لوحة التحكم',
    'nav.admin': 'الإدارة',
    'nav.logout': 'تسجيل الخروج',
    
    // Dashboard Sidebar
    'sidebar.overview': 'نظرة عامة',
    'sidebar.stores': 'المتاجر',
    'sidebar.analytics': 'التحليلات',
    'sidebar.reports': 'التقارير',
    'sidebar.plans': 'الباقات',
    'sidebar.profile': 'حسابي',
    'sidebar.support': 'الدعم الفني',
    'sidebar.settings': 'الإعدادات',
    
    // Profile
    'profile.title': 'حسابي',
    'profile.description': 'إدارة معلوماتك الشخصية وتفاصيل الاشتراك.',
    'profile.personalInfo': 'المعلومات الشخصية',
    'profile.updateContact': 'تحديث بيانات الاتصال الخاصة بك.',
    'profile.firstName': 'الاسم الأول',
    'profile.lastName': 'الاسم الثاني',
    'profile.email': 'البريد الإلكتروني',
    'profile.emailDesc': 'لا يمكن تغيير البريد الإلكتروني حالياً.',
    'profile.phone': 'رقم الهاتف',
    'profile.country': 'الدولة',
    'profile.saveChanges': 'حفظ التغييرات',
    'profile.saving': 'جاري الحفظ...',
    'profile.subscriptionDetails': 'تفاصيل الاشتراك',
    'profile.currentPlan': 'الباقة الحالية',
    'profile.language': 'اللغة',
    'profile.languageDesc': 'اختر لغتك المفضلة للوحة التحكم.',
    
    // Stores
    'stores.title': 'المتاجر المربوطة',
    'stores.description': 'إدارة المتاجر الخاصة بك وربط متاجر جديدة.',
    'stores.addNew': 'ربط متجر جديد',
    'stores.addStoreTitle': 'إضافة متجر جديد',
    'stores.addStoreDesc': 'أدخل بيانات المتجر للحصول على كود التتبع الخاص بك.',
    'stores.storeName': 'اسم المتجر (مثال: متجر الأناقة)',
    'stores.storeUrl': 'https://your-store.com',
    'stores.generateCode': 'إنشاء كود التتبع',
    'stores.codeGenerated': 'تم إنشاء الكود بنجاح',
    'stores.copyCodeDesc': 'قم بنسخ الكود التالي ولصقه في وسم <head> في جميع صفحات متجرك.',
    'stores.copyCode': 'نسخ الكود',
    'stores.close': 'إغلاق',
    'stores.viewDetails': 'عرض تفاصيل المتجر',
    'stores.noStores': 'لا توجد متاجر مربوطة',
    'stores.noStoresDesc': 'قم بربط متجرك الأول للبدء في تتبع البيانات.',
    'stores.active': 'نشط',
    'stores.pending': 'في انتظار الربط',
    'stores.visitorsThisMonth': 'الزوار هذا الشهر',
    'stores.conversionRate': 'معدل التحويل',
    
    // Store Details
    'storeDetails.waitingData': 'في انتظار استقبال البيانات',
    'storeDetails.waitingDataDesc': 'لم نستقبل أي بيانات من متجرك حتى الآن. يرجى التأكد من إضافة كود التتبع التالي في وسم <head> في جميع صفحات متجرك.',
    'storeDetails.verifyInstall': 'التحقق من التثبيت',
    'storeDetails.verifying': 'جاري التحقق...',
    'storeDetails.activated': 'تم التفعيل',
    'storeDetails.totalVisits': 'إجمالي الزيارات',
    'storeDetails.addCarts': 'إضافات للسلة',
    'storeDetails.totalEvents': 'إجمالي الأحداث',
    'storeDetails.liveEvents': 'سجل الأحداث المباشر',
    'storeDetails.liveEventsDesc': 'أحدث البيانات الواردة من كود التتبع الخاص بك.',
    'storeDetails.noEvents': 'لا توجد أحداث مسجلة حتى الآن.',
    
    // Analytics
    'analytics.title': 'التحليلات',
    'analytics.description': 'رؤى تفصيلية حول أداء متجرك وسلوك العملاء.',
    'analytics.totalVisitors': 'إجمالي الزوار',
    'analytics.abandonedCarts': 'السلال المتروكة',
    'analytics.recoveredCarts': 'السلال المسترجعة',
    'analytics.recoveryRate': 'معدل الاسترجاع',
    'analytics.revenueRecovered': 'الإيرادات المسترجعة',
    'analytics.conversionFunnel': 'قمع التحويل',
    'analytics.visitors': 'الزوار',
    'analytics.productViews': 'مشاهدات المنتجات',
    'analytics.addedToCart': 'أضاف للسلة',
    'analytics.purchases': 'عمليات الشراء',
    
    // Reports
    'reports.title': 'التقارير',
    'reports.description': 'إنشاء وتحميل تقارير تفصيلية لمتاجرك.',
    'reports.selectStore': 'اختر المتجر',
    'reports.allStores': 'جميع المتاجر',
    'reports.dateRange': 'الفترة الزمنية',
    'reports.last7Days': 'آخر 7 أيام',
    'reports.last30Days': 'آخر 30 يوم',
    'reports.thisMonth': 'هذا الشهر',
    'reports.lastMonth': 'الشهر الماضي',
    'reports.generateReport': 'إنشاء التقرير',
    'reports.downloadPdf': 'تحميل PDF',
    'reports.downloadCsv': 'تحميل CSV',
    'reports.recentReports': 'التقارير الحديثة',
    'reports.noReports': 'لم يتم إنشاء أي تقارير بعد.',
    
    // Overview
    'overview.welcome': 'مرحباً بعودتك',
    'overview.description': 'إليك ما يحدث في متاجرك اليوم.',
    'overview.proTip': 'نصيحة احترافية',
    'overview.recoveryPerformance': 'أداء الاسترجاع (آخر 7 أيام)',
    'overview.abandonmentReasons': 'أهم أسباب ترك السلة',
    
    // Plans
    'plans.title': 'باقات الاشتراك',
    'plans.description': 'اختر الباقة التي تناسب احتياجات عملك.',
    'plans.current': 'الباقة الحالية',
    'plans.subscribe': 'اشتراك',
    'plans.basic': 'الأساسية',
    'plans.pro': 'الاحترافية',
    'plans.enterprise': 'المؤسسات',
    
    // Support
    'support.title': 'الدعم الفني والمساعدة',
    'support.description': 'احصل على المساعدة بخصوص حسابك أو تواصل مع فريق الدعم.',
    'support.faq': 'الأسئلة الشائعة',
    'support.contactUs': 'تواصل معنا',
    'support.subject': 'الموضوع',
    'support.message': 'الرسالة',
    'support.send': 'إرسال الرسالة',
    
    // Footer
    'footer.privacy': 'سياسة الخصوصية',
    'footer.terms': 'شروط الخدمة',
    'footer.contact': 'اتصل بنا',
    'footer.rights': 'جميع الحقوق محفوظة.',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Default to English
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
