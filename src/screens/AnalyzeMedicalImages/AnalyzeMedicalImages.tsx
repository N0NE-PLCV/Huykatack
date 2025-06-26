import React, { useState, useRef } from "react";
import { UploadIcon, ImageIcon, AlertTriangleIcon, TrendingUpIcon, XIcon, EyeIcon } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Header } from "../../components/ui/header";
import { useLanguage } from "../../contexts/LanguageContext";
import { useApi } from "../../hooks/useApi";
import { apiClient, ImageAnalysisResponse, convertFileToBase64, handleApiError } from "../../services/api";

interface AnalyzeMedicalImagesProps {
  onBack: () => void;
  currentPage: 'home' | 'check-symptoms' | 'analyze-images';
  onNavigate: (page: 'home' | 'check-symptoms' | 'analyze-images') => void;
  isLoggedIn: boolean;
  onLoginRequired: () => void;
  onProfileAction: (action: string) => void;
  onProfileClick: () => void;
  onLanguageChange: (lang: 'en' | 'th') => void;
}

interface UploadedImage {
  id: string;
  file: File;
  url: string;
  name: string;
  size: number;
  uploadedAt: Date;
}

interface SymptomDetection {
  symptom: string;
  confidence: number;
  location: string;
}

export const AnalyzeMedicalImages = ({ 
  onBack, 
  currentPage, 
  onNavigate, 
  isLoggedIn, 
  onLoginRequired, 
  onProfileAction, 
  onProfileClick,
  onLanguageChange 
}: AnalyzeMedicalImagesProps): JSX.Element => {
  const { language, t } = useLanguage();
  const { data: analysisResults, loading: isAnalyzing, error: analysisError, execute: executeAnalysis } = useApi<ImageAnalysisResponse>();
  
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [detectedSymptoms, setDetectedSymptoms] = useState<SymptomDetection[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    imageFiles.forEach(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`File ${file.name} is too large. Please select images under 10MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage: UploadedImage = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          file,
          url: e.target?.result as string,
          name: file.name,
          size: file.size,
          uploadedAt: new Date()
        };
        
        setUploadedImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (imageId: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
    if (uploadedImages.length === 1) {
      setShowAnalysis(false);
      setDetectedSymptoms([]);
    }
  };

  const analyzeImages = async () => {
    if (uploadedImages.length === 0) return;

    try {
      console.log('🚀 Starting predict_skin_disease analysis from skin_model_predict.py...');
      
      // Convert images to base64 and create enhanced descriptions for predict_skin_disease
      const imageAnalysisData = await Promise.all(
        uploadedImages.map(async (image) => {
          const base64 = await convertFileToBase64(image.file);
          
          // Generate enhanced description for predict_skin_disease analysis
          const description = await analyzeImageForPredictSkinDisease(image.file);
          
          return {
            description: description.description,
            location: description.location,
            base64: base64,
            filename: image.name,
            size: image.size,
            imageFile: image.file
          };
        })
      );

      console.log('📊 Calling predict_skin_disease with image data:', imageAnalysisData);

      // Call API with predict_skin_disease integration - this goes to skin_model_predict.py
      const result = await executeAnalysis(() => 
        apiClient.analyzeImages({
          images: imageAnalysisData,
          imageType: 'skin'
        })
      );

      if (result) {
        console.log('✅ predict_skin_disease analysis result:', result);
        
        // Extract detected symptoms from predict_skin_disease analysis results
        const symptoms: SymptomDetection[] = [];
        
        result.results?.forEach((imageResult, index) => {
          // Extract symptoms from predict_skin_disease conditions
          imageResult.conditions?.forEach(condition => {
            // Use predict_skin_disease detected symptoms directly
            if (condition.symptoms_detected) {
              condition.symptoms_detected.forEach(symptom => {
                symptoms.push({
                  symptom: symptom.replace(/_/g, ' '),
                  confidence: condition.confidence || condition.probability,
                  location: imageAnalysisData[index]?.location || 'unspecified'
                });
              });
            }
            
            // Add visual indicators from predict_skin_disease analysis
            if (condition.visual_indicators) {
              condition.visual_indicators.forEach(indicator => {
                symptoms.push({
                  symptom: indicator.replace(/_/g, ' '),
                  confidence: (condition.confidence || condition.probability) * 0.9,
                  location: imageAnalysisData[index]?.location || 'unspecified'
                });
              });
            }
          });
          
          // Add symptoms from predict_skin_disease visual analysis
          if (imageResult.symptoms_detected) {
            imageResult.symptoms_detected.forEach(symptom => {
              symptoms.push({
                symptom: symptom.replace(/_/g, ' '),
                confidence: 75, // Default confidence for predict_skin_disease detected symptoms
                location: imageAnalysisData[index]?.location || 'unspecified'
              });
            });
          }
        });

        // Remove duplicates and sort by confidence (preserving predict_skin_disease analysis)
        const uniqueSymptoms = symptoms.reduce((acc, current) => {
          const existing = acc.find(item => item.symptom === current.symptom && item.location === current.location);
          if (!existing) {
            acc.push(current);
          } else if (current.confidence > existing.confidence) {
            existing.confidence = current.confidence;
          }
          return acc;
        }, [] as SymptomDetection[]);

        setDetectedSymptoms(uniqueSymptoms.sort((a, b) => b.confidence - a.confidence));
        setShowAnalysis(true);
        
        console.log('🎯 predict_skin_disease analysis completed successfully');
      }
    } catch (error) {
      console.error('❌ Error in predict_skin_disease image analysis:', error);
    }
  };

  const analyzeImageForPredictSkinDisease = async (file: File): Promise<{description: string, location: string}> => {
    // Enhanced image analysis function for predict_skin_disease integration
    // This creates detailed descriptions that predict_skin_disease can analyze effectively
    
    const fileName = file.name.toLowerCase();
    let description = "Medical skin image for predict_skin_disease analysis showing ";
    let location = "unspecified";
    
    // Enhanced analysis based on filename and medical context for predict_skin_disease
    if (fileName.includes('face') || fileName.includes('facial')) {
      location = "face";
      description += "facial skin condition with potential dermatological features. May include redness, inflammation, scaling, lesions, or other skin abnormalities requiring medical evaluation.";
    } else if (fileName.includes('hand') || fileName.includes('finger')) {
      location = "hands";
      description += "hand or finger skin condition with possible rash, scaling, discoloration, inflammatory changes, or dermatological abnormalities. May show dry patches, red areas, or textural changes.";
    } else if (fileName.includes('foot') || fileName.includes('toe')) {
      location = "feet";
      description += "foot skin condition with potential ulceration, diabetic complications, swelling, infection signs, or wound characteristics. May show poor healing, vascular changes, or diabetic foot ulcer features.";
    } else if (fileName.includes('arm') || fileName.includes('leg')) {
      location = "limbs";
      description += "limb skin condition with possible skin changes, rash, lesions, inflammatory patterns, scaling, color variation, or textural abnormalities.";
    } else if (fileName.includes('mole') || fileName.includes('spot') || fileName.includes('lesion')) {
      location = "skin_lesion";
      description += "skin lesion or mole with potential asymmetric features, irregular borders, color variation, size changes, or characteristics requiring dermatological evaluation.";
    } else if (fileName.includes('ulcer') || fileName.includes('wound')) {
      location = "wound_site";
      description += "skin ulcer or wound with potential diabetic complications, poor healing characteristics, infection signs, or abnormal tissue appearance.";
    } else {
      description += "skin condition with visible dermatological changes, possible inflammation, discoloration, scaling, lesions, or other abnormalities requiring medical assessment.";
    }
    
    // Add detailed characteristics for predict_skin_disease analysis
    description += " Image contains skin features that may indicate various dermatological conditions including eczema, psoriasis, fungal infections, allergic reactions, diabetic foot ulcers, skin cancer concerns, or other medical conditions requiring professional dermatological evaluation. Visual characteristics may include texture changes, color variations, surface abnormalities, inflammatory signs, or pathological features.";
    
    return { description, location };
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
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
                  {t('analyzeMedicalImages.title')}
                </h1>
                <p className="font-['Itim',Helvetica] text-sm sm:text-base md:text-lg lg:text-xl text-black max-w-4xl mx-auto leading-relaxed px-2">
                  {t('analyzeMedicalImages.description')}
                </p>
                <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-purple-800 font-['Itim',Helvetica] text-sm">
                    🔬 Powered by predict_skin_disease from skin_model_predict.py + ai_chain_skin_doctor_reply from app_streamlit.py
                  </p>
                </div>
              </div>

              {/* Guidelines Card - Responsive */}
              <div className="bg-yellow-50/90 backdrop-blur-sm border border-yellow-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  <AlertTriangleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-['Itim',Helvetica] font-semibold text-yellow-800 mb-3 sm:mb-4 text-lg sm:text-xl">
                      {t('analyzeMedicalImages.guidelines')}
                    </h4>
                    <ul className="font-['Itim',Helvetica] text-yellow-700 text-sm sm:text-base lg:text-lg space-y-1 sm:space-y-2">
                      <li>{t('analyzeMedicalImages.guideline1')}</li>
                      <li>{t('analyzeMedicalImages.guideline2')}</li>
                      <li>{t('analyzeMedicalImages.guideline3')}</li>
                      <li>{t('analyzeMedicalImages.guideline4')}</li>
                      <li>{t('analyzeMedicalImages.guideline5')}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Upload Area - Responsive */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
                <div
                  className={`border-2 border-dashed rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 text-center transition-colors ${
                    dragActive
                      ? 'border-[#3991db] bg-blue-50'
                      : 'border-gray-300 hover:border-[#3991db] hover:bg-gray-50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-gray-400 mx-auto mb-4 sm:mb-6" />
                  <h3 className="font-['Itim',Helvetica] text-lg sm:text-xl lg:text-2xl font-semibold text-gray-700 mb-3 sm:mb-4">
                    {t('analyzeMedicalImages.dragDrop')}
                  </h3>
                  <p className="font-['Itim',Helvetica] text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base lg:text-lg">
                    {t('analyzeMedicalImages.clickToBrowse')}
                  </p>
                  
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#3991db] hover:bg-[#2b7bc7] text-white px-6 sm:px-8 py-3 sm:py-4 font-['Itim',Helvetica] text-base sm:text-lg rounded-lg sm:rounded-xl flex items-center gap-2 sm:gap-3 mx-auto"
                  >
                    <UploadIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    {t('analyzeMedicalImages.chooseFiles')}
                  </Button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Uploaded Images - Responsive */}
              {uploadedImages.length > 0 && (
                <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                    <h3 className="font-['Itim',Helvetica] text-lg sm:text-xl lg:text-2xl font-semibold text-[#2b356c]">
                      {t('analyzeMedicalImages.uploadedImages')} ({uploadedImages.length})
                    </h3>
                    <Button
                      onClick={analyzeImages}
                      disabled={isAnalyzing}
                      className="bg-[#3991db] hover:bg-[#2b7bc7] text-white px-6 sm:px-8 py-3 sm:py-4 font-['Itim',Helvetica] text-base sm:text-lg rounded-lg sm:rounded-xl flex items-center gap-2 sm:gap-3 justify-center w-full sm:w-auto"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white"></div>
                          Analyzing with predict_skin_disease...
                        </>
                      ) : (
                        <>
                          <EyeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                          Analyze with predict_skin_disease
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Show API Error if any */}
                  {analysisError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 font-['Itim',Helvetica] text-sm">
                        {handleApiError(analysisError)}
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {uploadedImages.map(image => (
                      <div key={image.id} className="relative group">
                        <div className="aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200">
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <button
                          onClick={() => removeImage(image.id)}
                          className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-red-500 text-white rounded-full p-1 sm:p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <XIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        
                        <div className="mt-2 sm:mt-3">
                          <p className="font-['Itim',Helvetica] text-sm sm:text-base lg:text-lg font-medium text-gray-700 truncate">
                            {image.name}
                          </p>
                          <p className="font-['Itim',Helvetica] text-xs sm:text-sm text-gray-500">
                            {formatFileSize(image.size)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Analysis Results from predict_skin_disease - Responsive */
            <div className="space-y-6 sm:space-y-8">
              {/* Results Header - Responsive */}
              <div className="text-center mb-8 sm:mb-10 lg:mb-12">
                <h1 className="font-['Itim',Helvetica] text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-normal text-[#2b356c] mb-4 sm:mb-6 leading-tight">
                  {t('analyzeMedicalImages.analysisResults')}
                </h1>
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-['Itim',Helvetica] text-sm">
                    ✅ Analysis completed by predict_skin_disease + ai_chain_skin_doctor_reply
                  </p>
                </div>
                <div className="flex justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <Button
                    onClick={() => {
                      setShowAnalysis(false);
                      setDetectedSymptoms([]);
                    }}
                    variant="outline"
                    className="font-['Itim',Helvetica] rounded-lg sm:rounded-xl text-sm sm:text-base"
                  >
                    {t('analyzeMedicalImages.uploadMoreImages')}
                  </Button>
                </div>
                
                <p className="font-['Itim',Helvetica] text-black text-base sm:text-lg">
                  {t('analyzeMedicalImages.analysisCompleted')} {uploadedImages.length} {uploadedImages.length !== 1 ? t('analyzeMedicalImages.images') : t('analyzeMedicalImages.image')}
                </p>
              </div>

              {/* Uploaded Images Preview - Responsive */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
                <h3 className="font-['Itim',Helvetica] text-lg sm:text-xl lg:text-2xl font-semibold text-[#2b356c] mb-4 sm:mb-6">
                  {t('analyzeMedicalImages.analyzedImages')}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
                  {uploadedImages.map(image => (
                    <div key={image.id} className="aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* predict_skin_disease Analysis Results Cards - Responsive */}
              {analysisResults?.results.map((result, index) => (
                <div key={index} className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
                  <h3 className="font-['Itim',Helvetica] text-lg sm:text-xl lg:text-2xl font-semibold text-[#2b356c] mb-4 sm:mb-6">
                    Image {index + 1} Analysis (predict_skin_disease)
                  </h3>
                  
                  {/* CNN Prediction Results */}
                  {result.predicted_class && (
                    <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-['Itim',Helvetica] font-semibold text-purple-800 mb-2">
                        🧠 CNN Model Prediction (predict_skin_disease)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Predicted Class:</span> 
                          <span className="ml-1">{result.predicted_class}</span>
                        </div>
                        <div>
                          <span className="font-medium">CNN Confidence:</span> 
                          <span className="ml-1">{result.cnn_confidence ? `${(result.cnn_confidence * 100).toFixed(1)}%` : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Doctor Response from app_streamlit.py */}
                  {result.ai_response && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-['Itim',Helvetica] font-semibold text-blue-800 mb-3">
                        🩺 AI Doctor Response (ai_chain_skin_doctor_reply)
                      </h4>
                      <div className="text-blue-900 font-['Itim',Helvetica] text-base leading-relaxed whitespace-pre-line">
                        {result.ai_response}
                      </div>
                    </div>
                  )}
                  
                  {/* Visual Analysis Summary from predict_skin_disease */}
                  {result.visual_analysis && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-['Itim',Helvetica] font-semibold text-gray-800 mb-2">predict_skin_disease Visual Analysis</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Location:</span> 
                          <span className="ml-1 capitalize">{result.visual_analysis.location}</span>
                        </div>
                        <div>
                          <span className="font-medium">Characteristics:</span> 
                          <span className="ml-1">{result.visual_analysis.characteristics.length}</span>
                        </div>
                        <div>
                          <span className="font-medium">Severity Indicators:</span> 
                          <span className="ml-1">{result.visual_analysis.severity_indicators.length}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {result.conditions.map((condition, conditionIndex) => (
                    <div key={conditionIndex} className="mb-6 sm:mb-8 last:mb-0">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4 sm:mb-6 gap-4 lg:gap-6">
                        <div className="flex-1">
                          <h4 className="font-['Itim',Helvetica] text-xl sm:text-2xl font-semibold text-[#2b356c] mb-2 sm:mb-3">
                            {condition.name}
                            <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                              predict_skin_disease
                            </span>
                          </h4>
                          <p className="font-['Itim',Helvetica] text-gray-600 mb-3 sm:mb-4 text-base sm:text-lg leading-relaxed">
                            {condition.description}
                          </p>
                          
                          {/* Symptoms Detected by predict_skin_disease */}
                          {condition.symptoms_detected && condition.symptoms_detected.length > 0 && (
                            <div className="mb-3">
                              <h5 className="font-['Itim',Helvetica] font-medium text-gray-700 mb-2">predict_skin_disease Detected Symptoms:</h5>
                              <div className="flex flex-wrap gap-2">
                                {condition.symptoms_detected.map((symptom, symIndex) => (
                                  <span key={symIndex} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                    {symptom.replace(/_/g, ' ')}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Visual Indicators from predict_skin_disease */}
                          {condition.visual_indicators && condition.visual_indicators.length > 0 && (
                            <div className="mb-3">
                              <h5 className="font-['Itim',Helvetica] font-medium text-gray-700 mb-2">Visual Indicators:</h5>
                              <div className="flex flex-wrap gap-2">
                                {condition.visual_indicators.map((indicator, indIndex) => (
                                  <span key={indIndex} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                                    {indicator.replace(/_/g, ' ')}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-center lg:text-right lg:ml-6 flex-shrink-0">
                          <div className="text-3xl sm:text-4xl font-bold text-[#3991db] font-['Itim',Helvetica]">
                            {condition.probability}%
                          </div>
                          <div className="text-base sm:text-lg text-gray-500 font-['Itim',Helvetica] mb-2 sm:mb-3">
                            {t('analyzeMedicalImages.confidence')} {condition.confidence}%
                          </div>
                          <div className={`inline-block px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium border ${getSeverityColor(condition.severity)}`}>
                            {condition.severity === 'low' && t('analysis.lowRisk')}
                            {condition.severity === 'medium' && t('analysis.mediumRisk')}
                            {condition.severity === 'high' && t('analysis.highRisk')}
                          </div>
                        </div>
                      </div>

                      {/* Probability Bar - Responsive */}
                      <div className="mb-4 sm:mb-6">
                        <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4">
                          <div
                            className="bg-[#3991db] h-3 sm:h-4 rounded-full transition-all duration-1000"
                            style={{ width: `${condition.probability}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* predict_skin_disease Recommendations - Responsive */}
                      <div>
                        <h5 className="font-['Itim',Helvetica] font-semibold text-[#2b356c] mb-3 sm:mb-4 text-lg sm:text-xl">
                          {t('analysis.recommendations')} (predict_skin_disease)
                        </h5>
                        <ul className="space-y-2 sm:space-y-3">
                          {condition.recommendations.map((rec, recIndex) => (
                            <li key={recIndex} className="flex items-start gap-2 sm:gap-3">
                              <span className="text-[#3991db] mt-1 text-lg sm:text-xl flex-shrink-0">•</span>
                              <span className="font-['Itim',Helvetica] text-gray-700 text-base sm:text-lg leading-relaxed">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* Important Disclaimer - Responsive */}
              <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8">
                <div className="flex items-start gap-3 sm:gap-4">
                  <AlertTriangleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-['Itim',Helvetica] font-semibold text-red-800 mb-2 sm:mb-3 text-lg sm:text-xl">
                      {t('analyzeMedicalImages.medicalDisclaimer')}
                    </h4>
                    <p className="font-['Itim',Helvetica] text-red-700 text-base sm:text-lg leading-relaxed">
                      {t('analyzeMedicalImages.medicalDisclaimerText')} This analysis was performed by predict_skin_disease function with ai_chain_skin_doctor_reply from app_streamlit.py for educational purposes only.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};