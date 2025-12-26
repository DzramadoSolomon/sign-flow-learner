import { Menu, Filter, Loader2, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LessonCard } from "@/components/LessonCard";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileSidebar } from "@/components/MobileSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLessonMetadata } from "@/hooks/useLessons";
import { usePurchasedLevels } from "@/hooks/usePurchasedLevels";
const Lessons = () => {
  const isMobile = useIsMobile();
  const { data: lessons = [], isLoading } = useLessonMetadata();
  const { hasLevelAccess } = usePurchasedLevels();

  const hasIntermediateAccess = hasLevelAccess('intermediate');
  const hasAdvancedAccess = hasLevelAccess('advanced');
  
  // Group lessons by level
  const beginnerLessons = lessons.filter(l => l.level === 'beginner');
  const intermediateLessons = lessons.filter(l => l.level === 'intermediate');
  const advancedLessons = lessons.filter(l => l.level === 'advanced');
  
  // Mock progress data
  const progressData: { [key: string]: number } = {};
  lessons.forEach(l => {
    progressData[l.id] = 0; // Default to 0, can be fetched from user progress later
  });

  const lessonsContent = (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 via-accent/5 to-secondary/10 py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <h1 className="text-4xl font-bold">All Lessons</h1>
          </div>
          <p className="text-lg text-muted-foreground mb-6 max-w-3xl">
            Explore our structured curriculum designed to take you from beginner to advanced signer.
          </p>
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="text-sm py-1.5 px-3">
              Beginner ({beginnerLessons.length})
            </Badge>
            <Badge variant="outline" className="text-sm py-1.5 px-3">
              Intermediate ({intermediateLessons.length})
            </Badge>
            <Badge variant="outline" className="text-sm py-1.5 px-3">
              Advanced ({advancedLessons.length})
            </Badge>
          </div>
        </div>
      </section>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading lessons...</span>
        </div>
      )}

      {!isLoading && (
        <>
          {/* Beginner Lessons */}
          {beginnerLessons.length > 0 && (
            <section className="py-12">
              <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">Beginner Level</h2>
                    <p className="text-muted-foreground">
                      Start your GSL journey with foundational lessons - Free access
                    </p>
                  </div>
                  <Badge variant="secondary">Free</Badge>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {beginnerLessons.map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      progress={progressData[lesson.id]}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Intermediate Lessons */}
          {intermediateLessons.length > 0 && (
            <section className="py-12 bg-muted/30">
              <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">Intermediate Level</h2>
                    <p className="text-muted-foreground">
                      Build on your foundation with more complex signs and conversations
                    </p>
                  </div>
                  {hasIntermediateAccess ? (
                    <Badge variant="outline" className="text-green-600 border-green-500 flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Purchased
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-600 border-amber-600">
                      Premium - GH₵10
                    </Badge>
                  )}
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {intermediateLessons.map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      progress={progressData[lesson.id]}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Advanced Lessons */}
          {advancedLessons.length > 0 && (
            <section className="py-12">
              <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">Advanced Level</h2>
                    <p className="text-muted-foreground">
                      Master complex expressions and professional signing
                    </p>
                  </div>
                  {hasAdvancedAccess ? (
                    <Badge variant="outline" className="text-green-600 border-green-500 flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Purchased
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-purple-600 border-purple-600">
                      Premium - GH₵15
                    </Badge>
                  )}
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {advancedLessons.map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      progress={progressData[lesson.id]}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* No Lessons State */}
          {lessons.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-muted-foreground">No lessons available yet. Check back soon!</p>
            </div>
          )}
        </>
      )}
    </>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background w-full">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-4 px-4 py-3">
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
            <Link to="/" className="flex items-center gap-2">
              <img src="/favicon.ico" alt="GSL Logo" className="h-6 w-6" />
              <span className="font-bold text-lg">GSL Learning</span>
            </Link>
          </div>
        </header>
        {lessonsContent}
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
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SidebarTrigger>
                <div className="flex items-center gap-4 flex-1">
                  <Link to="/" className="flex items-center gap-2">
                    <img src="/favicon.ico" alt="GSL Logo" className="h-6 w-6" />
                    <span className="font-bold text-lg">GSL Learning</span>
                  </Link>
                  <nav className="hidden md:flex gap-4 ml-8">
                    <Link to="/dashboard">
                      <Button variant="ghost">Dashboard</Button>
                    </Link>
                    <Link to="/lessons">
                      <Button variant="ghost" className="font-medium">Lessons</Button>
                    </Link>
                  </nav>
                </div>
              </div>
            </div>
          </header>

          {lessonsContent}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Lessons;
