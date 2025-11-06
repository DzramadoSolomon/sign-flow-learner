import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Award, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  Target,
  ArrowRight,
  Trophy,
  Flame,
  Menu
} from "lucide-react";

const Dashboard = () => {
  const isMobile = useIsMobile();
  
  // Mock data - in real app, this would come from state management or backend
  const stats = {
    lessonsCompleted: 3,
    totalLessons: 30,
    currentStreak: 7,
    totalTime: 245, // minutes
    achievements: 5,
    averageQuizScore: 87
  };

  const recentLessons = [
    { id: 'beginner-3', title: 'Basic Greetings in GSL', level: 'beginner', progress: 100, completedAt: '2 hours ago' },
    { id: 'beginner-2', title: 'Numbers 1-20 in GSL', level: 'beginner', progress: 100, completedAt: '1 day ago' },
    { id: 'beginner-1', title: 'GSL Alphabet & Fingerspelling', level: 'beginner', progress: 100, completedAt: '2 days ago' },
  ];

  const achievements = [
    { title: 'First Steps', description: 'Complete your first lesson', icon: <CheckCircle2 className="h-6 w-6" />, unlocked: true },
    { title: 'Week Warrior', description: '7-day learning streak', icon: <Flame className="h-6 w-6" />, unlocked: true },
    { title: 'Quiz Master', description: 'Score 90% or higher on 5 quizzes', icon: <Trophy className="h-6 w-6" />, unlocked: false },
    { title: 'Dedicated Learner', description: 'Complete 10 lessons', icon: <Award className="h-6 w-6" />, unlocked: false },
  ];

  const progressPercentage = Math.round((stats.lessonsCompleted / stats.totalLessons) * 100);

  const dashboardContent = (
    <>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back!</h1>
        <p className="text-muted-foreground">Continue your GSL learning journey</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<img src="/favicon.ico" alt="GSL" className="h-5 w-5" />}
          label="Lessons Completed"
          value={`${stats.lessonsCompleted}/${stats.totalLessons}`}
          color="primary"
        />
        <StatCard
          icon={<Target className="h-5 w-5" />}
          label="Average Quiz Score"
          value={`${stats.averageQuizScore}%`}
          color="accent"
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Total Time"
          value={`${Math.floor(stats.totalTime / 60)}h ${stats.totalTime % 60}m`}
          color="secondary"
        />
        <StatCard
          icon={<Award className="h-5 w-5" />}
          label="Achievements"
          value={`${stats.achievements}/10`}
          color="primary"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Overview */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold mb-1">Learning Progress</h2>
                <p className="text-sm text-muted-foreground">Overall course completion</p>
              </div>
              <Badge variant="secondary" className="text-lg font-bold">
                {progressPercentage}%
              </Badge>
            </div>
            <Progress value={progressPercentage} className="h-3 mb-2" />
            <p className="text-sm text-muted-foreground">
              {stats.lessonsCompleted} of {stats.totalLessons} lessons completed
            </p>
          </Card>

          {/* Recent Lessons */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Lessons</h2>
              <Link to="/lessons">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {recentLessons.map((lesson) => (
                <Link key={lesson.id} to={`/lesson/${lesson.id}`}>
                  <div className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors group cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium group-hover:text-primary transition-colors">
                          {lesson.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {lesson.level}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {lesson.completedAt}
                          </span>
                        </div>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                    </div>
                    <Progress value={lesson.progress} className="h-1.5" />
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Current Streak */}
          <Card className="p-6 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent border-orange-200/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-full bg-orange-500/20">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <div className="text-3xl font-bold">{stats.currentStreak}</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Keep it up! Learn every day to maintain your streak.
            </p>
          </Card>

          {/* Achievements */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Achievements</h2>
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    achievement.unlocked
                      ? 'bg-accent/5 border-accent/20'
                      : 'bg-muted/20 border-muted opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        achievement.unlocked
                          ? 'bg-accent/20 text-accent'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{achievement.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {achievement.description}
                      </p>
                    </div>
                    {achievement.unlocked && (
                      <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Continue Learning CTA */}
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/5">
            <div className="text-center space-y-4">
              <TrendingUp className="h-8 w-8 mx-auto text-primary" />
              <div>
                <h3 className="font-semibold mb-1">Keep Learning!</h3>
                <p className="text-sm text-muted-foreground">
                  Your next lesson is waiting
                </p>
              </div>
              <Link to="/lessons" className="block">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Continue Learning
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-4 px-4 py-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <AppSidebar />
              </SheetContent>
            </Sheet>
            <Link to="/" className="flex items-center gap-2">
              <img src="/favicon.ico" alt="GSL Logo" className="h-6 w-6" />
              <span className="font-bold text-lg">GSL Learning</span>
            </Link>
            <Badge variant="outline" className="gap-1 ml-auto">
              <Flame className="h-3 w-3 text-orange-500" />
              {stats.currentStreak}
            </Badge>
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
                  <Badge variant="outline" className="gap-1">
                    <Flame className="h-3 w-3 text-orange-500" />
                    {stats.currentStreak} day streak
                  </Badge>
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

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'primary' | 'accent' | 'secondary';
}

const StatCard = ({ icon, label, value, color }: StatCardProps) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    secondary: 'bg-secondary/10 text-secondary',
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </Card>
  );
};

export default Dashboard;
