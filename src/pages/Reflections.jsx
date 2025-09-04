import React, { useState, useMemo } from 'react';
import { useJournal } from '../context/JournalContext';
import { Search, Filter, Calendar, SortDesc, Book, Lightbulb, Sparkles } from 'lucide-react';
import EntryCard from '../components/EntryCard';
import '../styles/Reflections.css';

const Reflections = () => {
  const { entries, getWeeklyReflection } = useJournal();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');

  // Get all unique themes for filter
  const allThemes = useMemo(() => {
    const themes = new Set();
    entries.forEach(entry => {
      entry.themes?.forEach(theme => themes.add(theme));
    });
    return Array.from(themes).sort();
  }, [entries]);

  // Filter and sort entries
  const filteredEntries = useMemo(() => {
    let filtered = [...entries];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.content.toLowerCase().includes(query) ||
        entry.themes?.some(theme => theme.toLowerCase().includes(query)) ||
        entry.aiPrompt?.toLowerCase().includes(query)
      );
    }

    // Theme filter
    if (selectedTheme !== 'all') {
      filtered = filtered.filter(entry =>
        entry.themes?.includes(selectedTheme)
      );
    }

    // Time range filter
    if (selectedTimeRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (selectedTimeRange) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      filtered = filtered.filter(entry => new Date(entry.date) >= cutoffDate);
    }

    // Sort entries
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date) - new Date(a.date);
        case 'sentiment':
          return b.sentiment - a.sentiment;
        case 'length':
          return (b.wordCount || 0) - (a.wordCount || 0);
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

    return filtered;
  }, [entries, searchQuery, selectedTheme, selectedTimeRange, sortBy]);

  const getThemeLabel = (theme) => {
    return theme.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const weeklyReflection = getWeeklyReflection();

  return (
    <div className="reflections-container">
      {/* Header */}
      <div className="reflections-header">
        <div className="header-content">
          <h1 className="reflections-title">Your Reflections</h1>
          <p className="reflections-subtitle">
            Explore your journal entries and discover patterns in your thoughts
          </p>
        </div>

        <div className="header-stats">
          <div className="stat-badge">
            <Book size={16} />
            <span>{entries.length} Total Entries</span>
          </div>
          <div className="stat-badge">
            <Calendar size={16} />
            <span>{filteredEntries.length} Showing</span>
          </div>
        </div>
      </div>

      {/* Weekly Reflection Card */}
      {weeklyReflection && (
        <div className="weekly-reflection-card">
          <div className="reflection-header">
            <div className="reflection-icon">
              <Lightbulb size={20} />
            </div>
            <h3>Weekly Insight</h3>
          </div>
          <div className="reflection-content">
            <p>{weeklyReflection}</p>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search entries, themes, or prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <Filter size={16} />
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Themes</option>
              {allThemes.map(theme => (
                <option key={theme} value={theme}>
                  {getThemeLabel(theme)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <Calendar size={16} />
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Time</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="quarter">Past 3 Months</option>
            </select>
          </div>

          <div className="filter-group">
            <SortDesc size={16} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="date">Sort by Date</option>
              <option value="sentiment">Sort by Sentiment</option>
              <option value="length">Sort by Length</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {(searchQuery || selectedTheme !== 'all' || selectedTimeRange !== 'all') && (
        <div className="results-summary">
          <div className="summary-text">
            <Sparkles size={16} />
            <span>
              Found {filteredEntries.length} entries
              {searchQuery && ` containing "${searchQuery}"`}
              {selectedTheme !== 'all' && ` in ${getThemeLabel(selectedTheme)}`}
              {selectedTimeRange !== 'all' && ` from the past ${selectedTimeRange}`}
            </span>
          </div>
          
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTheme('all');
              setSelectedTimeRange('all');
            }}
            className="clear-filters-btn"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Entries Grid */}
      <div className="entries-section">
        {filteredEntries.length > 0 ? (
          <div className="entries-grid">
            {filteredEntries.map(entry => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No entries found</h3>
            <p>
              {searchQuery || selectedTheme !== 'all' || selectedTimeRange !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'Start journaling to see your entries here!'}
            </p>
            {(searchQuery || selectedTheme !== 'all' || selectedTimeRange !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTheme('all');
                  setSelectedTimeRange('all');
                }}
                className="btn btn-primary"
              >
                Show All Entries
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination hint for future */}
      {filteredEntries.length > 12 && (
        <div className="pagination-hint">
          <p>Showing all {filteredEntries.length} entries</p>
        </div>
      )}
    </div>
  );
};

export default Reflections;