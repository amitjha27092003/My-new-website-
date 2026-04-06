import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, language = "Hinglish" } = await req.json();

    if (!topic || typeof topic !== "string" || topic.length > 500) {
      return new Response(JSON.stringify({ error: "Invalid topic" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langInstruction = language === "Hindi"
      ? "Pure Hindi mein likho (Roman script mein)."
      : language === "English"
      ? "Write in simple English."
      : "Hinglish mein likho (mix of Hindi and English, Roman script).";

    const systemPrompt = `You are an expert AI tutor. Generate a quiz and notes for the given topic. ${langInstruction}

You must respond ONLY with a valid JSON object. No markdown, no code blocks.

{
  "quiz": [
    {
      "q": "question text",
      "options": ["A", "B", "C", "D"],
      "correct": 0,
      "explanation": "why this answer is correct"
    }
  ],
  "notes": [
    "bullet point 1",
    "bullet point 2",
    "bullet point 3",
    "bullet point 4",
    "bullet point 5"
  ],
  "examTips": "specific exam tips for this topic"
}

Generate exactly 5 quiz questions and 5 notes bullet points. All content must be specifically about the given topic - NOT about any other topic.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate quiz and notes specifically about: "${topic}". Make sure ALL questions and notes are about "${topic}" only.` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse:", content);
      throw new Error("Failed to parse AI response");
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-content error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
