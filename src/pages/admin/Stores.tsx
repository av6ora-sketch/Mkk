import { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { auth, db } from "../../firebase";
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Loader2, Store, Trash2, ExternalLink, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { handleFirestoreError, OperationType } from "../../lib/firestore-error";

interface Blog {
  id: string;
  title: string;
  url: string;
  ownerUid: string;
  createdAt: string;
}

export default function AdminStores() {
  const { language, t } = useLanguage();
  const [stores, setStores] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStores = async () => {
    setIsLoading(true);
    try {
      const path = "blogs";
      const q = query(collection(db, path), orderBy("createdAt", "desc"));
      let querySnapshot;
      try {
        querySnapshot = await getDocs(q);
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, path);
        return;
      }
      const storesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Blog));
      setStores(storesData);
    } catch (error) {
      console.error("Error fetching stores:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchStores();
      } else {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const path = "blogs";
      try {
        await deleteDoc(doc(db, path, deleteId));
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `${path}/${deleteId}`);
        return;
      }
      setDeleteId(null);
      await fetchStores();
    } catch (error) {
      console.error("Error deleting store:", error);
    } finally {
      setIsDeleting(false);
    }
  };

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
          {language === 'ar' ? 'المتاجر المربوطة' : 'Connected Stores'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'ar' ? 'إدارة متاجر Blogger المربوطة' : 'Manage connected Blogger stores'}
        </p>
      </div>

      {stores.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground border rounded-xl bg-card">
          {language === 'ar' ? 'لا توجد متاجر مربوطة حالياً.' : 'No connected stores at the moment.'}
        </div>
      ) : (
        <div className="grid gap-4">
          {stores.map((store) => (
            <Card key={store.id}>
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <Store className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {store.title}
                      <a href={store.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </CardTitle>
                    <div className="text-sm text-muted-foreground mt-1">
                      {language === 'ar' ? 'المالك: ' : 'Owner: '} {store.ownerUid}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {language === 'ar' ? 'تاريخ الربط: ' : 'Connected: '}
                      {store.createdAt ? format(new Date(store.createdAt), "PPP") : 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(store.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-lg animate-in fade-in zoom-in duration-200">
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl">
                {language === 'ar' ? 'تأكيد الحذف' : 'Confirm Deletion'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-center text-muted-foreground">
                {language === 'ar' 
                  ? 'هل أنت متأكد أنك تريد حذف هذا المتجر؟ لا يمكن التراجع عن هذا الإجراء.' 
                  : 'Are you sure you want to delete this store? This action cannot be undone.'}
              </p>
              <div className="flex gap-3 mt-2">
                <Button variant="outline" className="flex-1 rounded-full" onClick={() => setDeleteId(null)} disabled={isDeleting}>
                  {t('common.cancel')}
                </Button>
                <Button variant="destructive" className="flex-1 rounded-full" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                  {t('common.delete')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
