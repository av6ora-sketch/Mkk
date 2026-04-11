import { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { auth, db } from "../../firebase";
import { collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Loader2, Trash2, Shield, User, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { handleFirestoreError, OperationType } from "../../lib/firestore-error";

interface UserProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  createdAt?: string;
}

export default function AdminUsers() {
  const { language, t } = useLanguage();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const path = "users";
      const q = query(collection(db, path), orderBy("createdAt", "desc"));
      let querySnapshot;
      try {
        querySnapshot = await getDocs(q);
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, path);
        return;
      }
      const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUsers();
      } else {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const path = "users";
      try {
        await deleteDoc(doc(db, path, deleteId));
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `${path}/${deleteId}`);
        return;
      }
      setDeleteId(null);
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      const path = "users";
      try {
        await updateDoc(doc(db, path, id), { role: newRole });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `${path}/${id}`);
        return;
      }
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
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(user.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-lg animate-in fade-in zoom-in duration-200">
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl">
                {language === 'ar' ? 'تأكيد الحذف' : 'Confirm Deletion'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-center text-muted-foreground">
                {language === 'ar' 
                  ? 'هل أنت متأكد أنك تريد حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.' 
                  : 'Are you sure you want to delete this user? This action cannot be undone.'}
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
