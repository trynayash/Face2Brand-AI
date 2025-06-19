import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { Suspense } from "react";
import { ErrorBoundary } from "./features/common/ErrorBoundary";
import { useUser, SignedIn, SignedOut } from "@clerk/clerk-react";
import Footer from './features/common/Footer';

// Lazy load all feature pages
const Index = React.lazy(() => import("./features/brandkit/Index"));
const Auth = React.lazy(() => import("./features/auth/Auth"));
const Dashboard = React.lazy(() => import("./features/brandkit/Dashboard"));
const CustomBrandKit = React.lazy(() => import("./features/brandkit/CustomBrandKit"));
const PublicKit = React.lazy(() => import("./features/brandkit/PublicKit"));
const Gallery = React.lazy(() => import("./features/brandkit/Gallery"));
const CustomAuth = React.lazy(() => import("./features/auth/CustomAuth"));
const NotFound = React.lazy(() => import("./features/auth/NotFound"));
const Terms = React.lazy(() => import("./features/terms/Terms"));

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useUser();
  if (!isSignedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// Branded loading fallback for Suspense
const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <img src="/logoTransparent.png" alt="Loading Logo" className="h-24 w-24 mb-4 animate-blink-slow drop-shadow-xl" loading="eager" />
    <span className="text-lg text-purple-700 font-semibold animate-pulse">Loading...</span>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Project-wide Background Image */}
        <div className="absolute inset-0 -z-10">
          <img src="/Background.png" alt="Background" className="w-full h-full object-cover fixed" style={{ minHeight: '100vh', minWidth: '100vw' }} loading="eager" />
        </div>
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/face2brand" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/custombrandkit" element={<CustomBrandKit />} />
                <Route path="/publickit/:id" element={<PublicKit />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/customauth" element={<CustomAuth />} />
                <Route path="/terms" element={<Terms />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </Suspense>
        </ErrorBoundary>
        <Footer />
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
