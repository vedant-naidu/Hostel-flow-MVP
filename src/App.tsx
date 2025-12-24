import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { RoleSelector } from "@/components/RoleSelector";
import { StudentDashboardPage } from "@/pages/StudentDashboard";
import { WardenDashboardPage } from "@/pages/WardenDashboard";
import { SecurityDashboardPage } from "@/pages/SecurityDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <RoleSelector />;
  }

  // Redirect based on role - always redirect to the correct dashboard
  const getRoleBasedRedirect = () => {
    switch (user?.role) {
      case 'student':
        return '/student';
      case 'warden':
        return '/warden';
      case 'security':
        return '/security';
      default:
        return '/';
    }
  };

  return (
    <Routes>
      {user?.role === 'student' && (
        <Route path="/student/*" element={<StudentDashboardPage />} />
      )}
      {user?.role === 'warden' && (
        <Route path="/warden/*" element={<WardenDashboardPage />} />
      )}
      {user?.role === 'security' && (
        <Route path="/security" element={<SecurityDashboardPage />} />
      )}
      {/* Catch-all: redirect to the appropriate dashboard based on role */}
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
