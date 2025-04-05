# RFP Analyzer

This tool analyzes government RFPs to check if ConsultAdd is eligible to apply. It uses AI and Elasticsearch for smart parsing and compliance checks.

## Tech Stack
- Backend: FastAPI
- Frontend: React
- Search: Elasticsearch
- AI: Retrieval-Augmented Generation (RAG), agents

## Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload
