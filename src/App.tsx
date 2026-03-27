/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Loader2 } from "lucide-react";

// Layouts (Keep these static to prevent layout shift)
import MainLayout from "./components/layout/MainLayout";
import DashboardLayout from "./components/layout/DashboardLayout";
import AdminLayout from "./components/layout/AdminLayout";

// Lazy Loaded Pages
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));

// Lazy Loaded Dashboard Pages
const DashboardOverview = lazy(() => import("./pages/dashboard/Overview"));
const DashboardStores = lazy(() => import("./pages/dashboard/Stores"));
const StoreDetails = lazy(() => import("./pages/dashboard/StoreDetails"));
const DashboardAnalytics = lazy(() => import("./pages/dashboard/Analytics"));
const DashboardReports = lazy(() => import("./pages/dashboard/Reports"));
const DashboardPlans = lazy(() => import("./pages/dashboard/Plans"));
const DashboardProfile = lazy(() => import("./pages/dashboard/Profile"));
const DashboardSupport = lazy(() => import("./pages/dashboard/Support"));

// Lazy Loaded Admin Pages
const AdminOverview = lazy(() => import("./pages/admin/Overview"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminStores = lazy(() => import("./pages/admin/Stores"));
const AdminReports = lazy(() => import("./pages/admin/Reports"));
const AdminProfile = lazy(() => import("./pages/admin/Profile"));
const AdminSupport = lazy(() => import("./pages/admin/Support"));

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
              <Route path="privacy" element={<Privacy />} />
              <Route path="terms" element={<Terms />} />
            </Route>
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* User Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardOverview />} />
              <Route path="stores" element={<DashboardStores />} />
              <Route path="stores/:storeId" element={<StoreDetails />} />
              <Route path="analytics" element={<DashboardAnalytics />} />
              <Route path="reports" element={<DashboardReports />} />
              <Route path="plans" element={<DashboardPlans />} />
              <Route path="profile" element={<DashboardProfile />} />
              <Route path="support" element={<DashboardSupport />} />
            </Route>

            {/* Admin Dashboard Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="stores" element={<AdminStores />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="support" element={<AdminSupport />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </LanguageProvider>
  );
}
