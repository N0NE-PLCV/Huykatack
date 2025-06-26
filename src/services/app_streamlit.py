"""
Streamlit App Integration Module
Provides functions to integrate with the existing React application.
This module adapts the Streamlit functionality for use in the React frontend.
"""

import json
from typing import Dict, List, Optional, Any
from .predict import SymptomPredictor
from .skin_model_predict import SkinConditionPredictor
from .health_prompt_template import (
    get_symptom_analysis_prompt,
    get_image_analysis_prompt,
    get_emergency_assessment_prompt
)

class HealthcareAnalyzer:
    """
    Main healthcare analysis class that integrates all prediction models.
    """
    
    def __init__(self):
        """Initialize the healthcare analyzer with all prediction models."""
        self.symptom_predictor = SymptomPredictor()
        self.skin_predictor = SkinConditionPredictor()
        
    def analyze_symptoms(self, symptoms: List[str], patient_info: Optional[Dict] = None) -> Dict:
        """
        Analyze symptoms and provide medical insights.
        
        Args:
            symptoms (List[str]): List of symptoms
            patient_info (Optional[Dict]): Patient information
            
        Returns:
            Dict: Analysis results with conditions and recommendations
        """
        try:
            # Get disease predictions
            predictions = self.symptom_predictor.predict_diseases(symptoms, top_n=5)
            
            # Get recommendations
            recommendations = self.symptom_predictor.get_recommendations(predictions)
            
            # Generate AI prompt for additional insights
            prompt = get_symptom_analysis_prompt(symptoms, patient_info)
            
            # Apply content restrictions
            filtered_prompt = self._apply_content_restrictions(prompt)
            
            # Format results for frontend
            result = {
                "success": True,
                "analysis_id": f"symptom_analysis_{hash(''.join(symptoms))}",
                "conditions": [],
                "recommendations": self._filter_recommendations(recommendations),
                "prompt_generated": filtered_prompt,
                "confidence": 0,
                "timestamp": self._get_timestamp()
            }
            
            # Process predictions
            total_confidence = 0
            for pred in predictions:
                condition = {
                    "name": pred["disease"],
                    "probability": pred["probability"],
                    "description": self._get_condition_description(pred["disease"]),
                    "severity": self._map_urgency_to_severity(recommendations["urgency"]),
                    "recommendations": self._filter_medical_recommendations(recommendations["recommendations"])
                }
                result["conditions"].append(condition)
                total_confidence += pred["probability"]
            
            # Calculate overall confidence
            result["confidence"] = min(total_confidence / len(predictions) if predictions else 0, 95)
            
            return result
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Error analyzing symptoms: {str(e)}",
                "analysis_id": None,
                "conditions": [],
                "recommendations": {},
                "confidence": 0,
                "timestamp": self._get_timestamp()
            }
    
    def analyze_medical_images(self, images_data: List[Dict], image_type: str = "skin") -> Dict:
        """
        Analyze medical images and provide diagnostic insights.
        
        Args:
            images_data (List[Dict]): List of image data with descriptions
            image_type (str): Type of medical images
            
        Returns:
            Dict: Analysis results with conditions and recommendations
        """
        try:
            results = []
            
            for i, image_data in enumerate(images_data):
                # Extract image description or use placeholder
                description = image_data.get("description", "Medical image for analysis")
                location = image_data.get("location", "")
                base64_data = image_data.get("base64", "")
                
                if image_type == "skin":
                    # Use skin condition predictor with CNN model
                    predictions = self.skin_predictor.analyze_image_description(description, location)
                    
                    # If we have base64 image data, use CNN model for additional analysis
                    if base64_data:
                        cnn_predictions = self.skin_predictor.predict_with_cnn_model(base64_data)
                        # Combine traditional and CNN predictions
                        predictions = self._combine_predictions(predictions, cnn_predictions)
                    
                    recommendations = self.skin_predictor.get_recommendations(predictions)
                    
                    # Perform ABCD analysis if relevant
                    abcd_analysis = None
                    if any("mole" in pred["condition"].lower() for pred in predictions):
                        abcd_analysis = self.skin_predictor.get_abcd_analysis(description)
                    
                    image_result = {
                        "imageId": f"img_{i}",
                        "conditions": [],
                        "abcd_analysis": abcd_analysis,
                        "recommendations": self._filter_medical_recommendations(recommendations.get("immediate_actions", []))
                    }
                    
                    # Process skin predictions
                    for pred in predictions:
                        condition = {
                            "name": pred["condition"],
                            "probability": pred["confidence"],
                            "confidence": pred["confidence"],
                            "description": pred["description"],
                            "severity": pred["severity"],
                            "recommendations": self._filter_medical_recommendations(pred.get("treatment_options", []))
                        }
                        image_result["conditions"].append(condition)
                    
                    results.append(image_result)
                else:
                    # Generic medical image analysis
                    image_result = {
                        "imageId": f"img_{i}",
                        "conditions": [{
                            "name": "General Medical Consultation Recommended",
                            "probability": 50.0,
                            "confidence": 60.0,
                            "description": "Professional medical evaluation recommended for this type of image.",
                            "severity": "medium",
                            "recommendations": ["Consult with appropriate medical specialist"]
                        }]
                    }
                    results.append(image_result)
            
            # Generate overall analysis
            analysis_result = {
                "success": True,
                "analysis_id": f"image_analysis_{hash(str(images_data))}",
                "results": results,
                "timestamp": self._get_timestamp(),
                "image_type": image_type
            }
            
            return analysis_result
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Error analyzing images: {str(e)}",
                "analysis_id": None,
                "results": [],
                "timestamp": self._get_timestamp()
            }
    
    def _apply_content_restrictions(self, prompt: str) -> str:
        """
        Apply content restrictions to remove password, medicine, and diagnosis requests.
        
        Args:
            prompt (str): Original prompt
            
        Returns:
            str: Filtered prompt
        """
        # Add restrictions to the prompt
        restrictions = """
        
IMPORTANT CONTENT RESTRICTIONS:
- Do NOT ask for or request passwords or personal login credentials
- Do NOT provide specific medication names, dosages, or prescriptions
- Do NOT provide definitive medical diagnoses
- Focus on general health information and recommendations to seek professional care
- Provide educational information only, not medical advice
        """
        
        return prompt + restrictions
    
    def _filter_recommendations(self, recommendations: Dict) -> Dict:
        """
        Filter recommendations to remove medical advice.
        
        Args:
            recommendations (Dict): Original recommendations
            
        Returns:
            Dict: Filtered recommendations
        """
        filtered = recommendations.copy()
        
        # Filter out specific medical advice
        if "recommendations" in filtered:
            filtered_recs = []
            for rec in filtered["recommendations"]:
                if not any(word in rec.lower() for word in ["take medication", "prescribe", "dosage", "mg", "pills"]):
                    filtered_recs.append(rec)
            filtered["recommendations"] = filtered_recs
        
        return filtered
    
    def _filter_medical_recommendations(self, recommendations: List[str]) -> List[str]:
        """
        Filter medical recommendations to remove specific medical advice.
        
        Args:
            recommendations (List[str]): Original recommendations
            
        Returns:
            List[str]: Filtered recommendations
        """
        filtered = []
        restricted_terms = [
            "medication", "prescribe", "dosage", "mg", "pills", "tablets",
            "antibiotics", "steroids", "diagnosis", "definitely", "certainly"
        ]
        
        for rec in recommendations:
            if not any(term in rec.lower() for term in restricted_terms):
                # Replace specific terms with general advice
                general_rec = rec.replace("Take", "Consider discussing with healthcare provider about")
                general_rec = general_rec.replace("Use", "Ask healthcare provider about")
                filtered.append(general_rec)
        
        return filtered
    
    def _combine_predictions(self, traditional_preds: List[Dict], cnn_preds: List[Dict]) -> List[Dict]:
        """
        Combine traditional rule-based predictions with CNN model predictions.
        
        Args:
            traditional_preds (List[Dict]): Traditional predictions
            cnn_preds (List[Dict]): CNN model predictions
            
        Returns:
            List[Dict]: Combined predictions
        """
        combined = {}
        
        # Add traditional predictions
        for pred in traditional_preds:
            condition = pred["condition"]
            combined[condition] = pred
        
        # Add or update with CNN predictions (higher weight)
        for pred in cnn_preds:
            condition = pred["condition"]
            if condition in combined:
                # Average the confidence scores, giving more weight to CNN
                traditional_conf = combined[condition]["confidence"]
                cnn_conf = pred["confidence"]
                combined_conf = (traditional_conf * 0.3) + (cnn_conf * 0.7)
                combined[condition]["confidence"] = combined_conf
                combined[condition]["cnn_prediction"] = True
            else:
                pred["cnn_prediction"] = True
                combined[condition] = pred
        
        # Convert back to list and sort by confidence
        result = list(combined.values())
        result.sort(key=lambda x: x["confidence"], reverse=True)
        
        return result[:5]  # Return top 5
    
    def get_emergency_assessment(self, symptoms: List[str]) -> Dict:
        """
        Assess symptoms for emergency conditions.
        
        Args:
            symptoms (List[str]): List of symptoms to assess
            
        Returns:
            Dict: Emergency assessment results
        """
        try:
            # Define emergency symptoms
            emergency_symptoms = [
                "chest_pain", "difficulty_breathing", "severe_headache", "loss_of_consciousness",
                "severe_bleeding", "signs_of_stroke", "severe_allergic_reaction", 
                "high_fever_with_confusion", "severe_abdominal_pain"
            ]
            
            # Check for emergency symptoms
            emergency_found = []
            for symptom in symptoms:
                normalized = symptom.lower().replace(" ", "_")
                if any(emergency in normalized for emergency in emergency_symptoms):
                    emergency_found.append(symptom)
            
            # Determine risk level
            if emergency_found:
                risk_level = "IMMEDIATE"
                urgency = "Seek emergency medical care immediately"
            elif len(symptoms) > 5:
                risk_level = "URGENT"
                urgency = "Consider seeking medical care within hours"
            else:
                risk_level = "NON-URGENT"
                urgency = "Monitor symptoms and consider medical consultation if they persist"
            
            # Generate emergency prompt
            prompt = get_emergency_assessment_prompt(symptoms)
            filtered_prompt = self._apply_content_restrictions(prompt)
            
            return {
                "success": True,
                "risk_level": risk_level,
                "urgency": urgency,
                "emergency_symptoms": emergency_found,
                "recommendations": self._get_emergency_recommendations(risk_level),
                "prompt_generated": filtered_prompt,
                "timestamp": self._get_timestamp()
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Error in emergency assessment: {str(e)}",
                "risk_level": "UNKNOWN",
                "urgency": "Consider seeking medical evaluation",
                "timestamp": self._get_timestamp()
            }
    
    def get_health_insights(self, user_data: Dict) -> Dict:
        """
        Generate personalized health insights based on user data.
        
        Args:
            user_data (Dict): User health data and history
            
        Returns:
            Dict: Personalized health insights
        """
        try:
            insights = {
                "success": True,
                "insights": [],
                "recommendations": [],
                "risk_factors": [],
                "preventive_measures": [],
                "timestamp": self._get_timestamp()
            }
            
            # Analyze age-related factors
            age = user_data.get("age", 0)
            if age:
                insights["insights"].append(self._get_age_related_insights(age))
            
            # Analyze medical history
            medical_history = user_data.get("medical_history", "")
            if medical_history:
                insights["risk_factors"].extend(self._analyze_medical_history(medical_history))
            
            # General health recommendations (filtered)
            insights["recommendations"] = [
                "Maintain regular exercise routine",
                "Follow balanced diet",
                "Get adequate sleep (7-9 hours)",
                "Stay hydrated",
                "Schedule regular health check-ups with healthcare provider"
            ]
            
            # Preventive measures
            insights["preventive_measures"] = [
                "Annual health screenings with healthcare provider",
                "Stay up to date with vaccinations as recommended by healthcare provider",
                "Practice stress management techniques",
                "Use sun protection",
                "Maintain regular dental care"
            ]
            
            return insights
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Error generating health insights: {str(e)}",
                "insights": [],
                "timestamp": self._get_timestamp()
            }
    
    def _get_condition_description(self, condition_name: str) -> str:
        """Get description for a medical condition."""
        descriptions = {
            "Common Cold": "A viral infection of the upper respiratory tract that commonly affects the nose and throat.",
            "Flu": "A viral infection that attacks the respiratory system, causing fever, aches, and fatigue.",
            "Migraine": "A neurological condition characterized by severe headaches, often with nausea and sensitivity to light.",
            "Gastroenteritis": "Inflammation of the stomach and intestines, typically causing vomiting and diarrhea.",
            "Hypertension": "High blood pressure that can lead to serious health complications if left untreated.",
            "Allergic Reaction": "An immune system response to a substance that the body perceives as harmful.",
            "Urinary Tract Infection": "A bacterial infection affecting any part of the urinary system."
        }
        
        return descriptions.get(condition_name, "A medical condition that requires professional evaluation.")
    
    def _map_urgency_to_severity(self, urgency: str) -> str:
        """Map urgency level to severity level."""
        mapping = {
            "High": "high",
            "Medium": "medium",
            "Low": "low"
        }
        return mapping.get(urgency, "medium")
    
    def _get_emergency_recommendations(self, risk_level: str) -> List[str]:
        """Get recommendations based on emergency risk level."""
        if risk_level == "IMMEDIATE":
            return [
                "Seek emergency medical care immediately",
                "Do not drive yourself to hospital",
                "Have someone stay with you",
                "Prepare list of current health information"
            ]
        elif risk_level == "URGENT":
            return [
                "Consider going to emergency room or urgent care",
                "Do not delay seeking medical care if symptoms worsen",
                "Bring identification and insurance information",
                "Have someone accompany you if possible"
            ]
        else:
            return [
                "Schedule appointment with healthcare provider",
                "Monitor symptoms for changes",
                "Seek immediate care if symptoms worsen significantly",
                "Practice self-care measures"
            ]
    
    def _get_age_related_insights(self, age: int) -> str:
        """Generate age-related health insights."""
        if age < 18:
            return "Focus on healthy growth and development, regular pediatric check-ups, and establishing good health habits."
        elif age < 30:
            return "Maintain active lifestyle, establish preventive care routine, and focus on mental health and stress management."
        elif age < 50:
            return "Regular health screenings become important, monitor cardiovascular health, and maintain work-life balance."
        elif age < 65:
            return "Increase frequency of health screenings, focus on chronic disease prevention, and maintain bone health."
        else:
            return "Comprehensive geriatric care, fall prevention, and social engagement are key priorities."
    
    def _analyze_medical_history(self, medical_history: str) -> List[str]:
        """Analyze medical history for risk factors."""
        risk_factors = []
        history_lower = medical_history.lower()
        
        risk_conditions = {
            "diabetes": "Increased risk for cardiovascular disease and complications",
            "hypertension": "Risk factor for heart disease and stroke",
            "heart": "Cardiovascular risk factors present",
            "cancer": "Oncology follow-up and screening important",
            "asthma": "Respiratory health monitoring needed",
            "allergy": "Allergy management and avoidance strategies important"
        }
        
        for condition, risk in risk_conditions.items():
            if condition in history_lower:
                risk_factors.append(risk)
        
        return risk_factors
    
    def _get_timestamp(self) -> str:
        """Get current timestamp in ISO format."""
        from datetime import datetime
        return datetime.now().isoformat()

