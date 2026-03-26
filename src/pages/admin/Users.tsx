import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Search, Edit, CheckCircle2, Loader2 } from "lucide-react";
import { db } from "@/src/firebase";
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";
import { useLanguage } from "../../contexts/LanguageContext";

type User = {
  id: string;
  name: string;
  email: string;
  plan: string;
  stores: number;
  status: string;
  uid: string;
};

import { handleFirestoreError, OperationType } from "@/src/lib/firestore-error";

export default function AdminUsers() {
  const { language } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newPlan, setNewPlan] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const usersData: User[] = [];
        
        for (const userDoc of usersSnap.docs) {
          const userData = userDoc.data();
          
          // Count stores for this user
          const qStores = query(collection(db, "stores"), where("uid", "==", userData.uid));
          const storesSnap = await getDocs(qStores);
          
          usersData.push({
            id: userDoc.id,
            uid: userData.uid,
            name: userData.firstName ? `${userData.firstName} ${userData.lastName || ''}` : (language === 'ar' ? 'مستخدم' : 'User'),
            email: userData.email,
            plan: userData.plan || (language === 'ar' ? 'الأساسية' : 'Basic'),
            stores: storesSnap.size,
            status: language === 'ar' ? 'نشط' : 'Active', // Assuming active if they exist
          });
        }
        
        setUsers(usersData);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, "users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [language]);

  const handleUpdatePlan = async () => {
    if (editingUser && newPlan) {
      try {
        await updateDoc(doc(db, "users", editingUser.id), {
          plan: newPlan
        });
        
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, plan: newPlan } : u));
        setSuccessMsg(language === 'ar' ? `تم ترقية خطة ${editingUser.name} إلى ${newPlan} بنجاح.` : `Successfully updated ${editingUser.name}'s plan to ${newPlan}.`);
        setEditingUser(null);
        setTimeout(() => setSuccessMsg(""), 3000);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, "users");
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{language === 'ar' ? 'إدارة المستخدمين' : 'User Management'}</h2>
          <p className="text-muted-foreground">{language === 'ar' ? 'عرض وتعديل بيانات مستخدمي المنصة.' : 'View and edit platform users data.'}</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-2.5 h-4 w-4 text-muted-foreground`} />
          <Input 
            placeholder={language === 'ar' ? "بحث عن مستخدم..." : "Search for a user..."} 
            className={language === 'ar' ? "pr-10" : "pl-10"} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-800">
          <CheckCircle2 className="h-5 w-5" />
          <p className="font-semibold">{successMsg}</p>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className={`w-full text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="p-4 font-medium">{language === 'ar' ? 'الاسم' : 'Name'}</th>
                  <th className="p-4 font-medium">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</th>
                  <th className="p-4 font-medium">{language === 'ar' ? 'الخطة الحالية' : 'Current Plan'}</th>
                  <th className="p-4 font-medium">{language === 'ar' ? 'المتاجر' : 'Stores'}</th>
                  <th className="p-4 font-medium">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className={`p-4 font-medium ${language === 'ar' ? 'text-left' : 'text-right'}`}>{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      {language === 'ar' ? 'لم يتم العثور على مستخدمين.' : 'No users found.'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-medium">{user.name}</td>
                      <td className={`p-4 text-muted-foreground dir-ltr ${language === 'ar' ? 'text-right' : 'text-left'}`}>{user.email}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {user.plan}
                        </span>
                      </td>
                      <td className="p-4">{user.stores}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'نشط' || user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className={`p-4 ${language === 'ar' ? 'text-left' : 'text-right'}`}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => { setEditingUser(user); setNewPlan(user.plan); }}
                          className="h-8 px-2 text-primary"
                        >
                          <Edit className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                          {language === 'ar' ? 'تعديل الخطة' : 'Edit Plan'}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'تعديل خطة المستخدم' : 'Edit User Plan'}</CardTitle>
              <CardDescription>{language === 'ar' ? `تغيير الخطة الخاصة بـ ${editingUser.name}` : `Change plan for ${editingUser.name}`}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{language === 'ar' ? 'الخطة الجديدة' : 'New Plan'}</label>
                <select 
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                >
                  <option value="الأساسية">{language === 'ar' ? 'الأساسية' : 'Basic'}</option>
                  <option value="الاحترافية">{language === 'ar' ? 'الاحترافية' : 'Pro'}</option>
                  <option value="المؤسسات">{language === 'ar' ? 'المؤسسات' : 'Enterprise'}</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setEditingUser(null)}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
                <Button onClick={handleUpdatePlan}>{language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
