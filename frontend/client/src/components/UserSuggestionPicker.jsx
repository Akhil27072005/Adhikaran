import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const UserSuggestionPicker = ({ 
  selectedUsers = [], 
  onUsersChange, 
  placeholder = "Search users...",
  maxSelections = 10 
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState('');
  
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        searchUsers(query.trim());
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const searchUsers = async (searchQuery) => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/users/search?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Filter out already selected users
      const filteredSuggestions = response.data.users.filter(
        user => !selectedUsers.some(selected => selected._id === user._id)
      );
      
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } catch (err) {
      console.error('User search error:', err);
      setError('Failed to search users');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user) => {
    if (selectedUsers.length >= maxSelections) {
      setError(`Maximum ${maxSelections} witnesses allowed`);
      return;
    }
    
    const newSelectedUsers = [...selectedUsers, user];
    onUsersChange(newSelectedUsers);
    setQuery('');
    setShowSuggestions(false);
    setError('');
  };

  const handleUserRemove = (userId) => {
    const newSelectedUsers = selectedUsers.filter(user => user._id !== userId);
    onUsersChange(newSelectedUsers);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      setQuery('');
    }
  };

  return (
    <div className="user-picker">
      <div className="user-picker-input-container">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="user-picker-input"
        />
        {loading && (
          <div className="user-picker-loading">
            Searching...
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="user-picker-suggestions"
        >
          {suggestions.map((user) => (
            <div
              key={user._id}
              className="user-picker-suggestion"
              onClick={() => handleUserSelect(user)}
            >
              <div className="user-picker-suggestion-name">
                {user.fullName}
              </div>
              <div className="user-picker-suggestion-email">
                {user.email}
              </div>
              {user.city && (
                <div className="user-picker-suggestion-city">
                  {user.city}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedUsers.length > 0 && (
        <div className="user-picker-selected">
          <div className="user-picker-selected-label">
            Selected Witnesses ({selectedUsers.length}):
          </div>
          {selectedUsers.map((user) => (
            <div key={user._id} className="user-picker-tag">
              <span className="user-picker-tag-name">
                {user.fullName}
              </span>
              <button
                type="button"
                onClick={() => handleUserRemove(user._id)}
                className="user-picker-tag-remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="user-picker-error">
          {error}
        </div>
      )}
    </div>
  );
};

export default UserSuggestionPicker;
