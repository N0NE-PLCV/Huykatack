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
import os

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
        self.model_loaded = False
        self._load_cnn_model()
    
    def _load_cnn_model(self):
        """
        Load the real custom CNN DFU model from custom_cnn_dfu_model.h5
        """
        try:
            import tensorflow as tf
            model_path = "/home/project/models/custom_cnn_dfu_model/custom_cnn_dfu_model.h5"
            
            if os.path.exists(model_path):
                print(f"🔍 Loading real CNN model from: {model_path}")
                self.cnn_model = tf.keras.models.load_model(model_path, compile=False)
                self.model_loaded = True
                print("✅ Real custom CNN DFU model loaded successfully")
                print(f"📊 Model input shape: {self.cnn_model.input_shape}")
                print(f"📊 Model output shape: {self.cnn_model.output_shape}")
            else:
                print(f"❌ Model file not found at: {model_path}")
                raise FileNotFoundError(f"CNN model not found at {model_path}")
                
        except Exception as e:
            print(f"❌ Failed to load real CNN model: {e}")
            raise Exception(f"Cannot proceed without real CNN model: {e}")
    
    def predict_skin_disease(self, img_pil):
        """
        Main function to predict skin disease from PIL image using REAL CNN model.
        This is the function called from the Analyze Medical Images page.
        
        Args:
            img_pil: PIL Image object
            
        Returns:
            Tuple[str, float]: (predicted_class, confidence)
        """
        if not self.model_loaded or self.cnn_model is None:
            raise Exception("Real CNN model is not loaded. Cannot perform prediction.")
        
        try:
            print("🔬 Starting predict_skin_disease with REAL CNN model...")
            
            # Use REAL CNN model for prediction
            predicted_class, confidence = self._predict_with_real_cnn(img_pil)
            
            print(f"🎯 Real CNN prediction: {predicted_class} (confidence: {confidence:.1%})")
            
            return predicted_class, confidence
            
        except Exception as e:
            print(f"❌ Error in predict_skin_disease with real CNN: {e}")
            raise Exception(f"Real CNN prediction failed: {e}")
    
    def _predict_with_real_cnn(self, img_pil):
        """
        Predict using the REAL CNN model from custom_cnn_dfu_model.h5
        """
        try:
            print("🧠 Processing image with REAL CNN model...")
            
            # Get model input shape from the real model
            input_shape = self.cnn_model.input_shape
            if len(input_shape) == 4:  # (batch, height, width, channels)
                IMAGE_HEIGHT = input_shape[1]
                IMAGE_WIDTH = input_shape[2]
                CHANNELS = input_shape[3]
            else:
                # Default fallback
                IMAGE_HEIGHT, IMAGE_WIDTH, CHANNELS = 224, 224, 3
            
            print(f"📐 Using model input shape: {IMAGE_HEIGHT}x{IMAGE_WIDTH}x{CHANNELS}")
            
            # Prepare image for REAL CNN model
            img = img_pil.convert('RGB')  # Ensure RGB format
            img = img.resize((IMAGE_WIDTH, IMAGE_HEIGHT))
            img_array = np.array(img).astype('float32')
            
            # Normalize pixel values to [0, 1]
            img_array = img_array / 255.0
            
            # Ensure correct number of channels
            if CHANNELS == 1 and img_array.shape[2] == 3:
                # Convert to grayscale if model expects 1 channel
                img_array = np.mean(img_array, axis=2, keepdims=True)
            elif CHANNELS == 3 and len(img_array.shape) == 2:
                # Convert grayscale to RGB if model expects 3 channels
                img_array = np.stack([img_array]*3, axis=-1)
            
            # Add batch dimension
            img_array = np.expand_dims(img_array, axis=0)
            
            print(f"🖼️ Preprocessed image shape: {img_array.shape}")
            
            # Make prediction with REAL CNN model
            print("🔮 Running inference with real CNN model...")
            prediction = self.cnn_model.predict(img_array, verbose=0)
            
            print(f"📊 Raw CNN output: {prediction}")
            
            # Interpret prediction results
            # Assuming binary classification: [Normal, Abnormal] or [Healthy, Ulcer]
            if prediction.shape[1] == 2:
                # Binary classification
                class_probabilities = prediction[0]
                predicted_class_idx = np.argmax(class_probabilities)
                confidence = float(np.max(class_probabilities))
                
                # Map to class names (adjust based on your model's training)
                CLASS_NAMES = ['Normal(Healthy skin)', 'Abnormal(Ulcer)']
                predicted_class = CLASS_NAMES[predicted_class_idx]
                
            elif prediction.shape[1] == 1:
                # Single output (sigmoid)
                confidence = float(prediction[0][0])
                if confidence > 0.5:
                    predicted_class = 'Abnormal(Ulcer)'
                else:
                    predicted_class = 'Normal(Healthy skin)'
                    confidence = 1.0 - confidence
            else:
                # Multi-class classification
                class_probabilities = prediction[0]
                predicted_class_idx = np.argmax(class_probabilities)
                confidence = float(np.max(class_probabilities))
                
                # Define class names based on your model
                CLASS_NAMES = ['Normal(Healthy skin)', 'Abnormal(Ulcer)', 'Other_Condition']
                if predicted_class_idx < len(CLASS_NAMES):
                    predicted_class = CLASS_NAMES[predicted_class_idx]
                else:
                    predicted_class = f'Class_{predicted_class_idx}'
            
            print(f"✅ Real CNN prediction complete: {predicted_class} ({confidence:.1%})")
            
            return predicted_class, confidence
            
        except Exception as e:
            print(f"❌ Real CNN prediction error: {e}")
            raise Exception(f"Real CNN model prediction failed: {e}")
    
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

