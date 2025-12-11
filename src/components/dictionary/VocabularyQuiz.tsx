import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Trophy,
  Star
} from "lucide-react";
import { dictionaryWords, type DictionaryWord } from "@/data/dictionary";

interface VocabularyQuizProps {
  favorites: string[];
  onBack: () => void;
}

const VocabularyQuiz = ({ favorites, onBack }: VocabularyQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  // Get favorited words data
  const favoritedWords = useMemo(() => {
    return dictionaryWords.filter(w => favorites.includes(w.word));
  }, [favorites]);

  // Generate quiz questions from favorited words
  const quizQuestions = useMemo(() => {
    if (favoritedWords.length < 4) return [];
    
    const shuffled = [...favoritedWords].sort(() => Math.random() - 0.5);
    const questions = shuffled.slice(0, Math.min(10, shuffled.length));
    
    return questions.map(correctWord => {
      // Get 3 wrong options from other words
      const otherWords = dictionaryWords
        .filter(w => w.word !== correctWord.word)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      const options = [correctWord, ...otherWords]
        .sort(() => Math.random() - 0.5);
      
      return {
        word: correctWord,
        options,
        correctAnswer: correctWord.word
      };
    });
  }, [favoritedWords]);

  const currentQ = quizQuestions[currentQuestion];
  const progress = ((currentQuestion) / quizQuestions.length) * 100;

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
    setShowResult(true);
    
    if (answer === currentQ.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion + 1 >= quizQuestions.length) {
      setQuizComplete(true);
    } else {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizComplete(false);
  };

  // Not enough favorites
  if (favorites.length < 4) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <Star className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Need More Favorites</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-xs">
          Add at least 4 words to your favorites to start the quiz. 
          You currently have {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}.
        </p>
        <Button onClick={onBack} variant="outline">
          Browse Dictionary
        </Button>
      </div>
    );
  }

  // Quiz complete - show results
  if (quizComplete) {
    const percentage = Math.round((score / quizQuestions.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Trophy className={`h-8 w-8 ${percentage >= 70 ? 'text-yellow-500' : 'text-primary'}`} />
        </div>
        <h3 className="text-xl font-bold mb-2">Quiz Complete!</h3>
        <p className="text-3xl font-bold text-primary mb-2">
          {score}/{quizQuestions.length}
        </p>
        <p className="text-sm text-muted-foreground mb-1">
          {percentage}% correct
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          {percentage >= 90 ? "Excellent! You're a GSL master!" :
           percentage >= 70 ? "Great job! Keep practicing!" :
           percentage >= 50 ? "Good effort! Review your favorites." :
           "Keep learning! Practice makes perfect."}
        </p>
        <div className="flex gap-3">
          <Button onClick={handleRestart} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Try Again
          </Button>
          <Button onClick={onBack} variant="outline">
            Back to Dictionary
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 px-3">
      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">
            Question {currentQuestion + 1} of {quizQuestions.length}
          </span>
          <Badge variant="secondary" className="gap-1">
            <Trophy className="h-3 w-3" />
            {score}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Video Question */}
      <Card className="p-3 mb-4">
        <p className="text-sm font-medium text-muted-foreground mb-3 text-center">
          Watch the sign and select the correct word:
        </p>
        <div className="aspect-video rounded-lg overflow-hidden bg-muted mb-2">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${currentQ.word.videoId}`}
            title="Sign language video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <p className="text-xs text-center text-muted-foreground">
          {currentQ.word.category}
        </p>
      </Card>

      {/* Answer Options */}
      <div className="space-y-2 mb-4">
        {currentQ.options.map((option) => {
          const isSelected = selectedAnswer === option.word;
          const isCorrect = option.word === currentQ.correctAnswer;
          
          let variant: "default" | "outline" | "destructive" | "secondary" = "outline";
          let className = "";
          
          if (showResult) {
            if (isCorrect) {
              className = "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400";
            } else if (isSelected && !isCorrect) {
              className = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400";
            }
          }
          
          return (
            <Button
              key={option.word}
              variant={variant}
              className={`w-full justify-start h-auto py-3 px-4 text-left ${className}`}
              onClick={() => handleAnswerSelect(option.word)}
              disabled={showResult}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="flex-1">
                  <span className="font-medium text-sm">{option.word}</span>
                  <p className="text-xs text-muted-foreground truncate">
                    {option.description}
                  </p>
                </div>
                {showResult && isCorrect && (
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                )}
                {showResult && isSelected && !isCorrect && (
                  <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                )}
              </div>
            </Button>
          );
        })}
      </div>

      {/* Next Button */}
      {showResult && (
        <Button onClick={handleNext} className="w-full">
          {currentQuestion + 1 >= quizQuestions.length ? "See Results" : "Next Question"}
        </Button>
      )}
    </div>
  );
};

export default VocabularyQuiz;
