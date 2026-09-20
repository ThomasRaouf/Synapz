import os
import json
from google import genai
from models.summary import SummaryResponse
from dotenv import load_dotenv
load_dotenv()

GEMINI_MODEL = "gemini-2.5-flash"

def generate_summary(text: str) -> dict:
    """
    Generates a structured summary from the provided educational text.
    Abstracts away the AI provider. If no API key is set, returns mock data for development.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not (api_key):
        print("WARNING: GEMINI_API_KEY not found. Using development fallback data.")
        return _get_mock_summary(text)

    try:
        client = genai.Client(api_key=api_key)
        prompt = f"""
You are an expert educational tutor. Your task is to analyze the provided educational material and generate a structured summary.
CRITICAL INSTRUCTION:
1. Use ONLY the supplied material as the primary source. Do not invent unrelated material.
2. Preserve all important technical facts and terminology.
3. Identify the major concepts.
4. Explain difficult concepts clearly.
5. Organize the information logically for studying, not merely shortening the text.
6. Return the response in the exact JSON format specified by the schema.

EDUCATIONAL MATERIAL TO SUMMARIZE:
{text}
"""
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": SummaryResponse,
            }
        )

        try:
            return json.loads(response.text)
        except: json.JSONDecodeError:
            raise Exception("AI response was not valid JSON.")
    
    except Exception as e:
        print(f"Error calling AI service {e}")
        raise

def _get_mock_summary(text: str) -> dict:
    """Provides a fallback mock summary when the AI is not configured."""
    return {
        "title": "Mock Summary: Cellular Respiration",
        "overview": "This is a development fallback summary since no AI API key is configured. Cellular respiration is a set of metabolic reactions and processes that take place in the cells of organisms to convert biochemical energy from nutrients into adenosene triphosphate (ATP), and then release waste products.",
        "key_concepts": [
            "Glycolysis: The first step, occuring in the cytoplasm.",
            "Krebs Cycle: Also known as the Citric Acid Cycle, take place in the mitochondria.",
            "Electron Transport Chain: The final stage the produces most ATP."
        ],
        "definitions": [
            {
                "term": "ATP",
                "definition": "Adenosine Triphosphate, the primary energy currency of the cell."
                
            },
            {
                "term": "Mitochondria",
                "definition": "The powerhouse of the cell, where most ATP is generated."
            }
        ],
        "quick_review": [
            "What is the main goal of cellular respiration? (To produce ATP)",
            "Where does the Krebs Cycle occur? (In the mitochondria)"
        ]
    }