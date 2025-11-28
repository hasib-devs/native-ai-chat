# 🎤 Voice & Speech Integration Guide

## Quick Start

### 1. Install Required Packages

```bash
# Install Expo speech and audio packages
npx expo install expo-speech expo-av expo-file-system

# If using device speech recognition (requires dev client)
npx expo install @react-native-voice/voice

# For OpenAI integration (optional)
npm install openai
```

### 2. Update Package.json Dependencies

The following packages need to be installed:
- `expo-speech` - Text-to-Speech
- `expo-av` - Audio recording and playback
- `expo-file-system` - File management
- `@react-native-voice/voice` - Speech recognition (optional, requires dev client)

### 3. Configure Permissions

Update your `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-av",
        {
          "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone for voice conversations."
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSMicrophoneUsageDescription": "This app needs microphone access for voice chat.",
        "NSSpeechRecognitionUsageDescription": "This app uses speech recognition to help you practice English."
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

### 4. Run Prebuild (if needed)

```bash
# For iOS
npx expo prebuild --platform ios

# For Android
npx expo prebuild --platform android

# Or both
npx expo prebuild
```

---

## 📁 Project Structure

```
services/
├── speech/
│   ├── text-to-speech.service.ts     ✅ Ready
│   ├── audio-recorder.service.ts      ✅ Ready
│   └── speech-to-text.service.ts      🔄 TODO (requires @react-native-voice/voice)

hooks/
├── use-text-to-speech.ts              ✅ Ready
├── use-audio-recorder.ts              ✅ Ready
└── use-speech-recognition.ts          🔄 TODO

types/
├── voice.types.ts                     ✅ Ready
└── conversation.types.ts              ✅ Ready

components/
├── core/
│   └── chat-screen.tsx                ✅ Updated (needs integration)
└── voice/
    ├── voice-recorder.tsx             🔄 TODO
    └── voice-player.tsx               🔄 TODO
```

---

## 🚀 Usage Examples

### Text-to-Speech

```tsx
import { useTextToSpeech } from '../hooks/use-text-to-speech';

function MyComponent() {
  const { speak, isSpeaking, stop } = useTextToSpeech();

  const handleSpeak = async () => {
    await speak("Hello! How can I help you practice English today?", {
      language: "en-US",
      pitch: 1.0,
      rate: 0.9,
    });
  };

  return (
    <View>
      <Button onPress={handleSpeak} title="Speak" disabled={isSpeaking} />
      <Button onPress={stop} title="Stop" />
    </View>
  );
}
```

### Audio Recording

```tsx
import { useAudioRecorder } from '../hooks/use-audio-recorder';

function VoiceRecorder() {
  const {
    isRecording,
    audioLevel,
    duration,
    startRecording,
    stopRecording,
    hasPermission,
    requestPermissions,
  } = useAudioRecorder();

  useEffect(() => {
    if (!hasPermission) {
      requestPermissions();
    }
  }, [hasPermission]);

  const handleRecord = async () => {
    if (isRecording) {
      const uri = await stopRecording();
      console.log('Recording saved:', uri);
      // Send to speech-to-text service
    } else {
      await startRecording();
    }
  };

  return (
    <View>
      <Button 
        onPress={handleRecord}
        title={isRecording ? 'Stop' : 'Record'}
      />
      {isRecording && (
        <>
          <Text>Duration: {(duration / 1000).toFixed(1)}s</Text>
          <Text>Level: {(audioLevel * 100).toFixed(0)}%</Text>
        </>
      )}
    </View>
  );
}
```

### Integrating with Chat Screen

Update your `chat-screen.tsx`:

```tsx
import { useTextToSpeech } from '../../hooks/use-text-to-speech';
import { useAudioRecorder } from '../../hooks/use-audio-recorder';

const ChatScreen = () => {
  const { speak, isSpeaking: isAISpeaking } = useTextToSpeech();
  const { isRecording, startRecording, stopRecording, audioLevel } = useAudioRecorder();
  
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");

  const toggleVoiceState = async () => {
    if (voiceState === "idle") {
      // Start listening
      setVoiceState("listening");
      await startRecording();
    } else if (voiceState === "listening") {
      // Stop and process
      const audioUri = await stopRecording();
      setVoiceState("processing");
      
      // TODO: Send to speech-to-text service
      // const transcript = await speechToTextService.transcribe(audioUri);
      
      // TODO: Send to AI and get response
      // const response = await aiService.chat(transcript);
      
      // Speak response
      setVoiceState("speaking");
      await speak(response);
      setVoiceState("idle");
    }
  };

  // Use audioLevel for waveform animation
  // Update waveAnimations based on audioLevel when recording
  
  return (
    // ... existing UI
  );
};
```

---

## 🔄 Next Steps

### Phase 1: Basic TTS & Recording (Current)
- [x] Create type definitions
- [x] Build TTS service
- [x] Build audio recorder service
- [x] Create hooks
- [ ] Install dependencies (`npx expo install expo-speech expo-av expo-file-system`)
- [ ] Test TTS functionality
- [ ] Test audio recording
- [ ] Integrate with chat screen

### Phase 2: Speech-to-Text
- [ ] Install `@react-native-voice/voice` (requires dev client)
- [ ] Create speech-to-text service
- [ ] Create `use-speech-recognition` hook
- [ ] Test transcription accuracy

### Phase 3: AI Integration
- [ ] Setup OpenAI API
- [ ] Create conversation service
- [ ] Implement conversation flow
- [ ] Add context management

### Phase 4: Polish
- [ ] Error handling UI
- [ ] Loading states
- [ ] Offline support
- [ ] Performance optimization

---

## 📦 Package Recommendations

### For Long-Term Production:

**Text-to-Speech:**
- ✅ **`expo-speech`** - Best for Expo, device TTS (FREE)
- 🔄 **OpenAI TTS API** - Premium quality, costs money

**Speech-to-Text:**
- ✅ **`@react-native-voice/voice`** - Device STT (FREE, requires dev client)
- 🔄 **OpenAI Whisper API** - High accuracy, costs money
- 🔄 **Google Cloud Speech-to-Text** - Enterprise option

**AI Conversation:**
- ✅ **OpenAI GPT-4** - Best for natural conversations
- 🔄 **OpenAI Realtime API** - All-in-one voice solution (new, experimental)

---

## 🔧 Installation Command

Run this to install all required packages:

```bash
npx expo install expo-speech expo-av expo-file-system
```

For advanced STT (requires custom dev client):
```bash
npx expo install @react-native-voice/voice
npx expo prebuild
```

---

## 📝 Notes

- **Permissions**: Make sure to request permissions before recording
- **Testing**: Test on real devices, not just simulator/emulator
- **Audio Quality**: Use HIGH_QUALITY recording preset
- **Background Mode**: Configure if you need background audio
- **File Cleanup**: Delete old recordings to save storage

---

## 🐛 Troubleshooting

**"Cannot find module 'expo-speech'"**
- Run: `npx expo install expo-speech`

**"Audio permissions denied"**
- Check `app.json` configuration
- Run `npx expo prebuild` after config changes

**"Recording not working"**
- Test on physical device (may not work in simulator)
- Check microphone permissions in device settings

**"Poor audio quality"**
- Use `RecordingOptionsPresets.HIGH_QUALITY`
- Check device microphone quality
- Reduce background noise

---

## 📚 Resources

- [Expo Speech Docs](https://docs.expo.dev/versions/latest/sdk/speech/)
- [Expo AV Docs](https://docs.expo.dev/versions/latest/sdk/av/)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [React Native Voice](https://github.com/react-native-voice/voice)
