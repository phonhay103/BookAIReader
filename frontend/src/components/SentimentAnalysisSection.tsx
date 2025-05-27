import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

interface SentimentAnalysisSectionProps {
  modelName: string;
  apiBaseUrl: string;
}

const SentimentAnalysisSection: React.FC<SentimentAnalysisSectionProps> = ({ modelName, apiBaseUrl }) => {
  const [textSegment, setTextSegment] = useState('');
  const [sentimentResult, setSentimentResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!textSegment.trim()) {
      setError('Please enter text to analyze.');
      return;
    }
    if (!modelName.trim()) {
      setError('Please ensure a model is selected or entered.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSentimentResult(null);

    const params = new URLSearchParams();
    params.append('text_segment', textSegment.trim());
    params.append('model_name', modelName);

    try {
      const response = await axios.post(`${apiBaseUrl}/analyze_sentiment/`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      setSentimentResult(response.data.sentiment_analysis);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to analyze sentiment.');
      console.error("Sentiment analysis error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="sentiment-text-segment">Text Segment for Sentiment Analysis:</label>
          <textarea
            id="sentiment-text-segment"
            value={textSegment}
            onChange={(e) => setTextSegment(e.target.value)}
            placeholder="Paste text here to analyze its sentiment."
            rows={5}
            style={{ width: '90%', margin: '5px', padding: '5px' }}
            disabled={isLoading}
          />
        </div>
        <button type="submit" disabled={isLoading || !textSegment.trim() || !modelName.trim()}>
          {isLoading ? 'Analyzing...' : 'Analyze Sentiment'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {sentimentResult && (
        <div style={{ marginTop: '15px', padding: '10px', border: '1px solid #ddd' }}>
          <strong>Sentiment Analysis Result:</strong>
          <ReactMarkdown>{sentimentResult}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default SentimentAnalysisSection;
