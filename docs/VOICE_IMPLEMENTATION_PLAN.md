# Voice-to-Text & Text-to-Voice Implementation Plan

## Phase 1: Setup & Dependencies (Week 1)

### Install Required Packages
```bash
# Core speech packages
npx expo install expo-speech expo-av

# For advanced STT (requires dev client)
npx expo install @react-native-voice/voice

# Permissions
npx expo install expo-permissions

# Optional: AI Integration
npm install openai
```

### Update app.json/app.config.js
```json
{
  "expo": {
    "plugins": [
      [
        "expo-av",
        {
          "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone for voice chat."
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSSpeechRecognitionUsageDescription": "This app uses speech recognition to help you practice English.",
        "NSMicrophoneUsageDescription": "This app needs microphone access for voice chat."
      }
    },
    "android": {
      "permissions": [
        "android.permission.RECORD_AUDIO",
        "android.permission.MODIFY_AUDIO_SETTINGS"
      ]
    }
  }
}
```

---

## Phase 2: Core Services Layer (Week 1-2)

### 1. Text-to-Speech Service
**File:** `services/speech/text-to-speech.service.ts`

**Features:**
- Convert AI responses to speech
- Voice customization (pitch, rate, language)
- Queue management for long texts
- Pause/resume/stop controls

**Key Methods:**
- `speak(text: string, options?: SpeakOptions): Promise<void>`
- `stop(): void`
- `pause(): void`
- `resume(): void`
- `isSpeaking(): boolean`

---

### 2. Speech-to-Text Service
**File:** `services/speech/speech-to-text.service.ts`

**Features:**
- Real-time transcription
- Continuous listening mode
- Language detection
- Error handling & retry logic

**Key Methods:**
- `startListening(options?: ListenOptions): Promise<void>`
- `stopListening(): Promise<string>`
- `onPartialResult(callback: (text: string) => void): void`
- `onFinalResult(callback: (text: string) => void): void`
- `cancelListening(): void`

---

### 3. Audio Processor Service
**File:** `services/speech/audio-processor.service.ts`

**Features:**
- Audio level monitoring (for waveform animation)
- Noise detection
- Recording quality checks

---

## Phase 3: Custom Hooks (Week 2)

### 1. `use-speech-recognition.ts`
```typescript
interface UseSpeechRecognitionReturn {
  transcript: string;
  isListening: boolean;
  error: Error | null;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  audioLevel: number; // For waveform animation
}
```

### 2. `use-text-to-speech.ts`
```typescript
interface UseTextToSpeechReturn {
  isSpeaking: boolean;
  speak: (text: string) => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
}
```

### 3. `use-conversation.ts` (Orchestrator)
```typescript
interface UseConversationReturn {
  messages: Message[];
  isUserSpeaking: boolean;
  isAISpeaking: boolean;
  isProcessing: boolean;
  startConversation: () => void;
  endConversation: () => void;
  sendMessage: (text: string) => Promise<void>;
}
```

---

## Phase 4: UI Components (Week 3)

### 1. Voice Recorder Component
**File:** `components/voice/voice-recorder.tsx`

**Features:**
- Record button with animations
- Real-time audio level visualization
- Recording timer
- Cancel/send options

### 2. Voice Player Component
**File:** `components/voice/voice-player.tsx`

**Features:**
- Play AI voice responses
- Progress indicator
- Playback controls (pause/resume/stop)
- Speed adjustment (0.75x, 1x, 1.25x, 1.5x)

### 3. Conversation Manager
**File:** `components/core/conversation-manager.tsx`

**Features:**
- Manages conversation flow
- Handles turn-taking (user speaks → AI responds)
- Auto-play AI responses
- Transcript history

---

## Phase 5: AI Integration (Week 3-4)

### 1. OpenAI Integration
**File:** `services/ai/openai.service.ts`

**Options:**
1. **OpenAI Whisper** (STT) + **GPT-4** (Chat) + **TTS**
2. **OpenAI Realtime API** (All-in-one voice conversation)
3. **Azure Speech Services** (Alternative)

**Recommended:** OpenAI Realtime API for natural conversations

### 2. Conversation Context
- Store conversation history
- Maintain user profile (English level, learning goals)
- Track progress and metrics

---

## Phase 6: Advanced Features (Week 4+)

### 1. Offline Support
- Cache common phrases
- Download TTS voices
- Queue messages when offline

### 2. Analytics & Feedback
- Track pronunciation accuracy
- Measure speaking confidence
- Provide constructive feedback

### 3. Conversation Scenarios
- Daily practice routines
- Topic-based conversations
- Role-play scenarios

---

## Technical Considerations

### State Management
**Recommended:** React Context + useReducer or Zustand

```typescript
// contexts/conversation-context.tsx
interface ConversationState {
  messages: Message[];
  voiceState: 'idle' | 'listening' | 'speaking' | 'processing';
  settings: VoiceSettings;
}
```

### Error Handling
- Permission denied
- Network errors
- API rate limits
- Audio device issues
- Background mode handling

### Performance Optimization
- Debounce audio level updates
- Lazy load AI services
- Optimize animation performance
- Cancel pending requests on unmount

### Security
- Secure API key storage (use environment variables)
- Never commit API keys
- Use Expo SecureStore for tokens
- Validate audio input

---

## Testing Strategy

### Unit Tests
- Service layer logic
- Audio processing utilities
- Permission handling

### Integration Tests
- Voice recording → Transcription flow
- Text → Speech playback
- Full conversation cycle

### E2E Tests
- Complete user journey
- Permission flows
- Error scenarios

---

## Deployment Checklist

- [ ] Add proper permissions to app config
- [ ] Test on physical devices (iOS & Android)
- [ ] Handle background audio
- [ ] Optimize bundle size
- [ ] Setup error tracking (Sentry)
- [ ] Configure analytics
- [ ] Test in poor network conditions
- [ ] Verify audio quality on different devices
- [ ] Test battery usage
- [ ] Prepare App Store/Play Store assets

---

## Recommended Timeline

**Week 1:** Setup + TTS (easier)
**Week 2:** STT + Hooks layer
**Week 3:** UI Components + Integration
**Week 4:** AI Integration + Testing
**Week 5+:** Polish + Advanced features

---

## Cost Considerations

### OpenAI Pricing (Approximate)
- **Whisper API:** $0.006/minute (STT)
- **GPT-4 Turbo:** $0.01/1K tokens
- **TTS:** $15/1M characters
- **Realtime API:** $0.06-0.24/minute (all-in-one)

### Alternatives for Cost Savings
- Use device TTS (expo-speech) - FREE
- Use device STT for basic recognition - FREE
- Cache common responses
- Implement usage limits

---

## Priority Implementation Order

1. ✅ **TTS with expo-speech** (Start here - simplest)
2. ✅ **Basic audio recording with expo-av**
3. ✅ **STT with device speech recognition**
4. ✅ **Integrate with OpenAI API**
5. ✅ **Add conversation management**
6. ✅ **Polish UI/UX**
7. ✅ **Add advanced features**
