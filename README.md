# AI Intelligent Whiteboard (MVP)

An intelligent meeting assistant tool that transforms your ideas into visual knowledge graphs in real-time. This project combines a conversational AI interface with a dynamic whiteboard, automatically parsing your speech/text into structured mind maps.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.0-black)
![React Flow](https://img.shields.io/badge/React_Flow-11.0-ff0072)

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

This project is open-source and available under the [MIT License](LICENSE).
