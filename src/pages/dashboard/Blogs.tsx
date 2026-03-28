import { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { auth, db } from "../../firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Loader2, ExternalLink, RefreshCw, Plus } from "lucide-react";

interface Blog {
  id: string;
  title: string;
  url: string;
}

export default function Blogs() {
  const { t } = useLanguage();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  const fetchBlogs = async () => {
    if (!auth.currentUser) return;
    setIsLoading(true);
    try {
      const q = query(collection(db, "blogs"), where("ownerUid", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const blogsData = querySnapshot.docs.map(doc => doc.data() as Blog);
      setBlogs(blogsData);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();

    // Listen for OAuth success message
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        fetchBlogs();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleConnect = async () => {
    if (!auth.currentUser) return;
    setIsConnecting(true);
    try {
      const response = await fetch('/api/auth/url');
      const { url } = await response.json();
      
      // Open OAuth popup with userId in state
      const authUrl = `${url}&state=${auth.currentUser.uid}`;
      window.open(authUrl, 'blogger_auth', 'width=600,height=700');
    } catch (error) {
      console.error("Error starting OAuth:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const syncBlogs = async () => {
    if (!auth.currentUser) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/blogs?userId=${auth.currentUser.uid}`);
      const remoteBlogs = await response.json();
      
      if (Array.isArray(remoteBlogs)) {
        // Save new blogs to Firestore
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
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('sidebar.blogs')}</h2>
          <p className="text-muted-foreground">Manage your connected Blogger blogs.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={syncBlogs} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Sync Blogs
          </Button>
          <Button onClick={handleConnect} disabled={isConnecting}>
            {isConnecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Connect Blogger
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : blogs.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <Card key={blog.id}>
              <CardHeader>
                <CardTitle>{blog.title}</CardTitle>
                <CardDescription className="truncate">{blog.url}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" size="sm" className="w-full" asChild>
                  <a href={blog.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Blog
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Store className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No blogs connected</h3>
            <p className="text-muted-foreground mb-6">Connect your Blogger account to start generating and scheduling articles.</p>
            <Button onClick={handleConnect}>Connect Blogger</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper for cn
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

// Mock Store icon if not imported
function Store(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 7h20" />
      <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
    </svg>
  );
}
