#!/bin/bash

# Voice Feature Installation Script
# This script installs all required packages for voice features

echo "🎤 Installing Voice & Speech packages for Native AI Chat..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "📦 Installing Expo Speech & Audio packages..."
npx expo install expo-speech expo-av expo-file-system

echo ""
echo "✅ Core packages installed!"
echo ""

# Ask if user wants advanced STT
read -p "Do you want to install Speech Recognition (@react-native-voice/voice)? This requires a custom dev client. (y/N): " install_stt

if [ "$install_stt" = "y" ] || [ "$install_stt" = "Y" ]; then
    echo "📦 Installing Speech Recognition..."
    npx expo install @react-native-voice/voice
    
    echo ""
    echo "⚠️  Speech Recognition requires a custom dev client."
    echo "    Run 'npx expo prebuild' to generate native code."
    echo ""
    
    read -p "Do you want to run prebuild now? (y/N): " run_prebuild
    
    if [ "$run_prebuild" = "y" ] || [ "$run_prebuild" = "Y" ]; then
        echo "🔨 Running expo prebuild..."
        npx expo prebuild --clean
    fi
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Update your app.json with microphone permissions (see VOICE_QUICKSTART.md)"
echo "   2. Test TTS: import { useTextToSpeech } from './hooks/use-text-to-speech'"
echo "   3. Test Recording: import { useAudioRecorder } from './hooks/use-audio-recorder'"
echo ""
echo "📚 Check VOICE_QUICKSTART.md for usage examples and integration guide."
echo ""
