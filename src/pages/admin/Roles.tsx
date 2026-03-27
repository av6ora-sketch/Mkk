import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Shield, Plus, Edit, Trash2, Loader2, Check } from "lucide-react";
import { db, auth } from "@/src/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { useLanguage } from "../../contexts/LanguageContext";
import { handleFirestoreError, OperationType } from "@/src/lib/firestore-error";

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: {
    manage_users: boolean;
    manage_stores: boolean;
    manage_support: boolean;
    view_reports: boolean;
    manage_roles: boolean;
  };
  createdAt: any;
}

const defaultPermissions = {
  manage_users: false,
  manage_stores: false,
  manage_support: false,
  view_reports: false,
  manage_roles: false,
};

export default function AdminRoles() {
  const { language } = useLanguage();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Form State
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [permissions, setPermissions] = useState(defaultPermissions);

  const fetchRoles = async () => {
    if (!auth.currentUser) return;
    try {
      const querySnapshot = await getDocs(collection(db, "roles"));
      const rolesData: Role[] = [];
      querySnapshot.forEach((doc) => {
        rolesData.push({ id: doc.id, ...doc.data() } as Role);
      });
      setRoles(rolesData);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleOpenModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setRoleName(role.name);
      setRoleDescription(role.description || "");
      setPermissions(role.permissions || defaultPermissions);
    } else {
      setEditingRole(null);
      setRoleName("");
      setRoleDescription("");
      setPermissions(defaultPermissions);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
  };

  const handleTogglePermission = (key: keyof typeof defaultPermissions) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;

    setActionLoading(true);
    try {
      const roleData = {
        name: roleName.trim(),
        description: roleDescription.trim(),
        permissions,
      };

      if (editingRole) {
        await setDoc(doc(db, "roles", editingRole.id), roleData, { merge: true });
        setRoles(roles.map(r => r.id === editingRole.id ? { ...r, ...roleData } : r));
      } else {
        const newRoleRef = doc(collection(db, "roles"));
        const newRole = {
          ...roleData,
          createdAt: serverTimestamp(),
        };
        await setDoc(newRoleRef, newRole);
        setRoles([...roles, { id: newRoleRef.id, ...newRole } as Role]);
      }
      handleCloseModal();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, editingRole ? `roles/${editingRole.id}` : "roles");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا الدور؟' : 'Are you sure you want to delete this role?')) return;
    
    try {
      await deleteDoc(doc(db, "roles", roleId));
      setRoles(roles.filter(r => r.id !== roleId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `roles/${roleId}`);
    }
  };

  const permissionLabels: Record<keyof typeof defaultPermissions, { ar: string, en: string }> = {
    manage_users: { ar: 'إدارة المستخدمين', en: 'Manage Users' },
    manage_stores: { ar: 'إدارة المتاجر', en: 'Manage Stores' },
    manage_support: { ar: 'إدارة الدعم الفني', en: 'Manage Support' },
    view_reports: { ar: 'عرض التقارير', en: 'View Reports' },
    manage_roles: { ar: 'إدارة الأدوار والصلاحيات', en: 'Manage Roles' },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            {language === 'ar' ? 'الأدوار والصلاحيات' : 'Roles & Permissions'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'ar' ? 'إدارة أدوار المستخدمين وتحديد صلاحيات كل دور.' : 'Manage user roles and define permissions for each role.'}
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="h-4 w-4" />
          {language === 'ar' ? 'إضافة دور جديد' : 'Add New Role'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <Card key={role.id} className="flex flex-col">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{role.name}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenModal(role)}>
                    <Edit className="h-4 w-4 text-primary" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteRole(role.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {role.description && (
                <CardDescription className="mt-1">{role.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="pt-4 flex-1">
              <h4 className="text-sm font-semibold mb-3">{language === 'ar' ? 'الصلاحيات الممنوحة:' : 'Granted Permissions:'}</h4>
              <ul className="space-y-2">
                {Object.entries(role.permissions || {}).map(([key, value]) => {
                  if (!value) return null;
                  const permKey = key as keyof typeof defaultPermissions;
                  return (
                    <li key={key} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-green-500" />
                      {permissionLabels[permKey]?.[language === 'ar' ? 'ar' : 'en'] || key}
                    </li>
                  );
                })}
                {!Object.values(role.permissions || {}).some(Boolean) && (
                  <li className="text-sm text-muted-foreground italic">
                    {language === 'ar' ? 'لا توجد صلاحيات' : 'No permissions granted'}
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        ))}
        {roles.length === 0 && (
          <div className="col-span-full text-center py-12 border border-dashed border-border rounded-lg bg-muted/10">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium mb-1">{language === 'ar' ? 'لا توجد أدوار' : 'No Roles'}</h3>
            <p className="text-muted-foreground text-sm">{language === 'ar' ? 'قم بإنشاء دور جديد للبدء.' : 'Create a new role to get started.'}</p>
          </div>
        )}
      </div>

      {/* Role Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="font-semibold text-lg">
                {editingRole 
                  ? (language === 'ar' ? 'تعديل الدور' : 'Edit Role') 
                  : (language === 'ar' ? 'إضافة دور جديد' : 'Add New Role')}
              </h3>
            </div>
            
            <form onSubmit={handleSaveRole} className="p-4 overflow-y-auto flex-1">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{language === 'ar' ? 'اسم الدور' : 'Role Name'}</label>
                  <Input 
                    value={roleName} 
                    onChange={(e) => setRoleName(e.target.value)} 
                    placeholder={language === 'ar' ? 'مثال: مدير دعم فني' : 'e.g. Support Manager'}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{language === 'ar' ? 'الوصف (اختياري)' : 'Description (Optional)'}</label>
                  <Input 
                    value={roleDescription} 
                    onChange={(e) => setRoleDescription(e.target.value)} 
                    placeholder={language === 'ar' ? 'وصف قصير لصلاحيات هذا الدور' : 'Short description of this role'}
                  />
                </div>
                
                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium mb-3">{language === 'ar' ? 'الصلاحيات' : 'Permissions'}</h4>
                  <div className="space-y-3">
                    {Object.keys(defaultPermissions).map((key) => {
                      const permKey = key as keyof typeof defaultPermissions;
                      return (
                        <label key={key} className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-muted/50 transition-colors">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={permissions[permKey]}
                            onChange={() => handleTogglePermission(permKey)}
                          />
                          <span className="text-sm">{permissionLabels[permKey]?.[language === 'ar' ? 'ar' : 'en']}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <Button type="submit" className="flex-1" disabled={actionLoading}>
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {language === 'ar' ? 'حفظ' : 'Save'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1" disabled={actionLoading}>
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
