import { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { auth, db } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Users, FileText, Store, LifeBuoy, Loader2 } from "lucide-react";

export default function AdminOverview() {
  const { language } = useLanguage();
  const [stats, setStats] = useState({
    users: 0,
    articles: 0,
    stores: 0,
    tickets: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const articlesSnap = await getDocs(collection(db, "articles"));
        const storesSnap = await getDocs(collection(db, "blogs"));
        const ticketsSnap = await getDocs(query(collection(db, "support_tickets"), where("status", "==", "open")));

        setStats({
          users: usersSnap.size,
          articles: articlesSnap.size,
          stores: storesSnap.size,
          tickets: ticketsSnap.size
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {language === 'ar' ? 'نظرة عامة' : 'Overview'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'ar' ? 'إحصائيات النظام' : 'System statistics'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ar' ? 'إجمالي المستخدمين' : 'Total Users'}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ar' ? 'إجمالي المقالات' : 'Total Articles'}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.articles}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ar' ? 'المتاجر المربوطة' : 'Connected Stores'}
            </CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.stores}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ar' ? 'تذاكر الدعم المفتوحة' : 'Open Support Tickets'}
            </CardTitle>
            <LifeBuoy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tickets}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
