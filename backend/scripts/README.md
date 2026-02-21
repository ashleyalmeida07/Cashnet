# Backend Utility Scripts

This folder contains utility scripts for managing and testing the backend.

## Scripts

### 🚀 start.bat
**Windows startup script for the backend server**

Automatically performs:
1. Creates virtual environment (if not exists)
2. Activates virtual environment
3. Installs dependencies from requirements.txt
4. Checks for .env.local configuration
5. Starts the FastAPI server

**Usage:**
```bash
cd backend/scripts
.\start.bat
```

---

### ✅ verify_backend.py
**Automated testing script for all backend components**

Tests:
- Server health (database + blockchain connectivity)
- Contract address loading
- Participant CRUD operations
- Pool endpoints (state, swap)
- Lending endpoints (health factor)
- Alert system (create, read, fraud scoring)
- Simulation management

**Usage:**
```bash
cd backend
.\venv\Scripts\Activate.ps1
python scripts/verify_backend.py
```

**Requirements:**
- Backend server must be running on http://localhost:8000
- Install requests package: `pip install requests`

**Output:**
- Detailed test results for each component
- Pass/fail status
- Links to API documentation

---

## Adding New Scripts

When adding new utility scripts to this folder:

1. **Name clearly:** Use descriptive names (e.g., `migrate_db.py`, `seed_data.py`)
2. **Add docstring:** Include purpose and usage at the top of the file
3. **Update this README:** Document the script here
4. **Make executable:** For shell scripts, ensure proper permissions

---

## Notes

- All scripts should be run from the `backend` directory
- Virtual environment should be activated before running Python scripts
- Check the main [backend README](../README.md) for general setup instructions
