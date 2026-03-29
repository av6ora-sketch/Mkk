import { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { auth, db } from "../../firebase";
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from "firebase/firestore";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Loader2, Trash2, Calendar, CheckCircle2, Clock, FileText, ExternalLink, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { handleFirestoreError, OperationType } from "../../lib/firestore-error";

interface Article {
  id: string;
  title: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt?: string;
  publishedAt?: string;
  publishedUrl?: string;
  createdAt: string;
  blogId: string;
}

export default function Articles() {
  const { t } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchArticles = async () => {
    if (!auth.currentUser) return;
    setIsLoading(true);
    try {
      const path = "articles";
      const q = query(
        collection(db, path), 
        where("ownerUid", "==", auth.currentUser.uid),
        orderBy("createdAt", "desc")
      );
      let querySnapshot;
      try {
        querySnapshot = await getDocs(q);
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, path);
        return;
      }
      const articlesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
      setArticles(articlesData);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const path = "articles";
      try {
        await deleteDoc(doc(db, path, deleteId));
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `${path}/${deleteId}`);
        return;
      }
      setDeleteId(null);
      await fetchArticles();
    } catch (error) {
      console.error("Error deleting article:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'scheduled': return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('articles.title')}</h2>
        <p className="text-muted-foreground">{t('articles.description')}</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : articles.length > 0 ? (
        <div className="grid gap-4">
          {articles.map((article) => (
            <Card key={article.id}>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    {getStatusIcon(article.status)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="capitalize font-medium">{article.status}</span>
                      {article.scheduledAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(article.scheduledAt), "PPP p")}
                        </span>
                      )}
                      {article.publishedAt && (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {format(new Date(article.publishedAt), "PPP p")}
                        </span>
                      )}
                      {article.publishedUrl && (
                        <a 
                          href={article.publishedUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline font-medium"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {t('articles.viewOnBlogger')}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(article.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">{t('articles.noArticles')}</h3>
            <p className="text-muted-foreground mb-6">{t('articles.noArticlesDesc')}</p>
            <Button asChild>
              <a href="/dashboard/generate">{t('articles.generateBtn')}</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-lg animate-in fade-in zoom-in duration-200">
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl">{t('articles.confirmDelete')}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-center text-muted-foreground">
                {t('articles.confirmDeleteDesc') || "Are you sure you want to delete this article? This action cannot be undone."}
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
