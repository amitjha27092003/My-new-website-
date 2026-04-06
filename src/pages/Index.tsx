import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Zap, BookOpen, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TopicInput from "@/components/TopicInput";
import ExamCategories from "@/components/ExamCategories";
import VideoPlayer from "@/components/VideoPlayer";
import QuizSection from "@/components/QuizSection";
import NotesSection from "@/components/NotesSection";
import LoadingState from "@/components/LoadingState";
import type { Scene } from "@/types/scenes";

interface QuizQuestion {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
}

export default function Index() {
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [activeTab, setActiveTab] = useState<"video" | "quiz" | "notes">("video");
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [examTips, setExamTips] = useState("");
  const { toast } = useToast();

  const language = "Hinglish"; // TODO: get from navbar context

  const handleSubmit = async (inputTopic: string, file?: File) => {
    setIsLoading(true);
    setLoadingStep(0);
    setShowResult(false);
    setScenes([]);
    setQuiz([]);
    setNotes([]);
    setExamTips("");
    setActiveTab("video");

    try {
      let finalTopic = inputTopic;

      // Step 1: If image uploaded, extract topic via OCR
      if (file) {
        setLoadingStep(0); // "Analyzing your topic..."
        const base64 = await fileToBase64(file);
        const { data: ocrData, error: ocrError } = await supabase.functions.invoke("extract-topic", {
          body: { imageBase64: base64, mimeType: file.type },
        });

        if (ocrError) throw new Error("Image analysis failed");
        finalTopic = ocrData.topic || inputTopic || "General Topic";
        console.log("Extracted topic from image:", finalTopic);
      }

      if (!finalTopic) {
        toast({ title: "Please enter a topic or upload an image", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      setTopic(finalTopic);

      // Step 2: Generate scenes
      setLoadingStep(1); // "Breaking into 8 scenes..."
      const { data: scenesData, error: scenesError } = await supabase.functions.invoke("generate-scenes", {
        body: { topic: finalTopic, language },
      });

      if (scenesError) throw new Error("Scene generation failed");
      setScenes(scenesData.scenes || []);
      setLoadingStep(3); // "Creating animations..."

      // Step 3: Generate quiz + notes in parallel
      setLoadingStep(4); // "Adding voiceover..."
      const { data: contentData, error: contentError } = await supabase.functions.invoke("generate-content", {
        body: { topic: finalTopic, language },
      });

      if (contentError) throw new Error("Content generation failed");
      setQuiz(contentData.quiz || []);
      setNotes(contentData.notes || []);
      setExamTips(contentData.examTips || "");

      setLoadingStep(5); // "Rendering video..."
      setTimeout(() => {
        setIsLoading(false);
        setShowResult(true);
      }, 500);
    } catch (error: any) {
      console.error("Generation error:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const stats = [
    { icon: Video, label: "Videos Generated", value: "12K+" },
    { icon: BookOpen, label: "Topics Covered", value: "5K+" },
    { icon: Zap, label: "Avg. Score Boost", value: "40%" },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12">
      {/* BG decorations */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/5 blur-[100px] animate-pulse-glow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-accent/5 blur-[120px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {!showResult ? (
          <>
            {/* Hero */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12 mt-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                Powered by AI
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
                <span className="text-foreground">Learn Any Topic with</span>
                <br />
                <span className="glow-text">AI Video Explanations</span>
              </h1>
              <p className="text-muted-foreground max-w-lg mx-auto text-lg">
                Type a topic or upload a screenshot — get an 8-scene animated video explanation with Hinglish voiceover, quizzes & notes.
              </p>
            </motion.div>

            {isLoading ? (
              <LoadingState step={loadingStep} />
            ) : (
              <>
                <TopicInput onSubmit={handleSubmit} isLoading={isLoading} />

                {/* Stats */}
                <div className="flex justify-center gap-8 mt-10 mb-12">
                  {stats.map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.1 }} className="text-center">
                      <p className="font-display font-bold text-xl glow-text">{s.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Exam Categories */}
                <div className="mt-8">
                  <h2 className="font-display font-semibold text-foreground text-center mb-6">Choose Your Exam</h2>
                  <ExamCategories onSelect={(exam) => handleSubmit(`${exam} Preparation`)} />
                </div>
              </>
            )}
          </>
        ) : (
          /* Result View */
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-4 mb-6 mt-6">
              <button onClick={() => { setShowResult(false); window.speechSynthesis.cancel(); }} className="text-muted-foreground hover:text-foreground text-sm">← Back</button>
              <h2 className="font-display font-bold text-xl text-foreground">{topic}</h2>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 glass-card w-fit mb-6">
              {(["video", "quiz", "notes"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                    activeTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "video" && <VideoPlayer topic={topic} scenes={scenes} />}
            {activeTab === "quiz" && <QuizSection quiz={quiz} topic={topic} />}
            {activeTab === "notes" && <NotesSection topic={topic} notes={notes} examTips={examTips} />}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data:image/...;base64, prefix
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
