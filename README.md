# AI Intelligent Whiteboard (MVP) / AI 智能白板 (MVP)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.0-black)
![React Flow](https://img.shields.io/badge/React_Flow-11.0-ff0072)
![DeepSeek](https://img.shields.io/badge/AI-DeepSeek-blue)

[English Version](#english-version) | [中文版本](#中文版本)

---

<a name="中文版本"></a>

## 📖 项目简介

这是一个智能会议助手工具，旨在将您的想法实时转化为可视化的知识图谱。本项目结合了 **DeepSeek** 强大的语义理解能力与动态白板，能够自动将您的语音或文本输入解析为结构化的思维导图。

## 🚀 项目目标

打造 **"Chat-to-Graph"（对话即图表）** 的体验。用户在聊天界面中进行头脑风暴，系统自动在无限画布上可视化这些概念、关系和结构。

## ✨ 核心功能

*   **智能双面板界面**：
    *   **左侧边栏**：ChatGPT 风格的对话界面，用于输入想法和追踪对话历史。
    *   **右侧画布**：基于 React Flow 的全屏交互式白板，支持缩放、拖拽。
*   **DeepSeek 驱动的自动可视化**：
    *   集成 **DeepSeek API (OpenAI 兼容模式)**，提供深度语义解析。
    *   **上下文感知**：AI 理解当前画布内容，根据新指令动态扩展或修改图谱。
    *   **自动清洗**：内置 JSON 提取与 Markdown 过滤，确保生成数据 100% 可用。
*   **Consultant Mode V2 (智能顾问模式)**：
    *   **🚀 强制执行 (Force Execution)**：当您说“直接画”、“别废话”时，AI 会跳过问询，立即生成图谱。
    *   **🔄 冲突自动重置 (Auto-Reset)**：检测到需求方向突变（如从软件改为硬件）时，自动清空画布并重新规划。
    *   **❓ 智能问诊 (Soft Diagnosis)**：仅在需求极度模糊时，AI 才会礼貌地反问 1 个关键问题。
*   **智能布局**：
    *   集成 `dagre` 算法实现自动图表布局 (LR 从左到右模式)。
    *   生成新节点后自动重排，保持视图整洁。
*   **现代 UI/UX**：
    *   使用 Tailwind CSS 打造的简洁设计。
    *   流畅的 Loading 状态与流式对话体验。

## 🛠 技术栈

*   **框架**: [Next.js 15](https://nextjs.org/) (App Router)
*   **样式**: [Tailwind CSS](https://tailwindcss.com/)
*   **白板引擎**: [React Flow](https://reactflow.dev/)
*   **状态管理**: [Zustand](https://github.com/pmndrs/zustand)
*   **AI 后端**: [DeepSeek API](https://www.deepseek.com/) (via OpenAI SDK)
*   **图表布局**: [Dagre](https://github.com/dagrejs/dagre)
*   **图标**: [Lucide React](https://lucide.dev/)

## 📂 项目结构

```bash
ai-whiteboard/
├── app/
│   ├── layout.tsx       # 根布局
│   └── page.tsx         # 主应用页面 (侧边栏 + 白板集成 + 智能重置逻辑)
├── components/
│   └── Whiteboard.tsx   # React Flow 包装组件
├── lib/
│   └── ai.ts            # DeepSeek 集成与 Consultant Mode 核心逻辑
├── store/
│   └── useStore.ts      # 全局状态 (节点, 连线, 聊天消息, 图谱操作)
├── utils/
│   └── layout.ts        # Dagre 布局逻辑实现
├── public/              # 静态资源
└── package.json         # 依赖和脚本
```

## ⚡ 快速开始

### 前置要求

*   Node.js 18.0 或更高版本
*   DeepSeek API Key

### 安装步骤

1.  克隆仓库（或进入项目文件夹）：
    ```bash
    cd ai-whiteboard
    ```

2.  安装依赖：
    ```bash
    npm install
    ```

3.  配置环境变量：
    创建 `.env.local` 文件并添加：
    ```env
    DEEPSEEK_API_KEY=your_api_key_here
    DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
    ```

4.  启动开发服务器：
    ```bash
    npm run dev
    ```

5.  在浏览器中打开 [http://localhost:3000](http://localhost:3000)。

## 📖 如何使用

1.  **启动应用**：你会看到左侧的 "AI Architect" 聊天窗口和右侧的空白画布。
2.  **输入想法**：
    *   **正常模式**：输入“设计一个微服务架构”，AI 会为您生成图谱。
    *   **强制模式**：输入“别废话，直接画一个电商系统”，AI 会立即执行。
    *   **重置模式**：如果想换话题，直接说“不做了，我要开个咖啡馆”，画布会自动重置。
3.  **观看效果**：
    *   系统显示 "Thinking..."。
    *   白板自动生成并排列节点。
    *   AI 返回中文解说。

## 📄 许可证

[MIT License](LICENSE)

---

<a name="english-version"></a>

## 📖 Introduction

An intelligent meeting assistant tool that transforms your ideas into visual knowledge graphs in real-time. This project combines **DeepSeek**'s powerful semantic understanding with a dynamic whiteboard to automatically parse your speech/text into structured mind maps.

## 🚀 Project Goal

To create a **"Chat-to-Graph"** experience where users can brainstorm ideas in a chat interface, and the system automatically visualizes the relationships, concepts, and structures on an infinite canvas.

## ✨ Core Features

*   **Intelligent Dual-Panel Interface**:
    *   **Left Sidebar**: ChatGPT-style conversational interface.
    *   **Right Canvas**: Full-screen interactive whiteboard powered by React Flow.
*   **DeepSeek-Powered Visualization**:
    *   Integrated **DeepSeek API (OpenAI Compatible)** for deep semantic parsing.
    *   **Context Awareness**: AI understands current graph state and extends it intelligently.
    *   **Robust Data Cleaning**: Built-in JSON extraction ensuring 100% valid graph data.
*   **Consultant Mode V2**:
    *   **🚀 Force Execution**: Say "Just draw it" to skip questions and generate immediately.
    *   **🔄 Auto-Reset**: Automatically clears the canvas when you switch topics (e.g., from software to hardware).
    *   **❓ Soft Diagnosis**: Asks only ONE clarifying question when input is extremely vague.
*   **Smart Layout**:
    *   `dagre` algorithm for automatic Left-to-Right layout.
    *   Auto-rearrange on new node generation.
*   **Modern UI/UX**:
    *   Clean design with Tailwind CSS.
    *   Smooth streaming-like experience.

## 🛠 Tech Stack

*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Whiteboard Engine**: [React Flow](https://reactflow.dev/)
*   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
*   **AI Backend**: [DeepSeek API](https://www.deepseek.com/) (via OpenAI SDK)
*   **Graph Layout**: [Dagre](https://github.com/dagrejs/dagre)
*   **Icons**: [Lucide React](https://lucide.dev/)

## ⚡ Getting Started

### Prerequisites

*   Node.js 18.0 or later
*   DeepSeek API Key

### Installation

1.  Clone the repository:
    ```bash
    cd ai-whiteboard
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure Environment:
    Create `.env.local`:
    ```env
    DEEPSEEK_API_KEY=your_api_key_here
    DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
    ```

4.  Start Server:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000).

## 📖 How to Use

1.  **Launch**: See the chat on the left, canvas on the right.
2.  **Input**:
    *   **Normal**: "Design a microservices architecture."
    *   **Force**: "Just draw a simple e-commerce system, stop asking." -> AI executes immediately.
    *   **Reset**: "Actually, I want to build a physical chair." -> Canvas clears and resets.
3.  **Watch**: Nodes appear and arrange themselves automatically.

## 📄 License

[MIT License](LICENSE)
