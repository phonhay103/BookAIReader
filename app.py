import streamlit as st
import PyPDF2
from litellm import completion
from dotenv import load_dotenv

load_dotenv()


def extract_key_info(pdf_text, model_name):
    """
    Extracts key information from PDF text using an LLM.
    """
    prompt = f"""Analyze the following text and provide a comprehensive summary that includes:

1.  **Main Ideas:** Identify the core concepts and arguments presented.
2.  **Useful Information:** Extract key facts, data, or insights that are particularly valuable.
3.  **Quotable Passages:** Pinpoint specific sentences or phrases that are impactful, insightful, or representative of the text's message.
4.  **Concise Summary:** Provide a brief overview of the entire text, removing any redundancies and focusing on the most critical information.

Here is the text:

{pdf_text}

Please structure your response clearly, using headings for each section (Main Ideas, Useful Information, Quotable Passages, Concise Summary).
"""
    messages = [{"role": "user", "content": prompt}]
    response = completion(
        model=model_name,
        messages=messages,
    )
    return response.choices[0].message.content


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
            
            col1, col2 = st.columns(2)
            with col1:
                qa_submitted = st.form_submit_button("Submit Q&A")
            with col2:
                extract_submitted = st.form_submit_button("Extract Key Information")

            if qa_submitted and query:
                messages = [
                    {
                        "role": "user",
                        "content": f"Here is the entire book:\n\n{pdf_text}\n\nQuestion: {query}\nAnswer:",
                    }
                ]
                response = completion(
                    model=selected_model,
                    messages=messages,
                )
                st.write("Answer:", response.choices[0].message.content)
            
            if extract_submitted:
                key_info = extract_key_info(pdf_text, selected_model)
                with st.expander("Key Information Extracted", expanded=True):
                    st.markdown(key_info)


if __name__ == "__main__":
    main()
