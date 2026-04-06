import { motion } from "framer-motion";
import { Brain, Sparkles } from "lucide-react";

const steps = [
  "Analyzing your topic...",
  "Breaking into 8 scenes...",
  "Generating Hinglish script...",
  "Creating animations...",
  "Adding voiceover...",
  "Rendering video...",
];

interface Props {
  step?: number;
}

export default function LoadingState({ step = 0 }: Props) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 max-w-md mx-auto text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6"
      >
        <Brain className="w-8 h-8 text-primary-foreground" />
      </motion.div>

      <h3 className="font-display font-bold text-lg text-foreground mb-2">AI is thinking...</h3>

      <div className="space-y-2 mt-6">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: i <= step ? 1 : 0.3 }}
            className="flex items-center gap-2 text-sm"
          >
            {i <= step ? (
              <Sparkles className="w-3 h-3 text-accent" />
            ) : (
              <div className="w-3 h-3 rounded-full bg-muted" />
            )}
            <span className={i <= step ? "text-foreground" : "text-muted-foreground"}>{s}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
