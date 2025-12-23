import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  LayoutDashboard, 
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Circle
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Mock lesson data with progress
const lessonGroups = [
  {
    level: 'Beginner',
    lessons: [
      { id: 'beginner-1', title: 'GSL Alphabet & Fingerspelling', completed: true, current: false },
      { id: 'beginner-2', title: 'Numbers 1-20 in GSL', completed: true, current: false },
      { id: 'beginner-3', title: 'Basic Greetings in GSL', completed: true, current: true },
      { id: 'beginner-4', title: 'Family Signs', completed: false, current: false },
      { id: 'beginner-5', title: 'Common Objects', completed: false, current: false },
    ]
  },
  {
    level: 'Intermediate',
    lessons: [
      { id: 'intermediate-1', title: 'Conversational Phrases', completed: false, current: false },
      { id: 'intermediate-2', title: 'Time & Dates', completed: false, current: false },
      { id: 'intermediate-3', title: 'Emotions & Feelings', completed: false, current: false },
    ]
  }
];

const mainNavigation = [
  { title: 'Home', url: '/', icon: Home },
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'All Lessons', url: '/lessons', icon: GraduationCap },
  { title: 'Dictionary', url: '/dictionary', icon: BookOpen },
];

export function AppSidebar() {
  const { state, setOpen, isMobile } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const [purchasedLessons, setPurchasedLessons] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedLessonTitle, setSelectedLessonTitle] = useState<string | null>(null);
  const [hoverExpanded, setHoverExpanded] = useState(false);

  // Fetch purchased lessons from database
  const fetchPurchasedLessons = async () => {
    try {
      // Get current user's email - try from auth or session storage
      let userEmail = user?.email;
      
      if (!userEmail) {
        // Fallback to checking if we have stored email in sessionStorage
        userEmail = sessionStorage.getItem('lastPaymentEmail') || undefined;
      }

      if (!userEmail) {
        return;
      }

      const { data, error } = await supabase
        .from('lesson_purchases')
        .select('lesson_id')
        .eq('user_email', userEmail)
        .eq('payment_status', 'completed');

      if (error) {
        console.error('Error fetching purchases:', error);
        return;
      }

      setPurchasedLessons(data?.map((p: any) => p.lesson_id) || []);
    } catch (err) {
      console.error('Error fetching purchases:', err);
    }
  };

  useEffect(() => {
    fetchPurchasedLessons();
  }, [user?.email]);

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar collapsible="icon" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <SidebarHeader className="border-b px-4 py-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="/favicon.ico" alt="GSL Logo" className="h-6 w-6 shrink-0" />
          {!isCollapsed && <span className="font-bold text-lg">GSL Learning</span>}
        </Link>
        {!isCollapsed && (
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Course Progress</span>
              <span className="font-medium">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">{completedLessons}/{allLessons.length} lessons completed</p>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/admin')}>
                    <Link to="/admin" className="flex items-center gap-3">
                      <Shield className="h-4 w-4 shrink-0" />
                      {!isCollapsed && <span>Admin</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Lessons by Level */}
        {!isCollapsed && lessonGroups.map((group) => {
          const completedCount = group.lessons.filter(l => l.completed).length;
          const hasCurrentLesson = group.lessons.some(l => isActive(`/lesson/${l.id}`));
          
          return (
            <Collapsible key={group.level} defaultOpen={hasCurrentLesson}>
              <SidebarGroup>
                <CollapsibleTrigger className="w-full">
                  <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-sidebar-accent/50 rounded-md transition-colors">
                    <span>{group.level}</span>
                    <Badge variant="outline" className="text-xs">
                      {completedCount}/{group.lessons.length}
                    </Badge>
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.lessons.map((lesson) => {
                        const lessonActive = isActive(`/lesson/${lesson.id}`);
                        const premium = group.level.toLowerCase() !== 'beginner';

                        return (
                          <SidebarMenuItem key={lesson.id}>
                            <SidebarMenuButton asChild isActive={lessonActive}>
                              <Link 
                                to={`/lesson/${lesson.id}`}
                                className="flex items-center gap-3"
                                onClick={(e) => handleLessonClick(e, lesson, group.level)}
                              >
                                <div className="shrink-0 w-4">
                                  {lessonIcon(lesson.title)}
                                </div>
                                <span className="text-sm truncate">{lesson.title}</span>
                                {premium && !isPurchased(lesson.id) && (
                                  <Badge variant="outline" className="ml-auto text-xs flex items-center gap-1">
                                    <Lock className="h-3 w-3 text-amber-600" />
                                    <span className="text-amber-600">GH₵10</span>
                                  </Badge>
                                )}
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
