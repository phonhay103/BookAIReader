import React, { useState } from 'react';
import './App.css';
import PdfUploader from './components/PdfUploader';
import QaSection from './components/QaSection';
import SummarizationSection from './components/SummarizationSection';
import TermExplanationSection from './components/TermExplanationSection';
import MisinformationDetectionSection from './components/MisinformationDetectionSection';
import SentimentAnalysisSection from './components/SentimentAnalysisSection'; // Import SentimentAnalysisSection

const API_BASE_URL = 'http://localhost:8000'; // Consider moving to .env file

function App() {
  const [fileId, setFileId] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('gemini/gemini-2.0-flash'); // Default model

  const handlePdfUploadSuccess = (newFileId: string, fileName: string) => {
    setFileId(newFileId);
    setUploadedFileName(fileName);
  };

  // TODO: Implement a proper model selector dropdown based on models_config.json or a hardcoded list
  const availableModels = [ // Example models - replace with actual list later
    "gemini/gemini-2.0-flash",
    "gemini/gemini-2.0-flash-thinking-exp-01-21",
    // Add other models your backend/LiteLLM supports
  ];


  return (
    <div className="App">
      <header className="App-header">
        <h1>PDF Q&A and Analysis App (React Version)</h1>
      </header>

      <section id="pdf-upload-section">
        <h2>1. Upload PDF</h2>
        <PdfUploader 
          onUploadSuccess={handlePdfUploadSuccess} 
          apiBaseUrl={API_BASE_URL} 
        />
        {uploadedFileName && <p>Successfully uploaded: {uploadedFileName} (File ID: {fileId})</p>}
      </section>

      {fileId && (
        <section id="model-selection-section">
          <h2>Select Model</h2>
          <select 
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)}
            style={{padding: "8px", minWidth: "300px"}}
          >
            {availableModels.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
          <p><small>Ensure the selected model is supported by your LiteLLM setup.</small></p>
        </section>
      )}

      {fileId && (
        <>
          <section id="qa-section">
            <h2>2. Ask Questions</h2>
            <QaSection 
              fileId={fileId} 
              modelName={selectedModel} 
              apiBaseUrl={API_BASE_URL} 
            />
          </section>

          <section id="summarization-section">
            <h2>3. Summarize Document</h2>
            <SummarizationSection
              fileId={fileId}
              modelName={selectedModel}
              apiBaseUrl={API_BASE_URL}
            />
          </section>

          <section id="term-explanation-section">
            <h2>4. Explain Term/Concept</h2>
            <TermExplanationSection
              modelName={selectedModel}
              apiBaseUrl={API_BASE_URL}
            />
          </section>

          <section id="misinformation-section">
            <h2>5. Detect Misinformation</h2>
            <MisinformationDetectionSection
              modelName={selectedModel}
              apiBaseUrl={API_BASE_URL}
            />
          </section>

          <section id="sentiment-analysis-section">
            <h2>6. Analyze Sentiment</h2>
            <SentimentAnalysisSection
              modelName={selectedModel}
              apiBaseUrl={API_BASE_URL}
            />
          </section>
        </>
      )}
       {!fileId && (
         <p><em>Upload a PDF to enable analysis features.</em></p>
      )}
    </div>
  );
}

export default App;
