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

  return (
    <Routes>
      {user?.role === 'student' && (
        <>
          <Route path="/student/*" element={<StudentDashboardPage />} />
          <Route path="/" element={<Navigate to="/student" replace />} />
        </>
      )}
      {user?.role === 'warden' && (
        <>
          <Route path="/warden/*" element={<WardenDashboardPage />} />
          <Route path="/" element={<Navigate to="/warden" replace />} />
        </>
      )}
      {user?.role === 'security' && (
        <>
          <Route path="/security" element={<SecurityDashboardPage />} />
          <Route path="/" element={<Navigate to="/security" replace />} />
        </>
      )}
      <Route path="*" element={<NotFound />} />
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
