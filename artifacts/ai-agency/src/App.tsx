import { lazy, Suspense, Component, useEffect, type ReactNode } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center text-foreground p-8 text-center">
          <div>
            <p className="text-6xl font-black text-primary mb-4">AG<span className="text-white">Labs</span></p>
            <p className="text-muted-foreground">Algo deu errado ao carregar a página.</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold">
              Recarregar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const HomePage = lazy(() => import("@/pages/home"));
const PrivacyPolicy = lazy(() => import("@/pages/privacy-policy"));
const TermsOfUse = lazy(() => import("@/pages/terms-of-use"));
const BlogPage = lazy(() => import("@/pages/blog"));
const BlogPostPage = lazy(() => import("@/pages/blog-post"));
const AdminPage = lazy(() => import("@/pages/admin"));
const NotFound = lazy(() => import("@/pages/not-found"));

function PageLoader() {
  // Na home, enquanto a página carrega, repete o topo que já veio no HTML.
  if (window.__homeShell && window.location.pathname === "/") {
    return <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: window.__homeShell }} />;
  }
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-blue-500/60 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );
}

function Router() {
  useEffect(() => {
    // Prefetch blog chunks after home loads
    const timer = setTimeout(() => {
      import("@/pages/blog");
      import("@/pages/blog-post");
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/politica-de-privacidade" component={PrivacyPolicy} />
        <Route path="/termos-de-uso" component={TermsOfUse} />
        <Route path="/blog" component={BlogPage} />
        <Route path="/blog/:slug" component={BlogPostPage} />
        <Route path="/admin" component={AdminPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;
