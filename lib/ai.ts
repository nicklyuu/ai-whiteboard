import OpenAI from 'openai';
import { AppMode, ProjectContext } from '@/store/useStore';
import { calculateGridLayout } from '@/lib/utils';

// Initialize OpenAI client with DeepSeek configuration
// 1. 强制读取 NEXT_PUBLIC_ 开头的变量 
const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY; 
// 2. 允许用户配置 Base URL (兼容两种命名方式) 
const baseURL = process.env.NEXT_PUBLIC_DEEPSEEK_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.deepseek.com/v1"; 
 
// 3. 调试日志 (只会打印在浏览器控制台，方便排查) 
if (!apiKey) { 
  console.error("🚨 严重错误: 未找到 API Key！");
  console.error("请确认：\n1. .env.local 文件中包含 NEXT_PUBLIC_DEEPSEEK_API_KEY\n2. 修改环境变量后是否已重启开发服务器？(必须重启)");
} else {
  // 仅在开发环境打印，确认 Key 已加载（只打印前几位，保护隐私）
  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ DeepSeek API Key loaded: ${apiKey.substring(0, 4)}...`);
    console.log(`✅ DeepSeek Base URL: ${baseURL}`);
  }
}
 
const client = new OpenAI({ 
  apiKey: apiKey || "dummy-key", // 防止初始化直接崩盘 
  baseURL: baseURL, 
  dangerouslyAllowBrowser: true // ⚡️ 必须加这行，否则浏览器端会直接报错 
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
export async function generateGraphData(
  prompt: string, 
  currentNodes: { id: string, label: string }[] = [], 
  appMode: AppMode = 'lobby',
  projectContext?: ProjectContext
) {
  try {
    const simplifiedNodes = currentNodes.map(n => ({ id: n.id, label: n.label }));
    const existingNodesCount = currentNodes.length;

    let systemPromptRole = "Role: Senior Solution Architect.";
    let systemPromptLogic = "";
    let uiHint = "";
    let contextPrompt = "";

    if (projectContext && projectContext.isInitialized) {
      contextPrompt = `
      Project Context:
      Name: ${projectContext.name}
      Goal: ${projectContext.goal}
      Audience: ${projectContext.audience}
      Constraints: ${projectContext.constraints}
      
      Decision Rule: IF constraints say 'No Hardware', DO NOT generate hardware ideas.
      `;
    }

    if (appMode === 'brainstorm') {
      systemPromptRole = "Role: Creative Facilitator (Brainstorming Mode).";
      uiHint = "IMPORTANT: For new nodes, you MUST set their type to 'sticky-note'. Use vibrant, short labels.";
      systemPromptLogic = `
        Brainstorming Logic:
        1. Encourage divergent thinking.
        2. Do NOT create deep hierarchies. Create flat clusters of related ideas.
        3. No judgment on ideas.
        4. Use short, punchy phrases for labels.
        5. Connect related ideas loosely.

        TASK:
        1. Analyze user input for new constraints (e.g., "Only one cat").
        2. **REVIEW EXISTING NODES:** Check the 'currentNodes' list provided in context.
        3. **DETECT CONFLICTS:** If an existing node contradicts the new input (e.g., Node says "Multi-cat ID" but user says "Single cat"), you MUST mark it for deletion by adding its exact ID to the 'deletedNodeIds' array.
    4. **NO DUPLICATES:** Do not regenerate ideas that already exist.
    5. Generate new ideas based on the new constraints.
      `;
    } else if (appMode === 'structure') {
      systemPromptRole = "Role: Senior Solution Architect (Structure Mode).";
      // Existing logic is default
    } else if (appMode === 'planning') {
       systemPromptRole = "Role: Project Manager (Planning Mode).";
       // Placeholder logic
    }

    const systemPrompt = `
    ${systemPromptRole}
    
    ${contextPrompt}

    Context: Current Nodes: ${JSON.stringify(simplifiedNodes)}
    App Mode: ${appMode}
    ${uiHint}
    
    Decision Logic (Order is Critical):
    
    1. **FORCE EXECUTION (Override):** IF the user says "Just draw it", "Stop asking", "Start", "Default", or acts impatient, 
       THEN **IGNORE** missing details. Make reasonable assumptions (Best Guess) and **GENERATE THE GRAPH IMMEDIATELY**. 
       In 'reply', say: "好的，根据目前信息，我为您生成了一个基础草稿..." 
       
    2. **CONFLICT CHECK:** IF user input contradicts the current graph (e.g. "It's hardware, not software"), 
       THEN set "shouldReset": true. 
       
    3. **AMBIGUITY CHECK (Soft):** ONLY IF the input is extremely vague (e.g. just "test") AND the user hasn't asked to start yet, 
       THEN ask *one* clarifying question (not three). 
       
    4. **NORMAL FLOW:** Generate/Update graph based on input.
    ${systemPromptLogic}
  
    Output JSON Format:
    {
      "graph": { 
        "nodes": [{ "id": "...", "label": "...", "type": "default OR sticky-note (if in brainstorm mode)" }], 
        "edges": [...] 
      },
      "deletedNodeIds": ["id_of_conflicting_node_1", "id_of_conflicting_node_2"],
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
      const parsedData = JSON.parse(cleanedContent);

      // Apply Sunflower layout ONLY for Brainstorm mode
      if (appMode === 'brainstorm' && parsedData.graph && parsedData.graph.nodes) {
          parsedData.graph.nodes = parsedData.graph.nodes.map((node: any, i: number) => {
              // Use existingNodesCount to continue the spiral, not restart it
              const globalIndex = existingNodesCount + i;
              const pos = getSunflowerPosition(globalIndex);
              return { ...node, position: pos, type: 'sticky-note' };
          });
      }

      return parsedData;
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
export async function expandNode(nodeId: string, nodeLabel: string, currentContext: string, projectContext?: ProjectContext) {
  try {
    let contextPrompt = "";
    if (projectContext && projectContext.isInitialized) {
      contextPrompt = `
      Project Context:
      Name: ${projectContext.name}
      Goal: ${projectContext.goal}
      Audience: ${projectContext.audience}
      Constraints: ${projectContext.constraints}
      `;
    }

    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant helping to expand a knowledge graph.
          ${contextPrompt}
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

/**
 * Generates SCAMPER ideas for a specific node.
 */
export async function scamperIdeation(nodeLabel: string, context: string, projectContext?: ProjectContext) {
    try {
      let contextPrompt = "";
      if (projectContext && projectContext.isInitialized) {
        contextPrompt = `
        Project Context:
        Name: ${projectContext.name}
        Goal: ${projectContext.goal}
        Audience: ${projectContext.audience}
        Constraints: ${projectContext.constraints}
        `;
      }

      const response = await client.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `You are a creative facilitator using the SCAMPER method.
            ${contextPrompt}
            Current Context: "${context}"
            Target Concept: "${nodeLabel}"
            
            Task: Apply SCAMPER (Substitute, Combine, Adapt, Modify, Put to another use, Eliminate, Reverse) to generate 3 disruptive, out-of-the-box ideas.
            
            Return ONLY a valid JSON object with a "nodes" array.
            Format: { "nodes": [{ "label": "Idea 1" }, { "label": "Idea 2" }, { "label": "Idea 3" }] }
            Keep labels short and punchy.`
          },
          {
            role: "user",
            content: `Apply SCAMPER to "${nodeLabel}"`
          }
        ],
        temperature: 0.9, // Higher temperature for creativity
      });
  
      const content = response.choices[0].message.content || "";
      const cleanedContent = cleanResponse(content);
  
      try {
        return JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error("Failed to parse SCAMPER response:", cleanedContent);
        throw new Error("Invalid JSON received from AI");
      }
    } catch (error) {
      console.error("Error in SCAMPER:", error);
      throw error;
    }
}

