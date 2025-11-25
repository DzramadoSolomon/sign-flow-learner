import { useLearningMode } from '@/contexts/LearningModeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Volume2 } from 'lucide-react';
import type { LearningMode } from '@/contexts/LearningModeContext';

interface ModeSwitcherProps {
  onModeSelect?: (mode: LearningMode) => void;
}

export const ModeSwitcher = ({ onModeSelect }: ModeSwitcherProps) => {
  const { mode, setMode } = useLearningMode();

  const handleModeSelect = (selectedMode: LearningMode) => {
    setMode(selectedMode);
    if (onModeSelect) {
      onModeSelect(selectedMode);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Choose Your Learning Mode</CardTitle>
        <CardDescription>
          Select the mode that best suits your learning needs. You can change this anytime.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-4">
        <Button
          variant={mode === 'deaf' ? 'default' : 'outline'}
          className="h-auto flex-col gap-3 py-6"
          onClick={() => handleModeSelect('deaf')}
        >
          <Eye className="h-8 w-8" />
          <div className="text-center">
            <div className="font-bold text-lg mb-1">Visual Mode</div>
            <div className="text-xs opacity-80">
              Optimized for deaf/hard-of-hearing learners with visual-first content
            </div>
          </div>
        </Button>

        <Button
          variant={mode === 'hearing' ? 'default' : 'outline'}
          className="h-auto flex-col gap-3 py-6"
          onClick={() => handleModeSelect('hearing')}
        >
          <Volume2 className="h-8 w-8" />
          <div className="text-center">
            <div className="font-bold text-lg mb-1">Audio + Visual Mode</div>
            <div className="text-xs opacity-80">
              Includes voice narration and audio guides alongside visual content
            </div>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
};
