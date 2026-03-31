import { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { auth, db } from "../../firebase";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Loader2, FileText, Store, TrendingUp, Clock, ArrowRight, Plus, User } from "lucide-react";
import { Link } from "react-router-dom";
import { handleFirestoreError, OperationType } from "../../lib/firestore-error";
import ConfigStatus from "../../components/ConfigStatus";

export default function Overview() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({ blogs: 0, articles: 0, scheduled: 0 });
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasBlogs, setHasBlogs] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchData();
      } else {
        setIsLoading(false);
      }
    });

    const fetchData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      
      setIsLoading(true);
      try {
        const blogsPath = "blogs";
        let blogsSnap;
        try {
          blogsSnap = await getDocs(query(collection(db, blogsPath), where("ownerUid", "==", currentUser.uid)));
        } catch (e) {
          handleFirestoreError(e, OperationType.GET, blogsPath);
          return;
        }
        setHasBlogs(blogsSnap.size > 0);
        
        const articlesPath = "articles";
        let articlesSnap;
        try {
          articlesSnap = await getDocs(query(collection(db, articlesPath), where("ownerUid", "==", currentUser.uid)));
        } catch (e) {
          handleFirestoreError(e, OperationType.GET, articlesPath);
          return;
        }

        let scheduledSnap;
        try {
          scheduledSnap = await getDocs(query(collection(db, articlesPath), where("ownerUid", "==", currentUser.uid), where("status", "==", "scheduled")));
        } catch (e) {
          handleFirestoreError(e, OperationType.GET, articlesPath);
          return;
        }
        
        setStats({
          blogs: blogsSnap.size,
          articles: articlesSnap.size,
          scheduled: scheduledSnap.size
        });

        let recentSnap;
        try {
          recentSnap = await getDocs(query(
            collection(db, articlesPath), 
            where("ownerUid", "==", currentUser.uid),
            orderBy("createdAt", "desc"),
            limit(5)
          ));
        } catch (e) {
          handleFirestoreError(e, OperationType.GET, articlesPath);
          return;
        }
        setRecentArticles(recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const usersPath = "users";
        let userDoc;
        try {
          userDoc = await getDocs(query(collection(db, usersPath), where("__name__", "==", currentUser.uid)));
        } catch (e) {
          handleFirestoreError(e, OperationType.GET, usersPath);
          return;
        }
        
        if (!userDoc.empty) {
          setAvatarUrl(userDoc.docs[0].data().avatarUrl || currentUser.photoURL);
        } else {
          setAvatarUrl(currentUser.photoURL);
        }
      } catch (error) {
        console.error("Error fetching overview data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userName = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'User';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <ConfigStatus />
      {!hasBlogs && (
        <div className="bg-card border rounded-2xl p-8 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 overflow-hidden border-4 border-background shadow-sm">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User className="h-10 w-10 text-primary/50" />
            )}
          </div>
          <h2 className="text-2xl font-bold mb-2">{t('overview.notConnected')}</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            {t('overview.notConnectedDesc')}
          </p>
          <Button asChild size="lg" className="rounded-full px-8">
            <Link to="/dashboard/settings">{t('overview.connectNow')}</Link>
          </Button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1">
            {t('overview.welcome')}، {userName} 👋
          </h2>
          <p className="text-muted-foreground">{t('overview.description')}</p>
        </div>
        <Button asChild className="rounded-full shrink-0">
          <Link to="/dashboard/generate">
            <Plus className="h-4 w-4 mr-2" />
            {t('overview.newArticle')}
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-none shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('overview.active')}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium mb-1">{t('overview.totalArticles')}</p>
            <div className="text-3xl font-bold">{stats.articles}</div>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-none shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('overview.active')}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
              <Store className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium mb-1">{t('overview.connectedBlogs')}</p>
            <div className="text-3xl font-bold">{stats.blogs}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('overview.estimated')}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium mb-1">{t('overview.estimatedTraffic')}</p>
            <div className="text-3xl font-bold">{stats.articles * 150}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('overview.comparedToManual')}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium mb-1">{t('overview.timeSaved')}</p>
            <div className="text-3xl font-bold">{stats.articles * 2} {t('overview.hours')}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 rounded-2xl border-none shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl">{t('overview.recentArticles')}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{t('overview.recentArticlesDesc')}</p>
            </div>
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
              <Link to="/dashboard/articles" className="text-primary">
                {t('overview.viewAll')} <ArrowRight className="h-4 w-4 ml-1 rtl:rotate-180" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mt-4">
              {recentArticles.length > 0 ? (
                recentArticles.map((article) => (
                  <div key={article.id} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors">
                    <div className="space-y-1">
                      <p className="font-medium line-clamp-1">{article.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className={`px-2 py-0.5 rounded-full ${
                          article.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          article.status === 'scheduled' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {article.status}
                        </span>
                        <span>•</span>
                        <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 border rounded-xl border-dashed">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">{t('overview.noArticles')} <Link to="/dashboard/generate" className="text-primary hover:underline">{t('overview.noArticlesHere')}</Link></p>
                </div>
              )}
            </div>
            <Button variant="outline" className="w-full mt-4 sm:hidden" asChild>
              <Link to="/dashboard/articles">{t('overview.viewAll')}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              💡 {t('overview.tipOfDay')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed font-medium">
              {t('overview.tipText')}
            </p>
            <Button variant="link" className="px-0 text-primary h-auto font-semibold">
              {t('overview.discoverMore')} <ArrowRight className="h-4 w-4 ml-1 rtl:rotate-180" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
