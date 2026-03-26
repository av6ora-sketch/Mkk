import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Download, FileText, Calendar, Loader2 } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { db } from "@/src/firebase";
import { collection, getDocs } from "firebase/firestore";

import { handleFirestoreError, OperationType } from "@/src/lib/firestore-error";

export default function AdminReports() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  const [downloadMsg, setDownloadMsg] = useState("");

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const storesSnap = await getDocs(collection(db, "stores"));
        const eventsSnap = await getDocs(collection(db, "events"));

        setReportData({
          users: usersSnap.size,
          stores: storesSnap.size,
          events: eventsSnap.size,
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, "admin_reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const handleDownload = (type: string) => {
    // In a real app, this would generate and download a file
    setDownloadMsg(language === 'ar' ? `جاري تحميل التقرير: ${type}` : `Downloading report: ${type}`);
    setTimeout(() => setDownloadMsg(""), 3000);
  };

  const reports = [
    { 
      title: language === 'ar' ? "تقرير نمو المستخدمين" : "User Growth Report", 
      date: language === 'ar' ? "الشهر الحالي" : "Current Month", 
      type: "PDF", 
      size: "1.2 MB",
      action: () => handleDownload("User Growth")
    },
    { 
      title: language === 'ar' ? "إيرادات الاشتراكات" : "Subscription Revenue", 
      date: language === 'ar' ? "الشهر الحالي" : "Current Month", 
      type: "CSV", 
      size: "0.8 MB",
      action: () => handleDownload("Revenue")
    },
    { 
      title: language === 'ar' ? "أداء المتاجر المربوطة" : "Connected Stores Performance", 
      date: language === 'ar' ? "الشهر الحالي" : "Current Month", 
      type: "PDF", 
      size: "4.5 MB",
      action: () => handleDownload("Stores Performance")
    },
    { 
      title: language === 'ar' ? "تقرير الدعم الفني" : "Support Report", 
      date: language === 'ar' ? "الشهر الحالي" : "Current Month", 
      type: "Excel", 
      size: "1.5 MB",
      action: () => handleDownload("Support")
    },
  ];

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
          <h2 className="text-2xl font-bold tracking-tight">{language === 'ar' ? 'تقارير الإدارة' : 'Admin Reports'}</h2>
          <p className="text-muted-foreground">{language === 'ar' ? 'تصدير تقارير شاملة عن أداء المنصة والمستخدمين.' : 'Export comprehensive reports on platform and user performance.'}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {downloadMsg && (
            <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-md">
              {downloadMsg}
            </div>
          )}
          <Button onClick={() => handleDownload("Monthly Summary")}>
            <Download className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
            {language === 'ar' ? 'تصدير التقرير الشهري' : 'Export Monthly Report'}
          </Button>
        </div>
      </div>

      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === 'ar' ? 'إجمالي المستخدمين' : 'Total Users'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.users}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === 'ar' ? 'إجمالي المتاجر' : 'Total Stores'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.stores}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === 'ar' ? 'إجمالي الأحداث' : 'Total Events'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.events}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reports.map((report, i) => (
          <Card key={i} className="hover:border-primary transition-colors cursor-pointer" onClick={report.action}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
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
                <Button variant="ghost" size="sm" className="h-8 text-primary">
                  {language === 'ar' ? 'تحميل' : 'Download'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
