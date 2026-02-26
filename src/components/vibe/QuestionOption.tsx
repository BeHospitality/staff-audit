import type { QuestionOption as OptionType } from "@/config/vibeCheckQuestions";

interface QuestionOptionProps {
  option: OptionType;
  selected: boolean;
  onSelect: (value: number) => void;
}

export default function QuestionOption({ option, selected, onSelect }: QuestionOptionProps) {
  return (
    <button
      onClick={() => onSelect(option.value)}
      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 min-h-[56px] cursor-pointer ${
        selected
          ? "border-primary bg-primary/10 scale-[1.02] shadow-sm"
          : "border-border bg-card hover:border-muted-foreground/40 hover:bg-secondary"
      }`}
    >
      <span className="text-3xl flex-shrink-0">{option.emoji}</span>
      <span className={`text-base ${selected ? "text-foreground font-medium" : "text-muted-foreground"}`}>
        {option.label}
      </span>
    </button>
  );
}
