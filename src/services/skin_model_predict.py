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
            self.cnn_model = tf.keras.models.load_model(model_path, compile=False)
            print("Custom CNN DFU model loaded successfully")
        except Exception as e:
            print(f"CNN model not available: {e}")
            self.cnn_model = None
    
    def predict_skin_disease(self, img_pil):
        """
        Main function to predict skin disease from PIL image.
        This is the function called from the Analyze Medical Images page.
        
        Args:
            img_pil: PIL Image object
            
        Returns:
            Tuple[str, float]: (predicted_class, confidence)
        """
        try:
            # Use CNN model if available
            if self.cnn_model is not None:
                predicted_class, confidence = self._predict_with_cnn(img_pil)
            else:
                # Fallback to rule-based analysis
                predicted_class, confidence = self._predict_with_rules(img_pil)
            
            print(f"🔬 predict_skin_disease result: {predicted_class} (confidence: {confidence:.1%})")
            
            return predicted_class, confidence
            
        except Exception as e:
            print(f"Error in predict_skin_disease: {e}")
            # Return default prediction
            return "Normal(Healthy skin)", 0.5
    
    def _predict_with_cnn(self, img_pil):
        """
        Predict using CNN model.
        """
        try:
            # Prepare image for CNN model
            IMAGE_SIZE = (224, 224)
            CLASS_NAMES = ['Abnormal(Ulcer)', 'Normal(Healthy skin)']
            
            # Resize and normalize
            img = img_pil.resize(IMAGE_SIZE)
            img_array = np.array(img).astype('float32') / 255.0
            
            # Handle different image formats
            if img_array.ndim == 2:
                img_array = np.stack([img_array]*3, axis=-1)
            elif img_array.shape[2] == 4:
                img_array = img_array[:, :, :3]
            
            # Add batch dimension
            img_array = np.expand_dims(img_array, axis=0)
            
            # Make prediction
            prediction = self.cnn_model.predict(img_array, verbose=0)
            predicted_class = CLASS_NAMES[np.argmax(prediction)]
            confidence = float(np.max(prediction))
            
            return predicted_class, confidence
            
        except Exception as e:
            print(f"CNN prediction error: {e}")
            return self._predict_with_rules(img_pil)
    
    def _predict_with_rules(self, img_pil):
        """
        Fallback rule-based prediction.
        """
        # Simple rule-based analysis based on image characteristics
        # This is a simplified version - in reality you'd analyze image features
        
        # Convert to numpy array for basic analysis
        img_array = np.array(img_pil)
        
        # Basic color analysis
        if len(img_array.shape) == 3:
            # Calculate average color values
            avg_red = np.mean(img_array[:, :, 0])
            avg_green = np.mean(img_array[:, :, 1])
            avg_blue = np.mean(img_array[:, :, 2])
            
            # Simple heuristic: if image is very red or has low brightness, might be abnormal
            brightness = (avg_red + avg_green + avg_blue) / 3
            redness_ratio = avg_red / (avg_green + avg_blue + 1)
            
            if redness_ratio > 1.2 or brightness < 100:
                return "Abnormal(Ulcer)", 0.65
            else:
                return "Normal(Healthy skin)", 0.70
        else:
            # Grayscale image
            avg_brightness = np.mean(img_array)
            if avg_brightness < 120:
                return "Abnormal(Ulcer)", 0.60
            else:
                return "Normal(Healthy skin)", 0.75
    
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
            "Normal_Skin": {
                "description": "Healthy skin with no visible abnormalities or concerning features",
                "common_locations": ["any_skin_area"],
                "visual_characteristics": ["normal_color", "smooth_texture", "no_lesions"],
                "symptoms": ["no_symptoms"],
                "severity_levels": ["normal"],
                "age_groups": ["all_ages"],
                "treatment_options": ["maintain_good_hygiene", "regular_moisturizing"],
                "urgency": "none"
            }
        }

