import pickle as pkl
import os
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Load Diabetes Model and Scaler
script_dir = os.path.dirname(os.path.abspath(__file__))
diabetes_scaler_path = os.path.join(script_dir, 'scaler_diabetes.pkl')
diabetes_model_path = os.path.join(script_dir, 'model_diabetes.pkl')
diabetes_scaler = pkl.load(open(diabetes_scaler_path, 'rb'))
diabetes_model = pkl.load(open(diabetes_model_path, 'rb'))

# Load Heart Disease Model
heart_model_path = os.path.join(script_dir, 'model_heart.pkl')
heart_model = joblib.load(heart_model_path)


liver_model_path = os.path.join(script_dir, 'model_liver_disease.pkl')  # Adjust path if needed
liver_model = joblib.load(liver_model_path)

brain_stroke_model_path = os.path.join(script_dir, 'brain_stroke_model.pkl')  # Adjust the filename as needed
brain_stroke_model = joblib.load(brain_stroke_model_path)


def predict_brain_stroke(age, avg_glucose_level, bmi, gender_Male, hypertension_1, heart_disease_1, 
                         smoking_status_formerly_smoked, smoking_status_never_smoked, smoking_status_smokes):
    input_data = pd.DataFrame([[age, avg_glucose_level, bmi, gender_Male, hypertension_1, heart_disease_1, 
                                smoking_status_formerly_smoked, smoking_status_never_smoked, smoking_status_smokes]])
    
    prediction = brain_stroke_model.predict(input_data)
    
    if prediction == 1:
        return {
            'prediction': "You have a high risk of Brain Stroke. Please consult a doctor."
        }
    else:
        return {
            'prediction': "You have a low risk of Brain Stroke. Keep maintaining a healthy lifestyle."
        }


def predict_liver_disease(age, gender, total_bilirubin, direct_bilirubin, alkaline_phosphatase,
                          alamin_aminotransferase, aspartate_aminotransferase, total_proteins,
                          albumin, albumin_and_globulin_ratio):
    
    # Prepare the input data as a dataframe (you can scale the data if needed)
    input_data = pd.DataFrame([[age, gender, total_bilirubin, direct_bilirubin, alkaline_phosphatase,
                                alamin_aminotransferase, aspartate_aminotransferase, total_proteins,
                                albumin, albumin_and_globulin_ratio]])
    
    # Scale data if you have a scaler (optional)
    # input_data = liver_scaler.transform(input_data)  # Uncomment if scaling is required
    
    # Make prediction
    prediction = liver_model.predict(input_data)
    
    # Map the prediction result to a response
    if prediction == 1:
        result = {
            'prediction': "You are at high risk of liver disease. Please consult a doctor.",
            'gif_url': "https://media.giphy.com/media/1d4suBcsBzBl93mT72/giphy.gif"
        }
    else:
        result = {
            'prediction': "You are at low risk of liver disease. Keep up with a healthy lifestyle!",
            'gif_url': "https://media.giphy.com/media/fpPt45skS9Jfe/giphy.gif"
        }
    
    return result

# Diabetes Prediction Function
def predict_diabetes(Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin, Bmi, Dpf, Age):
    input_data = pd.DataFrame([[Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin, Bmi, Dpf, Age]])
    input_data = diabetes_scaler.transform(input_data)
    prediction = diabetes_model.predict(input_data)
    
    if prediction == 1:
        result = {
            'prediction': "You have high chances of Diabetes! Please consult a Doctor",
            
        }
    else:
        result = {
            'prediction': "You have low chances of Diabetes. Please maintain a healthy lifestyle",
        }
    
    return result

