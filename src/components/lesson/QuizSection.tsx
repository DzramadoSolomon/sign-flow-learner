import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Brain, Trophy } from "lucide-react";
import { QuizQuestion } from "@/types/lesson";
import { toast } from "sonner";

interface QuizSectionProps {
  questions: QuizQuestion[];
}

export const QuizSection = ({ questions }: QuizSectionProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>(
    new Array(questions.length).fill(false)
  );

  const question = questions[currentQuestion];
  const isCorrect = selectedAnswer === question.correctAnswer;
  const allAnswered = answeredQuestions.every((a) => a);

  const handleSubmit = () => {
    if (!selectedAnswer) {
      toast.error("Please select an answer");
      return;
    }

    setShowResult(true);
    
    if (!answeredQuestions[currentQuestion]) {
      const newAnswered = [...answeredQuestions];
      newAnswered[currentQuestion] = true;
      setAnsweredQuestions(newAnswered);
      
      if (isCorrect) {
        setScore(score + 1);
        toast.success("Correct! Well done!");
      } else {
        toast.error("Not quite right. Review the explanation.");
      }
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer("");
      setShowResult(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer("");
      setShowResult(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setShowResult(false);
    setScore(0);
    setAnsweredQuestions(new Array(questions.length).fill(false));
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gradient-to-r from-accent/10 to-secondary/10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-accent" />
            Quiz Time
          </CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            {allAnswered && (
              <div className="flex items-center gap-1 text-accent font-medium">
                <Trophy className="h-4 w-4" />
                {score}/{questions.length}
              </div>
            )}
          </div>
        </div>
        <CardDescription>Test your knowledge from this lesson</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">{question.question}</h3>
          
          <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
            <div className="space-y-3">
              {question.options.map((option) => (
                <div
                  key={option}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                    showResult
                      ? option === question.correctAnswer
                        ? "border-accent bg-accent/10"
                        : option === selectedAnswer
                        ? "border-destructive bg-destructive/10"
                        : "border-border"
                      : "border-border hover:border-primary"
                  }`}
                >
                  <RadioGroupItem
                    value={option}
                    id={option}
                    disabled={showResult}
                  />
                  <Label
                    htmlFor={option}
                    className="flex-1 cursor-pointer text-base"
                  >
                    {option}
                  </Label>
                  {showResult && option === question.correctAnswer && (
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                  )}
                  {showResult &&
                    option === selectedAnswer &&
                    option !== question.correctAnswer && (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {showResult && question.explanation && (
          <div className={`p-4 rounded-lg ${
            isCorrect ? "bg-accent/10 border-l-4 border-accent" : "bg-muted/50 border-l-4 border-primary"
          }`}>
            <p className="font-medium mb-1">
              {isCorrect ? "✓ Correct!" : "Explanation:"}
            </p>
            <p className="text-sm text-foreground/80">{question.explanation}</p>
          </div>
        )}

        <div className="flex justify-between gap-3">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          <div className="flex gap-3">
            {!showResult ? (
              <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
                Submit Answer
              </Button>
            ) : (
              <>
                {currentQuestion < questions.length - 1 ? (
                  <Button onClick={handleNext} className="bg-accent hover:bg-accent/90">
                    Next Question
                  </Button>
                ) : (
                  <Button onClick={resetQuiz} variant="secondary">
                    Restart Quiz
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentQuestion
                  ? "bg-primary w-6"
                  : answeredQuestions[index]
                  ? "bg-accent"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
