init:
	uv venv
	uv sync
export:
	uv export --no-hashes --format requirements-txt > requirements.txt
app:
	uv run python -m streamlit run app.py
