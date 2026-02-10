from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
import joblib
import numpy as np
import shap
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants
MODEL_PATH = "xgboost_model.pkl"
FEATURE_NAMES = ['gender','height','weight','ap_hi','ap_lo',
                 'cholesterol','gluc','smoke','alco','active','age']
RISK_THRESHOLDS = {'low': 0.3, 'medium': 0.7}

# Load model 
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model not found: {MODEL_PATH}")

try:
    model = joblib.load(MODEL_PATH)
    explainer = shap.TreeExplainer(model)
except Exception as e:
    raise RuntimeError(f"Failed to load model: {e}")


# Schema input with validation
class HealthData(BaseModel):
    age: int        
    gender: str       
    height: int
    weight: float
    ap_hi: int
    ap_lo: int
    cholesterol: int
    gluc: int
    smoke: str
    alco: str
    active: str
    
    @field_validator('age')
    @classmethod
    def validate_age(cls, v):
        if not 30 <= v <= 65:
            raise ValueError('Age must be between 30 and 65 years')
        return v
    
    @field_validator('gender')
    @classmethod
    def validate_gender(cls, v):
        if v.lower() not in ['male', 'female']:
            raise ValueError('Gender must be "male" or "female"')
        return v.lower()
    
    @field_validator('height')
    @classmethod
    def validate_height(cls, v):
        if not 100 <= v <= 250:
            raise ValueError('Height must be between 100 and 250 cm')
        return v
    
    @field_validator('weight')
    @classmethod
    def validate_weight(cls, v):
        if not 30 <= v <= 200:
            raise ValueError('Weight must be between 30 and 200 kg')
        return v
    
    @field_validator('ap_hi')
    @classmethod
    def validate_systolic(cls, v):
        if not 50 <= v <= 250:
            raise ValueError('Systolic blood pressure must be between 50 and 250 mmHg')
        return v
    
    @field_validator('ap_lo')
    @classmethod
    def validate_diastolic(cls, v):
        if not 30 <= v <= 150:
            raise ValueError('Diastolic blood pressure must be between 30 and 150 mmHg')
        return v
    
    @field_validator('cholesterol')
    @classmethod
    def validate_cholesterol(cls, v):
        if v not in [1, 2, 3]:
            raise ValueError('Cholesterol must be 1 (normal), 2 (above normal), or 3 (well above normal)')
        return v
    
    @field_validator('gluc')
    @classmethod
    def validate_glucose(cls, v):
        if v not in [1, 2, 3]:
            raise ValueError('Glucose must be 1 (normal), 2 (above normal), or 3 (well above normal)')
        return v
    
    @field_validator('smoke')
    @classmethod
    def validate_smoke(cls, v):
        if v.lower() not in ['true', 'false']:
            raise ValueError('Smoke must be "true" or "false"')
        return v.lower()
    
    @field_validator('alco')
    @classmethod
    def validate_alco(cls, v):
        if v.lower() not in ['true', 'false']:
            raise ValueError('Alcohol must be "true" or "false"')
        return v.lower()
    
    @field_validator('active')
    @classmethod
    def validate_active(cls, v):
        if v.lower() not in ['true', 'false']:
            raise ValueError('Active must be "true" or "false"')
        return v.lower()


def get_risk_level(risk_score: float) -> str:
    """Determine risk level based on probability score"""
    if risk_score < RISK_THRESHOLDS['low']:
        return "low risk"
    elif risk_score < RISK_THRESHOLDS['medium']:
        return "medium risk"
    else:
        return "high risk"


def get_recommendation_for_feature(fname: str, val: float, shap_val: float) -> str:
    """Get specific recommendation for a feature"""
    if fname == "ap_hi":
        if shap_val > 0:
            return "Your systolic blood pressure is above the normal range. Reduce sodium intake, stay physically active and monitor your blood pressure regularly."
        else:
            return "Your systolic blood pressure is within a healthy range. Keep up your current habits and monitor it regularly."

    elif fname == "ap_lo":
        if shap_val > 0:
            return "Your diastolic blood pressure is elevated. Try stress-reducing activities, limit salt and exercise regularly."
        else:
            return "Your diastolic blood pressure is normal. Maintain a balanced diet and regular physical activity."

    elif fname == "cholesterol":
        if shap_val > 0:
            return "Your cholesterol level is high. Avoid fried and processed foods, eat more vegetables and monitor lipid levels regularly."
        else:
            return "Your cholesterol level is healthy. Continue eating balanced meals and stay active."

    elif fname == "gluc":
        if shap_val > 0:
            return "Your blood glucose level is high. Cut down on sugary foods, manage stress and monitor your blood sugar regularly."
        else:
            return "Your blood glucose level is normal. Maintain a balanced diet and regular exercise."

    elif fname == "smoke":
        if val == 1:
            return "Smoking increases cardiovascular risk. Seek support to quit smoking and improve heart health."
        else:
            return "Keep maintaining this healthy habit!"

    elif fname == "alco":
        if val == 1:
            return "You consume alcohol. Try to limit your intake to maintain healthy blood pressure and liver function."
        else:
            return "Keep maintaining this healthy lifestyle choice!"

    elif fname == "active":
        if val == 1:
            return "You are physically active. Continue regular exercise to support heart and overall health."
        else:
            return "You seem to have low physical activity. Try to do at least one hour running per day."

    elif fname == "weight":
        return "Maintain a healthy body weight through balanced nutrition and consistent physical activity."

    elif fname == "height":
        return "Height is a fixed factor. Focus on maintaining a healthy weight relative to your height."

    elif fname == "age":
        return "As age increases, heart risk may rise. Maintain a healthy lifestyle and get regular check-ups appropriate for your age."

    elif fname == "gender":
        return "Gender is a non-modifiable risk factor. Focus on controllable habits like diet, exercise and not smoking."
    
    return "Maintain a healthy lifestyle."


def generate_recommendations(top_idx, features, shap_values) -> list:
    """Generate health recommendations based on top SHAP factors"""
    recommendations = []
    
    for i in top_idx:
        fname = FEATURE_NAMES[i]
        val = features[0][i]
        shap_val = shap_values[0][i]
        
        rec = get_recommendation_for_feature(fname, val, shap_val)
        recommendations.append(rec)
    
    return recommendations


@app.post("/predict")
def predict_health(data: HealthData):
    try:
        # Convert input
        gender = 2 if data.gender == "male" else 1
        smoke = 1 if data.smoke == "true" else 0
        alco = 1 if data.alco == "true" else 0
        active = 1 if data.active == "true" else 0

        # Prepare features
        features = np.array([[
            gender,
            data.height,
            data.weight,
            data.ap_hi,
            data.ap_lo,
            data.cholesterol,
            data.gluc,
            smoke,
            alco,
            active,
            data.age
        ]])

        # Predict 
        prediction = int(model.predict(features)[0]) 
        risk_score = float(model.predict_proba(features)[0][1])
        risk_level = get_risk_level(risk_score)
        
        # SHAP explanation
        shap_values = explainer.shap_values(features)
        
        # Get top 3 factors
        top_idx = np.argsort(np.abs(shap_values[0]))[::-1][:3]
        top_factors = [
            {"feature": FEATURE_NAMES[i], "value": float(shap_values[0][i])} 
            for i in top_idx
        ]

        # Generate recommendations
        recommendations = generate_recommendations(top_idx, features, shap_values)

        return {
            "prediction": prediction,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "top_factors": top_factors,
            "recommendations": recommendations
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.get("/")
def read_root():
    return {"message": "CVD Prediction API is running"}
