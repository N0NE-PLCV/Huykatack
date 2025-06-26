// Chat API Integration with Healthcare Analysis
// This module provides AI-powered chat responses for health discussions

import { ApiResponse } from './api';
import { analyzeSymptoms } from './healthcare_api';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  context?: {
    symptoms?: string[];
    painLevel?: number;
    location?: string;
    duration?: string;
  };
}

export interface ChatAnalysisRequest {
  message: string;
  previousMessages?: ChatMessage[];
  currentSymptoms?: string[];
  userContext?: {
    age?: number;
    gender?: string;
    medicalHistory?: string;
  };
}

export interface ChatAnalysisResponse {
  response: string;
  detectedSymptoms: string[];
  suggestedQuestions: string[];
  urgencyLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

class ChatAnalysisService {
  private symptomKeywords: Record<string, string[]> = {
    'headache': ['headache', 'head pain', 'migraine', 'head hurts', 'head ache'],
    'fever': ['fever', 'temperature', 'hot', 'burning up', 'feverish'],
    'fatigue': ['tired', 'exhausted', 'fatigue', 'weak', 'drained', 'worn out'],
    'nausea': ['nausea', 'sick', 'queasy', 'throw up', 'vomit', 'nauseated'],
    'cough': ['cough', 'coughing', 'hacking'],
    'sore_throat': ['sore throat', 'throat pain', 'throat hurts'],
    'muscle_pain': ['muscle pain', 'body aches', 'muscle aches', 'sore muscles'],
    'joint_pain': ['joint pain', 'arthritis', 'stiff joints', 'joint aches'],
    'chest_pain': ['chest pain', 'chest hurts', 'chest pressure'],
    'abdominal_pain': ['stomach pain', 'belly pain', 'abdominal pain', 'stomach ache'],
    'back_pain': ['back pain', 'backache', 'lower back pain'],
    'dizziness': ['dizzy', 'lightheaded', 'vertigo', 'spinning'],
    'shortness_of_breath': ['shortness of breath', 'breathing difficulty', 'can\'t breathe'],
    'skin_rash': ['rash', 'skin irritation', 'red spots', 'itchy skin'],
    'swelling': ['swelling', 'swollen', 'puffiness', 'inflammation']
  };

  private painKeywords = [
    'pain', 'hurt', 'ache', 'sore', 'burning', 'sharp', 'dull', 'throbbing',
    'stabbing', 'cramping', 'tender', 'stiff', 'painful', 'aching'
  ];

  private urgencyKeywords = {
    high: ['severe', 'intense', 'unbearable', 'emergency', 'can\'t move', 'can\'t breathe', 'chest pain', 'difficulty breathing'],
    medium: ['moderate', 'concerning', 'getting worse', 'persistent', 'interfering'],
    low: ['mild', 'slight', 'occasional', 'manageable', 'comes and goes']
  };

  public async analyzeChatMessage(request: ChatAnalysisRequest): Promise<ApiResponse<ChatAnalysisResponse>> {
    try {
      const { message, currentSymptoms = [], userContext } = request;
      
      // Extract symptoms from the message
      const detectedSymptoms = this.extractSymptomsFromText(message);
      
      // Combine with existing symptoms
      const allSymptoms = [...new Set([...currentSymptoms, ...detectedSymptoms])];
      
      // Determine urgency level
      const urgencyLevel = this.determineUrgencyLevel(message);
      
      // Extract pain information
      const painInfo = this.extractPainInformation(message);
      
      // Generate AI response
      let response = '';
      let recommendations: string[] = [];
      
      if (allSymptoms.length > 0) {
        // Use healthcare analysis for symptom-based response
        const analysisResult = await analyzeSymptoms({
          symptoms: allSymptoms,
          patientInfo: userContext
        });
        
        if (analysisResult.success && analysisResult.data) {
          response = this.generateSymptomBasedResponse(message, analysisResult.data, painInfo);
          recommendations = this.extractRecommendations(analysisResult.data);
        } else {
          response = this.generateGeneralHealthResponse(message, painInfo);
          recommendations = this.getGeneralRecommendations(urgencyLevel);
        }
      } else {
        response = this.generateGeneralHealthResponse(message, painInfo);
        recommendations = this.getGeneralRecommendations(urgencyLevel);
      }
      
      // Generate suggested follow-up questions
      const suggestedQuestions = this.generateSuggestedQuestions(detectedSymptoms, painInfo);
      
      return {
        success: true,
        data: {
          response,
          detectedSymptoms,
          suggestedQuestions,
          urgencyLevel,
          recommendations
        }
      };
      
    } catch (error) {
      console.error('Error analyzing chat message:', error);
      return {
        success: false,
        error: 'Failed to analyze message'
      };
    }
  }

