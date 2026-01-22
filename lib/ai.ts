'use server';

import OpenAI from "openai";

// Initialize OpenAI client with DeepSeek configuration
const client = new OpenAI({
  baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

/**
 * Cleans the AI response string by removing Markdown code blocks and whitespace.
 * Attempts to extract JSON if embedded in text.
 */
function cleanResponse(text: string): string {
  let cleaned = text.trim();
  
  // Try to find JSON code block first
  const jsonBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch) {
    return jsonBlockMatch[1].trim();
  }
  
  // If no code block, try to find the outermost braces
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return cleaned.substring(firstBrace, lastBrace + 1);
  }
  
  return cleaned;
}

/**
 * Generates the graph data from a user prompt with context awareness.
 */
export async function generateGraphData(prompt: string, currentNodes: { id: string, label: string }[] = []) {
  try {
    const simplifiedNodes = currentNodes.map(n => ({ id: n.id, label: n.label }));

    const systemPrompt = `
    Role: Senior Solution Architect.
    
    Context: Current Nodes: ${JSON.stringify(simplifiedNodes)}
    
    Decision Logic (Order is Critical):
    
    1. **FORCE EXECUTION (Override):** IF the user says "Just draw it", "Stop asking", "Start", "Default", or acts impatient, 
       THEN **IGNORE** missing details. Make reasonable assumptions (Best Guess) and **GENERATE THE GRAPH IMMEDIATELY**. 
       In 'reply', say: "好的，根据目前信息，我为您生成了一个基础草稿..." 
       
    2. **CONFLICT CHECK:** IF user input contradicts the current graph (e.g. "It's hardware, not software"), 
       THEN set "shouldReset": true. 
       
    3. **AMBIGUITY CHECK (Soft):** ONLY IF the input is extremely vague (e.g. just "test") AND the user hasn't asked to start yet, 
       THEN ask *one* clarifying question (not three). 
       
    4. **NORMAL FLOW:** Generate/Update graph based on input.
  
    Output JSON Format:
    {
      "graph": { "nodes": [...], "edges": [...] },
      "reply": "...",
      "shouldReset": true/false
    }
    `;

    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content || "";
    const cleanedContent = cleanResponse(content);
    
    try {
      return JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", cleanedContent);
      throw new Error("Invalid JSON received from AI");
    }

  } catch (error) {
    console.error("Error generating graph:", error);
    throw error;
  }
}

/**
 * Expands a specific node to generate more details/children.
 */
export async function expandNode(nodeId: string, nodeLabel: string, currentContext: string) {
  try {
    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant helping to expand a knowledge graph.
          The user wants to expand on the concept "${nodeLabel}".
          The current context is: "${currentContext}".
          
          Generate 3-5 new child nodes related to "${nodeLabel}".
          Return ONLY a valid JSON object with "nodes" and "edges" arrays.
          The edges should connect from the original node ("${nodeId}") to the new nodes.
          
          Node format: { "id": "unique_string", "label": "string" }
          Edge format: { "source": "${nodeId}", "target": "new_node_id", "label": "relationship" }`
        },
        {
          role: "user",
          content: `Expand on "${nodeLabel}"`
        }
      ],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content || "";
    const cleanedContent = cleanResponse(content);

    try {
      return JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", cleanedContent);
      throw new Error("Invalid JSON received from AI");
    }

  } catch (error) {
    console.error("Error expanding node:", error);
    throw error;
  }
}
