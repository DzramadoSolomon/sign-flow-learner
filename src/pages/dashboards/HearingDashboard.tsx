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
  Volume2,
  Headphones,
  Mic
} from "lucide-react";

export const HearingDashboard = () => {
  const { user } = useAuth();
  // Mock data - in real app, this would come from state management or backend
  const stats = {
    lessonsCompleted: 3,
    totalLessons: 30,
    currentStreak: 7,
    totalTime: 245, // minutes
    achievements: 5,
    averageQuizScore: 87,
    listeningHours: 4.2
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
    { title: 'Audio Learner', description: 'Complete 5 audio lessons', icon: <Headphones className="h-6 w-6" />, unlocked: true },
    { title: 'Quiz Master', description: 'Score 90% or higher on 5 quizzes', icon: <Trophy className="h-6 w-6" />, unlocked: false },
  ];

  const progressPercentage = Math.round((stats.lessonsCompleted / stats.totalLessons) * 100);

  return (
    <>
      {/* Audio Mode Indicator */}
      <div className="mb-6">
        <Badge variant="outline" className="gap-2 px-4 py-2 text-sm">
          <Volume2 className="h-4 w-4" />
          Audio + Visual Learning Mode
        </Badge>
      </div>

      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Welcome back, {user?.name?.split(' ')[0] || 'Learner'}!
        </h1>
        <p className="text-lg text-muted-foreground flex items-center gap-2">
          <Headphones className="h-5 w-5" />
          Continue your audio-enhanced GSL learning journey
        </p>
      </div>

      {/* Stats Grid with Audio Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <img src="/favicon.ico" alt="GSL" className="h-5 w-5" />
            </div>
            <p className="text-sm text-muted-foreground">Lessons Completed</p>
          </div>
          <p className="text-2xl font-bold">{stats.lessonsCompleted}/{stats.totalLessons}</p>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-accent/10 text-accent">
              <Target className="h-5 w-5" />
            </div>
            <p className="text-sm text-muted-foreground">Average Quiz Score</p>
          </div>
          <p className="text-2xl font-bold">{stats.averageQuizScore}%</p>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
              <Headphones className="h-5 w-5" />
            </div>
            <p className="text-sm text-muted-foreground">Listening Hours</p>
          </div>
          <p className="text-2xl font-bold">{stats.listeningHours}h</p>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Award className="h-5 w-5" />
            </div>
            <p className="text-sm text-muted-foreground">Achievements</p>
          </div>
          <p className="text-2xl font-bold">{stats.achievements}/10</p>
        </Card>
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

          {/* Recent Lessons with Audio Indicators */}
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
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium group-hover:text-primary transition-colors">
                            {lesson.title}
                          </h3>
                          <Volume2 className="h-4 w-4 text-primary" />
                        </div>
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

          {/* Audio Learning Tip */}
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-200/20">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-blue-500/20">
                <Mic className="h-6 w-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Audio Learning Tip</h3>
                <p className="text-sm text-muted-foreground">
                  Use headphones for the best audio experience. Listen to the narration while watching the signs to reinforce your learning.
                </p>
              </div>
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
              <div className="flex items-center justify-center gap-2">
                <Volume2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Keep Learning!</h3>
                <p className="text-sm text-muted-foreground">
                  Your next audio lesson awaits
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
};
