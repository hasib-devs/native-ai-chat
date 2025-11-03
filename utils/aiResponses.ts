// AI response utility - placeholder implementation
// TODO: Replace with actual Llama.cpp or Mistral integration

export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

// Friendly, encouraging AI responses for English practice
const aiResponses = [
  "That's wonderful! Can you tell me more about that?",
  "Great job expressing yourself! How do you feel about that?",
  "I love talking with you! What would you like to discuss next?",
  "Your English is improving every day! Keep practicing!",
  "That's a good point. Can you explain it using different words?",
  "Interesting! What do you think about this topic?",
  "You're doing great! Tell me about your day.",
  "That sounds exciting! Can you describe it in more detail?",
  "Perfect! How long have you been learning English?",
  "Excellent! What are your favorite things to talk about?",
  "Nice! Can you give me an example of what you mean?",
  "Fantastic! What would you like to practice today?",
  "Good thinking! How would you explain this to a friend?",
  "Amazing! What's the most interesting thing you learned recently?",
  "Well said! Can you use that word in another sentence?",
];

// Context-aware responses based on common topics
const contextResponses: Record<string, string[]> = {
  greeting: [
    "Hello! I'm so happy to practice English with you today!",
    "Hi there! How are you feeling about practicing English today?",
    "Good to see you! What would you like to talk about?",
  ],
  weather: [
    "Weather is a great topic! How's the weather where you are?",
    "I love talking about weather! What's your favorite season?",
    "Weather conversations are perfect for practicing! Tell me more.",
  ],
  food: [
    "Food is one of my favorite topics! What do you like to eat?",
    "Cooking and food are great for English practice! What's your favorite dish?",
    "Delicious topic! Can you describe how to make your favorite meal?",
  ],
  hobbies: [
    "Hobbies are wonderful to discuss! What do you enjoy doing?",
    "Tell me about your interests! Hobbies are great for vocabulary practice.",
    "I'd love to hear about what you like to do in your free time!",
  ],
};

export const getAIResponse = (
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): string => {
  const userText = userMessage.toLowerCase();

  // Check for common topics and provide context-aware responses
  if (
    userText.includes("hello") ||
    userText.includes("hi") ||
    userText.includes("hey")
  ) {
    const greetings = contextResponses.greeting;
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  if (
    userText.includes("weather") ||
    userText.includes("rain") ||
    userText.includes("sunny")
  ) {
    const weatherResponses = contextResponses.weather;
    return weatherResponses[
      Math.floor(Math.random() * weatherResponses.length)
    ];
  }

  if (
    userText.includes("food") ||
    userText.includes("eat") ||
    userText.includes("cook")
  ) {
    const foodResponses = contextResponses.food;
    return foodResponses[Math.floor(Math.random() * foodResponses.length)];
  }

  if (
    userText.includes("hobby") ||
    userText.includes("interest") ||
    userText.includes("free time")
  ) {
    const hobbyResponses = contextResponses.hobbies;
    return hobbyResponses[Math.floor(Math.random() * hobbyResponses.length)];
  }

  // Default encouraging response
  return aiResponses[Math.floor(Math.random() * aiResponses.length)];
};

// Helper to maintain conversation context (last 5 messages)
export const getConversationContext = (
  messages: ChatMessage[]
): ChatMessage[] => {
  return messages.slice(-5);
};
