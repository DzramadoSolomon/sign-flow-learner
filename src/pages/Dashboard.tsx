import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileSidebar } from "@/components/MobileSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLearningMode } from "@/contexts/LearningModeContext";
import { useAuth } from "@/contexts/AuthContext";
import { DeafDashboard } from "./dashboards/DeafDashboard";
import { HearingDashboard } from "./dashboards/HearingDashboard";
import { Flame, Menu, LogOut, User } from "lucide-react";

const Dashboard = () => {
  const isMobile = useIsMobile();
  const { mode } = useLearningMode();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };
  
  const stats = {
    currentStreak: 7,
  };

  // Render appropriate dashboard based on learning mode
  const dashboardContent = mode === 'deaf' ? <DeafDashboard /> : <HearingDashboard />;

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background w-full">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-4 px-4 py-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <MobileSidebar />
              </SheetContent>
            </Sheet>
              <Link to="/" className="flex items-center gap-2">
                <img src="/favicon.ico" alt="GSL Logo" className="h-6 w-6" />
                <span className="font-bold text-lg">GSL Learning</span>
              </Link>
              <div className="flex items-center gap-2 ml-auto">
                <Badge variant="outline" className="gap-1">
                  <Flame className="h-3 w-3 text-orange-500" />
                  {stats.currentStreak}
                </Badge>
                <Link to="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>
        <div className="container mx-auto px-4 py-8">
          {dashboardContent}
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1">
          <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center gap-4">
                <SidebarTrigger>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SidebarTrigger>
                <div className="flex items-center justify-between flex-1">
                  <Link to="/" className="flex items-center gap-2">
                    <img src="/favicon.ico" alt="GSL Logo" className="h-6 w-6" />
                    <span className="font-bold text-lg hidden md:inline">GSL Learning</span>
                  </Link>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="gap-1">
                      <Flame className="h-3 w-3 text-orange-500" />
                      {stats.currentStreak} day streak
                    </Badge>
                    <Link to="/profile">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <User className="h-4 w-4" />
                        Profile
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 py-8">
            {dashboardContent}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
