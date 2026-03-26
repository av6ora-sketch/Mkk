import { useLanguage } from "../contexts/LanguageContext";

export default function Terms() {
  const { language } = useLanguage();

  return (
    <div className={`container mx-auto px-4 py-16 max-w-4xl font-sans ${language === 'ar' ? 'dir-rtl text-right' : 'dir-ltr text-left'}`}>
      <h1 className="text-4xl font-bold mb-12 text-center">
        {language === 'ar' ? 'شروط الخدمة – Avbora' : 'Terms of Service – Avbora'}
      </h1>
      
      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            {language === 'ar' ? '1. القبول' : '1. Acceptance'}
          </h2>
          <p>
            {language === 'ar' 
              ? 'من خلال الوصول إلى Avbora أو استخدامها، فإنك توافق على هذه الشروط.'
              : 'By accessing or using Avbora, you agree to these Terms.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            {language === 'ar' ? '2. وصف الخدمة' : '2. Service Description'}
          </h2>
          <p>
            {language === 'ar'
              ? 'توفر Avbora تحليلات سلوكية، ومشاركة آلية، وأدوات تحسين الإيرادات لشركات التجارة الإلكترونية في جميع أنحاء العالم.'
              : 'Avbora provides behavioral analytics, automated engagement, and revenue optimization tools for eCommerce businesses worldwide.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            {language === 'ar' ? '3. التزامات المستخدم' : '3. User Obligations'}
          </h2>
          <p className="mb-2">{language === 'ar' ? 'أنت توافق على:' : 'You agree:'}</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{language === 'ar' ? 'تقديم معلومات دقيقة' : 'To provide accurate information'}</li>
            <li>{language === 'ar' ? 'عدم إساءة استخدام المنصة' : 'Not to misuse the platform'}</li>
            <li>{language === 'ar' ? 'الامتثال لقوانين حماية البيانات العالمية' : 'To comply with global data protection laws'}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            {language === 'ar' ? '4. مسؤولية البيانات' : '4. Data Responsibility'}
          </h2>
          <p>
            {language === 'ar'
              ? 'أنت وحدك المسؤول عن ضمان أن جمعك واستخدامك لبيانات العملاء يتوافق مع القوانين المعمول بها.'
              : 'You are solely responsible for ensuring that your collection and use of customer data complies with applicable laws.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            {language === 'ar' ? '5. المدفوعات' : '5. Payments'}
          </h2>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{language === 'ar' ? 'يتم تحصيل رسوم الاشتراك شهرياً' : 'Subscription fees are billed monthly'}</li>
            <li>{language === 'ar' ? 'قد تتكبد الميزات الإضافية رسوماً إضافية' : 'Additional features may incur extra charges'}</li>
            <li>{language === 'ar' ? 'قد يتم تطبيق عمولات بناءً على الإيرادات' : 'Revenue-based commissions may apply'}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            {language === 'ar' ? '6. الإنهاء' : '6. Termination'}
          </h2>
          <p>
            {language === 'ar'
              ? 'قد نقوم بتعليق أو إنهاء الحسابات بسبب الانتهاكات.'
              : 'We may suspend or terminate accounts for violations.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            {language === 'ar' ? '7. حدود المسؤولية' : '7. Limitation of Liability'}
          </h2>
          <p className="mb-2">{language === 'ar' ? 'Avbora ليست مسؤولة عن:' : 'Avbora is not liable for:'}</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{language === 'ar' ? 'الإيرادات المفقودة' : 'Lost revenue'}</li>
            <li>{language === 'ar' ? 'انقطاع الأعمال' : 'Business interruption'}</li>
            <li>{language === 'ar' ? 'الأضرار غير المباشرة' : 'Indirect damages'}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            {language === 'ar' ? '8. إخلاء المسؤولية' : '8. Disclaimer'}
          </h2>
          <p>
            {language === 'ar'
              ? 'يتم تقديم الخدمة "كما هي" دون ضمانات للنتائج.'
              : 'Service is provided “as is” without guarantees of results.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            {language === 'ar' ? '9. القانون الحاكم' : '9. Governing Law'}
          </h2>
          <p>
            {language === 'ar'
              ? 'تخضع هذه الشروط للمعايير التجارية الدولية المعمول بها ما لم يتطلب القانون المحلي خلاف ذلك.'
              : 'These Terms shall be governed by applicable international commercial standards unless otherwise required by local law.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            {language === 'ar' ? '10. اتصل بنا' : '10. Contact'}
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
