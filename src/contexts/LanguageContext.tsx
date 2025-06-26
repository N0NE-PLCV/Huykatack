import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'th';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations = {
  en: {
    // Home Page
    'home.title1': 'Advanced Healthcare',
    'home.title2': 'Diagnosis Assistant',
    'home.description': 'Harness the power of artificial intelligence to analyze medical images and symptoms.\nGet fast, accurate diagnostic insights using advanced machine learning models',
    'home.getStarted': 'Get started',
    
    // Login Modal
    'login.title': 'Welcome Back',
    'login.subtitle': 'Sign in to your MediAssist account',
    'login.email': 'Email Address',
    'login.password': 'Password',
    'login.rememberMe': 'Remember me',
    'login.forgotPassword': 'Forgot Password?',
    'login.signIn': 'Sign In',
    'login.noAccount': "Don't have an account?",
    'login.signUp': 'Sign Up',
    'login.emailPlaceholder': 'Enter your email',
    'login.passwordPlaceholder': 'Enter your password',
    
    // Register Modal
    'register.title': 'Create Account',
    'register.subtitle': 'Join MediAssist to get started',
    'register.confirmPassword': 'Confirm Password',
    'register.createAccount': 'Create Account',
    'register.hasAccount': 'Already have an account?',
    'register.signIn': 'Sign In',
    'register.passwordPlaceholder': 'Create a password (min. 8 characters)',
    'register.confirmPasswordPlaceholder': 'Confirm your password',
    
    // Dropdown Menu
    'dropdown.myProfile': 'My Profile',
    'dropdown.editPatientInfo': 'Edit your patient information',
    'dropdown.settings': 'Settings',
    'dropdown.help': 'Help & Support',
    'dropdown.signOut': 'Sign Out',
    'dropdown.login': 'Login',
    'dropdown.register': 'Register',
    'dropdown.language': 'Language',
    'dropdown.english': 'English',
    'dropdown.thai': 'ไทย',
    
    // Patient Info Page
    'patientInfo.title': 'Patient Information',
    'patientInfo.editTitle': 'Edit Patient Information',
    'patientInfo.back': 'Back',
    'patientInfo.cancel': 'Cancel',
    'patientInfo.save': 'Save Information',
    'patientInfo.update': 'Update Information',
    
    // Personal Information Section
    'patientInfo.personalInfo': 'Personal Information',
    'patientInfo.firstName': 'First Name',
    'patientInfo.lastName': 'Last Name',
    'patientInfo.dateOfBirth': 'Date of Birth',
    'patientInfo.gender': 'Gender',
    'patientInfo.phoneNumber': 'Phone Number',
    'patientInfo.email': 'Email Address',
    'patientInfo.firstNamePlaceholder': 'Enter your first name',
    'patientInfo.lastNamePlaceholder': 'Enter your last name',
    'patientInfo.phoneNumberPlaceholder': 'Enter your phone number',
    'patientInfo.emailPlaceholder': 'Enter your email',
    'patientInfo.selectGender': 'Select gender',
    'patientInfo.male': 'Male',
    'patientInfo.female': 'Female',
    'patientInfo.other': 'Other',
    'patientInfo.preferNotToSay': 'Prefer not to say',
    
    // Address Information Section
    'patientInfo.addressInfo': 'Address Information',
    'patientInfo.streetAddress': 'Street Address',
    'patientInfo.city': 'City',
    'patientInfo.state': 'State/Province',
    'patientInfo.zipCode': 'ZIP/Postal Code',
    'patientInfo.country': 'Country',
    'patientInfo.streetAddressPlaceholder': 'Enter your street address',
    'patientInfo.cityPlaceholder': 'Enter your city',
    'patientInfo.statePlaceholder': 'Enter your state or province',
    'patientInfo.zipCodePlaceholder': 'Enter your ZIP or postal code',
    'patientInfo.countryPlaceholder': 'Enter your country',
    
    // Emergency Contact Section
    'patientInfo.emergencyContact': 'Emergency Contact',
    'patientInfo.contactName': 'Contact Name',
    'patientInfo.contactPhone': 'Contact Phone',
    'patientInfo.relationship': 'Relationship',
    'patientInfo.contactNamePlaceholder': 'Enter emergency contact name',
    'patientInfo.contactPhonePlaceholder': 'Enter emergency contact phone',
    'patientInfo.relationshipPlaceholder': 'Enter relationship (e.g., spouse, parent)',
    
    // Medical Information Section
    'patientInfo.medicalInfo': 'Medical Information',
    'patientInfo.bloodType': 'Blood Type',
    'patientInfo.insuranceProvider': 'Insurance Provider',
    'patientInfo.insurancePolicyNumber': 'Insurance Policy Number',
    'patientInfo.allergies': 'Allergies',
    'patientInfo.currentMedications': 'Current Medications',
    'patientInfo.medicalConditions': 'Medical Conditions',
    'patientInfo.selectBloodType': 'Select blood type',
    'patientInfo.insuranceProviderPlaceholder': 'Enter your insurance provider',
    'patientInfo.insurancePolicyNumberPlaceholder': 'Enter your insurance policy number',
    'patientInfo.allergiesPlaceholder': 'List any allergies (medications, food, environmental, etc.)',
    'patientInfo.currentMedicationsPlaceholder': 'List current medications and dosages',
    'patientInfo.medicalConditionsPlaceholder': 'List any chronic conditions, past surgeries, or significant medical history',
    
    // Additional Information Section
    'patientInfo.additionalInfo': 'Additional Information',
    'patientInfo.preferredLanguage': 'Preferred Language',
    'patientInfo.occupation': 'Occupation',
    'patientInfo.maritalStatus': 'Marital Status',
    'patientInfo.selectPreferredLanguage': 'Select preferred language',
    'patientInfo.occupationPlaceholder': 'Enter your occupation',
    'patientInfo.selectMaritalStatus': 'Select marital status',
    'patientInfo.single': 'Single',
    'patientInfo.married': 'Married',
    'patientInfo.divorced': 'Divorced',
    'patientInfo.widowed': 'Widowed',
    'patientInfo.separated': 'Separated',
    'patientInfo.english': 'English',
    'patientInfo.spanish': 'Spanish',
    'patientInfo.french': 'French',
    'patientInfo.german': 'German',
    'patientInfo.chinese': 'Chinese',
    
    // Profile Picture Section
    'patientInfo.profilePicture': 'Profile Picture',
    'patientInfo.updateProfilePicture': 'Update Your Profile Picture',
    'patientInfo.profilePictureDescription': 'Upload a clear photo of yourself. This will help healthcare providers identify you.',
    'patientInfo.choosePhoto': 'Choose Photo',
    'patientInfo.profilePictureLimit': 'Max file size: 5MB. Supported formats: JPG, PNG, WEBP',
    
    // Medical Images Section
    'patientInfo.medicalImages': 'Medical Images & Documents',
    'patientInfo.medicalImagesDescription': 'Upload any relevant medical images, test results, or documents that might be helpful for healthcare providers.',
    'patientInfo.uploadMedicalImages': 'Upload Medical Images',
    'patientInfo.medicalImagesLimit': 'Max file size: 10MB per image. Supported formats: JPG, PNG, WEBP',
    'patientInfo.uploadedImages': 'Uploaded Images',
    
    // Check Symptoms Page
    'checkSymptoms.title': 'Describe Your Symptoms',
    'checkSymptoms.description': 'You can either select from common symptoms below or describe your symptoms in your own words. Our AI will analyze them to provide potential conditions and recommendations.',
    'checkSymptoms.customSymptomLabel': 'Describe your symptoms in your own words:',
    'checkSymptoms.customSymptomPlaceholder': 'e.g., sharp pain in my lower back, feeling dizzy when I stand up...',
    'checkSymptoms.add': 'Add',
    'checkSymptoms.customSymptomHint': 'Press Enter or click Add to include your symptom',
    'checkSymptoms.searchPlaceholder': 'Or search from common symptoms...',
    'checkSymptoms.selectedSymptoms': 'Selected Symptoms',
    'checkSymptoms.clearAll': 'Clear All',
    'checkSymptoms.analyzeSymptoms': 'Analyze Symptoms',
    'checkSymptoms.analyzingSymptoms': 'Analyzing Symptoms...',
    'checkSymptoms.customSymptoms': 'Your Custom Symptoms',
    'checkSymptoms.customSymptom': 'custom symptom',
    'checkSymptoms.custom': 'custom',
    'checkSymptoms.mildSeverity': 'mild severity',
    'checkSymptoms.moderateSeverity': 'moderate severity',
    'checkSymptoms.severeSeverity': 'severe severity',
    
    // Analysis Results
    'analysis.title': 'Analysis Results',
    'analysis.selectMoreSymptoms': 'Select More Symptoms',
    'analysis.analyzedSymptoms': 'Analyzed symptoms:',
    'analysis.recommendations': 'Recommendations:',
    'analysis.lowRisk': 'LOW RISK',
    'analysis.mediumRisk': 'MEDIUM RISK',
    'analysis.highRisk': 'HIGH RISK',
    'analysis.disclaimer': 'Important Medical Disclaimer',
    'analysis.disclaimerText': 'This analysis is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. The percentages shown are estimates based on symptom patterns and should not be considered definitive. Always consult with a qualified healthcare provider for proper medical evaluation, especially if you have severe symptoms or if your condition worsens.',
    
    // Analyze Medical Images Page
    'analyzeMedicalImages.title': 'Upload Medical Images for AI Analysis',
    'analyzeMedicalImages.description': 'Upload clear, high-quality images of skin lesions, moles, or other medical conditions. Our AI will analyze them and provide potential diagnoses with confidence percentages.',
    'analyzeMedicalImages.guidelines': 'Important Guidelines',
    'analyzeMedicalImages.guideline1': '• Ensure good lighting and clear focus',
    'analyzeMedicalImages.guideline2': '• Include a reference object (coin, ruler) for size comparison',
    'analyzeMedicalImages.guideline3': '• Take multiple angles if possible',
    'analyzeMedicalImages.guideline4': '• Maximum file size: 10MB per image',
    'analyzeMedicalImages.guideline5': '• Supported formats: JPG, PNG, WEBP',
    'analyzeMedicalImages.dragDrop': 'Drag and drop your medical images here',
    'analyzeMedicalImages.clickToBrowse': 'or click to browse your files',
    'analyzeMedicalImages.chooseFiles': 'Choose Files',
    'analyzeMedicalImages.uploadedImages': 'Uploaded Images',
    'analyzeMedicalImages.analyzeImages': 'Analyze Images',
    'analyzeMedicalImages.analyzingImages': 'Analyzing Images...',
    'analyzeMedicalImages.analysisResults': 'AI Analysis Results',
    'analyzeMedicalImages.uploadMoreImages': 'Upload More Images',
    'analyzeMedicalImages.analysisCompleted': 'Analysis completed for',
    'analyzeMedicalImages.image': 'image',
    'analyzeMedicalImages.images': 'images',
    'analyzeMedicalImages.analyzedImages': 'Analyzed Images',
    'analyzeMedicalImages.confidence': 'Confidence:',
    'analyzeMedicalImages.communityComments': 'Community Comments',
    'analyzeMedicalImages.shareThoughts': 'Share your thoughts or experience',
    'analyzeMedicalImages.commentPlaceholder': 'Share your experience, ask questions, or provide insights about similar cases...',
    'analyzeMedicalImages.charactersLimit': 'characters',
    'analyzeMedicalImages.postComment': 'Post Comment',
    'analyzeMedicalImages.justNow': 'Just now',
    'analyzeMedicalImages.minutesAgo': 'minutes ago',
    'analyzeMedicalImages.hoursAgo': 'hours ago',
    'analyzeMedicalImages.daysAgo': 'days ago',
    'analyzeMedicalImages.medicalDisclaimer': 'Critical Medical Disclaimer',
    'analyzeMedicalImages.medicalDisclaimerText': 'This AI analysis is for educational and informational purposes only and should NEVER replace professional medical diagnosis or treatment. The percentages and conditions shown are algorithmic estimates and may not be accurate. ALWAYS consult with qualified healthcare professionals, especially dermatologists or oncologists, for proper medical evaluation of any skin lesions or medical conditions. Early professional diagnosis can be life-saving for serious conditions like skin cancer.',
    
    // Validation Messages
    'validation.required': 'is required',
    'validation.emailInvalid': 'Please enter a valid email',
    'validation.passwordMinLength': 'Password must be at least 6 characters',
    'validation.passwordsDoNotMatch': 'Passwords do not match',
    'validation.confirmPasswordRequired': 'Please confirm your password',
    'validation.passwordMinLengthRegister': 'Password must be at least 8 characters',
  },
  th: {
    // Home Page
    'home.title1': 'ระบบดูแลสุขภาพขั้นสูง',
    'home.title2': 'ผู้ช่วยวินิจฉัยโรค',
    'home.description': 'ใช้พลังของปัญญาประดิษฐ์ในการวิเคราะห์ภาพทางการแพทย์และอาการต่างๆ\nรับข้อมูลเชิงลึกในการวินิจฉัยที่รวดเร็วและแม่นยำด้วยโมเดลการเรียนรู้ของเครื่องขั้นสูง',
    'home.getStarted': 'เริ่มต้นใช้งาน',
    
    // Login Modal
    'login.title': 'ยินดีต้อนรับกลับ',
    'login.subtitle': 'เข้าสู่ระบบบัญชี MediAssist ของคุณ',
    'login.email': 'ที่อยู่อีเมล',
    'login.password': 'รหัสผ่าน',
    'login.rememberMe': 'จดจำฉัน',
    'login.forgotPassword': 'ลืมรหัสผ่าน?',
    'login.signIn': 'เข้าสู่ระบบ',
    'login.noAccount': 'ยังไม่มีบัญชี?',
    'login.signUp': 'สมัครสมาชิก',
    'login.emailPlaceholder': 'กรอกอีเมลของคุณ',
    'login.passwordPlaceholder': 'กรอกรหัสผ่านของคุณ',
    
    // Register Modal
    'register.title': 'สร้างบัญชี',
    'register.subtitle': 'เข้าร่วม MediAssist เพื่อเริ่มต้นใช้งาน',
    'register.confirmPassword': 'ยืนยันรหัสผ่าน',
    'register.createAccount': 'สร้างบัญชี',
    'register.hasAccount': 'มีบัญชีแล้ว?',
    'register.signIn': 'เข้าสู่ระบบ',
    'register.passwordPlaceholder': 'สร้างรหัสผ่าน (อย่างน้อย 8 ตัวอักษร)',
    'register.confirmPasswordPlaceholder': 'ยืนยันรหัสผ่านของคุณ',
    
    // Dropdown Menu
    'dropdown.myProfile': 'โปรไฟล์ของฉัน',
    'dropdown.editPatientInfo': 'แก้ไขข้อมูลผู้ป่วยของคุณ',
    'dropdown.settings': 'การตั้งค่า',
    'dropdown.help': 'ช่วยเหลือและสนับสนุน',
    'dropdown.signOut': 'ออกจากระบบ',
    'dropdown.login': 'เข้าสู่ระบบ',
    'dropdown.register': 'สมัครสมาชิก',
    'dropdown.language': 'ภาษา',
    'dropdown.english': 'English',
    'dropdown.thai': 'ไทย',
    
    // Patient Info Page
    'patientInfo.title': 'ข้อมูลผู้ป่วย',
    'patientInfo.editTitle': 'แก้ไขข้อมูลผู้ป่วย',
    'patientInfo.back': 'กลับ',
    'patientInfo.cancel': 'ยกเลิก',
    'patientInfo.save': 'บันทึกข้อมูล',
    'patientInfo.update': 'อัปเดตข้อมูล',
    
    // Personal Information Section
    'patientInfo.personalInfo': 'ข้อมูลส่วนตัว',
    'patientInfo.firstName': 'ชื่อ',
    'patientInfo.lastName': 'นามสกุล',
    'patientInfo.dateOfBirth': 'วันเกิด',
    'patientInfo.gender': 'เพศ',
    'patientInfo.phoneNumber': 'หมายเลขโทรศัพท์',
    'patientInfo.email': 'ที่อยู่อีเมล',
    'patientInfo.firstNamePlaceholder': 'กรอกชื่อของคุณ',
    'patientInfo.lastNamePlaceholder': 'กรอกนามสกุลของคุณ',
    'patientInfo.phoneNumberPlaceholder': 'กรอกหมายเลขโทรศัพท์ของคุณ',
    'patientInfo.emailPlaceholder': 'กรอกอีเมลของคุณ',
    'patientInfo.selectGender': 'เลือกเพศ',
    'patientInfo.male': 'ชาย',
    'patientInfo.female': 'หญิง',
    'patientInfo.other': 'อื่นๆ',
    'patientInfo.preferNotToSay': 'ไม่ต้องการระบุ',
    
    // Address Information Section
    'patientInfo.addressInfo': 'ข้อมูลที่อยู่',
    'patientInfo.streetAddress': 'ที่อยู่',
    'patientInfo.city': 'เมือง',
    'patientInfo.state': 'รัฐ/จังหวัด',
    'patientInfo.zipCode': 'รหัสไปรษณีย์',
    'patientInfo.country': 'ประเทศ',
    'patientInfo.streetAddressPlaceholder': 'กรอกที่อยู่ของคุณ',
    'patientInfo.cityPlaceholder': 'กรอกเมืองของคุณ',
    'patientInfo.statePlaceholder': 'กรอกรัฐหรือจังหวัดของคุณ',
    'patientInfo.zipCodePlaceholder': 'กรอกรหัสไปรษณีย์ของคุณ',
    'patientInfo.countryPlaceholder': 'กรอกประเทศของคุณ',
    
    // Emergency Contact Section
    'patientInfo.emergencyContact': 'ผู้ติดต่อฉุกเฉิน',
    'patientInfo.contactName': 'ชื่อผู้ติดต่อ',
    'patientInfo.contactPhone': 'โทรศัพท์ผู้ติดต่อ',
    'patientInfo.relationship': 'ความสัมพันธ์',
    'patientInfo.contactNamePlaceholder': 'กรอกชื่อผู้ติดต่อฉุกเฉิน',
    'patientInfo.contactPhonePlaceholder': 'กรอกโทรศัพท์ผู้ติดต่อฉุกเฉิน',
    'patientInfo.relationshipPlaceholder': 'กรอกความสัมพันธ์ (เช่น คู่สมรส, พ่อแม่)',
    
    // Medical Information Section
    'patientInfo.medicalInfo': 'ข้อมูลทางการแพทย์',
    'patientInfo.bloodType': 'หมู่เลือด',
    'patientInfo.insuranceProvider': 'บริษัทประกันภัย',
    'patientInfo.insurancePolicyNumber': 'หมายเลขกรมธรรม์ประกันภัย',
    'patientInfo.allergies': 'อาการแพ้',
    'patientInfo.currentMedications': 'ยาที่ใช้ในปัจจุบัน',
    'patientInfo.medicalConditions': 'ประวัติการรักษา',
    'patientInfo.selectBloodType': 'เลือกหมู่เลือด',
    'patientInfo.insuranceProviderPlaceholder': 'กรอกบริษัทประกันภัยของคุณ',
    'patientInfo.insurancePolicyNumberPlaceholder': 'กรอกหมายเลขกรมธรรม์ประกันภัยของคุณ',
    'patientInfo.allergiesPlaceholder': 'ระบุอาการแพ้ (ยา, อาหาร, สิ่งแวดล้อม ฯลฯ)',
    'patientInfo.currentMedicationsPlaceholder': 'ระบุยาที่ใช้ในปัจจุบันและขนาดยา',
    'patientInfo.medicalConditionsPlaceholder': 'ระบุโรคเรื้อรัง, การผ่าตัดในอดีต หรือประวัติการรักษาที่สำคัญ',
    
    // Additional Information Section
    'patientInfo.additionalInfo': 'ข้อมูลเพิ่มเติม',
    'patientInfo.preferredLanguage': 'ภาษาที่ต้องการ',
    'patientInfo.occupation': 'อาชีพ',
    'patientInfo.maritalStatus': 'สถานภาพสมรส',
    'patientInfo.selectPreferredLanguage': 'เลือกภาษาที่ต้องการ',
    'patientInfo.occupationPlaceholder': 'กรอกอาชีพของคุณ',
    'patientInfo.selectMaritalStatus': 'เลือกสถานภาพสมรส',
    'patientInfo.single': 'โสด',
    'patientInfo.married': 'แต่งงาน',
    'patientInfo.divorced': 'หย่าร้าง',
    'patientInfo.widowed': 'ม่าย',
    'patientInfo.separated': 'แยกกันอยู่',
    'patientInfo.english': 'อังกฤษ',
    'patientInfo.spanish': 'สเปน',
    'patientInfo.french': 'ฝรั่งเศส',
    'patientInfo.german': 'เยอรมัน',
    'patientInfo.chinese': 'จีน',
    
    // Profile Picture Section
    'patientInfo.profilePicture': 'รูปโปรไฟล์',
    'patientInfo.updateProfilePicture': 'อัปเดตรูปโปรไฟล์ของคุณ',
    'patientInfo.profilePictureDescription': 'อัปโหลดรูปถ่ายที่ชัดเจนของคุณ ซึ่งจะช่วยให้ผู้ให้บริการด้านสุขภาพสามารถระบุตัวคุณได้',
    'patientInfo.choosePhoto': 'เลือกรูปภาพ',
    'patientInfo.profilePictureLimit': 'ขนาดไฟล์สูงสุด: 5MB รองรับรูปแบบ: JPG, PNG, WEBP',
    
    // Medical Images Section
    'patientInfo.medicalImages': 'ภาพทางการแพทย์และเอกสาร',
    'patientInfo.medicalImagesDescription': 'อัปโหลดภาพทางการแพทย์, ผลการตรวจ หรือเอกสารที่เกี่ยวข้องที่อาจเป็นประโยชน์สำหรับผู้ให้บริการด้านสุขภาพ',
    'patientInfo.uploadMedicalImages': 'อัปโหลดภาพทางการแพทย์',
    'patientInfo.medicalImagesLimit': 'ขนาดไฟล์สูงสุด: 10MB ต่อภาพ รองรับรูปแบบ: JPG, PNG, WEBP',
    'patientInfo.uploadedImages': 'ภาพที่อัปโหลด',
    
    // Check Symptoms Page
    'checkSymptoms.title': 'อธิบายอาการของคุณ',
    'checkSymptoms.description': 'คุณสามารถเลือกจากอาการทั่วไปด้านล่างหรืออธิบายอาการของคุณด้วยคำพูดของคุณเอง AI ของเราจะวิเคราะห์เพื่อให้ข้อมูลเกี่ยวกับภาวะที่เป็นไปได้และคำแนะนำ',
    'checkSymptoms.customSymptomLabel': 'อธิบายอาการของคุณด้วยคำพูดของคุณเอง:',
    'checkSymptoms.customSymptomPlaceholder': 'เช่น ปวดแปลบที่หลังส่วนล่าง, รู้สึกเวียนหัวเมื่อลุกขึ้นยืน...',
    'checkSymptoms.add': 'เพิ่ม',
    'checkSymptoms.customSymptomHint': 'กด Enter หรือคลิกเพิ่มเพื่อรวมอาการของคุณ',
    'checkSymptoms.searchPlaceholder': 'หรือค้นหาจากอาการทั่วไป...',
    'checkSymptoms.selectedSymptoms': 'อาการที่เลือก',
    'checkSymptoms.clearAll': 'ล้างทั้งหมด',
    'checkSymptoms.analyzeSymptoms': 'วิเคราะห์อาการ',
    'checkSymptoms.analyzingSymptoms': 'กำลังวิเคราะห์อาการ...',
    'checkSymptoms.customSymptoms': 'อาการที่คุณกำหนดเอง',
    'checkSymptoms.customSymptom': 'อาการที่กำหนดเอง',
    'checkSymptoms.custom': 'กำหนดเอง',
    'checkSymptoms.mildSeverity': 'ความรุนแรงเล็กน้อย',
    'checkSymptoms.moderateSeverity': 'ความรุนแรงปานกลาง',
    'checkSymptoms.severeSeverity': 'ความรุนแรงมาก',
    
    // Analysis Results
    'analysis.title': 'ผลการวิเคราะห์',
    'analysis.selectMoreSymptoms': 'เลือกอาการเพิ่มเติม',
    'analysis.analyzedSymptoms': 'อาการที่วิเคราะห์:',
    'analysis.recommendations': 'คำแนะนำ:',
    'analysis.lowRisk': 'ความเสี่ยงต่ำ',
    'analysis.mediumRisk': 'ความเสี่ยงปานกลาง',
    'analysis.highRisk': 'ความเสี่ยงสูง',
    'analysis.disclaimer': 'ข้อจำกัดความรับผิดชอบทางการแพทย์ที่สำคัญ',
    'analysis.disclaimerText': 'การวิเคราะห์นี้มีไว้เพื่อการให้ข้อมูลเท่านั้น และไม่ควรใช้แทนคำแนะนำ การวินิจฉัย หรือการรักษาทางการแพทย์จากผู้เชี่ยวชาญ เปอร์เซ็นต์ที่แสดงเป็นการประมาณการจากรูปแบบอาการและไม่ควรถือเป็นข้อสรุปที่แน่นอน ควรปรึกษาผู้ให้บริการด้านสุขภาพที่มีคุณสมบัติเสมอสำหรับการประเมินทางการแพทย์ที่เหมาะสม โดยเฉพาะอย่างยิ่งหากคุณมีอาการรุนแรงหรือหากอาการของคุณแย่ลง',
    
    // Analyze Medical Images Page
    'analyzeMedicalImages.title': 'อัปโหลดภาพทางการแพทย์สำหรับการวิเคราะห์ด้วย AI',
    'analyzeMedicalImages.description': 'อัปโหลดภาพที่ชัดเจนและมีคุณภาพสูงของแผลผิวหนัง, ไฝ หรือภาวะทางการแพทย์อื่นๆ AI ของเราจะวิเคราะห์และให้การวินิจฉัยที่เป็นไปได้พร้อมเปอร์เซ็นต์ความเชื่อมั่น',
    'analyzeMedicalImages.guidelines': 'แนวทางสำคัญ',
    'analyzeMedicalImages.guideline1': '• ให้แน่ใจว่าแสงสว่างดีและโฟกัสชัด',
    'analyzeMedicalImages.guideline2': '• รวมวัตถุอ้างอิง (เหรียญ, ไม้บรรทัด) เพื่อเปรียบเทียบขนาด',
    'analyzeMedicalImages.guideline3': '• ถ่ายหลายมุมหากเป็นไปได้',
    'analyzeMedicalImages.guideline4': '• ขนาดไฟล์สูงสุด: 10MB ต่อภาพ',
    'analyzeMedicalImages.guideline5': '• รองรับรูปแบบ: JPG, PNG, WEBP',
    'analyzeMedicalImages.dragDrop': 'ลากและวางภาพทางการแพทย์ของคุณที่นี่',
    'analyzeMedicalImages.clickToBrowse': 'หรือคลิกเพื่อเรียกดูไฟล์ของคุณ',
    'analyzeMedicalImages.chooseFiles': 'เลือกไฟล์',
    'analyzeMedicalImages.uploadedImages': 'ภาพที่อัปโหลด',
    'analyzeMedicalImages.analyzeImages': 'วิเคราะห์ภาพ',
    'analyzeMedicalImages.analyzingImages': 'กำลังวิเคราะห์ภาพ...',
    'analyzeMedicalImages.analysisResults': 'ผลการวิเคราะห์ด้วย AI',
    'analyzeMedicalImages.uploadMoreImages': 'อัปโหลดภาพเพิ่มเติม',
    'analyzeMedicalImages.analysisCompleted': 'การวิเคราะห์เสร็จสิ้นสำหรับ',
    'analyzeMedicalImages.image': 'ภาพ',
    'analyzeMedicalImages.images': 'ภาพ',
    'analyzeMedicalImages.analyzedImages': 'ภาพที่วิเคราะห์',
    'analyzeMedicalImages.confidence': 'ความเชื่อมั่น:',
    'analyzeMedicalImages.communityComments': 'ความคิดเห็นจากชุมชน',
    'analyzeMedicalImages.shareThoughts': 'แบ่งปันความคิดหรือประสบการณ์ของคุณ',
    'analyzeMedicalImages.commentPlaceholder': 'แบ่งปันประสบการณ์ของคุณ, ถามคำถาม หรือให้ข้อมูลเชิงลึกเกี่ยวกับกรณีที่คล้ายกัน...',
    'analyzeMedicalImages.charactersLimit': 'ตัวอักษร',
    'analyzeMedicalImages.postComment': 'โพสต์ความคิดเห็น',
    'analyzeMedicalImages.justNow': 'เมื่อสักครู่',
    'analyzeMedicalImages.minutesAgo': 'นาทีที่แล้ว',
    'analyzeMedicalImages.hoursAgo': 'ชั่วโมงที่แล้ว',
    'analyzeMedicalImages.daysAgo': 'วันที่แล้ว',
    'analyzeMedicalImages.medicalDisclaimer': 'ข้อจำกัดความรับผิดชอบทางการแพทย์ที่สำคัญ',
    'analyzeMedicalImages.medicalDisclaimerText': 'การวิเคราะห์ด้วย AI นี้มีไว้เพื่อการศึกษาและให้ข้อมูลเท่านั้น และไม่ควรใช้แทนการวินิจฉัยหรือการรักษาทางการแพทย์จากผู้เชี่ยวชาญ เปอร์เซ็นต์และภาวะที่แสดงเป็นการประมาณการจากอัลกอริทึมและอาจไม่ถูกต้อง ควรปรึกษาผู้เชี่ยวชาญด้านสุขภาพที่มีคุณสมบัติเสมอ โดยเฉพาะแพทย์ผิวหนังหรือแพทย์มะเร็งวิทยา สำหรับการประเมินทางการแพทย์ที่เหมาะสมของแผลผิวหนังหรือภาวะทางการแพทย์ใดๆ การวินิจฉัยจากผู้เชี่ยวชาญในระยะเริ่มต้นสามารถช่วยชีวิตได้สำหรับภาวะร้ายแรงเช่นมะเร็งผิวหนัง',
    
    // Validation Messages
    'validation.required': 'จำเป็นต้องกรอก',
    'validation.emailInvalid': 'กรุณากรอกอีเมลที่ถูกต้อง',
    'validation.passwordMinLength': 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
    'validation.passwordsDoNotMatch': 'รหัสผ่านไม่ตรงกัน',
    'validation.confirmPasswordRequired': 'กรุณายืนยันรหัสผ่านของคุณ',
    'validation.passwordMinLengthRegister': 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};