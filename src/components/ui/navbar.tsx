import React, { useState, useRef, useEffect } from "react";
import { HomeIcon, MessageSquareIcon, CameraIcon } from "lucide-react";

interface NavbarProps {
  currentPage: 'home' | 'check-symptoms' | 'analyze-images';
  onNavigate: (page: 'home' | 'check-symptoms' | 'analyze-images') => void;
  isLoggedIn: boolean;
  onLoginRequired: () => void;
}

export const Navbar = ({ currentPage, onNavigate, isLoggedIn, onLoginRequired }: NavbarProps): JSX.Element => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const navItems = [
    {
      id: 'home',
      text: "Home",
      icon: <HomeIcon className="w-12 h-12" />,
      page: 'home' as const,
    },
    {
      id: 'check-symptoms',
      text: "Check Symptoms",
      icon: <MessageSquareIcon className="w-12 h-12" />,
      page: 'check-symptoms' as const,
    },
    {
      id: 'analyze-images',
      text: "Analyze Medical Images",
      icon: <CameraIcon className="w-12 h-12" />,
      page: 'analyze-images' as const,
    },
  ];

  const updateIndicator = (itemId: string | null) => {
    if (!itemId || !itemRefs.current[itemId] || !navRef.current) {
      setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
      return;
    }

    const navRect = navRef.current.getBoundingClientRect();
    const itemRect = itemRefs.current[itemId]!.getBoundingClientRect();
    
    setIndicatorStyle({
      left: itemRect.left - navRect.left,
      width: itemRect.width,
      opacity: 1,
    });
  };

  useEffect(() => {
    // Set initial position for active item
    updateIndicator(currentPage);
  }, [currentPage]);

  const handleItemClick = (page: 'home' | 'check-symptoms' | 'analyze-images') => {
    if ((page === 'check-symptoms' || page === 'analyze-images') && !isLoggedIn) {
      onLoginRequired();
    } else {
      onNavigate(page);
    }
  };

  const handleMouseEnter = (itemId: string) => {
    setHoveredItem(itemId);
    updateIndicator(itemId);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
    updateIndicator(currentPage);
  };

  return (
    <nav className="relative flex items-center gap-4" ref={navRef}>
      {/* Animated Blue Circle Indicator */}
      <div
        className="absolute top-0 bottom-0 bg-[#a1c6fd] rounded-[28px] transition-all duration-300 ease-out pointer-events-none"
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
          opacity: indicatorStyle.opacity,
        }}
      />

      {/* Navigation Items */}
      {navItems.map((item) => (
        <div
          key={item.id}
          ref={(el) => (itemRefs.current[item.id] = el)}
          className={`relative flex items-center gap-2 px-3 py-2 rounded-[28px] cursor-pointer transition-all duration-200 z-10 ${
            currentPage === item.page && !hoveredItem
              ? "text-[#2b356c]"
              : hoveredItem === item.id
              ? "text-[#2b356c]"
              : "text-[#2b356c] hover:text-[#1a2347]"
          }`}
          onClick={() => handleItemClick(item.page)}
          onMouseEnter={() => handleMouseEnter(item.id)}
          onMouseLeave={handleMouseLeave}
        >
          {item.icon}
          <span className="font-['Itim',Helvetica] text-4xl whitespace-nowrap">
            {item.text}
          </span>
        </div>
      ))}
    </nav>
  );
};