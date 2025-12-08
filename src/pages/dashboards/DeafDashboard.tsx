import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Award, 
  Clock, 
  CheckCircle2, 
  Target,
  ArrowRight,
  Trophy,
  Flame,
  Eye,
  PlayCircle
} from "lucide-react";

export const DeafDashboard = () => {
  const { user } = useAuth();
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
    { 
      id: 'beginner-3', 
      title: 'Counting in GSL: Numbers 1-30', 
      level: 'beginner', 
      progress: 100, 
      completedAt: '2 hours ago' 
    },
    { 
      id: 'beginner-2', 
      title: 'GSL Alphabets: A-Z', 
      level: 'beginner', 
      progress: 100, 
      completedAt: '1 day ago' 
    },
    { 
      id: 'beginner-1', 
      title: 'Getting Started with GSL', 
      level: 'beginner', 
      progress: 100, 
      completedAt: '2 days ago' 
    },
  ];

  const achievements = [
    { title: 'First Steps', description: 'Complete your first lesson', icon: <CheckCircle2 className="h-6 w-6" />, unlocked: true },
    { title: 'Week Warrior', description: '7-day learning streak', icon: <Flame className="h-6 w-6" />, unlocked: true },
    { title: 'Quiz Master', description: 'Score 90% or higher on 5 quizzes', icon: <Trophy className="h-6 w-6" />, unlocked: false },
    { title: 'Dedicated Learner', description: 'Complete 10 lessons', icon: <Award className="h-6 w-6" />, unlocked: false },
  ];

  const progressPercentage = Math.round((stats.lessonsCompleted / stats.totalLessons) * 100);

  return (
    <>
      {/* Visual Mode Indicator */}
      <div className="mb-6">
        <Badge variant="outline" className="gap-2 px-4 py-2 text-sm">
          <Eye className="h-4 w-4" />
          Visual Learning Mode
        </Badge>
      </div>

      {/* Welcome Section - Visual First */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          Welcome back, {user?.name?.split(' ')[0] || 'Learner'}! 👋
        </h1>
        <p className="text-lg text-muted-foreground">Continue your visual GSL learning journey</p>
      </div>

      {/* Large Stats Grid - High Contrast */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 border-2 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-lg bg-primary/20 text-primary">
              <img src="/favicon.ico" alt="GSL" className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Lessons Completed</p>
          </div>
          <p className="text-3xl font-bold">{stats.lessonsCompleted}/{stats.totalLessons}</p>
        </Card>
        
        <Card className="p-6 border-2 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-lg bg-accent/20 text-accent">
              <Target className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Quiz Score</p>
          </div>
          <p className="text-3xl font-bold">{stats.averageQuizScore}%</p>
        </Card>
        
        <Card className="p-6 border-2 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-lg bg-secondary/20 text-secondary">
              <Clock className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Learning Time</p>
          </div>
          <p className="text-3xl font-bold">{Math.floor(stats.totalTime / 60)}h {stats.totalTime % 60}m</p>
        </Card>
        
        <Card className="p-6 border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-orange-500/10 to-orange-500/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-lg bg-orange-500/20">
              <Flame className="h-6 w-6 text-orange-500" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Day Streak</p>
          </div>
          <p className="text-3xl font-bold">{stats.currentStreak} 🔥</p>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Larger for visual focus */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Overview - More Visual */}
          <Card className="p-6 border-2">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Learning Progress</h2>
                <p className="text-muted-foreground">Overall course completion</p>
              </div>
              <Badge variant="secondary" className="text-2xl font-bold px-4 py-2">
                {progressPercentage}%
              </Badge>
            </div>
            <Progress value={progressPercentage} className="h-4 mb-3" />
            <p className="text-lg font-medium text-muted-foreground">
              {stats.lessonsCompleted} of {stats.totalLessons} lessons completed
            </p>
          </Card>

          {/* Recent Lessons - Visual Cards */}
          <Card className="p-6 border-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recent Lessons</h2>
              <Link to="/lessons">
                <Button variant="outline" size="lg" className="gap-2">
                  View All
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {recentLessons.map((lesson) => (
                <Link key={lesson.id} to={`/lesson/${lesson.id}`}>
                  <div className="p-5 rounded-lg border-2 bg-card hover:bg-accent/10 hover:border-primary transition-all group cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <PlayCircle className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                            {lesson.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-semibold">
                            {lesson.level}
                          </Badge>
                          <span className="text-sm text-muted-foreground font-medium">
                            ✓ Completed {lesson.completedAt}
                          </span>
                        </div>
                      </div>
                      <CheckCircle2 className="h-6 w-6 text-accent shrink-0" />
                    </div>
                    <Progress value={lesson.progress} className="h-2" />
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Achievements - Visual Icons */}
          <Card className="p-6 border-2">
            <h2 className="text-xl font-bold mb-5">Achievements 🏆</h2>
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    achievement.unlocked
                      ? 'bg-accent/10 border-accent shadow-sm'
                      : 'bg-muted/20 border-muted/50 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-3 rounded-lg ${
                        achievement.unlocked
                          ? 'bg-accent/30 text-accent'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                    </div>
                    {achievement.unlocked && (
                      <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Continue Learning CTA - Visual Emphasis */}
          <Card className="p-6 border-2 bg-gradient-to-br from-primary/15 to-accent/10">
            <div className="text-center space-y-4">
              <div className="p-4 rounded-full bg-primary/20 w-16 h-16 mx-auto flex items-center justify-center">
                <PlayCircle className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Keep Learning!</h3>
                <p className="text-muted-foreground font-medium">
                  Your next lesson is waiting
                </p>
              </div>
              <Link to="/lessons" className="block">
                <Button size="lg" className="w-full text-base font-bold gap-2">
                  Continue Learning
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};
