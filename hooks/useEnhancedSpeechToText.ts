import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

// Enhanced audio analysis interface for pronunciation feedback
export interface AudioAnalysisResult {
  transcription: string;
  confidence: number; // 0-1 score
  pronunciationScore: number; // 0-100 score
  wordAnalysis: WordPronunciation[];
  suggestedImprovements: string[];
  audioQuality: "excellent" | "good" | "fair" | "poor";
}

export interface WordPronunciation {
  word: string;
  score: number; // 0-100
  phonetic: string;
  issues: PronunciationIssue[];
  confidence: number;
}

export interface PronunciationIssue {
  type: "stress" | "vowel" | "consonant" | "rhythm" | "intonation";
  description: string;
  suggestion: string;
  severity: "minor" | "moderate" | "major";
}

export interface VoiceSettings {
  analysisEnabled: boolean;
  feedbackLevel: "basic" | "detailed" | "expert";
  targetAccent: "american" | "british" | "neutral";
  focusAreas: string[]; // ['pronunciation', 'fluency', 'grammar', 'vocabulary']
}

const VOICE_SETTINGS_KEY = "@english_chat_voice_settings";

// Enhanced Speech-to-Text with pronunciation analysis
export const useEnhancedSpeechToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    analysisEnabled: true,
    feedbackLevel: "detailed",
    targetAccent: "american",
    focusAreas: ["pronunciation", "fluency"],
  });

  // Load voice settings
  const loadVoiceSettings = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem(VOICE_SETTINGS_KEY);
      if (saved) {
        setVoiceSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load voice settings:", error);
    }
  }, []);

  // Save voice settings
  const saveVoiceSettings = useCallback(async (settings: VoiceSettings) => {
    try {
      await AsyncStorage.setItem(VOICE_SETTINGS_KEY, JSON.stringify(settings));
      setVoiceSettings(settings);
    } catch (error) {
      console.error("Failed to save voice settings:", error);
    }
  }, []);

  const startListening = useCallback(async () => {
    try {
      // Request permissions
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Please grant microphone permission"
        );
        return;
      }

      // Configure audio mode for high-quality recording
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      setIsListening(true);

      // Prepare and start recording with high quality settings
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (error) {
      console.error("Failed to start recording", error);
      Alert.alert("Error", "Failed to start recording");
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(async (): Promise<AudioAnalysisResult> => {
    if (!recorderState.isRecording) {
      return {
        transcription: "",
        confidence: 0,
        pronunciationScore: 0,
        wordAnalysis: [],
        suggestedImprovements: [],
        audioQuality: "poor",
      };
    }

    try {
      setIsListening(false);
      setIsAnalyzing(true);

      await audioRecorder.stop();
      const uri = audioRecorder.uri;

      // TODO: Replace with actual Whisper.cpp integration and pronunciation analysis
      // For now, simulate advanced analysis
      const result = await simulateAdvancedAnalysis(uri, voiceSettings);

      setIsAnalyzing(false);
      return result;
    } catch (error) {
      console.error("Failed to process recording", error);
      Alert.alert("Error", "Failed to analyze pronunciation");
      setIsAnalyzing(false);
      return {
        transcription: "",
        confidence: 0,
        pronunciationScore: 0,
        wordAnalysis: [],
        suggestedImprovements: ["Unable to analyze audio. Please try again."],
        audioQuality: "poor",
      };
    }
  }, [voiceSettings]);

  return {
    isListening,
    isAnalyzing,
    startListening,
    stopListening,
    voiceSettings,
    loadVoiceSettings,
    saveVoiceSettings,
  };
};

// Simulate advanced pronunciation analysis
// TODO: Replace with actual Whisper.cpp + pronunciation analysis engine
const simulateAdvancedAnalysis = async (
  audioUri: string | null,
  settings: VoiceSettings
): Promise<AudioAnalysisResult> => {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const samplePhrases = [
    {
      text: "Hello, how are you today?",
      analysis: {
        confidence: 0.95,
        pronunciationScore: 85,
        wordAnalysis: [
          {
            word: "Hello",
            score: 90,
            phonetic: "/həˈloʊ/",
            issues: [],
            confidence: 0.98,
          },
          {
            word: "how",
            score: 80,
            phonetic: "/haʊ/",
            issues: [
              {
                type: "vowel" as const,
                description: "The /aʊ/ diphthong could be clearer",
                suggestion: "Try opening your mouth more for the /a/ sound",
                severity: "minor" as const,
              },
            ],
            confidence: 0.92,
          },
          {
            word: "are",
            score: 88,
            phonetic: "/ɑr/",
            issues: [],
            confidence: 0.94,
          },
          {
            word: "you",
            score: 92,
            phonetic: "/ju/",
            issues: [],
            confidence: 0.96,
          },
          {
            word: "today",
            score: 75,
            phonetic: "/təˈdeɪ/",
            issues: [
              {
                type: "stress" as const,
                description: "Stress should be on the second syllable",
                suggestion: "Emphasize 'DAY' more than 'to'",
                severity: "moderate" as const,
              },
            ],
            confidence: 0.89,
          },
        ],
        suggestedImprovements: [
          "Focus on stress patterns in two-syllable words",
          "Practice diphthong /aʊ/ sounds",
          "Overall pronunciation is very good!",
        ],
        audioQuality: "good" as const,
      },
    },
    {
      text: "I'd like to practice my English pronunciation",
      analysis: {
        confidence: 0.88,
        pronunciationScore: 78,
        wordAnalysis: [
          {
            word: "practice",
            score: 70,
            phonetic: "/ˈpræktɪs/",
            issues: [
              {
                type: "consonant" as const,
                description: "The /k/ sound in 'practice' needs more clarity",
                suggestion:
                  "Make sure to fully stop the airflow for the /k/ sound",
                severity: "moderate" as const,
              },
            ],
            confidence: 0.85,
          },
          {
            word: "pronunciation",
            score: 65,
            phonetic: "/prəˌnʌnsiˈeɪʃən/",
            issues: [
              {
                type: "stress" as const,
                description: "Primary stress should be on 'A' in pronunciation",
                suggestion: "Say 'pronunci-A-tion' with emphasis on 'A'",
                severity: "major" as const,
              },
              {
                type: "rhythm" as const,
                description: "The word rhythm could be smoother",
                suggestion:
                  "Practice saying it slowly, then speed up gradually",
                severity: "minor" as const,
              },
            ],
            confidence: 0.82,
          },
        ],
        suggestedImprovements: [
          "Work on word stress in longer words",
          "Practice consonant clusters like /kt/ in 'practice'",
          "Great effort on complex vocabulary!",
        ],
        audioQuality: "good" as const,
      },
    },
    {
      text: "What should we talk about?",
      analysis: {
        confidence: 0.92,
        pronunciationScore: 88,
        wordAnalysis: [
          {
            word: "should",
            score: 82,
            phonetic: "/ʃʊd/",
            issues: [
              {
                type: "consonant" as const,
                description: "The /ʃ/ sound could be more distinct",
                suggestion: "Round your lips more for the 'sh' sound",
                severity: "minor" as const,
              },
            ],
            confidence: 0.9,
          },
          {
            word: "talk",
            score: 95,
            phonetic: "/tɔk/",
            issues: [],
            confidence: 0.98,
          },
          {
            word: "about",
            score: 85,
            phonetic: "/əˈbaʊt/",
            issues: [
              {
                type: "vowel" as const,
                description: "The schwa /ə/ at the beginning is perfect",
                suggestion: "Keep using reduced vowels in unstressed syllables",
                severity: "minor" as const,
              },
            ],
            confidence: 0.93,
          },
        ],
        suggestedImprovements: [
          "Excellent natural rhythm and intonation",
          "Minor improvements on consonant clarity",
          "Your question intonation is very natural!",
        ],
        audioQuality: "excellent" as const,
      },
    },
  ];

  // Select random phrase analysis
  const selected =
    samplePhrases[Math.floor(Math.random() * samplePhrases.length)];

  // Adjust scores based on settings
  let adjustedScore = selected.analysis.pronunciationScore;
  if (settings.feedbackLevel === "expert") {
    adjustedScore = Math.max(adjustedScore - 10, 60); // More strict scoring
  } else if (settings.feedbackLevel === "basic") {
    adjustedScore = Math.min(adjustedScore + 5, 95); // More encouraging scoring
  }

  return {
    transcription: selected.text,
    confidence: selected.analysis.confidence,
    pronunciationScore: adjustedScore,
    wordAnalysis: selected.analysis.wordAnalysis,
    suggestedImprovements: selected.analysis.suggestedImprovements,
    audioQuality: selected.analysis.audioQuality,
  };
};
