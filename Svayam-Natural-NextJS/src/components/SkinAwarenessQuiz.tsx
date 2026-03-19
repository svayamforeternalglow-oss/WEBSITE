"use client";

import { useState } from "react";
import { programLinks } from "@/config/programLinks";

type AnswerKey = "A" | "B" | "C" | "D";

const QUIZ_STEPS = [
  {
    id: 1,
    title: "Skin Tightness",
    question: "How does your skin feel when you wake up in the morning?",
    options: [
      { key: "A" as AnswerKey, label: "Firm and fresh" },
      { key: "B" as AnswerKey, label: "Slightly dull or tired" },
      { key: "C" as AnswerKey, label: "Loose or sagging in some areas" },
      { key: "D" as AnswerKey, label: "Puffy and swollen" },
    ],
  },
  {
    id: 2,
    title: "Fine Lines",
    question: "Do you notice fine lines around these areas?",
    options: [
      { key: "A" as AnswerKey, label: "No lines yet" },
      { key: "B" as AnswerKey, label: "Around eyes sometimes" },
      { key: "C" as AnswerKey, label: "Around mouth and forehead" },
      { key: "D" as AnswerKey, label: "Visible wrinkles in multiple areas" },
    ],
  },
  {
    id: 3,
    title: "Jawline Definition",
    question: "How would you describe your jawline?",
    options: [
      { key: "A" as AnswerKey, label: "Sharp and defined" },
      { key: "B" as AnswerKey, label: "Slightly soft" },
      { key: "C" as AnswerKey, label: "Double chin appearing" },
      { key: "D" as AnswerKey, label: "Loose skin under chin" },
    ],
  },
  {
    id: 4,
    title: "Skin Glow",
    question: "How often do people compliment your skin glow?",
    options: [
      { key: "A" as AnswerKey, label: "Very often" },
      { key: "B" as AnswerKey, label: "Sometimes" },
      { key: "C" as AnswerKey, label: "Rarely" },
      { key: "D" as AnswerKey, label: "Almost never" },
    ],
  },
  {
    id: 5,
    title: "Facial Stress & Lifestyle",
    question: "Which of these affects you most?",
    options: [
      { key: "A" as AnswerKey, label: "Long screen time" },
      { key: "B" as AnswerKey, label: "Stress and poor sleep" },
      { key: "C" as AnswerKey, label: "Irregular diet" },
      { key: "D" as AnswerKey, label: "All of the above" },
    ],
  },
  {
    id: 6,
    title: "Face Exercise Awareness",
    question: "Do you practice face yoga or facial exercises?",
    options: [
      { key: "A" as AnswerKey, label: "Regularly" },
      { key: "B" as AnswerKey, label: "Occasionally" },
      { key: "C" as AnswerKey, label: "Tried but inconsistent" },
      { key: "D" as AnswerKey, label: "Never" },
    ],
  },
];

const RESULT_MESSAGES: Record<AnswerKey, { emoji: string; title: string; body: string }> = {
  A: {
    emoji: "🌿",
    title: "Mostly A's",
    body: "Your skin is in good condition but needs maintenance and prevention.",
  },
  B: {
    emoji: "✨",
    title: "Mostly B's",
    body: "Early signs of skin dullness and muscle weakness are starting.",
  },
  C: {
    emoji: "⚠️",
    title: "Mostly C's",
    body: "Your facial muscles may be losing tone, which can cause sagging and wrinkles.",
  },
  D: {
    emoji: "🚨",
    title: "Mostly D's",
    body: "Your skin is showing clear signs of stress, sagging, and loss of natural glow.",
  },
};

function getResultBucket(answers: AnswerKey[]): AnswerKey {
  const counts = { A: 0, B: 0, C: 0, D: 0 };
  for (const a of answers) counts[a]++;
  const max = Math.max(counts.A, counts.B, counts.C, counts.D);
  if (counts.D === max) return "D";
  if (counts.C === max) return "C";
  if (counts.B === max) return "B";
  return "A";
}

