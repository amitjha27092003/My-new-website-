import { motion } from "framer-motion";
import { GraduationCap, Atom, Landmark, BookOpen } from "lucide-react";

const exams = [
  { name: "JEE", icon: Atom, color: "from-orange-500 to-red-500", topics: "Physics, Chemistry, Maths" },
  { name: "NEET", icon: GraduationCap, color: "from-green-500 to-emerald-500", topics: "Biology, Physics, Chemistry" },
  { name: "UPSC", icon: Landmark, color: "from-blue-500 to-indigo-500", topics: "History, Polity, Geography" },
  { name: "Boards", icon: BookOpen, color: "from-purple-500 to-pink-500", topics: "All Subjects, Class 10-12" },
];

interface Props {
  onSelect: (exam: string) => void;
}

export default function ExamCategories({ onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {exams.map((exam, i) => (
        <motion.button
          key={exam.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          onClick={() => onSelect(exam.name)}
          className="glass-card-hover p-5 text-left group"
        >
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${exam.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
            <exam.icon className="w-5 h-5 text-primary-foreground" />
          </div>
          <h3 className="font-display font-semibold text-foreground">{exam.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">{exam.topics}</p>
        </motion.button>
      ))}
    </div>
  );
}
