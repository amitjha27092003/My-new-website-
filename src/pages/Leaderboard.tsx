import { motion } from "framer-motion";
import { Trophy, Medal, Crown } from "lucide-react";

const leaders = [
  { name: "Priya S.", score: 2450, topics: 48, badge: "🥇" },
  { name: "Arjun K.", score: 2180, topics: 42, badge: "🥈" },
  { name: "Sneha R.", score: 1920, topics: 38, badge: "🥉" },
  { name: "Rahul M.", score: 1750, topics: 35, badge: "" },
  { name: "Ananya P.", score: 1680, topics: 33, badge: "" },
];

export default function Leaderboard() {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2 mt-8 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-accent" /> Leaderboard
          </h1>
          <p className="text-muted-foreground mb-8">Top learners this week</p>
        </motion.div>

        <div className="max-w-xl space-y-3">
          {leaders.map((user, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className={`glass-card-hover p-4 flex items-center gap-4 ${i === 0 ? "glow-border" : ""}`}>
              <span className="w-8 text-center text-lg">{user.badge || `#${i + 1}`}</span>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                {user.name[0]}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.topics} topics completed</p>
              </div>
              <span className="font-display font-bold glow-text">{user.score}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
