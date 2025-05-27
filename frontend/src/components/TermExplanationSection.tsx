import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

interface TermExplanationSectionProps {
  modelName: string;
  apiBaseUrl: string;
  // fileId?: string; // Optional: if we want to link it explicitly to a PDF context later
}

const TermExplanationSection: React.FC<TermExplanationSectionProps> = ({ modelName, apiBaseUrl }) => {
  const [term, setTerm] = useState('');
  const [context, setContext] = useState('');
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!term.trim()) {
      setError('Please enter a term to explain.');
      return;
    }
    if (!modelName.trim()) {
      setError('Please ensure a model is selected or entered.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setExplanation(null);

    const params = new URLSearchParams();
    params.append('term', term.trim());
    params.append('model_name', modelName);
    if (context.trim()) {
      params.append('context', context.trim());
    }

    try {
      const response = await axios.post(`${apiBaseUrl}/explain_term/`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      setExplanation(response.data.explanation);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to get explanation.');
      console.error("Term explanation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="term-input">Term/Phrase to Explain: </label>
          <input
            id="term-input"
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="e.g., Photosynthesis"
            style={{ width: '50%', margin: '5px' }}
            disabled={isLoading}
          />
        </div>
        <div style={{ marginTop: '10px' }}>
          <label htmlFor="context-input">Surrounding Context (optional): </label>
          <textarea
            id="context-input"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Paste a sentence or paragraph containing the term for better context."
            rows={3}
            style={{ width: '90%', margin: '5px', padding: '5px' }}
            disabled={isLoading}
          />
        </div>
        <button type="submit" disabled={isLoading || !term.trim() || !modelName.trim()}>
          {isLoading ? 'Getting Explanation...' : 'Explain Term'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {explanation && (
        <div style={{ marginTop: '15px', padding: '10px', border: '1px solid #ddd' }}>
          <strong>Explanation:</strong>
          <ReactMarkdown>{explanation}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default TermExplanationSection;
