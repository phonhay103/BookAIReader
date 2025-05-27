import React, { useState } from 'react';
import axios from 'axios';
import './ChatSection.css';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'model';
}

interface ChatSectionProps {
  fileId: string;
  modelName: string; // Will come from App's state
  apiBaseUrl: string;
}

const ChatSection: React.FC<ChatSectionProps> = ({ fileId, modelName, apiBaseUrl }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestions = [
    "Summarize the key points of this document.",
    "What is the main conclusion?",
    "Explain [a concept from the PDF] in simple terms."
  ];

  const handleSuggestionClick = (suggestionText: string) => {
    setQuery(suggestionText);
  };

  const handleSubmitQuery = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim()) {
      setError('Please enter a message.');
      return;
    }
    if (!modelName.trim()) {
      setError('Please ensure a model is selected or entered.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const userMessage: ChatMessage = { id: Date.now().toString(), text: query, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, userMessage]);

    const params = new URLSearchParams();
    params.append('file_id', fileId);
    params.append('query', query);
    params.append('model_name', modelName);

    try {
      const response = await axios.post(`${apiBaseUrl}/qa/`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const modelMessage: ChatMessage = { id: Date.now().toString(), text: response.data.answer, sender: 'model' };
      setMessages(prevMessages => [...prevMessages, modelMessage]);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to get answer.');
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
      setQuery(''); // Clear input field
    }
  };

  return (
    <div className="chat-section-container">
      <div className="chat-history">
        {messages.map(msg => (
          <div key={msg.id} className={`message-wrapper ${msg.sender === 'user' ? 'user-message-wrapper' : 'model-message-wrapper'}`}>
            <p className={`message-bubble ${msg.sender === 'user' ? 'user-message' : 'model-message'}`}>
              {msg.text}
            </p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmitQuery} className="chat-input-form">
        <label htmlFor={`query-${fileId}`}>Your Message:</label>
        <input
          id={`query-${fileId}`}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type your message here or click a suggestion"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={isLoading || !query.trim() || !modelName.trim()}
        >
          {isLoading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
      <div className="suggestions-area">
        <p>Suggestions:</p>
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(suggestion)}
            disabled={isLoading}
            className="suggestion-button"
          >
            {suggestion}
          </button>
        ))}
        {suggestions.find(s => s.includes('[')) && (
            <p className="suggestion-note">
                * Remember to replace bracketed placeholders like "[a concept from the PDF]" with specific terms from the document.
            </p>
        )}
      </div>
      {error && <p className="chat-error">Error: {error}</p>}
    </div>
  );
};

export default ChatSection;
