import streamlit as st
import PyPDF2
from litellm import completion
from dotenv import load_dotenv

load_dotenv()


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
            submitted = st.form_submit_button("Submit")
            if submitted and query:
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


if __name__ == "__main__":
    main()
