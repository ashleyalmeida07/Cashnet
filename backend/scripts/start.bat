@echo off
echo ========================================
echo Rust-eze Simulation Lab - Backend Setup
echo ========================================
echo.

echo [1/5] Creating virtual environment...
cd ..
python -m venv venv
if errorlevel 1 (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)
echo ✓ Virtual environment created
echo.

echo [2/5] Activating virtual environment...
call venv\Scripts\activate.bat
echo ✓ Virtual environment activated
echo.

echo [3/5] Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

echo [4/5] Checking environment variables...
if not exist "..\\.env.local" (
    echo WARNING: .env.local not found in parent directory
    echo Please ensure the .env.local file exists with proper configuration
    pause
)
echo ✓ Environment check complete
echo.

echo [5/5] Starting FastAPI server...
echo.
echo ========================================
echo Server starting at http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo ========================================
echo.

python main.py

pause
