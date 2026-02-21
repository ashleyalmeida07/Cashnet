#!/usr/bin/env python
"""
Quick verification script to test all backend components
Run this to verify the backend setup is working correctly
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

def print_header(text):
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}")

def test_server_health():
    print_header("1. Testing Server Health")
    response = requests.get(f"{BASE_URL}/health")
    data = response.json()
    print(f"✅ Status: {data['status']}")
    print(f"✅ Blockchain: {data['blockchain']['network']} (Block: {data['blockchain']['block_number']})")
    print(f"✅ Database: {data['database']}")
    return response.status_code == 200

def test_contracts():
    print_header("2. Testing Contract Addresses")
    response = requests.get(f"{BASE_URL}/contracts")
    data = response.json()
    print(f"✅ Network: {data['network']}")
    for name, address in data['contracts'].items():
        print(f"✅ {name}: {address[:10]}...{address[-8:]}")
    return response.status_code == 200

def test_participant_crud():
    print_header("3. Testing Participant CRUD Operations")
    
    # Create
    test_wallet = f"0xTEST{datetime.now().timestamp()}"
    create_data = {"wallet": test_wallet, "role": "BORROWER"}
    response = requests.post(f"{BASE_URL}/participants/register", json=create_data)
    print(f"✅ Create: {response.status_code} - Wallet: {test_wallet[:20]}...")
    
    # Read All
    response = requests.get(f"{BASE_URL}/participants")
    participants = response.json()
    print(f"✅ Read All: Found {len(participants)} participant(s)")
    
    # Read One
    response = requests.get(f"{BASE_URL}/participants/{test_wallet}")
    print(f"✅ Read One: Credit Score: {response.json()['score']}")
    
    return True

def test_pool_endpoints():
    print_header("4. Testing Pool Endpoints")
    
    # Get pool state
    response = requests.get(f"{BASE_URL}/pool/state")
    data = response.json()
    print(f"✅ Pool State: Reserve A: {data['reserve_a']}, Reserve B: {data['reserve_b']}")
    
    # Test swap
    swap_data = {
        "wallet": "0xTest",
        "token_in": "TokenA",
        "token_out": "TokenB",
        "amount_in": 100.0
    }
    response = requests.post(f"{BASE_URL}/pool/swap", json=swap_data)
    print(f"✅ Swap: Status: {response.json()['status']}")
    
    return True

def test_lending_endpoints():
    print_header("5. Testing Lending Endpoints")
    
    # Get health factor
    response = requests.get(f"{BASE_URL}/lending/health-factor/0xTest")
    data = response.json()
    print(f"✅ Health Factor: {data['health_factor']} - At Risk: {data['at_risk']}")
    
    return True

def test_alerts():
    print_header("6. Testing Alert System")
    
    # Create alert
    alert_data = {
        "type": "test_alert",
        "severity": "LOW",
        "wallet": "0xTest",
        "description": "Test alert from verification script"
    }
    response = requests.post(f"{BASE_URL}/alerts", json=alert_data)
    print(f"✅ Create Alert: {response.status_code}")
    
    # Get all alerts
    response = requests.get(f"{BASE_URL}/alerts")
    alerts = response.json()
    print(f"✅ Get Alerts: Found {len(alerts)} alert(s)")
    
    # Get fraud score
    response = requests.get(f"{BASE_URL}/alerts/fraud-score/0xTest")
    data = response.json()
    print(f"✅ Fraud Score: Risk Level: {data['risk_level']}")
    
    return True

def test_simulations():
    print_header("7. Testing Simulation Management")
    
    # Create simulation
    sim_data = {"name": "Test Simulation"}
    response = requests.post(f"{BASE_URL}/simulations", json=sim_data)
    sim_id = response.json()['id']
    print(f"✅ Create Simulation: ID {sim_id}")
    
    # Get all simulations
    response = requests.get(f"{BASE_URL}/simulations")
    sims = response.json()
    print(f"✅ Get Simulations: Found {len(sims)} simulation(s)")
    
    return True

def main():
    print("\n" + "="*60)
    print("  🚀 Rust-eze Simulation Lab Backend Verification")
    print("="*60)
    
    try:
        results = {
            "Server Health": test_server_health(),
            "Contract Addresses": test_contracts(),
            "Participant CRUD": test_participant_crud(),
            "Pool Endpoints": test_pool_endpoints(),
            "Lending Endpoints": test_lending_endpoints(),
            "Alert System": test_alerts(),
            "Simulation Management": test_simulations()
        }
        
        print_header("VERIFICATION RESULTS")
        all_passed = True
        for test_name, result in results.items():
            status = "✅ PASSED" if result else "❌ FAILED"
            print(f"{test_name}: {status}")
            all_passed = all_passed and result
        
        print("\n" + "="*60)
        if all_passed:
            print("  ✅ ALL TESTS PASSED - Backend is fully operational!")
        else:
            print("  ⚠️  Some tests failed - please check the output above")
        print("="*60 + "\n")
        
        print("📚 API Documentation: http://localhost:8000/docs")
        print("🔍 Interactive Testing: http://localhost:8000/redoc")
        print("\n")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to backend server")
        print("Please make sure the server is running:")
        print("  cd backend")
        print("  .\\venv\\Scripts\\Activate.ps1")
        print("  python main.py")
        print("\n")

if __name__ == "__main__":
    main()
