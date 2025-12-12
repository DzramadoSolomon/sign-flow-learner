import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  LayoutDashboard, 
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Circle,
  Shield
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useUserRole";
import { ScrollArea } from "@/components/ui/scroll-area";

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

export function MobileSidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  // Calculate overall progress
  const allLessons = lessonGroups.flatMap(g => g.lessons);
  const completedLessons = allLessons.filter(l => l.completed).length;
  const overallProgress = Math.round((completedLessons / allLessons.length) * 100);

  return (
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

              {/* Admin Link (Same as AppSidebar) */}
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
            const completedCount = group.lessons.filter(l => l.completed).length;
            const hasCurrentLesson = group.lessons.some(l => isActive(`/lesson/${l.id}`));

            return (
              <Collapsible key={group.level} defaultOpen={hasCurrentLesson}>
                <div>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between px-2 py-1 cursor-pointer hover:bg-sidebar-accent/50 rounded-md transition-colors">
                      <span className="text-xs font-medium text-sidebar-foreground/70">{group.level}</span>
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
                          >
                            <div className="shrink-0">
                              {lesson.completed ? (
                                <CheckCircle2 className="h-4 w-4 text-accent" />
                              ) : lesson.current ? (
                                <Circle className="h-4 w-4 text-primary fill-primary/20" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <span className="truncate">{lesson.title}</span>
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
  );
}
