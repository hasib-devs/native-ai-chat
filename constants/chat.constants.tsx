import { VoiceState } from "@/types/voice.types";

export const getStateColor = (voiceState: VoiceState) => {
  switch (voiceState) {
    case "listening":
      return "#10b981"; // Green
    case "speaking":
      return "#3b82f6"; // Blue
    case "processing":
      return "#f59e0b"; // Orange
    default:
      return "#0a7ea4"; // Default tint color
  }
};

export const getStateText = (voiceState: VoiceState) => {
  switch (voiceState) {
    case "listening":
      return "Listening...";
    case "speaking":
      return "Speaking...";
    case "processing":
      return "Processing...";
    default:
      return "Tap to start";
  }
};

export const getSubtitleText = (voiceState: VoiceState) => {
  switch (voiceState) {
    case "idle":
      return "Practice your English speaking";
    case "listening":
      return "I'm listening to you...";
    case "speaking":
      return "Listen to my response";
    case "processing":
      return "Understanding what you said...";
    default:
      return "";
  }
};
