import { motion } from "framer-motion";

interface Props {
  topic: string;
  notes: string[];
  examTips: string;
}

export default function NotesSection({ topic, notes, examTips }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 max-w-2xl">
      <h3 className="font-display font-semibold text-foreground mb-4">📝 Quick Notes — {topic}</h3>
      <div className="space-y-3 text-sm text-muted-foreground">
        {notes.map((note, i) => (
          <p key={i}>• {note}</p>
        ))}
      </div>
      {examTips && (
        <div className="mt-6 p-4 rounded-lg bg-accent/5 border border-accent/20">
          <h4 className="text-accent font-semibold text-sm mb-2">💡 Exam Tips</h4>
          <p className="text-xs text-muted-foreground">{examTips}</p>
        </div>
      )}
    </motion.div>
  );
}
