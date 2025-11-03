import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, BookOpen, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { VideoSection } from "@/components/lesson/VideoSection";
import { NotesSection } from "@/components/lesson/NotesSection";
import { QuizSection } from "@/components/lesson/QuizSection";
import { ExerciseSection } from "@/components/lesson/ExerciseSection";
import { LessonContent } from "@/types/lesson";
import lesson1 from "@/data/lessons/beginner/lesson1.json";
import lesson2 from "@/data/lessons/beginner/lesson2.json";
import lesson3 from "@/data/lessons/beginner/lesson3.json";

const Lesson = () => {
  const { id } = useParams<{ id: string }>();
  
  // Map lessons
  const lessonsMap: { [key: string]: LessonContent } = {
    'beginner-1': lesson1 as LessonContent,
    'beginner-2': lesson2 as LessonContent,
    'beginner-3': lesson3 as LessonContent,
  };

  const lesson = id ? lessonsMap[id] : null;

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Lesson Not Found</h1>
          <Link to="/lessons">
            <Button variant="outline">Back to Lessons</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { metadata, videoUrl, notes, quiz, exercises } = lesson;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1">
          {/* Header */}
          <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center gap-4">
                <SidebarTrigger>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SidebarTrigger>
                <div className="flex items-center justify-between flex-1">
                  <div className="flex items-center gap-4">
                    <Link to="/" className="flex items-center gap-2">
                      <BookOpen className="h-6 w-6 text-primary" />
                      <span className="font-bold text-lg hidden md:inline">GSL Learning</span>
                    </Link>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="shrink-0">{metadata.level}</Badge>
                      <span className="text-xs text-muted-foreground">Lesson {metadata.order}</span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">•</span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">{metadata.duration} minutes</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Title and Objectives - Now below sticky header */}
          <section className="bg-gradient-to-r from-primary/5 via-accent/3 to-secondary/5 py-6 border-b">
            <div className="container mx-auto px-4">
              <h1 className="text-3xl font-bold mb-2">{metadata.title}</h1>
              <p className="text-muted-foreground mb-4">{metadata.description}</p>
              
              <div className="p-4 bg-card rounded-lg border">
                <p className="font-medium text-sm mb-2">Learning Objectives:</p>
                <ul className="grid md:grid-cols-2 gap-2">
                  {metadata.objectives.map((obj, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-accent mt-0.5">✓</span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Content */}
          <section className="py-8">
            <div className="container mx-auto px-4 max-w-5xl space-y-8">
              {/* Video */}
              <VideoSection videoUrl={videoUrl} title={metadata.title} />

              {/* Notes */}
              <NotesSection notes={notes} />

              {/* Quiz */}
              {quiz.length > 0 && <QuizSection questions={quiz} />}

              {/* Exercises */}
              {exercises.length > 0 && <ExerciseSection exercises={exercises} />}

              {/* Navigation */}
              <div className="flex justify-between pt-8 border-t">
                <Button variant="outline" disabled>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous Lesson
                </Button>
                <Button className="bg-primary hover:bg-primary/90">
                  Next Lesson
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Lesson;
