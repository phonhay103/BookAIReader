# BookAIReader

BookAIReader is a Streamlit application that allows you to interact with PDF documents using AI. You can ask questions about the content of a PDF or extract key information to quickly understand its main points.

## Features

-   **Interactive Q&A:** Upload a PDF and ask questions about its content. The application uses Large Language Models (LLMs) to provide answers based on the document's text.
-   **Intelligent Summarization:** Get a customizable overview of your PDF. This feature allows you to:
    -   Select summary length (Short, Medium, Long, Comprehensive).
    -   Provide optional keywords to focus the summary on specific topics.
    -   Receive a summary along with key sentences extracted from the text.
    The "Comprehensive" option provides a detailed breakdown including main ideas, useful information, and quotable passages.
-   **Terminology and Concept Explanation:** Enter a term or phrase from the PDF (or any text) and optionally provide surrounding context. The AI will define the term, explain it in context (if provided), and list related concepts. This is useful for quickly understanding jargon or complex ideas.
-   **Experimental Misinformation Detection:** Paste a segment of text to analyze it for potential misinformation. The AI will identify controversial claims or statements that may lack evidence and provide a brief assessment. This feature is experimental and should be used with caution, always verifying information from reputable sources.

## How to Use

1.  **Upload a PDF:** Use the file uploader to select the PDF document you want to analyze. The application will process the text from the PDF.
2.  **Select a Model:** Choose one of the available LLMs from the dropdown menu. Different models may provide different nuances in their responses.
3.  **Ask a Question (for Q&A):** Type your question into the "Ask your question:" field and click "Submit Q&A". The answer will be displayed below.
4.  **Generate a Summary (for Intelligent Summarization):**
    *   Under "Intelligent Summarization", select your desired "summary length" from the dropdown.
    *   Optionally, enter comma-separated "keywords/topics" to focus the summary.
    *   Click "Generate Summary". The summary and key sentences will appear in an expandable section.
5.  **Explain a Term (for Terminology and Concept Explanation):**
    *   Under "Terminology and Concept Explanation", enter the "term or phrase to explain".
    *   Optionally, paste some "surrounding context" from the PDF into the text area. Providing context helps generate more relevant explanations.
    *   Click "Explain Term". The explanation will be displayed.
6.  **Analyze Text for Misinformation (for Experimental Misinformation Detection):**
    *   Expand the "🧪 Experimental: Misinformation Detection" section.
    *   Paste the "text segment to analyze" into the text area.
    *   Click "Analyze for Potential Misinformation". The analysis will be displayed. Remember to critically evaluate the output and verify information.

## Setup and Installation

(To be added: Detailed instructions on how to set up the local environment, install dependencies, and run the application.)