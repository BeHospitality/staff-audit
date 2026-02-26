interface VibeProgressBarProps {
  currentStep: number; // 0 = pre-screen, 1-5 = questions
  totalSteps: number; // 6
}

export default function VibeProgressBar({ currentStep, totalSteps }: VibeProgressBarProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const questionNumber = currentStep > 0 ? currentStep : null;

  return (
    <div className="w-full space-y-2">
      <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      {questionNumber && (
        <p className="text-xs text-muted-foreground text-center">
          Question {questionNumber} of 5
        </p>
      )}
    </div>
  );
}
