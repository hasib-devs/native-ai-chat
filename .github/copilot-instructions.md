# GitHub Copilot Instructions

## Project Overview

This is a **React Native (Expo) mobile application** designed to help users **practice speaking English** with an AI-powered conversation partner. The app should be **friendly, conversational, and encouraging**, simulating a real English tutor.

Key features include:

- **Chat interface** using `react-native-gifted-chat`.
- **Voice input (STT)** to capture user speech.
- **Voice output (TTS)** to speak AI replies aloud.
- **AI responses** generated from a local model placeholder (later integration with `llama.cpp` or `Mistral`).
- **Conversation memory** to maintain short-term context.

---

## Coding Guidelines

- **Use functional components** with React Hooks.
- **Keep code modular**:
  - Components → `components/`
  - Hooks → `hooks/`
  - Utilities → `utils/`
- **Use modern React Native styling**. Tailwind or inline styles are acceptable.
- Include **comments** explaining each step.
- Use **TypeScript** if possible, but JavaScript is fine for MVP.
- Code should be **readable, mobile-friendly, and maintainable**.

---

## Feature-specific Instructions

### Chat UI

- Use `react-native-gifted-chat`.
- Show sender name, timestamp, and text.
- Append AI responses and user messages seamlessly.

### Voice Input (STT)

- Capture user voice using Expo microphone API.
- Convert speech → text using a placeholder hook (`useSpeechToText`) for now.
- Later replace with **Whisper.cpp** integration.

### Voice Output (TTS)

- Use `expo-speech` or other offline TTS solution.
- Smooth playback, allow interruption, read AI messages aloud.

### AI Response

- Use a placeholder function `getAIResponse(userText)` initially.
- Ensure responses are **friendly, conversational, and encourage learning**.
- Later integrate a local AI model (Llama/Mistral).
- Keep context short (last 3–5 messages) to maintain conversation flow.

### Microphone Button

- Toggle recording on/off.
- Show visual feedback (recording state).
- On stop, send captured text to chat.

### State Management

- Store messages in component state initially.
- Later optional: persist chat history using AsyncStorage or SQLite.

---

## Copilot Usage Tips

1. Paste this instructions file in the repo: `.github/copilot-instructions.md`.
2. Write comments inline like `// Generate ChatBubble component` or `// Implement useSpeechToText hook`.
3. Break large tasks into smaller prompts to get modular code suggestions.
4. Encourage Copilot to generate **TypeScript interfaces, hooks, and functional components**.
5. If you want Copilot to continue or improve code, leave a descriptive comment about functionality, style, and UX.

---

## Example Prompt Comments

```js
// Generate a MicButton component:
// - Shows microphone icon
// - Toggles recording state
// - Fires start/stop callbacks
// - Visually indicates listening
```
