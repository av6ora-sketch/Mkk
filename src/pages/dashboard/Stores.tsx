import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Store, Plus, Code, CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import { db, auth } from "@/src/firebase";
import firebaseConfig from "@/firebase-applet-config.json";
import { collection, addDoc, query, where, onSnapshot, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";

interface StoreData {
  id: string;
  name: string;
  domain: string;
  status: string;
  visitors?: string;
  conversion?: string;
}

import { handleFirestoreError, OperationType } from "@/src/lib/firestore-error";

export default function Stores() {
  const { t, language } = useLanguage();
  const [showAddStore, setShowAddStore] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [showSnippet, setShowSnippet] = useState(false);
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStoreId, setNewStoreId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribeStores: (() => void) | undefined;
    let unsubscribeEvents: (() => void) | undefined;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (unsubscribeStores) unsubscribeStores();
      if (unsubscribeEvents) unsubscribeEvents();

      if (user) {
        const qStores = query(collection(db, "stores"), where("uid", "==", user.uid));
        const qEvents = query(collection(db, "events"), where("ownerId", "==", user.uid));
        
        let currentStores: any[] = [];
        let currentEvents: any[] = [];
        
        const updateStoresData = () => {
          const storeStats: Record<string, { views: number, carts: number }> = {};
          currentEvents.forEach(data => {
            if (!storeStats[data.storeId]) {
              storeStats[data.storeId] = { views: 0, carts: 0 };
            }
            if (data.eventType === "page_view") storeStats[data.storeId].views++;
            if (data.eventType === "add_to_cart") storeStats[data.storeId].carts++;
          });

          const storesData = currentStores.map((store) => {
            const stats = storeStats[store.id] || { views: 0, carts: 0 };
            const conversionRate = stats.views > 0 ? Math.round((stats.carts / stats.views) * 100) : 0;
            
            return { 
              ...store,
              visitors: stats.views.toString(),
              conversion: `${conversionRate}%`
            } as StoreData;
          });
          
          setStores(storesData);
          setLoading(false);
        };

        unsubscribeStores = onSnapshot(qStores, (snapshot) => {
          currentStores = [];
          snapshot.forEach((doc) => {
            currentStores.push({ id: doc.id, ...doc.data() });
          });
          updateStoresData();
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, "stores");
        });

        unsubscribeEvents = onSnapshot(qEvents, (snapshot) => {
          currentEvents = [];
          snapshot.forEach((doc) => {
            currentEvents.push(doc.data());
          });
          updateStoresData();
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, "events");
        });

      } else {
        setStores([]);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeStores) unsubscribeStores();
      if (unsubscribeEvents) unsubscribeEvents();
    };
  }, []);

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeUrl || !storeName || !auth.currentUser) return;
    
    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, "stores"), {
        uid: auth.currentUser.uid,
        name: storeName,
        domain: storeUrl,
        status: "pending",
        createdAt: new Date().toISOString()
      });
      setNewStoreId(docRef.id);
      setShowSnippet(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "stores");
    } finally {
      setIsSubmitting(false);
    }
  };

  const snippetCode = `<script>
  (function() {
    var projectId = "${firebaseConfig.projectId}";
    var databaseId = "${firebaseConfig.firestoreDatabaseId}";
    var storeId = "${newStoreId}";
    var ownerId = "${auth.currentUser?.uid || ''}";
    var endpoint = "https://firestore.googleapis.com/v1/projects/" + projectId + "/databases/" + databaseId + "/documents/events";

    function track(eventType, metadata) {
      var payload = {
        fields: {
          storeId: { stringValue: storeId },
          ownerId: { stringValue: ownerId },
          eventType: { stringValue: eventType },
          url: { stringValue: window.location.href },
          timestamp: { timestampValue: new Date().toISOString() }
        }
      };
      if (metadata) {
        payload.fields.metadata = { stringValue: JSON.stringify(metadata) };
      }
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(function(e){console.error('Tracking error', e)});
    }

    window.AvboraTrack = track;
    track('page_view');
  })();
</script>`;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('sidebar.stores')}</h2>
          <p className="text-muted-foreground">{language === 'ar' ? 'إدارة المتاجر الخاصة بك وربط متاجر جديدة.' : 'Manage your stores and connect new ones.'}</p>
        </div>
        <Button onClick={() => { setShowAddStore(true); setShowSnippet(false); setStoreUrl(""); setStoreName(""); }}>
          <Plus className="mr-2 h-4 w-4" />
          {language === 'ar' ? 'ربط متجر جديد' : 'Connect New Store'}
        </Button>
      </div>

      {showAddStore && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="overflow-hidden"
        >
          <Card className="border-primary/20 shadow-md">
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'إضافة متجر جديد' : 'Add New Store'}</CardTitle>
              <CardDescription>{language === 'ar' ? 'أدخل بيانات المتجر للحصول على كود التتبع الخاص بك.' : 'Enter store details to get your tracking code.'}</CardDescription>
            </CardHeader>
            <CardContent>
              {!showSnippet ? (
                <form onSubmit={handleAddStore} className="flex flex-col md:flex-row gap-4">
                  <Input 
                    placeholder={language === 'ar' ? "اسم المتجر (مثال: متجر الأناقة)" : "Store Name (e.g., Elegance Store)"} 
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="flex-1"
                    required
                  />
                  <Input 
                    placeholder="https://your-store.com" 
                    value={storeUrl}
                    onChange={(e) => setStoreUrl(e.target.value)}
                    dir="ltr"
                    className={`flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}
                    required
                  />
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (language === 'ar' ? "إنشاء كود التتبع" : "Generate Tracking Code")}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3 text-green-800">
                    <CheckCircle2 className="h-5 w-5 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">{language === 'ar' ? 'تم إنشاء الكود بنجاح' : 'Code Generated Successfully'}</h4>
                      <p className="text-sm mt-1">{language === 'ar' ? 'قم بنسخ الكود التالي ولصقه في وسم <code>&lt;head&gt;</code> في جميع صفحات متجرك.' : 'Copy the following code and paste it inside the <code>&lt;head&gt;</code> tag on all pages of your store.'}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <pre className="p-4 bg-slate-950 text-slate-50 rounded-lg overflow-x-auto text-sm dir-ltr text-left">
                      <code>{snippetCode}</code>
                    </pre>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className={`absolute top-2 ${language === 'ar' ? 'right-2' : 'left-2'}`}
                      onClick={() => navigator.clipboard.writeText(snippetCode)}
                    >
                      {language === 'ar' ? 'نسخ الكود' : 'Copy Code'}
                    </Button>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddStore(false)}>{language === 'ar' ? 'إغلاق' : 'Close'}</Button>
                    <Button onClick={() => navigate(`/dashboard/stores/${newStoreId}`)}>{language === 'ar' ? 'عرض تفاصيل المتجر' : 'View Store Details'}</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : stores.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg bg-muted/10">
          <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-medium mb-1">{language === 'ar' ? 'لا توجد متاجر مربوطة' : 'No Stores Connected'}</h3>
          <p className="text-muted-foreground text-sm">{language === 'ar' ? 'قم بربط متجرك الأول للبدء في تتبع البيانات.' : 'Connect your first store to start tracking data.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stores.map((store) => (
            <motion.div key={store.id} whileHover={{ y: -5 }}>
              <Card 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => navigate(`/dashboard/stores/${store.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Store className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{store.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          {store.domain}
                          <ExternalLink className="h-3 w-3" />
                        </CardDescription>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${store.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {store.status === 'active' ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'في انتظار الربط' : 'Pending Connection')}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{language === 'ar' ? 'الزوار هذا الشهر' : 'Visitors This Month'}</p>
                      <p className="font-semibold">{store.visitors || "0"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{language === 'ar' ? 'معدل التحويل' : 'Conversion Rate'}</p>
                      <p className="font-semibold">{store.conversion || "0%"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
