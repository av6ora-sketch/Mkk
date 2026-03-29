/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Loader2 } from "lucide-react";

// Layouts
import MainLayout from "./components/layout/MainLayout";
import DashboardLayout from "./components/layout/DashboardLayout";

// Lazy Loaded Pages
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));

// Lazy Loaded Dashboard Pages
const DashboardOverview = lazy(() => import("./pages/dashboard/Overview"));
const DashboardBlogs = lazy(() => import("./pages/dashboard/Blogs"));
const DashboardGenerate = lazy(() => import("./pages/dashboard/Generate"));
const DashboardArticles = lazy(() => import("./pages/dashboard/Articles"));
const DashboardSettings = lazy(() => import("./pages/dashboard/Settings"));
const DashboardMedia = lazy(() => import("./pages/dashboard/Media"));
const DashboardAccount = lazy(() => import("./pages/dashboard/MyAccount"));
const DashboardSubscriptions = lazy(() => import("./pages/dashboard/Subscriptions"));
const DashboardSupport = lazy(() => import("./pages/dashboard/Support"));

// Lazy Loaded Admin Pages
const AdminLayout = lazy(() => import("./components/layout/AdminLayout"));
const AdminOverview = lazy(() => import("./pages/admin/Overview"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminStores = lazy(() => import("./pages/admin/Stores"));
const AdminReports = lazy(() => import("./pages/admin/Reports"));
const AdminSupport = lazy(() => import("./pages/admin/Support"));
const AdminRoles = lazy(() => import("./pages/admin/Roles"));
const AdminProfile = lazy(() => import("./pages/admin/Profile"));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
            </Route>
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* User Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardOverview />} />
              <Route path="blogs" element={<DashboardBlogs />} />
              <Route path="generate" element={<DashboardGenerate />} />
              <Route path="articles" element={<DashboardArticles />} />
              <Route path="settings" element={<DashboardSettings />} />
              <Route path="media" element={<DashboardMedia />} />
              <Route path="account" element={<DashboardAccount />} />
              <Route path="subscriptions" element={<DashboardSubscriptions />} />
              <Route path="support" element={<DashboardSupport />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="stores" element={<AdminStores />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="support" element={<AdminSupport />} />
              <Route path="roles" element={<AdminRoles />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </LanguageProvider>
  );
}
