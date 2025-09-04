import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import { BarChart3, TrendingUp, Calendar, Brain, Heart, Target, Filter } from 'lucide-react';
import SentimentChart from '../components/SentimentChart';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { entries, insights } = useJournal();
  const [timeRange, setTimeRange] = useState('30'); // days
  const [selectedMetric, setSelectedMetric] = useState('sentiment');

  // Filter entries based on time range
  const getFilteredEntries = () => {
    const days = parseInt(timeRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return entries.filter(entry => new Date(entry.date) >= cutoffDate);
  };

  const filteredEntries = getFilteredEntries();

  // Calculate metrics
  const calculateMetrics = () => {
    if (filteredEntries.length === 0) {
      return {
        averageSentiment: 0,
        totalWords: 0,
        entriesCount: 0,
        topThemes: [],
        sentimentTrend: 'stable',
        consistencyScore: 0
      };
    }

    const avgSentiment = filteredEntries.reduce((sum, entry) => sum + entry.sentiment, 0) / filteredEntries.length;
    const totalWords = filteredEntries.reduce((sum, entry) => sum + (entry.wordCount || 0), 0);
    
    // Theme analysis
    const themeCount = {};
    filteredEntries.forEach(entry => {
      entry.themes?.forEach(theme => {
        themeCount[theme] = (themeCount[theme] || 0) + 1;
      });
    });
    
    const topThemes = Object.entries(themeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([theme, count]) => ({ theme, count }));

    // Consistency score (entries per expected days)
    const expectedEntries = parseInt(timeRange);
    const consistencyScore = Math.min(100, Math.round((filteredEntries.length / expectedEntries) * 100));

    return {
      averageSentiment: avgSentiment,
      totalWords,
      entriesCount: filteredEntries.length,
      topThemes,
      sentimentTrend: avgSentiment > 0.2 ? 'positive' : avgSentiment < -0.2 ? 'challenging' : 'stable',
      consistencyScore
    };
  };

  const metrics = calculateMetrics();

  const getSentimentLabel = (sentiment) => {
    if (sentiment > 0.3) return 'Very Positive';
    if (sentiment > 0.1) return 'Positive';
    if (sentiment > -0.1) return 'Neutral';
    if (sentiment > -0.3) return 'Challenging';
    return 'Very Challenging';
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment > 0.2) return '#10b981';
    if (sentiment > 0) return '#f59e0b';
    if (sentiment > -0.2) return '#6b7280';
    return '#ef4444';
  };

  const getThemeColor = (theme) => {
    const colors = {
      'work': '#3b82f6',
      'family': '#10b981',
      'health': '#f59e0b',
      'relationships': '#ec4899',
      'stress': '#ef4444',
      'gratitude': '#8b5cf6',
      'creativity': '#f97316',
      'personal_growth': '#06b6d4',
      'nature': '#22c55e',
      'goals': '#a855f7'
    };
    return colors[theme] || '#6b7280';
  };

  const getInsightMessage = () => {
    const { averageSentiment, topThemes, consistencyScore } = metrics;
    
    if (consistencyScore >= 80) {
      return "🌟 Excellent consistency! Your regular journaling practice is building strong self-awareness.";
    } else if (averageSentiment > 0.3) {
      return "✨ Your recent entries show a positive outlook. You're finding joy and gratitude in your experiences.";
    } else if (topThemes[0]?.theme === 'personal_growth') {
      return "🌱 You're in a phase of growth and self-discovery. Your reflections show deep introspection.";
    } else if (averageSentiment < -0.2) {
      return "💪 You're working through challenges with courage. Remember that difficult periods often lead to growth.";
    }
    
    return "📊 Your journaling patterns show a balanced approach to reflection and self-awareness.";
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Your Insights</h1>
          <p className="dashboard-subtitle">
            Discover patterns and insights from your journaling journey
          </p>
        </div>
        
        <div className="dashboard-controls">
          <div className="filter-group">
            <Filter size={16} />
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="time-filter"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card entries">
          <div className="metric-icon">
            <Calendar size={24} />
          </div>
          <div className="metric-content">
            <h3 className="metric-value">{metrics.entriesCount}</h3>
            <p className="metric-label">Journal Entries</p>
            <p className="metric-detail">
              {Math.round(metrics.entriesCount / (parseInt(timeRange) / 7))} per week average
            </p>
          </div>
        </div>

        <div className="metric-card sentiment">
          <div className="metric-icon">
            <Heart size={24} style={{ color: getSentimentColor(metrics.averageSentiment) }} />
          </div>
          <div className="metric-content">
            <h3 className="metric-value" style={{ color: getSentimentColor(metrics.averageSentiment) }}>
              {getSentimentLabel(metrics.averageSentiment)}
            </h3>
            <p className="metric-label">Overall Sentiment</p>
            <p className="metric-detail">
              Score: {(metrics.averageSentiment * 100).toFixed(0)}%
            </p>
          </div>
        </div>

        <div className="metric-card words">
          <div className="metric-icon">
            <BarChart3 size={24} />
          </div>
          <div className="metric-content">
            <h3 className="metric-value">{metrics.totalWords.toLocaleString()}</h3>
            <p className="metric-label">Words Written</p>
            <p className="metric-detail">
              {Math.round(metrics.totalWords / metrics.entriesCount || 0)} avg per entry
            </p>
          </div>
        </div>

        <div className="metric-card consistency">
          <div className="metric-icon">
            <Target size={24} />
          </div>
          <div className="metric-content">
            <h3 className="metric-value">{metrics.consistencyScore}%</h3>
            <p className="metric-label">Consistency Score</p>
            <div className="consistency-bar">
              <div 
                className="consistency-fill"
                style={{ width: `${metrics.consistencyScore}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <div className="chart-header">
            <h2 className="chart-title">
              <TrendingUp size={20} />
              Sentiment Over Time
            </h2>
            <p className="chart-subtitle">Track your emotional patterns and trends</p>
          </div>
          
          <SentimentChart entries={filteredEntries} />
        </div>
      </div>

      {/* Themes Analysis */}
      <div className="themes-section">
        <div className="section-header">
          <h2 className="section-title">
            <Brain size={20} />
            Top Themes
          </h2>
          <p className="section-subtitle">What you've been reflecting on most</p>
        </div>
        
        <div className="themes-grid">
          {metrics.topThemes.map((themeData, index) => (
            <div key={themeData.theme} className="theme-card">
              <div className="theme-rank">#{index + 1}</div>
              <div 
                className="theme-bar"
                style={{ 
                  backgroundColor: getThemeColor(themeData.theme),
                  width: `${(themeData.count / metrics.topThemes[0]?.count) * 100}%`
                }}
              ></div>
              <div className="theme-content">
                <h3 className="theme-name">
                  {themeData.theme.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h3>
                <p className="theme-count">{themeData.count} entries</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="insights-section">
        <div className="insights-card">
          <div className="insights-header">
            <div className="insights-icon">
              <Brain size={24} />
            </div>
            <h3 className="insights-title">AI Insights</h3>
          </div>
          
          <div className="insights-content">
            <p className="insight-message">{getInsightMessage()}</p>
            
            <div className="insight-details">
              <div className="insight-item">
                <strong>Most Active Theme:</strong> {metrics.topThemes[0]?.theme.replace(/_/g, ' ') || 'N/A'}
              </div>
              <div className="insight-item">
                <strong>Writing Frequency:</strong> {
                  metrics.consistencyScore >= 80 ? 'Very Consistent' :
                  metrics.consistencyScore >= 60 ? 'Consistent' :
                  metrics.consistencyScore >= 40 ? 'Moderate' : 'Inconsistent'
                }
              </div>
              <div className="insight-item">
                <strong>Emotional Pattern:</strong> {
                  metrics.sentimentTrend === 'positive' ? 'Generally Positive' :
                  metrics.sentimentTrend === 'challenging' ? 'Working Through Challenges' :
                  'Emotionally Balanced'
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;