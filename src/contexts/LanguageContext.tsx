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
    'app.name': 'AI Vision Beyond',
    'app.description': 'Generate and Schedule AI Articles',
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
    'sidebar.articles': 'Articles',
    'sidebar.media': 'Media',
    'sidebar.account': 'My Account',
    'sidebar.blogSettings': 'Blog Settings',
    'sidebar.subscriptions': 'Subscriptions',
    'sidebar.support': 'Support',
    
    // Home Page
    'home.heroTitle': 'Turn your Blogger blog into a traffic machine... automatically',
    'home.heroDesc': 'Stop wasting your time writing articles manually. AI Vision Beyond creates SEO-friendly content for you and publishes it automatically on your blog — no spam, no effort.',
    'home.startFree': 'Start Now for Free',
    'home.seeHow': 'See how it works',
    'home.trustLine': 'No Spam - Original Content - Real Results',
    
    'home.problemTitle': 'Why do most blogs fail?',
    'home.problemDesc': 'Because they rely on:',
    'home.problemItem1': 'Weak or duplicate content',
    'home.problemItem2': 'Lack of consistency in posting',
    'home.problemItem3': 'Not understanding SEO',
    'home.problemResult': 'The result? No traffic... no results.',
    
    'home.solutionTitle': 'Here comes AI Vision Beyond',
    'home.solutionDesc': 'AI Vision Beyond turns your blog into a smart system that works for you:',
    'home.solutionItem1': 'Writes articles',
    'home.solutionItem2': 'Optimizes them for search engines',
    'home.solutionItem3': 'Publishes them automatically',
    'home.solutionResult': 'And you? Just watch the results.',
    
    'home.featuresTitle': 'Everything you need to grow on Blogger',
    'home.feature1Title': 'Smart Content Writing',
    'home.feature1Desc': 'Articles that look like a human wrote them... but faster and more accurate.',
    'home.feature2Title': 'Built-in SEO',
    'home.feature2Desc': 'We choose keywords and build the article in a way Google loves.',
    'home.feature3Title': 'Full Auto-Publishing',
    'home.feature3Desc': 'Set the schedule... and the rest happens without your intervention.',
    'home.feature4Title': 'No Spam',
    'home.feature4Desc': 'Clean links, reliable content, and real growth.',
    'home.feature5Title': 'Speed in Execution',
    'home.feature5Desc': 'Ready article in minutes instead of hours.',
    
    'home.howTitle': 'Steps... and results begin',
    'home.howStep1': 'Connect your blog',
    'home.howStep2': 'Choose article idea',
    'home.howStep3': 'Content creation',
    'home.howStep4': 'Auto-publishing',
    'home.howTime': 'The whole process takes no more than minutes',
    
    'home.useCasesTitle': 'AI Vision Beyond is not for everyone... but it is perfect for you if you:',
    'home.useCase1': 'Want to increase your blog traffic quickly',
    'home.useCase2': 'Don\'t have time to write content',
    'home.useCase3': 'Want income from Blogger',
    'home.useCase4': 'Work in SEO or marketing',
    
    'home.socialTitle': 'Start before everyone else',
    'home.socialDesc': 'Be among the first users to benefit from AI Vision Beyond before advanced features are launched.',
    
    'home.pricingTitle': 'Invest in your growth',
    'home.pricingDesc': 'Instead of paying editors or wasting your time... AI Vision Beyond offers you everything in a simple subscription.',
    'home.viewPlans': 'View Plans',
    
    'home.finalTitle': 'Start today... or let competitors overtake you',
    'home.finalDesc': 'Every day without content = a lost opportunity. Start now and make your blog work for you.',
    'home.createAccount': 'Create Free Account Now',
    'profile.description': 'Manage your personal information and account preferences.',
    'profile.personalInfo': 'Personal Information',
    'profile.updateContact': 'Update your contact details.',
    'profile.firstName': 'First Name',
    'profile.lastName': 'Last Name',
    'profile.age': 'Age',
    'profile.email': 'Email',
    'profile.emailDesc': 'Email address cannot be changed currently.',
    'profile.phone': 'Phone Number',
    'profile.country': 'Country',
    'profile.saveChanges': 'Save Changes',
    'profile.saving': 'Saving...',
    'profile.subscriptionDetails': 'Subscription Details',
    'profile.currentPlan': 'Current Plan',
    'profile.language': 'Site Language',
    'profile.languageDesc': 'Choose your preferred language for the dashboard.',
    'profile.accountType': 'Account Type',
    'profile.individual': 'Individual',
    'profile.business': 'Business',
    'profile.avatar': 'Choose your Avatar',
    'profile.avatar1': 'Avatar 1',
    'profile.avatar2': 'Avatar 2',
    'profile.avatar3': 'Avatar 3',
    'profile.uploadAvatar': 'Upload New Avatar',
    'profile.uploading': 'Uploading...',
    'profile.avatarSuccess': 'Avatar updated successfully',
    'profile.avatarError': 'Failed to upload avatar',
    'profile.freePlan': 'Free Plan',
    'profile.upgradePlan': 'Upgrade Plan',
    
    // Blog Settings
    'blogSettings.title': 'Blog Settings',
    'blogSettings.description': 'Manage your connected Blogger blogs to publish articles automatically.',
    'blogSettings.connectBlogger': 'Connect Blogger Account',
    'blogSettings.connectBloggerDesc': 'Connect your Google account to fetch your Blogger blogs. You can then choose which blogs to manage via the platform and set their preferences.',
    'blogSettings.connectGoogle': 'Connect Google Account',
    'blogSettings.refreshBlogs': 'Refresh Blogs',
    'blogSettings.connectedBlogs': 'Connected Blogs',
    'blogSettings.noBlogs': 'No blogs connected',
    'blogSettings.noBlogsDesc': 'Connect your Google account to fetch your blogs and start auto-publishing.',
    'blogSettings.manageConnection': 'Manage your Blogger connection and blogs.',
    'blogSettings.bloggerConnection': 'Blogger Connection',
    'blogSettings.bloggerConnectionDesc': 'Connect your Blogger account to enable article scheduling and publishing.',
    'blogSettings.connectedToBlogger': 'Connected to Blogger',
    'blogSettings.notConnected': 'Not Connected',
    'blogSettings.accountReady': 'Your account is ready for publishing.',
    'blogSettings.connectToStart': 'Connect your account to start publishing.',
    'blogSettings.disconnect': 'Disconnect',
    'blogSettings.confirmDisconnect': 'Are you sure you want to disconnect your Blogger account?',
    'blogSettings.yourBlogs': 'Your Blogs',
    'blogSettings.yourBlogsDesc': 'Blogs associated with your connected account.',
    'blogSettings.syncBlogs': 'Sync Blogs',
    'blogSettings.syncing': 'Syncing...',
    'blogSettings.visitBlog': 'Visit Blog',
    'blogSettings.noBlogsFound': 'No blogs found. Click sync to fetch your blogs.',
    'blogSettings.syncNow': 'Sync Blogs Now',
    
    // Overview
    'overview.welcome': 'Welcome',
    'overview.description': 'Here is an overview of your blogs and articles performance today.',
    'overview.newArticle': 'New Article',
    'overview.totalArticles': 'Total Articles',
    'overview.connectedBlogs': 'Connected Blogs',
    'overview.estimatedTraffic': 'Estimated Traffic',
    'overview.timeSaved': 'Time Saved',
    'overview.recentArticles': 'Latest Uploaded Articles',
    'overview.recentArticlesDesc': 'Track the status of the latest generated articles.',
    'overview.viewAll': 'View All',
    'overview.noArticles': 'No articles yet. Start',
    'overview.tipOfDay': 'Tip of the day to increase profits 🚀',
    'overview.tipText': '"Catchy titles increase Click-Through Rate (CTR), try using numbers or questions in your titles."',
    'overview.notConnected': 'You haven\'t connected your blog yet!',
    'overview.notConnectedDesc': 'Log in with your Google account and connect a Blogger blog to publish articles automatically.',
    'overview.connectNow': 'Connect Blog Now',
    'overview.active': 'Active',
    'overview.estimated': 'Estimated',
    'overview.comparedToManual': 'Compared to manual writing',
    'overview.hours': 'h',
    'overview.noArticlesHere': 'here',
    
    // Generate
    'generate.title': 'Generate Article',
    'generate.description': 'Create high-quality AI articles and schedule them for your blog.',
    'generate.settings': 'Article Settings',
    'generate.selectBlog': 'Select Blog',
    'generate.keywords': 'Keywords (comma separated)',
    'generate.scheduleDate': 'Schedule Date & Time',
    'generate.promptTitle': 'What should the article be about?',
    'generate.promptPlaceholder': 'Describe the topic, tone, and key points...',
    'generate.generateBtn': 'Generate Article',
    'generate.success': 'Article saved successfully!',
    'generate.saveDraft': 'Save Draft',
    'generate.schedule': 'Schedule',
    'generate.publishNow': 'Publish Now',
    'generate.error': 'Failed to publish article. Please check your Blogger connection.',
    
    // Articles
    'articles.title': 'Articles',
    'articles.description': 'Manage your generated and scheduled articles.',
    'articles.noArticles': 'No articles yet',
    'articles.noArticlesDesc': 'Start by generating your first AI article.',
    'articles.generateBtn': 'Generate Article',
    'articles.viewOnBlogger': 'View on Blogger',
    'articles.confirmDelete': 'Are you sure you want to delete this article?',
    
    // Media
    'media.title': 'Media',
    'media.description': 'Manage your images and media files.',
    'media.uploading': 'Uploading',
    'media.uploadImage': 'Upload Image',
    'media.emptyTitle': 'Media Library Empty',
    'media.emptyDesc': 'Upload images to use them in your articles.',
    'media.uploadFirst': 'Upload First Image',
    'media.confirmDelete': 'Are you sure you want to delete this image?',
    
    // Subscriptions
    'subscriptions.title': 'Subscriptions',
    'subscriptions.description': 'Manage your subscription plans.',
    'subscriptions.free': 'Free',
    'subscriptions.pro': 'Pro',
    'subscriptions.agency': 'Agency',
    'subscriptions.month': '/month',
    'subscriptions.freeDesc': 'Perfect for getting started and testing the platform.',
    'subscriptions.proDesc': 'Ideal for active bloggers who need more volume.',
    'subscriptions.agencyDesc': 'For agencies managing multiple blogs and clients.',
    'subscriptions.currentPlan': 'Current Plan',
    'subscriptions.upgradePro': 'Upgrade to Pro',
    'subscriptions.upgradeAgency': 'Upgrade to Agency',
    'subscriptions.mostPopular': 'Most Popular',
    'subscriptions.securePayment': 'Secure Payment',
    'subscriptions.secureDesc': 'All payments are processed securely via Stripe. You can cancel or change your plan at any time.',
    'subscriptions.freeFeature1': 'Up to 5 articles per month',
    'subscriptions.freeFeature2': '1 connected Blogger account',
    'subscriptions.freeFeature3': 'Basic AI generation',
    'subscriptions.freeFeature4': 'Standard support',
    'subscriptions.proFeature1': 'Up to 50 articles per month',
    'subscriptions.proFeature2': '3 connected Blogger accounts',
    'subscriptions.proFeature3': 'Advanced AI generation (GPT-4)',
    'subscriptions.proFeature4': 'Priority support',
    'subscriptions.proFeature5': 'Custom article scheduling',
    'subscriptions.agencyFeature1': 'Unlimited articles',
    'subscriptions.agencyFeature2': 'Unlimited Blogger accounts',
    'subscriptions.agencyFeature3': 'Premium AI generation',
    'subscriptions.agencyFeature4': '24/7 Priority support',
    'subscriptions.agencyFeature5': 'Custom branding',
    'subscriptions.agencyFeature6': 'API access',
    
    // Support
    'support.title': 'Support',
    'support.description': 'Get help with your account or contact our support team.',
    'support.faq': 'Frequently Asked Questions',
    'support.contactUs': 'Contact Us',
    'support.subject': 'Subject',
    'support.subjectPlaceholder': 'How can we help you?',
    'support.message': 'Message',
    'support.messagePlaceholder': 'Please describe your issue in detail...',
    'support.send': 'Send Message',
    'support.sending': 'Sending...',
    'support.success': 'Your message has been sent successfully. We will get back to you soon.',
    'support.error': 'Failed to send message. Please try again later.',
    'support.immediateHelp': 'Need immediate help?',
    'support.immediateDesc': 'Check out our documentation and FAQs for quick answers to common questions.',
    'support.viewDocs': 'View Documentation',
    'support.contactInfo': 'Contact Information',
    'support.email': 'Email:',
    'support.hours': 'Hours:',
    'support.hoursValue': 'Mon-Fri, 9am-5pm EST',
    
    // Footer
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.contact': 'Contact Us',
    'footer.rights': 'All rights reserved.',
  },
  ar: {
    // General
    'app.name': 'AI Vision Beyond',
    'app.description': 'إنشاء وجدولة المقالات بالذكاء الاصطناعي',
    'nav.about': 'من نحن',
    'nav.howItWorks': 'كيف يعمل',
    'nav.features': 'المميزات',
    'nav.login': 'تسجيل الدخول',
    'nav.register': 'ابدأ الآن',
    'nav.dashboard': 'لوحة التحكم',
    'nav.admin': 'الإدارة',
    'nav.logout': 'تسجيل الخروج',
    
    // Dashboard Sidebar
    'sidebar.overview': 'النظرة العامة',
    'sidebar.articles': 'المقالات',
    'sidebar.media': 'الوسائط',
    'sidebar.account': 'حسابي',
    'sidebar.blogSettings': 'إعدادات المدونة',
    'sidebar.subscriptions': 'الاشتراكات',
    'sidebar.support': 'الدعم',
    
    // Home Page
    'home.heroTitle': 'حوّل مدونة Blogger إلى آلة زيارات… تعمل تلقائيًا',
    'home.heroDesc': 'توقف عن إضاعة وقتك في كتابة المقالات يدويًا. AI Vision Beyond ينشئ لك محتوى متوافق مع SEO، وينشره تلقائيًا على مدونتك — بدون سبام، وبدون مجهود.',
    'home.startFree': 'ابدأ الآن مجانًا',
    'home.seeHow': 'شاهد كيف يعمل',
    'home.trustLine': 'لا سبام - محتوى أصلي - نتائج حقيقية',
    
    'home.problemTitle': 'لماذا لا تنجح معظم المدونات؟',
    'home.problemDesc': 'لأنها تعتمد على:',
    'home.problemItem1': 'محتوى ضعيف أو مكرر',
    'home.problemItem2': 'عدم الاستمرار في النشر',
    'home.problemItem3': 'عدم فهم SEO',
    'home.problemResult': 'والنتيجة؟ لا زيارات… ولا نتائج.',
    
    'home.solutionTitle': 'هنا يأتي دور AI Vision Beyond',
    'home.solutionDesc': 'AI Vision Beyond يحوّل مدونتك إلى نظام ذكي يعمل عنك:',
    'home.solutionItem1': 'يكتب المقالات',
    'home.solutionItem2': 'يحسّنها لمحركات البحث',
    'home.solutionItem3': 'ينشرها تلقائيًا',
    'home.solutionResult': 'وأنت؟ تراقب النتائج فقط.',
    
    'home.featuresTitle': 'كل ما تحتاجه للنمو في Blogger',
    'home.feature1Title': 'كتابة محتوى ذكي',
    'home.feature1Desc': 'مقالات تبدو وكأن إنسان كتبها… لكنها أسرع وأدق.',
    'home.feature2Title': 'SEO مدمج',
    'home.feature2Desc': 'نختار الكلمات المفتاحية ونبني المقال بطريقة يحبها Google.',
    'home.feature3Title': 'نشر تلقائي كامل',
    'home.feature3Desc': 'حدد الجدول… والباقي يتم بدون تدخلك.',
    'home.feature4Title': 'بدون سبام',
    'home.feature4Desc': 'روابط نظيفة، محتوى موثوق، ونمو حقيقي.',
    'home.feature5Title': 'سرعة في التنفيذ',
    'home.feature5Desc': 'مقال جاهز خلال دقائق بدل ساعات.',
    
    'home.howTitle': 'خطوات… وتبدأ النتائج',
    'home.howStep1': 'اربط مدونتك',
    'home.howStep2': 'اختر فكرة المقال',
    'home.howStep3': 'إنشاء المحتوى',
    'home.howStep4': 'نشر تلقائي',
    'home.howTime': 'العملية كلها لا تستغرق أكثر من دقائق',
    
    'home.useCasesTitle': 'AI Vision Beyond ليس للجميع… لكنه مثالي لك إذا كنت:',
    'home.useCase1': 'تريد زيادة زيارات مدونتك بسرعة',
    'home.useCase2': 'لا تملك وقت لكتابة المحتوى',
    'home.useCase3': 'تريد دخل من Blogger',
    'home.useCase4': 'تعمل في SEO أو التسويق',
    
    'home.socialTitle': 'ابدأ قبل الجميع',
    'home.socialDesc': 'كن من أوائل المستخدمين الذين يستفيدون من AI Vision Beyond قبل إطلاق الميزات المتقدمة.',
    
    'home.pricingTitle': 'استثمر في نموك',
    'home.pricingDesc': 'بدل أن تدفع لمحررين أو تضيع وقتك… AI Vision Beyond يقدم لك كل شيء في اشتراك بسيط.',
    'home.viewPlans': 'عرض الخطط',
    
    'home.finalTitle': 'ابدأ اليوم… أو اترك المنافسين يسبقونك',
    'home.finalDesc': 'كل يوم بدون محتوى = فرصة ضائعة. ابدأ الآن واجعل مدونتك تعمل لصالحك.',
    'home.createAccount': 'إنشاء حساب مجاني الآن',
    'profile.description': 'إدارة معلوماتك الشخصية وتفضيلات الحساب.',
    'profile.personalInfo': 'المعلومات الشخصية',
    'profile.updateContact': 'تحديث بيانات الاتصال الخاصة بك.',
    'profile.firstName': 'الاسم الأول',
    'profile.lastName': 'الاسم الأخير',
    'profile.age': 'العمر',
    'profile.email': 'البريد الإلكتروني',
    'profile.emailDesc': 'لا يمكن تغيير البريد الإلكتروني المرتبط بالحساب.',
    'profile.phone': 'رقم الهاتف',
    'profile.country': 'الدولة',
    'profile.saveChanges': 'حفظ التغييرات',
    'profile.saving': 'جاري الحفظ...',
    'profile.subscriptionDetails': 'تفاصيل الاشتراك',
    'profile.currentPlan': 'الخطة المشترك فيها',
    'profile.language': 'لغة الموقع',
    'profile.languageDesc': 'اختر لغتك المفضلة للوحة التحكم.',
    'profile.accountType': 'نوع الحساب',
    'profile.individual': 'فرد',
    'profile.business': 'شركة',
    'profile.avatar': 'اختر صورتك الرمزية (Avatar)',
    'profile.avatar1': 'صورة رمزية 1',
    'profile.avatar2': 'صورة رمزية 2',
    'profile.avatar3': 'صورة رمزية 3',
    'profile.uploadAvatar': 'رفع صورة جديدة',
    'profile.uploading': 'جاري الرفع...',
    'profile.avatarSuccess': 'تم تحديث الصورة بنجاح',
    'profile.avatarError': 'فشل في رفع الصورة',
    'profile.freePlan': 'الخطة المجانية',
    'profile.upgradePlan': 'ترقية الخطة',
    
    // Blog Settings
    'blogSettings.title': 'إعدادات المدونة',
    'blogSettings.description': 'قم بإدارة المدونات المربوطة بحسابك لنشر المقالات تلقائياً.',
    'blogSettings.connectBlogger': 'ربط حساب Blogger',
    'blogSettings.connectBloggerDesc': 'قم بربط حسابك في Google لجلب مدونات Blogger الخاصة بك. يمكنك بعد ذلك اختيار المدونات التي تريد إدارتها عبر المنصة وتحديد إعداداتها.',
    'blogSettings.connectGoogle': 'ربط حساب Google',
    'blogSettings.refreshBlogs': 'تحديث المدونات',
    'blogSettings.connectedBlogs': 'المدونات المربوطة',
    'blogSettings.noBlogs': 'لا توجد مدونات مربوطة',
    'blogSettings.noBlogsDesc': 'قم بربط حساب Google الخاص بك لجلب مدوناتك والبدء في النشر التلقائي.',
    'blogSettings.manageConnection': 'إدارة اتصال Blogger والمدونات الخاصة بك.',
    'blogSettings.bloggerConnection': 'اتصال Blogger',
    'blogSettings.bloggerConnectionDesc': 'قم بربط حساب Blogger الخاص بك لتمكين جدولة ونشر المقالات.',
    'blogSettings.connectedToBlogger': 'متصل بـ Blogger',
    'blogSettings.notConnected': 'غير متصل',
    'blogSettings.accountReady': 'حسابك جاهز للنشر.',
    'blogSettings.connectToStart': 'قم بربط حسابك لبدء النشر.',
    'blogSettings.disconnect': 'قطع الاتصال',
    'blogSettings.confirmDisconnect': 'هل أنت متأكد أنك تريد قطع اتصال حساب Blogger الخاص بك؟',
    'blogSettings.yourBlogs': 'مدوناتك',
    'blogSettings.yourBlogsDesc': 'المدونات المرتبطة بحسابك المتصل.',
    'blogSettings.syncBlogs': 'مزامنة المدونات',
    'blogSettings.syncing': 'جاري المزامنة...',
    'blogSettings.visitBlog': 'زيارة المدونة',
    'blogSettings.noBlogsFound': 'لم يتم العثور على مدونات. انقر فوق مزامنة لجلب مدوناتك.',
    'blogSettings.syncNow': 'مزامنة المدونات الآن',
    
    // Overview
    'overview.welcome': 'مرحباً',
    'overview.description': 'إليك نظرة عامة على أداء مدوناتك ومقالاتك اليوم.',
    'overview.newArticle': 'مقال جديد',
    'overview.totalArticles': 'إجمالي المقالات',
    'overview.connectedBlogs': 'المدونات المربوطة',
    'overview.estimatedTraffic': 'الزيارات المقدرة',
    'overview.timeSaved': 'وقت التوفير',
    'overview.recentArticles': 'أحدث المقالات المرفوعة',
    'overview.recentArticlesDesc': 'تابع حالة آخر المقالات التي تم توليدها.',
    'overview.viewAll': 'عرض الكل',
    'overview.noArticles': 'لا توجد مقالات بعد. ابدأ',
    'overview.tipOfDay': 'نصيحة اليوم لزيادة الأرباح 🚀',
    'overview.tipText': '"العناوين الجذابة تزيد من نسبة النقر (CTR)، جرب استخدام الأرقام أو الأسئلة في عناوينك."',
    'overview.discoverMore': 'اكتشف المزيد من النصائح',
    'overview.notConnected': 'لم تقم بربط مدونتك بعد!',
    'overview.notConnectedDesc': 'قم بتسجيل الدخول باستخدام حساب Google الخاص بك واربط مدونة Blogger لنشر المقالات تلقائياً.',
    'overview.connectNow': 'ربط المدونة الآن',
    'overview.active': 'نشط',
    'overview.estimated': 'تقديري',
    'overview.comparedToManual': 'مقارنة بالكتابة اليدوية',
    'overview.hours': 'س',
    'overview.noArticlesHere': 'هنا',
    
    // Generate
    'generate.title': 'توليد مقال',
    'generate.description': 'قم بإنشاء مقالات عالية الجودة باستخدام الذكاء الاصطناعي وجدولتها لمدونتك.',
    'generate.settings': 'إعدادات المقال',
    'generate.selectBlog': 'اختر المدونة',
    'generate.keywords': 'الكلمات المفتاحية (مفصولة بفاصلة)',
    'generate.scheduleDate': 'تاريخ ووقت الجدولة',
    'generate.promptTitle': 'عن ماذا يجب أن يكون المقال؟',
    'generate.promptPlaceholder': 'صف الموضوع، النبرة، والنقاط الرئيسية...',
    'generate.generateBtn': 'توليد المقال',
    'generate.success': 'تم حفظ المقال بنجاح!',
    'generate.saveDraft': 'حفظ كمسودة',
    'generate.schedule': 'جدولة',
    'generate.publishNow': 'نشر الآن',
    'generate.error': 'فشل نشر المقال. يرجى التحقق من اتصالك بـ Blogger.',
    
    // Articles
    'articles.title': 'المقالات',
    'articles.description': 'إدارة المقالات التي تم إنشاؤها وجدولتها.',
    'articles.noArticles': 'لا توجد مقالات بعد',
    'articles.noArticlesDesc': 'ابدأ بتوليد مقالك الأول باستخدام الذكاء الاصطناعي.',
    'articles.generateBtn': 'توليد مقال',
    'articles.viewOnBlogger': 'عرض على Blogger',
    'articles.confirmDelete': 'هل أنت متأكد أنك تريد حذف هذا المقال؟',
    
    // Media
    'media.title': 'الوسائط',
    'media.description': 'إدارة الصور وملفات الوسائط.',
    'media.uploading': 'جاري الرفع',
    'media.uploadImage': 'رفع صورة',
    'media.emptyTitle': 'مكتبة الوسائط فارغة',
    'media.emptyDesc': 'قم برفع الصور لاستخدامها في مقالاتك.',
    'media.uploadFirst': 'رفع أول صورة',
    'media.confirmDelete': 'هل أنت متأكد أنك تريد حذف هذه الصورة؟',
    
    // Subscriptions
    'subscriptions.title': 'الاشتراكات',
    'subscriptions.description': 'إدارة خطط الاشتراك الخاصة بك.',
    'subscriptions.free': 'مجاني',
    'subscriptions.pro': 'احترافي',
    'subscriptions.agency': 'وكالة',
    'subscriptions.month': '/شهر',
    'subscriptions.freeDesc': 'مثالي للبدء واختبار المنصة.',
    'subscriptions.proDesc': 'مثالي للمدونين النشطين الذين يحتاجون إلى حجم أكبر.',
    'subscriptions.agencyDesc': 'للوكالات التي تدير مدونات وعملاء متعددين.',
    'subscriptions.currentPlan': 'الخطة الحالية',
    'subscriptions.upgradePro': 'الترقية إلى احترافي',
    'subscriptions.upgradeAgency': 'الترقية إلى وكالة',
    'subscriptions.mostPopular': 'الأكثر شعبية',
    'subscriptions.securePayment': 'دفع آمن',
    'subscriptions.secureDesc': 'تتم معالجة جميع المدفوعات بشكل آمن عبر Stripe. يمكنك الإلغاء أو تغيير خطتك في أي وقت.',
    'subscriptions.freeFeature1': 'ما يصل إلى 5 مقالات شهرياً',
    'subscriptions.freeFeature2': 'حساب Blogger واحد متصل',
    'subscriptions.freeFeature3': 'توليد أساسي بالذكاء الاصطناعي',
    'subscriptions.freeFeature4': 'دعم قياسي',
    'subscriptions.proFeature1': 'ما يصل إلى 50 مقال شهرياً',
    'subscriptions.proFeature2': '3 حسابات Blogger متصلة',
    'subscriptions.proFeature3': 'توليد متقدم بالذكاء الاصطناعي (GPT-4)',
    'subscriptions.proFeature4': 'دعم ذو أولوية',
    'subscriptions.proFeature5': 'جدولة مقالات مخصصة',
    'subscriptions.agencyFeature1': 'مقالات غير محدودة',
    'subscriptions.agencyFeature2': 'حسابات Blogger غير محدودة',
    'subscriptions.agencyFeature3': 'توليد متميز بالذكاء الاصطناعي',
    'subscriptions.agencyFeature4': 'دعم ذو أولوية على مدار الساعة',
    'subscriptions.agencyFeature5': 'علامة تجارية مخصصة',
    'subscriptions.agencyFeature6': 'وصول API',
    
    // Support
    'support.title': 'الدعم',
    'support.description': 'احصل على المساعدة أو تواصل مع فريق الدعم.',
    'support.faq': 'الأسئلة الشائعة',
    'support.contactUs': 'اتصل بنا',
    'support.subject': 'الموضوع',
    'support.subjectPlaceholder': 'كيف يمكننا مساعدتك؟',
    'support.message': 'الرسالة',
    'support.messagePlaceholder': 'يرجى وصف مشكلتك بالتفصيل...',
    'support.send': 'إرسال الرسالة',
    'support.sending': 'جاري الإرسال...',
    'support.success': 'تم إرسال رسالتك بنجاح. سنعود إليك قريباً.',
    'support.error': 'فشل إرسال الرسالة. يرجى المحاولة مرة أخرى لاحقاً.',
    'support.immediateHelp': 'بحاجة إلى مساعدة فورية؟',
    'support.immediateDesc': 'تحقق من وثائقنا والأسئلة الشائعة للحصول على إجابات سريعة للأسئلة الشائعة.',
    'support.viewDocs': 'عرض الوثائق',
    'support.contactInfo': 'معلومات الاتصال',
    'support.email': 'البريد الإلكتروني:',
    'support.hours': 'ساعات العمل:',
    'support.hoursValue': 'الاثنين-الجمعة، 9 صباحاً - 5 مساءً (توقيت شرق الولايات المتحدة)',
    
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
