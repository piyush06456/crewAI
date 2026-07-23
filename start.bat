@echo off
echo Starting Job Application Agent Web Server...
echo ==============================================

:: Start FastAPI backend in a new window with the API Key
start cmd /k ".\venv\Scripts\activate && set PYTHONIOENCODING=utf-8 && python main.py"

:: Wait for backend to initialize
echo Waiting for backend AI Server to initialize...
timeout /t 5 >nul

:: Start Vite frontend
echo Starting Frontend...
cd frontend
npm run dev
