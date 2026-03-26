import { useLanguage } from "../contexts/LanguageContext";

export default function Privacy() {
  const { language } = useLanguage();

  return (
    <div className={`container mx-auto px-4 py-16 max-w-4xl font-sans ${language === 'ar' ? 'dir-rtl text-right' : 'dir-ltr text-left'}`}>
      <h1 className="text-4xl font-bold mb-4 text-center">
        {language === 'ar' ? 'سياسة الخصوصية – Avbora' : 'Privacy Policy – Avbora'}
      </h1>
      <p className="text-center text-muted-foreground mb-12">
        {language === 'ar' ? 'تاريخ السريان: 26 مارس 2026' : 'Effective Date: March 26, 2026'}
      </p>
      
      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            {language === 'ar' ? '1. مقدمة' : '1. Introduction'}
          </h2>
          <p>
            {language === 'ar' 
              ? 'Avbora ("نحن"، "لنا") هي منصة SaaS عالمية تلتزم بحماية خصوصيتك. تشرح سياسة الخصوصية هذه كيف نقوم بجمع بياناتك واستخدامها وحمايتها في جميع أنحاء العالم.'
              : 'Avbora (“we”, “our”, “us”) is a global SaaS platform committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your data worldwide.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            {language === 'ar' ? '2. المعلومات التي نجمعها' : '2. Information We Collect'}
          </h2>
          <p className="mb-2">{language === 'ar' ? 'قد نجمع:' : 'We may collect:'}</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{language === 'ar' ? 'المعلومات الشخصية (الاسم، عنوان البريد الإلكتروني)' : 'Personal Information (name, email address)'}</li>
            <li>{language === 'ar' ? 'بيانات العمل (تحليلات المتجر، بيانات الأداء)' : 'Business Data (store analytics, performance data)'}</li>
            <li>{language === 'ar' ? 'بيانات سلوك العملاء (التفاعلات، التصفح، نشاط الشراء)' : 'Customer Behavior Data (interactions, browsing, purchase activity)'}</li>
            <li>{language === 'ar' ? 'البيانات الفنية (عنوان IP، الجهاز، المتصفح)' : 'Technical Data (IP address, device, browser)'}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            {language === 'ar' ? '3. كيف نستخدم المعلومات' : '3. How We Use Information'}
          </h2>
          <p className="mb-2">{language === 'ar' ? 'نستخدم البيانات من أجل:' : 'We use data to:'}</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{language === 'ar' ? 'تقديم خدماتنا وتحسينها' : 'Provide and improve services'}</li>
            <li>{language === 'ar' ? 'تحليل السلوك وتوليد الرؤى' : 'Analyze behavior and generate insights'}</li>
            <li>{language === 'ar' ? 'أتمتة تفاعل العملاء (رسائل البريد الإلكتروني، العروض)' : 'Automate customer engagement (emails, offers)'}</li>
            <li>{language === 'ar' ? 'تعزيز تجربة المستخدم' : 'Enhance user experience'}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            {language === 'ar' ? '4. مشاركة البيانات' : '4. Data Sharing'}
          </h2>
          <p className="font-semibold text-foreground mb-2">
            {language === 'ar' ? 'نحن لا نبيع بياناتك.' : 'We do NOT sell your data.'}
          </p>
          <p className="mb-2">{language === 'ar' ? 'قد نشارك البيانات مع:' : 'We may share data with:'}</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{language === 'ar' ? 'مزودي الخدمات الموثوق بهم (الاستضافة، تسليم البريد الإلكتروني)' : 'Trusted service providers (hosting, email delivery)'}</li>
            <li>{language === 'ar' ? 'السلطات القانونية عند الاقتضاء' : 'Legal authorities when required'}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            {language === 'ar' ? '5. استخدام البيانات دولياً' : '5. International Data Use'}
          </h2>
          <p>
            {language === 'ar'
              ? 'كمنصة عالمية، قد تتم معالجة البيانات في بلدان مختلفة. باستخدام Avbora، فإنك توافق على ذلك.'
              : 'As a global platform, data may be processed in different countries. By using Avbora, you agree to this.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            {language === 'ar' ? '6. أمان البيانات' : '6. Data Security'}
          </h2>
          <p>
            {language === 'ar'
              ? 'نحن نطبق إجراءات حماية متوافقة مع معايير الصناعة، ولكن لا يوجد نظام آمن تماماً.'
              : 'We implement industry-standard protections, but no system is fully secure.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            {language === 'ar' ? '7. مسؤولية المستخدم' : '7. User Responsibility'}
          </h2>
          <p>
            {language === 'ar'
              ? 'يجب عليك ضمان الامتثال للقوانين المعمول بها (مثل GDPR)، بما في ذلك الحصول على موافقة عملائك.'
              : 'You must ensure compliance with applicable laws (GDPR, etc.), including obtaining consent from your customers.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            {language === 'ar' ? '8. الاحتفاظ بالبيانات' : '8. Data Retention'}
          </h2>
          <p>
            {language === 'ar'
              ? 'نحتفظ بالبيانات فقط بالقدر اللازم لتقديم الخدمة والامتثال القانوني.'
              : 'We retain data only as needed for service and legal compliance.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            {language === 'ar' ? '9. حقوقك' : '9. Your Rights'}
          </h2>
          <p className="mb-2">{language === 'ar' ? 'يمكنك طلب:' : 'You may request:'}</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{language === 'ar' ? 'الوصول' : 'Access'}</li>
            <li>{language === 'ar' ? 'التصحيح' : 'Correction'}</li>
            <li>{language === 'ar' ? 'الحذف' : 'Deletion'}</li>
            <li>{language === 'ar' ? 'تصدير البيانات' : 'Data export'}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            {language === 'ar' ? '10. التحديثات' : '10. Updates'}
          </h2>
          <p>
            {language === 'ar'
              ? 'قد نقوم بتحديث هذه السياسة في أي وقت.'
              : 'We may update this policy at any time.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            {language === 'ar' ? '11. اتصل بنا' : '11. Contact'}
          </h2>
          <p>
            {language === 'ar' ? 'البريد الإلكتروني: ' : 'Email: '}
            <a href="mailto:contact@avbora.online" className="text-primary hover:underline">contact@avbora.online</a>
          </p>
        </section>
      </div>
    </div>
  );
}
