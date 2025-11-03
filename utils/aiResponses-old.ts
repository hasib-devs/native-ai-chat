// AI response utility - Enhanced implementation with educational features
// TODO: Replace with actual Llama.cpp or Mistral integration

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface AIResponseContext {
  detectedTopics: string[];
  grammarSuggestions?: string[];
  vocabularyWords?: VocabularyWord[];
  conversationLevel?: 'beginner' | 'intermediate' | 'advanced';
  responseType: 'encouragement' | 'correction' | 'question' | 'teaching' | 'conversation';
}

export interface VocabularyWord {
  word: string;
  definition: string;
  example: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface EnhancedAIResponse {
  text: string;
  context: AIResponseContext;
}

// Comprehensive vocabulary database for teaching moments
const vocabularyDatabase: Record<string, VocabularyWord[]> = {
  weather: [
    { word: 'drizzle', definition: 'light rain falling in very fine drops', example: 'It\'s just drizzling outside, you won\'t need an umbrella.', difficulty: 'medium' },
    { word: 'scorching', definition: 'extremely hot', example: 'It\'s scorching today, let\'s stay indoors.', difficulty: 'medium' },
    { word: 'chilly', definition: 'noticeably cold', example: 'It\'s getting chilly, you might want a jacket.', difficulty: 'easy' },
    { word: 'muggy', definition: 'unpleasantly warm and humid', example: 'The weather is so muggy today.', difficulty: 'hard' },
  ],
  food: [
    { word: 'savory', definition: 'having a pleasant taste or smell', example: 'I prefer savory snacks over sweet ones.', difficulty: 'medium' },
    { word: 'bland', definition: 'lacking strong flavor', example: 'This soup is too bland, it needs more salt.', difficulty: 'easy' },
    { word: 'delectable', definition: 'delicious', example: 'The cake was absolutely delectable!', difficulty: 'hard' },
    { word: 'crispy', definition: 'firm and crunchy', example: 'I love crispy bacon with my eggs.', difficulty: 'easy' },
  ],
  emotions: [
    { word: 'ecstatic', definition: 'extremely happy and excited', example: 'I was ecstatic when I got the job.', difficulty: 'medium' },
    { word: 'melancholy', definition: 'a feeling of sadness', example: 'The rainy day made me feel melancholy.', difficulty: 'hard' },
    { word: 'content', definition: 'satisfied and at peace', example: 'I feel content with my life right now.', difficulty: 'easy' },
    { word: 'overwhelmed', definition: 'having too much to deal with', example: 'I feel overwhelmed with all this work.', difficulty: 'medium' },
  ],
  hobbies: [
    { word: 'meticulous', definition: 'showing great attention to detail', example: 'She\'s meticulous about her painting technique.', difficulty: 'hard' },
    { word: 'engrossing', definition: 'absorbing all one\'s attention', example: 'Reading is such an engrossing hobby.', difficulty: 'medium' },
    { word: 'therapeutic', definition: 'having a healing effect', example: 'Gardening is very therapeutic for me.', difficulty: 'medium' },
    { word: 'challenging', definition: 'requiring effort and skill', example: 'Rock climbing is a challenging sport.', difficulty: 'easy' },
  ],
}; = [
  {
    pattern: /\bi am go\b/gi,
    correction: 'I am going',
    explanation: 'Use "going" (present continuous) instead of "go" after "am"',
  },
  {
    pattern: /\bhe don\'t\b/gi,
    correction: 'he doesn\'t',
    explanation: 'Use "doesn\'t" (not "don\'t") with third person singular (he/she/it)',
  },
  {
    pattern: /\bmuch people\b/gi,
    correction: 'many people',
    explanation: 'Use "many" with countable nouns like "people", "much" with uncountable nouns',
  },
  {
    pattern: /\bi can to\b/gi,
    correction: 'I can',
    explanation: 'Don\'t use "to" after modal verbs like "can", "should", "must"',
  },
  {
    pattern: /\bmore better\b/gi,
    correction: 'better',
    explanation: '"Better" is already comparative, don\'t add "more"',
  },
];

// Topic detection keywords
const topicKeywords = {
  weather: ['weather', 'rain', 'sunny', 'hot', 'cold', 'snow', 'wind', 'cloudy', 'storm', 'temperature', 'climate'],
  food: ['food', 'eat', 'cook', 'recipe', 'restaurant', 'delicious', 'taste', 'flavor', 'meal', 'breakfast', 'lunch', 'dinner'],
  emotions: ['feel', 'happy', 'sad', 'angry', 'excited', 'worried', 'nervous', 'confident', 'proud', 'disappointed'],
  hobbies: ['hobby', 'interest', 'play', 'read', 'watch', 'listen', 'sport', 'music', 'art', 'game', 'exercise'],
  work: ['work', 'job', 'career', 'office', 'boss', 'colleague', 'meeting', 'project', 'business', 'professional'],
  travel: ['travel', 'trip', 'vacation', 'visit', 'country', 'city', 'plane', 'hotel', 'tourist', 'culture'],
  family: ['family', 'mother', 'father', 'sister', 'brother', 'parent', 'child', 'grandmother', 'grandfather'],
  education: ['study', 'school', 'university', 'learn', 'teacher', 'student', 'class', 'exam', 'homework', 'grade'],
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
  questions: [
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
    "What an thoughtful perspective you have!",
  ],
};

// Context-aware responses with educational elements
const topicResponses: Record<string, { responses: string[]; vocabulary: VocabularyWord[] }> = {
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
