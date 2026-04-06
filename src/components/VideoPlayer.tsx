import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Scene } from "@/types/scenes";

interface Props {
  topic: string;
  scenes: Scene[];
}

// Scene background colors/gradients
const sceneStyles = [
  "from-violet-900/40 to-indigo-900/40",
  "from-blue-900/40 to-cyan-900/40",
  "from-emerald-900/40 to-teal-900/40",
  "from-amber-900/40 to-orange-900/40",
  "from-rose-900/40 to-pink-900/40",
  "from-sky-900/40 to-blue-900/40",
  "from-red-900/40 to-rose-900/40",
  "from-green-900/40 to-emerald-900/40",
];

export default function VideoPlayer({ topic, scenes }: Props) {
  const [playing, setPlaying] = useState(false);
  const [currentScene, setCurrentScene] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const progress = ((currentScene + 1) / scenes.length) * 100;

  const scene = scenes[currentScene];

  const speak = useCallback((text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Try Hindi voice for Hinglish feel
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v => v.lang.startsWith("hi")) 
      || voices.find(v => v.lang.startsWith("en-IN"))
      || voices.find(v => v.lang.startsWith("en"));
    if (hindiVoice) utterance.voice = hindiVoice;
    utterance.rate = 0.9;
    utterance.pitch = 1.1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      // Auto-advance to next scene when narration finishes
      if (playing) {
        setCurrentScene(prev => {
          if (prev + 1 < scenes.length) return prev + 1;
          setPlaying(false);
          return prev;
        });
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled, playing, scenes.length]);

  // Speak narration when scene changes and playing
  useEffect(() => {
    if (playing && scene) {
      speak(scene.narration);
    }
    return () => {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    };
  }, [currentScene, playing, scene, speak]);

  // Load voices
  useEffect(() => {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }, []);

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      window.speechSynthesis.cancel();
    } else {
      setPlaying(true);
    }
  };

  const goToScene = (idx: number) => {
    window.speechSynthesis.cancel();
    setCurrentScene(idx);
    if (playing) {
      // Will re-trigger speak via useEffect
    }
  };

  if (!scenes.length) return null;

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      {/* Video Area */}
      <div className="lg:col-span-2">
        <div className="glass-card overflow-hidden">
          <div className={`aspect-video bg-gradient-to-br ${sceneStyles[currentScene % sceneStyles.length]} flex items-center justify-center relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/30" />
            
            {/* Animated background shapes */}
            <motion.div
              key={`bg-${currentScene}`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute top-8 right-8 text-8xl opacity-20"
            >
              {scene.emoji}
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentScene}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="text-center z-10 px-8 max-w-2xl"
              >
                {/* Jennie avatar */}
                <motion.div
                  animate={isSpeaking ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                  transition={isSpeaking ? { duration: 0.5, repeat: Infinity } : {}}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-3"
                >
                  <span className="text-xl">👩‍🏫</span>
                </motion.div>

                <h3 className="font-display font-bold text-lg text-foreground mb-1">
                  {scene.emoji} {scene.title}
                </h3>

                {/* Narration text with typing effect */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-foreground/80 italic leading-relaxed mt-3"
                >
                  "{scene.narration}"
                </motion.p>

                {/* Key point */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-4 inline-block px-4 py-2 rounded-full bg-accent/10 border border-accent/30"
                >
                  <p className="text-xs text-accent font-medium">💡 {scene.keyPoint}</p>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="p-4">
            <Progress value={progress} className="h-1 mb-3" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => goToScene(Math.max(0, currentScene - 1))}>
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button size="icon" className="bg-primary text-primary-foreground" onClick={togglePlay}>
                  {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => goToScene(Math.min(scenes.length - 1, currentScene + 1))}>
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Scene {currentScene + 1}/{scenes.length}</span>
                <Button variant="ghost" size="icon" onClick={() => { setVoiceEnabled(!voiceEnabled); if (voiceEnabled) window.speechSynthesis.cancel(); }}>
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scene List */}
      <div className="glass-card p-4 max-h-[500px] overflow-y-auto">
        <h3 className="font-display font-semibold text-foreground mb-3">8 Scenes — {topic}</h3>
        <div className="space-y-2">
          {scenes.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goToScene(i)}
              className={`w-full text-left p-3 rounded-lg transition-all text-sm ${
                i === currentScene
                  ? "bg-primary/15 border border-primary/30 text-foreground"
                  : i < currentScene
                  ? "text-muted-foreground opacity-60"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{s.emoji}</span>
                <span className="flex-1 truncate">{s.id}. {s.title}</span>
                {i < currentScene && <span className="text-accent text-xs">✓</span>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
