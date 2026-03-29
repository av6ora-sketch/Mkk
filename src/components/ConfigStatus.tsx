import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, ShieldAlert, Key, Globe, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useLanguage } from "../contexts/LanguageContext";

interface HealthStatus {
  env: {
    GOOGLE_CLIENT_ID: boolean;
    GOOGLE_CLIENT_SECRET: boolean;
    APP_URL: boolean;
    GEMINI_API_KEY: boolean;
  };
  firestoreAdmin: "connected" | "error" | "unknown";
  firestoreError?: string;
  firestoreErrorCode?: number;
  projectId: string;
  databaseId: string;
}

export default function ConfigStatus() {
  const { language } = useLanguage();
  const [status, setStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch("/api/health-check");
        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        }
      } catch (error) {
        console.error("Failed to fetch health check:", error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading || !status) return null;

  const hasEnvError = !status.env.GOOGLE_CLIENT_ID || !status.env.GOOGLE_CLIENT_SECRET || !status.env.APP_URL;
  const hasFirestoreError = status.firestoreAdmin === "error";

  if (!hasEnvError && !hasFirestoreError) return null;

  return (
    <Card className="border-destructive/50 bg-destructive/5 mb-8 overflow-hidden">
      <CardHeader className="bg-destructive/10 py-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-destructive">
          <ShieldAlert className="h-4 w-4" />
          {language === 'ar' ? 'تنبيه: مشاكل في التكوين' : 'Alert: Configuration Issues'}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {hasEnvError && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
              <Key className="h-4 w-4" />
              {language === 'ar' ? 'متغيرات البيئة المفقودة أو غير الصحيحة' : 'Missing or Invalid Environment Variables'}
            </div>
            <ul className="text-xs space-y-1 pl-6 list-disc text-muted-foreground">
              {!status.env.GOOGLE_CLIENT_ID && (
                <li>{language === 'ar' ? 'GOOGLE_CLIENT_ID مفقود' : 'GOOGLE_CLIENT_ID is missing'}</li>
              )}
              {!status.env.GOOGLE_CLIENT_SECRET && (
                <li className="font-bold text-destructive">
                  {language === 'ar' ? 'GOOGLE_CLIENT_SECRET مفقود أو غير صالح' : 'GOOGLE_CLIENT_SECRET is missing or invalid (invalid_client)'}
                </li>
              )}
              {!status.env.APP_URL && (
                <li>{language === 'ar' ? 'APP_URL مفقود' : 'APP_URL is missing'}</li>
              )}
            </ul>
            <p className="text-[10px] text-muted-foreground mt-1">
              {language === 'ar' 
                ? 'يرجى تحديث هذه القيم في إعدادات AI Studio.' 
                : 'Please update these values in AI Studio Settings.'}
            </p>
          </div>
        )}

        {hasFirestoreError && (
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
              <Database className="h-4 w-4" />
              {language === 'ar' ? 'خطأ في الاتصال بـ Firestore Admin' : 'Firestore Admin Connection Error'}
            </div>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' 
                ? `فشل الاتصال بـ Firestore (المشروع: ${status.projectId}).` 
                : `Failed to connect to Firestore (Project: ${status.projectId}).`}
            </p>
            {status.firestoreErrorCode === 7 && (
              <div className="bg-destructive/10 p-2 rounded text-[10px] text-destructive font-mono">
                {language === 'ar'
                  ? 'PERMISSION_DENIED: يرجى التأكد من أن حساب الخدمة لديه دور "Cloud Datastore User".'
                  : 'PERMISSION_DENIED: Ensure the service account has the "Cloud Datastore User" role.'}
              </div>
            )}
            <p className="text-[10px] text-muted-foreground">
              {status.firestoreError}
            </p>
          </div>
        )}

        <div className="bg-muted p-3 rounded-lg text-[10px] space-y-1">
          <div className="font-bold mb-1">{language === 'ar' ? 'خطوات الإصلاح:' : 'Steps to Fix:'}</div>
          <ol className="list-decimal pl-4 space-y-1">
            <li>{language === 'ar' ? 'تحقق من Client Secret في وحدة تحكم Firebase (Google Auth).' : 'Check Client Secret in Firebase Console (Google Auth).'}</li>
            <li>{language === 'ar' ? 'تأكد من صحة GOOGLE_CLIENT_SECRET في إعدادات AI Studio.' : 'Verify GOOGLE_CLIENT_SECRET in AI Studio Settings.'}</li>
            <li>{language === 'ar' ? 'تحقق من أذونات IAM في Google Cloud Console.' : 'Check IAM permissions in Google Cloud Console.'}</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
