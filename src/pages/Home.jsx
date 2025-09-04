import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useJournal } from '../context/JournalContext';
import { Calendar, TrendingUp, Brain, PenTool, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import EntryCard from '../components/EntryCard';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { entries, insights, currentPrompt } = useJournal();
  const recentEntries = entries.slice(0, 3);
  const hasEntries = entries.length > 0;
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening'; 
  };

  const getMotivationalMessage = () => {
    if (!hasEntries) {
      return "Welcome to your personal journaling space. Ready to begin your reflection journey?";
    }
    
    const messages = [
      "Your thoughts matter. Your story matters.",
      "Every entry is a step toward self-understanding.",
      "Reflection is the beginning of wisdom.",
      "You're building a beautiful record of your journey.",
      "Small moments of mindfulness create big changes."
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            {getGreeting()}, Ramya
          </h1>
          <p className="hero-subtitle">
            {getMotivationalMessage()}
          </p>
          
          <div className="quick-actions">
            <button 
              className="btn btn-primary quick-action-btn"
              onClick={() => navigate('/journal')}
            >
              <PenTool size={20} />
              {hasEntries ? 'Continue Writing' : 'Start Your First Entry'}
              <ArrowRight size={16} />
            </button>
            
            {hasEntries && (
              <button 
                className="btn btn-secondary quick-action-btn"
                onClick={() => navigate('/dashboard')}
              >
                <TrendingUp size={20} />
                View Insights
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon calendar">
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{insights.totalEntries}</h3>
              <p className="stat-label">Total Entries</p>
              <p className="stat-detail">
                {insights.totalEntries === 0 
                  ? "Ready to start your journey!" 
                  : "Keep the momentum going!"
                }
              </p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon trend">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{entries.length}</h3>
              <p className="stat-label">This Month</p>
              <p className="stat-detail">
                {entries.length === 0 
                  ? "Your first entry awaits!"
                  : entries.length >= 15 
                  ? 'Excellent consistency!' 
                  : 'You\'re doing great!'
                }
              </p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon brain">
              <Brain size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{insights.weeklyThemes.length}</h3>
              <p className="stat-label">Key Themes</p>
              <p className="stat-detail">
                {insights.weeklyThemes.length === 0
                  ? "Discover your patterns"
                  : `Focus on ${insights.weeklyThemes[0] || 'growth'}`
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Today's Prompt Section */}
      <section className="prompt-section">
        <div className="section-header">
          <h2 className="section-title">Today's Reflection</h2>
          <p className="section-subtitle">A thoughtful question to guide your writing</p>
        </div>
        
        <div className="prompt-card">
          <div className="prompt-content">
            <div className="prompt-question">
              <Sparkles className="prompt-sparkle" size={24} />
              <blockquote>"{currentPrompt}"</blockquote>
            </div>
            
            <div className="prompt-actions">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/journal')}
              >
                {hasEntries ? 'Reflect on this' : 'Start Writing'}
              </button>
              <p className="prompt-hint">
                {hasEntries 
                  ? "Take a few minutes to explore this question deeply"
                  : "Begin your journaling journey with this inspiring prompt"
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Entries or Empty State */}
      {hasEntries ? (
        <section className="recent-section">
          <div className="section-header">
            <h2 className="section-title">Recent Reflections</h2>
            <p className="section-subtitle">Your latest thoughts and insights</p>
          </div>
          
          <div className="entries-grid">
            {recentEntries.map(entry => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
          
          <div className="view-all-section">
            <button 
              className="btn btn-secondary view-all-btn"
              onClick={() => navigate('/reflections')}
            >
              View All Entries
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
      ) : (
        <section className="empty-state-section">
          <div className="empty-state-card">
            <div className="empty-state-icon">
              <BookOpen size={36} />
            </div>
            <h3 className="empty-state-title">Your Story Begins Here</h3>
            <p className="empty-state-description">
              Start your first journal entry to begin tracking your thoughts, emotions, 
              and personal growth. Every journey starts with a single step.
            </p>
            <div className="empty-state-features">
              <div className="feature-item">
                <span className="feature-emoji">✨</span>
                <span>AI-powered writing prompts</span>
              </div>
              <div className="feature-item">
                <span className="feature-emoji">📊</span>
                <span>Mood and theme tracking</span>
              </div>
              <div className="feature-item">
                <span className="feature-emoji">🧠</span>
                <span>Personal insights and growth</span>
              </div>
            </div>
            <button 
              className="btn btn-primary empty-state-btn"
              onClick={() => navigate('/journal')}
            >
              <PenTool size={20} />
              Write Your First Entry
            </button>
          </div>
        </section>
      )}

      {/* Insights Preview - Only show if there are entries */}
      {hasEntries && (
        <section className="insights-preview">
          <div className="insights-card">
            <div className="insights-header">
              <Brain size={24} />
              <h3>Recent Insights</h3>
            </div>
            
            <div className="insights-content">
              <p className="insight-text">
                {insights.weeklyThemes.length > 0 ? (
                  <>
                    Your recent entries show a focus on{' '}
                    <strong>{insights.weeklyThemes.slice(0, 2).join(' and ')}</strong>.
                    {insights.sentimentTrend === 'positive' && 
                      " You're maintaining a positive outlook! ✨"
                    }
                    {insights.sentimentTrend === 'challenging' && 
                      " You're working through some challenges with courage. 💪"
                    }
                    {insights.sentimentTrend === 'stable' && 
                      " You're finding balance in your reflections. 🌟"
                    }
                  </>
                ) : (
                  "Write a few more entries to see personalized insights about your journey."
                )}
              </p>
              
              <button 
                className="btn btn-secondary insights-btn"
                onClick={() => navigate('/dashboard')}
              >
                Explore Deeper Insights
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;