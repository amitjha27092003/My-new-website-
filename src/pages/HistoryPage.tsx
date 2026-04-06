import { motion } from "framer-motion";
import { Clock, Play, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const history = [
  { topic: "Cell Biology", date: "2 hours ago", score: "4/5", exam: "NEET" },
  { topic: "Thermodynamics", date: "Yesterday", score: "3/5", exam: "JEE" },
  { topic: "Indian Independence", date: "3 days ago", score: "5/5", exam: "UPSC" },
];

export default function HistoryPage() {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2 mt-8">Your History</h1>
          <p className="text-muted-foreground mb-8">Continue where you left off</p>
        </motion.div>

        <div className="space-y-3 max-w-2xl">
          {history.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="glass-card-hover p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                <Play className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground">{item.topic}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.date}</span>
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary">{item.exam}</span>
                  <span>Quiz: {item.score}</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground"><FileText className="w-4 h-4" /></Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
