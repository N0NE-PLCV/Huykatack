import {
  ArrowRightIcon,
  LogInIcon,
  UserPlusIcon,
  SettingsIcon,
  HelpCircleIcon,
} from "lucide-react";
import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/modal";
import { Input } from "../../components/ui/input";
import { Header } from "../../components/ui/header";
import { CheckSymptoms } from "../CheckSymptoms";
import { AnalyzeMedicalImages } from "../AnalyzeMedicalImages";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";

export const P = (): JSX.Element => {
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, login, register, logout } = useAuth();
  
  // UI state
  const [currentPage, setCurrentPage] = useState<'home' | 'check-symptoms' | 'analyze-images'>('home');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  
  // Form state
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loginErrors, setLoginErrors] = useState({
    email: "",
    password: "",
  });
  const [registerErrors, setRegisterErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleProfileAction = (action: string) => {
    console.log(`Profile action: ${action}`);
    
    if (action === 'login') {
      setShowLoginModal(true);
    } else if (action === 'register') {
      setShowRegisterModal(true);
    } else if (action === 'signout') {
      logout();
      setCurrentPage('home');
      console.log('User logged out');
    }
    // Add your navigation logic here for other actions
  };

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    }
  };

  const handleGetStartedClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    } else {
      setCurrentPage('check-symptoms');
    }
  };

  const handleNavigation = (page: 'home' | 'check-symptoms' | 'analyze-images') => {
    setCurrentPage(page);
  };

  const handleLoginRequired = () => {
    setShowLoginModal(true);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setLoginErrors({ email: "", password: "" });
    
    // Basic validation
    let hasErrors = false;
    const newErrors = { email: "", password: "" };
    
    if (!loginForm.email) {
      newErrors.email = `${t('patientInfo.email')} ${t('validation.required')}`;
      hasErrors = true;
    } else if (!/\S+@\S+\.\S+/.test(loginForm.email)) {
      newErrors.email = t('validation.emailInvalid');
      hasErrors = true;
    }
    
    if (!loginForm.password) {
      newErrors.password = `${t('login.password')} ${t('validation.required')}`;
      hasErrors = true;
    } else if (loginForm.password.length < 6) {
      newErrors.password = t('validation.passwordMinLength');
      hasErrors = true;
    }
    
    if (hasErrors) {
      setLoginErrors(newErrors);
      return;
    }
    
    // Attempt login
    const success = await login(loginForm.email, loginForm.password);
    
    if (success) {
      setShowLoginModal(false);
      setLoginForm({ email: "", password: "", rememberMe: false });
    } else {
      setLoginErrors({ email: "", password: "Invalid email or password" });
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setRegisterErrors({
      email: "",
      password: "",
      confirmPassword: "",
    });
    
    // Basic validation
    let hasErrors = false;
    const newErrors = {
      email: "",
      password: "",
      confirmPassword: "",
    };
    
    if (!registerForm.email) {
      newErrors.email = `${t('patientInfo.email')} ${t('validation.required')}`;
      hasErrors = true;
    } else if (!/\S+@\S+\.\S+/.test(registerForm.email)) {
      newErrors.email = t('validation.emailInvalid');
      hasErrors = true;
    }
    
    if (!registerForm.password) {
      newErrors.password = `${t('login.password')} ${t('validation.required')}`;
      hasErrors = true;
    } else if (registerForm.password.length < 8) {
      newErrors.password = t('validation.passwordMinLengthRegister');
      hasErrors = true;
    }
    
    if (!registerForm.confirmPassword) {
      newErrors.confirmPassword = t('validation.confirmPasswordRequired');
      hasErrors = true;
    } else if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordsDoNotMatch');
      hasErrors = true;
    }
    
    if (hasErrors) {
      setRegisterErrors(newErrors);
      return;
    }
    
    // Attempt registration
    const success = await register(registerForm.email, registerForm.password);
    
    if (success) {
      setShowRegisterModal(false);
      setRegisterForm({
        email: "",
        password: "",
        confirmPassword: "",
      });
      // Stay on home page after successful registration
      setCurrentPage('home');
    } else {
      setRegisterErrors({ email: "Registration failed. Please try again.", password: "", confirmPassword: "" });
    }
  };

  const handleLoginInputChange = (field: string, value: string | boolean) => {
    setLoginForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing (only for text fields)
    if (typeof value === 'string' && loginErrors[field as keyof typeof loginErrors]) {
      setLoginErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleRegisterInputChange = (field: string, value: string) => {
    setRegisterForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (registerErrors[field as keyof typeof registerErrors]) {
      setRegisterErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  const handleLanguageChange = (lang: 'en' | 'th') => {
    setLanguage(lang);
  };

  // Show check symptoms page if requested
  if (currentPage === 'check-symptoms') {
    return (
      <CheckSymptoms 
        onBack={handleBackToHome} 
        currentPage={currentPage}
        onNavigate={handleNavigation}
        isLoggedIn={isAuthenticated}
        onLoginRequired={handleLoginRequired}
        onProfileAction={handleProfileAction}
        onProfileClick={handleProfileClick}
        onLanguageChange={handleLanguageChange}
      />
    );
  }

  // Show analyze medical images page if requested
  if (currentPage === 'analyze-images') {
    return (
      <AnalyzeMedicalImages 
        onBack={handleBackToHome} 
        currentPage={currentPage}
        onNavigate={handleNavigation}
        isLoggedIn={isAuthenticated}
        onLoginRequired={handleLoginRequired}
        onProfileAction={handleProfileAction}
        onProfileClick={handleProfileClick}
        onLanguageChange={handleLanguageChange}
      />
    );
  }

  return (
    <main className="bg-[#2c2727] flex flex-row justify-center w-full min-h-screen">
      <div className="bg-gradient-to-b from-blue-300 to-blue-100 w-full max-w-[1920px] min-h-screen relative">
        {/* Header/Navigation - Using standardized Header component */}
        <Header
          currentPage={currentPage}
          onNavigate={handleNavigation}
          onLoginRequired={handleLoginRequired}
          onProfileAction={handleProfileAction}
          onProfileClick={handleProfileClick}
          onLanguageChange={handleLanguageChange}
        />

        {/* Main Content - Fully Responsive */}
        <section className="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-24 min-h-[calc(100vh-75px)]">
          {/* Headings - Responsive typography */}
          <h1 className="font-['Itim',Helvetica] font-normal text-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-center mb-2 sm:mb-4 leading-tight">
            {t('home.title1')}
          </h1>
          <h2 className="font-['Itim',Helvetica] font-normal text-[#3991db] text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-center mb-6 sm:mb-8 md:mb-12 leading-tight">
            {t('home.title2')}
          </h2>

          {/* Description - Responsive typography and spacing */}
          <p className="font-['Itim',Helvetica] font-normal text-black text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-center max-w-[280px] sm:max-w-[400px] md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1200px] mb-8 sm:mb-10 md:mb-12 leading-relaxed px-2">
            {t('home.description').split('\n').map((line, index) => (
              <span key={index}>
                {line}
                {index === 0 && <br />}
              </span>
            ))}
          </p>

          {/* CTA Button - Responsive sizing */}
          <Button 
            className="bg-white text-[#2b356c] rounded-[40px] sm:rounded-[50px] md:rounded-[60px] lg:rounded-[85px] h-[60px] sm:h-[70px] md:h-[90px] lg:h-[110px] xl:h-[126px] px-4 sm:px-5 md:px-6 lg:px-8 flex items-center gap-2 sm:gap-3 md:gap-4 hover:bg-gray-100 transition-colors shadow-lg"
            onClick={handleGetStartedClick}
          >
            <span className="font-['Itim',Helvetica] font-normal text-lg sm:text-xl md:text-2xl lg:text-4xl xl:text-5xl">
              {t('home.getStarted')}
            </span>
            <ArrowRightIcon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-16 lg:h-16 xl:w-20 xl:h-20" />
          </Button>
        </section>

        {/* Login Modal - Responsive */}
        <Modal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)}
          className="max-w-[90vw] sm:max-w-lg mx-4"
        >
          <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="text-center">
              <h2 className="font-['Itim',Helvetica] text-2xl sm:text-3xl font-semibold text-[#2b356c] mb-2">
                {t('login.title')}
              </h2>
              <p className="font-['Itim',Helvetica] text-gray-600 text-sm sm:text-base">
                {t('login.subtitle')}
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-3 sm:space-y-4">
              <Input
                label={t('login.email')}
                type="email"
                placeholder={t('login.emailPlaceholder')}
                value={loginForm.email}
                onChange={(e) => handleLoginInputChange('email', e.target.value)}
                error={loginErrors.email}
              />

              <Input
                label={t('login.password')}
                type="password"
                placeholder={t('login.passwordPlaceholder')}
                value={loginForm.password}
                onChange={(e) => handleLoginInputChange('password', e.target.value)}
                error={loginErrors.password}
              />

              {/* Remember Me and Forgot Password Row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                {/* Remember Me Checkbox */}
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={loginForm.rememberMe}
                    onChange={(e) => handleLoginInputChange('rememberMe', e.target.checked)}
                    className="w-4 h-4 text-[#3991db] bg-gray-100 border-gray-300 rounded focus:ring-[#3991db] focus:ring-2"
                  />
                  <span className="font-['Itim',Helvetica] text-sm text-gray-700">
                    {t('login.rememberMe')}
                  </span>
                </label>

                {/* Forgot Password Link */}
                <button
                  type="button"
                  className="font-['Itim',Helvetica] text-sm text-[#3991db] hover:underline text-left sm:text-right"
                  onClick={() => console.log('Forgot password clicked')}
                >
                  {t('login.forgotPassword')}
                </button>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full bg-[#3991db] hover:bg-[#2b7bc7] text-white rounded-lg h-10 sm:h-12 font-['Itim',Helvetica] text-base sm:text-lg font-medium transition-colors"
              >
                {t('login.signIn')}
              </Button>
            </form>

            {/* Register Link */}
            <div className="text-center pt-3 sm:pt-4 border-t border-gray-200">
              <p className="font-['Itim',Helvetica] text-gray-600 text-sm sm:text-base">
                {t('login.noAccount')}{' '}
                <button
                  className="text-[#3991db] hover:underline font-medium"
                  onClick={() => {
                    setShowLoginModal(false);
                    setShowRegisterModal(true);
                  }}
                >
                  {t('login.signUp')}
                </button>
              </p>
            </div>
          </div>
        </Modal>

        {/* Register Modal - Responsive */}
        <Modal 
          isOpen={showRegisterModal} 
          onClose={() => setShowRegisterModal(false)}
          className="max-w-[90vw] sm:max-w-lg mx-4"
        >
          <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="text-center">
              <h2 className="font-['Itim',Helvetica] text-2xl sm:text-3xl font-semibold text-[#2b356c] mb-2">
                {t('register.title')}
              </h2>
              <p className="font-['Itim',Helvetica] text-gray-600 text-sm sm:text-base">
                {t('register.subtitle')}
              </p>
            </div>

            {/* Register Form */}
            <form onSubmit={handleRegisterSubmit} className="space-y-3 sm:space-y-4">
              <Input
                label={t('login.email')}
                type="email"
                placeholder={t('login.emailPlaceholder')}
                value={registerForm.email}
                onChange={(e) => handleRegisterInputChange('email', e.target.value)}
                error={registerErrors.email}
              />

              <Input
                label={t('login.password')}
                type="password"
                placeholder={t('register.passwordPlaceholder')}
                value={registerForm.password}
                onChange={(e) => handleRegisterInputChange('password', e.target.value)}
                error={registerErrors.password}
              />

              <Input
                label={t('register.confirmPassword')}
                type="password"
                placeholder={t('register.confirmPasswordPlaceholder')}
                value={registerForm.confirmPassword}
                onChange={(e) => handleRegisterInputChange('confirmPassword', e.target.value)}
                error={registerErrors.confirmPassword}
              />

              {/* Register Button */}
              <Button
                type="submit"
                className="w-full bg-[#3991db] hover:bg-[#2b7bc7] text-white rounded-lg h-10 sm:h-12 font-['Itim',Helvetica] text-base sm:text-lg font-medium transition-colors"
              >
                {t('register.createAccount')}
              </Button>
            </form>

            {/* Login Link */}
            <div className="text-center pt-3 sm:pt-4 border-t border-gray-200">
              <p className="font-['Itim',Helvetica] text-gray-600 text-sm sm:text-base">
                {t('register.hasAccount')}{' '}
                <button
                  className="text-[#3991db] hover:underline font-medium"
                  onClick={() => {
                    setShowRegisterModal(false);
                    setShowLoginModal(true);
                  }}
                >
                  {t('register.signIn')}
                </button>
              </p>
            </div>
          </div>
        </Modal>
      </div>
    </main>
  );
};