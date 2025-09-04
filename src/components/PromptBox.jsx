import React, { useState } from 'react';
import { RefreshCw, Sparkles, Lightbulb } from 'lucide-react';
import '../styles/PromptBox.css';

const PromptBox = ({ currentPrompt, onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Add a small delay for better UX
    setTimeout(() => {
      onRefresh();
      setIsRefreshing(false);
    }, 500);
  };

  return (
    <div className="prompt-box">
      <div className="prompt-header">
        <div className="prompt-title">
          <Lightbulb className="prompt-title-icon" size={20} />
          <h3>Today's Reflection Prompt</h3>
        </div>
        
        <button 
          className={`refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
          onClick={handleRefresh}
          disabled={isRefreshing}
          title="Get a new prompt"
        >
          <RefreshCw 
            size={16} 
            className={isRefreshing ? 'spin' : ''}
          />
          <span>New Prompt</span>
        </button>
      </div>

      <div className="prompt-content">
        <div className="prompt-decoration">
          <Sparkles className="decoration-icon top-left" size={16} />
          <Sparkles className="decoration-icon top-right" size={16} />
          <Sparkles className="decoration-icon bottom-left" size={16} />
          <Sparkles className="decoration-icon bottom-right" size={16} />
        </div>
        
        <blockquote className="prompt-question">
          {currentPrompt}
        </blockquote>
        
        <div className="prompt-subtitle">
          Take a moment to reflect on this question before you begin writing
        </div>
      </div>

      <div className="prompt-suggestions">
        <div className="suggestion-title">Writing approach suggestions:</div>
        <div className="suggestions-list">
          <span className="suggestion-item">✍️ Stream of consciousness</span>
          <span className="suggestion-item">🎯 Structured reflection</span>
          <span className="suggestion-item">📝 List format</span>
          <span className="suggestion-item">💭 Free association</span>
        </div>
      </div>
    </div>
  );
};

export default PromptBox;