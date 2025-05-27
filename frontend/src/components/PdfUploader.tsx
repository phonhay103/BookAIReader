import React, { useState } from 'react';
import axios from 'axios';

interface PdfUploaderProps {
  onUploadSuccess: (fileId: string, fileName: string) => void;
  apiBaseUrl: string;
}

const PdfUploader: React.FC<PdfUploaderProps> = ({ onUploadSuccess, apiBaseUrl }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files ? event.target.files[0] : null);
    setError(null); // Clear previous errors
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`${apiBaseUrl}/upload_pdf/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onUploadSuccess(response.data.file_id, response.data.filename);
      setSelectedFile(null); // Clear selection after upload
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload PDF. Ensure the backend is running and CORS is configured.');
      console.error("Upload error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={handleFileChange} disabled={isLoading} />
      <button onClick={handleUpload} disabled={isLoading || !selectedFile}>
        {isLoading ? 'Uploading...' : 'Upload PDF'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default PdfUploader;