  private extractSymptomsFromText(text: string): string[] {
    const textLower = text.toLowerCase();
    const foundSymptoms: string[] = [];
    
    Object.entries(this.symptomKeywords).forEach(([symptom, keywords]) => {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        foundSymptoms.push(symptom);
      }
    });
    
    return foundSymptoms;
  }

  private extractPainInformation(text: string): {
    hasPain: boolean;
    intensity?: string;
    type?: string;
    location?: string;
    duration?: string;
  } {
    const textLower = text.toLowerCase();
    const hasPain = this.painKeywords.some(keyword => textLower.includes(keyword));
    
    if (!hasPain) {
      return { hasPain: false };
    }
    
    // Extract pain intensity
    let intensity = 'unknown';
    if (textLower.includes('severe') || textLower.includes('intense') || textLower.includes('unbearable')) {
      intensity = 'severe';
    } else if (textLower.includes('moderate') || textLower.includes('medium')) {
      intensity = 'moderate';
    } else if (textLower.includes('mild') || textLower.includes('slight')) {
      intensity = 'mild';
    }
    
    // Extract pain type
    let type = 'unknown';
    if (textLower.includes('sharp')) type = 'sharp';
    else if (textLower.includes('dull')) type = 'dull';
    else if (textLower.includes('throbbing')) type = 'throbbing';
    else if (textLower.includes('burning')) type = 'burning';
    else if (textLower.includes('stabbing')) type = 'stabbing';
    else if (textLower.includes('cramping')) type = 'cramping';
    
    // Extract location
    let location = 'unknown';
    const locationKeywords = {
      'head': ['head', 'skull', 'temple'],
      'neck': ['neck', 'cervical'],
      'chest': ['chest', 'breast', 'rib'],
      'back': ['back', 'spine', 'lumbar'],
      'abdomen': ['stomach', 'belly', 'abdomen', 'gut'],
      'arm': ['arm', 'shoulder', 'elbow', 'wrist'],
      'leg': ['leg', 'thigh', 'knee', 'ankle', 'foot'],
      'joint': ['joint', 'joints']
    };
    
    for (const [loc, keywords] of Object.entries(locationKeywords)) {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        location = loc;
        break;
      }
    }
    
    // Extract duration
    let duration = 'unknown';
    if (textLower.includes('just started') || textLower.includes('sudden')) {
      duration = 'acute';
    } else if (textLower.includes('days') || textLower.includes('week')) {
      duration = 'subacute';
    } else if (textLower.includes('months') || textLower.includes('chronic')) {
      duration = 'chronic';
    }
    
