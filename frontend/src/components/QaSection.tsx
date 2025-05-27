import React, { useState } from 'react';
import axios from 'axios';

interface QaSectionProps {
  fileId: string;
  modelName: string; // Will come from App's state
  apiBaseUrl: string;
}

const QaSection: React.FC<QaSectionProps> = ({ fileId, modelName, apiBaseUrl }) => {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitQuery = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim()) {
      setError('Please enter a question.');
      return;
    }
    if (!modelName.trim()) {
      setError('Please ensure a model is selected or entered.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnswer(null);

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
      setAnswer(response.data.answer);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to get answer.');
      console.error("Q&A error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmitQuery}>
        <div>
          <label htmlFor={`query-${fileId}`}>Your Question:</label>
          <input
            id={`query-${fileId}`}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask something about the PDF"
            style={{ width: '70%', margin: '5px' }}
            disabled={isLoading}
          />
        </div>
        <button type="submit" disabled={isLoading || !query.trim() || !modelName.trim()}>
          {isLoading ? 'Getting Answer...' : 'Submit Question'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {answer && (
        <div style={{ marginTop: '15px', padding: '10px', border: '1px solid #ddd' }}>
          <strong>Answer:</strong>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

export default QaSection;
