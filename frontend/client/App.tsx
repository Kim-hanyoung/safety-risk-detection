// client/main.tsx
import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// ✅ BrowserRouter 대신 HashRouter 권장(ngrok/모바일 404 방지)
//import { HashRouter, Routes, Route } from "react-router-dom";
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
import MobileStream from "./pages/MobileStream";

import { AlertsProvider } from "@/context/alerts";
import { AuthProvider } from "@/context/auth";
import RequireAuth from "@/components/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* <BrowserRouter> 로 쓰고 싶으면 바꿔도 되지만,
          ngrok/모바일 404가 나면 HashRouter가 안전합니다. */}
      <BrowserRouter>
        <AlertsProvider>
          <AuthProvider>
            <div className="flex min-h-screen flex-col bg-background">
              <SiteHeader />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<About />} />

                  {/* 보호 라우트 예시 */}
                  <Route
                    path="/risk-report"
                    element={
                      <RequireAuth>
                        <RiskReport />
                      </RequireAuth>
                    }
                  />

                  <Route path="/image-analysis" element={<ImageAnalysis />} />
                  <Route path="/video-detection" element={<VideoDetection />} />

                  {/* ⬇️ 빠져 있던 라우트 추가 */}
                  <Route path="/mobile-stream" element={<MobileStream />} />

                  <Route path="/auth" element={<Auth />} />
                  <Route path="/forum" element={<Forum />} />
                  <Route path="/forum/:id" element={<ForumPost />} />

                  {/* 맨 마지막 catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <SiteFooter />
            </div>
          </AuthProvider>
        </AlertsProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
