from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
import sqlite3

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    conn = sqlite3.connect('data.sqlite')
    conn.row_factory = sqlite3.Row 
    try:
        yield conn
    finally:
        conn.close()

@app.get("/investors", response_model=List[Dict[str, Any]])
def read_items(db: sqlite3.Connection = Depends(get_db_connection)):
    cursor = db.cursor()
    cursor.execute("""
        SELECT 
            "Investor Name" AS "name",
            "Investory Type" AS "type",
            "Investor Date Added" AS "dateAdded",
            "Investor Country" AS "country",
            SUM("Commitment Amount") AS "totalCommitment"
        FROM data 
        GROUP BY "Investor Name"
    """)
    items = cursor.fetchall()

    if not items:
        raise HTTPException(status_code=404, detail="No items found")

    return [dict(item) for item in items]

@app.get("/investors/{name}", response_model=Dict[str, Any])
def read_investor_details(name: str, db: sqlite3.Connection = Depends(get_db_connection)):
    cursor = db.cursor()
    cursor.execute("""
        SELECT 
            "Investor Name" AS "name",
            "Investor Date Added" AS "dateAdded",
            "Investor Last Updated" AS "lastUpdated",
            "Commitment Asset Class" AS "assetClass",
            CAST("Commitment Amount" AS FLOAT) AS "amount"
        FROM data 
        WHERE "Investor Name" = ?
    """, (name,))
    individual_records = [dict(item) for item in cursor.fetchall()]

    cursor.execute("""
        SELECT 
            "Commitment Asset Class" AS "assetClass",
            SUM("Commitment Amount") AS "totalAmount",
            COUNT(*) AS "numberOfCommitments"
        FROM data 
        WHERE "Investor Name" = ?
        GROUP BY "Commitment Asset Class"
    """, (name,))
    asset_class_totals = [dict(item) for item in cursor.fetchall()]

    if not individual_records:
        raise HTTPException(
            status_code=404, 
            detail=f"No investments found for investor: {name}"
        )

    return {
        "commitments": individual_records,
        "assetsTotals": asset_class_totals,
        "totalAmount": sum(item["totalAmount"] for item in asset_class_totals)
    }
