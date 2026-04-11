import { useLanguage } from "../contexts/LanguageContext";
import { BrainCircuit, Target, Users, Zap } from "lucide-react";

export default function About() {
  const { language } = useLanguage();
  const isRtl = language === 'ar';

  return (
    <div className={`min-h-screen py-24 ${isRtl ? 'dir-rtl' : 'dir-ltr'}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {language === 'ar' ? 'عن AI Vision Beyond' : 'About AI Vision Beyond'}
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            {language === 'ar' 
              ? 'نحن نؤمن بأن التكنولوجيا يجب أن تعمل من أجلك، وليس العكس. مهمتنا هي تبسيط عملية إنشاء المحتوى وإدارته للمدونين والشركات.'
              : 'We believe technology should work for you, not the other way around. Our mission is to simplify content creation and management for bloggers and businesses.'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto mb-24">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">
              {language === 'ar' ? 'رؤيتنا' : 'Our Vision'}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {language === 'ar'
                ? 'بناء منصة ذكية تدير المحتوى بالكامل من الفكرة حتى النشر والتحليل، بدون تدخل يدوي، مع الحفاظ على جودة عالية وتجربة احترافية. نسعى لتمكين المبدعين من التركيز على الاستراتيجية بينما يتولى الذكاء الاصطناعي التنفيذ.'
                : 'To build an intelligent platform that manages content entirely from ideation to publishing and analysis, without manual intervention, while maintaining high quality and a professional experience. We aim to empower creators to focus on strategy while AI handles execution.'}
            </p>
          </div>
          <div className="bg-primary/5 rounded-3xl p-8 flex items-center justify-center">
            <BrainCircuit className="h-32 w-32 text-primary/40" />
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            {language === 'ar' ? 'قيمنا الأساسية' : 'Our Core Values'}
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: language === 'ar' ? 'الابتكار' : 'Innovation',
                desc: language === 'ar' ? 'نسعى دائماً لتقديم أحدث تقنيات الذكاء الاصطناعي.' : 'We constantly strive to provide the latest AI technologies.'
              },
              {
                icon: Target,
                title: language === 'ar' ? 'الجودة' : 'Quality',
                desc: language === 'ar' ? 'لا نساوم على جودة المحتوى الذي يتم إنشاؤه.' : 'We do not compromise on the quality of generated content.'
              },
              {
                icon: Users,
                title: language === 'ar' ? 'المستخدم أولاً' : 'User First',
                desc: language === 'ar' ? 'تصميم تجربة مستخدم بسيطة وفعالة هي أولويتنا.' : 'Designing a simple and effective user experience is our priority.'
              }
            ].map((value, i) => (
              <div key={i} className="text-center p-6 border rounded-2xl bg-card">
                <div className="h-16 w-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <value.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
