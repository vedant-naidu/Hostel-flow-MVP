import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AuthPage } from "@/pages/AuthPage";
import { StudentDashboardPage } from "@/pages/StudentDashboard";
import { WardenDashboardPage } from "@/pages/WardenDashboard";
import { SecurityDashboardPage } from "@/pages/SecurityDashboard";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { role, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  const getRoleBasedRedirect = () => {
    switch (role) {
      case 'student': return '/student';
      case 'warden': return '/warden';
      case 'security': return '/security';
      default: return '/auth';
    }
  };

  return (
    <Routes>
      {role === 'student' && <Route path="/student/*" element={<StudentDashboardPage />} />}
      {role === 'warden' && <Route path="/warden/*" element={<WardenDashboardPage />} />}
      {role === 'security' && <Route path="/security" element={<SecurityDashboardPage />} />}
      <Route path="*" element={<Navigate to={getRoleBasedRedirect()} replace />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
