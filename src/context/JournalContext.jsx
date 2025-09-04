import React, { createContext, useState, useContext, useEffect } from 'react';

const JournalContext = createContext();

export const useJournal = () => {
  const context = useContext(JournalContext);
  if (!context) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
};

export const JournalProvider = ({ children }) => {
  // Load initial state from localStorage or use default data
  const [entries, setEntries] = useState(() => {
    try {
      const savedEntries = localStorage.getItem('journal-entries');
      if (savedEntries) {
        return JSON.parse(savedEntries);
      }
    } catch (error) {
      console.error('Error loading journal entries from localStorage:', error);
    }
    
    // Default entries if nothing in localStorage
    return [];
  });
  
  const [currentPrompt, setCurrentPrompt] = useState(() => {
    try {
      const savedPrompt = localStorage.getItem('journal-current-prompt');
      return savedPrompt ? JSON.parse(savedPrompt) : "What's on your mind today?";
    } catch (error) {
      console.error('Error loading current prompt from localStorage:', error);
      return "What's on your mind today?";
    }
  });
  
  const [insights, setInsights] = useState(() => {
    try {
      const savedInsights = localStorage.getItem('journal-insights');
      if (savedInsights) {
        return JSON.parse(savedInsights);
      }
    } catch (error) {
      console.error('Error loading insights from localStorage:', error);
    }
    
    return {
      weeklyThemes: [],
      sentimentTrend: "stable",
      mostActiveDay: "Today",
      totalEntries: 0
    };
  });

  // Save entries to localStorage whenever entries change
  useEffect(() => {
    try {
      localStorage.setItem('journal-entries', JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving journal entries to localStorage:', error);
    }
  }, [entries]);

  // Save current prompt to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('journal-current-prompt', JSON.stringify(currentPrompt));
    } catch (error) {
      console.error('Error saving current prompt to localStorage:', error);
    }
  }, [currentPrompt]);

  // Save insights to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('journal-insights', JSON.stringify(insights));
    } catch (error) {
      console.error('Error saving insights to localStorage:', error);
    }
  }, [insights]);

  const addEntry = (entry) => {
    const newEntry = {
      ...entry,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      sentiment: analyzeSentiment(entry.content),
      themes: extractThemes(entry.content)
    };
    
    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    generateNextPrompt(newEntry);
    updateInsights(updatedEntries);
  };

  const deleteEntry = (entryId) => {
    const updatedEntries = entries.filter(entry => entry.id !== entryId);
    setEntries(updatedEntries);
    updateInsights(updatedEntries);
  };

  const updateEntry = (entryId, updatedContent) => {
    const updatedEntries = entries.map(entry => {
      if (entry.id === entryId) {
        return {
          ...entry,
          content: updatedContent,
          sentiment: analyzeSentiment(updatedContent),
          themes: extractThemes(updatedContent),
          lastModified: new Date().toISOString()
        };
      }
      return entry;
    });
    
    setEntries(updatedEntries);
    updateInsights(updatedEntries);
  };

  // Clear all data (useful for debugging or reset functionality)
  const clearAllData = () => {
    try {
      localStorage.removeItem('journal-entries');
      localStorage.removeItem('journal-current-prompt');
      localStorage.removeItem('journal-insights');
      
      setEntries([]);
      setCurrentPrompt("What's on your mind today?");
      setInsights({
        weeklyThemes: [],
        sentimentTrend: "stable",
        mostActiveDay: "Today",
        totalEntries: 0
      });
    } catch (error) {
      console.error('Error clearing journal data:', error);
    }
  };

  // Export data (for backup purposes)
  const exportData = () => {
    try {
      const data = {
        entries,
        insights,
        currentPrompt,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `journal-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting journal data:', error);
    }
  };

  const analyzeSentiment = (text) => {
    // Expanded and weighted word lists
    const sentimentWords = {
      // Strong positive words (higher weight)
      strongPositive: {
        words: ['amazing', 'incredible', 'fantastic', 'wonderful', 'excellent', 'outstanding', 'brilliant', 'spectacular', 'magnificent', 'extraordinary', 'thrilled', 'ecstatic', 'overjoyed', 'elated', 'euphoric', 'blissful', 'delighted', 'grateful', 'blessed', 'thankful', 'birthday', 'celebrate', 'celebration', 'special', 'meaningful', 'loved ones', 'family', 'friends'],
        weight: 0.3
      },
      // Moderate positive words
      moderatePositive: {
        words: ['good', 'great', 'nice', 'happy', 'glad', 'pleased', 'content', 'satisfied', 'peaceful', 'calm', 'hopeful', 'optimistic', 'positive', 'cheerful', 'joyful', 'excited', 'energized', 'accomplished', 'proud', 'confident', 'love', 'like', 'enjoy', 'fun', 'success', 'beautiful', 'perfect'],
        weight: 0.2
      },
      // Mild positive words
      mildPositive: {
        words: ['okay', 'fine', 'alright', 'decent', 'fair', 'pleasant', 'comfortable', 'relaxed', 'stable', 'better', 'improving', 'improvement', 'progress'],
        weight: 0.1
      },
      // Mild negative words
      mildNegative: {
        words: ['tired', 'busy', 'concerned', 'worried', 'uncertain', 'confused', 'disappointed', 'bothered', 'annoyed', 'uncomfortable', 'difficult', 'challeng', 'hard', 'tough', 'embarrass'],
        weight: -0.1
      },
      // Moderate negative words
      moderateNegative: {
        words: ['sad', 'upset', 'frustrated', 'angry', 'stressed', 'anxious', 'overwhelmed', 'discouraged', 'lonely', 'hurt', 'bad', 'awful', 'terrible', 'horrible', 'unhappy', 'depress', 'miserable', 'hate', 'dislike', 'pain', 'suffer', 'struggle'],
        weight: -0.2
      },
      // Strong negative words
      strongNegative: {
        words: ['devastated', 'heartbroken', 'hopeless', 'desperate', 'suicidal', 'worthless', 'useless', 'failure', 'disaster', 'nightmare', 'agony', 'torment', 'anguish', 'despair', 'rage', 'fury', 'disgusted', 'repulsed', 'disgust', 'revolt'],
        weight: -0.3
      }
    };

    // Intensifiers that multiply the sentiment
    const intensifiers = {
      high: ['very', 'extremely', 'incredibly', 'absolutely', 'completely', 'totally', 'really', 'so', 'quite', 'truly', 'deeply', 'immensely', 'utterly', 'thoroughly'],
      low: ['somewhat', 'slightly', 'a bit', 'kind of', 'sort of', 'rather', 'fairly', 'pretty', 'moderately']
    };

    // Negation words that flip sentiment
    const negations = ['not', 'no', 'never', 'none', 'nobody', 'nothing', 'neither', 'nowhere', 'hardly', 'scarcely', 'barely', "n't", "don't", "won't", "can't", "shouldn't", "wouldn't", "couldn't", "isn't", "aren't", "wasn't", "weren't"];

    // Contextual phrases that indicate strong sentiment
    const contextualPhrases = {
      positive: [
        ['best', 'day'], ['so', 'happy'], ['really', 'excited'], ['absolutely', 'love'],
        ['incredibly', 'grateful'], ['perfect', 'day'], ['amazing', 'time'],
        ['wonderful', 'experience'], ['great', 'day'], ['special', 'day'],
        ['loved', 'ones'], ['meaningful', 'day'], ['celebrate', 'with']
      ],
      negative: [
        ['worst', 'day'], ['so', 'sad'], ['really', 'upset'], ['absolutely', 'hate'],
        ['completely', 'overwhelmed'], ['terrible', 'day'], ['awful', 'time'], ['i', 'wish'],
        ['horrible', 'experience'], ['why', 'am', 'i'], ['what', 'is', 'wrong'], ['even', 'if'],
        ['feel', 'like', 'dying'], ['want', 'to', 'die'], ['can\'t', 'take', 'it'], ['killing', 'me'],
        ['wrong', 'with', 'me']
      ]
    };

    const words = text.toLowerCase().replace(/[^\w\s']/g, ' ').split(/\s+/).filter(word => word.length > 0);
    let totalScore = 0;
    let sentimentWordCount = 0;

    // Check for contextual phrases first (these carry more weight)
    contextualPhrases.positive.forEach(phrase => {
      const phraseStr = phrase.join(' ');
      if (text.toLowerCase().includes(phraseStr)) {
        totalScore += 0.4;
        sentimentWordCount += 1;
      }
    });

    contextualPhrases.negative.forEach(phrase => {
      const phraseStr = phrase.join(' ');
      if (text.toLowerCase().includes(phraseStr)) {
        totalScore -= 0.4;
        sentimentWordCount += 1;
      }
    });

    // Analyze individual words with context
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let wordScore = 0;
      let isNegated = false;
      let intensifier = 1;

      // Check for negation in the previous 3 words
      for (let j = Math.max(0, i - 3); j < i; j++) {
        if (negations.some(neg => words[j].includes(neg))) {
          isNegated = true;
          break;
        }
      }

      // Check for intensifiers in the previous 2 words
      for (let j = Math.max(0, i - 2); j < i; j++) {
        if (intensifiers.high.includes(words[j])) {
          intensifier = 1.5;
          break;
        } else if (intensifiers.low.includes(words[j])) {
          intensifier = 0.7;
          break;
        }
      }

      // Find sentiment score for this word
      Object.values(sentimentWords).forEach(category => {
        const matchingWord = category.words.find(sentWord => {
          // Exact match or word contains sentiment word
          return word === sentWord || word.includes(sentWord) || sentWord.includes(word);
        });

        if (matchingWord) {
          wordScore = category.weight;
          sentimentWordCount++;
        }
      });

      // Apply modifiers
      if (wordScore !== 0) {
        wordScore *= intensifier;
        if (isNegated) {
          wordScore *= -1;
        }
        totalScore += wordScore;
      }
    }

    // If no sentiment words found, check for emotional punctuation and capitalization
    if (sentimentWordCount === 0) {
      const exclamationCount = (text.match(/!/g) || []).length;
      const questionCount = (text.match(/\?/g) || []).length;
      const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;

      // Multiple exclamation marks often indicate strong emotion
      if (exclamationCount >= 2) {
        totalScore += 0.1;
      }

      // Excessive capitalization might indicate strong emotion
      if (capsRatio > 0.3 && text.length > 10) {
        totalScore += 0.05;
      }
    }

    // Normalize the score based on text length and sentiment word density
    if (sentimentWordCount > 0) {
      // Give more weight to texts with higher sentiment word density
      const density = sentimentWordCount / words.length;
      totalScore *= (1 + density);
    } else {
      // If no clear sentiment words, lean slightly towards neutral-positive for longer texts
      if (words.length > 10 && !text.toLowerCase().includes('why') && !text.toLowerCase().includes('what')) {
        totalScore = 0.05;
      }
    }

    // Apply text length consideration
    if (words.length > 20) {
      totalScore *= 1.1; // Longer texts get slight boost if they have sentiment
    }

    // Ensure score stays within bounds
    const finalScore = Math.max(-1, Math.min(1, totalScore));

    return finalScore;
  };

  const extractThemes = (text) => {
    const themes = [];
    const themeKeywords = {
      'work': ['work', 'job', 'office', 'meeting', 'project', 'boss', 'colleague', 'deadline', 'presentation', 'career'],
      'family': ['family', 'mom', 'dad', 'sister', 'brother', 'parents', 'children', 'kids', 'relatives'],
      'health': ['health', 'exercise', 'sleep', 'tired', 'energy', 'workout', 'fitness', 'medical', 'doctor'],
      'relationships': ['friend', 'relationship', 'partner', 'love', 'dating', 'marriage', 'social', 'connection', 'boyfriend', 'girlfriend'],
      'stress': ['stress', 'anxiety', 'worried', 'overwhelmed', 'pressure', 'tension', 'nervous', 'panic'],
      'gratitude': ['grateful', 'thankful', 'appreciate', 'blessed', 'fortunate', 'lucky', 'abundance'],
      'creativity': ['creative', 'art', 'music', 'writing', 'ideas', 'inspiration', 'imagination', 'design'],
      'personal_growth': ['growth', 'learn', 'reflection', 'insight', 'understand', 'wisdom', 'development'],
      'nature': ['nature', 'outdoor', 'walk', 'trees', 'sky', 'weather', 'garden', 'animals'],
      'goals': ['goal', 'achievement', 'success', 'progress', 'plan', 'future', 'ambition', 'dream']
    };

    const words = text.toLowerCase();
    Object.keys(themeKeywords).forEach(theme => {
      if (themeKeywords[theme].some(keyword => words.includes(keyword))) {
        themes.push(theme);
      }
    });

    return themes.length > 0 ? themes : ['general'];
  };

  const generateNextPrompt = (lastEntry) => {
    const contextualPrompts = {
      'work': [
        "What brought you energy at work today?",
        "How did you find moments of calm during your workday?",
        "What's one thing you learned about yourself through work today?",
        "How did you handle challenges at work today?"
      ],
      'stress': [
        "What helped you feel more grounded today?",
        "How did you show kindness to yourself during stressful moments?",
        "What would you tell a friend facing similar challenges?",
        "What small victory can you celebrate today?"
      ],
      'gratitude': [
        "What small moment brought you joy today?",
        "Who or what are you most grateful for right now?",
        "How did gratitude show up in your day?",
        "What made you smile today?"
      ],
      'creativity': [
        "What inspired you today?",
        "How did you express your creativity, even in small ways?",
        "What new ideas are bubbling up for you?",
        "Where did you find beauty today?"
      ],
      'relationships': [
        "How did you connect with others today?",
        "What did you learn about someone important to you?",
        "How did you show care for the people in your life?",
        "What conversation meant the most to you today?"
      ],
      'personal_growth': [
        "What did you discover about yourself today?",
        "How did you step outside your comfort zone?",
        "What are you becoming more aware of lately?",
        "What pattern are you noticing in your thoughts or behavior?"
      ]
    };

    const defaultPrompts = [
      "How are you feeling right now, and what's behind that feeling?",
      "What's been on your mind lately that you haven't fully explored?",
      "What would you like to let go of today?",
      "What are you most curious about right now?",
      "What deserves your attention today?"
    ];

    const recentThemes = lastEntry.themes;
    if (recentThemes.length > 0 && contextualPrompts[recentThemes[0]]) {
      const themePrompts = contextualPrompts[recentThemes[0]];
      setCurrentPrompt(themePrompts[Math.floor(Math.random() * themePrompts.length)]);
    } else {
      setCurrentPrompt(defaultPrompts[Math.floor(Math.random() * defaultPrompts.length)]);
    }
  };

  const updateInsights = (allEntries) => {
    const recentEntries = allEntries.slice(0, 7); // Last 7 entries
    const themes = recentEntries.flatMap(entry => entry.themes);
    const themeCount = themes.reduce((acc, theme) => {
      acc[theme] = (acc[theme] || 0) + 1;
      return acc;
    }, {});
    
    const sortedThemes = Object.entries(themeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([theme]) => theme);

    const avgSentiment = recentEntries.length > 0 
      ? recentEntries.reduce((sum, entry) => sum + entry.sentiment, 0) / recentEntries.length 
      : 0;
    
    let trend = 'stable';
    if (avgSentiment > 0.01) trend = 'positive';
    if (avgSentiment < -0.01) trend = 'challenging';

    // Calculate most active day (simplified - you could enhance this)
    const dayCount = {};
    allEntries.forEach(entry => {
      const day = new Date(entry.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
      dayCount[day] = (dayCount[day] || 0) + 1;
    });
    
    const mostActiveDay = Object.entries(dayCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Today';

    setInsights({
      weeklyThemes: sortedThemes,
      sentimentTrend: trend,
      mostActiveDay,
      totalEntries: allEntries.length
    });

  };

  const getWeeklyReflection = () => {
    const recentEntries = entries.slice(0, 7);
    if (recentEntries.length === 0) return "Start writing to see your weekly reflection!";

    const themes = recentEntries.flatMap(entry => entry.themes);
    const topTheme = themes.reduce((acc, theme) => {
      acc[theme] = (acc[theme] || 0) + 1;
      return acc;
    }, {});
    
    const mostCommonTheme = Object.entries(topTheme).sort(([,a], [,b]) => b - a)[0];
    const avgSentiment = recentEntries.reduce((sum, entry) => sum + entry.sentiment, 0) / recentEntries.length;
    
    if (!mostCommonTheme) return "Keep writing to build your reflection!";
    
    let reflection = `This week, you've been focusing a lot on ${mostCommonTheme[0].replace('_', ' ')}. `;
    
    if (avgSentiment > 0.2) {
      reflection += "Your entries show a generally positive outlook, with moments of gratitude and growth shining through.";
    } else if (avgSentiment < -0.2) {
      reflection += "It seems like you've been working through some challenges. Remember that difficult periods often lead to the most growth.";
    } else {
      reflection += "You're navigating life with balance, acknowledging both challenges and positive moments.";
    }

    return reflection;
  };

  const value = {
    entries,
    addEntry,
    deleteEntry,
    updateEntry,
    currentPrompt,
    setCurrentPrompt,
    insights,
    getWeeklyReflection,
    analyzeSentiment,
    extractThemes,
    clearAllData,
    exportData
  };

  return (
    <JournalContext.Provider value={value}>
      {children}
    </JournalContext.Provider>
  );
};