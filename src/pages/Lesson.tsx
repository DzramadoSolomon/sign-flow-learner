import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
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
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'content' | 'quiz' | 'exercises'>('content');
  
  // Map lessons with order
  const lessonsList = [
    { id: 'beginner-1', data: lesson1 as LessonContent },
    { id: 'beginner-2', data: lesson2 as LessonContent },
    { id: 'beginner-3', data: lesson3 as LessonContent },
  ];
  
  const lessonsMap: { [key: string]: LessonContent } = {
    'beginner-1': lesson1 as LessonContent,
    'beginner-2': lesson2 as LessonContent,
    'beginner-3': lesson3 as LessonContent,
  };

  const lesson = id ? lessonsMap[id] : null;
  const currentIndex = lessonsList.findIndex(l => l.id === id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < lessonsList.length - 1;
  
  const goToPreviousLesson = () => {
    if (hasPrevious) {
      navigate(`/lesson/${lessonsList[currentIndex - 1].id}`);
      setCurrentStep('content');
    }
  };
  
  const goToNextLesson = () => {
    if (hasNext) {
      navigate(`/lesson/${lessonsList[currentIndex + 1].id}`);
      setCurrentStep('content');
    }
  };
  
  const goToNextStep = () => {
    if (currentStep === 'content') {
      setCurrentStep('quiz');
    } else if (currentStep === 'quiz') {
      setCurrentStep('exercises');
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep === 'exercises') {
      setCurrentStep('quiz');
    } else if (currentStep === 'quiz') {
      setCurrentStep('content');
    }
  };

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
    <SidebarProvider defaultOpen={false}>
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
                    <Button variant="outline" size="sm" disabled={!hasPrevious} onClick={goToPreviousLesson}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" disabled={!hasNext} onClick={goToNextLesson}>
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
              {/* Step Indicator */}
              <div className="flex items-center justify-center gap-2 mb-8">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${currentStep === 'content' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <span className="text-sm font-medium">1. Content</span>
                </div>
                <div className="w-8 h-0.5 bg-muted"></div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${currentStep === 'quiz' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <span className="text-sm font-medium">2. Quiz</span>
                </div>
                <div className="w-8 h-0.5 bg-muted"></div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${currentStep === 'exercises' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <span className="text-sm font-medium">3. Exercises</span>
                </div>
              </div>

              {/* Video & Notes */}
              {currentStep === 'content' && (
                <>
                  <VideoSection videoUrl={videoUrl} title={metadata.title} />
                  <NotesSection notes={notes} />
                </>
              )}

              {/* Quiz */}
              {currentStep === 'quiz' && quiz.length > 0 && <QuizSection questions={quiz} />}

              {/* Exercises */}
              {currentStep === 'exercises' && exercises.length > 0 && <ExerciseSection exercises={exercises} />}

              {/* Navigation */}
              <div className="flex justify-between pt-8 border-t">
                <Button 
                  variant="outline" 
                  disabled={currentStep === 'content' && !hasPrevious}
                  onClick={currentStep === 'content' ? goToPreviousLesson : goToPreviousStep}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  {currentStep === 'content' ? 'Previous Lesson' : 'Previous'}
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  disabled={currentStep === 'exercises' && !hasNext}
                  onClick={currentStep === 'exercises' ? goToNextLesson : goToNextStep}
                >
                  {currentStep === 'exercises' ? 'Next Lesson' : 'Next'}
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
