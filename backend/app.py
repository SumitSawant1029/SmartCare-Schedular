from flask import Flask, request, jsonify
import pickle
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import pandas as pd
import os

app = Flask(__name__)

# Load the model
model_path = "model.pkl"

if os.path.exists(model_path):
    with open(model_path, "rb") as file:
        model = pickle.load(file)
    print("✅ Model loaded successfully!")
else:
    print("❌ Model file not found! Please train and save the model first.")
    exit()

# Load dataset to fit the scaler
dataset = pd.read_csv("diabetes.csv")
dataset_X = dataset.iloc[:, [1, 4, 5, 7]].values  # Selecting features (Glucose, Insulin, BMI, Age)

# Fit the scaler with dataset
scaler = MinMaxScaler(feature_range=(0, 1))
scaler.fit(dataset_X)

@app.route("/", methods=["GET"])
def home():
    return "Diabetes Prediction API is running!"

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        glucose = float(data["Glucose"])
        insulin = float(data["Insulin"])
        bmi = float(data["BMI"])
        age = float(data["Age"])

        # Prepare input data
        input_data = np.array([[glucose, insulin, bmi, age]])
        input_scaled = scaler.transform(input_data)  # Scale input features

        # Predict using the trained model
        prediction = model.predict(input_scaled)[0]

        # Return result
        result = {
            "Glucose": glucose,
            "Insulin": insulin,
            "BMI": bmi,
            "Age": age,
            "Diabetes_Prediction": "Positive" if prediction == 1 else "Negative"
        }
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    app.run(debug=True)
