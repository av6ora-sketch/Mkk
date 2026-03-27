import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { ArrowRight, Activity, Users, ShoppingCart, CheckCircle2, AlertCircle, Copy, Loader2, Mail } from "lucide-react";
import { db, auth } from "@/src/firebase";
import firebaseConfig from "../../../firebase-applet-config.json";
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc } from "firebase/firestore";
import { useLanguage } from "../../contexts/LanguageContext";

interface StoreData {
  id: string;
  name: string;
  domain: string;
  status: string;
  platform?: string;
  createdAt: string;
}

interface TrackingEvent {
  id: string;
  eventType: string;
  url: string;
  timestamp: any; // Can be string or Firestore Timestamp
  metadata?: string;
}

import { handleFirestoreError, OperationType } from "@/src/lib/firestore-error";

export default function StoreDetails() {
  const { t, language } = useLanguage();
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const [store, setStore] = useState<StoreData | null>(null);
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  useEffect(() => {
    if (!storeId) return;

    let unsubscribeEvents: (() => void) | undefined;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (unsubscribeEvents) unsubscribeEvents();

      if (user) {
        // Fetch store details
        const fetchStore = async () => {
          try {
            const docRef = doc(db, "stores", storeId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setStore({ id: docSnap.id, ...docSnap.data() } as StoreData);
            } else {
              navigate("/dashboard/stores");
            }
          } catch (error) {
            handleFirestoreError(error, OperationType.GET, "stores");
          }
        };

        fetchStore();

        // Listen for tracking events
        const q = query(
          collection(db, "events"), 
          where("storeId", "==", storeId),
          where("ownerId", "==", user.uid)
        );
        
        unsubscribeEvents = onSnapshot(q, async (snapshot) => {
          const eventsData: TrackingEvent[] = [];
          snapshot.forEach((doc) => {
            eventsData.push({ id: doc.id, ...doc.data() } as TrackingEvent);
          });
          
          const getTimestamp = (ts: any) => {
            if (!ts) return 0;
            if (typeof ts === 'string') return new Date(ts).getTime();
            if (ts.seconds) return ts.seconds * 1000;
            return new Date(ts).getTime();
          };

          // Sort by timestamp descending
          eventsData.sort((a, b) => getTimestamp(b.timestamp) - getTimestamp(a.timestamp));
          
          setEvents(eventsData);
          setLoading(false);

          // If we received events and status is pending, update to active
          if (eventsData.length > 0 && store?.status === "pending") {
            try {
              await updateDoc(doc(db, "stores", storeId), { status: "active" });
              setStore(prev => prev ? { ...prev, status: "active" } : null);
            } catch (error) {
              handleFirestoreError(error, OperationType.UPDATE, "stores");
            }
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, "events");
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeEvents) unsubscribeEvents();
    };
  }, [storeId, store?.status, navigate]);

  const handleVerify = () => {
    setVerifying(true);
    setVerifyError("");
    setTimeout(() => {
      setVerifying(false);
      if (events.length === 0) {
        setVerifyError(language === 'ar' ? "لم يتم العثور على أي بيانات بعد. يرجى التأكد من إضافة الكود بشكل صحيح وزيارة متجرك لتوليد بعض البيانات." : "No data found yet. Please ensure the code is added correctly and visit your store to generate some data.");
      }
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!store) return null;

  const snippetCode = `<script>
  (function() {
    var projectId = "${firebaseConfig.projectId}";
    var databaseId = "${firebaseConfig.firestoreDatabaseId}";
    var apiKey = "${firebaseConfig.apiKey}";
    var storeId = "${store.id}";
    var ownerId = "${auth.currentUser?.uid || ''}";
    var endpoint = "https://firestore.googleapis.com/v1/projects/" + projectId + "/databases/" + databaseId + "/documents/events?key=" + apiKey;

    // Session management
    var sessionId = localStorage.getItem('avbora_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('avbora_session_id', sessionId);
    }

    function track(eventType, metadata) {
      var payload = {
        fields: {
          storeId: { stringValue: storeId },
          ownerId: { stringValue: ownerId },
          eventType: { stringValue: eventType },
          sessionId: { stringValue: sessionId },
          url: { stringValue: window.location.href },
          timestamp: { timestampValue: new Date().toISOString() }
        }
      };
      
      // Include captured email if available in session
      var savedEmail = localStorage.getItem('avbora_email');
      if (savedEmail) {
        payload.fields.email = { stringValue: savedEmail };
      }

      if (metadata) {
        payload.fields.metadata = { stringValue: JSON.stringify(metadata) };
      }
      
      var body = JSON.stringify(payload);
      
      if (navigator.sendBeacon) {
        navigator.sendBeacon(endpoint, body);
        console.log('Avbora Tracked (Beacon):', eventType, metadata || '');
      } else {
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: body
        }).catch(function(e){console.error('Tracking error', e)});
      }
    }

    window.AvboraTrack = track;
    track('page_view');

    // Smart tracking for Cart and Checkout
    document.addEventListener('click', function(e) {
      var target = e.target.closest('button, a, input[type="button"], input[type="submit"], [role="button"]');
      if (!target) return;
      
      var text = target.innerText || target.value || target.getAttribute('aria-label') || target.getAttribute('title') || '';
      var lowerText = text.toLowerCase().trim();
      
      // Add to Cart detection
      var cartKeywords = ['أضف للسلة', 'add to cart', 'إضافة للسلة', 'أضف إلى السلة', 'إضافة إلى السلة', 'سلة المشتريات', 'buy now', 'اشتري الآن', 'تسوق الآن', 'shop now', 'أضف إلى العربة', 'أضف للعربة'];
      var isCart = cartKeywords.some(function(kw) { return lowerText.includes(kw); });
      
      if (!isCart) {
        var idOrClass = (target.id + ' ' + target.className).toLowerCase();
        var odooClasses = ['js_check_product', 'a-submit', 'add_to_cart_button', 'product_add_to_cart'];
        isCart = ['add-to-cart', 'add_to_cart', 'add-cart', 'btn-cart', 'cart-btn'].some(function(kw) { return idOrClass.includes(kw); }) ||
                 odooClasses.some(function(kw) { return idOrClass.includes(kw); });
      }
      
      if (isCart) {
        // Try to find a product ID from common attributes
        var productId = target.getAttribute('data-product-id') || target.getAttribute('data-id') || window.location.pathname.split('/').pop();
        track('add_to_cart', { product_id: productId, button_text: text });
      }
      
      // Checkout detection
      var checkoutKeywords = ['إتمام الطلب', 'checkout', 'الدفع', 'دفع', 'سداد', 'المتابعة للدفع', 'شراء', 'buy'];
      var isCheckout = checkoutKeywords.some(function(kw) { return lowerText.includes(kw); });
      
      if (isCheckout) {
        track('checkout_start', { button_text: text });
      }
    });

    // URL based tracking
    if (window.location.href.includes('/checkout')) {
      track('checkout_start');
    }
    if (window.location.href.includes('/cart')) {
      track('cart_view');
    }
    if (window.location.href.includes('/success') || window.location.href.includes('/thank-you') || window.location.href.includes('/order-received')) {
      track('purchase_complete');
    }

    // Email capture
    document.addEventListener('change', function(e) {
      var target = e.target;
      if (target.type === 'email' || (target.name && target.name.toLowerCase().includes('email'))) {
        var email = target.value;
        if (email && email.includes('@')) {
          localStorage.setItem('avbora_email', email);
          track('email_captured', { email: email });
        }
      }
    });
  })();
</script>`;

  const pageViews = events.filter(e => e.eventType === "page_view").length;
  const addCarts = events.filter(e => e.eventType === "add_to_cart").length;
  const checkoutStarts = events.filter(e => e.eventType === "checkout_start").length;
  const checkoutAbandons = events.filter(e => e.eventType === "checkout_abandon").length;
  const purchases = events.filter(e => e.eventType === "purchase_complete").length;
  const emailsCaptured = events.filter(e => e.eventType === "email_captured").length;

  const getEventName = (type: string) => {
    switch (type) {
      case 'page_view': return language === 'ar' ? 'زيارة صفحة' : 'Page View';
      case 'add_to_cart': return language === 'ar' ? 'إضافة للسلة' : 'Add to Cart';
      case 'cart_view': return language === 'ar' ? 'عرض السلة' : 'Cart View';
      case 'checkout_start': return language === 'ar' ? 'بدء الدفع' : 'Checkout Start';
      case 'checkout_abandon': return language === 'ar' ? 'سلة متروكة' : 'Checkout Abandon';
      case 'purchase_complete': return language === 'ar' ? 'طلب مكتمل' : 'Purchase Complete';
      case 'email_captured': return language === 'ar' ? 'التقاط إيميل' : 'Email Captured';
      default: return type;
    }
  };

  const getPlatformInstructions = () => {
    switch (store.platform) {
      case "woocommerce":
        return language === 'ar' 
          ? "في لوحة تحكم ووكومرس، اذهب إلى المظهر > محرر القوالب (Theme Editor)، ثم اختر ملف header.php وألصق الكود قبل وسم </head>."
          : "In your WooCommerce dashboard, go to Appearance > Theme Editor, select header.php, and paste the code before the </head> tag.";
      case "shopify":
        return language === 'ar'
          ? "في لوحة تحكم شوبيفاي، اذهب إلى Online Store > Themes > Edit Code، ثم افتح ملف theme.liquid وألصق الكود قبل وسم </head>."
          : "In your Shopify dashboard, go to Online Store > Themes > Edit Code, open theme.liquid, and paste the code before the </head> tag.";
      case "salla":
        return language === 'ar'
          ? "في منصة سلة، اذهب إلى إعدادات المتجر > إعدادات متقدمة > إضافة أكواد مخصصة، وألصق الكود في قسم 'أكواد الهيدر'."
          : "In Salla, go to Store Settings > Advanced Settings > Custom Codes, and paste the code in the 'Header Codes' section.";
      case "zid":
        return language === 'ar'
          ? "في منصة زد، اذهب إلى الإعدادات > الأكواد المخصصة، وأضف كود جديد في قسم الـ Head."
          : "In Zid, go to Settings > Custom Codes, and add a new code in the Head section.";
      case "odoo":
        return language === 'ar'
          ? "في أودو، اذهب إلى Website > Configuration > Settings، وابحث عن 'Custom Code' وألصق الكود في 'Head Code'. أو اذهب إلى Site > HTML/CSS Editor وقم بتعديل القالب الرئيسي."
          : "In Odoo, go to Website > Configuration > Settings, look for 'Custom Code' and paste the code in 'Head Code'. Alternatively, go to Site > HTML/CSS Editor and edit the main layout.";
      default:
        return language === 'ar'
          ? "لم نستقبل أي بيانات من متجرك حتى الآن. يرجى التأكد من إضافة كود التتبع التالي في وسم <code>&lt;head&gt;</code> في جميع صفحات متجرك."
          : "We haven't received any data from your store yet. Please make sure to add the following tracking code inside the <code>&lt;head&gt;</code> tag on all pages of your store.";
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/stores")}>
          <ArrowRight className={`h-5 w-5 ${language === 'ar' ? '' : 'rotate-180'}`} />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{store.name}</h2>
          <p className="text-muted-foreground flex items-center gap-2">
            {store.domain}
            <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${store.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {store.status === 'active' ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'في انتظار الربط' : 'Pending Connection')}
            </span>
          </p>
        </div>
      </div>

      {store.status === "pending" && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6 flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-yellow-600 shrink-0" />
            <div className="space-y-4 w-full">
              <div>
                <h3 className="font-semibold text-yellow-800">{language === 'ar' ? 'في انتظار استقبال البيانات' : 'Waiting for Data'}</h3>
                <p className="text-sm text-yellow-700 mt-1" dangerouslySetInnerHTML={{ __html: getPlatformInstructions() }} />
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
                  <Copy className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'نسخ الكود' : 'Copy Code'}
                </Button>
              </div>
              <div className="mt-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <p className="text-sm text-yellow-700">
                  {language === 'ar' ? 'بمجرد إضافة الكود، قم بزيارة متجرك لتوليد أول حدث تتبع وتفعيل المتجر.' : 'Once the code is added, visit your store to generate the first tracking event and activate the store.'}
                </p>
                <Button 
                  onClick={handleVerify} 
                  disabled={verifying || store.status === 'active'}
                  className="w-full sm:w-auto"
                >
                  {verifying ? (
                    <>
                      <Loader2 className={`h-4 w-4 animate-spin ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                      {language === 'ar' ? 'جاري التحقق...' : 'Verifying...'}
                    </>
                  ) : store.status === 'active' ? (
                    <>
                      <CheckCircle2 className={`h-4 w-4 text-green-500 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                      {language === 'ar' ? 'تم التفعيل' : 'Activated'}
                    </>
                  ) : (
                    language === 'ar' ? "التحقق من التثبيت" : "Verify Installation"
                  )}
                </Button>
              </div>
              {verifyError && (
                <p className="text-sm text-destructive mt-2">{verifyError}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{language === 'ar' ? 'إجمالي الزيارات' : 'Total Visits'}</CardTitle>
            <Users className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pageViews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{language === 'ar' ? 'إضافات للسلة' : 'Adds to Cart'}</CardTitle>
            <ShoppingCart className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{addCarts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{language === 'ar' ? 'بدء الدفع' : 'Checkout Started'}</CardTitle>
            <Activity className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{checkoutViews + checkoutClicks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{language === 'ar' ? 'سلات متروكة' : 'Abandoned Carts'}</CardTitle>
            <AlertCircle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{checkoutExits}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{language === 'ar' ? 'إيميلات تم التقاطها' : 'Emails Captured'}</CardTitle>
            <Mail className="h-5 w-5 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{emailsCaptured}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{language === 'ar' ? 'سجل الأحداث المباشر' : 'Live Event Log'}</CardTitle>
          <CardDescription>{language === 'ar' ? 'أحدث البيانات الواردة من كود التتبع الخاص بك.' : 'Latest data received from your tracking code.'}</CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {language === 'ar' ? 'لا توجد أحداث مسجلة حتى الآن.' : 'No events recorded yet.'}
            </div>
          ) : (
            <div className="space-y-4">
              {events.slice(0, 10).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      event.eventType === 'page_view' ? 'bg-blue-100 text-blue-600' : 
                      event.eventType === 'email_captured' ? 'bg-indigo-100 text-indigo-600' :
                      event.eventType === 'purchase_complete' ? 'bg-green-100 text-green-600' :
                      event.eventType === 'checkout_abandon' ? 'bg-red-100 text-red-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {event.eventType === 'page_view' ? <Users className="h-4 w-4" /> : 
                       event.eventType === 'email_captured' ? <Mail className="h-4 w-4" /> :
                       event.eventType === 'purchase_complete' ? <CheckCircle className="h-4 w-4" /> :
                       event.eventType === 'checkout_abandon' ? <AlertCircle className="h-4 w-4" /> :
                       <ShoppingCart className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {event.eventType === 'email_captured' && event.metadata 
                          ? JSON.parse(event.metadata).email 
                          : event.eventType === 'add_to_cart' && event.metadata && JSON.parse(event.metadata).product_id
                          ? `${getEventName(event.eventType)} (${JSON.parse(event.metadata).product_id})`
                          : getEventName(event.eventType)}
                      </p>
                      <p className={`text-xs text-muted-foreground dir-ltr ${language === 'ar' ? 'text-right' : 'text-left'} truncate max-w-[200px] sm:max-w-xs`}>{event.url}</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(() => {
                      const ts = event.timestamp;
                      const date = ts?.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
                      return date.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US');
                    })()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{language === 'ar' ? 'كود التتبع' : 'Tracking Code'}</CardTitle>
          <CardDescription>
            {language === 'ar' 
              ? 'انسخ هذا الكود وضعه في وسم <head> في جميع صفحات متجرك لتفعيل التتبع.' 
              : 'Copy this code and place it inside the <head> tag on all pages of your store to enable tracking.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg text-sm" dangerouslySetInnerHTML={{ __html: getPlatformInstructions() }} />
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
              <Copy className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
              {language === 'ar' ? 'نسخ الكود' : 'Copy Code'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
