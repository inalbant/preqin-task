import pytest
from fastapi.testclient import TestClient
from main import app, get_db_connection
import sqlite3
import os

client = TestClient(app)

# Test data to be inserted into the test database
TEST_DATA = [
    {
        "Investor Name": "Test Investor 1",
        "Investory Type": "Corporate",
        "Investor Date Added": "2024-01-01",
        "Investor Last Updated": "2024-01-02",
        "Investor Country": "USA",
        "Commitment Asset Class": "Equity",
        "Commitment Amount": 1000000.0
    },
    {
        "Investor Name": "Test Investor 1",
        "Investory Type": "Corporate",
        "Investor Date Added": "2024-01-01",
        "Investor Last Updated": "2024-01-02",
        "Investor Country": "USA",
        "Commitment Asset Class": "Debt",
        "Commitment Amount": 500000.0
    }
]

@pytest.fixture(autouse=True)
def test_db():
    # Use an in-memory SQLite database for testing
    conn = sqlite3.connect(':memory:')
    cursor = conn.cursor()
    
    # Create table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS data (
            "Investor Name" TEXT,
            "Investory Type" TEXT,
            "Investor Date Added" TEXT,
            "Investor Last Updated" TEXT,
            "Investor Country" TEXT,
            "Commitment Asset Class" TEXT,
            "Commitment Amount" REAL
        )
    ''')
    
    # Insert test data
    cursor.executemany('''
        INSERT INTO data VALUES (
            :investor_name,
            :investor_type,
            :investor_date_added,
            :investor_last_updated,
            :investor_country,
            :commitment_asset_class,
            :commitment_amount
        )
    ''', [{
        "investor_name": item["Investor Name"],
        "investor_type": item["Investory Type"],
        "investor_date_added": item["Investor Date Added"],
        "investor_last_updated": item["Investor Last Updated"],
        "investor_country": item["Investor Country"],
        "commitment_asset_class": item["Commitment Asset Class"],
        "commitment_amount": item["Commitment Amount"]
    } for item in TEST_DATA])
    
    conn.commit()
  
    
    # Override the database connection in main.py
    def get_test_db():
        test_conn = sqlite3.connect(':memory:')
        test_conn.row_factory = sqlite3.Row
        cursor = test_conn.cursor()
        # Recreate the test data for each connection
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS data (
                "Investor Name" TEXT,
                "Investory Type" TEXT,
                "Investor Date Added" TEXT,
                "Investor Last Updated" TEXT,
                "Investor Country" TEXT,
                "Commitment Asset Class" TEXT,
                "Commitment Amount" REAL
            )
        ''')
        cursor.executemany('''
            INSERT INTO data VALUES (
                :investor_name,
                :investor_type,
                :investor_date_added,
                :investor_last_updated,
                :investor_country,
                :commitment_asset_class,
                :commitment_amount
        )
        ''', [{
            "investor_name": item["Investor Name"],
            "investor_type": item["Investory Type"],
            "investor_date_added": item["Investor Date Added"],
            "investor_last_updated": item["Investor Last Updated"],
            "investor_country": item["Investor Country"],
            "commitment_asset_class": item["Commitment Asset Class"],
            "commitment_amount": item["Commitment Amount"]
        } for item in TEST_DATA])
        test_conn.commit()
        return test_conn

    app.dependency_overrides[get_db_connection] = get_test_db
    
    yield

def test_read_investors():
    response = client.get("/investors")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1  # Should only have one investor (grouped)
    assert data[0]["name"] == "Test Investor 1"
    assert data[0]["totalCommitment"] == 1500000.0  # Sum of both commitments

def test_read_investor_details():
    response = client.get("/investors/Test Investor 1")
    assert response.status_code == 200
    data = response.json()
    
    # Test structure
    assert "commitments" in data
    assert "assetsTotals" in data
    assert "totalAmount" in data
    
    # Test commitments
    assert len(data["commitments"]) == 2
    
    # Test asset totals
    assert len(data["assetsTotals"]) == 2
    assert data["totalAmount"] == 1500000.0

def test_investor_not_found():
    response = client.get("/investors/Nonexistent Investor")
    assert response.status_code == 404
    assert response.json()["detail"] == "No investments found for investor: Nonexistent Investor"