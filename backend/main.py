import io
from typing import Dict, Optional
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import PyPDF2
from litellm import completion
from dotenv import load_dotenv

# It's good practice to load .env variables early, 
# especially if they configure aspects of the app initialization
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

pdf_texts: Dict[str, str] = {}

# Generic LLM Helper Function
def call_llm(prompt: str, model_name: str, **kwargs):
    try:
        messages = [{"role": "user", "content": prompt}]
        response = completion(
            model=model_name,
            messages=messages,
            **kwargs
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"LLM API call failed: {e}") # Log to server console
        raise HTTPException(status_code=500, detail=f"LLM API call failed: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Welcome to the PDF Q&A Backend API!"}

@app.post("/upload_pdf/")
async def create_upload_pdf(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file name provided.")
    if not file.content_type == "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDFs are accepted.")
    try:
        pdf_content = await file.read()
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
        text = ""
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        
        # Use filename as a simple ID. For concurrent use, a more robust ID is needed.
        file_id = file.filename 
        pdf_texts[file_id] = text
        return {"file_id": file_id, "filename": file.filename, "detail": "PDF processed successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")

@app.post("/qa/")
async def question_answer(file_id: str = Form(...), query: str = Form(...), model_name: str = Form(...)):
    if file_id not in pdf_texts:
        raise HTTPException(status_code=404, detail="PDF not found. Please upload it first.")
    
    pdf_text = pdf_texts[file_id]
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    if not model_name:
        raise HTTPException(status_code=400, detail="Model name cannot be empty.")

    qa_prompt = f"Here is the entire document content:\n\n{pdf_text}\n\nQuestion: {query}\nAnswer:"
    
    try:
        answer = call_llm(qa_prompt, model_name)
        return {"answer": answer}
    except HTTPException:
        # Re-raise if it's an HTTPException from call_llm
        raise
    except Exception as e:
        # Catch any other unexpected errors during the QA process
        raise HTTPException(status_code=500, detail=f"Error during Q&A processing: {str(e)}")


# Helper Functions (adapted from app.py, st.* calls removed)

def extract_key_info(pdf_text: str, model_name: str, summary_length: str = "Comprehensive", keywords: Optional[str] = None):
    prompt = f"PDF Content:\n{pdf_text}\n\n"
    if keywords:
        prompt += f"Focus on these keywords: {keywords}.\n"
    prompt += f"Provide a {summary_length} summary of the key information."
    
    # call_llm will raise HTTPException on failure
    return call_llm(prompt, model_name)

def explain_term(term: str, context: Optional[str], model_name: str):
    prompt = f"Explain the term '{term}'."
    if context:
        prompt += f" Provide the explanation in the context of: {context}."
    else:
        prompt += " Provide a general explanation."
    # call_llm will raise HTTPException on failure
    return call_llm(prompt, model_name)

def detect_misinformation(text_segment: str, model_name: str):
    prompt = (
        f"Analyze the following text segment for potential misinformation. "
        f"Provide a brief assessment of its likelihood of being misinformation "
        f"and highlight any specific claims that might be inaccurate or misleading. "
        f"Text to analyze: \"{text_segment}\""
    )
    # call_llm will raise HTTPException on failure
    return call_llm(prompt, model_name)

def analyze_sentiment(text_segment: str, model_name: str):
    prompt = (
        f"Analyze the sentiment of the following text segment. "
        f"Indicate whether the sentiment is positive, negative, or neutral, "
        f"and briefly explain your reasoning. "
        f"Text to analyze: \"{text_segment}\""
    )
    # call_llm will raise HTTPException on failure
    return call_llm(prompt, model_name)

# API Endpoints

@app.post("/summarize/")
async def summarize_text(
    file_id: str = Form(...),
    model_name: str = Form(...),
    summary_length: str = Form("Comprehensive"), # Default from app.py
    keywords: Optional[str] = Form(None)
):
    if file_id not in pdf_texts:
        raise HTTPException(status_code=404, detail="PDF not found. Please upload it first.")
    
    pdf_text = pdf_texts[file_id]
    if not model_name: # Basic validation
        raise HTTPException(status_code=400, detail="Model name cannot be empty.")

    try:
        summary_info = extract_key_info(pdf_text, model_name, summary_length, keywords)
        return {"summary": summary_info}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during summarization: {str(e)}")

@app.post("/explain_term/")
async def explain_term_api(
    term: str = Form(...),
    model_name: str = Form(...),
    context: Optional[str] = Form(None)
):
    if not term:
        raise HTTPException(status_code=400, detail="Term cannot be empty.")
    if not model_name:
        raise HTTPException(status_code=400, detail="Model name cannot be empty.")
        
    try:
        explanation = explain_term(term, context, model_name)
        return {"explanation": explanation}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during term explanation: {str(e)}")

@app.post("/detect_misinformation/")
async def detect_misinfo_api(
    text_segment: str = Form(...),
    model_name: str = Form(...)
):
    if not text_segment.strip():
        raise HTTPException(status_code=400, detail="Text segment cannot be empty.")
    if not model_name:
        raise HTTPException(status_code=400, detail="Model name cannot be empty.")

    try:
        analysis = detect_misinformation(text_segment, model_name)
        return {"misinformation_analysis": analysis}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during misinformation detection: {str(e)}")

@app.post("/analyze_sentiment/")
async def analyze_sentiment_api(
    text_segment: str = Form(...),
    model_name: str = Form(...)
):
    if not text_segment.strip():
        raise HTTPException(status_code=400, detail="Text segment cannot be empty.")
    if not model_name:
        raise HTTPException(status_code=400, detail="Model name cannot be empty.")

    try:
        sentiment_result = analyze_sentiment(text_segment, model_name)
        return {"sentiment_analysis": sentiment_result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during sentiment analysis: {str(e)}")
