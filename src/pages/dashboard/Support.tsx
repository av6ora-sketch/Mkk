import { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { auth, db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { LifeBuoy, Send, Loader2 } from "lucide-react";

export default function Support() {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  
  const [formData, setFormData] = useState({
    subject: "",
    message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setIsSubmitting(true);
    setMessage(null);
    try {
      await addDoc(collection(db, "support_tickets"), {
        userId: auth.currentUser.uid,
        email: auth.currentUser.email,
        subject: formData.subject,
        message: formData.message,
        status: "open",
        createdAt: new Date().toISOString()
      });
      
      setMessage({ type: 'success', text: t('support.success') });
      setFormData({ subject: "", message: "" });
    } catch (error) {
      console.error("Error submitting support ticket:", error);
      setMessage({ type: 'error', text: t('support.error') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('support.title')}</h2>
        <p className="text-muted-foreground">{t('support.description')}</p>
      </div>
      
      <div className="grid gap-8 md:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">{t('support.contactUs')}</h3>
            
            {message && (
              <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('support.subject')}</label>
                <Input 
                  id="subject" 
                  name="subject" 
                  required
                  value={formData.subject} 
                  onChange={handleChange} 
                  placeholder={t('support.subjectPlaceholder')}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('support.message')}</label>
                <textarea 
                  id="message" 
                  name="message" 
                  required
                  rows={5}
                  value={formData.message} 
                  onChange={handleChange} 
                  placeholder={t('support.messagePlaceholder')}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto mt-4">
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {isSubmitting ? t('support.sending') : t('support.send')}
              </Button>
            </form>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <LifeBuoy className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('support.immediateHelp')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('support.immediateDesc')}
            </p>
            <Button variant="outline" className="w-full">{t('support.viewDocs')}</Button>
          </div>
          
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">{t('support.contactInfo')}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('support.email')}</span>
                <span className="font-medium">support@avbora.online</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('support.hours')}</span>
                <span className="font-medium">{t('support.hoursValue')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
