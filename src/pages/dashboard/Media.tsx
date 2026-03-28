import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { auth, db, storage } from "../../firebase";
import { collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { Button } from "../../components/ui/button";
import { Image as ImageIcon, Upload, Trash2, Loader2, Copy, Check } from "lucide-react";

interface MediaItem {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  createdAt: string;
  path: string;
}

export default function Media() {
  const { t } = useLanguage();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "media"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mediaData: MediaItem[] = [];
      snapshot.forEach((doc) => {
        mediaData.push({ id: doc.id, ...doc.data() } as MediaItem);
      });
      setMedia(mediaData);
    });

    return () => unsubscribe();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    setIsUploading(true);
    setUploadProgress(0);

    const storagePath = `users/${auth.currentUser.uid}/media/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
        setIsUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        await addDoc(collection(db, "media"), {
          userId: auth.currentUser!.uid,
          url: downloadURL,
          name: file.name,
          size: file.size,
          type: file.type,
          path: storagePath,
          createdAt: new Date().toISOString()
        });
        
        setIsUploading(false);
        setUploadProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    );
  };

  const handleDelete = async (item: MediaItem) => {
    if (!confirm(t('media.confirmDelete'))) return;
    
    try {
      // Delete from Storage
      const storageRef = ref(storage, item.path);
      await deleteObject(storageRef);
      
      // Delete from Firestore
      await deleteDoc(doc(db, "media", item.id));
    } catch (error) {
      console.error("Error deleting media:", error);
    }
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('media.title')}</h2>
          <p className="text-muted-foreground">{t('media.description')}</p>
        </div>
        
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {isUploading ? `${t('media.uploading')} ${Math.round(uploadProgress)}%` : t('media.uploadImage')}
          </Button>
        </div>
      </div>
      
      {media.length === 0 && !isUploading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-dashed rounded-xl text-center px-4">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <ImageIcon className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('media.emptyTitle')}</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-6">
            {t('media.emptyDesc')}
          </p>
          <Button onClick={() => fileInputRef.current?.click()} variant="outline">
            {t('media.uploadFirst')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {media.map((item) => (
            <div key={item.id} className="group relative bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="aspect-square bg-muted relative">
                <img 
                  src={item.url} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="h-8 w-8 rounded-full"
                    onClick={() => copyToClipboard(item.url, item.id)}
                    title="Copy URL"
                  >
                    {copiedId === item.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button 
                    size="icon" 
                    variant="destructive" 
                    className="h-8 w-8 rounded-full"
                    onClick={() => handleDelete(item)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium truncate" title={item.name}>{item.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatBytes(item.size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
