"""
Skin Condition Prediction Service
Provides AI-powered analysis for skin-related medical images and conditions.
Integrates with custom CNN DFU model for enhanced prediction accuracy.
"""

import base64
import io
import numpy as np
from typing import List, Dict, Optional, Tuple
import json

class SkinConditionPredictor:
    """
    A class for predicting skin conditions based on image analysis and symptoms.
    Integrates with custom CNN model for diabetic foot ulcer detection.
    """
    
    def __init__(self):
        """Initialize the skin condition predictor."""
        self.skin_conditions = self._load_skin_conditions()
        self.confidence_threshold = 0.3
        self.cnn_model = None
        self._load_cnn_model()
    
    def _load_cnn_model(self):
        """
        Load the custom CNN DFU model.
        """
        try:
            # Try to load the CNN model if available
            import tensorflow as tf
            model_path = "/home/project/models/custom_cnn_dfu_model/custom_cnn_dfu_model.h5"
            self.cnn_model = tf.keras.models.load_model(model_path)
            print("Custom CNN DFU model loaded successfully")
        except Exception as e:
            print(f"CNN model not available: {e}")
            self.cnn_model = None
    
    def _load_skin_conditions(self) -> Dict:
        """
        Load skin condition database with symptoms and characteristics.
        
        Returns:
            Dict: Skin conditions database
        """
        return {
            "Diabetic_Foot_Ulcer": {
                "description": "A serious complication of diabetes affecting the feet, requiring immediate medical attention",
                "common_locations": ["feet", "toes", "heel", "ankle"],
                "visual_characteristics": ["open_wound", "ulceration", "infection", "poor_healing"],
                "symptoms": ["foot_pain", "swelling", "discharge", "redness", "warmth"],
                "severity_levels": ["moderate", "severe", "critical"],
                "age_groups": ["adults", "elderly"],
                "treatment_options": ["immediate_medical_care", "wound_management", "infection_control"],
                "urgency": "high"
            },
            "Acne": {
                "description": "A skin condition that occurs when hair follicles become plugged with oil and dead skin cells",
                "common_locations": ["face", "chest", "back", "shoulders"],
                "visual_characteristics": ["pimples", "blackheads", "whiteheads", "cysts"],
                "symptoms": ["skin_rash", "pus_filled_pimples", "blackheads", "inflammation"],
                "severity_levels": ["mild", "moderate", "severe"],
                "age_groups": ["teenagers", "young_adults"],
                "treatment_options": ["consult_dermatologist", "gentle_skincare", "avoid_picking"],
                "urgency": "low"
            },
            "Eczema": {
                "description": "A condition that makes skin red and itchy, commonly in children but can occur at any age",
                "common_locations": ["hands", "feet", "ankles", "wrists", "neck", "face"],
                "visual_characteristics": ["red_patches", "dry_skin", "scaling", "thickened_skin"],
                "symptoms": ["itching", "skin_rash", "dry_skin", "inflammation"],
                "severity_levels": ["mild", "moderate", "severe"],
                "age_groups": ["children", "adults"],
                "treatment_options": ["consult_dermatologist", "moisturize_regularly", "avoid_triggers"],
                "urgency": "low"
            },
            "Psoriasis": {
                "description": "An autoimmune condition that causes cells to build up rapidly on the skin surface",
                "common_locations": ["elbows", "knees", "scalp", "lower_back"],
                "visual_characteristics": ["silvery_scales", "red_patches", "thick_plaques"],
                "symptoms": ["skin_rash", "skin_peeling", "silver_like_dusting", "joint_pain"],
                "severity_levels": ["mild", "moderate", "severe"],
                "age_groups": ["adults"],
                "treatment_options": ["consult_dermatologist", "specialized_care", "lifestyle_modifications"],
                "urgency": "medium"
            },
            "Dermatitis": {
                "description": "General term for skin inflammation with various causes",
                "common_locations": ["hands", "face", "neck", "areas_of_contact"],
                "visual_characteristics": ["redness", "swelling", "blisters", "scaling"],
                "symptoms": ["itching", "skin_rash", "burning_sensation", "swelling"],
                "severity_levels": ["mild", "moderate", "severe"],
                "age_groups": ["all_ages"],
                "treatment_options": ["avoid_triggers", "consult_healthcare_provider", "gentle_skincare"],
                "urgency": "low"
            },
            "Fungal_Infection": {
                "description": "Skin infection caused by fungi, commonly affecting warm, moist areas",
                "common_locations": ["feet", "groin", "underarms", "between_toes"],
                "visual_characteristics": ["ring_shaped_patches", "scaling", "redness", "itching"],
                "symptoms": ["itching", "skin_rash", "scaling", "burning_sensation"],
                "severity_levels": ["mild", "moderate"],
                "age_groups": ["all_ages"],
                "treatment_options": ["consult_healthcare_provider", "keep_area_dry", "proper_hygiene"],
                "urgency": "low"
            },
            "Melanoma": {
                "description": "A serious form of skin cancer that develops in melanocytes",
                "common_locations": ["any_skin_area", "commonly_sun_exposed_areas"],
                "visual_characteristics": ["asymmetric_moles", "irregular_borders", "color_variation", "diameter_changes"],
                "symptoms": ["changing_mole", "new_growth", "bleeding", "itching"],
                "severity_levels": ["high_risk"],
                "age_groups": ["adults", "elderly"],
                "treatment_options": ["immediate_dermatologist_consultation", "urgent_medical_evaluation"],
                "urgency": "high"
            },
            "Basal_Cell_Carcinoma": {
                "description": "The most common type of skin cancer, usually appears on sun-exposed areas",
                "common_locations": ["face", "neck", "arms", "hands"],
                "visual_characteristics": ["pearly_bumps", "flat_lesions", "bleeding_sores"],
                "symptoms": ["new_growth", "non_healing_sore", "bleeding", "crusting"],
                "severity_levels": ["moderate_risk"],
                "age_groups": ["adults", "elderly"],
                "treatment_options": ["dermatologist_consultation", "medical_evaluation"],
                "urgency": "medium"
            },
            "Benign_Mole": {
                "description": "Common, non-cancerous skin growths composed of melanocytes",
                "common_locations": ["any_skin_area"],
                "visual_characteristics": ["uniform_color", "regular_borders", "stable_size"],
                "symptoms": ["usually_asymptomatic"],
                "severity_levels": ["benign"],
                "age_groups": ["all_ages"],
                "treatment_options": ["routine_monitoring", "annual_skin_checks"],
                "urgency": "low"
            },
            "Seborrheic_Keratosis": {
                "description": "Common, non-cancerous skin growths that appear as waxy, scaly patches",
                "common_locations": ["chest", "back", "shoulders", "face"],
                "visual_characteristics": ["waxy_appearance", "stuck_on_look", "brown_color"],
                "symptoms": ["usually_asymptomatic", "occasional_itching"],
                "severity_levels": ["benign"],
                "age_groups": ["middle_aged", "elderly"],
                "treatment_options": ["routine_monitoring", "dermatologist_consultation_if_changes"],
                "urgency": "low"
            },
            "Rosacea": {
                "description": "A chronic skin condition that causes redness and visible blood vessels in the face",
                "common_locations": ["central_face", "cheeks", "nose", "forehead"],
                "visual_characteristics": ["persistent_redness", "visible_blood_vessels", "bumps"],
                "symptoms": ["facial_redness", "burning_sensation", "eye_irritation"],
                "severity_levels": ["mild", "moderate", "severe"],
                "age_groups": ["middle_aged", "elderly"],
                "treatment_options": ["dermatologist_consultation", "lifestyle_modifications", "gentle_skincare"],
                "urgency": "low"
            }
        }
    
    def predict_with_cnn_model(self, base64_image: str) -> List[Dict]:
        """
        Use CNN model to predict skin conditions from base64 image.
        
        Args:
            base64_image (str): Base64 encoded image
            
        Returns:
            List[Dict]: CNN model predictions
        """
        if not self.cnn_model:
            return []
        
        try:
            # Decode base64 image
            image_data = base64.b64decode(base64_image)
            
            # Convert to numpy array and preprocess
            # Note: This is a simplified preprocessing - adjust based on your model requirements
            import PIL.Image
            image = PIL.Image.open(io.BytesIO(image_data))
            image = image.resize((224, 224))  # Adjust size based on your model
            image_array = np.array(image) / 255.0  # Normalize
            
            # Add batch dimension
            image_batch = np.expand_dims(image_array, axis=0)
            
            # Make prediction
            predictions = self.cnn_model.predict(image_batch)
            
            # Convert predictions to our format
            # Note: Adjust this based on your model's output format
            cnn_results = []
            
            # Assuming the model outputs probabilities for different conditions
            # You'll need to adjust this based on your actual model output
            condition_classes = ["Diabetic_Foot_Ulcer", "Normal_Skin", "Other_Condition"]
            
            for i, prob in enumerate(predictions[0]):
                if prob > 0.1:  # Only include predictions above 10%
                    cnn_results.append({
                        "condition": condition_classes[i] if i < len(condition_classes) else f"Condition_{i}",
                        "confidence": float(prob * 100),
                        "description": self.skin_conditions.get(condition_classes[i], {}).get("description", "CNN detected condition"),
                        "severity": "high" if "ulcer" in condition_classes[i].lower() else "medium",
                        "treatment_options": ["consult_healthcare_provider", "professional_evaluation"],
                        "source": "cnn_model"
                    })
            
            return sorted(cnn_results, key=lambda x: x["confidence"], reverse=True)
            
        except Exception as e:
            print(f"Error in CNN prediction: {e}")
            return []
    
    def analyze_image_description(self, description: str, location: str = None) -> List[Dict]:
        """
        Analyze skin condition based on image description.
        
        Args:
            description (str): Description of the skin condition/image
            location (str): Body location of the condition
            
        Returns:
            List[Dict]: Predicted skin conditions with confidence scores
        """
        description_lower = description.lower()
        predictions = []
        
        for condition_name, condition_data in self.skin_conditions.items():
            confidence = self._calculate_confidence(description_lower, condition_data, location)
            
            if confidence > self.confidence_threshold:
                severity = self._determine_severity(condition_name, description_lower)
                
                prediction = {
                    "condition": condition_name,
                    "confidence": round(confidence * 100, 1),
                    "description": condition_data["description"],
                    "severity": severity,
                    "urgency": condition_data["urgency"],
                    "characteristics": condition_data["visual_characteristics"],
                    "treatment_options": self._filter_treatment_options(condition_data["treatment_options"])
                }
                
                predictions.append(prediction)
        
        # Sort by confidence
        predictions.sort(key=lambda x: x["confidence"], reverse=True)
        
        # Return top 3 predictions
        return predictions[:3]
    
    def _filter_treatment_options(self, treatment_options: List[str]) -> List[str]:
        """
        Filter treatment options to remove specific medical advice.
        
        Args:
            treatment_options (List[str]): Original treatment options
            
        Returns:
            List[str]: Filtered treatment options
        """
        filtered = []
        for option in treatment_options:
            # Replace specific medical terms with general advice
            if "medication" in option.lower() or "prescription" in option.lower():
                filtered.append("Consult healthcare provider for appropriate treatment options")
            elif "surgery" in option.lower():
                filtered.append("Discuss treatment options with healthcare provider")
            else:
                filtered.append(option)
        
        return filtered
    
    def _calculate_confidence(self, description: str, condition_data: Dict, location: str = None) -> float:
        """
        Calculate confidence score for a condition based on description and location.
        
        Args:
            description (str): Image/condition description
            condition_data (Dict): Condition information
            location (str): Body location
            
        Returns:
            float: Confidence score (0-1)
        """
        confidence = 0.0
        
        # Check visual characteristics
        visual_matches = 0
        for characteristic in condition_data["visual_characteristics"]:
            if characteristic.replace("_", " ") in description:
                visual_matches += 1
        
        if condition_data["visual_characteristics"]:
            confidence += (visual_matches / len(condition_data["visual_characteristics"])) * 0.4
        
        # Check location match
        if location:
            location_lower = location.lower()
            location_matches = 0
            for common_location in condition_data["common_locations"]:
                if common_location.replace("_", " ") in location_lower:
                    location_matches += 1
            
            if condition_data["common_locations"]:
                confidence += (location_matches / len(condition_data["common_locations"])) * 0.3
        
        # Check for specific keywords
        keywords = {
            "diabetic_foot_ulcer": ["ulcer", "diabetic", "foot", "wound", "infection", "poor healing"],
            "acne": ["pimple", "blackhead", "whitehead", "acne", "zit"],
            "eczema": ["eczema", "atopic", "dry", "itchy", "red patch"],
            "psoriasis": ["psoriasis", "scale", "plaque", "silvery"],
            "melanoma": ["melanoma", "mole", "asymmetric", "irregular", "cancer"],
            "fungal": ["fungal", "ring", "athlete", "yeast"],
            "rosacea": ["rosacea", "facial redness", "blood vessel"]
        }
        
        condition_lower = condition_data["description"].lower()
        for keyword_group, words in keywords.items():
            if keyword_group in condition_lower:
                for word in words:
                    if word in description:
                        confidence += 0.1
                        break
        
        return min(confidence, 1.0)
    
    def _determine_severity(self, condition_name: str, description: str) -> str:
        """
        Determine severity based on condition and description.
        
        Args:
            condition_name (str): Name of the condition
            description (str): Description of the condition
            
        Returns:
            str: Severity level
        """
        # High-risk conditions
        if condition_name in ["Melanoma", "Diabetic_Foot_Ulcer"]:
            return "high"
        
        # Check for severity indicators in description
        severe_indicators = ["severe", "widespread", "bleeding", "painful", "infected", "large", "ulcer"]
        moderate_indicators = ["moderate", "multiple", "spreading", "inflamed"]
        
        for indicator in severe_indicators:
            if indicator in description:
                return "high"
        
        for indicator in moderate_indicators:
            if indicator in description:
                return "medium"
        
        return "low"
    
    def get_recommendations(self, predictions: List[Dict]) -> Dict:
        """
        Get recommendations based on skin condition predictions.
        
        Args:
            predictions (List[Dict]): Skin condition predictions
            
        Returns:
            Dict: Recommendations and care instructions
        """
        if not predictions:
            return {
                "urgency": "medium",
                "immediate_actions": ["Consult a dermatologist for proper evaluation"],
                "self_care": ["Keep area clean and dry", "Avoid scratching or picking"],
                "warning_signs": ["Rapid changes", "Bleeding", "Severe pain"],
                "follow_up": "Schedule dermatologist appointment within 1-2 weeks"
            }
        
        top_prediction = predictions[0]
        urgency = top_prediction["urgency"]
        condition = top_prediction["condition"]
        
        recommendations = {
            "urgency": urgency,
            "immediate_actions": [],
            "self_care": [],
            "warning_signs": [],
            "follow_up": ""
        }
        
        # Urgency-based recommendations
        if urgency == "high":
            recommendations["immediate_actions"] = [
                "Seek immediate medical evaluation",
                "Do not delay medical consultation",
                "Avoid self-treatment"
            ]
            recommendations["follow_up"] = "Schedule appointment within 24-48 hours"
        elif urgency == "medium":
            recommendations["immediate_actions"] = [
                "Schedule healthcare provider appointment",
                "Monitor for changes",
                "Take photos to track progression"
            ]
            recommendations["follow_up"] = "Schedule appointment within 1-2 weeks"
        else:
            recommendations["immediate_actions"] = [
                "Consider healthcare provider consultation if concerned",
                "Monitor the condition",
                "Practice good skin hygiene"
            ]
            recommendations["follow_up"] = "Routine healthcare visit if symptoms persist"
        
        # Condition-specific self-care (filtered)
        if "diabetic" in condition.lower():
            recommendations["self_care"] = [
                "Keep feet clean and dry",
                "Inspect feet daily",
                "Wear proper footwear",
                "Monitor blood sugar levels as directed by healthcare provider"
            ]
        elif "acne" in condition.lower():
            recommendations["self_care"] = [
                "Use gentle, non-comedogenic cleansers",
                "Avoid picking or squeezing",
                "Use oil-free moisturizers",
                "Consider consulting healthcare provider for treatment options"
            ]
        elif "eczema" in condition.lower():
            recommendations["self_care"] = [
                "Use fragrance-free moisturizers",
                "Avoid known triggers",
                "Take lukewarm baths",
                "Wear soft, breathable fabrics"
            ]
        elif "fungal" in condition.lower():
            recommendations["self_care"] = [
                "Keep affected area clean and dry",
                "Wear breathable clothing",
                "Avoid sharing personal items",
                "Consult healthcare provider for appropriate treatment"
            ]
        else:
            recommendations["self_care"] = [
                "Keep area clean and dry",
                "Avoid harsh chemicals or irritants",
                "Use gentle, fragrance-free products",
                "Protect from sun exposure"
            ]
        
        # General warning signs
        recommendations["warning_signs"] = [
            "Rapid increase in size",
            "Changes in color or texture",
            "Bleeding or ulceration",
            "Severe pain or itching",
            "Signs of infection (pus, warmth, red streaking)"
        ]
        
        # Add specific warning signs for high-risk conditions
        if condition in ["Melanoma", "Basal_Cell_Carcinoma"]:
            recommendations["warning_signs"].extend([
                "Asymmetry in moles",
                "Irregular borders",
                "Color variation",
                "Diameter larger than 6mm",
                "Evolution or changes over time"
            ])
        elif "diabetic" in condition.lower():
            recommendations["warning_signs"].extend([
                "Increased pain or swelling",
                "Fever or chills",
                "Red streaking from wound",
                "Foul odor from wound",
                "Wound not healing"
            ])
        
        return recommendations
    
    def analyze_symptoms_with_image(self, symptoms: List[str], image_analysis: Dict) -> Dict:
        """
        Combine symptom analysis with image analysis for comprehensive evaluation.
        
        Args:
            symptoms (List[str]): List of reported symptoms
            image_analysis (Dict): Results from image analysis
            
        Returns:
            Dict: Combined analysis results
        """
        # Normalize symptoms for skin conditions
        skin_symptoms = []
        for symptom in symptoms:
            normalized = symptom.lower().replace(" ", "_")
            skin_symptoms.append(normalized)
        
        # Get skin condition predictions based on symptoms
        symptom_predictions = self._predict_from_symptoms(skin_symptoms)
        
        # Combine with image analysis
        combined_results = {
            "primary_predictions": image_analysis.get("predictions", []),
            "symptom_based_predictions": symptom_predictions,
            "combined_confidence": self._calculate_combined_confidence(
                image_analysis.get("predictions", []), 
                symptom_predictions
            ),
            "recommendations": self.get_recommendations(image_analysis.get("predictions", []))
        }
        
        return combined_results
    
    def _predict_from_symptoms(self, symptoms: List[str]) -> List[Dict]:
        """
        Predict skin conditions based on symptoms alone.
        
        Args:
            symptoms (List[str]): List of symptoms
            
        Returns:
            List[Dict]: Symptom-based predictions
        """
        predictions = []
        
        for condition_name, condition_data in self.skin_conditions.items():
            condition_symptoms = condition_data.get("symptoms", [])
            
            # Calculate symptom match
            matching_symptoms = set(symptoms).intersection(set(condition_symptoms))
            if matching_symptoms:
                confidence = len(matching_symptoms) / len(condition_symptoms)
                
                if confidence > 0.2:  # At least 20% symptom match
                    predictions.append({
                        "condition": condition_name,
                        "confidence": round(confidence * 100, 1),
                        "matching_symptoms": list(matching_symptoms),
                        "description": condition_data["description"]
                    })
        
        predictions.sort(key=lambda x: x["confidence"], reverse=True)
        return predictions[:3]
    
    def _calculate_combined_confidence(self, image_predictions: List[Dict], symptom_predictions: List[Dict]) -> Dict:
        """
        Calculate combined confidence when both image and symptom data are available.
        
        Args:
            image_predictions (List[Dict]): Image-based predictions
            symptom_predictions (List[Dict]): Symptom-based predictions
            
        Returns:
            Dict: Combined confidence scores
        """
        combined = {}
        
        # Weight image analysis more heavily (70%) than symptoms (30%)
        image_weight = 0.7
        symptom_weight = 0.3
        
        # Create a map of conditions from both sources
        all_conditions = set()
        
        image_map = {}
        for pred in image_predictions:
            condition = pred["condition"]
            all_conditions.add(condition)
            image_map[condition] = pred["confidence"]
        
        symptom_map = {}
        for pred in symptom_predictions:
            condition = pred["condition"]
            all_conditions.add(condition)
            symptom_map[condition] = pred["confidence"]
        
        # Calculate combined scores
        for condition in all_conditions:
            image_conf = image_map.get(condition, 0)
            symptom_conf = symptom_map.get(condition, 0)
            
            combined_conf = (image_conf * image_weight) + (symptom_conf * symptom_weight)
            combined[condition] = round(combined_conf, 1)
        
        return combined
    
    def get_abcd_analysis(self, description: str) -> Dict:
        """
        Perform ABCD analysis for mole evaluation (Asymmetry, Border, Color, Diameter).
        
        Args:
            description (str): Description of the mole/lesion
            
        Returns:
            Dict: ABCD analysis results
        """
        description_lower = description.lower()
        
        analysis = {
            "asymmetry": {
                "score": 0,
                "description": "Shape analysis",
                "findings": []
            },
            "border": {
                "score": 0,
                "description": "Border regularity",
                "findings": []
            },
            "color": {
                "score": 0,
                "description": "Color variation",
                "findings": []
            },
            "diameter": {
                "score": 0,
                "description": "Size assessment",
                "findings": []
            },
            "total_score": 0,
            "risk_level": "low",
            "recommendations": []
        }
        
        # Asymmetry analysis
        asymmetry_indicators = ["asymmetric", "irregular shape", "uneven", "lopsided"]
        for indicator in asymmetry_indicators:
            if indicator in description_lower:
                analysis["asymmetry"]["score"] = 1
                analysis["asymmetry"]["findings"].append(f"Asymmetric features detected: {indicator}")
                break
        
        # Border analysis
        border_indicators = ["irregular border", "jagged", "notched", "blurred edge"]
        for indicator in border_indicators:
            if indicator in description_lower:
                analysis["border"]["score"] = 1
                analysis["border"]["findings"].append(f"Irregular border detected: {indicator}")
                break
        
        # Color analysis
        color_indicators = ["multiple colors", "color variation", "different shades", "black", "blue", "red"]
        color_count = sum(1 for indicator in color_indicators if indicator in description_lower)
        if color_count >= 2:
            analysis["color"]["score"] = 1
            analysis["color"]["findings"].append("Multiple colors or significant color variation detected")
        
        # Diameter analysis
        size_indicators = ["large", "bigger than", "growing", "increased size"]
        for indicator in size_indicators:
            if indicator in description_lower:
                analysis["diameter"]["score"] = 1
                analysis["diameter"]["findings"].append(f"Size concern detected: {indicator}")
                break
        
        # Calculate total score and risk level
        total_score = (analysis["asymmetry"]["score"] + 
                      analysis["border"]["score"] + 
                      analysis["color"]["score"] + 
                      analysis["diameter"]["score"])
        
        analysis["total_score"] = total_score
        
        if total_score >= 3:
            analysis["risk_level"] = "high"
            analysis["recommendations"] = [
                "Immediate dermatological evaluation recommended",
                "Consider professional medical evaluation",
                "Do not delay medical consultation"
            ]
        elif total_score >= 2:
            analysis["risk_level"] = "medium"
            analysis["recommendations"] = [
                "Schedule dermatologist appointment within 1-2 weeks",
                "Monitor for any changes",
                "Take photos for comparison"
            ]
        else:
            analysis["risk_level"] = "low"
            analysis["recommendations"] = [
                "Continue routine monitoring",
                "Annual dermatological check-up",
                "Self-examination monthly"
            ]
        
        return analysis

# Example usage and testing
if __name__ == "__main__":
    # Initialize predictor
    predictor = SkinConditionPredictor()
    
    # Test with sample image description
    test_description = "red, itchy patches on hands with dry, scaling skin"
    test_location = "hands"
    
    print("Testing Skin Condition Predictor...")
    print(f"Description: {test_description}")
    print(f"Location: {test_location}")
    
    # Get predictions
    predictions = predictor.analyze_image_description(test_description, test_location)
    
    print("\nPredictions:")
    for pred in predictions:
        print(f"- {pred['condition']}: {pred['confidence']}% confidence")
        print(f"  Severity: {pred['severity']}, Urgency: {pred['urgency']}")
        print(f"  Description: {pred['description']}")
    
    # Get recommendations
    if predictions:
        recommendations = predictor.get_recommendations(predictions)
        print(f"\nRecommendations:")
        print(f"Urgency: {recommendations['urgency']}")
        print(f"Immediate actions: {recommendations['immediate_actions']}")
        print(f"Self-care: {recommendations['self_care']}")