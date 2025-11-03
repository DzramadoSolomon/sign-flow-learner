import { Link, useLocation } from "react-router-dom";
import { 
  BookOpen, 
  Home, 
  LayoutDashboard, 
  GraduationCap,
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
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
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
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-4 py-4">
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary shrink-0" />
          {!isCollapsed && <span className="font-bold text-lg">GSL Learning</span>}
        </Link>
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
                        return (
                          <SidebarMenuItem key={lesson.id}>
                            <SidebarMenuButton asChild isActive={lessonActive}>
                              <Link 
                                to={`/lesson/${lesson.id}`}
                                className="flex items-center gap-3"
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
  );
}
