import streamlit as st
import PyPDF2
from litellm import completion
from dotenv import load_dotenv

load_dotenv()


# Generic LLM Helper Function
def call_llm(prompt, model_name, **kwargs):
    """
    Generic helper function to call the LLM API.
    Includes basic error handling.
    """
    try:
        messages = [{"role": "user", "content": prompt}]
        response = completion(
            model=model_name,
            messages=messages,
            **kwargs  # For future flexibility e.g. temperature
        )
        return response.choices[0].message.content
    except Exception as e:
        st.error(f"LLM API call failed: {e}") # Log more appropriately for production
        return None # Or raise a custom exception


def extract_key_info(pdf_text, model_name, summary_length="Comprehensive", keywords=None):
    """
    Extracts key information from PDF text using an LLM, with customizable summary length and keyword focus.
    """
    prompt_parts = [f"Analyze the following text:\n\n{pdf_text}\n\n"]

    if summary_length == "Short":
        prompt_parts.append("Provide a very brief summary (1-2 sentences).")
    elif summary_length == "Medium":
        prompt_parts.append("Provide a concise summary (3-5 sentences).")
    elif summary_length == "Long":
        prompt_parts.append("Provide a detailed summary (6-8 sentences).")
    else:  # Comprehensive
        prompt_parts.append("Provide a comprehensive summary that includes:\n1. **Main Ideas:** Identify the core concepts and arguments presented.\n2. **Useful Information:** Extract key facts, data, or insights that are particularly valuable.\n3. **Quotable Passages:** Pinpoint specific sentences or phrases that are impactful, insightful, or representative of the text's message.\n4. **Concise Summary:** Provide a brief overview of the entire text, removing any redundancies and focusing on the most critical information.")

    if keywords:
        prompt_parts.append(f"\nFocus the summary on aspects related to the following keywords: {keywords}.")

    prompt_parts.append("\n\nIdentify and list the key sentences from the original text that were most important for creating the summary, under the heading 'Key Sentences for Summary:'.")
    
    if summary_length == "Comprehensive":
         prompt_parts.append("\nPlease structure your full response clearly, using headings for each section (Main Ideas, Useful Information, Quotable Passages, Concise Summary, Key Sentences for Summary:).")
    else:
        prompt_parts.append("\nPlease structure your response clearly, using headings for the summary and 'Key Sentences for Summary:'.")

    prompt = "\n".join(prompt_parts)
    return call_llm(prompt, model_name)


def detect_misinformation(text_segment, model_name):
    """
    Analyzes a text segment for potential misinformation using an LLM.
    """
    prompt = f"""You are an analytical AI assistant. Analyze the following text segment for potential misinformation.

Text Segment:
'{text_segment}'

Please perform the following:
1.  Identify specific claims or statements within this text that might be controversial, lack widely accepted evidence, or could be potentially misleading.
2.  For each identified claim, provide a brief assessment of its likely accuracy.
3.  IMPORTANT: Conclude your analysis with the following disclaimer: 'This assessment is based on my training data up to my last update and is not a real-time or infallible fact-check. Always verify critical information from multiple reputable sources.'

If no potentially problematic claims are identified, state that clearly.
"""
    return call_llm(prompt, model_name)


def explain_term(term, context, model_name):
    """
    Explains a given term using an LLM, considering optional context.
    """
    prompt_parts = [
        f"You are an expert at explaining complex terms and concepts.\nTerm to explain: '{term}'\n"
    ]
    if context:
        prompt_parts.append(f"Provided context: '{context}'\n")
    else:
        prompt_parts.append("No specific context provided.\n")

    prompt_parts.append(
        """
Please provide:
1. A clear definition of the term.
2. An explanation of the term, specifically considering the provided context (if any). If no context is given, provide a general explanation.
3. A list of related concepts or any additional relevant information.
4. (Optional) Suggest 1-2 full URL links to highly reputable sources (like Wikipedia or well-known academic/professional sites) for further reading on this term. Ensure the links are full URLs.
"""
    )
    prompt = "".join(prompt_parts)
    return call_llm(prompt, model_name)


def analyze_sentiment(text_segment, model_name):
    """
    Analyzes the sentiment of a text segment using an LLM.
    """
    prompt = f"""Analyze the sentiment of the following text segment.
Classify the sentiment as 'Positive', 'Negative', or 'Neutral'.
Provide a brief explanation for your classification.
Optionally, include a confidence score for your classification.

Text Segment:
'{text_segment}'

Format your response as:
Sentiment: [Positive/Negative/Neutral]
Confidence: [0.xx] (Optional)
Explanation: [Your explanation]
"""
    return call_llm(prompt, model_name)


