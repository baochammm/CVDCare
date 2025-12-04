from pyexpat import features
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import shap

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model trained XGBoost
model = joblib.load("xgboost_model.pkl")

# Schema input from frontend
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


@app.post("/predict")
def predict_health(data: HealthData):
    gender = 2 if data.gender.lower() == "male" else 1
    smoke = 1 if data.smoke.lower() == "true" else 0
    alco = 1 if data.alco.lower() == "true" else 0
    active = 1 if data.active.lower() == "true" else 0

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

    # Determine risk level
    if risk_score < 0.3:
        risk_level = "low risk"
    elif risk_score < 0.7:
        risk_level = "medium risk"
    else:
        risk_level = "high risk"
        
    # SHAP explanation
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(features) 
    feature_names = ['gender','height','weight','ap_hi','ap_lo','cholesterol',
                     'gluc','smoke','alco','active','age']
    
    # Get top 3 factors
    top_idx = np.argsort(np.abs(shap_values[0]))[::-1][:3]
    top_factors = [{"feature":feature_names[i], "value": float(shap_values[0][i])} for i in top_idx]

    # Generate specific recommendations
    recommendations = []
    for i in top_idx:
        fname = feature_names[i]
        val = features[0][i]
        shap_val = shap_values[0][i]

        # Specific recommendations based on feature and SHAP value
        if fname == "ap_hi":
            if shap_val > 0:
                rec = "Your systolic blood pressure is above the normal range. Reduce sodium intake, stay physically active and monitor your blood pressure regularly."
            else:
                rec = "Your systolic blood pressure is within a healthy range. Keep up your current habits and monitor it regularly."

        elif fname == "ap_lo":
            if shap_val > 0:
                rec = "Your diastolic blood pressure is elevated. Try stress-reducing activities, limit salt and exercise regularly."
            else:
                rec = "Your diastolic blood pressure is normal. Maintain a balanced diet and regular physical activity."

        elif fname == "cholesterol":
            if shap_val > 0:
                rec = "Your cholesterol level is high. Avoid fried and processed foods, eat more vegetables and monitor lipid levels regularly."
            else:
                rec = "Your cholesterol level is healthy. Continue eating balanced meals and stay active."

        elif fname == "gluc":
            if shap_val > 0:
                rec = "Your blood glucose level is high. Cut down on sugary foods, manage stress and monitor your blood sugar regularly."
            else:
                rec = "Your blood glucose level is normal. Maintain a balanced diet and regular exercise."

        elif fname == "smoke":
            if val == 1:
                rec = "Smoking increases cardiovascular risk. Seek support to quit smoking and improve heart health."
            else:
                rec = "Keep maintaining this healthy habit!"

        elif fname == "alco":
            if val == 1:
                rec = "You consume alcohol. Try to limit your intake to maintain healthy blood pressure and liver function."
            else:
                rec = "Keep maintaining this healthy lifestyle choice!"

        elif fname == "active":
            if val == 1:
                rec = "You are physically active. Continue regular exercise to support heart and overall health."
            else:
                rec = "You seem to have low physical activity. Try to do at least one hour running per day."

        elif fname == "weight":
            rec = "Maintain a healthy body weight through balanced nutrition and consistent physical activity."

        elif fname == "height":
            rec = "Height is a fixed factor. Focus on maintaining a healthy weight relative to your height."

        elif fname == "age":
            rec = "As age increases, heart risk may rise. Maintain a healthy lifestyle and get regular check-ups appropriate for your age."

        elif fname == "gender":
            rec = "Gender is a non-modifiable risk factor. Focus on controllable habits like diet, exercise and not smoking."

        recommendations.append(rec)

    return {
        "prediction": prediction,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "top_factors": top_factors,
        "recommendations": recommendations
    }