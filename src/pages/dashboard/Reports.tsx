import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Download, FileText, Calendar, Loader2 } from "lucide-react";
import { auth, db } from "../../firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useLanguage } from "../../contexts/LanguageContext";

interface Store {
  id: string;
  name: string;
}

interface ReportData {
  title: string;
  date: string;
  type: string;
  size: string;
  storeName: string;
}

import { handleFirestoreError, OperationType } from "../../lib/firestore-error";

export default function Reports() {
  const { t, language } = useLanguage();
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchReports = async () => {
      if (!auth.currentUser) return;
      try {
        // Fetch user's stores
        const storesQuery = query(collection(db, "stores"), where("uid", "==", auth.currentUser.uid));
        const storesSnapshot = await getDocs(storesQuery);
        
        const userStores: Store[] = [];
        storesSnapshot.forEach((doc) => {
          userStores.push({ id: doc.id, name: doc.data().name });
        });

        const generatedReports: ReportData[] = [];
        const currentDate = new Date();
        const currentMonth = currentDate.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' });

        for (const store of userStores) {
          // Fetch events for the store to see if there's data
          const eventsQuery = query(collection(db, "events"), where("storeId", "==", store.id));
          const eventsSnapshot = await getDocs(eventsQuery);
          
          if (!eventsSnapshot.empty) {
            generatedReports.push({
              title: language === 'ar' ? `تقرير أداء متجر ${store.name}` : `${store.name} Performance Report`,
              date: currentMonth,
              type: "PDF",
              size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
              storeName: store.name
            });
            generatedReports.push({
              title: language === 'ar' ? `تحليل الزوار لمتجر ${store.name}` : `${store.name} Visitor Analysis`,
              date: currentMonth,
              type: "CSV",
              size: `${(Math.random() * 1 + 0.1).toFixed(1)} MB`,
              storeName: store.name
            });
          }
        }

        setReports(generatedReports);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, "stores/events");
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchReports();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [language]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('sidebar.reports')}</h2>
          <p className="text-muted-foreground">{language === 'ar' ? 'تصدير تقارير مفصلة عن أداء متجرك وسلوك عملائك.' : 'Export detailed reports on your store\'s performance and customer behavior.'}</p>
        </div>
        <Button disabled={reports.length === 0}>
          <Download className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
          {language === 'ar' ? 'تصدير التقرير الشهري' : 'Export Monthly Report'}
        </Button>
      </div>

      {reports.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">{language === 'ar' ? 'لا توجد تقارير متاحة' : 'No Reports Available'}</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {language === 'ar' ? 'قم بإضافة متجرك وتثبيت كود التتبع لتوليد تقارير الأداء والتحليلات.' : 'Add your store and install the tracking code to generate performance reports and analytics.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report, i) => (
            <Card key={i} className="hover:border-primary transition-colors cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <span className="px-2 py-1 bg-muted text-xs font-medium rounded-md">{report.type}</span>
                </div>
                <CardTitle className="text-lg mt-4">{report.title}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Calendar className="h-3 w-3" />
                  {report.date}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mt-2 pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground">{report.size}</span>
                  <Button variant="ghost" size="sm" className="h-8 text-primary">{language === 'ar' ? 'تحميل' : 'Download'}</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
