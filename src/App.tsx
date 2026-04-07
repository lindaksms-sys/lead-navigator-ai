import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import LeadsDashboard from "./pages/LeadsDashboard.tsx";
import LeadIntake from "./pages/LeadIntake.tsx";
import NotificationSettings from "./pages/NotificationSettings.tsx";
import SchedulingSettings from "./pages/SchedulingSettings.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import ClientLogin from "./pages/client/ClientLogin.tsx";
import ClientForgotPassword from "./pages/client/ClientForgotPassword.tsx";
import ClientDashboard from "./pages/client/ClientDashboard.tsx";
import ClientLeads from "./pages/client/ClientLeads.tsx";
import ClientCalls from "./pages/client/ClientCalls.tsx";
import ClientAppointments from "./pages/client/ClientAppointments.tsx";
import ClientSettingsPage from "./pages/client/ClientSettingsPage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/leads" element={<LeadsDashboard />} />
            <Route path="/leads/new" element={<LeadIntake />} />
            <Route path="/settings/notifications" element={<NotificationSettings />} />
            <Route path="/settings/scheduling" element={<SchedulingSettings />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Client auth */}
            <Route path="/client/login" element={<ClientLogin />} />
            <Route path="/client/forgot-password" element={<ClientForgotPassword />} />

            {/* Protected client routes */}
            <Route path="/client/dashboard" element={<ProtectedRoute allowedRoles={["client_admin", "client_viewer", "admin"]}><ClientDashboard /></ProtectedRoute>} />
            <Route path="/client/leads" element={<ProtectedRoute allowedRoles={["client_admin", "client_viewer", "admin"]}><ClientLeads /></ProtectedRoute>} />
            <Route path="/client/calls" element={<ProtectedRoute allowedRoles={["client_admin", "client_viewer", "admin"]}><ClientCalls /></ProtectedRoute>} />
            <Route path="/client/appointments" element={<ProtectedRoute allowedRoles={["client_admin", "client_viewer", "admin"]}><ClientAppointments /></ProtectedRoute>} />
            <Route path="/client/settings" element={<ProtectedRoute allowedRoles={["client_admin", "admin"]}><ClientSettingsPage /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
