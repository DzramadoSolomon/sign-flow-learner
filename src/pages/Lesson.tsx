import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Menu, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileSidebar } from "@/components/MobileSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { VideoSection } from "@/components/lesson/VideoSection";
import { NotesSection } from "@/components/lesson/NotesSection";
import { QuizSection } from "@/components/lesson/QuizSection";
import { ExerciseSection } from "@/components/lesson/ExerciseSection";
import { useLesson, useLessonMetadata } from "@/hooks/useLessons";
import { usePurchasedLevels, getLevelPrice } from "@/hooks/usePurchasedLevels";
import { useLessonCompletions } from "@/hooks/useLessonCompletions";
import { PaymentDialog } from "@/components/PaymentDialog";
import { toast } from "sonner";

const Lesson = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState<'content' | 'quiz' | 'exercises'>('content');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  
  // Fetch lesson from database
  const { data: lesson, isLoading, error } = useLesson(id || '');
  const { data: allLessons = [] } = useLessonMetadata();
  const { hasLevelAccess, refetch: refetchPurchases, isLoading: loadingPurchases } = usePurchasedLevels();
  const { markLessonComplete, isLessonCompleted } = useLessonCompletions();
  
  // Check if this is a premium lesson and if user has access
  const isPremium = lesson?.metadata?.level !== 'beginner';
  const hasAccess = lesson?.metadata?.level ? hasLevelAccess(lesson.metadata.level) : true;
  const price = lesson?.metadata?.level ? getLevelPrice(lesson.metadata.level) : 0;

  // Show payment dialog if premium and no access
  useEffect(() => {
    if (!isLoading && !loadingPurchases && lesson && isPremium && !hasAccess) {
      setPaymentDialogOpen(true);
    }
  }, [isLoading, loadingPurchases, lesson, isPremium, hasAccess]);
  
  // Find current lesson index for navigation (across all levels)
  const currentIndex = allLessons.findIndex(l => l.id === id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allLessons.length - 1;
  
  const goToPreviousLesson = () => {
    if (hasPrevious) {
      navigate(`/lesson/${allLessons[currentIndex - 1].id}`);
      setCurrentStep('content');
    }
  };
  
  const goToNextLesson = async () => {
    // Mark current lesson as complete when moving to next lesson
    if (id && !isLessonCompleted(id)) {
      const success = await markLessonComplete(id);
      if (success) {
        toast.success("Lesson completed!");
      }
    }
    if (hasNext) {
      navigate(`/lesson/${allLessons[currentIndex + 1].id}`);
      setCurrentStep('content');
    }
  };
  
  const goToNextStep = async () => {
    if (currentStep === 'content') {
      setCurrentStep('quiz');
    } else if (currentStep === 'quiz') {
      setCurrentStep('exercises');
    } else if (currentStep === 'exercises') {
      // Mark lesson as complete when finishing exercises
      if (id && !isLessonCompleted(id)) {
        const success = await markLessonComplete(id);
        if (success) {
          toast.success("Lesson completed!");
        }
      }
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep === 'exercises') {
      setCurrentStep('quiz');
    } else if (currentStep === 'quiz') {
      setCurrentStep('content');
    }
  };

  const handlePaymentSuccess = () => {
    refetchPurchases();
    setPaymentDialogOpen(false);
  };

  const handlePaymentDialogClose = (open: boolean) => {
    setPaymentDialogOpen(open);
    if (!open && isPremium && !hasAccess) {
      // User closed dialog without paying, redirect to lessons
      navigate('/lessons');
    }
  };

  if (isLoading || loadingPurchases) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !lesson) {
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

  // If premium and no access, show locked state with payment dialog
  if (isPremium && !hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-8">
          <Lock className="h-16 w-16 text-amber-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Premium Lesson</h1>
          <p className="text-muted-foreground mb-6">
            This lesson requires payment to access. Complete the payment to unlock all {lesson.metadata.level} lessons.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/lessons">
              <Button variant="outline">Back to Lessons</Button>
            </Link>
            <Button onClick={() => setPaymentDialogOpen(true)}>
              Unlock for GH₵{price}
            </Button>
          </div>
          
          <PaymentDialog
            open={paymentDialogOpen}
            onOpenChange={handlePaymentDialogClose}
            lessonId={lesson.metadata.id}
            lessonTitle={lesson.metadata.title}
            amountGhs={price}
            onSuccess={handlePaymentSuccess}
          />
        </div>
      </div>
    );
  }

  const { metadata, videoUrl, notes, quiz, exercises } = lesson;

  const lessonContent = (
    <>
      {/* Title and Objectives */}
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
    </>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-4 px-4 py-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/lessons')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <MobileSidebar />
              </SheetContent>
            </Sheet>
            <Link to="/lessons" className="flex items-center gap-2 flex-1 min-w-0">
              <img src="/favicon.ico" alt="GSL Logo" className="h-6 w-6 shrink-0" />
              <span className="font-bold text-lg truncate">GSL Learning</span>
            </Link>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="icon" disabled={!hasPrevious} onClick={goToPreviousLesson}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" disabled={!hasNext} onClick={goToNextLesson}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>
        {lessonContent}
      </div>
    );
  }

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
                      <img src="/favicon.ico" alt="GSL Logo" className="h-6 w-6" />
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

          {lessonContent}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Lesson;