# Integration functions for React frontend
def analyze_symptoms_api(symptoms: List[str], patient_info: Optional[Dict] = None) -> Dict:
    """
    API function for symptom analysis.
    
    Args:
        symptoms (List[str]): List of symptoms
        patient_info (Optional[Dict]): Patient information
        
    Returns:
        Dict: Analysis results
    """
    analyzer = HealthcareAnalyzer()
    return analyzer.analyze_symptoms(symptoms, patient_info)

def analyze_images_api(images_data: List[Dict], image_type: str = "skin") -> Dict:
    """
    API function for medical image analysis.
    
    Args:
        images_data (List[Dict]): Image data
        image_type (str): Type of images
        
    Returns:
        Dict: Analysis results
    """
    analyzer = HealthcareAnalyzer()
    return analyzer.analyze_medical_images(images_data, image_type)

def emergency_assessment_api(symptoms: List[str]) -> Dict:
    """
    API function for emergency assessment.
    
    Args:
        symptoms (List[str]): List of symptoms
        
    Returns:
        Dict: Emergency assessment results
    """
    analyzer = HealthcareAnalyzer()
    return analyzer.get_emergency_assessment(symptoms)

def health_insights_api(user_data: Dict) -> Dict:
    """
    API function for health insights.
    
    Args:
        user_data (Dict): User health data
        
    Returns:
        Dict: Health insights
    """
    analyzer = HealthcareAnalyzer()
    return analyzer.get_health_insights(user_data)

# Example usage for testing
if __name__ == "__main__":
    # Test symptom analysis
    test_symptoms = ["fever", "headache", "muscle pain", "fatigue"]
    result = analyze_symptoms_api(test_symptoms)
    print("Symptom Analysis Result:")
    print(json.dumps(result, indent=2))
    
    # Test image analysis
    test_images = [{"description": "red, itchy patches on hands", "location": "hands"}]
    image_result = analyze_images_api(test_images, "skin")
    print("\nImage Analysis Result:")
    print(json.dumps(image_result, indent=2))