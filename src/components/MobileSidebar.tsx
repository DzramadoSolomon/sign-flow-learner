import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  LayoutDashboard, 
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Circle,
  Shield,
  Lock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useUserRole";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLessonMetadata } from "@/hooks/useLessons";
import { supabase } from "@/integrations/supabase/client";
import { PaymentDialog } from "@/components/PaymentDialog";

const mainNavigation = [
  { title: 'Home', url: '/', icon: Home },
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'All Lessons', url: '/lessons', icon: GraduationCap },
  { title: 'Dictionary', url: '/dictionary', icon: BookOpen },
];

export function MobileSidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { data: lessons = [] } = useLessonMetadata();
  const currentPath = location.pathname;

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

  // Calculate overall progress
  const allLessons = lessons;
  const completedLessons = 0;
  const overallProgress = allLessons.length > 0 ? Math.round((completedLessons / allLessons.length) * 100) : 0;

  return (
    <>
      <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
        {/* Header */}
        <div className="border-b border-sidebar-border px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/favicon.ico" alt="GSL Logo" className="h-6 w-6 shrink-0" />
            <span className="font-bold text-lg">GSL Learning</span>
          </Link>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-sidebar-foreground/70">Course Progress</span>
              <span className="font-medium">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
            <p className="text-xs text-sidebar-foreground/70">
              {completedLessons}/{allLessons.length} lessons completed
            </p>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Main Navigation */}
            <div>
              <p className="text-xs font-medium text-sidebar-foreground/70 mb-2 px-2">Navigation</p>
              <nav className="space-y-1">
                {mainNavigation.map((item) => (
                  <Link
                    key={item.title}
                    to={item.url}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive(item.url)
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                        : 'hover:bg-sidebar-accent/50'
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.title}</span>
                  </Link>
                ))}

                {/* Admin Link */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive('/admin')
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                        : 'hover:bg-sidebar-accent/50'
                    }`}
                  >
                    <Shield className="h-4 w-4 shrink-0" />
                    <span>Admin</span>
                  </Link>
                )}
              </nav>
            </div>

            {/* Lessons by Level */}
            {lessonGroups.map((group) => {
              const completedCount = 0;
              const hasCurrentLesson = group.lessons.some(l => isActive(`/lesson/${l.id}`));
              const premium = isPremiumLevel(group.level);
              const hasAccess = hasLevelAccess(group.level);

              return (
                <Collapsible key={group.level} defaultOpen={hasCurrentLesson || group.level === 'Beginner'}>
                  <div>
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between px-2 py-1 cursor-pointer hover:bg-sidebar-accent/50 rounded-md transition-colors">
                        <span className="text-xs font-medium text-sidebar-foreground/70 flex items-center gap-2">
                          {group.level}
                          {premium && !hasAccess && <Lock className="h-3 w-3 text-amber-600" />}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {completedCount}/{group.lessons.length}
                        </Badge>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <nav className="space-y-1 mt-2">
                        {group.lessons.map((lesson) => {
                          const lessonActive = isActive(`/lesson/${lesson.id}`);
                          return (
                            <Link
                              key={lesson.id}
                              to={`/lesson/${lesson.id}`}
                              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                                lessonActive
                                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                                  : 'hover:bg-sidebar-accent/50'
                              }`}
                              onClick={(e) => handleLessonClick(e, lesson, group.level)}
                            >
                              <div className="shrink-0">
                                <Circle className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <span className="truncate flex-1">{lesson.title}</span>
                              {premium && !hasAccess && (
                                <Badge variant="outline" className="text-xs flex items-center gap-1">
                                  <Lock className="h-3 w-3 text-amber-600" />
                                  <span className="text-amber-600">GH₵{getLevelPrice(group.level)}</span>
                                </Badge>
                              )}
                            </Link>
                          );
                        })}
                      </nav>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-primary">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <span className="text-sm font-medium truncate">{user?.name || 'User'}</span>
          </div>
        </div>
      </div>

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