export default function SkinAwarenessQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(AnswerKey | null)[]>(
    Array(QUIZ_STEPS.length).fill(null)
  );
  const [showResults, setShowResults] = useState(false);

  const currentAnswer = answers[step];
  const isLastStep = step === QUIZ_STEPS.length - 1;
  const allAnswered = answers.every((a) => a !== null);

  const handleSelect = (key: AnswerKey) => {
    const next = [...answers];
    next[step] = key;
    setAnswers(next);
  };

  const handleNext = () => {
    if (isLastStep) {
      setShowResults(true);
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleRetake = () => {
    setStep(0);
    setAnswers(Array(QUIZ_STEPS.length).fill(null));
    setShowResults(false);
  };

  if (showResults) {
    const bucket = getResultBucket(answers as AnswerKey[]);
    const result = RESULT_MESSAGES[bucket];
    return (
      <section className="relative overflow-hidden bg-forest py-20" id="quiz">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-gold)_0%,transparent_70%)] opacity-[0.04]" />
        <div className="relative mx-auto max-w-2xl px-6 lg:px-10">
          <div className="rounded-2xl border border-gold/20 bg-forest/50 p-8 backdrop-blur-sm md:p-10">
            <h2 className="mb-6 font-heading text-2xl font-bold text-gold md:text-3xl">
              {result.emoji} {result.title}
            </h2>
            <p className="mb-8 text-sand/80">{result.body}</p>

            <h3 className="mb-4 font-heading text-lg font-semibold text-gold">
              💆‍♀️ Recommendation
            </h3>
            <p className="mb-6 text-sand/70">
              Based on your results, your skin will benefit greatly from{" "}
              <em>facial muscle activation and circulation exercises</em>.
            </p>
            <p className="mb-4 text-sand/70">
              My <strong>5-Day Radiance Reset Face Yoga Program</strong> helps you:
            </p>
            <ul className="mb-8 space-y-2 text-sand/70">
              {[
                "Improve skin glow",
                "Lift sagging cheeks",
                "Reduce double chin",
                "Boost blood circulation",
                "Naturally tone facial muscles",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-gold">✓</span> {item}
                </li>
              ))}
            </ul>

            <a
              href={programLinks.radianceReset5Days}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-6 block w-full rounded-full bg-gold px-10 py-4 text-center text-sm font-bold uppercase tracking-wider text-forest transition-all duration-300 hover:bg-gold-light hover:shadow-[0_0_40px_rgba(194,162,93,0.3)]"
            >
              Join the next batch here
            </a>

            <p className="mb-6 text-center font-accent italic text-gold/90">
              &ldquo;Most people see visible glow within 5 days.&rdquo;
            </p>

            <button
              onClick={handleRetake}
              className="mx-auto block rounded-full border border-gold/40 px-8 py-2 text-sm font-medium text-gold transition-all hover:border-gold hover:bg-gold/10"
            >
              Retake quiz
            </button>
          </div>
        </div>
      </section>
    );
  }

  const currentStep = QUIZ_STEPS[step];
  return (
    <section className="relative overflow-hidden bg-forest py-20" id="quiz">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-gold)_0%,transparent_70%)] opacity-[0.04]" />
      <div className="relative mx-auto max-w-2xl px-6 lg:px-10">
        <div className="rounded-2xl border border-gold/20 bg-forest/50 p-8 backdrop-blur-sm md:p-10">
          {step === 0 && (
            <div className="mb-8">
              <h2 className="mb-4 font-heading text-2xl font-bold text-white md:text-3xl">
                2 Minute Skin Awareness Quiz
              </h2>
              <p className="text-sand/70">
                Take this quick 2-minute quiz to discover your skin age and
                facial muscle condition. You&rsquo;ll also get personalized tips
                and access to my{" "}
                <strong className="text-gold">5-Day Radiance Reset Face Yoga Program</strong>.
              </p>
            </div>
          )}

          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gold/80">
            Step {step + 1} of {QUIZ_STEPS.length}
          </p>
          <h3 className="mb-4 font-heading text-xl font-bold text-white">
            {currentStep.title}
          </h3>
          <p className="mb-6 text-sand/80">{currentStep.question}</p>

          <ul className="mb-8 space-y-3">
            {currentStep.options.map((opt) => (
              <li key={opt.key}>
                <button
                  type="button"
                  onClick={() => handleSelect(opt.key)}
                  className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all ${
                    currentAnswer === opt.key
                      ? "border-gold bg-gold/20 text-gold"
                      : "border-sand/20 text-sand/80 hover:border-gold/40 hover:bg-gold/5"
                  }`}
                >
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">
                    {opt.key}
                  </span>
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex gap-4">
            {step > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="rounded-full border border-gold/40 px-6 py-2 text-sm font-medium text-gold transition-all hover:border-gold hover:bg-gold/10"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={!currentAnswer}
              className="flex-1 rounded-full bg-gold px-8 py-3 text-sm font-bold uppercase tracking-wider text-forest transition-all duration-300 hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLastStep ? "See Results" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
