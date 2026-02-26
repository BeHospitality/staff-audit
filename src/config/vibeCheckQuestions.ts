export interface QuestionOption {
  value: number;
  emoji: string;
  label: string;
}

export interface Question {
  id: number;
  text: string;
  options: QuestionOption[];
}

export const questions: Question[] = [
  {
    id: 1,
    text: "How easy is it to fill an open role right now?",
    options: [
      { value: 1, emoji: "😰", label: "Nightmare" },
      { value: 2, emoji: "😟", label: "Very difficult" },
      { value: 3, emoji: "😐", label: "Takes time" },
      { value: 4, emoji: "😊", label: "Manageable" },
      { value: 5, emoji: "😌", label: "No problem" },
    ],
  },
  {
    id: 2,
    text: "How many of your team would you rehire tomorrow?",
    options: [
      { value: 1, emoji: "😬", label: "Very few" },
      { value: 2, emoji: "😟", label: "Less than half" },
      { value: 3, emoji: "😐", label: "About half" },
      { value: 4, emoji: "😊", label: "Most of them" },
      { value: 5, emoji: "😍", label: "Almost all" },
    ],
  },
  {
    id: 3,
    text: "If a competitor offered €1/hr more, how many would stay?",
    options: [
      { value: 1, emoji: "😰", label: "We'd lose many" },
      { value: 2, emoji: "😟", label: "We'd lose some" },
      { value: 3, emoji: "😐", label: "Hard to say" },
      { value: 4, emoji: "💪", label: "Most would stay" },
      { value: 5, emoji: "💪", label: "They'd stay for sure" },
    ],
  },
  {
    id: 4,
    text: "How often do new hires make it past 90 days?",
    options: [
      { value: 1, emoji: "😬", label: "Rarely" },
      { value: 2, emoji: "😟", label: "Sometimes" },
      { value: 3, emoji: "😐", label: "About half" },
      { value: 4, emoji: "😊", label: "Usually" },
      { value: 5, emoji: "✅", label: "Almost always" },
    ],
  },
  {
    id: 5,
    text: "Rate your team's energy on a typical Monday morning.",
    options: [
      { value: 1, emoji: "😴", label: "Flat / exhausted" },
      { value: 2, emoji: "😟", label: "Low energy" },
      { value: 3, emoji: "😐", label: "Neutral" },
      { value: 4, emoji: "😊", label: "Pretty good" },
      { value: 5, emoji: "🔥", label: "Buzzing" },
    ],
  },
];
