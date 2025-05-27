# PDF Q&A and Analysis App (React + FastAPI)

This project allows users to upload PDF documents and interact with them using Large Language Models (LLMs). Features include asking questions about the PDF content, generating summaries, explaining terms, detecting potential misinformation, and analyzing sentiment.

This version uses a React frontend and a FastAPI (Python) backend.

## Prerequisites

*   Python 3.8+
*   Node.js 16.x+ (which includes npm) or Yarn

## Project Structure

```
.
├── backend/        # FastAPI backend application
│   ├── tests/      # Backend unit tests
│   ├── main.py     # Main FastAPI application logic
│   ├── requirements.txt # Python dependencies
│   └── .env.example # Example environment file (user should create .env)
├── frontend/       # React frontend application
│   ├── src/
│   │   ├── components/ # React components
│   │   └── App.tsx     # Main React application component
│   ├── package.json  # Node dependencies
│   └── ...
├── .gitignore
├── LICENSE
├── Makefile        # (May need updates if still used)
├── README.md       # This file
└── pyproject.toml  # (May relate to Python project setup, e.g., for linters/formatters)
```

## Backend Setup (FastAPI)

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create and activate a Python virtual environment:**
    ```bash
    python -m venv .venv
    source .venv/bin/activate  # On Windows: .venv\Scripts\activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up environment variables:**
    Create a `.env` file in the `backend` directory by copying `.env.example`. This file will store your LLM API keys.
    
    Example `.env.example` content:
    ```env
    # LiteLLM Environment Variables
    # Add API keys for the LLM providers you intend to use.
    # Refer to LiteLLM documentation for specific variable names if needed.
    # Examples:
    # OPENAI_API_KEY="sk-your_openai_api_key"
    # ANTHROPIC_API_KEY="sk-ant-your_anthropic_api_key"
    # COHERE_API_KEY="your_cohere_api_key"
    # HUGGINGFACE_API_KEY="hf_your_huggingface_api_key"
    # GEMINI_API_KEY="your_gemini_api_key" # For Google Gemini models via LiteLLM
    ```
    **Note:** Ensure your LiteLLM setup in the backend (`main.py` or associated config) is prepared to use these environment variables for the models you select (e.g., "gemini/gemini-2.0-flash"). The `python-dotenv` library is used to load these variables.

5.  **Run the backend server:**
    ```bash
    uvicorn main:app --reload --port 8000
    ```
    The backend API will be available at `http://localhost:8000`.

## Frontend Setup (React)

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend 
    ```
    *(If you are in the `backend` directory, use `cd ../frontend`)*

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    *(Or if you prefer Yarn: `yarn install`)*

3.  **Run the frontend development server:**
    ```bash
    npm run dev
    ```
    *(Or `yarn dev`)*
    The React application will typically open in your browser at `http://localhost:5173` (or another port if 5173 is busy, check your terminal output).

4.  **Connecting to the Backend:**
    The frontend is configured to connect to the backend API at `http://localhost:8000` (as defined in `frontend/src/App.tsx`). Ensure the backend server is running.

## Model Configuration

The selection of LLM models (e.g., "gemini/gemini-2.0-flash") is currently managed in the frontend (`App.tsx` has a placeholder list). For robust model management:
*   Consider using the `models_config.json` file (if it exists from the original project and is still relevant) or a new configuration mechanism to populate the model selector in the frontend dynamically.
*   Ensure that any model selected in the frontend is correctly configured and supported by your LiteLLM setup in the backend (including necessary API keys in the `.env` file).

The original `models_config.py` may no longer be needed if its sole purpose was to serve the Streamlit application's model selection.

## Original Streamlit Application

The original Streamlit application (`app.py`) has been replaced by this React frontend and FastAPI backend. You may choose to archive or remove `app.py` and any Streamlit-specific configuration files that are no longer in use.

## License

This code is released under the MIT License. See the LICENSE file for details.

## Linting and Formatting (Optional)

This project may use tools like Black, Flake8 for Python, and Prettier, ESLint for TypeScript/React. Consider running them:
*   Python (backend): `black .`, `flake8`
*   TypeScript/React (frontend): `npm run lint`, `npm run format` (if scripts are configured in `package.json`)