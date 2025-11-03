// AI response utility - Enhanced implementation with educational features
// TODO: Replace with actual Llama.cpp or Mistral integration

export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export interface AIResponseContext {
  detectedTopics: string[];
  grammarSuggestions?: string[];
  vocabularyWords?: VocabularyWord[];
  conversationLevel?: "beginner" | "intermediate" | "advanced";
  responseType:
    | "encouragement"
    | "correction"
    | "question"
    | "teaching"
    | "conversation";
}

export interface VocabularyWord {
  word: string;
  definition: string;
  example: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface EnhancedAIResponse {
  text: string;
  context: AIResponseContext;
}

// Comprehensive vocabulary database for teaching moments
const vocabularyDatabase: Record<string, VocabularyWord[]> = {
  weather: [
    {
      word: "drizzle",
      definition: "light rain falling in very fine drops",
      example: "It's just drizzling outside, you won't need an umbrella.",
      difficulty: "medium",
    },
    {
      word: "scorching",
      definition: "extremely hot",
      example: "It's scorching today, let's stay indoors.",
      difficulty: "medium",
    },
    {
      word: "chilly",
      definition: "noticeably cold",
      example: "It's getting chilly, you might want a jacket.",
      difficulty: "easy",
    },
    {
      word: "muggy",
      definition: "unpleasantly warm and humid",
      example: "The weather is so muggy today.",
      difficulty: "hard",
    },
  ],
  food: [
    {
      word: "savory",
      definition: "having a pleasant taste or smell",
      example: "I prefer savory snacks over sweet ones.",
      difficulty: "medium",
    },
    {
      word: "bland",
      definition: "lacking strong flavor",
      example: "This soup is too bland, it needs more salt.",
      difficulty: "easy",
    },
    {
      word: "delectable",
      definition: "delicious",
      example: "The cake was absolutely delectable!",
      difficulty: "hard",
    },
    {
      word: "crispy",
      definition: "firm and crunchy",
      example: "I love crispy bacon with my eggs.",
      difficulty: "easy",
    },
  ],
  emotions: [
    {
      word: "ecstatic",
      definition: "extremely happy and excited",
      example: "I was ecstatic when I got the job.",
      difficulty: "medium",
    },
    {
      word: "melancholy",
      definition: "a feeling of sadness",
      example: "The rainy day made me feel melancholy.",
      difficulty: "hard",
    },
    {
      word: "content",
      definition: "satisfied and at peace",
      example: "I feel content with my life right now.",
      difficulty: "easy",
    },
    {
      word: "overwhelmed",
      definition: "having too much to deal with",
      example: "I feel overwhelmed with all this work.",
      difficulty: "medium",
    },
  ],
  hobbies: [
    {
      word: "meticulous",
      definition: "showing great attention to detail",
      example: "She's meticulous about her painting technique.",
      difficulty: "hard",
    },
    {
      word: "engrossing",
      definition: "absorbing all one's attention",
      example: "Reading is such an engrossing hobby.",
      difficulty: "medium",
    },
    {
      word: "therapeutic",
      definition: "having a healing effect",
      example: "Gardening is very therapeutic for me.",
      difficulty: "medium",
    },
    {
      word: "challenging",
      definition: "requiring effort and skill",
      example: "Rock climbing is a challenging sport.",
      difficulty: "easy",
    },
  ],
};

// Grammar patterns and corrections
const grammarPatterns = [
  {
    pattern: /\bi am go\b/gi,
    correction: "I am going",
    explanation: 'Use "going" (present continuous) instead of "go" after "am"',
  },
  {
    pattern: /\bhe don\'t\b/gi,
    correction: "he doesn't",
    explanation:
      'Use "doesn\'t" (not "don\'t") with third person singular (he/she/it)',
  },
  {
    pattern: /\bmuch people\b/gi,
    correction: "many people",
    explanation:
      'Use "many" with countable nouns like "people", "much" with uncountable nouns',
  },
  {
    pattern: /\bi can to\b/gi,
    correction: "I can",
    explanation:
      'Don\'t use "to" after modal verbs like "can", "should", "must"',
  },
  {
    pattern: /\bmore better\b/gi,
    correction: "better",
    explanation: '"Better" is already comparative, don\'t add "more"',
  },
];

// Topic detection keywords
const topicKeywords = {
  weather: [
    "weather",
    "rain",
    "sunny",
    "hot",
    "cold",
    "snow",
    "wind",
    "cloudy",
    "storm",
    "temperature",
    "climate",
  ],
  food: [
    "food",
    "eat",
    "cook",
    "recipe",
    "restaurant",
    "delicious",
    "taste",
    "flavor",
    "meal",
    "breakfast",
    "lunch",
    "dinner",
  ],
  emotions: [
    "feel",
    "happy",
    "sad",
    "angry",
    "excited",
    "worried",
    "nervous",
    "confident",
    "proud",
    "disappointed",
  ],
  hobbies: [
    "hobby",
    "interest",
    "play",
    "read",
    "watch",
    "listen",
    "sport",
    "music",
    "art",
    "game",
    "exercise",
  ],
  work: [
    "work",
    "job",
    "career",
    "office",
    "boss",
    "colleague",
    "meeting",
    "project",
    "business",
    "professional",
  ],
  travel: [
    "travel",
    "trip",
    "vacation",
    "visit",
    "country",
    "city",
    "plane",
    "hotel",
    "tourist",
    "culture",
  ],
  family: [
    "family",
    "mother",
    "father",
    "sister",
    "brother",
    "parent",
    "child",
    "grandmother",
    "grandfather",
  ],
  education: [
    "study",
    "school",
    "university",
    "learn",
    "teacher",
    "student",
    "class",
    "exam",
    "homework",
    "grade",
  ],
};

// Enhanced AI responses categorized by purpose
const enhancedResponses = {
  encouragement: [
    "That's wonderful! Your English is really improving!",
    "Great job expressing yourself! I can understand you perfectly.",
    "Excellent! You're becoming more confident with each conversation.",
    "Perfect! Keep practicing - you're doing amazingly well!",
    "Fantastic! Your vocabulary is expanding beautifully.",
  ],
  question: [
    "That's interesting! Can you tell me more about that?",
    "How do you feel about that situation?",
    "What do you think is the best part about it?",
    "Can you describe it in more detail?",
    "What would you do differently next time?",
    "How long have you been interested in this?",
  ],
  teaching: [
    "Let me teach you a useful phrase for this situation...",
    "Here's an interesting word you might like to learn...",
    "Did you know there's another way to express this?",
    "This reminds me of a common English expression...",
    "Let me share a helpful tip about English grammar...",
  ],
  conversation: [
    "I love talking with you about this topic!",
    "This is such an engaging conversation!",
    "You always bring up fascinating points!",
    "I enjoy our discussions - they help me understand you better!",
    "What a thoughtful perspective you have!",
  ],
  correction: [
    "I understand what you mean! Let me help you with that.",
    "Great attempt! Here's a small adjustment that might help.",
    "You're doing well! Let me suggest a slight improvement.",
    "Almost perfect! Here's a tiny correction that will help you sound more natural.",
  ],
};

// Context-aware responses with educational elements
const topicResponses: Record<
  string,
  { responses: string[]; vocabulary: VocabularyWord[] }
> = {
  weather: {
    responses: [
      "Weather is a perfect topic for English practice! How's the weather where you are?",
      "I love discussing weather! What's your favorite season and why?",
      "Weather conversations are great for learning descriptive words!",
      "Tell me about the most extreme weather you've ever experienced!",
    ],
    vocabulary: vocabularyDatabase.weather,
  },
  food: {
    responses: [
      "Food is one of my favorite topics! What do you like to eat?",
      "Cooking and food are excellent for practicing English! What's your favorite dish?",
      "Delicious topic! Can you describe how to make your favorite meal?",
      "Food brings people together! Tell me about a memorable meal.",
    ],
    vocabulary: vocabularyDatabase.food,
  },
  emotions: {
    responses: [
      "Emotions are important to express! How are you feeling today?",
      "It's great that you're sharing your feelings in English!",
      "Emotional vocabulary is so useful! What makes you happiest?",
      "Thank you for being open about your emotions with me.",
    ],
    vocabulary: vocabularyDatabase.emotions,
  },
  hobbies: {
    responses: [
      "Hobbies are wonderful to discuss! What do you enjoy doing?",
      "Tell me about your interests! Hobbies are great for vocabulary practice.",
      "I'd love to hear about what you like to do in your free time!",
      "Hobbies make great conversation starters in English!",
    ],
    vocabulary: vocabularyDatabase.hobbies,
  },
  work: {
    responses: [
      "Work is an important part of life! What do you do?",
      "Professional conversations are valuable for English practice!",
      "Tell me about your work experience - it's great vocabulary practice!",
      "Work-related English is so useful in real life!",
    ],
    vocabulary: [],
  },
};

// Detect topics in user message
const detectTopics = (text: string): string[] => {
  const lowerText = text.toLowerCase();
  const detectedTopics: string[] = [];

  Object.entries(topicKeywords).forEach(([topic, keywords]) => {
    if (keywords.some((keyword) => lowerText.includes(keyword))) {
      detectedTopics.push(topic);
    }
  });

  return detectedTopics;
};

// Detect grammar issues and provide suggestions
const detectGrammarIssues = (text: string): string[] => {
  const suggestions: string[] = [];

  grammarPatterns.forEach(({ pattern, correction, explanation }) => {
    if (pattern.test(text)) {
      suggestions.push(`Try saying "${correction}" instead. ${explanation}`);
    }
  });

  return suggestions;
};

// Determine conversation level based on vocabulary and complexity
const determineLevel = (
  text: string
): "beginner" | "intermediate" | "advanced" => {
  const wordCount = text.split(" ").length;
  const complexWords = [
    "however",
    "therefore",
    "furthermore",
    "nevertheless",
    "consequently",
  ];
  const hasComplexWords = complexWords.some((word) =>
    text.toLowerCase().includes(word)
  );

  if (wordCount > 20 && hasComplexWords) return "advanced";
  if (wordCount > 10) return "intermediate";
  return "beginner";
};

// Get random vocabulary word for teaching
const getVocabularyTeaching = (topics: string[]): VocabularyWord | null => {
  if (topics.length === 0) return null;

  const topic = topics[0];
  const words = vocabularyDatabase[topic];
  if (!words || words.length === 0) return null;

  return words[Math.floor(Math.random() * words.length)];
};

export const getEnhancedAIResponse = (
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): EnhancedAIResponse => {
  const userText = userMessage.toLowerCase();
  const detectedTopics = detectTopics(userMessage);
  const grammarSuggestions = detectGrammarIssues(userMessage);
  const level = determineLevel(userMessage);

  let responseType: AIResponseContext["responseType"] = "conversation";
  let responseText = "";
  let vocabularyWords: VocabularyWord[] = [];

  // Handle greetings
  if (
    userText.includes("hello") ||
    userText.includes("hi") ||
    userText.includes("hey")
  ) {
    responseType = "encouragement";
    responseText =
      "Hello! I'm so happy to practice English with you today! What would you like to talk about?";
  }
  // Handle grammar corrections
  else if (grammarSuggestions.length > 0) {
    responseType = "correction";
    responseText = `I understand what you mean! ${grammarSuggestions[0]} Now, can you tell me more about that?`;
  }
  // Handle topic-specific responses
  else if (detectedTopics.length > 0) {
    const topic = detectedTopics[0];
    const topicData = topicResponses[topic];

    if (topicData) {
      responseType = "teaching";
      responseText =
        topicData.responses[
          Math.floor(Math.random() * topicData.responses.length)
        ];

      // 30% chance to teach vocabulary
      if (Math.random() < 0.3) {
        const vocabWord = getVocabularyTeaching(detectedTopics);
        if (vocabWord) {
          vocabularyWords = [vocabWord];
          responseText += ` By the way, here's a great word: "${vocabWord.word}" means ${vocabWord.definition}. ${vocabWord.example}`;
        }
      }
    }
  }
  // Default encouraging responses
  else {
    const responseTypes = [
      "encouragement",
      "question",
      "conversation",
    ] as const;
    responseType =
      responseTypes[Math.floor(Math.random() * responseTypes.length)];
    const responses = enhancedResponses[responseType];
    responseText = responses[Math.floor(Math.random() * responses.length)];
  }

  return {
    text: responseText,
    context: {
      detectedTopics,
      grammarSuggestions,
      vocabularyWords,
      conversationLevel: level,
      responseType,
    },
  };
};

// Backward compatibility function
export const getAIResponse = (
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): string => {
  return getEnhancedAIResponse(userMessage, conversationHistory).text;
};

// Helper to maintain conversation context (last 5 messages)
export const getConversationContext = (
  messages: ChatMessage[]
): ChatMessage[] => {
  return messages.slice(-5);
};
