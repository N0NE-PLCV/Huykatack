import React, { useState, useRef, useEffect } from 'react';
import { MessageCircleIcon, SendIcon, XIcon, MinusIcon, BotIcon, UserIcon } from 'lucide-react';
import { Button } from './button';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
}

interface MessengerChatProps {
  symptoms?: string[];
  onSymptomDiscussion?: (symptoms: string[]) => void;
}

export const MessengerChat: React.FC<MessengerChatProps> = ({ 
  symptoms = [], 
  onSymptomDiscussion 
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: `Hello${user?.name ? ` ${user.name}` : ''}! I'm your AI health assistant. I can help you discuss your symptoms, particularly pain-related concerns. How are you feeling today?`,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, user?.name]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(async () => {
      const aiResponse = await generateAIResponse(inputMessage.trim(), symptoms);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = async (userInput: string, currentSymptoms: string[]): Promise<string> => {
    try {
      // Import the healthcare analyzer
      const { analyzeSymptoms } = await import('../../services/healthcare_api');
      
      // Analyze the user's message for pain-related content
      const painKeywords = [
        'pain', 'hurt', 'ache', 'sore', 'burning', 'sharp', 'dull', 'throbbing',
        'stabbing', 'cramping', 'tender', 'stiff', 'swollen', 'inflammation'
      ];
      
      const userInputLower = userInput.toLowerCase();
      const mentionsPain = painKeywords.some(keyword => userInputLower.includes(keyword));
      
      // Extract potential symptoms from user input
      const extractedSymptoms = extractSymptomsFromText(userInput);
      const allSymptoms = [...new Set([...currentSymptoms, ...extractedSymptoms])];
      
      if (mentionsPain || extractedSymptoms.length > 0) {
        // Use healthcare API for symptom analysis
        const analysisResult = await analyzeSymptoms({
          symptoms: allSymptoms,
          patientInfo: {
            age: 30, // Default age, could be from user profile
            gender: 'unspecified'
          }
        });
        
        if (analysisResult.success && analysisResult.data) {
          const conditions = analysisResult.data.conditions;
          const topCondition = conditions[0];
          
          if (topCondition) {
            return generateContextualResponse(userInput, topCondition, mentionsPain);
          }
        }
      }
      
      // Generate contextual response based on user input
      return generateGeneralResponse(userInput, mentionsPain);
      
    } catch (error) {
      console.error('Error generating AI response:', error);
      return generateFallbackResponse(userInput);
    }
  };

  const extractSymptomsFromText = (text: string): string[] => {
    const symptomKeywords = {
      'headache': ['headache', 'head pain', 'migraine'],
      'fever': ['fever', 'temperature', 'hot', 'burning up'],
      'fatigue': ['tired', 'exhausted', 'fatigue', 'weak'],
      'nausea': ['nausea', 'sick', 'queasy', 'throw up'],
      'cough': ['cough', 'coughing'],
      'sore_throat': ['sore throat', 'throat pain'],
      'muscle_pain': ['muscle pain', 'body aches', 'muscle aches'],
      'joint_pain': ['joint pain', 'arthritis', 'stiff joints'],
      'chest_pain': ['chest pain', 'chest hurts'],
      'abdominal_pain': ['stomach pain', 'belly pain', 'abdominal pain'],
      'back_pain': ['back pain', 'backache'],
      'dizziness': ['dizzy', 'lightheaded', 'vertigo']
    };
    
    const textLower = text.toLowerCase();
    const foundSymptoms: string[] = [];
    
    Object.entries(symptomKeywords).forEach(([symptom, keywords]) => {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        foundSymptoms.push(symptom);
      }
    });
    
    return foundSymptoms;
  };

  const generateContextualResponse = (userInput: string, condition: any, mentionsPain: boolean): string => {
    const responses = [
      `I understand you're experiencing ${mentionsPain ? 'pain' : 'symptoms'}. Based on what you've described, this could potentially be related to ${condition.name.toLowerCase()}. `,
      `The symptoms you're describing might suggest ${condition.name.toLowerCase()}. `,
      `Thank you for sharing that information. This could potentially indicate ${condition.name.toLowerCase()}. `
    ];
    
    const baseResponse = responses[Math.floor(Math.random() * responses.length)];
    
    let additionalInfo = '';
    if (condition.severity === 'high') {
      additionalInfo = 'This appears to be a condition that may require prompt medical attention. ';
    } else if (condition.severity === 'medium') {
      additionalInfo = 'This is something you should consider discussing with a healthcare provider. ';
    }
    
    const recommendations = condition.recommendations?.slice(0, 2).join(' ') || 'Consider consulting with a healthcare provider for proper evaluation.';
    
    return baseResponse + additionalInfo + recommendations + '\n\nCan you tell me more about when these symptoms started or if anything makes them better or worse?';
  };

  const generateGeneralResponse = (userInput: string, mentionsPain: boolean): string => {
    const userInputLower = userInput.toLowerCase();
    
    // Greeting responses
    if (userInputLower.includes('hello') || userInputLower.includes('hi')) {
      return "Hello! I'm here to help you discuss your symptoms and health concerns. What's bothering you today?";
    }
    
    // Pain-specific responses
    if (mentionsPain) {
      const painResponses = [
        "I'm sorry to hear you're experiencing pain. Can you describe the type of pain - is it sharp, dull, throbbing, or burning?",
        "Pain can be concerning. Where exactly are you feeling this pain, and how long have you been experiencing it?",
        "I understand you're in pain. On a scale of 1-10, how would you rate the intensity? Also, does anything make it better or worse?"
      ];
      return painResponses[Math.floor(Math.random() * painResponses.length)];
    }
    
    // General health responses
    if (userInputLower.includes('feel') || userInputLower.includes('symptom')) {
      return "I'm here to help you understand your symptoms better. Can you describe what you're experiencing in more detail?";
    }
    
    // Default response
    return "I'm here to help you discuss your health concerns and symptoms. Feel free to describe what you're experiencing, and I'll do my best to provide helpful information. Remember, this is for educational purposes only - always consult with healthcare professionals for medical advice.";
  };

  const generateFallbackResponse = (userInput: string): string => {
    return "I'm here to help you discuss your symptoms and health concerns. While I can provide general health information, please remember that this is for educational purposes only. For any serious health concerns, it's important to consult with qualified healthcare professionals. What would you like to know more about?";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-[#3991db] hover:bg-[#2b7bc7] text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center"
          >
            <MessageCircleIcon className="w-6 h-6" />
          </Button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-xl border border-gray-200 transition-all duration-300 ${
          isMinimized ? 'h-14' : 'h-96 w-80'
        }`}>
          {/* Chat Header */}
          <div className="bg-[#3991db] text-white p-3 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BotIcon className="w-5 h-5" />
              <span className="font-['Itim',Helvetica] font-medium">AI Health Assistant</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                onClick={() => setIsMinimized(!isMinimized)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-1 h-auto"
              >
                <MinusIcon className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-1 h-auto"
              >
                <XIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 p-3 h-64 overflow-y-auto bg-gray-50">
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`p-2 rounded-lg font-['Itim',Helvetica] text-sm ${
                            message.sender === 'user'
                              ? 'bg-[#3991db] text-white rounded-br-none'
                              : 'bg-white text-gray-800 rounded-bl-none border'
                          }`}
                        >
                          {message.content}
                        </div>
                        <div className={`text-xs text-gray-500 mt-1 ${
                          message.sender === 'user' ? 'text-right' : 'text-left'
                        }`}>
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        message.sender === 'user' 
                          ? 'bg-[#3991db] text-white order-1 mr-2' 
                          : 'bg-gray-300 text-gray-600 order-2 ml-2'
                      }`}>
                        {message.sender === 'user' ? <UserIcon className="w-3 h-3" /> : <BotIcon className="w-3 h-3" />}
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white text-gray-800 rounded-lg border p-2 font-['Itim',Helvetica] text-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area */}
              <div className="p-3 border-t border-gray-200 bg-white rounded-b-lg">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe your symptoms or ask about pain..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3991db] focus:border-transparent font-['Itim',Helvetica] text-sm"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="bg-[#3991db] hover:bg-[#2b7bc7] text-white p-2 rounded-lg"
                  >
                    <SendIcon className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Quick Actions */}
                <div className="flex gap-1 mt-2">
                  <Button
                    onClick={() => setInputMessage("I'm experiencing pain in my ")}
                    variant="outline"
                    size="sm"
                    className="text-xs px-2 py-1 h-auto font-['Itim',Helvetica]"
                  >
                    Pain
                  </Button>
                  <Button
                    onClick={() => setInputMessage("I have a headache that ")}
                    variant="outline"
                    size="sm"
                    className="text-xs px-2 py-1 h-auto font-['Itim',Helvetica]"
                  >
                    Headache
                  </Button>
                  <Button
                    onClick={() => setInputMessage("My symptoms started ")}
                    variant="outline"
                    size="sm"
                    className="text-xs px-2 py-1 h-auto font-['Itim',Helvetica]"
                  >
                    Timeline
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};