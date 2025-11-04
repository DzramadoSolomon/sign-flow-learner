import { BookOpen, Search, Menu, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LessonCard } from "@/components/LessonCard";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { LessonMetadata } from "@/types/lesson";
import lesson1Data from "@/data/lessons/beginner/lesson1.json";
import lesson2Data from "@/data/lessons/beginner/lesson2.json";
import lesson3Data from "@/data/lessons/beginner/lesson3.json";

const Lessons = () => {
  const lessons = [
    lesson1Data.metadata as LessonMetadata,
    lesson2Data.metadata as LessonMetadata,
    lesson3Data.metadata as LessonMetadata,
  ];
  
  // Mock progress data
  const progressData: { [key: string]: number } = {
    'beginner-1': 100,
    'beginner-2': 100,
    'beginner-3': 100,
  };

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
                    <BookOpen className="h-6 w-6 text-primary" />
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
                  Beginner
                </Badge>
                <Badge variant="outline" className="text-sm py-1.5 px-3">
                  Intermediate (Coming Soon)
                </Badge>
                <Badge variant="outline" className="text-sm py-1.5 px-3">
                  Advanced (Coming Soon)
                </Badge>
              </div>
            </div>
          </section>

          {/* Lessons Grid */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Beginner Level</h2>
                  <p className="text-muted-foreground">
                    Start your GSL journey with foundational lessons
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    progress={progressData[lesson.id]}
                  />
                ))}
              </div>

              {/* Coming Soon Section */}
              <div className="mt-16 p-8 rounded-xl bg-muted/30 border-2 border-dashed border-border text-center">
                <h3 className="text-xl font-semibold mb-2">More Lessons Coming Soon!</h3>
                <p className="text-muted-foreground">
                  We're working on adding more beginner lessons and intermediate content. Check back soon!
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Lessons;
