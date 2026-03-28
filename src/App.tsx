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
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </LanguageProvider>
  );
}
