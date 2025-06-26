import React, { useState } from "react";
import { SearchIcon, AlertTriangleIcon, TrendingUpIcon, PlusIcon, XIcon } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Header } from "../../components/ui/header";
import { MessengerChat } from "../../components/ui/messenger-chat";
import { useLanguage } from "../../contexts/LanguageContext";
import { useApi } from "../../hooks/useApi";
import { apiClient, SymptomAnalysisResponse, handleApiError } from "../../services/api";

interface CheckSymptomsProps {
  onBack: () => void;
  currentPage: 'home' | 'check-symptoms' | 'analyze-images';
  onNavigate: (page: 'home' | 'check-symptoms' | 'analyze-images') => void;
  isLoggedIn: boolean;
  onLoginRequired: () => void;
  onProfileAction: (action: string) => void;
  onProfileClick: () => void;
  onLanguageChange: (lang: 'en' | 'th') => void;
}

interface Symptom {
  id: string;
  name: string;
  category: string;
  severity: 'mild' | 'moderate' | 'severe';
}

interface CustomSymptom {
  id: string;
  name: string;
  isCustom: true;
}

export const CheckSymptoms = ({ 
  onBack, 
  currentPage, 
  onNavigate, 
  isLoggedIn, 
  onLoginRequired, 
  onProfileAction, 
  onProfileClick,
  onLanguageChange 
}: CheckSymptomsProps): JSX.Element => {
  const { language, t } = useLanguage();
  const { data: analysisResults, loading: isAnalyzing, error: analysisError, execute: executeAnalysis } = useApi<SymptomAnalysisResponse>();
  
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptoms, setCustomSymptoms] = useState<CustomSymptom[]>([]);
  const [customSymptomText, setCustomSymptomText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Predefined symptoms database
  const symptoms: Symptom[] = [
    // Head & Neurological
    { id: 'headache', name: 'Headache', category: 'Head & Neurological', severity: 'moderate' },
    { id: 'dizziness', name: 'Dizziness', category: 'Head & Neurological', severity: 'moderate' },
    { id: 'confusion', name: 'Confusion', category: 'Head & Neurological', severity: 'severe' },
    { id: 'memory-loss', name: 'Memory Loss', category: 'Head & Neurological', severity: 'severe' },
    
    // Respiratory
    { id: 'cough', name: 'Cough', category: 'Respiratory', severity: 'mild' },
    { id: 'shortness-breath', name: 'Shortness of Breath', category: 'Respiratory', severity: 'severe' },
    { id: 'chest-pain', name: 'Chest Pain', category: 'Respiratory', severity: 'severe' },
    { id: 'sore-throat', name: 'Sore Throat', category: 'Respiratory', severity: 'mild' },
    
    // General
    { id: 'fever', name: 'Fever', category: 'General', severity: 'moderate' },
    { id: 'fatigue', name: 'Fatigue', category: 'General', severity: 'mild' },
    { id: 'body-aches', name: 'Body Aches', category: 'General', severity: 'moderate' },
    { id: 'chills', name: 'Chills', category: 'General', severity: 'moderate' },
    { id: 'sweating', name: 'Excessive Sweating', category: 'General', severity: 'mild' },
    
    // Digestive
    { id: 'nausea', name: 'Nausea', category: 'Digestive', severity: 'moderate' },
    { id: 'vomiting', name: 'Vomiting', category: 'Digestive', severity: 'moderate' },
    { id: 'stomach-pain', name: 'Stomach Pain', category: 'Digestive', severity: 'moderate' },
    { id: 'diarrhea', name: 'Diarrhea', category: 'Digestive', severity: 'moderate' },
    { id: 'constipation', name: 'Constipation', category: 'Digestive', severity: 'mild' },
    
    // Musculoskeletal
    { id: 'joint-pain', name: 'Joint Pain', category: 'Musculoskeletal', severity: 'moderate' },
    { id: 'muscle-weakness', name: 'Muscle Weakness', category: 'Musculoskeletal', severity: 'moderate' },
    { id: 'back-pain', name: 'Back Pain', category: 'Musculoskeletal', severity: 'moderate' },
    
    // Skin
    { id: 'rash', name: 'Skin Rash', category: 'Skin', severity: 'mild' },
    { id: 'itching', name: 'Itching', category: 'Skin', severity: 'mild' },
    { id: 'swelling', name: 'Swelling', category: 'Skin', severity: 'moderate' },
  ];

  const filteredSymptoms = symptoms.filter(symptom =>
    symptom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    symptom.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedSymptoms = filteredSymptoms.reduce((acc, symptom) => {
    if (!acc[symptom.category]) {
      acc[symptom.category] = [];
    }
    acc[symptom.category].push(symptom);
    return acc;
  }, {} as Record<string, Symptom[]>);

  const handleSymptomToggle = (symptomId: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptomId)
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleAddCustomSymptom = () => {
    if (customSymptomText.trim()) {
      const customId = `custom-${Date.now()}`;
      const newCustomSymptom: CustomSymptom = {
        id: customId,
        name: customSymptomText.trim(),
        isCustom: true
      };
      
      setCustomSymptoms(prev => [...prev, newCustomSymptom]);
      setSelectedSymptoms(prev => [...prev, customId]);
      setCustomSymptomText("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomSymptom();
    }
  };

  const removeCustomSymptom = (symptomId: string) => {
    setCustomSymptoms(prev => prev.filter(s => s.id !== symptomId));
    setSelectedSymptoms(prev => prev.filter(id => id !== symptomId));
  };

  const clearAllSymptoms = () => {
    setSelectedSymptoms([]);
    setCustomSymptoms([]);
    setCustomSymptomText("");
    setShowAnalysis(false);
  };

  const analyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0) return;

    // Prepare symptoms for API
    const symptomNames = selectedSymptoms.map(id => {
      const predefinedSymptom = symptoms.find(s => s.id === id);
      if (predefinedSymptom) {
        return predefinedSymptom.name;
      }
      const customSymptom = customSymptoms.find(s => s.id === id);
      return customSymptom?.name || '';
    }).filter(name => name);

    // Call API
    const result = await executeAnalysis(() => 
      apiClient.analyzeSymptoms({
        symptoms: symptomNames,
        severity: 'moderate' // You can make this dynamic based on selected symptoms
      })
    );

    if (result) {
      setShowAnalysis(true);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSymptomSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'border-green-300 text-green-700';
      case 'moderate': return 'border-yellow-300 text-yellow-700';
      case 'severe': return 'border-red-300 text-red-700';
      default: return 'border-gray-300 text-gray-700';
    }
  };

  const getAllSelectedSymptoms = () => {
    const predefinedSymptoms = symptoms.filter(s => selectedSymptoms.includes(s.id));
    const selectedCustomSymptoms = customSymptoms.filter(s => selectedSymptoms.includes(s.id));
    return [...predefinedSymptoms, ...selectedCustomSymptoms];
  };

  // Get current symptom names for chat context
  const getCurrentSymptomNames = () => {
    return selectedSymptoms.map(id => {
      const predefinedSymptom = symptoms.find(s => s.id === id);
      if (predefinedSymptom) {
        return predefinedSymptom.name;
      }
      const customSymptom = customSymptoms.find(s => s.id === id);
      return customSymptom?.name || '';
    }).filter(name => name);
  };

  const handleSymptomDiscussion = (discussedSymptoms: string[]) => {
    // Add discussed symptoms to the current selection
    discussedSymptoms.forEach(symptomName => {
      const existingSymptom = symptoms.find(s => 
        s.name.toLowerCase() === symptomName.toLowerCase()
      );
      
      if (existingSymptom && !selectedSymptoms.includes(existingSymptom.id)) {
        setSelectedSymptoms(prev => [...prev, existingSymptom.id]);
      } else if (!existingSymptom) {
        // Add as custom symptom if not found in predefined list
        const customId = `custom-${Date.now()}-${Math.random()}`;
        const newCustomSymptom: CustomSymptom = {
          id: customId,
          name: symptomName,
          isCustom: true
        };
        
        setCustomSymptoms(prev => [...prev, newCustomSymptom]);
        setSelectedSymptoms(prev => [...prev, customId]);
      }
    });
  };

  return (
    <main className="bg-[#2c2727] flex flex-row justify-center w-full min-h-screen">
      <div className="bg-gradient-to-b from-blue-300 to-blue-100 w-full max-w-[1920px] min-h-screen relative">
        {/* Header/Navigation - Using standardized Header component */}
        <Header
          currentPage={currentPage}
          onNavigate={onNavigate}
          onLoginRequired={onLoginRequired}
          onProfileAction={onProfileAction}
          onProfileClick={onProfileClick}
          onLanguageChange={onLanguageChange}
        />

        {/* Main Content - Fully Responsive */}
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          {!showAnalysis ? (
            <>
              {/* Page Title - Responsive */}
              <div className="text-center mb-8 sm:mb-10 lg:mb-12">
                <h1 className="font-['Itim',Helvetica] text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-normal text-[#2b356c] mb-3 sm:mb-4 leading-tight">
                  {t('checkSymptoms.title')}
                </h1>
                <p className="font-['Itim',Helvetica] text-sm sm:text-base md:text-lg lg:text-xl text-black max-w-4xl mx-auto leading-relaxed px-2">
                  {t('checkSymptoms.description')}
                </p>
              </div>

              {/* Instructions Card - Responsive */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
                {/* Custom Symptom Input - Responsive */}
                <div className="mb-6 sm:mb-8">
                  <label className="font-['Itim',Helvetica] text-base sm:text-lg font-medium text-[#2b356c] block mb-3 sm:mb-4">
                    {t('checkSymptoms.customSymptomLabel')}
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder={t('checkSymptoms.customSymptomPlaceholder')}
                      value={customSymptomText}
                      onChange={(e) => setCustomSymptomText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 px-4 sm:px-6 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3991db] focus:border-transparent font-['Itim',Helvetica] text-base sm:text-lg"
                    />
                    <Button
                      onClick={handleAddCustomSymptom}
                      disabled={!customSymptomText.trim()}
                      className="bg-[#3991db] hover:bg-[#2b7bc7] text-white px-6 sm:px-8 py-3 sm:py-4 font-['Itim',Helvetica] text-base sm:text-lg rounded-lg sm:rounded-xl flex items-center gap-2 justify-center"
                    >
                      <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      {t('checkSymptoms.add')}
                    </Button>
                  </div>
                  <p className="font-['Itim',Helvetica] text-xs sm:text-sm text-gray-600 mt-2">
                    {t('checkSymptoms.customSymptomHint')}
                  </p>
                </div>
                
                {/* Search Bar for predefined symptoms - Responsive */}
                <div className="relative">
                  <SearchIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />
                  <input
                    type="text"
                    placeholder={t('checkSymptoms.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-4 sm:pr-6 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3991db] focus:border-transparent font-['Itim',Helvetica] text-base sm:text-lg"
                  />
                </div>
              </div>

              {/* Selected Symptoms Summary - Responsive */}
              {selectedSymptoms.length > 0 && (
                <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                    <h3 className="font-['Itim',Helvetica] text-lg sm:text-xl lg:text-2xl font-semibold text-[#2b356c]">
                      {t('checkSymptoms.selectedSymptoms')} ({selectedSymptoms.length})
                    </h3>
                    <Button
                      onClick={clearAllSymptoms}
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 font-['Itim',Helvetica] flex items-center gap-2 rounded-lg sm:rounded-xl text-sm sm:text-base"
                    >
                      <XIcon className="w-4 h-4" />
                      {t('checkSymptoms.clearAll')}
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
                    {getAllSelectedSymptoms().map(symptom => (
                      <span
                        key={symptom.id}
                        className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-['Itim',Helvetica] ${
                          'isCustom' in symptom 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-[#3991db] text-white'
                        }`}
                      >
                        <span className="truncate max-w-[120px] sm:max-w-none">{symptom.name}</span>
                        {'isCustom' in symptom && (
                          <span className="text-xs bg-white/20 px-1 sm:px-2 py-1 rounded hidden sm:inline">{t('checkSymptoms.custom')}</span>
                        )}
                        <button
                          onClick={() => {
                            if ('isCustom' in symptom) {
                              removeCustomSymptom(symptom.id);
                            } else {
                              handleSymptomToggle(symptom.id);
                            }
                          }}
                          className="hover:bg-white/20 rounded-full p-1 flex-shrink-0"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  
                  <div className="text-center">
                    <Button
                      onClick={analyzeSymptoms}
                      disabled={isAnalyzing}
                      className="bg-[#3991db] hover:bg-[#2b7bc7] text-white px-8 sm:px-12 py-3 sm:py-4 font-['Itim',Helvetica] text-lg sm:text-xl rounded-lg sm:rounded-xl w-full sm:w-auto"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white mr-2 sm:mr-3"></div>
                          {t('checkSymptoms.analyzingSymptoms')}
                        </>
                      ) : (
                        <>
                          <TrendingUpIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                          {t('checkSymptoms.analyzeSymptoms')}
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Show API Error if any */}
                  {analysisError && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 font-['Itim',Helvetica] text-sm">
                        {handleApiError(analysisError)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Custom Symptoms Display - Responsive */}
              {customSymptoms.length > 0 && (
                <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
                  <h3 className="font-['Itim',Helvetica] text-lg sm:text-xl lg:text-2xl font-semibold text-[#2b356c] mb-4 sm:mb-6">
                    {t('checkSymptoms.customSymptoms')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {customSymptoms.map(symptom => (
                      <div
                        key={symptom.id}
                        className={`p-3 sm:p-4 border-2 rounded-lg sm:rounded-xl transition-all font-['Itim',Helvetica] ${
                          selectedSymptoms.includes(symptom.id)
                            ? 'bg-purple-500 text-white border-purple-500'
                            : 'bg-purple-50 border-purple-200 text-purple-700'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-base sm:text-lg truncate">{symptom.name}</div>
                            <div className={`text-xs sm:text-sm mt-1 ${
                              selectedSymptoms.includes(symptom.id) ? 'text-purple-100' : 'text-purple-500'
                            }`}>
                              {t('checkSymptoms.customSymptom')}
                            </div>
                          </div>
                          <button
                            onClick={() => removeCustomSymptom(symptom.id)}
                            className="ml-2 hover:bg-white/20 rounded-full p-1 flex-shrink-0"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Symptoms by Category - Responsive */}
              <div className="space-y-6 sm:space-y-8">
                {Object.entries(groupedSymptoms).map(([category, categorySymptoms]) => (
                  <div key={category} className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
                    <h3 className="font-['Itim',Helvetica] text-lg sm:text-xl lg:text-2xl font-semibold text-[#2b356c] mb-4 sm:mb-6">
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {categorySymptoms.map(symptom => (
                        <button
                          key={symptom.id}
                          onClick={() => handleSymptomToggle(symptom.id)}
                          className={`p-3 sm:p-4 border-2 rounded-lg sm:rounded-xl text-left transition-all hover:shadow-md font-['Itim',Helvetica] ${
                            selectedSymptoms.includes(symptom.id)
                              ? 'bg-[#3991db] text-white border-[#3991db]'
                              : `bg-white hover:bg-gray-50 border-gray-200 ${getSymptomSeverityColor(symptom.severity)}`
                          }`}
                        >
                          <div className="font-medium text-base sm:text-lg">{symptom.name}</div>
                          <div className={`text-xs sm:text-sm mt-1 ${
                            selectedSymptoms.includes(symptom.id) ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {symptom.severity === 'mild' && t('checkSymptoms.mildSeverity')}
                            {symptom.severity === 'moderate' && t('checkSymptoms.moderateSeverity')}
                            {symptom.severity === 'severe' && t('checkSymptoms.severeSeverity')}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Analysis Results - Responsive */
            <div className="space-y-6 sm:space-y-8">
              {/* Results Header - Responsive */}
              <div className="text-center mb-8 sm:mb-10 lg:mb-12">
                <h1 className="font-['Itim',Helvetica] text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-normal text-[#2b356c] mb-4 sm:mb-6 leading-tight">
                  {t('analysis.title')}
                </h1>
                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <Button
                    onClick={clearAllSymptoms}
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 font-['Itim',Helvetica] flex items-center gap-2 rounded-lg sm:rounded-xl justify-center"
                  >
                    <XIcon className="w-4 h-4" />
                    {t('checkSymptoms.clearAll')}
                  </Button>
                  <Button
                    onClick={() => setShowAnalysis(false)}
                    variant="outline"
                    className="font-['Itim',Helvetica] rounded-lg sm:rounded-xl"
                  >
                    {t('analysis.selectMoreSymptoms')}
                  </Button>
                </div>
                
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  <span className="text-black font-['Itim',Helvetica] text-base sm:text-lg">{t('analysis.analyzedSymptoms')}</span>
                  {getAllSelectedSymptoms().map(symptom => (
                    <span
                      key={symptom.id}
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-['Itim',Helvetica] ${
                        'isCustom' in symptom 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className="truncate max-w-[100px] sm:max-w-none inline-block">{symptom.name}</span>
                      {'isCustom' in symptom && <span className="ml-1 text-xs hidden sm:inline">({t('checkSymptoms.custom')})</span>}
                    </span>
                  ))}
                </div>
              </div>

              {/* Analysis Results Cards - Responsive */}
              {analysisResults?.conditions.map((result, index) => (
                <div key={index} className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4 sm:mb-6 gap-4 lg:gap-6">
                    <div className="flex-1">
                      <h3 className="font-['Itim',Helvetica] text-xl sm:text-2xl font-semibold text-[#2b356c] mb-2 sm:mb-3">
                        {result.name}
                      </h3>
                      <p className="font-['Itim',Helvetica] text-gray-600 mb-3 sm:mb-4 text-base sm:text-lg leading-relaxed">
                        {result.description}
                      </p>
                    </div>
                    
                    <div className="text-center lg:text-right lg:ml-6 flex-shrink-0">
                      <div className="text-3xl sm:text-4xl font-bold text-[#3991db] font-['Itim',Helvetica]">
                        {Math.round(result.probability)}%
                      </div>
                      <div className={`inline-block px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium border ${getSeverityColor(result.severity)} mt-2`}>
                        {result.severity === 'low' && t('analysis.lowRisk')}
                        {result.severity === 'medium' && t('analysis.mediumRisk')}
                        {result.severity === 'high' && t('analysis.highRisk')}
                      </div>
                    </div>
                  </div>

                  {/* Probability Bar - Responsive */}
                  <div className="mb-4 sm:mb-6">
                    <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4">
                      <div
                        className="bg-[#3991db] h-3 sm:h-4 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.round(result.probability)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Recommendations - Responsive */}
                  <div>
                    <h4 className="font-['Itim',Helvetica] font-semibold text-[#2b356c] mb-3 sm:mb-4 text-lg sm:text-xl">
                      {t('analysis.recommendations')}
                    </h4>
                    <ul className="space-y-2 sm:space-y-3">
                      {result.recommendations.map((rec, recIndex) => (
                        <li key={recIndex} className="flex items-start gap-2 sm:gap-3">
                          <span className="text-[#3991db] mt-1 text-lg sm:text-xl flex-shrink-0">•</span>
                          <span className="font-['Itim',Helvetica] text-gray-700 text-base sm:text-lg leading-relaxed">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}

              {/* Important Disclaimer - Responsive */}
              <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8">
                <div className="flex items-start gap-3 sm:gap-4">
                  <AlertTriangleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-['Itim',Helvetica] font-semibold text-red-800 mb-2 sm:mb-3 text-lg sm:text-xl">
                      {t('analysis.disclaimer')}
                    </h4>
                    <p className="font-['Itim',Helvetica] text-red-700 text-base sm:text-lg leading-relaxed">
                      {t('analysis.disclaimerText')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Messenger Chat Component */}
        <MessengerChat 
          symptoms={getCurrentSymptomNames()}
          onSymptomDiscussion={handleSymptomDiscussion}
        />
      </div>
    </main>
  );
};