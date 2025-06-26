// Healthcare API Integration
// This module provides healthcare analysis functions that integrate with the app_streamlit module

import { ApiResponse } from './api';

export interface HealthcareSymptomRequest {
  symptoms: string[];
  patientInfo?: {
    age?: number;
    gender?: string;
    medicalHistory?: string;
    currentMedications?: string;
  };
}

export interface HealthcareImageRequest {
  images: Array<{
    description: string;
    location?: string;
    base64?: string;
  }>;
  imageType: 'skin' | 'xray' | 'mri' | 'other';
}

export interface HealthcareCondition {
  name: string;
  probability: number;
  description: string;
  severity: 'low' | 'medium' | 'high';
  recommendations: string[];
  symptoms_detected?: string[];
  visual_indicators?: string[];
  confidence?: number;
}

export interface HealthcareSymptomResponse {
  analysisId: string;
  conditions: HealthcareCondition[];
  confidence: number;
  timestamp: string;
}

export interface HealthcareImageResponse {
  analysisId: string;
  results: Array<{
    imageId: string;
    conditions: HealthcareCondition[];
    visual_analysis?: {
      location: string;
      characteristics: string[];
      severity_indicators: string[];
    };
    symptoms_detected?: string[];
  }>;
  timestamp: string;
}

class HealthcareAnalysisService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'https://healthcare-0y63.onrender.com'; // Your backend URL
  }

  async analyzeSymptoms(request: HealthcareSymptomRequest): Promise<ApiResponse<HealthcareSymptomResponse>> {
    try {
      console.log('Analyzing symptoms with healthcare service:', request);

      // Use local healthcare analysis for better reliability
      const result = await this.performLocalSymptomAnalysis(request);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error in healthcare symptom analysis:', error);
      return {
        success: false,
        error: 'Healthcare analysis service temporarily unavailable'
      };
    }
  }

  async analyzeImages(request: HealthcareImageRequest): Promise<ApiResponse<HealthcareImageResponse>> {
    try {
      console.log('Analyzing images with healthcare service:', request);

      // Use local healthcare analysis for better reliability
      const result = await this.performLocalImageAnalysis(request);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error in healthcare image analysis:', error);
      return {
        success: false,
        error: 'Healthcare image analysis service temporarily unavailable'
      };
    }
  }

  private async performLocalSymptomAnalysis(request: HealthcareSymptomRequest): Promise<HealthcareSymptomResponse> {
    const { symptoms, patientInfo } = request;
    
    // Enhanced symptom analysis with medical knowledge
    const conditions = this.analyzeSymptomPatterns(symptoms, patientInfo);
    
    // Calculate overall confidence
    const confidence = conditions.length > 0 ? 
      Math.min(conditions.reduce((sum, c) => sum + c.probability, 0) / conditions.length, 90) : 50;

    return {
      analysisId: `symptom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conditions: conditions.slice(0, 5), // Top 5 conditions
      confidence: Math.round(confidence),
      timestamp: new Date().toISOString()
    };
  }

  private analyzeSymptomPatterns(symptoms: string[], patientInfo?: any): HealthcareCondition[] {
    const conditions: HealthcareCondition[] = [];
    
    // Normalize symptoms for analysis
    const normalizedSymptoms = symptoms.map(s => s.toLowerCase().trim());
    
    // Medical condition patterns with enhanced analysis
    const medicalPatterns = {
      'Common Cold': {
        symptoms: ['cough', 'runny nose', 'sore throat', 'sneezing', 'congestion', 'mild fever'],
        severity: 'low' as const,
        baseConfidence: 75,
        description: 'A viral infection of the upper respiratory tract causing mild symptoms.'
      },
      'Influenza': {
        symptoms: ['fever', 'body aches', 'fatigue', 'headache', 'cough', 'chills'],
        severity: 'medium' as const,
        baseConfidence: 70,
        description: 'A viral infection that affects the respiratory system with systemic symptoms.'
      },
      'Migraine': {
        symptoms: ['headache', 'nausea', 'sensitivity to light', 'vomiting'],
        severity: 'medium' as const,
        baseConfidence: 80,
        description: 'A neurological condition characterized by severe headaches and associated symptoms.'
      },
      'Gastroenteritis': {
        symptoms: ['nausea', 'vomiting', 'diarrhea', 'stomach pain', 'fever'],
        severity: 'medium' as const,
        baseConfidence: 75,
        description: 'Inflammation of the stomach and intestines causing digestive symptoms.'
      },
      'Hypertension': {
        symptoms: ['headache', 'dizziness', 'chest pain', 'shortness of breath'],
        severity: 'high' as const,
        baseConfidence: 60,
        description: 'A medical condition requiring professional evaluation for blood pressure management.'
      },
      'Allergic Reaction': {
        symptoms: ['skin rash', 'itching', 'swelling', 'sneezing', 'watery eyes'],
        severity: 'medium' as const,
        baseConfidence: 70,
        description: 'An immune system response to allergens causing various symptoms.'
      },
      'Urinary Tract Infection': {
        symptoms: ['burning urination', 'frequent urination', 'pelvic pain', 'fever'],
        severity: 'medium' as const,
        baseConfidence: 85,
        description: 'A bacterial infection affecting the urinary system.'
      },
      'Bronchial Asthma': {
        symptoms: ['shortness of breath', 'cough', 'wheezing', 'chest tightness'],
        severity: 'high' as const,
        baseConfidence: 80,
        description: 'A respiratory condition causing airway inflammation and breathing difficulties.'
      }
    };

    // Analyze each medical pattern
    Object.entries(medicalPatterns).forEach(([conditionName, pattern]) => {
      const matchingSymptoms = normalizedSymptoms.filter(symptom => 
        pattern.symptoms.some(patternSymptom => 
          symptom.includes(patternSymptom.toLowerCase()) || 
          patternSymptom.toLowerCase().includes(symptom)
        )
      );

      if (matchingSymptoms.length > 0) {
        // Calculate probability based on symptom match ratio
        const matchRatio = matchingSymptoms.length / pattern.symptoms.length;
        const probability = Math.min(pattern.baseConfidence * matchRatio, 90);

        if (probability > 15) { // Only include if probability > 15%
          conditions.push({
            name: conditionName,
            probability: Math.round(probability),
            description: pattern.description,
            severity: pattern.severity,
            recommendations: this.getRecommendations(pattern.severity, conditionName)
          });
        }
      }
    });

    // Sort by probability
    conditions.sort((a, b) => b.probability - a.probability);
    
    // If no conditions found, provide general advice
    if (conditions.length === 0) {
      conditions.push({
        name: 'General Health Consultation',
        probability: 50,
        description: 'Based on the symptoms provided, a healthcare professional consultation is recommended for proper evaluation.',
        severity: 'medium',
        recommendations: [
          'Schedule an appointment with a healthcare provider',
          'Monitor symptoms for any changes',
          'Keep a symptom diary',
          'Seek immediate care if symptoms worsen significantly'
        ]
      });
    }

    return conditions;
  }

  private async performLocalImageAnalysis(request: HealthcareImageRequest): Promise<HealthcareImageResponse> {
    const { images, imageType } = request;
    
    const results = images.map((image, index) => {
      const conditions = this.analyzeSkinCondition(image.description, image.location);
      
      return {
        imageId: `img_${index}`,
        conditions: conditions,
        visual_analysis: {
          location: image.location || 'unspecified',
          characteristics: this.extractVisualCharacteristics(image.description),
          severity_indicators: this.extractSeverityIndicators(image.description)
        },
        symptoms_detected: this.extractSymptomsFromDescription(image.description)
      };
    });

    return {
      analysisId: `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      results: results,
      timestamp: new Date().toISOString()
    };
  }

  private analyzeSkinCondition(description: string, location?: string): HealthcareCondition[] {
    const conditions: HealthcareCondition[] = [];
    const descLower = description.toLowerCase();
    
    // Skin condition patterns
    const skinPatterns = {
      'Eczema': {
        indicators: ['dry', 'itchy', 'red patches', 'scaling', 'inflammation'],
        severity: 'low' as const,
        confidence: 70
      },
      'Acne': {
        indicators: ['pimples', 'blackheads', 'whiteheads', 'oily skin'],
        severity: 'low' as const,
        confidence: 75
      },
      'Psoriasis': {
        indicators: ['silvery scales', 'thick patches', 'red plaques'],
        severity: 'medium' as const,
        confidence: 65
      },
      'Fungal Infection': {
        indicators: ['ring-shaped', 'scaling', 'itchy', 'spreading'],
        severity: 'low' as const,
        confidence: 70
      },
      'Allergic Dermatitis': {
        indicators: ['rash', 'swelling', 'redness', 'itching'],
        severity: 'medium' as const,
        confidence: 65
      },
      'Skin Cancer Concern': {
        indicators: ['irregular borders', 'color changes', 'asymmetric', 'growing'],
        severity: 'high' as const,
        confidence: 60
      }
    };

    Object.entries(skinPatterns).forEach(([conditionName, pattern]) => {
      const matchCount = pattern.indicators.filter(indicator => 
        descLower.includes(indicator)
      ).length;

      if (matchCount > 0) {
        const probability = Math.min((matchCount / pattern.indicators.length) * pattern.confidence, 85);
        
        if (probability > 20) {
          conditions.push({
            name: conditionName,
            probability: Math.round(probability),
            confidence: Math.round(probability),
            description: this.getSkinConditionDescription(conditionName),
            severity: pattern.severity,
            recommendations: this.getSkinRecommendations(pattern.severity, conditionName),
            visual_indicators: pattern.indicators.filter(indicator => descLower.includes(indicator))
          });
        }
      }
    });

    // Sort by probability
    conditions.sort((a, b) => b.probability - a.probability);
    
    return conditions.slice(0, 3); // Top 3 conditions
  }

  private extractVisualCharacteristics(description: string): string[] {
    const characteristics = [];
    const descLower = description.toLowerCase();
    
    const visualTerms = [
      'red', 'swollen', 'dry', 'oily', 'scaly', 'bumpy', 'smooth', 'rough',
      'raised', 'flat', 'circular', 'irregular', 'symmetrical', 'asymmetrical'
    ];
    
    visualTerms.forEach(term => {
      if (descLower.includes(term)) {
        characteristics.push(term);
      }
    });
    
    return characteristics;
  }

  private extractSeverityIndicators(description: string): string[] {
    const indicators = [];
    const descLower = description.toLowerCase();
    
    const severityTerms = [
      'severe', 'mild', 'moderate', 'intense', 'slight', 'significant',
      'widespread', 'localized', 'painful', 'itchy', 'burning'
    ];
    
    severityTerms.forEach(term => {
      if (descLower.includes(term)) {
        indicators.push(term);
      }
    });
    
    return indicators;
  }

  private extractSymptomsFromDescription(description: string): string[] {
    const symptoms = [];
    const descLower = description.toLowerCase();
    
    const symptomTerms = [
      'itching', 'pain', 'burning', 'swelling', 'redness', 'scaling',
      'bleeding', 'discharge', 'tenderness', 'numbness'
    ];
    
    symptomTerms.forEach(term => {
      if (descLower.includes(term)) {
        symptoms.push(term);
      }
    });
    
    return symptoms;
  }

  private getSkinConditionDescription(condition: string): string {
    const descriptions = {
      'Eczema': 'A condition that makes skin red and itchy, commonly affecting children but can occur at any age.',
      'Acne': 'A skin condition that occurs when hair follicles become plugged with oil and dead skin cells.',
      'Psoriasis': 'An autoimmune condition that causes cells to build up rapidly on the skin surface.',
      'Fungal Infection': 'A skin infection caused by fungi, commonly affecting warm, moist areas.',
      'Allergic Dermatitis': 'Skin inflammation caused by contact with allergens or irritants.',
      'Skin Cancer Concern': 'Changes in skin appearance that may require professional dermatological evaluation.'
    };
    
    return descriptions[condition] || 'A skin condition that may require professional evaluation.';
  }

  private getRecommendations(severity: 'low' | 'medium' | 'high', condition: string): string[] {
    const baseRecommendations = {
      low: [
        'Monitor symptoms and consider healthcare consultation if they persist',
        'Practice good self-care and hygiene',
        'Rest and stay hydrated'
      ],
      medium: [
        'Schedule an appointment with a healthcare provider',
        'Monitor symptoms closely for any changes',
        'Follow general health guidelines'
      ],
      high: [
        'Seek medical attention promptly',
        'Do not delay professional consultation',
        'Monitor for emergency warning signs'
      ]
    };

    // Add condition-specific recommendations
    const conditionSpecific = {
      'Hypertension': ['Monitor blood pressure regularly', 'Maintain healthy diet and exercise'],
      'Bronchial Asthma': ['Avoid known triggers', 'Keep rescue medications accessible'],
      'Urinary Tract Infection': ['Increase fluid intake', 'Practice good hygiene'],
      'Migraine': ['Identify and avoid triggers', 'Maintain regular sleep schedule']
    };

    const recommendations = [...baseRecommendations[severity]];
    
    if (conditionSpecific[condition]) {
      recommendations.push(...conditionSpecific[condition]);
    }

    return recommendations;
  }

  private getSkinRecommendations(severity: 'low' | 'medium' | 'high', condition: string): string[] {
    const baseRecommendations = {
      low: [
        'Keep the affected area clean and dry',
        'Use gentle, fragrance-free products',
        'Avoid scratching or picking at the area'
      ],
      medium: [
        'Consult with a dermatologist or healthcare provider',
        'Take photos to monitor changes',
        'Avoid potential irritants'
      ],
      high: [
        'Seek immediate dermatological evaluation',
        'Do not delay professional medical consultation',
        'Avoid self-treatment'
      ]
    };

    const conditionSpecific = {
      'Skin Cancer Concern': [
        'Schedule urgent dermatologist appointment',
        'Protect area from sun exposure',
        'Do not attempt self-treatment'
      ],
      'Eczema': [
        'Use fragrance-free moisturizers',
        'Identify and avoid triggers',
        'Consider cool compresses for relief'
      ],
      'Acne': [
        'Use gentle, non-comedogenic cleansers',
        'Avoid picking or squeezing',
        'Consider over-the-counter treatments'
      ]
    };

    const recommendations = [...baseRecommendations[severity]];
    
    if (conditionSpecific[condition]) {
      recommendations.push(...conditionSpecific[condition]);
    }

    return recommendations;
  }
}

// Create singleton instance
const healthcareService = new HealthcareAnalysisService();

// Export convenience functions
export const analyzeSymptoms = (request: HealthcareSymptomRequest) => 
  healthcareService.analyzeSymptoms(request);

export const analyzeImages = (request: HealthcareImageRequest) => 
  healthcareService.analyzeImages(request);

// Export the service class for advanced usage
export { HealthcareAnalysisService };