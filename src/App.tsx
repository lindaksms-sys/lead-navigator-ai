import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { DemoModeProvider } from "@/contexts/DemoModeContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import LeadsDashboard from "./pages/LeadsDashboard.tsx";
import LeadIntake from "./pages/LeadIntake.tsx";
import NotificationSettings from "./pages/NotificationSettings.tsx";
import SchedulingSettings from "./pages/SchedulingSettings.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Apply from "./pages/Apply.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import ClientLogin from "./pages/client/ClientLogin.tsx";
import ClientForgotPassword from "./pages/client/ClientForgotPassword.tsx";
import ClientDashboard from "./pages/client/ClientDashboard.tsx";
import ClientLeads from "./pages/client/ClientLeads.tsx";
import ClientCalls from "./pages/client/ClientCalls.tsx";
import ClientAppointments from "./pages/client/ClientAppointments.tsx";
import ClientSettingsPage from "./pages/client/ClientSettingsPage.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminAgencies from "./pages/admin/AdminAgencies.tsx";
import AdminBilling from "./pages/admin/AdminBilling.tsx";
import AdminEventLogs from "./pages/admin/AdminEventLogs.tsx";
import ClientActivityLog from "./pages/client/ClientActivityLog.tsx";
import ClientTemplatePage from "./pages/client/ClientTemplatePage.tsx";
import ClientBilling from "./pages/client/ClientBilling.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <DemoModeProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/leads" element={<LeadsDashboard />} />
              <Route path="/leads/new" element={<LeadIntake />} />
              <Route path="/settings/notifications" element={<NotificationSettings />} />
              <Route path="/settings/scheduling" element={<SchedulingSettings />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/apply" element={<Apply />} />
              <Route path="/onboarding" element={<Onboarding />} />

              {/* Client auth */}
              <Route path="/client/login" element={<ClientLogin />} />
              <Route path="/client/forgot-password" element={<ClientForgotPassword />} />

              {/* Protected client routes */}
              <Route path="/client/dashboard" element={<ProtectedRoute allowedRoles={["client_admin", "client_viewer", "admin"]}><ClientDashboard /></ProtectedRoute>} />
              <Route path="/client/leads" element={<ProtectedRoute allowedRoles={["client_admin", "client_viewer", "admin"]}><ClientLeads /></ProtectedRoute>} />
              <Route path="/client/calls" element={<ProtectedRoute allowedRoles={["client_admin", "client_viewer", "admin"]}><ClientCalls /></ProtectedRoute>} />
              <Route path="/client/appointments" element={<ProtectedRoute allowedRoles={["client_admin", "client_viewer", "admin"]}><ClientAppointments /></ProtectedRoute>} />
              <Route path="/client/activity" element={<ProtectedRoute allowedRoles={["client_admin", "client_viewer", "admin"]}><ClientActivityLog /></ProtectedRoute>} />
              <Route path="/client/template" element={<ProtectedRoute allowedRoles={["client_admin", "admin"]}><ClientTemplatePage /></ProtectedRoute>} />
              <Route path="/client/settings" element={<ProtectedRoute allowedRoles={["client_admin", "admin"]}><ClientSettingsPage /></ProtectedRoute>} />
              <Route path="/client/billing" element={<ProtectedRoute allowedRoles={["client_admin", "admin"]}><ClientBilling /></ProtectedRoute>} />

              {/* Super admin routes */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={["super_admin"]}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/agencies" element={<ProtectedRoute allowedRoles={["super_admin"]}><AdminAgencies /></ProtectedRoute>} />
              <Route path="/admin/billing" element={<ProtectedRoute allowedRoles={["super_admin"]}><AdminBilling /></ProtectedRoute>} />
              <Route path="/admin/logs" element={<ProtectedRoute allowedRoles={["super_admin"]}><AdminEventLogs /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </DemoModeProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
