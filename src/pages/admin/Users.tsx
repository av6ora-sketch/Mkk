import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Search, Edit, CheckCircle2, Loader2, Trash2, Ban } from "lucide-react";
import { db } from "@/src/firebase";
import { collection, getDocs, doc, updateDoc, query, where, deleteDoc } from "firebase/firestore";
import { useLanguage } from "../../contexts/LanguageContext";

type User = {
  id: string;
  name: string;
  email: string;
  plan: string;
  stores: number;
  status: string;
  uid: string;
  isBanned?: boolean;
  roleId?: string;
  roleName?: string;
};

interface Role {
  id: string;
  name: string;
  permissions: any;
}

import { handleFirestoreError, OperationType } from "@/src/lib/firestore-error";

export default function AdminUsers() {
  const { language } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newPlan, setNewPlan] = useState("");
  const [newRoleId, setNewRoleId] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
          status: userData.isBanned ? (language === 'ar' ? 'محظور' : 'Banned') : (language === 'ar' ? 'نشط' : 'Active'),
          isBanned: userData.isBanned,
          roleId: userData.roleId,
          roleName: userData.roleName,
        });
      }
      
      setUsers(usersData);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "users");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const rolesSnap = await getDocs(collection(db, "roles"));
      const rolesData: Role[] = [];
      rolesSnap.forEach(doc => {
        rolesData.push({ id: doc.id, ...doc.data() } as Role);
      });
      setRoles(rolesData);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [language]);

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm(language === 'ar' ? 'تحذير: هل أنت متأكد من حذف هذا المستخدم نهائياً؟ هذا الإجراء لا يمكن التراجع عنه وسيحذف جميع بيانات المستخدم.' : 'WARNING: Are you sure you want to permanently delete this user? This action cannot be undone and will delete all user data.')) return;
    
    setActionLoading(userId);
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers(users.filter(user => user.id !== userId));
      setSuccessMsg(language === 'ar' ? 'تم حذف المستخدم بنجاح.' : 'User successfully deleted.');
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBanUser = async (userId: string, currentBanStatus: boolean | undefined) => {
    const isBanned = !currentBanStatus;
    if (!window.confirm(language === 'ar' ? `هل أنت متأكد من ${isBanned ? 'حظر' : 'إلغاء حظر'} هذا المستخدم؟` : `Are you sure you want to ${isBanned ? 'ban' : 'unban'} this user?`)) return;
    
    setActionLoading(userId);
    try {
      await updateDoc(doc(db, "users", userId), {
        isBanned: isBanned
      });
      setUsers(users.map(user => user.id === userId ? { 
        ...user, 
        isBanned, 
        status: isBanned ? (language === 'ar' ? 'محظور' : 'Banned') : (language === 'ar' ? 'نشط' : 'Active') 
      } : user));
      setSuccessMsg(language === 'ar' ? `تم ${isBanned ? 'حظر' : 'إلغاء حظر'} المستخدم بنجاح.` : `User successfully ${isBanned ? 'banned' : 'unbanned'}.`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateUser = async () => {
    if (editingUser) {
      setActionLoading('update');
      try {
        const updateData: any = { plan: newPlan };
        let updatedRoleName = editingUser.roleName;

        if (newRoleId) {
          if (newRoleId === 'none') {
            updateData.roleId = null;
            updateData.roleName = null;
            updateData.permissions = null;
            updateData.role = 'user';
            updatedRoleName = undefined;
          } else {
            const selectedRole = roles.find(r => r.id === newRoleId);
            if (selectedRole) {
              updateData.roleId = selectedRole.id;
              updateData.roleName = selectedRole.name;
              updateData.permissions = selectedRole.permissions;
              updateData.role = 'admin'; // Grant base admin access to see the dashboard
              updatedRoleName = selectedRole.name;
            }
          }
        }

        await updateDoc(doc(db, "users", editingUser.id), updateData);
        
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, plan: newPlan, roleId: newRoleId === 'none' ? undefined : newRoleId, roleName: updatedRoleName } : u));
        setSuccessMsg(language === 'ar' ? 'تم تحديث بيانات المستخدم بنجاح.' : 'User data updated successfully.');
        setEditingUser(null);
        setTimeout(() => setSuccessMsg(""), 3000);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${editingUser.id}`);
      } finally {
        setActionLoading(null);
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
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          {user.roleName && (
                            <span className="text-xs text-primary font-medium mt-0.5">{user.roleName}</span>
                          )}
                        </div>
                      </td>
                      <td className={`p-4 text-muted-foreground dir-ltr ${language === 'ar' ? 'text-right' : 'text-left'}`}>{user.email}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {user.plan}
                        </span>
                      </td>
                      <td className="p-4">{user.stores}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isBanned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className={`p-4 ${language === 'ar' ? 'text-left' : 'text-right'}`}>
                        <div className={`flex items-center justify-end gap-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => { setEditingUser(user); setNewPlan(user.plan); setNewRoleId(user.roleId || 'none'); }}
                            className="h-8 w-8 p-0 text-primary"
                            title={language === 'ar' ? 'تعديل المستخدم' : 'Edit User'}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleBanUser(user.id, user.isBanned)}
                            disabled={actionLoading === user.id}
                            className={`h-8 w-8 p-0 ${user.isBanned ? 'text-green-600' : 'text-yellow-600'}`}
                            title={user.isBanned ? (language === 'ar' ? 'إلغاء الحظر' : 'Unban') : (language === 'ar' ? 'حظر' : 'Ban')}
                          >
                            {actionLoading === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : (user.isBanned ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />)}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={actionLoading === user.id}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title={language === 'ar' ? 'حذف المستخدم' : 'Delete User'}
                          >
                            {actionLoading === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </div>
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
              <CardTitle>{language === 'ar' ? 'تعديل بيانات المستخدم' : 'Edit User Data'}</CardTitle>
              <CardDescription>{language === 'ar' ? `تعديل بيانات ${editingUser.name}` : `Edit data for ${editingUser.name}`}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{language === 'ar' ? 'الخطة' : 'Plan'}</label>
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
              <div className="space-y-2">
                <label className="text-sm font-medium">{language === 'ar' ? 'الدور والصلاحيات' : 'Role & Permissions'}</label>
                <select 
                  value={newRoleId}
                  onChange={(e) => setNewRoleId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                >
                  <option value="none">{language === 'ar' ? 'مستخدم عادي (بدون صلاحيات إدارة)' : 'Regular User (No Admin Access)'}</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'ar' 
                    ? 'تعيين دور للمستخدم سيمنحه صلاحيات الدخول للوحة الإدارة حسب الصلاحيات المحددة في الدور.' 
                    : 'Assigning a role will grant the user access to the admin panel based on the role\'s permissions.'}
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setEditingUser(null)} disabled={actionLoading === 'update'}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
                <Button onClick={handleUpdateUser} disabled={actionLoading === 'update'}>
                  {actionLoading === 'update' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
