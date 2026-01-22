# AI Intelligent Whiteboard (MVP) / AI 智能白板 (MVP)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.0-black)
![React Flow](https://img.shields.io/badge/React_Flow-11.0-ff0072)

[English Version](#english-version) | [中文版本](#中文版本)

---

<a name="中文版本"></a>

## 📖 项目简介

这是一个智能会议助手工具，旨在将您的想法实时转化为可视化的知识图谱。本项目结合了对话式 AI 界面与动态白板，能够自动将您的语音或文本输入解析为结构化的思维导图。

## 🚀 项目目标

打造 **"Chat-to-Graph"（对话即图表）** 的体验。用户在聊天界面中进行头脑风暴，系统自动在无限画布上可视化这些概念、关系和结构。

## ✨ 核心功能

*   **双面板界面**：
    *   **左侧边栏**：ChatGPT 风格的对话界面，用于输入想法和追踪对话历史。
    *   **右侧画布**：基于 React Flow 的全屏交互式白板。
*   **自动可视化**：
    *   模拟 AI 自然语言处理，从用户输入中提取关键概念。
    *   动态生成节点（Nodes）和连线（Edges）。
*   **智能布局**：
    *   集成 `dagre` 算法实现自动图表布局。
    *   确保节点按层级（从左到右）排列，无重叠。
*   **现代 UI/UX**：
    *   使用 Tailwind CSS 打造的简洁、极简设计。
    *   流畅的动画和响应式交互。

## 🛠 技术栈

*   **框架**: [Next.js 15](https://nextjs.org/) (App Router)
*   **样式**: [Tailwind CSS](https://tailwindcss.com/)
*   **白板引擎**: [React Flow](https://reactflow.dev/)
*   **状态管理**: [Zustand](https://github.com/pmndrs/zustand)
*   **图表布局**: [Dagre](https://github.com/dagrejs/dagre)
*   **图标**: [Lucide React](https://lucide.dev/)

## 📂 项目结构

```bash
ai-whiteboard/
├── app/
│   ├── layout.tsx       # 根布局
│   └── page.tsx         # 主应用页面 (侧边栏 + 白板集成)
├── components/
│   └── Whiteboard.tsx   # React Flow 包装组件
├── store/
│   └── useStore.ts      # 全局状态 (节点, 连线, 聊天消息)
├── utils/
│   └── layout.ts        # Dagre 布局逻辑实现
├── public/              # 静态资源
└── package.json         # 依赖和脚本
```

## ⚡ 快速开始

### 前置要求

*   Node.js 18.0 或更高版本
*   npm 或 yarn

### 安装步骤

1.  克隆仓库（或进入项目文件夹）：
    ```bash
    cd ai-whiteboard
    ```

2.  安装依赖：
    ```bash
    npm install
    ```

3.  启动开发服务器：
    ```bash
    npm run dev
    ```

4.  在浏览器中打开 [http://localhost:3000](http://localhost:3000)。

## 📖 如何使用

1.  **启动应用**：你会看到左侧的 "AI Architect" 聊天窗口和右侧的空白画布。
2.  **输入想法**：在聊天框中输入一个复杂的句子或概念。
    *   *示例：“设计一个包含网关、认证服务和用户服务的微服务架构。”*
3.  **观看效果**：
    *   系统会模拟 "Thinking..."（思考中）的处理过程。
    *   片刻后，白板会自动生成根节点（主题）和子节点（关键概念），并用箭头连接。
    *   图表会自动整理布局以保持清晰。
4.  **交互**：你可以缩放、平移画布，或拖动节点。

## 🚧 路线图 (未来改进)

*   **真实 AI 集成**：连接 OpenAI/Gemini API，执行真实的 NLP 实体和关系提取。
*   **双向编辑**：允许在白板上移动节点时更新聊天中的上下文/摘要。
*   **持久化**：将白板会话保存到本地存储或数据库。
*   **多模态输入**：支持实时语音输入（语音转文本）。
*   **自定义节点类型**：支持图片、便利贴和更复杂的形状。

## 📄 许可证

[MIT License](LICENSE)

---

<a name="english-version"></a>

## 📖 Introduction

An intelligent meeting assistant tool that transforms your ideas into visual knowledge graphs in real-time. This project combines a conversational AI interface with a dynamic whiteboard, automatically parsing your speech/text into structured mind maps.

## 🚀 Project Goal

To create a **"Chat-to-Graph"** experience where users can brainstorm ideas in a chat interface, and the system automatically visualizes the relationships, concepts, and structures on an infinite canvas.

## ✨ Core Features

*   **Dual-Panel Interface**:
    *   **Left Sidebar**: A ChatGPT-style conversational interface for inputting ideas and tracking dialogue history.
    *   **Right Canvas**: A full-screen interactive whiteboard powered by React Flow.
*   **Automatic Visualization**:
    *   Simulates AI natural language processing to extract key concepts from user input.
    *   Dynamically generates Nodes (concepts) and Edges (relationships).
*   **Intelligent Layout**:
    *   Integrated `dagre` algorithm for automatic graph layout.
    *   Ensures nodes are organized hierarchically (Left-to-Right) without overlapping.
*   **Modern UI/UX**:
    *   Clean, minimalist design using Tailwind CSS.
    *   Smooth animations and responsive interactions.

## 🛠 Tech Stack

*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Whiteboard Engine**: [React Flow](https://reactflow.dev/)
*   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
*   **Graph Layout**: [Dagre](https://github.com/dagrejs/dagre)
*   **Icons**: [Lucide React](https://lucide.dev/)

## 📂 Project Structure

```bash
ai-whiteboard/
├── app/
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main application page (Sidebar + Whiteboard integration)
├── components/
│   └── Whiteboard.tsx   # React Flow wrapper component
├── store/
│   └── useStore.ts      # Global state (Nodes, Edges, Chat Messages)
├── utils/
│   └── layout.ts        # Dagre layout logic implementation
├── public/              # Static assets
└── package.json         # Dependencies and scripts
```

## ⚡ Getting Started

### Prerequisites

*   Node.js 18.0 or later
*   npm or yarn

### Installation

1.  Clone the repository (or navigate to project folder):
    ```bash
    cd ai-whiteboard
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 How to Use

1.  **Launch the App**: You will see the "AI Architect" chat on the left and an empty canvas on the right.
2.  **Input Ideas**: Type a complex sentence or concept in the chat box.
    *   *Example: "Design a microservices architecture with Gateway, Auth Service, and User Service."*
3.  **Watch the Magic**:
    *   The system will simulate "Thinking..." (processing).
    *   After a short delay, the whiteboard will automatically populate with a root node (Topic) and child nodes (Key Concepts) connected by arrows.
    *   The graph is automatically arranged for clarity.
4.  **Interact**: You can zoom, pan, and drag nodes around the canvas.

## 🚧 Roadmap (Future Improvements)

*   **Real AI Integration**: Connect to OpenAI/Gemini API to perform actual NLP extraction of entities and relationships.
*   **Bi-directional Editing**: Allow moving nodes on the whiteboard to update the context/summary in the chat.
*   **Persistence**: Save whiteboard sessions to local storage or a database.
*   **Multi-Modal Input**: Support real voice input (Speech-to-Text).
*   **Custom Node Types**: Support images, sticky notes, and more complex shapes.

## 📄 License

[MIT License](LICENSE)
