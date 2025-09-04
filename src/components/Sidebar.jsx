import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, PenTool, BarChart3, Lightbulb, Menu, X } from 'lucide-react';
import '../styles/Sidebar.css';

const Sidebar = ({ activeTab, isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, description: 'Overview & Welcome', path: '/' },
    { id: 'journal', label: 'Write', icon: PenTool, description: 'New Entry', path: '/journal' },
    { id: 'dashboard', label: 'Insights', icon: BarChart3, description: 'Analytics & Trends', path: '/dashboard' },
    { id: 'reflections', label: 'Reflections', icon: Lightbulb, description: 'Past Entries', path: '/reflections' }
  ];

  const handleMenuClick = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button 
        className="mobile-menu-btn"
        onClick={() => setIsOpen(true)}
      >
        <Menu size={24} />
      </button>

      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}
      
      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="logo-section">
            <div className="logo-icon">
              <PenTool size={28} />
            </div>
            <h1 className="logo-title">Mindful Journal</h1>
          </div>
          
          <button 
            className="close-btn"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Navigation</div>
            {menuItems.map(item => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.path)}
                  className={`nav-item ${activeTab === item.id ? 'nav-item-active' : ''}`}
                  title={item.description}
                >
                  <div className="nav-item-icon">
                    <IconComponent size={20} />
                  </div>
                  <div className="nav-item-content">
                    <span className="nav-item-label">{item.label}</span>
                    <span className="nav-item-description">{item.description}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="quote-section">
            <div className="quote-text">
              "Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less"
            </div>
            <div className="quote-author">- Marie Curie</div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;