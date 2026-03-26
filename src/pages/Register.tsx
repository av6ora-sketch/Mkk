import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Activity, Eye, EyeOff, Loader2, X } from "lucide-react";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "@/src/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useLanguage } from "../contexts/LanguageContext";
import { handleFirestoreError, OperationType } from "@/src/lib/firestore-error";

export default function Register() {
  const { language } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      const provider = new GoogleAuthProvider();
      auth.languageCode = language === 'ar' ? 'ar' : 'en';
      const result = await signInWithPopup(auth, provider);
      
      const userRef = doc(db, "users", result.user.uid);
      const userSnap = await getDoc(userRef);
      
      const isAdminEmail = result.user.email === 'contact@avbora.online' || result.user.email === 'av6ora@gmail.com';

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: result.user.uid,
          email: result.user.email,
          firstName: result.user.displayName?.split(" ")[0] || "",
          lastName: result.user.displayName?.split(" ").slice(1).join(" ") || "",
          role: isAdminEmail ? 'admin' : 'user',
          plan: "الأساسية",
          createdAt: new Date().toISOString()
        });
      }
      
      if (isAdminEmail) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      if (err.code?.includes('permission-denied') || err.message?.includes('permission-denied')) {
        handleFirestoreError(err, OperationType.WRITE, "users");
      }
      console.error(err);
      if (err.code === 'auth/network-request-failed') {
        setError(language === 'ar' ? "فشل الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت أو تعطيل مانع الإعلانات." : "Network request failed. Please check your internet connection or disable ad-blockers.");
      } else if (err.code === 'auth/popup-blocked') {
        setError(language === 'ar' ? "تم حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة لهذا الموقع." : "Popup blocked. Please allow popups for this site.");
      } else if (err.code === 'auth/cancelled-popup-request') {
        // User closed the popup, don't show error
      } else {
        setError(language === 'ar' ? "حدث خطأ أثناء التسجيل بواسطة جوجل." : "An error occurred during Google registration.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(language === 'ar' ? "كلمات المرور غير متطابقة." : "Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      const isAdminEmail = userCredential.user.email === 'contact@avbora.online' || userCredential.user.email === 'av6ora@gmail.com';

      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        firstName,
        lastName,
        role: isAdminEmail ? 'admin' : 'user',
        plan: "الأساسية",
        createdAt: new Date().toISOString()
      });

      if (isAdminEmail) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      if (err.code?.includes('permission-denied') || err.message?.includes('permission-denied')) {
        handleFirestoreError(err, OperationType.WRITE, "users");
      }
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError(language === 'ar' ? "البريد الإلكتروني مستخدم بالفعل." : "Email is already in use.");
      } else if (err.code === 'auth/weak-password') {
        setError(language === 'ar' ? "كلمة المرور ضعيفة جداً. يجب أن تكون 6 أحرف على الأقل." : "Password is too weak. It must be at least 6 characters.");
      } else if (err.code === 'auth/network-request-failed') {
        setError(language === 'ar' ? "فشل الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت أو تعطيل مانع الإعلانات." : "Network request failed. Please check your internet connection or disable ad-blockers.");
      } else {
        setError(language === 'ar' ? "حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى." : "An error occurred while creating the account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex font-sans bg-background ${language === 'ar' ? 'dir-rtl' : 'dir-ltr'}`}>
      {/* Left Side - Image/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 opacity-90 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop" 
          alt="Analytics" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
          referrerPolicy="no-referrer"
        />
        <div className="relative z-20 flex flex-col justify-between p-12 h-full text-white">
          <Link to="/" className="inline-flex items-center gap-2 w-fit">
            <Activity className="h-8 w-8 text-white" />
            <span className="font-bold text-2xl tracking-tight">Avbora</span>
          </Link>
          
          <div className="space-y-6 max-w-lg">
            <h1 className="text-4xl font-bold leading-tight">
              {language === 'ar' ? 'ابدأ رحلتك في تحويل الزوار إلى عملاء' : 'Start your journey in converting visitors to customers'}
            </h1>
            <p className="text-zinc-400 text-lg">
              {language === 'ar' ? 'انضم إلى آلاف المتاجر التي تعتمد على Avbora لتحليل سلوك المستخدمين وزيادة المبيعات بخطوات بسيطة.' : 'Join thousands of stores that rely on Avbora to analyze user behavior and increase sales with simple steps.'}
            </p>
          </div>
          
          <div className="text-sm text-zinc-500">
            © {new Date().getFullYear()} Avbora. {language === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-16 overflow-y-auto relative">
        <Link to="/" className={`absolute top-8 ${language === 'ar' ? 'left-8' : 'right-8'} text-muted-foreground hover:text-foreground transition-colors`}>
          <X className="h-6 w-6" />
        </Link>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8 my-auto"
        >
          <div className={`text-center ${language === 'ar' ? 'lg:text-right' : 'lg:text-left'}`}>
            <Link to="/" className="inline-flex items-center gap-2 lg:hidden mb-8">
              <Activity className="h-8 w-8 text-primary" />
              <span className="font-bold text-2xl tracking-tight">Avbora</span>
            </Link>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">{language === 'ar' ? 'إنشاء حساب جديد' : 'Create a new account'}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {language === 'ar' ? 'أدخل بياناتك للبدء في استخدام المنصة' : 'Enter your details to start using the platform'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{language === 'ar' ? 'الاسم الأول' : 'First Name'}</label>
                  <Input 
                    required 
                    placeholder={language === 'ar' ? "أحمد" : "Ahmed"} 
                    className={`h-11 ${language === 'ar' ? 'text-right' : 'text-left'}`}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{language === 'ar' ? 'الاسم الثاني' : 'Last Name'}</label>
                  <Input 
                    required 
                    placeholder={language === 'ar' ? "محمد" : "Mohamed"} 
                    className={`h-11 ${language === 'ar' ? 'text-right' : 'text-left'}`}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
                <Input 
                  type="email" 
                  required 
                  placeholder="name@example.com" 
                  dir="ltr" 
                  className={`h-11 ${language === 'ar' ? 'text-right' : 'text-left'}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-foreground mb-1.5">{language === 'ar' ? 'كلمة المرور' : 'Password'}</label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    placeholder="••••••••" 
                    dir="ltr"
                    className={`h-11 ${language === 'ar' ? 'text-right pr-10' : 'text-left pl-10'}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute inset-y-0 ${language === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center text-muted-foreground hover:text-foreground`}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
                <Input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  placeholder="••••••••" 
                  dir="ltr" 
                  className={`h-11 ${language === 'ar' ? 'text-right' : 'text-left'}`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className="flex items-center pt-2">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className={`h-4 w-4 rounded border-border text-primary focus:ring-primary ${language === 'ar' ? 'ml-2' : 'mr-2'}`}
                />
                <label htmlFor="terms" className="block text-sm text-foreground">
                  {language === 'ar' ? 'أوافق على ' : 'I agree to '}
                  <Link to="/terms" className="text-primary hover:underline">{language === 'ar' ? 'الشروط والأحكام' : 'Terms and Conditions'}</Link> 
                  {language === 'ar' ? ' و ' : ' and '}
                  <Link to="/privacy" className="text-primary hover:underline">{language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</Link>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <Button type="submit" className="w-full h-11 text-base font-medium" disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (language === 'ar' ? "إنشاء الحساب" : "Create Account")}
              </Button>
              
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-background px-4 text-muted-foreground">{language === 'ar' ? 'أو المتابعة بواسطة' : 'Or continue with'}</span>
                </div>
              </div>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full h-11 bg-white hover:bg-gray-50 text-gray-900 border-gray-200 flex items-center justify-center gap-3"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>{language === 'ar' ? 'التسجيل بواسطة Google' : 'Continue with Google'}</span>
              </Button>
            </div>
          </form>
          
          <div className="text-center text-sm mt-8">
            <span className="text-muted-foreground">{language === 'ar' ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}</span>
            <Link to="/login" className="font-semibold text-primary hover:underline">
              {language === 'ar' ? 'تسجيل الدخول' : 'Log in'}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
