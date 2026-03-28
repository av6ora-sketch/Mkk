import { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { auth, db } from "../../firebase";
import { doc, getDoc, deleteDoc, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Loader2, ShieldCheck, ShieldAlert, LogOut, RefreshCw, Store, ExternalLink } from "lucide-react";

interface Blog {
  id: string;
  title: string;
  url: string;
}

export default function Settings() {
  const { t } = useLanguage();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [blogs, setBlogs] = useState<Blog[]>([]);

  const fetchBlogs = async () => {
    if (!auth.currentUser) return;
    try {
      const q = query(collection(db, "blogs"), where("ownerUid", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const blogsData = querySnapshot.docs.map(doc => doc.data() as Blog);
      setBlogs(blogsData);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  useEffect(() => {
    const checkStatus = async () => {
      if (!auth.currentUser) return;
      try {
        const settingsSnap = await getDoc(doc(db, "settings", auth.currentUser.uid));
        setIsConnected(!!settingsSnap.data()?.bloggerTokens);
        if (settingsSnap.data()?.bloggerTokens) {
          await fetchBlogs();
        }
      } catch (error) {
        console.error("Error checking Blogger status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkStatus();

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        checkStatus();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleDisconnect = async () => {
    if (!auth.currentUser || !window.confirm(t('blogSettings.confirmDisconnect'))) return;
    setIsLoading(true);
    try {
      await deleteDoc(doc(db, "settings", auth.currentUser.uid));
      setIsConnected(false);
      setBlogs([]);
    } catch (error) {
      console.error("Error disconnecting Blogger:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!auth.currentUser) return;
    try {
      const response = await fetch('/api/auth/url');
      const { url } = await response.json();
      const authUrl = `${url}&state=${auth.currentUser.uid}`;
      window.open(authUrl, 'blogger_auth', 'width=600,height=700');
    } catch (error) {
      console.error("Error starting OAuth:", error);
    }
  };

  const syncBlogs = async () => {
    if (!auth.currentUser) return;
    setIsSyncing(true);
    try {
      const response = await fetch(`/api/blogs?userId=${auth.currentUser.uid}`);
      const remoteBlogs = await response.json();
      
      if (Array.isArray(remoteBlogs)) {
        for (const blog of remoteBlogs) {
          const q = query(collection(db, "blogs"), where("id", "==", blog.id));
          const snap = await getDocs(q);
          if (snap.empty) {
            await addDoc(collection(db, "blogs"), {
              id: blog.id,
              title: blog.name,
              url: blog.url,
              ownerUid: auth.currentUser.uid,
              createdAt: new Date().toISOString()
            });
          }
        }
        await fetchBlogs();
      }
    } catch (error) {
      console.error("Error syncing blogs:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('sidebar.blogSettings')}</h2>
        <p className="text-muted-foreground">{t('blogSettings.manageConnection')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('blogSettings.bloggerConnection')}</CardTitle>
          <CardDescription>{t('blogSettings.bloggerConnectionDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-muted/50 gap-4">
            <div className="flex items-center gap-3">
              {isConnected ? (
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-6 w-6 text-green-600" />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <ShieldAlert className="h-6 w-6 text-red-600" />
                </div>
              )}
              <div>
                <p className="font-medium">{isConnected ? t('blogSettings.connectedToBlogger') : t('blogSettings.notConnected')}</p>
                <p className="text-sm text-muted-foreground">
                  {isConnected ? t('blogSettings.accountReady') : t('blogSettings.connectToStart')}
                </p>
              </div>
            </div>
            {isConnected ? (
              <Button variant="outline" size="sm" onClick={handleDisconnect} disabled={isLoading} className="w-full sm:w-auto shrink-0">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4 mr-2" />}
                {t('blogSettings.disconnect')}
              </Button>
            ) : (
              <Button size="sm" onClick={handleConnect} className="w-full sm:w-auto shrink-0">{t('blogSettings.connectBlogger')}</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isConnected && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t('blogSettings.yourBlogs')}</CardTitle>
              <CardDescription>{t('blogSettings.yourBlogsDesc')}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={syncBlogs} disabled={isSyncing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {t('blogSettings.syncBlogs')}
            </Button>
          </CardHeader>
          <CardContent>
            {blogs.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {blogs.map((blog) => (
                  <div key={blog.id} className="flex flex-col p-4 border rounded-lg bg-card">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Store className="h-4 w-4 text-primary" />
                      </div>
                      <h4 className="font-medium line-clamp-1">{blog.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mb-4">{blog.url}</p>
                    <Button variant="secondary" size="sm" className="w-full mt-auto" asChild>
                      <a href={blog.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {t('blogSettings.visitBlog')}
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-lg border-dashed">
                <Store className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground mb-4">{t('blogSettings.noBlogsFound')}</p>
                <Button onClick={syncBlogs} disabled={isSyncing} variant="outline">
                  {isSyncing ? t('blogSettings.syncing') : t('blogSettings.syncNow')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
