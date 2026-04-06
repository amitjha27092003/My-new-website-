import { motion } from "framer-motion";
import { TrendingUp, Clock, Star } from "lucide-react";

const trending = [
  { topic: "Photosynthesis", exam: "NEET", views: "2.3K" },
  { topic: "Newton's Laws of Motion", exam: "JEE", views: "1.8K" },
  { topic: "Indian Constitution", exam: "UPSC", views: "1.5K" },
  { topic: "Organic Chemistry Basics", exam: "JEE", views: "1.2K" },
  { topic: "Human Digestive System", exam: "NEET", views: "980" },
  { topic: "Electric Current", exam: "Boards", views: "870" },
];

export default function Explore() {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2 mt-8">Explore Topics</h1>
          <p className="text-muted-foreground mb-8">Trending AI-generated explanations</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trending.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card-hover p-5 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="px-2 py-0.5 rounded text-xs bg-primary/10 text-primary">{item.exam}</span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3" />
                  {item.views}
                </div>
              </div>
              <h3 className="font-display font-semibold text-foreground">{item.topic}</h3>
              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 3:30 min</span>
                <span className="flex items-center gap-1"><Star className="w-3 h-3" /> 4.8</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
