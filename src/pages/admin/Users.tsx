import { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { auth, db } from "../../firebase";
import { collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Loader2, Trash2, Shield, User } from "lucide-react";
import { format } from "date-fns";

interface UserProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  createdAt?: string;
}

export default function AdminUsers() {
  const { language } = useLanguage();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد أنك تريد حذف هذا المستخدم؟' : 'Are you sure you want to delete this user?')) return;
    try {
      await deleteDoc(doc(db, "users", id));
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      await updateDoc(doc(db, "users", id), { role: newRole });
      await fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {language === 'ar' ? 'المستخدمين' : 'Users'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'ar' ? 'إدارة حسابات المستخدمين' : 'Manage user accounts'}
        </p>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">{user.firstName} {user.lastName}</CardTitle>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {language === 'ar' ? 'تاريخ التسجيل: ' : 'Joined: '}
                    {user.createdAt ? format(new Date(user.createdAt), "PPP") : 'N/A'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium px-2 py-1 bg-muted rounded-full capitalize">
                  {user.role || 'user'}
                </span>
                {user.role !== 'admin' && (
                  <Button variant="outline" size="sm" onClick={() => handleRoleChange(user.id, 'admin')}>
                    <Shield className="mr-2 h-4 w-4" />
                    {language === 'ar' ? 'ترقية لمدير' : 'Make Admin'}
                  </Button>
                )}
                {user.role === 'admin' && (
                  <Button variant="outline" size="sm" onClick={() => handleRoleChange(user.id, 'user')}>
                    <User className="mr-2 h-4 w-4" />
                    {language === 'ar' ? 'إزالة الصلاحيات' : 'Remove Admin'}
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
