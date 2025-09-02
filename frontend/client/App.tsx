import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import ImageAnalysis from "./pages/ImageAnalysis";
import RiskReport from "./pages/RiskReport";
import About from "./pages/About";
import VideoDetection from "./pages/VideoDetection";
import Auth from "./pages/Auth";
import Forum from "./pages/Forum";
import ForumPost from "./pages/ForumPost";

const queryClient = new QueryClient();

import { AlertsProvider } from "@/context/alerts";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AlertsProvider>
          <div className="flex min-h-screen flex-col bg-background">
            <SiteHeader />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/risk-report" element={<RiskReport />} />
                <Route path="/image-analysis" element={<ImageAnalysis />} />
                <Route path="/video-detection" element={<VideoDetection />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/forum" element={<Forum />} />
                <Route path="/forum/:id" element={<ForumPost />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <SiteFooter />
          </div>
        </AlertsProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
