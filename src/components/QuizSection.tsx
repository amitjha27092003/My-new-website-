import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, ArrowRight, Download, FileText, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuizQuestion {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface Props {
  quiz: QuizQuestion[];
  topic: string;
}

export default function QuizSection({ quiz, topic }: Props) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!quiz.length) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-muted-foreground">Quiz loading...</p>
      </div>
    );
  }

  const question = quiz[current];

  const handleSelect = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === question.correct) setScore(score + 1);
  };

  const next = () => {
    if (current + 1 >= quiz.length) {
      setFinished(true);
    } else {
      setCurrent(current + 1);
      setSelected(null);
    }
  };

  if (finished) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 text-center max-w-lg mx-auto">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="font-display text-2xl font-bold text-foreground">Quiz Complete!</h3>
        <p className="text-lg text-muted-foreground mt-1">{topic}</p>
        <p className="text-muted-foreground mt-2">You scored <span className="text-accent font-bold">{score}/{quiz.length}</span></p>
        <div className="flex gap-3 justify-center mt-6">
          <Button variant="outline" className="gap-2 border-glass-border"><Download className="w-4 h-4" /> PDF Notes</Button>
          <Button className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground"><FileText className="w-4 h-4" /> Exam Tips</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground">AI Quiz — {topic}</h3>
        <span className="text-sm text-muted-foreground">{current + 1} / {quiz.length}</span>
      </div>

      <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6">
        <p className="text-foreground font-medium mb-4">{question.q}</p>
        <div className="space-y-2">
          {question.options.map((opt, i) => {
            let cls = "glass-card-hover p-3 text-sm text-left w-full flex items-center gap-3";
            if (selected !== null) {
              if (i === question.correct) cls += " !border-accent/50 !bg-accent/10";
              else if (i === selected) cls += " !border-destructive/50 !bg-destructive/10";
            }
            return (
              <button key={i} onClick={() => handleSelect(i)} className={cls}>
                <span className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-medium shrink-0">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-foreground">{opt}</span>
                {selected !== null && i === question.correct && <CheckCircle2 className="w-4 h-4 text-accent ml-auto" />}
                {selected !== null && i === selected && i !== question.correct && <XCircle className="w-4 h-4 text-destructive ml-auto" />}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 rounded-lg bg-secondary/50 flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-accent mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">{question.explanation}</p>
          </motion.div>
        )}
      </motion.div>

      {selected !== null && (
        <div className="flex justify-end">
          <Button onClick={next} className="gap-2">
            {current + 1 >= quiz.length ? "Finish" : "Next"} <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
