import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { auth, db, storage } from "../../firebase";
import { doc as firestoreDoc, getDoc as firestoreGetDoc, setDoc as firestoreSetDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Loader2, User, Upload, Camera } from "lucide-react";

export default function MyAccount() {
  const { t, language, setLanguage } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    phone: "",
    country: "",
    accountType: "individual",
    avatarUrl: ""
  });
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;
      
      try {
        const userDocRef = firestoreDoc(db, "users", auth.currentUser.uid);
        const userDoc = await firestoreGetDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFormData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            age: data.age || "",
            phone: data.phone || "",
            country: data.country || "",
            accountType: data.accountType || "individual",
            avatarUrl: data.avatarUrl || auth.currentUser?.photoURL || ""
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    setIsUploadingAvatar(true);
    setMessage(null);

    try {
      const storageRef = ref(storage, `avatars/${auth.currentUser.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, { photoURL: downloadURL });

      // Update local state
      setFormData(prev => ({ ...prev, avatarUrl: downloadURL }));
      
      // Save to Firestore
      const userDocRef = firestoreDoc(db, "users", auth.currentUser.uid);
      await firestoreSetDoc(userDocRef, { avatarUrl: downloadURL }, { merge: true });

      setMessage({ type: 'success', text: t('profile.avatarSuccess') });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setMessage({ type: 'error', text: t('profile.avatarError') });
    } finally {
      setIsUploadingAvatar(false);
    }
  };
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setIsSaving(true);
    setMessage(null);
    try {
      const userDocRef = firestoreDoc(db, "users", auth.currentUser.uid);
      await firestoreSetDoc(userDocRef, {
        ...formData,
        email: auth.currentUser.email,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setMessage({ type: 'success', text: t('profile.saveChanges') + " - Success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error saving user data:", error);
      setMessage({ type: 'error', text: "Failed to save changes" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('profile.title')}</h2>
        <p className="text-muted-foreground">{t('profile.description')}</p>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">{t('profile.personalInfo')}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('profile.firstName')}</label>
                  <Input 
                    id="firstName" 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('profile.lastName')}</label>
                  <Input 
                    id="lastName" 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleChange} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="age" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('profile.age')}</label>
                  <Input 
                    id="age" 
                    name="age" 
                    type="number"
                    value={formData.age} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('profile.phone')}</label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="country" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('profile.country')}</label>
                  <Input 
                    id="country" 
                    name="country" 
                    value={formData.country} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="accountType" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('profile.accountType')}</label>
                  <select 
                    id="accountType"
                    name="accountType"
                    value={formData.accountType} 
                    onChange={handleChange}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="individual">{t('profile.individual')}</option>
                    <option value="business">{t('profile.business')}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('profile.email')}</label>
                <Input 
                  id="email" 
                  value={auth.currentUser?.email || ''} 
                  disabled 
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">{t('profile.emailDesc')}</p>
              </div>

              <Button type="submit" disabled={isSaving} className="w-full md:w-auto mt-4">
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? t('profile.saving') : t('profile.saveChanges')}
              </Button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">{t('profile.avatar')}</h3>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-4 border-background shadow-sm">
                  {isUploadingAvatar ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  ) : formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Avatar" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="h-12 w-12 text-primary/50" />
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="h-6 w-6 text-white" />
                </button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
              >
                {isUploadingAvatar ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t('profile.uploading')}</>
                ) : (
                  <><Upload className="h-4 w-4 mr-2" /> {t('profile.uploadAvatar')}</>
                )}
              </Button>
            </div>
          </div>

          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">{t('profile.language')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t('profile.languageDesc')}</p>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value as any)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>

          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">{t('profile.subscriptionDetails')}</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t('profile.currentPlan')}</span>
                <span className="font-medium">{t('profile.freePlan')}</span>
              </div>
              <Button variant="outline" className="w-full mt-2">{t('profile.upgradePlan')}</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
