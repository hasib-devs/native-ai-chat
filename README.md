# English Chat Practice App 🗣️

A React Native (Expo) mobile application designed to help users practice speaking English with an AI-powered conversation partner. The app provides a friendly, conversational, and encouraging environment that simulates a real English tutor.

## Features

- **Chat Interface**: Beautiful chat UI using `react-native-gifted-chat`
- **Voice Input (STT)**: Capture user speech for natural conversation practice
- **Voice Output (TTS)**: AI responses spoken aloud for pronunciation learning
- **AI Conversation Partner**: Encouraging and context-aware responses
- **Conversation Memory**: Maintains short-term context for natural flow

## Current Implementation Status

### ✅ Completed

- [x] Basic project structure and boilerplate cleanup
- [x] Chat UI foundation with react-native-gifted-chat
- [x] Text-to-Speech (TTS) integration with expo-speech
- [x] Speech-to-Text (STT) foundation with expo-audio
- [x] AI response system with context awareness
- [x] Microphone button component with visual feedback
- [x] Dark/light theme support
- [x] Conversation flow and message handling

### 🚧 TODO (Future Enhancements)

- [ ] Integrate Whisper.cpp for offline STT
- [ ] Add local AI model (Llama.cpp or Mistral) integration
- [ ] Implement conversation persistence with AsyncStorage
- [ ] Add pronunciation feedback and scoring
- [ ] Include vocabulary and grammar practice modes
- [ ] Add progress tracking and learning analytics

## Getting Started

1. **Install Dependencies**

   ```bash
   pnpm install
   ```

2. **Start Development Server**

   ```bash
   pnpm start
   ```

3. **Run on Device/Simulator**

   ```bash
   # iOS
   pnpm ios

   # Android
   pnpm android

   # Web
   pnpm web
   ```

## Project Structure

```
app/
├── (tabs)/
│   ├── _layout.tsx          # Tab navigation layout
│   └── index.tsx            # Main chat screen
└── _layout.tsx              # Root layout

components/
├── MicButton.tsx            # Voice input button
├── themed-text.tsx          # Theme-aware text component
├── themed-view.tsx          # Theme-aware view component
└── ui/                      # UI components

hooks/
├── useSpeechToText.ts       # Speech-to-text hook
├── useTextToSpeech.ts       # Text-to-speech hook
└── use-color-scheme.ts      # Theme detection hook

utils/
└── aiResponses.ts           # AI response generation
```

## Key Components

### Chat Interface

- Built with `react-native-gifted-chat` for professional chat experience
- Custom styling for light/dark themes
- Avatar support and message bubbles
- Smooth scrolling and animation

### Voice Features

- **Speech-to-Text**: Uses expo-audio for audio recording (placeholder for Whisper.cpp)
- **Text-to-Speech**: Uses expo-speech for natural AI voice responses
- **Microphone Button**: Visual feedback during recording

### AI Conversation

- Context-aware responses based on conversation topics
- Encouraging and educational tone suitable for language learning
- Maintains conversation history for natural flow
- Topic detection for weather, food, hobbies, etc.

## Technology Stack

- **React Native** (0.81.5) with Expo SDK 54
- **Expo Router** for navigation
- **react-native-gifted-chat** for chat UI
- **expo-speech** for text-to-speech
- **expo-audio** for audio recording
- **TypeScript** for type safety

## Contributing

This app follows the coding guidelines in `.github/copilot-instructions.md`:

- Use functional components with React Hooks
- Keep code modular and well-commented
- TypeScript preferred for type safety
- Mobile-friendly and maintainable code structure

## License

Private project for English language learning practice.
