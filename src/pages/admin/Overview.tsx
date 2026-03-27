import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Users, Store, BarChart3, TrendingUp, Loader2 } from "lucide-react";
import { db, auth } from "@/src/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { useLanguage } from "../../contexts/LanguageContext";

import { handleFirestoreError, OperationType } from "@/src/lib/firestore-error";

export default function AdminOverview() {
  const { language } = useLanguage();
  const { permissions } = useOutletContext<{ permissions: Record<string, boolean> }>();
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [storeCount, setStoreCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [recentStores, setRecentStores] = useState<any[]>([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!auth.currentUser) return;
      try {
        if (permissions.manage_users) {
          const usersSnap = await getDocs(collection(db, "users"));
          setUserCount(usersSnap.size);
        }

        if (permissions.manage_stores) {
          const storesSnap = await getDocs(collection(db, "stores"));
          setStoreCount(storesSnap.size);

          const qRecentStores = query(collection(db, "stores"), orderBy("createdAt", "desc"), limit(5));
          const recentStoresSnap = await getDocs(qRecentStores);
          const recentStoresData: any[] = [];
          recentStoresSnap.forEach(doc => {
            recentStoresData.push({ id: doc.id, ...doc.data() });
          });
          setRecentStores(recentStoresData);
        }

        if (permissions.view_reports) {
          const eventsSnap = await getDocs(collection(db, "events"));
          setEventCount(eventsSnap.size);
        }

      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, "admin_overview");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [permissions]);

  const stats = [
    ...(permissions.manage_users ? [{ title: language === 'ar' ? "إجمالي المستخدمين" : "Total Users", value: userCount.toLocaleString(), icon: Users, color: "text-blue-500" }] : []),
    ...(permissions.manage_stores ? [{ title: language === 'ar' ? "المتاجر المربوطة" : "Connected Stores", value: storeCount.toLocaleString(), icon: Store, color: "text-green-500" }] : []),
    ...(permissions.view_reports ? [{ title: language === 'ar' ? "التحليلات المسجلة" : "Recorded Analytics", value: eventCount.toLocaleString(), icon: BarChart3, color: "text-purple-500" }] : []),
    ...(permissions.view_reports ? [{ title: language === 'ar' ? "النمو الشهري" : "Monthly Growth", value: "+15%", icon: TrendingUp, color: "text-orange-500" }] : []),
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {permissions.view_reports && (
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? "نمو المستخدمين والمتاجر" : "Users and Stores Growth"}</CardTitle>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center bg-muted/20 rounded-md border border-dashed border-border m-6 mt-0">
              <span className="text-muted-foreground">{language === 'ar' ? "رسم بياني يوضح النمو" : "Graph showing growth"}</span>
            </CardContent>
          </Card>
        )}
        {permissions.manage_stores && (
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? "أحدث المتاجر المضافة" : "Latest Added Stores"}</CardTitle>
            </CardHeader>
            <CardContent>
              {recentStores.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {language === 'ar' ? "لا توجد متاجر مضافة بعد." : "No stores added yet."}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentStores.map((store, i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Store className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{store.name}</p>
                          <p className="text-xs text-muted-foreground">{store.domain}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(store.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
