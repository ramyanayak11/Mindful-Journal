import React, { useState, useRef, useEffect } from 'react';
import { useJournal } from '../context/JournalContext';
import { Save, Sparkles, RefreshCw, Clock, CheckCircle, Heart } from 'lucide-react';
import PromptBox from '../components/PromptBox';
import '../styles/Journal.css';

const Journal = () => {
  const { currentPrompt, addEntry, setCurrentPrompt } = useJournal();
  const [content, setContent] = useState('');
  const [isWriting, setIsWriting] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [timeStarted, setTimeStarted] = useState(null);
  const [writingTime, setWritingTime] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);
  const textareaRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);

    if (content.length > 0 && !isWriting) {
      setIsWriting(true);
      setTimeStarted(Date.now());
    } else if (content.length === 0 && isWriting) {
      setIsWriting(false);
      setTimeStarted(null);
      setWritingTime(0);
    }
  }, [content, isWriting]);

  useEffect(() => {
    if (isWriting && timeStarted) {
      intervalRef.current = setInterval(() => {
        setWritingTime(Math.floor((Date.now() - timeStarted) / 1000));
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isWriting, timeStarted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (content.trim()) {
      setShowSaveAnimation(true);
      
      // Simulate a brief save delay for better UX
      setTimeout(() => {
        addEntry({ 
          content: content.trim(), 
          aiPrompt: currentPrompt,
          writingTime: writingTime,
          wordCount: wordCount
        });
        
        setContent('');
        setIsWriting(false);
        setTimeStarted(null);
        setWritingTime(0);
        setIsSaved(true);
        setShowSaveAnimation(false);
        
        // Reset saved state after 3 seconds
        setTimeout(() => setIsSaved(false), 3000);
        
        // Focus back on textarea
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 800);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getEncouragementMessage = () => {
    if (wordCount === 0) {
      return "Start with whatever comes to mind. There's no right or wrong way to begin.";
    } else if (wordCount < 50) {
      return "Great start! Let your thoughts flow naturally.";
    } else if (wordCount < 150) {
      return "You're in the flow! Keep exploring your thoughts.";
    } else {
      return "Wonderful depth in your reflection. You're really diving deep.";
    }
  };

  const getMoodBasedPlaceholder = () => {
    const placeholders = [
      "What's flowing through your mind right now?",
      "How are you feeling in this moment?",
      "What deserves your attention today?",
      "Let your authentic self speak...",
      "What story wants to be told today?",
      "Express whatever feels true for you..."
    ];
    return placeholders[Math.floor(Math.random() * placeholders.length)];
  };

  return (
    <div className="journal-container">
      {/* Header Section */}
      <div className="journal-header">
        <div className="header-content">
          <h1 className="journal-title">Your Journal</h1>
          <p className="journal-subtitle">
            A safe space for your thoughts, feelings, and reflections
          </p>
        </div>
        
        <div className="writing-stats">
          {isWriting && (
            <div className="stat-item">
              <Clock size={16} />
              <span>Writing for {formatTime(writingTime)}</span>
            </div>
          )}
          
          <div className="stat-item">
            <Heart size={16} />
            <span>{wordCount} words</span>
          </div>
          
          {isSaved && (
            <div className="stat-item saved-indicator">
              <CheckCircle size={16} />
              <span>Entry saved!</span>
            </div>
          )}
        </div>
      </div>

      {/* Prompt Section */}
      <PromptBox 
        currentPrompt={currentPrompt}
        onRefresh={() => {
          // Generate a new prompt (this would typically call a function to get a new prompt)
          const newPrompts = [
            "What's bringing you peace today?",
            "How did you grow today, even in small ways?",
            "What are you most curious about right now?",
            "What would you like to release or let go of?",
            "How did you show kindness to yourself today?"
          ];
          setCurrentPrompt(newPrompts[Math.floor(Math.random() * newPrompts.length)]);
        }}
      />

      {/* Writing Area */}
      <div className="writing-section">
        <form onSubmit={handleSubmit} className="writing-form">
          <div className="textarea-container">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={getMoodBasedPlaceholder()}
              className="writing-textarea"
              autoFocus
            />
            
            {content.length === 0 && (
              <div className="writing-overlay">
                <div className="overlay-content">
                  <Sparkles className="overlay-icon" size={32} />
                  <p>Start writing and watch your thoughts come to life</p>
                </div>
              </div>
            )}
          </div>

          {/* Writing Tools */}
          <div className="writing-tools">
            <div className="left-tools">
              <div className="encouragement-message">
                <span className="encouragement-text">
                  {getEncouragementMessage()}
                </span>
              </div>
            </div>

            <div className="right-tools">
              <button
                type="submit"
                disabled={!content.trim() || showSaveAnimation}
                className={`save-btn ${showSaveAnimation ? 'saving' : ''}`}
              >
                {showSaveAnimation ? (
                  <>
                    <RefreshCw className="spin" size={18} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Entry
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Writing Tips */}
        <div className="writing-tips">
          <h3 className="tips-title">Writing Tips</h3>
          <div className="tips-grid">
            <div className="tip-item">
              <div className="tip-icon">🎯</div>
              <div className="tip-content">
                <h4>Be Authentic</h4>
                <p>Write honestly about your experiences and feelings</p>
              </div>
            </div>
            
            <div className="tip-item">
              <div className="tip-icon">🌊</div>
              <div className="tip-content">
                <h4>Let It Flow</h4>
                <p>Don't worry about perfect grammar or structure</p>
              </div>
            </div>
            
            <div className="tip-item">
              <div className="tip-icon">🔍</div>
              <div className="tip-content">
                <h4>Dig Deeper</h4>
                <p>Ask yourself "why" and explore your emotions</p>
              </div>
            </div>
            
            <div className="tip-item">
              <div className="tip-icon">⏰</div>
              <div className="tip-content">
                <h4>No Rush</h4>
                <p>Take your time - there's no deadline for reflection</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Animation Overlay */}
      {showSaveAnimation && (
        <div className="save-animation-overlay">
          <div className="save-animation">
            <CheckCircle size={48} />
            <p>Saving your thoughts...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Journal;