import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Store, ExternalLink, Loader2, Trash2, Ban, CheckCircle2 } from "lucide-react";
import { db, auth } from "../../firebase";
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { useLanguage } from "../../contexts/LanguageContext";

interface StoreData {
  id: string;
  name: string;
  domain: string;
  status: string;
  uid: string;
  createdAt: string;
  isBanned?: boolean;
}

import { handleFirestoreError, OperationType } from "../../lib/firestore-error";

export default function AdminStores() {
  const { language } = useLanguage();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStores = async () => {
    if (!auth.currentUser) return;
    try {
      const querySnapshot = await getDocs(collection(db, "stores"));
      const storesData: StoreData[] = [];
      querySnapshot.forEach((doc) => {
        storesData.push({ id: doc.id, ...doc.data() } as StoreData);
      });
      setStores(storesData);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "stores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleDeleteStore = async (storeId: string) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا المتجر نهائياً؟' : 'Are you sure you want to permanently delete this store?')) return;
    
    setActionLoading(storeId);
    try {
      await deleteDoc(doc(db, "stores", storeId));
      setStores(stores.filter(store => store.id !== storeId));
      alert(language === 'ar' ? 'تم حذف المتجر بنجاح.' : 'Store successfully deleted.');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `stores/${storeId}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBanStore = async (storeId: string, currentBanStatus: boolean | undefined) => {
    const isBanned = !currentBanStatus;
    if (!window.confirm(language === 'ar' ? `هل أنت متأكد من ${isBanned ? 'حظر' : 'إلغاء حظر'} هذا المتجر؟` : `Are you sure you want to ${isBanned ? 'ban' : 'unban'} this store?`)) return;
    
    setActionLoading(storeId);
    try {
      await updateDoc(doc(db, "stores", storeId), {
        isBanned: isBanned
      });
      setStores(stores.map(store => store.id === storeId ? { ...store, isBanned } : store));
      alert(language === 'ar' ? `تم ${isBanned ? 'حظر' : 'إلغاء حظر'} المتجر بنجاح.` : `Store successfully ${isBanned ? 'banned' : 'unbanned'}.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `stores/${storeId}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{language === 'ar' ? 'المتاجر المربوطة' : 'Connected Stores'}</h2>
        <p className="text-muted-foreground">{language === 'ar' ? 'عرض جميع المتاجر المربوطة بالمنصة.' : 'View all stores connected to the platform.'}</p>
      </div>

      {stores.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg bg-muted/10">
          <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-medium mb-1">{language === 'ar' ? 'لا توجد متاجر' : 'No Stores'}</h3>
          <p className="text-muted-foreground text-sm">{language === 'ar' ? 'لم يتم ربط أي متاجر حتى الآن.' : 'No stores have been connected yet.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <Card key={store.id} className="hover:border-primary transition-colors">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Store className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{store.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        {store.domain} <ExternalLink className="h-3 w-3" />
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${store.isBanned ? 'bg-red-100 text-red-800' : store.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {store.isBanned ? (language === 'ar' ? 'محظور' : 'Banned') : store.status === 'active' ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'في انتظار الربط' : 'Pending')}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">{language === 'ar' ? 'المالك (UID)' : 'Owner (UID)'}</p>
                    <p className="font-semibold text-xs truncate">{store.uid}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">{language === 'ar' ? 'تاريخ الإضافة' : 'Date Added'}</p>
                    <p className="font-semibold text-sm">{new Date(store.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</p>
                  </div>
                  <div className="col-span-2 flex gap-2 pt-2 mt-2 border-t border-border">
                    <Button 
                      variant={store.isBanned ? "outline" : "secondary"} 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleBanStore(store.id, store.isBanned)}
                      disabled={actionLoading === store.id}
                    >
                      {actionLoading === store.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (store.isBanned ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Ban className="h-4 w-4 mr-2" />)}
                      {store.isBanned ? (language === 'ar' ? 'إلغاء الحظر' : 'Unban') : (language === 'ar' ? 'حظر' : 'Ban')}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleDeleteStore(store.id)}
                      disabled={actionLoading === store.id}
                    >
                      {actionLoading === store.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                      {language === 'ar' ? 'حذف' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
