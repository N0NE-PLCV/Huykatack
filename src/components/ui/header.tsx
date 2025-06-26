import React from "react";
import { LogInIcon, UserPlusIcon, UserIcon, SettingsIcon, HelpCircleIcon } from "lucide-react";
import { Dropdown, DropdownItem, DropdownSeparator } from "./dropdown";
import { Navbar } from "./navbar";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";

interface HeaderProps {
  currentPage: 'home' | 'check-symptoms' | 'analyze-images';
  onNavigate: (page: 'home' | 'check-symptoms' | 'analyze-images') => void;
  onLoginRequired: () => void;
  onProfileAction: (action: string) => void;
  onProfileClick: () => void;
  onLanguageChange: (lang: 'en' | 'th') => void;
}

export const Header = ({
  currentPage,
  onNavigate,
  onLoginRequired,
  onProfileAction,
  onProfileClick,
  onLanguageChange
}: HeaderProps): JSX.Element => {
  const { language, t } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="w-full h-[60px] sm:h-[65px] md:h-[70px] lg:h-[75px] bg-white flex items-center justify-between px-2 sm:px-4 lg:px-6">
      {/* Logo - Responsive sizing */}
      <div className="flex items-center flex-shrink-0">
        <img
          className="h-[40px] sm:h-[45px] md:h-[50px] lg:h-[60px] object-contain"
          alt="MediAssist Logo"
          src="/image-2.png"
        />
      </div>

      {/* Navigation - Hidden on mobile, shown on larger screens */}
      <div className="hidden md:block">
        <Navbar
          currentPage={currentPage}
          onNavigate={onNavigate}
          isLoggedIn={isAuthenticated}
          onLoginRequired={onLoginRequired}
        />
      </div>

      {/* User Profile with Dropdown - Responsive sizing */}
      <div className="flex items-center flex-shrink-0">
        <Dropdown
          trigger={
            <div 
              className="relative group cursor-pointer"
              onClick={onProfileClick}
            >
              <img
                className="w-[36px] h-[38px] sm:w-[40px] sm:h-[42px] md:w-[44px] md:h-[46px] lg:w-[48px] lg:h-[52px] object-cover rounded-full border-2 border-transparent group-hover:border-[#3991db] transition-all duration-200"
                alt="User Profile"
                src={user?.profileImage || "/image-6.png"}
              />
              <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/10 transition-all duration-200"></div>
            </div>
          }
        >
          <div className="py-2">
            {/* Show user info only if logged in */}
            {isAuthenticated && user && (
              <div className="px-4 py-2 border-b border-gray-100 mb-2">
                <p className="font-['Itim',Helvetica] text-sm font-medium text-gray-900">{user.name || 'User'}</p>
                <p className="font-['Itim',Helvetica] text-xs text-gray-500">{user.email}</p>
              </div>
            )}
            
            {/* Mobile Navigation - Only shown on mobile */}
            <div className="md:hidden">
              <DropdownItem 
                onClick={() => onNavigate('home')}
                className={currentPage === 'home' ? 'bg-blue-50 text-[#3991db]' : ''}
              >
                Home
              </DropdownItem>
              <DropdownItem 
                onClick={() => isAuthenticated ? onNavigate('check-symptoms') : onLoginRequired()}
                className={currentPage === 'check-symptoms' ? 'bg-blue-50 text-[#3991db]' : ''}
              >
                Check Symptoms
              </DropdownItem>
              <DropdownItem 
                onClick={() => isAuthenticated ? onNavigate('analyze-images') : onLoginRequired()}
                className={currentPage === 'analyze-images' ? 'bg-blue-50 text-[#3991db]' : ''}
              >
                Analyze Images
              </DropdownItem>
              <DropdownSeparator />
            </div>
            
            {/* Show different options based on login status */}
            {!isAuthenticated ? (
              // Not logged in - show Login and Register
              <>
                <DropdownItem 
                  icon={<LogInIcon />}
                  onClick={() => onProfileAction('login')}
                >
                  {t('dropdown.login')}
                </DropdownItem>
                
                <DropdownItem 
                  icon={<UserPlusIcon />}
                  onClick={() => onProfileAction('register')}
                >
                  {t('dropdown.register')}
                </DropdownItem>
                
                <DropdownSeparator />
                
                <DropdownItem 
                  icon={<HelpCircleIcon />}
                  onClick={() => onProfileAction('help')}
                >
                  {t('dropdown.help')}
                </DropdownItem>
              </>
            ) : (
              // Logged in - show profile options (removed edit patient info)
              <>
                <DropdownItem 
                  icon={<UserIcon />}
                  onClick={() => onProfileAction('profile')}
                >
                  {t('dropdown.myProfile')}
                </DropdownItem>
                
                <DropdownItem 
                  icon={<SettingsIcon />}
                  onClick={() => onProfileAction('settings')}
                >
                  {t('dropdown.settings')}
                </DropdownItem>
                
                <DropdownItem 
                  icon={<HelpCircleIcon />}
                  onClick={() => onProfileAction('help')}
                >
                  {t('dropdown.help')}
                </DropdownItem>
                
                <DropdownSeparator />
                
                <DropdownItem 
                  icon={<LogInIcon />}
                  onClick={() => onProfileAction('signout')}
                  className="text-red-600 hover:bg-red-50"
                >
                  {t('dropdown.signOut')}
                </DropdownItem>
              </>
            )}
            
            <DropdownSeparator />
            
            {/* Language Selection */}
            <div className="px-4 py-2">
              <p className="font-['Itim',Helvetica] text-xs font-medium text-gray-500 mb-2">
                {t('dropdown.language')}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => onLanguageChange('en')}
                  className={`px-3 py-1 rounded text-xs font-['Itim',Helvetica] transition-colors ${
                    language === 'en'
                      ? 'bg-[#3991db] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('dropdown.english')}
                </button>
                <button
                  onClick={() => onLanguageChange('th')}
                  className={`px-3 py-1 rounded text-xs font-['Itim',Helvetica] transition-colors ${
                    language === 'th'
                      ? 'bg-[#3991db] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('dropdown.thai')}
                </button>
              </div>
            </div>
          </div>
        </Dropdown>
      </div>
    </header>
  );
};