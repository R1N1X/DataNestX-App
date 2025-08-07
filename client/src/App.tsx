import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import { Layout } from "@/components/layout/layout";
import Home from "@/pages/home";
import Auth from "@/pages/auth";
import Marketplace from "@/pages/marketplace";
import DatasetDetail from "@/pages/dataset-detail";
import Checkout from "@/pages/checkout";
import UploadDataset from "@/pages/upload-dataset";
import PostRequest from "@/pages/post-request";
import BuyerDashboard from "@/pages/buyer-dashboard";
import SellerDashboard from "@/pages/seller-dashboard";
import Messages from "@/pages/messages";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/auth" component={Auth} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/dataset/:id" component={DatasetDetail} />
        <Route path="/checkout/:id" component={Checkout} />
        <Route path="/upload-dataset" component={UploadDataset} />
        <Route path="/post-request" component={PostRequest} />
        <Route path="/buyer-dashboard" component={BuyerDashboard} />
        <Route path="/seller-dashboard" component={SellerDashboard} />
        <Route path="/messages" component={Messages} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
