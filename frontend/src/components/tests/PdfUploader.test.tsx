// frontend/src/components/tests/PdfUploader.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PdfUploader from '../PdfUploader'; // Adjust path as necessary
import React from 'react';

// Mock axios if it's called directly on render or during simple interactions
// For this component, it's called on button click.
// vi.mock('axios'); // Not strictly needed for just rendering check, but good for interaction tests

describe('PdfUploader Component', () => {
  const mockApiBaseUrl = 'http://localhost:8000';
  const mockOnUploadSuccess = vi.fn();

  it('renders the file input and upload button', () => {
    render(
      <PdfUploader
        onUploadSuccess={mockOnUploadSuccess}
        apiBaseUrl={mockApiBaseUrl}
      />
    );

    // Check for the file input
    // The component does not have a direct label for the input.
    // A better way would be to add a data-testid to the input in PdfUploader.tsx
    // e.g. <input data-testid="pdf-file-input" ... />
    // Then screen.getByTestId('pdf-file-input');
    // For now, finding by its implicit role via a more direct DOM query for type="file"
    const fileInputElement = document.querySelector('input[type="file"]');
    expect(fileInputElement).toBeInTheDocument();
    expect(fileInputElement).toHaveAttribute('accept', 'application/pdf');

    // Check for the upload button
    const uploadButton = screen.getByRole('button', { name: /upload pdf/i });
    expect(uploadButton).toBeInTheDocument();
  });

  it('upload button is disabled initially when no file is selected', () => {
    render(
      <PdfUploader
        onUploadSuccess={mockOnUploadSuccess}
        apiBaseUrl={mockApiBaseUrl}
      />
    );
    const uploadButton = screen.getByRole('button', { name: /upload pdf/i });
    expect(uploadButton).toBeDisabled();
  });
  
  // More tests can be added:
  // - e.g., enabling button after file selection
  // - e.g., calling onUploadSuccess on successful API call (would require mocking axios)
});
