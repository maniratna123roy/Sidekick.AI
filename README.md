🚀 Sidekick AI — Codebase Visualization & Semantic Navigator

Sidekick AI is a visualization-first AI tool that helps developers quickly understand complex or legacy codebases.
Just paste a GitHub clone link, and Sidekick automatically:

ingests the repository

indexes the code with vector embeddings

performs RAG reasoning

generates Mermaid & Sequence diagrams

builds interactive dependency graphs

No manual setup — the codebase draws itself.

🔗 Live Deployment

Frontend (Vercel)
https://sidekick-ai-three.vercel.app/

Backend (Render)
https://sidekick-ai-zavi.onrender.com

🧩 What does Sidekick AI do?

Sidekick AI helps you:

visualize architecture and data flow

explore dependencies and call graphs

understand large repositories faster

identify complexity hotspots

generate auto documentation

perform semantic search over the codebase

MVP = visualization

✨ Key Features

paste GitHub repo link → auto indexing

RAG-powered semantic navigation

Pinecone vector database embeddings

Mermaid architecture diagrams

Sequence diagrams for execution flows

interactive knowledge graphs

AST-based static code analysis

supports large multi-file repos

🧠 How it works (simple flow)

1️⃣ Paste GitHub clone link
2️⃣ System clones & parses repo
3️⃣ Embeddings generated and stored
4️⃣ RAG retrieves contextual code
5️⃣ AI builds visual diagrams

🛠️ Tech Stack

Frontend

React 18

TypeScript

Vite

Tailwind CSS

shadcn-ui

Backend

Node.js + Express

simple-git

AI & Data Layer

Google Gemini API

Pinecone Vector Database

Supabase (PostgreSQL)

Visualization

Mermaid diagrams

Sequence diagrams

D3 / Recharts

🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                    (Browser - localhost:5173)                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP/REST API
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                         FRONTEND                                │
│                   React + Vite + TypeScript                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Landing     │  │    Chat      │  │  API Service │         │
│  │  Page        │  │  Interface   │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ REST API Calls
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                         BACKEND                                 │
│                   Node.js + Express (Port 3001)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Index      │  │     Chat     │  │   Health     │         │
│  │   Route      │  │    Route     │  │   Check      │         │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘         │
│         │                  │                                     │
│  ┌──────▼──────────────────▼─────────────────────────┐         │
│  │              SERVICE LAYER                         │         │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │         │
│  │  │ Repository  │ │   Gemini    │ │   Vector    │ │         │
│  │  │  Service    │ │  Service    │ │  Service    │ │         │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ │         │
│  └────────────────────────────────────────────────────┘         │
└──────┬────────────────┬────────────────┬─────────────────────────┘
       │                │                │
       │                │                │
   ┌───▼───┐      ┌────▼─────┐    ┌────▼─────┐
   │GitHub │      │  Gemini  │    │ Pinecone │
   │  API  │      │   API    │    │ Vector   │
   │       │      │          │    │   DB     │
   └───────┘      └──────────┘    └──────────┘
```


🖥️ Local Development

Requirements: Node.js & npm

git clone <YOUR_GIT_URL>
cd sidekick-ai
npm i
npm run dev

🌍 Deployment

Hosted using:

Vercel – frontend

Render – backend

🚧 Future Enhancements

VS Code extension

multi-repo architecture mapping

PR impact analyzer

refactor suggestions using AI

real-time collaborative visualization
