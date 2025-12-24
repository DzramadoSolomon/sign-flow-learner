import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  LayoutDashboard, 
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Circle,
  Lock,
  Shield
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
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useUserRole";
import { useLessonMetadata } from "@/hooks/useLessons";
import { PaymentDialog } from "@/components/PaymentDialog";

const mainNavigation = [
  { title: 'Home', url: '/', icon: Home },
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'All Lessons', url: '/lessons', icon: GraduationCap },
  { title: 'Dictionary', url: '/dictionary', icon: BookOpen },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { data: lessons = [] } = useLessonMetadata();

  const [purchasedLevels, setPurchasedLevels] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedLessonTitle, setSelectedLessonTitle] = useState<string | null>(null);

  // Group lessons by level
  const lessonGroups = React.useMemo(() => {
    const groups: { level: string; lessons: typeof lessons }[] = [];
    const levels = ['beginner', 'intermediate', 'advanced'];
    
    levels.forEach(level => {
      const levelLessons = lessons.filter(l => l.level === level);
      if (levelLessons.length > 0) {
        groups.push({
          level: level.charAt(0).toUpperCase() + level.slice(1),
          lessons: levelLessons
        });
      }
    });
    
    return groups;
  }, [lessons]);

  // Fetch purchased levels from database
  const fetchPurchasedLevels = async () => {
    try {
      let userEmail = user?.email;
      
      if (!userEmail) {
        userEmail = sessionStorage.getItem('lastPaymentEmail') || undefined;
      }

      if (!userEmail) {
        return;
      }

      const { data, error } = await supabase
        .from('lesson_purchases')
        .select('lesson_id')
        .eq('user_email', userEmail)
        .eq('payment_status', 'success');

      if (error) {
        console.error('Error fetching purchases:', error);
        return;
      }

      // Extract levels from purchased lesson IDs (e.g., 'intermediate-1' -> 'intermediate')
      const levels = new Set<string>();
      if (data) {
        data.forEach((p) => {
          const lessonId = (p as { lesson_id: string }).lesson_id;
          const level = lessonId.split('-')[0];
          if (level) levels.add(level);
        });
      }

      setPurchasedLevels(Array.from(levels));
    } catch (err) {
      console.error('Error fetching purchases:', err);
    }
  };

  useEffect(() => {
    fetchPurchasedLevels();
  }, [user?.email]);

  const isActive = (path: string) => currentPath === path;

  const isPremiumLevel = (level: string) => {
    return level.toLowerCase() !== 'beginner';
  };

  const hasLevelAccess = (level: string) => {
    if (!isPremiumLevel(level)) return true;
    return purchasedLevels.includes(level.toLowerCase());
  };

  const handleLessonClick = (e: React.MouseEvent, lesson: typeof lessons[0], level: string) => {
    if (isPremiumLevel(level) && !hasLevelAccess(level)) {
      e.preventDefault();
      setSelectedLessonId(lesson.id);
      setSelectedLessonTitle(lesson.title);
      setDialogOpen(true);
    }
  };

  const getLevelPrice = (level: string) => {
    if (level.toLowerCase() === 'intermediate') return 10;
    if (level.toLowerCase() === 'advanced') return 15;
    return 0;
  };

  const lessonIcon = (completed?: boolean) => {
    if (completed) {
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    }
    return <Circle className="h-4 w-4 text-muted-foreground" />;
  };

  // Calculate progress
  const allLessons = lessons;
  const completedLessons = 0; // Can be fetched from user progress later
  const overallProgress = allLessons.length > 0 ? Math.round((completedLessons / allLessons.length) * 100) : 0;

  return (
    <>
      <Sidebar collapsible="icon">
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
            const completedCount = 0; // Can be calculated from user progress
            const hasCurrentLesson = group.lessons.some(l => isActive(`/lesson/${l.id}`));
            const premium = isPremiumLevel(group.level);
            const hasAccess = hasLevelAccess(group.level);
            
            return (
              <Collapsible key={group.level} defaultOpen={hasCurrentLesson || group.level === 'Beginner'}>
                <SidebarGroup>
                  <CollapsibleTrigger className="w-full">
                    <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-sidebar-accent/50 rounded-md transition-colors gap-2">
                      <span className="flex items-center gap-1.5 min-w-0">
                        <span className="truncate">{group.level}</span>
                        {premium && !hasAccess && <Lock className="h-3 w-3 text-amber-600 shrink-0" />}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {premium && !hasAccess && (
                          <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 border-amber-200 px-1.5 py-0.5">
                            GH₵{getLevelPrice(group.level)} for all
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                          {completedCount}/{group.lessons.length}
                        </Badge>
                      </div>
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {group.lessons.map((lesson) => {
                          const lessonActive = isActive(`/lesson/${lesson.id}`);

                          return (
                            <SidebarMenuItem key={lesson.id}>
                              <SidebarMenuButton asChild isActive={lessonActive}>
                                <Link 
                                  to={`/lesson/${lesson.id}`}
                                  className="flex items-center gap-2"
                                  onClick={(e) => handleLessonClick(e, lesson, group.level)}
                                >
                                  <div className="shrink-0 w-4">
                                    {premium && !hasAccess ? (
                                      <Lock className="h-4 w-4 text-amber-600" />
                                    ) : (
                                      lessonIcon()
                                    )}
                                  </div>
                                  <span className="text-sm truncate">{lesson.title}</span>
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

      {/* Payment Dialog */}
      <PaymentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        lessonId={selectedLessonId || ''}
        lessonTitle={selectedLessonTitle || ''}
        amountGhs={selectedLessonId ? getLevelPrice(selectedLessonId.split('-')[0]) : 10}
        onSuccess={() => {
          fetchPurchasedLevels();
          setDialogOpen(false);
        }}
      />
    </>
  );
}
