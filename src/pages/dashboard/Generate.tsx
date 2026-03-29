import { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { auth, db } from "../../firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Loader2, Wand2, Calendar, Save, CheckCircle2, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { handleFirestoreError, OperationType } from "../../lib/firestore-error";

interface Blog {
  id: string;
  title: string;
}

export default function Generate() {
  const { t, language } = useLanguage();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedBlog, setSelectedBlog] = useState("");
  const [prompt, setPrompt] = useState("");
  const [keywords, setKeywords] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedArticle, setGeneratedArticle] = useState<{ title: string; content: string } | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
        const blogsData = querySnapshot.docs.map(doc => doc.data() as Blog);
        setBlogs(blogsData);
        if (blogsData.length > 0) setSelectedBlog(blogsData[0].id);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };
    fetchBlogs();
  }, []);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setGeneratedArticle(null);
    setSuccess(false);
    setError(null);
    try {
      const response = await fetch('/api/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          keywords: keywords.split(",").map(k => k.trim()),
          language
        })
      });
      const data = await response.json();
      setGeneratedArticle(data);
    } catch (error) {
      console.error("Error generating article:", error);
      setError(t('error.generateFailed') || "Failed to generate article. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (status: 'draft' | 'scheduled' | 'published') => {
    if (!generatedArticle || !auth.currentUser) return;
    setIsSaving(true);
    setError(null);
    try {
      let publishedUrl = null;

      if (status === 'published') {
        // Publish immediately via API
        const response = await fetch('/api/publish-now', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: auth.currentUser.uid,
            blogId: selectedBlog,
            title: generatedArticle.title,
            content: generatedArticle.content
          })
        });
        
        if (!response.ok) {
          throw new Error("Failed to publish to Blogger");
        }

        const data = await response.json();
        publishedUrl = data.post?.url;
      }

      const path = "articles";
      try {
        await addDoc(collection(db, path), {
          title: generatedArticle.title,
          content: generatedArticle.content,
          keywords: keywords.split(",").map(k => k.trim()),
          status,
          scheduledAt: status === 'scheduled' ? scheduleDate : null,
          publishedAt: status === 'published' ? new Date().toISOString() : null,
          publishedUrl,
          blogId: selectedBlog,
          ownerUid: auth.currentUser.uid,
          createdAt: new Date().toISOString()
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, path);
      }
      setSuccess(true);
      setGeneratedArticle(null);
      setPrompt("");
      setKeywords("");
    } catch (error) {
      console.error("Error saving article:", error);
      setError(t('error.publishFailed') || "Failed to publish article. Please check your Blogger connection.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('generate.title')}</h2>
        <p className="text-muted-foreground">{t('generate.description')}</p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>{t('generate.settings')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('generate.selectBlog')}</label>
              <select 
                className="w-full p-2 border rounded-md bg-background"
                value={selectedBlog}
                onChange={(e) => setSelectedBlog(e.target.value)}
              >
                {blogs.map(blog => (
                  <option key={blog.id} value={blog.id}>{blog.title}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('generate.keywords')}</label>
              <input 
                className="w-full p-2 border rounded-md bg-background"
                placeholder="SEO, AI, Marketing"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('generate.scheduleDate')}</label>
              <input 
                type="datetime-local"
                className="w-full p-2 border rounded-md bg-background"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t('generate.promptTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea 
              className="w-full min-h-[150px] p-4 border rounded-md bg-background resize-none"
              placeholder={t('generate.promptPlaceholder')}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Button 
              className="w-full" 
              onClick={handleGenerate} 
              disabled={isGenerating || !prompt}
            >
              {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
              {t('generate.generateBtn')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5" />
          <span>{t('generate.success')}</span>
        </div>
      )}

      {generatedArticle && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-xl">{generatedArticle.title}</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => handleSave('draft')} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {t('generate.saveDraft')}
              </Button>
              <Button variant="secondary" onClick={() => handleSave('scheduled')} disabled={isSaving || !scheduleDate}>
                <Calendar className="h-4 w-4 mr-2" />
                {t('generate.schedule')}
              </Button>
              <Button onClick={() => handleSave('published')} disabled={isSaving}>
                {t('generate.publishNow')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none border-t pt-6">
            <div dangerouslySetInnerHTML={{ __html: generatedArticle.content }} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
