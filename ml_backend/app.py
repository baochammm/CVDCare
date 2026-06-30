import traceback
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
import joblib
import numpy as np
import shap
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS configuration để cho phép frontend truy cập API từ domain được chỉ định trong .env
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants
MODEL_PATH = "decision_tree_model.pkl"
CLIP_BOUNDS_PATH = "clip_bounds.pkl"

FEATURE_NAMES = [
    'gender', 'cholesterol', 'gluc', 'smoke', 'alco', 'active',
    'age_years', 'bmi', 'map', 'pulse_pressure',
    'lifestyle_risk', 'cholesterol_gluc_interaction', 'hypertension_stage'
]

# Mapping tên feature sang tên hiển thị thân thiện hơn cho user
FEATURE_DISPLAY_NAME = {
    'age_years': 'Age',
    'bmi': 'Body Mass Index (BMI)',
    'map': 'Mean Arterial Pressure',
    'pulse_pressure': 'Pulse Pressure',
    'lifestyle_risk': 'Lifestyle Risk Score',
    'hypertension_stage': 'Hypertension Stage',
    'cholesterol_gluc_interaction': 'Cholesterol & Glucose Interaction',
    'gender': 'Gender',
    'cholesterol': 'Cholesterol Level',
    'gluc': 'Blood Glucose Level',
    'smoke': 'Smoking',
    'alco': 'Alcohol Consumption',
    'active': 'Physical Activity',
}

RISK_THRESHOLDS = {'low': 0.3, 'medium': 0.7}

# Load model và clip bounds
for path in [MODEL_PATH, CLIP_BOUNDS_PATH]:
    if not os.path.exists(path):
        raise FileNotFoundError(f"File not found: {path}")

try:
    model = joblib.load(MODEL_PATH)
    clip_bounds = joblib.load(CLIP_BOUNDS_PATH)
    # Initialize SHAP explanation với TreeExplainer (vì dùng Decision Tree)
    explainer = shap.TreeExplainer(model)
except Exception as e:
    raise RuntimeError(f"Failed to load model or clip bounds: {e}")


# Schema input với validation
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

    # Validators cho từng field để đảm bảo dữ liệu đầu vào hợp lệ và trong phạm vi mong đợi
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
        if not 55 <= v <= 250:
            raise ValueError('Height must be between 55 and 250 cm')
        return v

    @field_validator('weight')
    @classmethod
    def validate_weight(cls, v):
        if not 10 <= v <= 200:
            raise ValueError('Weight must be between 10 and 200 kg')
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


def get_hypertension_stage(ap_hi: int, ap_lo: int) -> int:
    if ap_hi >= 180 or ap_lo >= 120:
        return 4  # Crisis
    elif ap_hi >= 140 or ap_lo >= 90:
        return 3  # Stage 2
    elif ap_hi >= 130 or ap_lo >= 80:
        return 2  # Stage 1
    elif ap_hi >= 120 and ap_lo < 80:
        return 1  # Elevated
    else:
        return 0  # Normal

# Dựa trên clip bounds đã tính toán từ training data, áp dụng clipping cho các feature numerical để tránh outliers ảnh hưởng đến prediction
def apply_clip_bounds(features_dict: dict) -> dict:
    """Apply IQR clip bounds to numerical features"""
    clipped = features_dict.copy()
    for fname, bounds in clip_bounds.items():
        if fname in clipped:
            clipped[fname] = np.clip(clipped[fname], bounds['min'], bounds['max'])
    return clipped

# Dựa trên risk score, phân loại thành low, medium, high risk để dễ hiểu cho người dùng
def get_risk_level(risk_score: float) -> str:
    if risk_score < RISK_THRESHOLDS['low']:
        return "low risk"
    elif risk_score < RISK_THRESHOLDS['medium']:
        return "medium risk"
    else:
        return "high risk"

