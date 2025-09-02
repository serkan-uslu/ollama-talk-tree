# Ollama Talk Tree

This is an advanced AI chat application that uses local Ollama models to create branching conversations.

## Features

- 🚀 Works with local Ollama models
- 🌳 Branching conversations
- 👥 Multiple AI agents
- 💾 Local storage
- 🎨 Modern and responsive UI

## Installation

**Requirements:**

- Node.js 18+
- Local Ollama installation
- At least one Ollama model

## Running

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start Ollama and load models:

   ```bash
   ollama serve
   ollama pull llama3.2:3b  # or any model you want
   ```

3. Run the application:
   ```bash
   npm run dev
   ```

## Usage

1. The application automatically detects local Ollama models
2. View available models in the Settings screen
3. Create different agents for each model
4. Start branching conversations