# Main function that integrates with app_streamlit.py
def predict_skin_disease(img_pil):
    """
    Main prediction function that integrates with app_streamlit.py AI chain using REAL CNN model.
    This function is called from the Analyze Medical Images page.
    
    Args:
        img_pil: PIL Image object
        
    Returns:
        Tuple containing:
        - predicted_class: str (e.g., "Abnormal(Ulcer)", "Normal(Healthy skin)")
        - confidence: float (0.0 to 1.0)
        - ai_response: str (AI doctor response from app_streamlit.py using get_skin_image_summary_template)
    """
    try:
        print("🚀 Starting predict_skin_disease function with REAL CNN model...")
        
        # Initialize predictor with REAL CNN model
        predictor = SkinConditionPredictor()
        
        # Get prediction from REAL CNN model
        predicted_class, confidence = predictor.predict_skin_disease(img_pil)
        
        print(f"📊 Real CNN Prediction: {predicted_class} with confidence {confidence:.1%}")
        
        # Import required functions from app_streamlit.py
        try:
            print("🔗 Importing functions from app_streamlit.py...")
            from app_streamlit import ai_chain_skin_doctor_reply, format_ai3_bullet, typhoon_wrapper
            
            print("🤖 Calling ai_chain_skin_doctor_reply with get_skin_image_summary_template...")
            
            # Call the AI chain function from app_streamlit.py
            # This will use get_skin_image_summary_template from health_prompt_template.py
            skin_ai3_reply = ai_chain_skin_doctor_reply(predicted_class, confidence, typhoon_wrapper)
            
            # Format the response using format_ai3_bullet
            skin_ai3_reply = format_ai3_bullet(skin_ai3_reply)
            
            print("✅ AI response generated successfully using get_skin_image_summary_template")
            
            return predicted_class, confidence, skin_ai3_reply
            
        except ImportError as e:
            print(f"❌ Could not import from app_streamlit.py: {e}")
            raise Exception(f"app_streamlit.py integration failed: {e}")
            
    except Exception as e:
        print(f"❌ Error in predict_skin_disease: {e}")
        raise Exception(f"predict_skin_disease failed: {e}")

# Example usage and testing
if __name__ == "__main__":
    from PIL import Image
    import io
    
    # Test with a sample image
    try:
        print("🧪 Testing predict_skin_disease with real CNN model...")
        
        # Create a test image
        test_image = Image.new('RGB', (224, 224), color='red')
        
        # Test the prediction function
        predicted_class, confidence, ai_response = predict_skin_disease(test_image)
        
        print(f"✅ Test Result:")
        print(f"Predicted Class: {predicted_class}")
        print(f"Confidence: {confidence:.1%}")
        print(f"AI Response: {ai_response}")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")