import React from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { 
  User as UserIcon, 
  LogOut, 
  Settings, 
  Plus, 
  Search, 
  MessageSquare,
  Database
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [location, navigate] = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getDashboardPath = () =>
    user?.role === "buyer" ? "/buyer-dashboard" : "/seller-dashboard";

  const getUploadPath = () =>
    user?.role === "buyer" ? "/post-request" : "/upload-dataset";

  const getHomeRedirect = () => {
    if (!user) return "/";
    return user.role === "buyer" ? "/buyer-dashboard" : "/seller-dashboard";
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={getHomeRedirect()}>
          <div className="flex items-center cursor-pointer">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-2">
              <Database className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">DataNestX</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/marketplace">
            <div className={`flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer ${location === '/marketplace' ? 'text-primary' : 'text-muted-foreground'}`}>
              <Search className="h-4 w-4" />
              Browse Datasets
            </div>
          </Link>
          {user && (
            <Link href={getUploadPath()}>
              <div className={`flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer ${location === getUploadPath() ? 'text-primary' : 'text-muted-foreground'}`}>
                <Plus className="h-4 w-4" />
                {user.role === "buyer" ? "Post Request" : "Upload Dataset"}
              </div>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Button variant="ghost" size="icon" onClick={() => navigate('/messages')}>
                <MessageSquare className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatarUrl || ""} alt={user.name} />
                      <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="font-normal">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(getDashboardPath())}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/auth">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth?mode=register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};
