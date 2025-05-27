import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

interface MisinformationDetectionSectionProps {
  modelName: string;
  apiBaseUrl: string;
}

const MisinformationDetectionSection: React.FC<MisinformationDetectionSectionProps> = ({ modelName, apiBaseUrl }) => {
  const [textSegment, setTextSegment] = useState('');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
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
    setAnalysisResult(null);

    const params = new URLSearchParams();
    params.append('text_segment', textSegment.trim());
    params.append('model_name', modelName);

    try {
      const response = await axios.post(`${apiBaseUrl}/detect_misinformation/`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      setAnalysisResult(response.data.misinformation_analysis);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to analyze for misinformation.');
      console.error("Misinformation detection error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="misinfo-text-segment">Text Segment to Analyze:</label>
          <textarea
            id="misinfo-text-segment"
            value={textSegment}
            onChange={(e) => setTextSegment(e.target.value)}
            placeholder="Paste text here to check for potential misinformation."
            rows={5}
            style={{ width: '90%', margin: '5px', padding: '5px' }}
            disabled={isLoading}
          />
        </div>
        <p>
          <small>This feature is experimental. Always verify critical information from multiple reputable sources.</small>
        </p>
        <button type="submit" disabled={isLoading || !textSegment.trim() || !modelName.trim()}>
          {isLoading ? 'Analyzing...' : 'Analyze for Potential Misinformation'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {analysisResult && (
        <div style={{ marginTop: '15px', padding: '10px', border: '1px solid #ddd' }}>
          <strong>Analysis Result:</strong>
          <ReactMarkdown>{analysisResult}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default MisinformationDetectionSection;
