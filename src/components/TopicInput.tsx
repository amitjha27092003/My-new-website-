import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Search, Upload, Sparkles, X, Image } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopicInputProps {
  onSubmit: (topic: string, file?: File) => void;
  isLoading?: boolean;
}

export default function TopicInput({ onSubmit, isLoading }: TopicInputProps) {
  const [topic, setTopic] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith("image/")) handleFile(f);
  };

  const submit = () => {
    if (topic.trim() || file) onSubmit(topic.trim(), file || undefined);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="glass-card p-1.5" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Type any topic... e.g., Photosynthesis, Newton's Laws"
              className="w-full bg-transparent py-3 text-foreground placeholder:text-muted-foreground focus:outline-none"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground shrink-0" onClick={() => fileRef.current?.click()}>
            <Upload className="w-5 h-5" />
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2 shrink-0" onClick={submit} disabled={isLoading}>
            <Sparkles className="w-4 h-4" />
            Generate
          </Button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>

      {preview && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 glass-card p-3 flex items-center gap-3">
          <img src={preview} alt="Upload preview" className="w-16 h-16 rounded-lg object-cover" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground truncate">{file?.name}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Image className="w-3 h-3" /> OCR will extract the topic</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => { setFile(null); setPreview(null); }}>
            <X className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      <p className="text-center text-xs text-muted-foreground mt-3">
        📸 Upload a textbook screenshot or diagram for AI-powered topic extraction
      </p>
    </motion.div>
  );
}
