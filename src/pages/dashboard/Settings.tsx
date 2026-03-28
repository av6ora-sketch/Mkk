import { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { auth, db } from "../../firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Loader2, ShieldCheck, ShieldAlert, LogOut } from "lucide-react";

export default function Settings() {
  const { t } = useLanguage();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      if (!auth.currentUser) return;
      try {
        const settingsSnap = await getDoc(doc(db, "settings", auth.currentUser.uid));
        setIsConnected(!!settingsSnap.data()?.bloggerTokens);
      } catch (error) {
        console.error("Error checking Blogger status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkStatus();
  }, []);

  const handleDisconnect = async () => {
    if (!auth.currentUser || !window.confirm("Are you sure you want to disconnect your Blogger account?")) return;
    setIsLoading(true);
    try {
      await deleteDoc(doc(db, "settings", auth.currentUser.uid));
      setIsConnected(false);
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

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('sidebar.settings')}</h2>
        <p className="text-muted-foreground">Manage your Blogger AI Article Scheduler settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blogger Connection</CardTitle>
          <CardDescription>Connect your Blogger account to enable article scheduling and publishing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              {isConnected ? (
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-green-600" />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <ShieldAlert className="h-6 w-6 text-red-600" />
                </div>
              )}
              <div>
                <p className="font-medium">{isConnected ? "Connected to Blogger" : "Not Connected"}</p>
                <p className="text-sm text-muted-foreground">
                  {isConnected ? "Your account is ready for publishing." : "Connect your account to start publishing."}
                </p>
              </div>
            </div>
            {isConnected ? (
              <Button variant="outline" size="sm" onClick={handleDisconnect} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4 mr-2" />}
                Disconnect
              </Button>
            ) : (
              <Button size="sm" onClick={handleConnect}>Connect Blogger</Button>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Permissions</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Read your Blogger blogs and posts</li>
              <li>Create and publish new posts</li>
              <li>Manage your Blogger account settings</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
