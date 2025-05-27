import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import ChatSection from '../ChatSection';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockFileId = 'test-file-id-123';
const mockModelName = 'gemini/gemini-pro';
const mockApiBaseUrl = 'http://localhost:8000';

describe('ChatSection Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockedAxios.post.mockReset();
  });

  test('renders initial elements correctly', () => {
    render(
      <ChatSection
        fileId={mockFileId}
        modelName={mockModelName}
        apiBaseUrl={mockApiBaseUrl}
      />
    );

    // Check for input field
    expect(screen.getByPlaceholderText(/Type your message here or click a suggestion/i)).toBeInTheDocument();

    // Check for send button
    expect(screen.getByRole('button', { name: /Send Message/i })).toBeInTheDocument();

    // Check for suggestions
    expect(screen.getByText(/Summarize the key points of this document./i)).toBeInTheDocument();
    expect(screen.getByText(/What is the main conclusion?/i)).toBeInTheDocument();
    expect(screen.getByText(/Explain \[a concept from the PDF\] in simple terms./i)).toBeInTheDocument();
  });

  test('allows typing in input, submitting message, and displays user and model messages', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { answer: 'This is a mocked model response.' },
    });

    render(
      <ChatSection
        fileId={mockFileId}
        modelName={mockModelName}
        apiBaseUrl={mockApiBaseUrl}
      />
    );

    const inputField = screen.getByPlaceholderText(/Type your message here or click a suggestion/i);
    const sendButton = screen.getByRole('button', { name: /Send Message/i });

    // Type a message
    const userMessage = 'Hello, model!';
    await userEvent.type(inputField, userMessage);
    expect(inputField).toHaveValue(userMessage);

    // Click send button
    await userEvent.click(sendButton);

    // Check if axios was called correctly
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${mockApiBaseUrl}/qa/`,
        expect.any(URLSearchParams), // More specific check below if needed
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      const params = (mockedAxios.post.mock.calls[0][1] as URLSearchParams);
      expect(params.get('file_id')).toBe(mockFileId);
      expect(params.get('query')).toBe(userMessage);
      expect(params.get('model_name')).toBe(mockModelName);
    });
    
    // Check for user message display
    expect(await screen.findByText(userMessage)).toBeInTheDocument();
    
    // Check for model response display
    expect(await screen.findByText('This is a mocked model response.')).toBeInTheDocument();

    // Check if input field is cleared
    expect(inputField).toHaveValue('');
  });

  test('updates input field value when a suggestion is clicked', async () => {
    render(
      <ChatSection
        fileId={mockFileId}
        modelName={mockModelName}
        apiBaseUrl={mockApiBaseUrl}
      />
    );

    const inputField = screen.getByPlaceholderText(/Type your message here or click a suggestion/i);
    const suggestionText = 'Summarize the key points of this document.';
    const suggestionButton = screen.getByText(suggestionText);

    expect(inputField).toHaveValue(''); // Initial state

    await userEvent.click(suggestionButton);

    expect(inputField).toHaveValue(suggestionText);
  });
  
  test('displays error message when API call fails', async () => {
    const errorMessage = 'Network Error';
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { detail: errorMessage } },
    });

    render(
      <ChatSection
        fileId={mockFileId}
        modelName={mockModelName}
        apiBaseUrl={mockApiBaseUrl}
      />
    );

    const inputField = screen.getByPlaceholderText(/Type your message here or click a suggestion/i);
    const sendButton = screen.getByRole('button', { name: /Send Message/i });

    await userEvent.type(inputField, 'Test query for error');
    await userEvent.click(sendButton);

    // Wait for error message to appear
    expect(await screen.findByText(`Error: ${errorMessage}`)).toBeInTheDocument();
  });

  test('send button is disabled when input is empty or model name is missing', () => {
    // Test with empty model name first
    render(
      <ChatSection
        fileId={mockFileId}
        modelName="" // Empty model name
        apiBaseUrl={mockApiBaseUrl}
      />
    );
    
    const inputField = screen.getByPlaceholderText(/Type your message here or click a suggestion/i);
    const sendButton = screen.getByRole('button', { name: /Send Message/i });

    expect(sendButton).toBeDisabled(); // Should be disabled due to empty model name

    // Now test with model name but empty input
    render(
      <ChatSection
        fileId={mockFileId}
        modelName={mockModelName} // Non-empty model name
        apiBaseUrl={mockApiBaseUrl}
      />
    );
    
    const inputFieldWithModel = screen.getByPlaceholderText(/Type your message here or click a suggestion/i);
    const sendButtonWithModel = screen.getByRole('button', { name: /Send Message/i });
    
    expect(sendButtonWithModel).toBeDisabled(); // Should be disabled due to empty input

    // Type something to enable it
    fireEvent.change(inputFieldWithModel, { target: { value: 'Test' } });
    expect(sendButtonWithModel).not.toBeDisabled();
  });

});
