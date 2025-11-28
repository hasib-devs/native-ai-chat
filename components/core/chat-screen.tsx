import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import {
  getStateColor,
  getStateText,
  getSubtitleText,
} from "@/constants/chat.constants";
import type { Message } from "@/types/conversation.types";
import type { VoiceState } from "@/types/voice.types";
import {
  AudioBuffer,
  AudioContext,
  AudioManager,
  AudioRecorder,
  type AudioBufferSourceNode,
} from "react-native-audio-api";

import { Colors } from "../../constants/theme";

const AI_SAMPLE_URL =
  "https://software-mansion.github.io/react-native-audio-api/audio/music/example-music-01.mp3";
const RECORDING_TIMEOUT_MS = 30_000;
const BASE_WAVE_LEVELS = [0.25, 0.45, 0.65, 0.45, 0.25];

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const formatDuration = (ms: number) => {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const calculateInputLevel = (buffer: AudioBuffer) => {
  if (buffer.numberOfChannels === 0 || buffer.length === 0) {
    return 0;
  }

  const channelSamples = new Float32Array(buffer.length);
  buffer.copyFromChannel(channelSamples, 0);

  let sumSquares = 0;
  for (let i = 0; i < channelSamples.length; i += 1) {
    const sample = channelSamples[i];
    sumSquares += sample * sample;
  }

  const rms = Math.sqrt(sumSquares / channelSamples.length);
  return clamp(rms * 4, 0, 1);
};

const generateAssistantResponse = (durationMs: number) => {
  const seconds = Math.max(1, Math.round(durationMs / 1000));
  const prompts = [
    `Great job speaking for about ${seconds} seconds. Tell me more about what made today special for you.`,
    `Nice work staying confident for ${seconds} seconds. Can you describe what you were thinking while you spoke?`,
    `You sounded clear for roughly ${seconds} seconds! Let's dive deeper—what else would you add to that story?`,
    `Thanks for sharing for ${seconds} seconds. Could you expand on the most interesting part of what you just said?`,
  ];

  const randomIndex = Math.floor(Math.random() * prompts.length);
  return prompts[randomIndex];
};

const createMessageId = (role: Message["role"]) =>
  `${role}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const ChatScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const initialAssistantMessage = useMemo<Message>(
    () => ({
      id: createMessageId("assistant"),
      role: "assistant",
      content:
        "Hi! I'm your AI English buddy. Tap the mic and tell me about your day.",
      timestamp: Date.now(),
    }),
    []
  );

  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [messages, setMessages] = useState<Message[]>([
    initialAssistantMessage,
  ]);
  const [recordingDurationMs, setRecordingDurationMs] = useState(0);
  const [inputLevel, setInputLevel] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const playbackSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const recordedChunksRef = useRef<AudioBuffer[]>([]);
  const recordedFramesRef = useRef(0);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingStartTimeRef = useRef<number | null>(null);
  const isStoppingRef = useRef(false);
  const voiceStateRef = useRef<VoiceState>("idle");
  const isMountedRef = useRef(false);
  const assistantBufferRef = useRef<AudioBuffer | null>(null);
  const lastAssistantMessageIdRef = useRef<string | null>(
    initialAssistantMessage.id
  );
  const currentPlaybackMessageIdRef = useRef<string | null>(null);
  const lastRecordingRef = useRef<AudioBuffer | null>(null);
  const listRef = useRef<FlatList<Message> | null>(null);
  const speakingWaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const waveAnimations = useRef(
    BASE_WAVE_LEVELS.map((level) => new Animated.Value(level))
  ).current;

  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const rotateLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const stopPlayback = useCallback(() => {
    const source = playbackSourceRef.current;
    if (source) {
      try {
        source.stop();
      } catch {
        // source already stopped
      }
      try {
        source.disconnect();
      } catch {
        // ignore if node already disconnected
      }
      playbackSourceRef.current = null;
    }

    const messageId = currentPlaybackMessageIdRef.current;
    if (messageId) {
      currentPlaybackMessageIdRef.current = null;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, isPlaying: false } : msg
        )
      );
    }
  }, [setMessages]);

  const configureSessionForRecording = useCallback(() => {
    AudioManager.setAudioSessionOptions({
      iosCategory: "playAndRecord",
      iosMode: "voiceChat",
      iosOptions: [
        "allowBluetooth",
        "allowBluetoothA2DP",
        "defaultToSpeaker",
        "interruptSpokenAudioAndMixWithOthers",
      ],
    });
  }, []);

  const configureSessionForPlayback = useCallback(() => {
    AudioManager.setAudioSessionOptions({
      iosCategory: "playback",
      iosMode: "spokenAudio",
      iosOptions: [
        "allowBluetooth",
        "allowBluetoothA2DP",
        "interruptSpokenAudioAndMixWithOthers",
      ],
    });
  }, []);

  const ensureRecordingPermission = useCallback(async () => {
    const currentStatus = await AudioManager.checkRecordingPermissions();
    if (currentStatus === "Granted") {
      return true;
    }

    const updatedStatus = await AudioManager.requestRecordingPermissions();
    if (updatedStatus === "Granted") {
      return true;
    }

    Alert.alert(
      "Microphone access needed",
      "Please allow microphone access in Settings to practice speaking."
    );
    return false;
  }, []);

  const mergeRecordedChunks = useCallback((): AudioBuffer | null => {
    const context = audioContextRef.current;
    const chunks = recordedChunksRef.current;

    if (!context || chunks.length === 0) {
      return null;
    }

    const first = chunks[0];
    const sampleRate = first.sampleRate;
    const channelCount = first.numberOfChannels;
    const totalLength = chunks.reduce((acc, buffer) => acc + buffer.length, 0);

    if (totalLength === 0) {
      return null;
    }

    const merged = context.createBuffer(channelCount, totalLength, sampleRate);
    let offset = 0;

    chunks.forEach((buffer) => {
      for (let channel = 0; channel < channelCount; channel += 1) {
        const channelSamples = new Float32Array(buffer.length);
        buffer.copyFromChannel(channelSamples, channel);
        merged.copyToChannel(channelSamples, channel, offset);
      }
      offset += buffer.length;
    });

    return merged;
  }, []);

  const handleRecorderChunk = useCallback(
    (event: { buffer: AudioBuffer; numFrames: number }) => {
      recordedChunksRef.current.push(event.buffer);
      recordedFramesRef.current += event.numFrames;

      if (voiceStateRef.current === "listening") {
        const level = calculateInputLevel(event.buffer);
        setInputLevel(level);

        waveAnimations.forEach((anim, index) => {
          Animated.timing(anim, {
            toValue: clamp(BASE_WAVE_LEVELS[index] + level * 0.9, 0.2, 1.2),
            duration: 160,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }).start();
        });
      }
    },
    []
  );

  const playBuffer = useCallback(
    async (buffer: AudioBuffer, messageId?: string | null) => {
      const context = audioContextRef.current;
      if (!context) {
        return;
      }

      try {
        await context.resume();
      } catch {
        // context already running
      }

      configureSessionForPlayback();
      stopPlayback();

      await new Promise<void>((resolve) => {
        const source = context.createBufferSource();
        playbackSourceRef.current = source;
        currentPlaybackMessageIdRef.current = messageId ?? null;

        if (messageId) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId ? { ...msg, isPlaying: true } : msg
            )
          );
        }

        source.buffer = buffer;
        source.connect(context.destination);
        source.onEnded = () => {
          if (messageId) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === messageId ? { ...msg, isPlaying: false } : msg
              )
            );
          }

          if (currentPlaybackMessageIdRef.current === messageId) {
            currentPlaybackMessageIdRef.current = null;
          }

          playbackSourceRef.current = null;
          resolve();
        };

        try {
          source.start(context.currentTime);
        } catch {
          resolve();
        }
      });
    },
    [configureSessionForPlayback, setMessages, stopPlayback]
  );

  const fetchAssistantAudio = useCallback(async () => {
    const context = audioContextRef.current;
    if (!context) {
      Alert.alert(
        "Audio unavailable",
        "The audio engine is still preparing. Please try again in a moment."
      );
      return null;
    }

    if (assistantBufferRef.current) {
      return assistantBufferRef.current;
    }

    try {
      const response = await fetch(AI_SAMPLE_URL);
      if (!response.ok) {
        throw new Error(`Status ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const decoded = await context.decodeAudioData(arrayBuffer);
      assistantBufferRef.current = decoded;
      return decoded;
    } catch (error) {
      console.warn("Failed to load assistant audio", error);
      Alert.alert(
        "Playback unavailable",
        "I couldn't load the practice response. Please check your connection and try again."
      );
      return null;
    }
  }, []);

  const handleAssistantResponse = useCallback(
    async (userRecording: AudioBuffer, recordingDuration: number) => {
      lastRecordingRef.current = userRecording;

      await delay(600);
      if (!isMountedRef.current) {
        return;
      }

      const assistantMessageId = createMessageId("assistant");
      const assistantText = generateAssistantResponse(recordingDuration);

      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content: assistantText,
          timestamp: Date.now(),
          isPlaying: false,
        },
      ]);

      lastAssistantMessageIdRef.current = assistantMessageId;

      const responseBuffer = await fetchAssistantAudio();
      if (!responseBuffer || !isMountedRef.current) {
        setVoiceState("idle");
        voiceStateRef.current = "idle";
        return;
      }

      setVoiceState("speaking");
      voiceStateRef.current = "speaking";

      await playBuffer(responseBuffer, assistantMessageId);

      if (!isMountedRef.current) {
        return;
      }

      setVoiceState("idle");
      voiceStateRef.current = "idle";
    },
    [fetchAssistantAudio, playBuffer, setMessages]
  );

  const stopRecording = useCallback(async () => {
    if (voiceStateRef.current !== "listening" || isStoppingRef.current) {
      return;
    }

    isStoppingRef.current = true;

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    const finalDurationMs =
      recordingStartTimeRef.current != null
        ? Date.now() - recordingStartTimeRef.current
        : 0;
    recordingStartTimeRef.current = null;

    const recorder = recorderRef.current;
    recorderRef.current = null;

    try {
      recorder?.stop();
    } catch {
      // ignore stop errors
    }

    await delay(160);

    const mergedRecording = mergeRecordedChunks();
    recordedChunksRef.current = [];
    recordedFramesRef.current = 0;

    if (!mergedRecording) {
      setVoiceState("idle");
      voiceStateRef.current = "idle";
      setRecordingDurationMs(0);
      isStoppingRef.current = false;
      return;
    }

    const userMessage: Message = {
      id: createMessageId("user"),
      role: "user",
      content:
        finalDurationMs > 0
          ? `I spoke for ${formatDuration(finalDurationMs)}.`
          : "I shared a quick thought.",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputLevel(0);

    setVoiceState("processing");
    voiceStateRef.current = "processing";

    try {
      await handleAssistantResponse(mergedRecording, finalDurationMs);
    } finally {
      setRecordingDurationMs(0);
      isStoppingRef.current = false;
    }
  }, [handleAssistantResponse, mergeRecordedChunks, setMessages]);

  const startRecording = useCallback(async () => {
    if (voiceStateRef.current !== "idle") {
      return;
    }

    const context = audioContextRef.current;
    if (!context) {
      Alert.alert(
        "Audio not ready",
        "The audio engine is still starting. Please try again shortly."
      );
      return;
    }

    const hasPermission = await ensureRecordingPermission();
    if (!hasPermission) {
      return;
    }

    configureSessionForRecording();
    stopPlayback();

    recordedChunksRef.current = [];
    recordedFramesRef.current = 0;

    const preferredSampleRate = AudioManager.getDevicePreferredSampleRate();
    const recorder = new AudioRecorder({
      sampleRate: preferredSampleRate,
      bufferLengthInSamples: Math.max(
        Math.round(preferredSampleRate / 5),
        2048
      ),
    });

    recorder.onAudioReady(handleRecorderChunk);
    recorder.start();
    recorderRef.current = recorder;

    recordingStartTimeRef.current = Date.now();
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }

    recordingTimerRef.current = setInterval(() => {
      if (!recordingStartTimeRef.current) {
        return;
      }
      const elapsed = Date.now() - recordingStartTimeRef.current;
      setRecordingDurationMs(elapsed);
      if (elapsed >= RECORDING_TIMEOUT_MS) {
        void stopRecording();
      }
    }, 200);

    setInputLevel(0);
    setVoiceState("listening");
    voiceStateRef.current = "listening";
  }, [
    configureSessionForRecording,
    ensureRecordingPermission,
    handleRecorderChunk,
    stopPlayback,
    stopRecording,
  ]);

  const handleOrbPress = useCallback(async () => {
    if (voiceStateRef.current === "processing") {
      return;
    }

    if (voiceStateRef.current === "idle") {
      await startRecording();
      return;
    }

    if (voiceStateRef.current === "listening") {
      await stopRecording();
      return;
    }

    if (voiceStateRef.current === "speaking") {
      stopPlayback();
      setVoiceState("idle");
      voiceStateRef.current = "idle";
    }
  }, [startRecording, stopPlayback, stopRecording]);

  const handleReplayAssistant = useCallback(async () => {
    if (
      voiceStateRef.current === "listening" ||
      voiceStateRef.current === "processing"
    ) {
      return;
    }

    const messageId = lastAssistantMessageIdRef.current;
    if (!messageId) {
      return;
    }

    const buffer = assistantBufferRef.current ?? (await fetchAssistantAudio());
    if (!buffer) {
      return;
    }

    setVoiceState("speaking");
    voiceStateRef.current = "speaking";

    await playBuffer(buffer, messageId);

    if (!isMountedRef.current) {
      return;
    }

    setVoiceState("idle");
    voiceStateRef.current = "idle";
  }, [fetchAssistantAudio, playBuffer]);

  useEffect(() => {
    const context = new AudioContext();
    audioContextRef.current = context;

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      if (speakingWaveTimerRef.current) {
        clearInterval(speakingWaveTimerRef.current);
        speakingWaveTimerRef.current = null;
      }

      stopPlayback();

      try {
        recorderRef.current?.stop();
      } catch {
        // ignore recorder stop errors during cleanup
      }

      recorderRef.current = null;

      audioContextRef.current = null;
      void context.close?.();
    };
  }, [stopPlayback]);

  useEffect(() => {
    voiceStateRef.current = voiceState;
  }, [voiceState]);

  useEffect(() => {
    AudioManager.enableRemoteCommand("remotePlay", true);
    AudioManager.enableRemoteCommand("remotePause", true);
    AudioManager.observeAudioInterruptions(true);

    const remotePlaySubscription = AudioManager.addSystemEventListener(
      "remotePlay",
      () => {
        void handleReplayAssistant();
      }
    );

    const remotePauseSubscription = AudioManager.addSystemEventListener(
      "remotePause",
      () => {
        stopPlayback();
        if (voiceStateRef.current === "speaking") {
          setVoiceState("idle");
          voiceStateRef.current = "idle";
        }
      }
    );

    const interruptionSubscription = AudioManager.addSystemEventListener(
      "interruption",
      (event) => {
        if (event.type === "began") {
          if (voiceStateRef.current === "listening") {
            void stopRecording();
          }
          stopPlayback();
        }
      }
    );

    AudioManager.getDevicesInfo().catch(() => null);

    return () => {
      remotePlaySubscription?.remove();
      remotePauseSubscription?.remove();
      interruptionSubscription?.remove();
      AudioManager.enableRemoteCommand("remotePlay", false);
      AudioManager.enableRemoteCommand("remotePause", false);
      AudioManager.observeAudioInterruptions(false);
    };
  }, [handleReplayAssistant, stopPlayback, stopRecording]);

  useEffect(() => {
    if (!listRef.current || messages.length === 0) {
      return;
    }

    const timeout = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 50);

    return () => clearTimeout(timeout);
  }, [messages.length]);

  useEffect(() => {
    if (voiceState === "listening" || voiceState === "speaking") {
      if (pulseLoopRef.current == null) {
        pulseLoopRef.current = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.15,
              duration: 900,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 900,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
        pulseLoopRef.current.start();
      }
    } else {
      pulseLoopRef.current?.stop();
      pulseLoopRef.current = null;
      pulseAnim.setValue(1);
    }
  }, [pulseAnim, voiceState]);

  useEffect(() => {
    if (voiceState === "listening") {
      if (rotateLoopRef.current == null) {
        rotateLoopRef.current = Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 3200,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        );
        rotateLoopRef.current.start();
      }
    } else {
      rotateLoopRef.current?.stop();
      rotateLoopRef.current = null;
      rotateAnim.setValue(0);
    }
  }, [rotateAnim, voiceState]);

  useEffect(() => {
    if (voiceState === "idle" || voiceState === "processing") {
      waveAnimations.forEach((anim, index) => {
        Animated.timing(anim, {
          toValue: BASE_WAVE_LEVELS[index],
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
      });
      setInputLevel(0);
    }
  }, [voiceState]);

  useEffect(() => {
    if (voiceState === "speaking") {
      if (speakingWaveTimerRef.current) {
        clearInterval(speakingWaveTimerRef.current);
      }
      speakingWaveTimerRef.current = setInterval(() => {
        waveAnimations.forEach((anim, index) => {
          Animated.timing(anim, {
            toValue: clamp(
              BASE_WAVE_LEVELS[index] + Math.random() * 0.7,
              0.2,
              1.25
            ),
            duration: 220,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }).start();
        });
      }, 220);
    } else if (speakingWaveTimerRef.current) {
      clearInterval(speakingWaveTimerRef.current);
      speakingWaveTimerRef.current = null;
    }

    return () => {
      if (speakingWaveTimerRef.current) {
        clearInterval(speakingWaveTimerRef.current);
        speakingWaveTimerRef.current = null;
      }
    };
  }, [voiceState]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => {
      const isUser = item.role === "user";
      const bubbleColor = isUser
        ? colors.tint
        : colorScheme === "dark"
        ? "#1f2937"
        : "#eef2ff";
      const textColor = isUser ? "#ffffff" : colors.text;

      return (
        <View
          style={[
            styles.messageRow,
            isUser ? styles.messageRowUser : styles.messageRowAssistant,
          ]}
        >
          <View
            style={[styles.messageBubble, { backgroundColor: bubbleColor }]}
          >
            <Text style={[styles.messageText, { color: textColor }]}>
              {item.content}
            </Text>
            {item.isPlaying && (
              <Text
                style={[
                  styles.playingTag,
                  { color: textColor === "#ffffff" ? "#fef3c7" : colors.tint },
                ]}
              >
                Playing…
              </Text>
            )}
          </View>
        </View>
      );
    },
    [colorScheme, colors.text, colors.tint]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.messagesSection}>
        <FlatList
          ref={(ref) => {
            listRef.current = ref;
          }}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <View style={styles.voiceSection}>
        {voiceState === "speaking" && (
          <Text style={styles.playbackHint}>Tap the orb to stop playback.</Text>
        )}

        <View style={styles.orbContainer}>
          {voiceState === "listening" && (
            <Animated.View
              style={[
                styles.rotatingRing,
                {
                  borderColor: getStateColor(voiceState),
                  transform: [{ rotate: rotation }],
                },
              ]}
            >
              <View
                style={[
                  styles.ringDot,
                  { backgroundColor: getStateColor(voiceState) },
                ]}
              />
              <View
                style={[
                  styles.ringDot,
                  { backgroundColor: getStateColor(voiceState) },
                ]}
              />
              <View
                style={[
                  styles.ringDot,
                  { backgroundColor: getStateColor(voiceState) },
                ]}
              />
            </Animated.View>
          )}

          <TouchableOpacity onPress={handleOrbPress} activeOpacity={0.85}>
            <Animated.View
              style={[
                styles.orb,
                {
                  backgroundColor: getStateColor(voiceState),
                  transform: [{ scale: pulseAnim }],
                  shadowOpacity: 0.22 + inputLevel * 0.25,
                  shadowRadius: 16 + inputLevel * 14,
                },
              ]}
            >
              {(voiceState === "listening" || voiceState === "speaking") && (
                <View style={styles.waveformContainer}>
                  {waveAnimations.map((anim, index) => (
                    <View key={index} style={styles.wavebarWrapper}>
                      <Animated.View
                        style={[
                          styles.wavebar,
                          {
                            transform: [{ scaleY: anim }],
                            opacity: anim.interpolate({
                              inputRange: [0.2, 1.25],
                              outputRange: [0.45, 1],
                            }),
                            backgroundColor:
                              voiceState === "listening"
                                ? "rgba(255, 255, 255, 0.92)"
                                : "rgba(255, 255, 255, 0.82)",
                          },
                        ]}
                      />
                    </View>
                  ))}
                </View>
              )}

              {voiceState === "idle" && <Text style={styles.micIcon}>🎤</Text>}
              {voiceState === "processing" && (
                <ActivityIndicator size="large" color="#ffffff" />
              )}
            </Animated.View>
          </TouchableOpacity>
        </View>

        <Text style={[styles.statusText, { color: colors.text }]}>
          {getStateText(voiceState)}
        </Text>
        <Text style={[styles.subtitleText, { color: colors.icon }]}>
          {getSubtitleText(voiceState)}
        </Text>

        {voiceState === "listening" && (
          <Text style={styles.recordingTimer}>
            {formatDuration(recordingDurationMs)}
          </Text>
        )}

        {voiceState === "processing" && (
          <View style={styles.processingRow}>
            <ActivityIndicator size="small" color={colors.tint} />
            <Text style={[styles.processingText, { color: colors.text }]}>
              Thinking about what to say…
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  messagesSection: {
    flex: 1,
  },
  messagesContent: {
    paddingBottom: 32,
  },
  voiceSection: {
    alignItems: "center",
    paddingVertical: 12,
  },
  playbackHint: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 4,
  },
  messageRow: {
    flexDirection: "row",
    paddingHorizontal: 4,
    marginVertical: 6,
  },
  messageRowUser: {
    justifyContent: "flex-end",
  },
  messageRowAssistant: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "82%",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  playingTag: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "500",
  },
  orbContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  rotatingRing: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    borderStyle: "dashed",
  },
  ringDot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    top: -4,
    left: "50%",
    marginLeft: -4,
  },
  orb: {
    width: 168,
    height: 168,
    borderRadius: 84,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 22,
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  wavebarWrapper: {
    height: 88,
    justifyContent: "center",
    marginHorizontal: 3,
  },
  wavebar: {
    width: 6,
    height: 88,
    borderRadius: 3,
  },
  micIcon: {
    fontSize: 52,
  },
  statusText: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitleText: {
    fontSize: 15,
    textAlign: "center",
  },
  recordingTimer: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ef4444",
    letterSpacing: 1,
    marginTop: 4,
  },
  processingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  processingText: {
    fontSize: 14,
    marginLeft: 8,
  },
});

export default ChatScreen;
