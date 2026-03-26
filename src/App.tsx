/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import MainLayout from "./components/layout/MainLayout";
import DashboardLayout from "./components/layout/DashboardLayout";
import AdminLayout from "./components/layout/AdminLayout";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

// Dashboard Pages
import DashboardOverview from "./pages/dashboard/Overview";
import DashboardStores from "./pages/dashboard/Stores";
import StoreDetails from "./pages/dashboard/StoreDetails";
import DashboardAnalytics from "./pages/dashboard/Analytics";
import DashboardReports from "./pages/dashboard/Reports";
import DashboardPlans from "./pages/dashboard/Plans";
import DashboardProfile from "./pages/dashboard/Profile";
import DashboardSupport from "./pages/dashboard/Support";

// Admin Pages
import AdminOverview from "./pages/admin/Overview";
import AdminUsers from "./pages/admin/Users";
import AdminStores from "./pages/admin/Stores";
import AdminReports from "./pages/admin/Reports";
import AdminProfile from "./pages/admin/Profile";

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
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
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
