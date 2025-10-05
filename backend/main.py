from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal, Report
from transformers import pipeline
import torch

app = FastAPI()

# --- CORS ---
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Schemas ---
class ReportInput(BaseModel):
    report: str

class TranslationInput(BaseModel):
    text: str
    language: str  # 'fr' for French, 'sw' for Swahili
    
class TranslationReport(BaseModel):
    report: dict  # {'drug': ..., 'severity': ..., 'adverse_events': [...], 'outcome': ...}
    language: str

# --- Load Models ---
print("Loading Hugging Face models...")

try:
    medical_ner = pipeline(
        "token-classification",
        model="d4data/biomedical-ner-all",
        aggregation_strategy="simple"
    )
    print("Biomedical NER model loaded")
except Exception as e:
    print(f"Error loading NER model: {e}")
    medical_ner = None

try:
    translator_fr = pipeline("translation_en_to_fr", model="Helsinki-NLP/opus-mt-en-fr")
    translator_sw = pipeline("translation_en_to_sw", model="Helsinki-NLP/opus-mt-en-sw")
    print("Translation models loaded")
except Exception as e:
    print(f"Error loading translators: {e}")
    translator_fr = None
    translator_sw = None

# --- DB Dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Root ---
@app.get("/")
def home():
    return {"message": "Mini Regulatory Report Assistant API is running"}

# --- Core Extraction Logic ---
import re

def extract_medical_info(text: str):
    if not medical_ner:
        return fallback_extraction(text)

    entities = medical_ner(text)
    drug_candidates = []
    adverse_events = []

    # --- NER Extraction ---
    for entity in entities:
        group = entity.get("entity_group", "")
        word = entity.get("word", "").strip()
        if group in ["DRUG", "CHEMICAL"]:
            drug_candidates.append(word)
        elif group in ["DISEASE", "SYMPTOM"]:
            adverse_events.append(word)

    # --- Fallback / Keyword Matching ---
    if not drug_candidates:
        drug_pattern = r"\b(Ibuprofen|Paracetamol|Aspirin|Metformin|Amoxicillin)\b"
        drug_candidates = re.findall(drug_pattern, text, re.IGNORECASE)

    drug = drug_candidates[0] if drug_candidates else None

    adverse_pattern = r"(?:severe|moderate|mild)? ?\b(headache|nausea|vomiting|pain|rash|fever|fatigue|dizziness|insomnia|diarrhea|constipation)\b"
    found_events = re.findall(adverse_pattern, text, re.IGNORECASE)
    adverse_events.extend(found_events)
    adverse_events = list(set([e.lower() for e in adverse_events]))  # deduplicate and normalize

    # --- Severity ---
    text_lower = text.lower()
    severity = None
    if any(w in text_lower for w in ["severe", "critical", "serious"]):
        severity = "severe"
    elif any(w in text_lower for w in ["moderate", "significant"]):
        severity = "moderate"
    elif any(w in text_lower for w in ["mild", "slight"]):
        severity = "mild"

    # --- Outcome ---
    outcome = None
    if any(w in text_lower for w in ["recovered", "improved", "resolved"]):
        outcome = "recovered"
    elif any(w in text_lower for w in ["ongoing", "continuing"]):
        outcome = "ongoing"
    elif any(w in text_lower for w in ["fatal", "death", "died"]):
        outcome = "fatal"

    return {
        "drug": drug,
        "adverse_events": adverse_events if adverse_events else None,
        "severity": severity,
        "outcome": outcome,
    }

# --- Fallback ---
def fallback_extraction(text: str):
    return {"drug": None, "adverse_events": None, "severity": None, "outcome": None}


# --- Endpoint ---
@app.post("/process-report")
def process_report(data: ReportInput, db: Session = Depends(get_db)):
    extracted = extract_medical_info(data.report)

    report = Report(
        drug=extracted["drug"],
        adverse_events=",".join(extracted["adverse_events"]) if extracted["adverse_events"] else None,
        severity=extracted["severity"],
        outcome=extracted["outcome"],
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return {
        "id": report.id,
        "drug": extracted["drug"],
        "adverse_events": extracted["adverse_events"],
        "severity": extracted["severity"],
        "outcome": extracted["outcome"]
    }


@app.post("/translate")
def translate_report(data: TranslationReport):
    report = data.report
    lang = data.language

    translator = None
    if lang == "fr":
        translator = translator_fr
    elif lang == "sw":
        translator = translator_sw
    else:
        raise HTTPException(status_code=400, detail="Unsupported language")

    translated_report = {}
    for key, value in report.items():
        if isinstance(value, list):
            # Join list for translation, then split back
            text = ", ".join(value)
            translated_text = translator(text, max_length=512)[0]["translation_text"]
            translated_report[key] = [t.strip() for t in translated_text.split(",")]
        elif isinstance(value, str):
            translated_report[key] = translator(value, max_length=512)[0]["translation_text"]
        else:
            translated_report[key] = value  # leave as-is

    return {"translated_report": translated_report}

@app.get("/reports")
def get_reports(db: Session = Depends(get_db)):
    reports = db.query(Report).all()
    return [
        {
            "id": r.id,
            "drug": r.drug,
            "adverse_events": r.adverse_events.split(",") if r.adverse_events else [],
            "severity": r.severity,
            "outcome": r.outcome,
        }
        for r in reports
    ]

# @app.get("/health")
# def health():
#     return {
#         "NER_loaded": medical_ner is not None,
#         "FR_translator": translator_fr is not None,
#         "SW_translator": translator_sw is not None,
#     }
