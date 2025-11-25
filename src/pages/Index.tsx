import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Video, Brain, Award, Users, Globe } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ModeSwitcher } from "@/components/ModeSwitcher";

const Index = () => {
  const navigate = useNavigate();

  const handleModeSelection = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20" />
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-block">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Globe className="h-4 w-4" />
                Learn Ghanaian Sign Language
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Master Sign Language,
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">
                One Lesson at a Time
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Interactive lessons, video demonstrations, and hands-on practice to help you communicate effectively in Ghanaian Sign Language.
            </p>
            
            {/* Mode Switcher */}
            <div className="pt-8">
              <ModeSwitcher onModeSelect={handleModeSelection} />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Learn GSL
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our comprehensive platform provides structured lessons designed for progressive learning
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Video className="h-8 w-8" />}
              title="Video Demonstrations"
              description="Watch clear, high-quality videos showing proper hand shapes and movements for each sign"
              color="primary"
            />
            <FeatureCard
              icon={<img src="/favicon.ico" alt="GSL" className="h-8 w-8" />}
              title="Detailed Lesson Notes"
              description="Comprehensive written guides with tips, common mistakes, and cultural context"
              color="accent"
            />
            <FeatureCard
              icon={<Brain className="h-8 w-8" />}
              title="Interactive Quizzes"
              description="Test your knowledge with engaging quizzes that provide instant feedback and explanations"
              color="secondary"
            />
            <FeatureCard
              icon={<Award className="h-8 w-8" />}
              title="Practice Exercises"
              description="Hands-on activities that build on previous lessons for incremental skill development"
              color="primary"
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Progressive Learning"
              description="Each lesson builds upon the last, ensuring a solid foundation as you advance"
              color="accent"
            />
            <FeatureCard
              icon={<Globe className="h-8 w-8" />}
              title="Cultural Insights"
              description="Learn not just the language, but also the cultural nuances of the Deaf community"
              color="secondary"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of learners mastering Ghanaian Sign Language through our structured, interactive platform.
            </p>
            <Link to="/lessons">
              <Button size="lg" className="bg-accent hover:bg-accent/90 shadow-lg">
                Browse Lessons
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'primary' | 'accent' | 'secondary';
}

const FeatureCard = ({ icon, title, description, color }: FeatureCardProps) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    secondary: 'bg-secondary/10 text-secondary',
  };

  return (
    <div className="group p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]} mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default Index;
