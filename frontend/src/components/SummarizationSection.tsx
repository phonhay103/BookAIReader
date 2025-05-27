import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

interface SummarizationSectionProps {
  fileId: string;
  modelName: string;
  apiBaseUrl: string;
}

const summaryLengthOptions = ["Short", "Medium", "Long", "Comprehensive"];

const SummarizationSection: React.FC<SummarizationSectionProps> = ({ fileId, modelName, apiBaseUrl }) => {
  const [summaryLength, setSummaryLength] = useState<string>(summaryLengthOptions[1]); // Default to Medium
  const [keywords, setKeywords] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!modelName.trim()) {
      setError('Please ensure a model is selected or entered.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSummary(null);

    const params = new URLSearchParams();
    params.append('file_id', fileId);
    params.append('model_name', modelName);
    params.append('summary_length', summaryLength);
    if (keywords.trim()) {
      params.append('keywords', keywords.trim());
    }

    try {
      const response = await axios.post(`${apiBaseUrl}/summarize/`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      setSummary(response.data.summary);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate summary.');
      console.error("Summarization error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor={`summary-length-${fileId}`}>Summary Length: </label>
          <select
            id={`summary-length-${fileId}`}
            value={summaryLength}
            onChange={(e) => setSummaryLength(e.target.value)}
            disabled={isLoading}
          >
            {summaryLengthOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div style={{ marginTop: '10px' }}>
          <label htmlFor={`keywords-${fileId}`}>Keywords (optional, comma-separated): </label>
          <input
            id={`keywords-${fileId}`}
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g., technology, finance"
            style={{ width: '50%', margin: '5px' }}
            disabled={isLoading}
          />
        </div>
        <button type="submit" disabled={isLoading || !modelName.trim()}>
          {isLoading ? 'Generating Summary...' : 'Generate Summary'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {summary && (
        <div style={{ marginTop: '15px', padding: '10px', border: '1px solid #ddd', whiteSpace: 'pre-wrap' }}>
          <strong>Summary:</strong>
          <ReactMarkdown>{summary}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default SummarizationSection;
