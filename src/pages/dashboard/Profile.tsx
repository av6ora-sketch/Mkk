import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { User, Mail, Phone, MapPin, Shield, CreditCard, Loader2, RefreshCw, Globe } from "lucide-react";
import { auth, db } from "@/src/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useLanguage } from "../../contexts/LanguageContext";

interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  plan: string;
  avatar?: string;
  phone?: string;
  country?: string;
}

import { handleFirestoreError, OperationType } from "@/src/lib/firestore-error";

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("Egypt");
  const [avatar, setAvatar] = useState("");
  
  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      try {
        const docRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setProfile(data);
          setFirstName(data.firstName || "");
          setLastName(data.lastName || "");
          setPhone(data.phone || "");
          setCountry(data.country || "Egypt");
          setAvatar(data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.firstName || 'User'}&backgroundColor=f3f4f6`);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, "users");
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchProfile();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        firstName,
        lastName,
        phone,
        country,
        avatar
      });
      setProfile(prev => prev ? { ...prev, firstName, lastName, phone, country, avatar } : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "users");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = () => {
    const newSeed = Math.random().toString(36).substring(7);
    setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${newSeed}&backgroundColor=f3f4f6`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('profile.title')}</h2>
        <p className="text-muted-foreground">{t('profile.description')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <img 
                  src={avatar} 
                  alt="Avatar" 
                  className="w-24 h-24 rounded-full border-4 border-background shadow-sm"
                />
                <button 
                  onClick={handleAvatarChange}
                  type="button"
                  className={`absolute bottom-0 ${language === 'ar' ? 'right-0' : 'left-0'} bg-primary text-primary-foreground p-1.5 rounded-full shadow-sm hover:bg-primary/90 transition-colors`}
                  title="Change Avatar"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              <h3 className="font-bold text-lg">{profile.firstName} {profile.lastName}</h3>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                <Shield className="h-3.5 w-3.5" />
                {t('profile.currentPlan')}: {profile.plan}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('profile.subscriptionDetails')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-2"><CreditCard className="h-4 w-4"/> {t('profile.currentPlan')}</span>
                <span className="font-medium">{profile.plan}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('profile.language')}</CardTitle>
              <CardDescription>{t('profile.languageDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Globe className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-2.5 h-4 w-4 text-muted-foreground`} />
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'en' | 'ar')}
                  className={`flex h-9 w-full rounded-md border border-border bg-transparent ${language === 'ar' ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary appearance-none`}
                >
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.personalInfo')}</CardTitle>
              <CardDescription>{t('profile.updateContact')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSave}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('profile.firstName')}</label>
                    <div className="relative">
                      <User className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-2.5 h-4 w-4 text-muted-foreground`} />
                      <Input 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        className={language === 'ar' ? 'pr-10' : 'pl-10'} 
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('profile.lastName')}</label>
                    <div className="relative">
                      <User className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-2.5 h-4 w-4 text-muted-foreground`} />
                      <Input 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        className={language === 'ar' ? 'pr-10' : 'pl-10'} 
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('profile.email')}</label>
                  <div className="relative">
                    <Mail className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-2.5 h-4 w-4 text-muted-foreground`} />
                    <Input value={profile.email} disabled dir="ltr" className={`${language === 'ar' ? 'pr-10 text-right' : 'pl-10 text-left'} bg-muted/50`} />
                  </div>
                  <p className="text-xs text-muted-foreground">{t('profile.emailDesc')}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('profile.phone')}</label>
                  <div className="relative">
                    <Phone className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-2.5 h-4 w-4 text-muted-foreground`} />
                    <Input 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      dir="ltr" 
                      className={language === 'ar' ? 'pr-10 text-right' : 'pl-10 text-left'} 
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('profile.country')}</label>
                  <div className="relative">
                    <MapPin className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-2.5 h-4 w-4 text-muted-foreground`} />
                    <select 
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className={`flex h-9 w-full rounded-md border border-border bg-transparent ${language === 'ar' ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary appearance-none`}
                    >
                      <option value="Egypt">Egypt</option>
                      <option value="Saudi Arabia">Saudi Arabia</option>
                      <option value="UAE">UAE</option>
                      <option value="Kuwait">Kuwait</option>
                      <option value="Qatar">Qatar</option>
                      <option value="Oman">Oman</option>
                      <option value="Bahrain">Bahrain</option>
                      <option value="Jordan">Jordan</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {saving ? t('profile.saving') : t('profile.saveChanges')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