# Dựa trên tên feature, giá trị của feature và SHAP value, đưa ra khuyến nghị cụ thể cho người dùng
def get_recommendation_for_feature(fname: str, val: float, shap_val: float) -> str:
    if fname == "map":
        if shap_val > 0:
            return "Your mean arterial pressure is elevated. Reduce sodium intake, stay physically active and monitor your blood pressure regularly."
        else:
            return "Your mean arterial pressure is within a healthy range. Keep up your current habits and monitor regularly."

    elif fname == "pulse_pressure":
        if shap_val > 0:
            return "Your pulse pressure is elevated, which may indicate arterial stiffness. Maintain a healthy diet, exercise regularly and consult a healthcare provider."
        else:
            return "Your pulse pressure is within a normal range. Continue maintaining your healthy lifestyle."

    elif fname == "bmi":
        if shap_val > 0:
            return "Your BMI suggests you may be overweight. Maintain a healthy body weight through balanced nutrition and consistent physical activity."
        else:
            return "Your BMI is within a healthy range. Continue maintaining a balanced diet and regular exercise."

    elif fname == "hypertension_stage":
        if shap_val > 0:
            return "Your blood pressure classification indicates elevated cardiovascular risk. Consult a healthcare provider for proper management."
        else:
            return "Your blood pressure classification is normal. Keep maintaining your healthy lifestyle."

    elif fname == "cholesterol" or fname == "cholesterol_gluc_interaction":
        if shap_val > 0:
            return "Your cholesterol level is high. Avoid fried and processed foods, eat more vegetables and monitor lipid levels regularly."
        else:
            return "Your cholesterol level is healthy. Continue eating balanced meals and stay active."

    elif fname == "gluc":
        if shap_val > 0:
            return "Your blood glucose level is high. Cut down on sugary foods, manage stress and monitor your blood sugar regularly."
        else:
            return "Your blood glucose level is normal. Maintain a balanced diet and regular exercise."

    elif fname == "lifestyle_risk":
        if shap_val > 0:
            return "Your lifestyle risk score is elevated. Consider reducing smoking, alcohol consumption and increasing physical activity."
        else:
            return "Your lifestyle habits are contributing positively to your health. Keep it up!"

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
            return "You seem to have low physical activity. Try to do at least 30 minutes of moderate exercise per day."

    elif fname == "age_years":
        return "As age increases, heart risk may rise. Maintain a healthy lifestyle and get regular check-ups appropriate for your age."

    elif fname == "gender":
        return "Gender is a non-modifiable risk factor. Focus on controllable habits like diet, exercise and not smoking."

    return "Maintain a healthy lifestyle."


def generate_recommendations(top_idx, features, shap_values) -> list:
    recommendations = []
    for i in top_idx:
        fname = FEATURE_NAMES[int(i)]
        val = features[0][int(i)]
        shap_val = shap_values[int(i)]
        rec = get_recommendation_for_feature(fname, val, shap_val)
        recommendations.append(rec)
    return recommendations


@app.post("/predict")
def predict_health(data: HealthData):
    try:
        # Convert input
        gender = 0 if data.gender == "female" else 1
        smoke = 1 if data.smoke == "true" else 0
        alco = 1 if data.alco == "true" else 0
        active = 1 if data.active == "true" else 0

        # Feature engineering
        age_years = data.age
        bmi = data.weight / ((data.height / 100) ** 2)
        map_val = (data.ap_hi + 2 * data.ap_lo) / 3
        pulse_pressure = data.ap_hi - data.ap_lo
        lifestyle_risk = smoke + alco + (1 - active)
        cholesterol_gluc_interaction = data.cholesterol * data.gluc
        hypertension_stage = get_hypertension_stage(data.ap_hi, data.ap_lo)

        # Build feature dict for clipping
        features_dict = {
            'age_years': age_years,
            'bmi': bmi,
            'map': map_val,
            'pulse_pressure': pulse_pressure,
        }

        # Apply IQR clipping
        clipped = apply_clip_bounds(features_dict)

        # Prepare final feature array in correct order
        features = pd.DataFrame([[
            gender,
            data.cholesterol,
            data.gluc,
            smoke,
            alco,
            active,
            clipped['age_years'],
            clipped['bmi'],
            clipped['map'],
            clipped['pulse_pressure'],
            lifestyle_risk,
            cholesterol_gluc_interaction,
            hypertension_stage
        ]], columns=FEATURE_NAMES)

        # Predict
        prediction = int(model.predict(features)[0]) # 0 or 1 - 0: no CVD, 1: have CVD
        risk_score = float(model.predict_proba(features)[0][1]) # Probability of class "have CVD disease"
        risk_level = get_risk_level(risk_score) # low, medium, high risk based on thresholds

        # SHAP explanation - tính shap values cho từng feature để tìm ra yếu tố ảnh hưởng nhất đến prediction
        shap_values = explainer.shap_values(features)
        shap_arr = shap_values[0, :, 1] # Lấy shap values cho class "have CVD disease" (index 1)

        # Lấy top 3 yếu tố ảnh hưởng nhất dựa trên giá trị tuyệt đối của SHAP values
        top_idx = np.argsort(np.abs(shap_arr))[::-1][:3]
        top_factors = [
            {
                "feature": FEATURE_DISPLAY_NAME[FEATURE_NAMES[int(i)]],
                "value": float(shap_arr[i])
            }
            for i in top_idx
        ]

        # Generate recommendations
        recommendations = generate_recommendations(top_idx, features.values, shap_arr)

        return {
            "prediction": prediction,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "top_factors": top_factors,
            "recommendations": recommendations
        }

    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.get("/")
def read_root():
    return {"message": "CVD Prediction API is running"}