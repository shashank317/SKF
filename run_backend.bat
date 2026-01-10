@echo off
echo Starting Backend Server...
cd backend
if not exist "venv\Scripts\activate.bat" (
    echo Virtual environment not found!
    echo Please run: python -m venv venv
    echo And install requirements: pip install -r requirements.txt
    pause
    exit /b
)
call venv\Scripts\activate.bat
echo Virtual environment activated.
uvicorn app.main:app --reload
pause