def main():
    st.title("PDF Q&A App")
    uploaded_file = st.file_uploader("Upload a PDF", type=["pdf"])

    if uploaded_file:
        pdf_reader = PyPDF2.PdfReader(uploaded_file)
        pdf_text = "\n".join(page.extract_text() for page in pdf_reader.pages)

        with st.form("qa_form"):
            query = st.text_input("Ask your question:")
            models = [
                "gemini/gemini-2.0-flash",
                "gemini/gemini-2.0-flash-thinking-exp-01-21",
            ]
            selected_model = st.selectbox("Select model:", models)
            
            qa_submitted = st.form_submit_button("Submit Q&A")

            st.subheader("Intelligent Summarization")
            st.caption(
                "Select the desired length for your summary. "
                "Optionally, provide keywords (comma-separated) to focus the summary on specific topics."
            )
            summary_length_options = ["Short", "Medium", "Long", "Comprehensive"]
            summary_length = st.selectbox("Select summary length:", summary_length_options, index=1)
            keywords = st.text_input("Enter keywords/topics (optional):")
            generate_summary_submitted = st.form_submit_button("Generate Summary")

            if qa_submitted and query:
                qa_prompt = f"Here is the entire book:\n\n{pdf_text}\n\nQuestion: {query}\nAnswer:"
                answer = call_llm(qa_prompt, selected_model)
                if answer:
                    st.write("Answer:", answer)
            
            if generate_summary_submitted:
                summary_info = extract_key_info(pdf_text, selected_model, summary_length, keywords)
                if summary_info:
                    with st.expander("Generated Summary", expanded=True):
                        st.markdown(summary_info)
            
            # Terminology and Concept Explanation Section
            st.subheader("Terminology and Concept Explanation")
            st.caption(
                "Enter a term or concept you want explained. "
                "Optionally, paste a short snippet of surrounding text (context) to get a more relevant explanation."
            )
            term_to_explain = st.text_input("Enter a term or phrase to explain:")
            surrounding_context = st.text_area("Paste surrounding context (optional):")
            explain_term_submitted = st.form_submit_button("Explain Term")

            if explain_term_submitted and term_to_explain:
                explanation = explain_term(term_to_explain, surrounding_context, selected_model)
                if explanation:
                    st.markdown("### Explanation")
                    st.markdown(explanation)

            # Experimental Misinformation Detection Section
            with st.expander("🧪 Experimental: Misinformation Detection", expanded=False):
                st.warning(
                    "This feature is experimental and may not always be accurate. LLMs can make mistakes. "
                    "Always verify critical information from multiple reputable sources."
                )
                st.caption("Paste a segment of text from the PDF (or any text) below to check for potential misinformation.")
                misinfo_text_segment = st.text_area(
                    "Text segment to analyze:",
                    height=150
                )
                analyze_misinfo_submitted = st.form_submit_button("Analyze for Potential Misinformation")

            # Sentiment Analysis Section
            st.subheader("Sentiment Analysis")
            st.caption("Analyze a piece of text to determine its sentiment (Positive, Negative, or Neutral).")
            sentiment_text_to_analyze = st.text_area("Enter text for sentiment analysis:", key="sentiment_text_area", height=150)
            analyze_sentiment_submitted = st.form_submit_button("Analyze Sentiment")

            if qa_submitted and query:
                qa_prompt = f"Here is the entire book:\n\n{pdf_text}\n\nQuestion: {query}\nAnswer:"
                answer = call_llm(qa_prompt, selected_model)
                if answer:
                    st.write("Answer:", answer)
            
            if generate_summary_submitted:
                summary_info = extract_key_info(pdf_text, selected_model, summary_length, keywords)
                if summary_info:
                    with st.expander("Generated Summary", expanded=True):
                        st.markdown(summary_info)
            
            if explain_term_submitted and term_to_explain:
                explanation = explain_term(term_to_explain, surrounding_context, selected_model)
                if explanation:
                    st.markdown("### Explanation")
                    st.markdown(explanation)

            if analyze_misinfo_submitted:
                    if not misinfo_text_segment.strip():
                        st.error("Please paste some text to analyze.")
                    else:
                        misinformation_analysis = detect_misinformation(misinfo_text_segment, selected_model)
                        if misinformation_analysis:
                            st.markdown("### Misinformation Analysis")
                            st.markdown(misinformation_analysis)
            
            if analyze_sentiment_submitted:
                if not sentiment_text_to_analyze.strip():
                    st.error("Please enter some text to analyze for sentiment.")
                else:
                    sentiment_result = analyze_sentiment(sentiment_text_to_analyze, selected_model)
                    if sentiment_result:
                        st.markdown("### Sentiment Analysis Result")
                        st.markdown(sentiment_result)


if __name__ == "__main__":
    main()
