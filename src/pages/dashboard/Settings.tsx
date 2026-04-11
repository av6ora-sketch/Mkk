import { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { auth, db } from "../../firebase";
import { doc, getDoc, deleteDoc, collection, query, where, getDocs, addDoc, updateDoc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Loader2, ShieldCheck, ShieldAlert, LogOut, RefreshCw, Store, ExternalLink, AlertTriangle, Settings as SettingsIcon, Plus } from "lucide-react";
import { handleFirestoreError, OperationType } from "../../lib/firestore-error";
import { getApiUrl } from "../../lib/utils";

interface Blog {
  id: string;
  title: string;
  url: string;
  topic?: string;
  language?: string;
  prompts?: string;
  autoPost?: boolean;
  postFrequency?: number;
  docId?: string; // Firestore document ID
}

export default function Settings() {
  const { t } = useLanguage();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [apiError, setApiError] = useState<{message: string, url?: string} | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);

  // New states for blog selection and configuration
  const [availableBlogs, setAvailableBlogs] = useState<Blog[]>([]);
  const [showBlogSelector, setShowBlogSelector] = useState(false);
  const [configuringBlog, setConfiguringBlog] = useState<Blog | null>(null);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Form state for blog config
  const [configForm, setConfigForm] = useState({
    topic: "",
    language: "ar",
    prompts: "",
    autoPost: false,
    postFrequency: 24
  });

  const fetchBlogs = async () => {
    if (!auth.currentUser) return;
    try {
      const path = "blogs";
      const q = query(collection(db, path), where("ownerUid", "==", auth.currentUser.uid));
      let querySnapshot;
      try {
        querySnapshot = await getDocs(q);
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, path);
        return;
      }
      const blogsData = querySnapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id } as Blog));
      setBlogs(blogsData);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  useEffect(() => {
    const checkStatus = async () => {
      if (!auth.currentUser) return;
      try {
        const path = "settings";
        let settingsSnap;
        try {
          settingsSnap = await getDoc(doc(db, path, auth.currentUser.uid));
        } catch (e) {
          handleFirestoreError(e, OperationType.GET, `${path}/${auth.currentUser.uid}`);
          return;
        }
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
    if (!auth.currentUser) return;
    setIsLoading(true);
    try {
      const path = "settings";
      try {
        await deleteDoc(doc(db, path, auth.currentUser.uid));
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `${path}/${auth.currentUser.uid}`);
        return;
      }
      setIsConnected(false);
      setBlogs([]);
      setShowDisconnectConfirm(false);
    } catch (error) {
      console.error("Error disconnecting Blogger:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!auth.currentUser) return;
    setConnectError(null);
    
    // Open the window synchronously before the fetch to avoid browser popup blockers
    const authWindow = window.open('', 'blogger_auth', 'width=600,height=700');
    
    if (!authWindow) {
      setConnectError("يرجى السماح بالنوافذ المنبثقة (Pop-ups) لهذا الموقع لكي تتمكن من تسجيل الدخول.");
      return;
    }

    authWindow.document.write('<div style="font-family: sans-serif; padding: 20px; text-align: center;">جاري التحميل... يرجى الانتظار<br>Loading... Please wait</div>');

    try {
      const fetchUrl = getApiUrl(`/api/auth/url?userId=${auth.currentUser.uid}`);
      console.log("Fetching OAuth URL from:", fetchUrl);
      
      const response = await fetch(fetchUrl);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      // Check if the response is JSON (Vercel might return HTML if the route is missing)
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("تلقى التطبيق استجابة غير متوقعة (ليست JSON). هذا يعني أن الخادم الخلفي (Backend) غير متوفر على هذا الرابط. إذا كنت تستخدم Vercel، يجب عليك إعداد VITE_API_URL.");
      }

      const { url } = await response.json();
      authWindow.location.href = url;
    } catch (error: any) {
      console.error("Error starting OAuth:", error);
      authWindow.close();
      setConnectError(`حدث خطأ أثناء محاولة الاتصال بالخادم.\n\nإذا كنت تستخدم Vercel، يجب عليك إضافة المتغير VITE_API_URL في إعدادات Vercel وقيمته هي رابط الخادم الخلفي (Backend).\n\nتفاصيل الخطأ: ${error.message || error}`);
    }
  };

  const syncBlogs = async () => {
    if (!auth.currentUser) return;
    setIsSyncing(true);
    setApiError(null);
    try {
      const response = await fetch(getApiUrl(`/api/blogs?userId=${auth.currentUser.uid}`));
      const data = await response.json();
      
      if (!response.ok) {
        if (data.actionRequired) {
          setApiError({ message: data.details, url: data.enableUrl });
        } else {
          setApiError({ message: data.error || "Failed to fetch blogs from Blogger" });
        }
        return;
      }

      const remoteBlogs = data;
      if (Array.isArray(remoteBlogs)) {
        // Filter out blogs that are already connected
        const connectedIds = blogs.map(b => b.id);
        const newAvailable = remoteBlogs
          .filter(b => !connectedIds.includes(b.id))
          .map(b => ({ id: b.id, title: b.name, url: b.url }));
        
        setAvailableBlogs(newAvailable);
        setShowBlogSelector(true);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setApiError({ message: "An unexpected error occurred while fetching blogs." });
    } finally {
      setIsSyncing(false);
    }
  };

  const connectSpecificBlog = async (blog: Blog) => {
    if (!auth.currentUser) return;
    setIsSyncing(true);
    try {
      const path = "blogs";
      await addDoc(collection(db, path), {
        id: blog.id,
        title: blog.title,
        url: blog.url,
        ownerUid: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
        autoPost: false
      });
      await fetchBlogs();
      setAvailableBlogs(prev => prev.filter(b => b.id !== blog.id));
      if (availableBlogs.length <= 1) {
        setShowBlogSelector(false);
      }
    } catch (error) {
      console.error("Error connecting blog:", error);
      handleFirestoreError(error, OperationType.CREATE, "blogs");
    } finally {
      setIsSyncing(false);
    }
  };

  const openConfigModal = (blog: Blog) => {
    setConfiguringBlog(blog);
    setConfigForm({
      topic: blog.topic || "",
      language: blog.language || "ar",
      prompts: blog.prompts || "",
      autoPost: blog.autoPost || false,
      postFrequency: blog.postFrequency || 24
    });
  };

  const saveBlogConfig = async () => {
    if (!configuringBlog?.docId || !auth.currentUser) return;
    setIsSavingConfig(true);
    try {
      const path = `blogs/${configuringBlog.docId}`;
      await updateDoc(doc(db, "blogs", configuringBlog.docId), {
        topic: configForm.topic,
        language: configForm.language,
        prompts: configForm.prompts,
        autoPost: configForm.autoPost,
        postFrequency: Number(configForm.postFrequency)
      });
      await fetchBlogs();
      setConfiguringBlog(null);
    } catch (error) {
      console.error("Error saving config:", error);
      handleFirestoreError(error, OperationType.UPDATE, `blogs/${configuringBlog.docId}`);
    } finally {
      setIsSavingConfig(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
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
          {connectError && (
            <div className="p-4 border border-red-200 bg-red-50 text-red-900 rounded-lg flex flex-col gap-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span>خطأ في الاتصال (Connection Error)</span>
              </div>
              <p className="text-sm whitespace-pre-line">{connectError}</p>
            </div>
          )}
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
              <Button variant="outline" size="sm" onClick={() => setShowDisconnectConfirm(true)} disabled={isLoading} className="w-full sm:w-auto shrink-0">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4 mr-2" />}
                {t('blogSettings.disconnect')}
              </Button>
            ) : (
              <Button size="sm" onClick={handleConnect} className="w-full sm:w-auto shrink-0">{t('blogSettings.connectBlogger')}</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Disconnect Confirmation Modal */}
      {showDisconnectConfirm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-lg animate-in fade-in zoom-in duration-200">
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl">{t('blogSettings.confirmDisconnect')}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-center text-muted-foreground">
                {t('blogSettings.confirmDisconnectDesc') || "Are you sure you want to disconnect your Blogger account? You will no longer be able to generate or schedule articles."}
              </p>
              <div className="flex gap-3 mt-2">
                <Button variant="outline" className="flex-1 rounded-full" onClick={() => setShowDisconnectConfirm(false)} disabled={isLoading}>
                  {t('common.cancel')}
                </Button>
                <Button variant="destructive" className="flex-1 rounded-full" onClick={handleDisconnect} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogOut className="h-4 w-4 mr-2" />}
                  {t('blogSettings.disconnect')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Blog Selector Modal */}
      {showBlogSelector && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg shadow-lg animate-in fade-in zoom-in duration-200 max-h-[80vh] flex flex-col">
            <CardHeader>
              <CardTitle>Select a Blog to Connect</CardTitle>
              <CardDescription>Choose which Blogger blog you want to manage with AI.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4">
              {availableBlogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No new blogs found to connect.</p>
              ) : (
                availableBlogs.map(blog => (
                  <div key={blog.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0 mr-4">
                      <h4 className="font-medium truncate">{blog.title}</h4>
                      <p className="text-sm text-muted-foreground truncate">{blog.url}</p>
                    </div>
                    <Button size="sm" onClick={() => connectSpecificBlog(blog)} disabled={isSyncing}>
                      <Plus className="h-4 w-4 mr-2" /> Connect
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
            <div className="p-4 border-t mt-auto">
              <Button variant="outline" className="w-full" onClick={() => setShowBlogSelector(false)}>Close</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Blog Configuration Modal */}
      {configuringBlog && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-xl shadow-lg animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <CardHeader>
              <CardTitle>AI Configuration: {configuringBlog.title}</CardTitle>
              <CardDescription>Set up automatic AI article generation for this blog.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4">
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Blog Topic / Niche</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded-md bg-background" 
                  placeholder="e.g., Technology, Health, Cooking..."
                  value={configForm.topic}
                  onChange={e => setConfigForm({...configForm, topic: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Article Language</label>
                <select 
                  className="w-full p-2 border rounded-md bg-background"
                  value={configForm.language}
                  onChange={e => setConfigForm({...configForm, language: e.target.value})}
                >
                  <option value="ar">Arabic</option>
                  <option value="en">English</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Custom Prompts / Instructions for AI</label>
                <textarea 
                  className="w-full p-2 border rounded-md bg-background min-h-[100px]" 
                  placeholder="e.g., Write in a friendly tone. Always include a conclusion. Focus on SEO keywords..."
                  value={configForm.prompts}
                  onChange={e => setConfigForm({...configForm, prompts: e.target.value})}
                />
              </div>

              <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto-Post Articles</h4>
                    <p className="text-sm text-muted-foreground">Let AI automatically write and publish articles.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={configForm.autoPost}
                      onChange={e => setConfigForm({...configForm, autoPost: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {configForm.autoPost && (
                  <div className="space-y-2 pt-2 border-t">
                    <label className="text-sm font-medium">Posting Frequency (Hours)</label>
                    <select 
                      className="w-full p-2 border rounded-md bg-background"
                      value={configForm.postFrequency}
                      onChange={e => setConfigForm({...configForm, postFrequency: Number(e.target.value)})}
                    >
                      <option value={6}>Every 6 Hours</option>
                      <option value={12}>Every 12 Hours</option>
                      <option value={24}>Once a Day (24h)</option>
                      <option value={48}>Every 2 Days (48h)</option>
                      <option value={168}>Once a Week (168h)</option>
                    </select>
                  </div>
                )}
              </div>

            </CardContent>
            <div className="p-4 border-t mt-auto flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfiguringBlog(null)} disabled={isSavingConfig}>Cancel</Button>
              <Button className="flex-1" onClick={saveBlogConfig} disabled={isSavingConfig}>
                {isSavingConfig ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Settings
              </Button>
            </div>
          </Card>
        </div>
      )}

      {isConnected && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t('blogSettings.yourBlogs')}</CardTitle>
              <CardDescription>{t('blogSettings.yourBlogsDesc')}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={syncBlogs} disabled={isSyncing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              Fetch New Blogs
            </Button>
          </CardHeader>
          <CardContent>
            {apiError && (
              <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-900 rounded-lg flex flex-col gap-2">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span>API Error</span>
                </div>
                <p className="text-sm">{apiError.message}</p>
                {apiError.url && (
                  <Button variant="outline" size="sm" className="w-fit mt-2 border-red-200 hover:bg-red-100" asChild>
                    <a href={apiError.url} target="_blank" rel="noopener noreferrer">
                      Enable Blogger API <ExternalLink className="h-3 w-3 ml-2" />
                    </a>
                  </Button>
                )}
              </div>
            )}

            {blogs.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {blogs.map((blog) => (
                  <div key={blog.id} className="flex flex-col p-4 border rounded-lg bg-card relative overflow-hidden">
                    {blog.autoPost && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider">
                        Auto-Post ON
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-2 mt-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Store className="h-4 w-4 text-primary" />
                      </div>
                      <h4 className="font-medium line-clamp-1 pr-16">{blog.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mb-4">{blog.url}</p>
                    
                    <div className="flex gap-2 mt-auto">
                      <Button variant="secondary" size="sm" className="flex-1" asChild>
                        <a href={blog.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Visit
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => openConfigModal(blog)}>
                        <SettingsIcon className="h-4 w-4 mr-2" />
                        Configure AI
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-lg border-dashed">
                <Store className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground mb-4">No blogs connected yet.</p>
                <Button onClick={syncBlogs} disabled={isSyncing} variant="outline">
                  {isSyncing ? "Fetching..." : "Fetch Blogs from Blogger"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
