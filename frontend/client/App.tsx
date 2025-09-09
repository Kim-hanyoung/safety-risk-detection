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

import { AlertsProvider } from "@/context/alerts";

// ✅ 추가: 인증 컨텍스트 & 보호 라우트
import { AuthProvider } from "@/context/auth";
import RequireAuth from "@/components/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AlertsProvider>
          {/* ✅ AuthProvider로 전역 감싸기 */}
          <AuthProvider>
            <div className="flex min-h-screen flex-col bg-background">
              <SiteHeader />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<About />} />

                  {/* ✅ /risk-report는 로그인 필요 */}
                  <Route
                    path="/risk-report"
                    element={
                      <RequireAuth>
                        <RiskReport />
                      </RequireAuth>
                    }
                  />

                  {/* 필요시 /image-analysis도 보호하고 싶으면 아래처럼 감싸세요
                  <Route
                    path="/image-analysis"
                    element={
                      <RequireAuth>
                        <ImageAnalysis />
                      </RequireAuth>
                    }
                  /> */}
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
          </AuthProvider>
        </AlertsProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
