import React, { useState, useRef, useEffect } from 'react';
import { MessageCircleIcon, SendIcon, XIcon, MinusIcon } from 'lucide-react';
import { Button } from './button';
import { useLanguage } from '../../contexts/LanguageContext';
import { analyzeChatMessage, ChatMessage, ChatAnalysisRequest } from '../../services/chat_api';

interface MessengerChatProps {
  symptoms: string[];
  onSymptomDiscussion: (symptoms: string[]) => void;
}

export const MessengerChat: React.FC<MessengerChatProps> = ({ 
  symptoms, 
  onSymptomDiscussion 
}) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        content: "Hello! I'm here to help you discuss your symptoms and health concerns. Feel free to describe what you're experiencing, and I'll provide helpful information and guidance.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Auto-scroll to bottom when new messages are added
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
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Prepare chat analysis request
      const request: ChatAnalysisRequest = {
        message: inputMessage.trim(),
        previousMessages: messages.slice(-5), // Last 5 messages for context
        currentSymptoms: symptoms,
        userContext: {
          // Add user context if available
        }
      };

      // Get AI response
      const response = await analyzeChatMessage(request);

      if (response.success && response.data) {
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          content: response.data.response,
          sender: 'ai',
          timestamp: new Date(),
          context: {
            symptoms: response.data.detectedSymptoms,
            painLevel: extractPainLevel(inputMessage),
          }
        };

        setMessages(prev => [...prev, aiMessage]);

        // If new symptoms were detected, notify parent component
        if (response.data.detectedSymptoms.length > 0) {
          onSymptomDiscussion(response.data.detectedSymptoms);
        }

        // Show suggested questions if available
        if (response.data.suggestedQuestions.length > 0) {
          setTimeout(() => {
            const suggestionsMessage: ChatMessage = {
              id: `suggestions-${Date.now()}`,
              content: `Here are some questions that might help:\n\n${response.data.suggestedQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`,
              sender: 'ai',
              timestamp: new Date()
            };
            setMessages(prev => [...prev, suggestionsMessage]);
          }, 1000);
        }
      } else {
        // Fallback response
        const errorMessage: ChatMessage = {
          id: `ai-error-${Date.now()}`,
          content: "I'm sorry, I'm having trouble processing your message right now. Could you please try rephrasing your question or describing your symptoms in a different way?",
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error in chat analysis:', error);
      const errorMessage: ChatMessage = {
        id: `ai-error-${Date.now()}`,
        content: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment, or consider consulting with a healthcare professional directly.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const extractPainLevel = (message: string): number => {
    const painLevelRegex = /(\d+)(?:\/10|out of 10|scale)/i;
    const match = message.match(painLevelRegex);
    return match ? parseInt(match[1]) : 0;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 bg-[#3991db] hover:bg-[#2b7bc7] text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 z-50"
          aria-label="Open chat"
        >
          <MessageCircleIcon className="w-6 h-6" />
          {symptoms.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {symptoms.length}
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col max-h-[500px]">
          {/* Chat Header */}
          <div className="bg-[#3991db] text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircleIcon className="w-5 h-5" />
              <div>
                <h3 className="font-['Itim',Helvetica] font-semibold">Health Assistant</h3>
                <p className="text-xs opacity-90">Ask about your symptoms</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMinimize}
                className="hover:bg-white/20 rounded p-1 transition-colors"
                aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
              >
                <MinusIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 rounded p-1 transition-colors"
                aria-label="Close chat"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto max-h-80 space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg font-['Itim',Helvetica] text-sm ${
                        message.sender === 'user'
                          ? 'bg-[#3991db] text-white rounded-br-none'
                          : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none p-3 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs text-gray-500">Analyzing...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200">
                {/* Current Symptoms Display */}
                {symptoms.length > 0 && (
                  <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Current symptoms:</p>
                    <div className="flex flex-wrap gap-1">
                      {symptoms.slice(0, 3).map((symptom, index) => (
                        <span
                          key={index}
                          className="text-xs bg-[#3991db] text-white px-2 py-1 rounded-full"
                        >
                          {symptom}
                        </span>
                      ))}
                      {symptoms.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{symptoms.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Message Input */}
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe your symptoms or ask a question..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3991db] focus:border-transparent font-['Itim',Helvetica] text-sm"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-[#3991db] hover:bg-[#2b7bc7] text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <SendIcon className="w-4 h-4" />
                  </Button>
                </div>

                {/* Quick Actions */}
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => setInputMessage("I'm experiencing pain")}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-full transition-colors font-['Itim',Helvetica]"
                  >
                    Pain level
                  </button>
                  <button
                    onClick={() => setInputMessage("When should I see a doctor?")}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-full transition-colors font-['Itim',Helvetica]"
                  >
                    See doctor?
                  </button>
                  <button
                    onClick={() => setInputMessage("What could this be?")}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-full transition-colors font-['Itim',Helvetica]"
                  >
                    Diagnosis
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};