    return {
      hasPain: true,
      intensity,
      type,
      location,
      duration
    };
  }

  private determineUrgencyLevel(text: string): 'low' | 'medium' | 'high' {
    const textLower = text.toLowerCase();
    
    for (const keyword of this.urgencyKeywords.high) {
      if (textLower.includes(keyword)) {
        return 'high';
      }
    }
    
    for (const keyword of this.urgencyKeywords.medium) {
      if (textLower.includes(keyword)) {
        return 'medium';
      }
    }
    
    return 'low';
  }

  private generateSymptomBasedResponse(message: string, analysisData: any, painInfo: any): string {
    const conditions = analysisData.conditions || [];
    const topCondition = conditions[0];
    
    let response = '';
    
    if (painInfo.hasPain) {
      response += `I understand you're experiencing ${painInfo.intensity !== 'unknown' ? painInfo.intensity : ''} pain`;
      if (painInfo.location !== 'unknown') {
        response += ` in your ${painInfo.location}`;
      }
      response += '. ';
    }
    
    if (topCondition) {
      response += `Based on the symptoms you've described, this could potentially be related to ${topCondition.name.toLowerCase()}. `;
      
      if (topCondition.severity === 'high') {
        response += 'This appears to be a condition that may require prompt medical attention. ';
      } else if (topCondition.severity === 'medium') {
        response += 'This is something you should consider discussing with a healthcare provider. ';
      }
    }
    
    response += 'Can you tell me more about when these symptoms started or if anything makes them better or worse?';
    
    return response;
  }

  private generateGeneralHealthResponse(message: string, painInfo: any): string {
    const messageLower = message.toLowerCase();
    
    // Greeting responses
    if (messageLower.includes('hello') || messageLower.includes('hi')) {
      return "Hello! I'm here to help you discuss your symptoms and health concerns. What's bothering you today?";
    }
    
    // Pain-specific responses
    if (painInfo.hasPain) {
      const responses = [
        "I'm sorry to hear you're experiencing pain. Can you describe the type of pain - is it sharp, dull, throbbing, or burning?",
        "Pain can be concerning. Where exactly are you feeling this pain, and how long have you been experiencing it?",
        "I understand you're in pain. On a scale of 1-10, how would you rate the intensity? Also, does anything make it better or worse?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // General health responses
    if (messageLower.includes('feel') || messageLower.includes('symptom')) {
      return "I'm here to help you understand your symptoms better. Can you describe what you're experiencing in more detail?";
    }
    
    // Default response
    return "I'm here to help you discuss your health concerns and symptoms. Feel free to describe what you're experiencing, and I'll do my best to provide helpful information. Remember, this is for educational purposes only - always consult with healthcare professionals for medical advice.";
  }

  private extractRecommendations(analysisData: any): string[] {
    const recommendations: string[] = [];
    
    if (analysisData.recommendations?.recommendations) {
      recommendations.push(...analysisData.recommendations.recommendations);
    }
    
    if (analysisData.conditions?.[0]?.recommendations) {
      recommendations.push(...analysisData.conditions[0].recommendations);
    }
    
    return recommendations.slice(0, 3); // Limit to top 3 recommendations
  }

  private getGeneralRecommendations(urgencyLevel: 'low' | 'medium' | 'high'): string[] {
    switch (urgencyLevel) {
      case 'high':
        return [
          'Consider seeking immediate medical attention',
          'Do not delay if symptoms worsen',
          'Have someone accompany you to medical care'
        ];
      case 'medium':
        return [
          'Schedule an appointment with your healthcare provider',
          'Monitor symptoms closely',
          'Keep track of when symptoms occur'
        ];
      default:
        return [
          'Monitor your symptoms',
          'Practice self-care measures',
          'Consider consulting a healthcare provider if symptoms persist'
        ];
    }
  }

  private generateSuggestedQuestions(symptoms: string[], painInfo: any): string[] {
    const questions: string[] = [];
    
    if (painInfo.hasPain) {
      questions.push("How would you rate your pain on a scale of 1-10?");
      questions.push("Does anything make the pain better or worse?");
      questions.push("When did the pain first start?");
    }
    
    if (symptoms.length > 0) {
      questions.push("Are there any other symptoms you're experiencing?");
      questions.push("Have you taken any medications for these symptoms?");
    }
    
    questions.push("Do you have any medical conditions or take any medications?");
    
    return questions.slice(0, 3); // Limit to 3 suggestions
  }
}

// Create singleton instance
export const chatAnalysisService = new ChatAnalysisService();

// Export convenience function
export const analyzeChatMessage = (request: ChatAnalysisRequest) => 
  chatAnalysisService.analyzeChatMessage(request);