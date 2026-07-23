from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

from agent import run_job_application_crew

app = FastAPI(title="Job Application Agent API")

# Allow requests from the Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the exact domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ApplicationRequest(BaseModel):
    job_desc: str
    candidate_profile: str

class ApplicationResponse(BaseModel):
    result: str

@app.post("/api/generate", response_model=ApplicationResponse)
def generate_application(request: ApplicationRequest):
    if not request.job_desc or not request.candidate_profile:
        raise HTTPException(status_code=400, detail="Job description and candidate profile are required.")
    
    # Ensure the OpenRouter key is present before starting a paid/remote model call.
    if not os.environ.get("OPENROUTER_API_KEY"):
        raise HTTPException(status_code=500, detail="Server misconfiguration: OPENROUTER_API_KEY is not set.")
        
    try:
        # Run the crew AI
        result = run_job_application_crew(request.job_desc, request.candidate_profile)
        return ApplicationResponse(result=result)
    except Exception as e:
        error_text = str(e)
        if "401" in error_text or "403" in error_text or "unauthorized" in error_text.lower():
            detail = "OpenRouter authentication failed. Check that OPENROUTER_API_KEY in .env is active and has credits or free-model access."
            raise HTTPException(status_code=502, detail=detail) from e
        raise HTTPException(status_code=502, detail=f"AI generation failed: {error_text}") from e

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
