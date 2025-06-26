"""
Real CNN Model Integration with Real Typhoon API
Uses actual custom_cnn_dfu_model.h5 + Real Typhoon API Key + get_skin_image_summary_template
NO FALLBACKS - Only real data and real API calls
"""

import base64
import io
import numpy as np
from typing import Tuple
import os
from PIL import Image
import requests
import json

class RealCNNTyphoonPredictor:
    """
    Real CNN model predictor using custom_cnn_dfu_model.h5 + Real Typhoon API
    """
    
    def __init__(self):
        """Initialize with REAL CNN model and REAL Typhoon API - NO FALLBACKS"""
        self.cnn_model = None
        self.model_loaded = False
        self.typhoon_api_key = None
        self.typhoon_api_url = "https://api.opentyphoon.ai/v1"
        self._load_real_cnn_model()
        self._setup_real_typhoon_api()
    
    def _load_real_cnn_model(self):
        """
        Load the REAL custom_cnn_dfu_model.h5 - MANDATORY
        """
        try:
            import tensorflow as tf
            model_path = "/home/project/models/custom_cnn_dfu_model/custom_cnn_dfu_model.h5"
            
            print(f"🔍 Loading REAL CNN model from: {model_path}")
            
            if not os.path.exists(model_path):
                raise FileNotFoundError(f"REAL CNN model not found at: {model_path}")
            
            # Load the REAL trained model
            self.cnn_model = tf.keras.models.load_model(model_path, compile=False)
            self.model_loaded = True
            
            print("✅ REAL custom_cnn_dfu_model.h5 loaded successfully")
            print(f"📊 Model input shape: {self.cnn_model.input_shape}")
            print(f"📊 Model output shape: {self.cnn_model.output_shape}")
            print(f"📊 Model layers: {len(self.cnn_model.layers)}")
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR: Failed to load REAL CNN model: {e}")
            raise Exception(f"Cannot proceed without REAL CNN model custom_cnn_dfu_model.h5: {e}")
    
    def _setup_real_typhoon_api(self):
        """
        Setup REAL Typhoon API with your API key - MANDATORY
        """
        try:
            # Get REAL Typhoon API key from environment
            self.typhoon_api_key = os.getenv("TYPHOON_API_KEY")
            
            if not self.typhoon_api_key:
                raise Exception("TYPHOON_API_KEY environment variable is required")
            
            print(f"🌪️ REAL Typhoon API configured with key: {self.typhoon_api_key[:10]}...")
            print(f"🌐 Typhoon API URL: {self.typhoon_api_url}")
            
            # Test API connection
            self._test_typhoon_connection()
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR: Failed to setup REAL Typhoon API: {e}")
            raise Exception(f"Cannot proceed without REAL Typhoon API key: {e}")
    
    def _test_typhoon_connection(self):
        """Test REAL Typhoon API connection"""
        try:
            headers = {
                "Authorization": f"Bearer {self.typhoon_api_key}",
                "Content-Type": "application/json"
            }
            
            test_payload = {
                "model": "typhoon-v2.1-12b-instruct",
                "messages": [{"role": "user", "content": "Test connection"}],
                "max_tokens": 10,
                "temperature": 0.1
            }
            
            response = requests.post(
                f"{self.typhoon_api_url}/chat/completions",
                headers=headers,
                json=test_payload,
                timeout=10
            )
            
            if response.status_code == 200:
                print("✅ REAL Typhoon API connection successful")
            else:
                print(f"⚠️ Typhoon API test returned status: {response.status_code}")
                
        except Exception as e:
            print(f"⚠️ Typhoon API test failed: {e}")
    
    def predict_with_real_cnn(self, img_pil: Image.Image) -> Tuple[str, float]:
        """
        Predict using the REAL CNN model from custom_cnn_dfu_model.h5
        """
        if not self.model_loaded or self.cnn_model is None:
            raise Exception("REAL CNN model custom_cnn_dfu_model.h5 is not loaded")
        
        try:
            print("🧠 Processing image with REAL CNN model custom_cnn_dfu_model.h5...")
            
            # Get REAL model input shape
            input_shape = self.cnn_model.input_shape
            if len(input_shape) == 4:  # (batch, height, width, channels)
                IMAGE_HEIGHT = input_shape[1] or 224
                IMAGE_WIDTH = input_shape[2] or 224
                CHANNELS = input_shape[3] or 3
            else:
                IMAGE_HEIGHT, IMAGE_WIDTH, CHANNELS = 224, 224, 3
            
            print(f"📐 REAL model input requirements: {IMAGE_HEIGHT}x{IMAGE_WIDTH}x{CHANNELS}")
            
            # Preprocess image for REAL CNN model
            img = img_pil.convert('RGB')
            img = img.resize((IMAGE_WIDTH, IMAGE_HEIGHT))
            img_array = np.array(img).astype('float32')
            
            # Normalize to [0, 1] as expected by most CNN models
            img_array = img_array / 255.0
            
            # Handle channel requirements
            if CHANNELS == 1 and img_array.shape[2] == 3:
                # Convert to grayscale
                img_array = np.mean(img_array, axis=2, keepdims=True)
            elif CHANNELS == 3 and len(img_array.shape) == 2:
                # Convert grayscale to RGB
                img_array = np.stack([img_array]*3, axis=-1)
            
            # Add batch dimension
            img_array = np.expand_dims(img_array, axis=0)
            
            print(f"🖼️ Preprocessed image shape for REAL CNN: {img_array.shape}")
            
            # Run inference with REAL CNN model
            print("🔮 Running inference with REAL custom_cnn_dfu_model.h5...")
            prediction = self.cnn_model.predict(img_array, verbose=0)
            
            print(f"📊 REAL CNN raw output: {prediction}")
            print(f"📊 Output shape: {prediction.shape}")
            
            # Interpret REAL CNN results
            predicted_class, confidence = self._interpret_real_cnn_output(prediction)
            
            print(f"✅ REAL CNN prediction: {predicted_class} (confidence: {confidence:.1%})")
            
            return predicted_class, confidence
            
        except Exception as e:
            print(f"❌ REAL CNN prediction error: {e}")
            raise Exception(f"REAL CNN model prediction failed: {e}")
    
    def _interpret_real_cnn_output(self, prediction: np.ndarray) -> Tuple[str, float]:
        """
        Interpret the output from REAL CNN model based on your actual training
        """
        try:
            # Handle different output formats from the REAL trained model
            if prediction.shape[1] == 2:
                # Binary classification: [Normal, Abnormal]
                class_probabilities = prediction[0]
                predicted_class_idx = np.argmax(class_probabilities)
                confidence = float(np.max(class_probabilities))
                
                # Map to actual class names from your training
                CLASS_NAMES = ['Normal(Healthy skin)', 'Abnormal(Ulcer)']
                predicted_class = CLASS_NAMES[predicted_class_idx]
                
            elif prediction.shape[1] == 1:
                # Single sigmoid output
                confidence = float(prediction[0][0])
                if confidence > 0.5:
                    predicted_class = 'Abnormal(Ulcer)'
                else:
                    predicted_class = 'Normal(Healthy skin)'
                    confidence = 1.0 - confidence
                    
            else:
                # Multi-class output
                class_probabilities = prediction[0]
                predicted_class_idx = np.argmax(class_probabilities)
                confidence = float(np.max(class_probabilities))
                
                # Define based on your actual model training
                CLASS_NAMES = ['Normal(Healthy skin)', 'Abnormal(Ulcer)', 'Other']
                if predicted_class_idx < len(CLASS_NAMES):
                    predicted_class = CLASS_NAMES[predicted_class_idx]
                else:
                    predicted_class = f'Class_{predicted_class_idx}'
            
            return predicted_class, confidence
            
        except Exception as e:
            print(f"❌ Error interpreting REAL CNN output: {e}")
            raise Exception(f"Failed to interpret REAL CNN output: {e}")
    
    def call_real_typhoon_api(self, prompt: str, **kwargs) -> str:
        """
        Call REAL Typhoon API with your API key - NO FALLBACKS
        """
        try:
            model = kwargs.get("model", "typhoon-v2.1-12b-instruct")
            temperature = kwargs.get("temperature", 0.2)
            max_tokens = kwargs.get("max_tokens", 512)
            
            print(f"🌪️ Calling REAL Typhoon API...")
            print(f"📝 Model: {model}")
            print(f"🌡️ Temperature: {temperature}")
            print(f"📏 Max tokens: {max_tokens}")
            print(f"📝 Prompt length: {len(prompt)} characters")
            
            headers = {
                "Authorization": f"Bearer {self.typhoon_api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": model,
                "messages": [
                    {
                        "role": "system", 
                        "content": "คุณเป็นผู้ช่วย AI สุขภาพเบื้องต้น พูดจาอ่อนโยน ให้ข้อมูลเหมือนผู้หญิงไทย สุภาพ เป็นมิตร และห้ามวินิจฉัยหรือสั่งยา ต้องแนะนำให้พบแพทย์เสมอ"
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ],
                "max_tokens": max_tokens,
                "temperature": temperature
            }
            
            response = requests.post(
                f"{self.typhoon_api_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                ai_response = result['choices'][0]['message']['content']
                
                print(f"✅ REAL Typhoon API response received successfully")
                print(f"📊 Response length: {len(ai_response)} characters")
                
                return ai_response
            else:
                print(f"❌ REAL Typhoon API error: {response.status_code}")
                print(f"Response: {response.text}")
                raise Exception(f"Typhoon API returned status {response.status_code}: {response.text}")
                
        except Exception as e:
            print(f"❌ REAL Typhoon API call failed: {e}")
            raise Exception(f"REAL Typhoon API error: {e}")
    
    def generate_ai_doctor_response(self, predicted_class: str, confidence: float) -> str:
        """
        Generate AI doctor response using get_skin_image_summary_template + REAL Typhoon API
        """
        try:
            print(f"🩺 Generating AI doctor response using REAL CNN + Typhoon...")
            print(f"🧠 REAL CNN Input: {predicted_class} (confidence: {confidence:.1%})")
            
            # Import get_skin_image_summary_template
            from health_prompt_template import get_skin_image_summary_template
            
            print(f"📝 Using get_skin_image_summary_template from health_prompt_template.py...")
            
            # Generate summary based on REAL CNN results
            if predicted_class == "Abnormal(Ulcer)":
                ai2_summary = f"จากการวิเคราะห์ภาพด้วย REAL CNN model (custom_cnn_dfu_model.h5) พบลักษณะผิดปกติที่อาจเป็นแผลหรือรอยโรคผิวหนัง (ความมั่นใจจาก REAL CNN: {confidence:.1%})"
                ai2_recommendation = "ควรปรึกษาแพทย์ผิวหนังหรือแพทย์เบาหวานเพื่อรับการตรวจและรักษาที่เหมาะสม เนื่องจากอาจเกี่ยวข้องกับภาวะแทรกซ้อนจากเบาหวาน"
            else:  # Normal(Healthy skin)
                ai2_summary = f"จากการวิเคราะห์ภาพด้วย REAL CNN model (custom_cnn_dfu_model.h5) ผิวหนังดูปกติ (ความมั่นใจจาก REAL CNN: {confidence:.1%})"
                ai2_recommendation = "ควรดูแลรักษาความสะอาดและความชุ่มชื้นของผิวหนังต่อไป และตรวจสอบผิวหนังเป็นประจำ"
            
            # Use get_skin_image_summary_template
            prompt_template = get_skin_image_summary_template()
            
            # Create prompt with REAL CNN data
            prompt = prompt_template.format(
                image_class=f"{predicted_class} (ความมั่นใจจาก REAL CNN model custom_cnn_dfu_model.h5: {confidence:.1%})",
                ai2_summary=ai2_summary,
                ai2_recommendation=ai2_recommendation
            )
            
            print(f"🌪️ Calling REAL Typhoon API with get_skin_image_summary_template...")
            
            # Call REAL Typhoon API
            ai_response = self.call_real_typhoon_api(
                prompt, 
                model="typhoon-v2.1-12b-instruct", 
                temperature=0.2, 
                max_tokens=512
            )
            
            # Format response with bullet points
            ai_response = self._format_ai3_bullet(ai_response)
            
            print("✅ Complete AI doctor response generated using:")
            print("   🧠 REAL CNN: custom_cnn_dfu_model.h5")
            print("   📝 Template: get_skin_image_summary_template")
            print("   🌪️ LLM: REAL Typhoon API")
            
            return ai_response
            
        except Exception as e:
            print(f"❌ AI doctor response generation failed: {e}")
            raise Exception(f"AI response generation failed: {e}")
    
    def _format_ai3_bullet(self, text: str) -> str:
        """Format AI response with proper bullet points and spacing"""
        lines = text.split('\n')
        new_lines = []
        for i, line in enumerate(lines):
            if line.strip().startswith('•'):
                if i > 0 and lines[i-1].strip() != '':
                    new_lines.append('')  # Add empty line before bullet
            new_lines.append(line)
        return '\n'.join(new_lines)

# Global predictor instance
_real_cnn_typhoon_predictor = None

def get_real_cnn_typhoon_predictor():
    """Get or create the real CNN + Typhoon predictor instance"""
    global _real_cnn_typhoon_predictor
    if _real_cnn_typhoon_predictor is None:
        _real_cnn_typhoon_predictor = RealCNNTyphoonPredictor()
    return _real_cnn_typhoon_predictor

def predict_skin_disease(img_pil: Image.Image) -> Tuple[str, float]:
    """
    Main function called from Analyze Medical Images page
    Uses REAL CNN model custom_cnn_dfu_model.h5 + REAL Typhoon API + get_skin_image_summary_template
    NO FALLBACKS - Only real data and real API calls
    
    Args:
        img_pil: PIL Image object
        
    Returns:
        Tuple[str, float]: (predicted_class, confidence)
    """
    try:
        print("🚀 Starting predict_skin_disease with REAL CNN + REAL Typhoon integration...")
        
        # Get REAL CNN + Typhoon prediction
        predictor = get_real_cnn_typhoon_predictor()
        
        # Step 1: Get REAL CNN prediction
        predicted_class, confidence = predictor.predict_with_real_cnn(img_pil)
        print(f"🎯 REAL CNN Result: {predicted_class} ({confidence:.1%})")
        
        # Step 2: Generate AI doctor response using REAL Typhoon API
        print("🤖 Generating AI doctor response with REAL Typhoon API...")
        ai_response = predictor.generate_ai_doctor_response(predicted_class, confidence)
        
        print("✅ Complete pipeline executed successfully:")
        print(f"   🧠 REAL CNN: {predicted_class} ({confidence:.1%})")
        print(f"   🌪️ REAL Typhoon: Response generated")
        print(f"   📝 Template: get_skin_image_summary_template")
        print(f"   🔑 API Key: Used real Typhoon API key")
        
        # Store AI response for frontend display
        global _last_ai_response
        _last_ai_response = ai_response
        
        return predicted_class, confidence
        
    except Exception as e:
        print(f"❌ predict_skin_disease failed: {e}")
        raise Exception(f"Complete REAL pipeline failed: {e}")

def get_last_ai_response() -> str:
    """Get the last AI response generated"""
    global _last_ai_response
    return getattr(get_last_ai_response, '_last_ai_response', '')

# Global variable to store last AI response
_last_ai_response = ""

# Test function
if __name__ == "__main__":
    try:
        print("🧪 Testing REAL CNN + REAL Typhoon integration...")
        
        # Create test image
        test_image = Image.new('RGB', (224, 224), color=(128, 64, 32))
        
        # Test the complete pipeline
        predicted_class, confidence = predict_skin_disease(test_image)
        
        print(f"✅ Test completed successfully:")
        print(f"   Predicted Class: {predicted_class}")
        print(f"   Confidence: {confidence:.1%}")
        print(f"   AI Response: {get_last_ai_response()[:100]}...")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")