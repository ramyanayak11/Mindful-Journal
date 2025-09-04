import React, { useState, useEffect , useRef } from 'react';
import { Calendar, Clock, Smile, Meh, Frown, Tag, X } from 'lucide-react';
import '../styles/EntryCard.css';

const EntryCard = ({ entry }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef(0);

  const getSentimentIcon = (sentiment) => {
    if (sentiment > 0.01) return <Smile className="sentiment-positive" size={18} />;
    if (sentiment < -0.01) return <Frown className="sentiment-negative" size={18} />;
    return <Meh className="sentiment-neutral" size={18} />;
  };

  const getSentimentLabel = (sentiment) => {
    if (sentiment > 0.01) return 'Positive';
    if (sentiment < -0.01) return 'Challenging';
    return 'Neutral';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getPreviewText = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  const getThemeColor = (theme) => {
    const themeColors = {
      'work': '#3b82f6',
      'family': '#10b981',
      'health': '#f59e0b',
      'relationships': '#ec4899',
      'stress': '#ef4444',
      'gratitude': '#8b5cf6',
      'creativity': '#f97316',
      'personal_growth': '#06b6d4',
      'nature': '#22c55e',
      'goals': '#a855f7',
      'general': '#6b7280'
    };
    return themeColors[theme] || themeColors['general'];
  };

  const getThemeLabel = (theme) => {
    const themeLabels = {
      'work': 'Work',
      'family': 'Family',
      'health': 'Health',
      'relationships': 'Relationships',
      'stress': 'Stress',
      'gratitude': 'Gratitude',
      'creativity': 'Creativity',
      'personal_growth': 'Growth',
      'nature': 'Nature',
      'goals': 'Goals',
      'general': 'General'
    };
    return themeLabels[theme] || theme;
  };

  const handleCardClick = () => {
    setIsExpanded(true);
  };

  const handleCloseExpanded = (e) => {
    e.stopPropagation();
    setIsExpanded(false);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsExpanded(false);
    }
  };

  // Handle escape key and preserve scroll position
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsExpanded(false);
      }
    };

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isExpanded]);

  if (isExpanded) {
    return (
      <div className="entry-modal-backdrop" onClick={handleBackdropClick}>
        <div className="entry-card entry-expanded">
          

          {/* Header */}
          <div className="entry-header">
            <div className="entry-meta">
              <div className="meta-item">
                <Calendar size={14} />
                <span className="meta-text">{formatDate(entry.date)}</span>
              </div>
              
              <div className="meta-item">
                <Clock size={14} />
                <span className="meta-text">{formatTime(entry.timestamp)}</span>
              </div>
            </div>

            <div className="sentiment-indicator">
              {getSentimentIcon(entry.sentiment)}
              <span className="sentiment-label">
                {getSentimentLabel(entry.sentiment)}
              </span>
            </div>
          </div>

          {/* AI Prompt */}
          {entry.aiPrompt && (
            <div className="entry-prompt">
              <div className="prompt-icon">✨</div>
              <div className="prompt-text">"{entry.aiPrompt}"</div>
            </div>
          )}

          {/* Full Content */}
          <div className="entry-content entry-content-expanded">
            <p>{entry.content}</p>
          </div>

          {/* Footer */}
          <div className="entry-footer">
            <div className="themes-section">
              {entry.themes && entry.themes.length > 0 && (
                <div className="themes-list">
                  <Tag size={14} />
                  {entry.themes.map(theme => (
                    <span 
                      key={theme}
                      className="theme-tag"
                      style={{ backgroundColor: getThemeColor(theme) }}
                    >
                      {getThemeLabel(theme)}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="entry-stats">
              {entry.wordCount && (
                <span className="word-count">{entry.wordCount} words</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="entry-card" onClick={handleCardClick}>
      {/* Header */}
      <div className="entry-header">
        <div className="entry-meta">
          <div className="meta-item">
            <Calendar size={14} />
            <span className="meta-text">{formatDate(entry.date)}</span>
          </div>
          
          <div className="meta-item">
            <Clock size={14} />
            <span className="meta-text">{formatTime(entry.timestamp)}</span>
          </div>
        </div>

        <div className="sentiment-indicator">
          {getSentimentIcon(entry.sentiment)}
          <span className="sentiment-label">
            {getSentimentLabel(entry.sentiment)}
          </span>
        </div>
      </div>

      {/* AI Prompt */}
      {entry.aiPrompt && (
        <div className="entry-prompt">
          <div className="prompt-icon">✨</div>
          <div className="prompt-text">"{entry.aiPrompt}"</div>
        </div>
      )}

      {/* Content Preview */}
      <div className="entry-content">
        <p>{getPreviewText(entry.content)}</p>
      </div>

      {/* Footer */}
      <div className="entry-footer">
        <div className="themes-section">
          {entry.themes && entry.themes.length > 0 && (
            <div className="themes-list">
              <Tag size={14} />
              {entry.themes.slice(0, 3).map(theme => (
                <span 
                  key={theme}
                  className="theme-tag"
                  style={{ backgroundColor: getThemeColor(theme) }}
                >
                  {getThemeLabel(theme)}
                </span>
              ))}
              {entry.themes.length > 3 && (
                <span className="theme-count">+{entry.themes.length - 3}</span>
              )}
            </div>
          )}
        </div>

        <div className="entry-stats">
          {entry.wordCount && (
            <span className="word-count">{entry.wordCount} words</span>
          )}
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="entry-overlay">
        <div className="overlay-content">
          <p>Click to read full entry</p>
        </div>
      </div>
    </div>
  );
};

export default EntryCard;