# Main function that will be called from the healthcare API
def predict_skin_disease(img_pil):
    """
    Main prediction function that integrates with app_streamlit.py AI chain.
    This function is called from the Analyze Medical Images page.
    
    Args:
        img_pil: PIL Image object
        
    Returns:
        Tuple containing:
        - predicted_class: str (e.g., "Abnormal(Ulcer)", "Normal(Healthy skin)")
        - confidence: float (0.0 to 1.0)
        - ai_response: str (AI doctor response from app_streamlit.py)
    """
    try:
        print("🔬 Starting predict_skin_disease function...")
        
        # Initialize predictor
        predictor = SkinConditionPredictor()
        
        # Get prediction from CNN model or rules
        predicted_class, confidence = predictor.predict_skin_disease(img_pil)
        
        print(f"📊 Prediction: {predicted_class} with confidence {confidence:.1%}")
        
        # Import typhoon_wrapper and AI chain functions from app_streamlit
        try:
            from app_streamlit import ai_chain_skin_doctor_reply, format_ai3_bullet, typhoon_wrapper
            
            print("🤖 Calling ai_chain_skin_doctor_reply from app_streamlit.py...")
            
            # Call the AI chain function from app_streamlit.py
            skin_ai3_reply = ai_chain_skin_doctor_reply(predicted_class, confidence, typhoon_wrapper)
            
            # Format the response
            skin_ai3_reply = format_ai3_bullet(skin_ai3_reply)
            
            print("✅ AI response generated successfully")
            
            return predicted_class, confidence, skin_ai3_reply
            
        except ImportError as e:
            print(f"⚠️ Could not import from app_streamlit.py: {e}")
            # Fallback response
            fallback_response = generate_fallback_response(predicted_class, confidence)
            return predicted_class, confidence, fallback_response
            
    except Exception as e:
        print(f"❌ Error in predict_skin_disease: {e}")
        # Return safe defaults
        return "Normal(Healthy skin)", 0.5, "การวิเคราะห์ภาพเสร็จสิ้น กรุณาปรึกษาแพทย์เพื่อการวินิจฉัยที่แม่นยำ"

def generate_fallback_response(predicted_class: str, confidence: float) -> str:
    """
    Generate fallback response when app_streamlit.py is not available.
    """
    if predicted_class == "Abnormal(Ulcer)":
        return f"""ขอให้คุณอย่ากังวลมากนะคะ จากการวิเคราะห์ภาพพบความผิดปกติที่อาจต้องได้รับการดูแล

• 🩹 ทำความสะอาดบริเวณที่มีแผลด้วยน้ำสะอาดและสบู่อ่อนโยน
• 💧 ดื่มน้ำให้เพียงพอและรักษาความชุ่มชื้นของผิวหนัง  
• 🛡️ หลีกเลี่ยงการขูดขีดหรือกดบริเวณที่ผิดปกติ
• 🩺 ควรพบแพทย์ผิวหนังเพื่อรับการตรวจวินิจฉัยที่ถูกต้อง
• ⚠️ หากมีอาการปวด บวม หรือมีหนองควรรีบพบแพทย์ทันที

ความมั่นใจในการวิเคราะห์: {confidence:.1%}"""
    else:
        return f"""ดีใจด้วยนะคะ จากการวิเคราะห์ภาพผิวหนังดูปกติดี

• ✨ ดูแลรักษาความสะอาดของผิวหนังต่อไป
• 💧 ใช้ครีมบำรุงผิวเพื่อรักษาความชุ่มชื้น
• ☀️ ป้องกันผิวจากแสงแดดด้วยครีมกันแดด
• 🔍 ตรวจสอบผิวหนังเป็นประจำเพื่อสังเกตการเปลี่ยนแปลง
• 🩺 หากสังเกตเห็นการเปลี่ยนแปลงผิดปกติควรปรึกษาแพทย์

ความมั่นใจในการวิเคราะห์: {confidence:.1%}"""

# Example usage and testing
if __name__ == "__main__":
    from PIL import Image
    import io
    
    # Test with a sample image
    try:
        # Create a test image
        test_image = Image.new('RGB', (224, 224), color='red')
        
        # Test the prediction function
        predicted_class, confidence, ai_response = predict_skin_disease(test_image)
        
        print(f"Test Result:")
        print(f"Predicted Class: {predicted_class}")
        print(f"Confidence: {confidence:.1%}")
        print(f"AI Response: {ai_response}")
        
    except Exception as e:
        print(f"Test failed: {e}")