// 螺旋布局算法：让新节点像花瓣一样散开
// 黄金角度分布：Golden Angle Distribution
function getSunflowerPosition(index: number, center: {x: number, y: number} = {x: 0, y: 0}) {
  // 黄金角度 137.5 度
  const angle = index * 137.5 * (Math.PI / 180);
  // 半径随索引增长
  const radius = 350 * Math.sqrt(index + 1);

  return {
    x: center.x + radius * Math.cos(angle),
    y: center.y + radius * Math.sin(angle)
  };
}

/**
 * Generates initial sticky notes for a new project based on onboarding context.
 */
export async function generateInitialIdeas(projectContext: ProjectContext) {
  try {
    const prompt = `用户刚启动了一个项目：${projectContext.name}，目标是${projectContext.goal}，面向${projectContext.audience}。
    特别限制/偏好：${projectContext.constraints || "无"}。
    请立刻生成 5-8 个初始的创意便利贴，包含核心功能点、潜在痛点和亮点。请使用 SCAMPER 方法进行发散。
    
    Return ONLY a valid JSON object with a "nodes" array.
    Format: { "nodes": [{ "label": "Idea 1" }, { "label": "Idea 2" }] }
    Keep labels short, punchy, and relevant.`;

    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "You are a creative brainstorming facilitator. Generate initial ideas for a new project."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
    });

    const content = response.choices[0].message.content || "";
    const cleanedContent = cleanResponse(content);

    try {
      const parsedData = JSON.parse(cleanedContent);
      
      // Apply Grid Layout
      if (parsedData.nodes && Array.isArray(parsedData.nodes)) {
        // Ensure they are sticky notes
        const nodesWithType = parsedData.nodes.map((node: any) => ({ 
            ...node, 
            type: 'sticky-note' 
        }));
        parsedData.nodes = calculateGridLayout(nodesWithType);
      }

      return parsedData;
    } catch (parseError) {
      console.error("Failed to parse Initial Ideas response:", cleanedContent);
      throw new Error("Invalid JSON received from AI");
    }
  } catch (error) {
    console.error("Error generating initial ideas:", error);
    throw error;
  }
}

/**
 * Clusters nodes into themes using KJ Method.
 */
export async function autoCluster(nodes: { id: string, label: string }[]) {
    try {
      const nodeList = nodes.map(n => `ID: ${n.id}, Label: "${n.label}"`).join("\n");
      
      const response = await client.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `You are an expert facilitator using the KJ Method (Affinity Diagram).
            Task: Group the following sticky notes into 3-5 distinct themes/clusters.
            
            Input Nodes:
            ${nodeList}
            
            Return ONLY a valid JSON object with a "clusters" array.
            Format: 
            {
              "clusters": [
                { "title": "Theme Title 1", "nodeIds": ["id1", "id2"] },
                { "title": "Theme Title 2", "nodeIds": ["id3"] }
              ]
            }`
          },
          {
            role: "user",
            content: "Group these ideas."
          }
        ],
        temperature: 0.5,
      });
  
      const content = response.choices[0].message.content || "";
      const cleanedContent = cleanResponse(content);
  
      try {
        return JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error("Failed to parse Cluster response:", cleanedContent);
        throw new Error("Invalid JSON received from AI");
      }
    } catch (error) {
      console.error("Error in Auto-Cluster:", error);
      throw error;
    }
  }
