import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI client
// Note: In a production environment, it is recommended to call the API via a backend route to protect the API Key.
// Since this is an MVP/Demo, we use the client-side key directly as requested.
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;

if (!apiKey) {
  console.error("Missing NEXT_PUBLIC_GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
console.log("Gemini Model Initialized: gemini-2.5-flash");

export interface AIStateNode {
  id: string;
  label: string;
  type?: 'role' | 'tech' | 'risk' | 'default';
}

export interface AIStateEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface GraphData {
  nodes: AIStateNode[];
  edges: AIStateEdge[];
}

/**
 * Calls Gemini API to generate a mind map structure from user input.
 * Now supports incremental updates based on existing graph context.
 */
export async function generateMindMap(
  inputText: string, 
  currentNodes: AIStateNode[] = [], 
  currentEdges: AIStateEdge[] = []
): Promise<{ graph: GraphData, reply: string }> {
  
  // Simplify current nodes for context to save tokens and prevent pollution
  const simplifiedNodes = currentNodes.map(n => ({ id: n.id, label: n.label, type: n.type }));
  const simplifiedEdges = currentEdges.map(e => ({ source: e.source, target: e.target, label: e.label }));
  
  const prompt = `
    You are an intelligent assistant that visualizes ideas.
    
    Current Context: 
    The whiteboard currently contains these nodes: ${JSON.stringify(simplifiedNodes)}
    And these edges: ${JSON.stringify(simplifiedEdges)}
    
    User Input: "${inputText}"
    
    Task:
    Based on the User Input, generate NEW nodes and edges to extend the current graph. 
    - Do NOT regenerate existing nodes unless necessary for context. 
    - If the input is related to an existing node, create an edge connecting the new concept to that existing node's ID. 
    - If it's a new topic unrelated to existing nodes, create a new root node.
    - The 'nodes' should represent key concepts, steps, or entities.
    - The 'edges' should represent the relationships between them.

    Visual Classification (IMPORTANT):
    You MUST assign a 'type' to each node based on these categories:
    - 'role': People, positions, teams, stakeholders (e.g., Project Manager, Engineer, User).
    - 'tech': Technologies, hardware, tools, software, code, platforms (e.g., React, Server, Database, Git).
    - 'risk': Constraints, risks, negative factors, warnings, limits (e.g., Low Budget, Tight Deadline, Security Flaw).
    - 'default': General concepts, actions, steps, or anything else.
    
    Output Format:
    Return strictly a VALID JSON object. No Markdown code blocks. No extra text.
    
    JSON Schema:
    {
      "graph": {
        "nodes": [
          { "id": "string", "label": "string (concise)", "type": "role" | "tech" | "risk" | "default" }
        ],
        "edges": [
          { "id": "string", "source": "string", "target": "string", "label": "string (optional)" }
        ]
      },
      "reply": "string (A natural, short Chinese response explaining what you added or modified. Act like a product manager.)"
    }

    Reply Guidelines:
    - Must be in Chinese.
    - Do not just repeat user input.
    - Explain what you did (e.g., "已添加'STM32'节点并连接到主控板", "我把时间限制标记为了风险项").
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up potential markdown formatting (e.g., ```json ... ```)
    const jsonString = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    // Attempt to find the first { and last } to isolate the JSON object
    const startIndex = jsonString.indexOf('{');
    const endIndex = jsonString.lastIndexOf('}');
    const cleanJson = (startIndex !== -1 && endIndex !== -1) 
        ? jsonString.substring(startIndex, endIndex + 1) 
        : jsonString;

    const data = JSON.parse(cleanJson);
    
    // Basic validation
    if (!data.graph || !data.graph.nodes || !Array.isArray(data.graph.nodes)) {
        throw new Error("Invalid JSON format: missing graph or nodes array");
    }

    return {
      graph: data.graph as GraphData,
      reply: data.reply || "已为您更新白板内容。"
    };
  } catch (error: any) {
    // Check if it's a model not found error and try to provide a more helpful message
    const isModelError = error.message?.includes('model') && error.message?.includes('not found');
    
    console.error("Gemini API Error Details:", {
        message: error.message,
        status: error.status,
        suggestion: isModelError ? "The model name 'gemini-1.5-flash' might be incorrect for your region or API key. Try 'gemini-1.5-flash-latest' or 'gemini-pro'." : "Check your API key and network connection.",
        fullError: error
    });
    // Return a fallback or rethrow
    throw error;
  }
}

/**
 * Expands a specific node by generating sub-concepts.
 */
export async function expandNode(
  nodeLabel: string, 
  parentNodeId: string, 
  allNodes: AIStateNode[] = []
): Promise<{ graph: GraphData, reply: string }> {
  // Extract context from allNodes (e.g. list of labels)
  const contextSummary = allNodes.map(n => n.label).join(', ');

  const prompt = `
    Context: The user is brainstorming a mind map about: [${contextSummary}].
    
    Task: The user wants to expand on the specific node: "${nodeLabel}".
    Based on the Global Context above, generate 3-5 specific sub-concepts for "${nodeLabel}".
    Ensure the generated concepts are strictly relevant to the Global Context.
    
    Parent Node ID: "${parentNodeId}"
    
    Example: If context is 'League of Legends' and node is 'Strategy', generate 'Ganking', 'Roaming', not 'Business Strategy'.
    
    Requirements:
    - New nodes must be specifically related to "${nodeLabel}" within the context of [${contextSummary}].
    - Create edges connecting the Parent Node ID ("${parentNodeId}") to each new node.
    - Assign appropriate 'type' to each new node (role, tech, risk, default).
    
    Output Format:
    Return strictly a VALID JSON object. No Markdown.
    
    JSON Schema:
    {
      "graph": {
        "nodes": [
          { "id": "string", "label": "string", "type": "role" | "tech" | "risk" | "default" }
        ],
        "edges": [
          { "id": "string", "source": "string", "target": "string", "label": "string (optional)" }
        ]
      },
      "reply": "string (A natural, short Chinese response explaining what sub-concepts were added, relevant to the context.)"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonString = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    const startIndex = jsonString.indexOf('{');
    const endIndex = jsonString.lastIndexOf('}');
    const cleanJson = (startIndex !== -1 && endIndex !== -1) 
        ? jsonString.substring(startIndex, endIndex + 1) 
        : jsonString;

    const data = JSON.parse(cleanJson);

    // Basic validation
    if (!data.graph || !data.graph.nodes || !Array.isArray(data.graph.nodes)) {
        // Fallback for older prompt structure if model gets confused, or just throw
        // But since we updated the prompt to return { graph: ... }, let's hope it follows.
        // If it returns flat nodes/edges (old schema), we might need to adapt.
        // Let's assume strict adherence for now as 2.5 is smart.
        if (data.nodes && Array.isArray(data.nodes)) {
            // Handle case where it might return old structure
             return {
                graph: data as GraphData,
                reply: data.reply || `已为您展开 "${nodeLabel}"。`
            };
        }
        throw new Error("Invalid JSON format from expandNode");
    }

    return {
        graph: data.graph as GraphData,
        reply: data.reply || `已为您展开 "${nodeLabel}" 的相关概念。`
    };
  } catch (error) {
    console.error("Expand Node Error:", error);
    throw error;
  }
}
