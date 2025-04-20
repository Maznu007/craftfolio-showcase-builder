
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Profile from "./pages/Profile";
import AuthCallback from "./pages/AuthCallback";
import Upgrade from "./pages/Upgrade";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import Templates from "./pages/Templates";
import Community from "./pages/Community";
import TemplateGroups from "./pages/TemplateGroups";
import TemplateGroupDetail from "./pages/TemplateGroupDetail";
import HelpSupport from "./pages/HelpSupport";
import AdminSupport from "./pages/admin/AdminSupport";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/portfolio/create" element={<Portfolio />} />
              <Route path="/portfolio/edit/:id" element={<Portfolio />} />
              <Route path="/portfolio/view/:id" element={<Portfolio />} />
              <Route path="/upgrade" element={<Upgrade />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/community" element={<Community />} />
              <Route path="/template-groups" element={<TemplateGroups />} />
              <Route path="/template-groups/:templateId" element={<TemplateGroupDetail />} />
              <Route path="/admin/support" element={<AdminSupport />} />
              <Route path="/help-support" element={<HelpSupport />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
