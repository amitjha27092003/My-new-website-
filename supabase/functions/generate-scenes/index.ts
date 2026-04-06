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
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const langInstruction = language === "Hindi" 
      ? "Pure Hindi mein likho (Devanagari script nahi, Roman script mein)."
      : language === "English"
      ? "Write in simple English."
      : "Hinglish mein likho (mix of Hindi and English, Roman script).";

    const systemPrompt = `You are Jennie, a fun and energetic AI tutor who explains topics to Indian students preparing for JEE, NEET, UPSC, and board exams. ${langInstruction}

You must respond ONLY with a valid JSON object. No markdown, no code blocks, no extra text.

The JSON must have this exact structure:
{
  "scenes": [
    {
      "id": 1,
      "title": "short title",
      "narration": "what Jennie says (2-3 sentences, conversational)",
      "visual": "description of what to show on screen",
      "emoji": "relevant emoji",
      "keyPoint": "one-line takeaway"
    }
  ]
}

Generate exactly 8 scenes:
1. Introduction - Hook the student with why this topic matters
2. Core Concept - Main definition/theory
3. Visual Explanation - Analogy or diagram description
4. Real-World Example - Practical application
5. Formula/Key Facts - Important formulas or facts
6. Practice Problem - A sample question with solution
7. Common Mistakes - What students get wrong
8. Summary & Exam Tips - Quick revision + exam strategy`;

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
          { role: "user", content: `Explain this topic: "${topic}"` },
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
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response (handle markdown code blocks)
    let scenesData;
    try {
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      scenesData = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response");
    }

    return new Response(JSON.stringify(scenesData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-scenes error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