# Heart Disease Prediction Function
def predict_heart_disease(age, chest_pain, blood_pressure, cholesterol, fasting_blood_sugar, ecg, max_heart_rate):
    input_data = [[age, chest_pain, blood_pressure, cholesterol, fasting_blood_sugar, ecg, max_heart_rate]]
    prediction = heart_model.predict(input_data)
    
    if prediction == 0:
        return {
            'prediction': "No , You Dont have a Chance of Heart Dieases"
        }
    else:
        return {
            'prediction': "Yes , You have a high Chance of Heart Dieases"
        }

# Diabetes Prediction Endpoint
@app.route('/predict_diabetes', methods=['POST'])
def predict_diabetes_endpoint():
    data = request.get_json()
    Age = data.get('Age')
    Pregnancies = data.get('Pregnancies')
    Glucose = data.get('Glucose')
    BloodPressure = data.get('BloodPressure')
    Insulin = data.get('Insulin')
    Bmi = data.get('BMI')
    SkinThickness = data.get('SkinThickness')
    Dpf = data.get('DPF')
    
    result = predict_diabetes(Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin, Bmi, Dpf, Age)
    return jsonify(result)

# Heart Disease Prediction Endpoint
@app.route('/predict_heart', methods=['POST'])
def predict_heart_endpoint():
    data = request.get_json()
    age = data.get('age')
    chest_pain = data.get('chest_pain')
    blood_pressure = data.get('blood_pressure')
    cholesterol = data.get('cholesterol')
    fasting_blood_sugar = data.get('fasting_blood_sugar')
    ecg = data.get('ecg')
    max_heart_rate = data.get('max_heart_rate')
    
    result = predict_heart_disease(age, chest_pain, blood_pressure, cholesterol, fasting_blood_sugar, ecg, max_heart_rate)
    return jsonify(result)

# Liver Disease Prediction Endpoint
@app.route('/predict_liver', methods=['POST'])
def predict_liver_endpoint():
    data = request.get_json()  # Get data from the incoming POST request
    
    # Extract input features for liver disease prediction
    age = data.get('age')
    gender = data.get('gender_Male')  # 1 for male, 0 for female
    total_bilirubin = data.get('total_bilirubin')
    direct_bilirubin = data.get('direct_bilirubin')
    alkaline_phosphatase = data.get('alkaline_phosphatase')
    alamin_aminotransferase = data.get('alamin_aminotransferase')
    aspartate_aminotransferase = data.get('aspartate_aminotransferase')
    total_proteins = data.get('total_proteins')
    albumin = data.get('albumin')
    albumin_and_globulin_ratio = data.get('albumin_and_globulin_ratio')
    
    # Get prediction result
    result = predict_liver_disease(age, gender, total_bilirubin, direct_bilirubin, alkaline_phosphatase,
                                   alamin_aminotransferase, aspartate_aminotransferase, total_proteins,
                                   albumin, albumin_and_globulin_ratio)
    
    # Return the result as a JSON response
    return jsonify(result)

@app.route('/predict_brain_stroke', methods=['POST'])
def predict_brain_stroke_endpoint():
    data = request.get_json()
    
    # Get the features from the request data
    age = data.get('age')
    avg_glucose_level = data.get('avg_glucose_level')
    bmi = data.get('bmi')
    gender_Male = data.get('gender_Male')  # 1 for Male, 0 for Female
    hypertension_1 = data.get('hypertension_1')  # 1 for Yes, 0 for No
    heart_disease_1 = data.get('heart_disease_1')  # 1 for Yes, 0 for No
    smoking_status_formerly_smoked = data.get('smoking_status_formerly_smoked')  # 1 for Yes, 0 for No
    smoking_status_never_smoked = data.get('smoking_status_never_smoked')  # 1 for Yes, 0 for No
    smoking_status_smokes = data.get('smoking_status_smokes')  # 1 for Yes, 0 for No
    
    result = predict_brain_stroke(age, avg_glucose_level, bmi, gender_Male, hypertension_1, heart_disease_1, 
                                  smoking_status_formerly_smoked, smoking_status_never_smoked, smoking_status_smokes)
    
    return jsonify(result)



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
