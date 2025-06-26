"""
Medical Prediction Service
Integrates machine learning models for symptom-based disease prediction.
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Tuple, Optional
import json
import os

class SymptomPredictor:
    """
    A class for predicting diseases based on symptoms using machine learning.
    """
    
    def __init__(self, data_path: str = None):
        """
        Initialize the predictor with disease data.
        
        Args:
            data_path (str): Path to the disease data CSV file
        """
        self.data_path = data_path or "/home/project/data/full_onehot_disease.csv"
        self.symptoms_data_path = "/home/project/data/symptoms_data.json"
        
        # Load data
        self.disease_data = None
        self.symptoms_list = []
        self.disease_list = []
        
        self._load_data()
    
    def _load_data(self):
        """Load disease data and symptoms list."""
        try:
            # Load disease data
            if os.path.exists(self.data_path):
                self.disease_data = pd.read_csv(self.data_path)
                self.disease_list = self.disease_data['Disease'].unique().tolist()
                print(f"Loaded {len(self.disease_list)} diseases from dataset")
            else:
                print(f"Warning: Disease data file not found at {self.data_path}")
                self._create_fallback_data()
            
            # Load symptoms list
            if os.path.exists(self.symptoms_data_path):
                with open(self.symptoms_data_path, 'r') as f:
                    symptoms_data = json.load(f)
                    self.symptoms_list = symptoms_data.get('symptoms', [])
                print(f"Loaded {len(self.symptoms_list)} symptoms")
            else:
                print(f"Warning: Symptoms data file not found at {self.symptoms_data_path}")
                self._create_fallback_symptoms()
                
        except Exception as e:
            print(f"Error loading data: {e}")
            self._create_fallback_data()
    
    def _create_fallback_data(self):
        """Create fallback data if files are not available."""
        # Basic disease list
        self.disease_list = [
            "Common Cold", "Flu", "Migraine", "Hypertension", "Diabetes",
            "Gastroenteritis", "Allergic Reaction", "Bronchial Asthma",
            "Urinary Tract Infection", "Skin Infection"
        ]
        
        # Basic symptoms list
        self.symptoms_list = [
            "fever", "headache", "cough", "fatigue", "nausea", "vomiting",
            "diarrhea", "abdominal_pain", "chest_pain", "shortness_of_breath",
            "dizziness", "muscle_pain", "joint_pain", "skin_rash", "itching"
        ]
        
        print("Using fallback data due to missing files")
    
    def _create_fallback_symptoms(self):
        """Create fallback symptoms list."""
        self.symptoms_list = [
            "fever", "headache", "cough", "fatigue", "nausea", "vomiting",
            "diarrhea", "abdominal_pain", "chest_pain", "shortness_of_breath",
            "dizziness", "muscle_pain", "joint_pain", "skin_rash", "itching",
            "runny_nose", "sore_throat", "sneezing", "body_aches", "chills"
        ]
    
    def normalize_symptom(self, symptom: str) -> str:
        """
        Normalize symptom names to match dataset format.
        
        Args:
            symptom (str): Raw symptom name
            
        Returns:
            str: Normalized symptom name
        """
        # Convert to lowercase and replace spaces with underscores
        normalized = symptom.lower().strip()
        normalized = normalized.replace(' ', '_')
        normalized = normalized.replace('-', '_')
        
        # Handle common variations
        symptom_mappings = {
            'runny_nose': 'runny_nose',
            'stuffy_nose': 'congestion',
            'blocked_nose': 'congestion',
            'stomach_ache': 'stomach_pain',
            'belly_pain': 'abdominal_pain',
            'difficulty_breathing': 'breathlessness',
            'shortness_of_breath': 'breathlessness',
            'high_temperature': 'high_fever',
            'temperature': 'fever',
            'tiredness': 'fatigue',
            'exhaustion': 'fatigue',
            'throwing_up': 'vomiting',
            'loose_stools': 'diarrhoea',
            'loose_motions': 'diarrhoea',
            'head_pain': 'headache',
            'migraine': 'headache',
            'back_ache': 'back_pain',
            'neck_ache': 'neck_pain',
            'joint_ache': 'joint_pain',
            'muscle_ache': 'muscle_pain',
            'body_pain': 'muscle_pain',
            'skin_irritation': 'skin_rash',
            'rash': 'skin_rash',
            'scratching': 'itching',
            'burning_sensation': 'burning_micturition'
        }
        
        return symptom_mappings.get(normalized, normalized)
    
    def find_matching_symptoms(self, input_symptoms: List[str]) -> List[str]:
        """
        Find symptoms from input that match the dataset.
        
        Args:
            input_symptoms (List[str]): List of input symptoms
            
        Returns:
            List[str]: List of matching symptoms
        """
        matching_symptoms = []
        
        for symptom in input_symptoms:
            normalized = self.normalize_symptom(symptom)
            
            # Direct match
            if normalized in self.symptoms_list:
                matching_symptoms.append(normalized)
                continue
            
            # Fuzzy matching - find similar symptoms
            for dataset_symptom in self.symptoms_list:
                if (normalized in dataset_symptom or 
                    dataset_symptom in normalized or
                    self._calculate_similarity(normalized, dataset_symptom) > 0.8):
                    matching_symptoms.append(dataset_symptom)
                    break
        
        return list(set(matching_symptoms))  # Remove duplicates
    
    def _calculate_similarity(self, str1: str, str2: str) -> float:
        """
        Calculate similarity between two strings using simple character overlap.
        
        Args:
            str1 (str): First string
            str2 (str): Second string
            
        Returns:
            float: Similarity score between 0 and 1
        """
        if not str1 or not str2:
            return 0.0
        
        # Simple character-based similarity
        set1 = set(str1.lower())
        set2 = set(str2.lower())
        
        intersection = len(set1.intersection(set2))
        union = len(set1.union(set2))
        
        return intersection / union if union > 0 else 0.0
    
    def predict_diseases(self, symptoms: List[str], top_n: int = 5) -> List[Dict]:
        """
        Predict diseases based on input symptoms.
        
        Args:
            symptoms (List[str]): List of symptoms
            top_n (int): Number of top predictions to return
            
        Returns:
            List[Dict]: List of disease predictions with probabilities
        """
        if not symptoms:
            return []
        
        # Find matching symptoms
        matching_symptoms = self.find_matching_symptoms(symptoms)
        
        if not matching_symptoms:
            return self._get_fallback_predictions(symptoms)
        
        # If we have disease data, use it for prediction
        if self.disease_data is not None:
            return self._predict_with_data(matching_symptoms, top_n)
        else:
            return self._predict_with_rules(matching_symptoms, top_n)
    
    def _predict_with_data(self, symptoms: List[str], top_n: int) -> List[Dict]:
        """
        Predict diseases using the loaded dataset.
        
        Args:
            symptoms (List[str]): List of matching symptoms
            top_n (int): Number of predictions to return
            
        Returns:
            List[Dict]: Disease predictions
        """
        predictions = []
        
        try:
            # Get symptom columns (excluding 'Disease' column)
            symptom_columns = [col for col in self.disease_data.columns if col != 'Disease']
            
            for _, row in self.disease_data.iterrows():
                disease = row['Disease']
                disease_symptoms = []
                
                # Extract symptoms for this disease
                for col in symptom_columns:
                    if row[col] != '0' and row[col] != 0:
                        disease_symptoms.append(row[col])
                
                # Calculate match score
                matching_count = len(set(symptoms).intersection(set(disease_symptoms)))
                total_input_symptoms = len(symptoms)
                total_disease_symptoms = len(disease_symptoms)
                
                if matching_count > 0:
                    # Calculate probability based on symptom overlap
                    precision = matching_count / total_input_symptoms if total_input_symptoms > 0 else 0
                    recall = matching_count / total_disease_symptoms if total_disease_symptoms > 0 else 0
                    
                    # F1-score as probability
                    probability = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
                    probability = min(probability * 100, 95)  # Cap at 95%
                    
                    if probability > 10:  # Only include if probability > 10%
                        predictions.append({
                            'disease': disease,
                            'probability': round(probability, 1),
                            'matching_symptoms': list(set(symptoms).intersection(set(disease_symptoms))),
                            'confidence': min(matching_count * 20, 90)
                        })
            
            # Sort by probability and return top N
            predictions.sort(key=lambda x: x['probability'], reverse=True)
            return predictions[:top_n]
            
        except Exception as e:
            print(f"Error in data-based prediction: {e}")
            return self._predict_with_rules(symptoms, top_n)
    
    def _predict_with_rules(self, symptoms: List[str], top_n: int) -> List[Dict]:
        """
        Predict diseases using rule-based approach.
        
        Args:
            symptoms (List[str]): List of symptoms
            top_n (int): Number of predictions to return
            
        Returns:
            List[Dict]: Disease predictions
        """
        # Rule-based disease prediction
        disease_rules = {
            "Common Cold": {
                "symptoms": ["runny_nose", "congestion", "sneezing", "cough", "mild_fever", "sore_throat"],
                "base_probability": 70
            },
            "Flu": {
                "symptoms": ["high_fever", "muscle_pain", "fatigue", "headache", "cough", "chills"],
                "base_probability": 65
            },
            "Migraine": {
                "symptoms": ["headache", "nausea", "vomiting", "visual_disturbances", "sensitivity_to_light"],
                "base_probability": 80
            },
            "Gastroenteritis": {
                "symptoms": ["nausea", "vomiting", "diarrhoea", "abdominal_pain", "fever"],
                "base_probability": 75
            },
            "Allergic Reaction": {
                "symptoms": ["skin_rash", "itching", "sneezing", "watering_from_eyes", "swelling"],
                "base_probability": 70
            },
            "Hypertension": {
                "symptoms": ["headache", "dizziness", "chest_pain", "shortness_of_breath"],
                "base_probability": 60
            },
            "Urinary Tract Infection": {
                "symptoms": ["burning_micturition", "frequent_urination", "abdominal_pain", "fever"],
                "base_probability": 85
            }
        }
        
        predictions = []
        
        for disease, rule in disease_rules.items():
            matching_symptoms = set(symptoms).intersection(set(rule["symptoms"]))
            match_ratio = len(matching_symptoms) / len(rule["symptoms"])
            
            if len(matching_symptoms) > 0:
                probability = rule["base_probability"] * match_ratio
                probability = min(probability, 90)  # Cap at 90%
                
                if probability > 15:  # Only include if probability > 15%
                    predictions.append({
                        'disease': disease,
                        'probability': round(probability, 1),
                        'matching_symptoms': list(matching_symptoms),
                        'confidence': min(len(matching_symptoms) * 25, 85)
                    })
        
        # Sort by probability and return top N
        predictions.sort(key=lambda x: x['probability'], reverse=True)
        return predictions[:top_n]
    
    def _get_fallback_predictions(self, symptoms: List[str]) -> List[Dict]:
        """
        Get fallback predictions when no symptoms match.
        
        Args:
            symptoms (List[str]): Original symptoms list
            
        Returns:
            List[Dict]: Fallback predictions
        """
        return [{
            'disease': 'General Consultation Recommended',
            'probability': 50.0,
            'matching_symptoms': symptoms,
            'confidence': 30,
            'note': 'Symptoms do not match common patterns. Professional medical consultation recommended.'
        }]
    
    def get_disease_info(self, disease_name: str) -> Dict:
        """
        Get detailed information about a specific disease.
        
        Args:
            disease_name (str): Name of the disease
            
        Returns:
            Dict: Disease information
        """
        # Basic disease information (can be expanded with a proper database)
        disease_info = {
            "Common Cold": {
                "description": "A viral infection of the upper respiratory tract",
                "severity": "Low",
                "typical_duration": "7-10 days",
                "treatment": "Rest, fluids, over-the-counter medications for symptom relief"
            },
            "Flu": {
                "description": "A viral infection that attacks the respiratory system",
                "severity": "Medium",
                "typical_duration": "1-2 weeks",
                "treatment": "Rest, fluids, antiviral medications if started early"
            },
            "Migraine": {
                "description": "A neurological condition characterized by severe headaches",
                "severity": "Medium",
                "typical_duration": "4-72 hours per episode",
                "treatment": "Pain medications, preventive medications, lifestyle changes"
            }
        }
        
        return disease_info.get(disease_name, {
            "description": "Information not available",
            "severity": "Unknown",
            "typical_duration": "Varies",
            "treatment": "Consult healthcare provider"
        })
    
    def get_recommendations(self, predictions: List[Dict]) -> Dict:
        """
        Get recommendations based on disease predictions.
        
        Args:
            predictions (List[Dict]): Disease predictions
            
        Returns:
            Dict: Recommendations
        """
        if not predictions:
            return {
                "urgency": "Medium",
                "recommendations": ["Consult with a healthcare provider for proper evaluation"],
                "self_care": ["Monitor symptoms", "Rest and stay hydrated"],
                "warning_signs": ["Worsening symptoms", "High fever", "Difficulty breathing"]
            }
        
        top_prediction = predictions[0]
        probability = top_prediction['probability']
        
        # Determine urgency based on probability and disease type
        urgency = "Low"
        if probability > 70:
            urgency = "Medium"
        if probability > 85:
            urgency = "High"
        
        # Check for high-risk symptoms
        high_risk_symptoms = [
            "chest_pain", "difficulty_breathing", "severe_headache", 
            "high_fever", "severe_abdominal_pain"
        ]
        
        if any(symptom in str(top_prediction.get('matching_symptoms', [])) for symptom in high_risk_symptoms):
            urgency = "High"
        
        recommendations = {
            "urgency": urgency,
            "recommendations": [],
            "self_care": [],
            "warning_signs": []
        }
        
        if urgency == "High":
            recommendations["recommendations"] = [
                "Seek immediate medical attention",
                "Consider visiting emergency room if symptoms are severe",
                "Do not delay medical care"
            ]
        elif urgency == "Medium":
            recommendations["recommendations"] = [
                "Schedule appointment with healthcare provider within 24-48 hours",
                "Monitor symptoms closely",
                "Seek immediate care if symptoms worsen"
            ]
        else:
            recommendations["recommendations"] = [
                "Consider consulting healthcare provider if symptoms persist",
                "Monitor symptoms for changes",
                "Practice self-care measures"
            ]
        
        # General self-care recommendations
        recommendations["self_care"] = [
            "Get adequate rest",
            "Stay well hydrated",
            "Eat nutritious foods",
            "Avoid strenuous activities"
        ]
        
        # Warning signs
        recommendations["warning_signs"] = [
            "Symptoms worsen significantly",
            "Development of high fever (>101.3°F/38.5°C)",
            "Difficulty breathing or chest pain",
            "Severe or persistent vomiting",
            "Signs of dehydration"
        ]
        
        return recommendations

# Example usage and testing
if __name__ == "__main__":
    # Initialize predictor
    predictor = SymptomPredictor()
    
    # Test with sample symptoms
    test_symptoms = ["fever", "headache", "muscle pain", "fatigue"]
    
    print("Testing Symptom Predictor...")
    print(f"Input symptoms: {test_symptoms}")
    
    # Get predictions
    predictions = predictor.predict_diseases(test_symptoms)
    
    print("\nPredictions:")
    for pred in predictions:
        print(f"- {pred['disease']}: {pred['probability']}% (confidence: {pred['confidence']}%)")
        print(f"  Matching symptoms: {pred['matching_symptoms']}")
    
    # Get recommendations
    recommendations = predictor.get_recommendations(predictions)
    print(f"\nRecommendations:")
    print(f"Urgency: {recommendations['urgency']}")
    print(f"Actions: {recommendations['recommendations']}")