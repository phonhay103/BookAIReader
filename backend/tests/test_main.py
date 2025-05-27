import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch

# Adjust the import path according to your project structure
# This assumes main.py is in the directory above tests if you run pytest from backend/
# Or, if running from root, it might be from backend.main import app
# For simplicity, let's assume we adjust PYTHONPATH or run pytest from the 'backend' directory.
# To make this runnable by the worker which executes from root, we need to adjust sys.path or use relative imports carefully.
# A common way is to have a conftest.py or adjust path.
# For now, let's assume `app` can be imported. The worker might need to cd into `backend` or set PYTHONPATH.
# The worker will execute from the root of the repo. So we need to make sure the app can be imported.
# One way to handle this is to add the backend directory to sys.path FOR THE TEST.

import sys
import os

# Add the backend directory to sys.path for the test execution context
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import app # Imports the FastAPI app instance from backend/main.py

client = TestClient(app)

# Mock data for pdf_texts in main.py for testing purposes
# This needs to be done carefully. We can patch main.pdf_texts
# or set it directly if the test setup allows modifying the app's state.

@pytest.fixture(autouse=True)
def setup_and_teardown_pdf_texts():
    # Setup: Add a dummy PDF text for testing /qa
    from main import pdf_texts
    pdf_texts["test.pdf"] = "This is a test PDF content."
    yield
    # Teardown: Clear the dummy PDF text
    pdf_texts.clear()


@patch('main.call_llm') # Mock the call_llm function in main.py
def test_qa_success(mock_call_llm):
    mock_call_llm.return_value = "This is a mock LLM answer."
    
    response = client.post(
        "/qa/",
        data={"file_id": "test.pdf", "query": "What is this?", "model_name": "test-model"}
    )
    assert response.status_code == 200
    assert response.json() == {"answer": "This is a mock LLM answer."}
    mock_call_llm.assert_called_once_with(
        "Here is the entire document content:\n\nThis is a test PDF content.\n\nQuestion: What is this?\nAnswer:", 
        "test-model"
    )

def test_qa_pdf_not_found():
    response = client.post(
        "/qa/",
        data={"file_id": "nonexistent.pdf", "query": "What is this?", "model_name": "test-model"}
    )
    assert response.status_code == 404
    assert response.json() == {"detail": "PDF not found. Please upload it first."}

def test_qa_empty_query():
    response = client.post(
        "/qa/",
        data={"file_id": "test.pdf", "query": "", "model_name": "test-model"}
    )
    assert response.status_code == 400 # Should be 400 based on endpoint logic for empty query
    # The actual status code from FastAPI for failed validation on Form data might be 422
    # Let's check what the endpoint actually raises for empty query.
    # The endpoint has: if not query: raise HTTPException(status_code=400, detail="Query cannot be empty.")
    # So 400 is correct.
    assert response.json() == {"detail": "Query cannot be empty."}

@patch('main.call_llm')
def test_qa_llm_error(mock_call_llm):
    # Simulate an error from call_llm by making it raise an HTTPException
    # The call_llm in main.py was modified to raise HTTPException(status_code=500, detail=...)
    mock_call_llm.side_effect = Exception("LLM simulated error") # Generic Exception to trigger the catch-all in call_llm
                                                              # which then raises HTTPException(500, ...)
                                                              # Or directly raise the specific HTTPException if call_llm is expected to do that.
                                                              # The current call_llm does: raise HTTPException(status_code=500, detail=f"LLM API call failed: {str(e)}")

    response = client.post(
        "/qa/",
        data={"file_id": "test.pdf", "query": "A question", "model_name": "test-model"}
    )
    assert response.status_code == 500 
    assert "LLM API call failed" in response.json()["detail"]

# Basic test for the root endpoint
def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the PDF Q&A Backend API!"}

# TODO: Add tests for /upload_pdf and other endpoints
