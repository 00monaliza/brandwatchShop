import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MagicNavigation.css';

const MagicNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Определяем активный пункт на основе текущего пути
  const getActiveIndex = () => {
    switch (location.pathname) {
      case '/':
      case '/catalog':
        return 0;
      case '/favorites':
        return 1;
      case '/cart':
        return 2;
      case '/premium':
        return 3;
      default:
        return 0;
    }
  };

  const [activeIndex, setActiveIndex] = useState(getActiveIndex());

  const menuItems = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="nav-icon">
          <path d="M80 212v236a16 16 0 0016 16h96V328a24 24 0 0124-24h80a24 24 0 0124 24v136h96a16 16 0 0016-16V212" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"/>
          <path d="M480 256L266.89 52c-5-5.28-16.69-5.34-21.78 0L32 256M400 179V64h-48v69" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"/>
        </svg>
      ),
      label: 'Home',
      path: '/catalog',
      color: '#DA7B93'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="nav-icon">
          <path d="M352.92 80C288 80 256 144 256 144s-32-64-96.92-64c-52.76 0-94.54 44.14-95.08 96.81-1.1 109.33 86.73 187.08 183 252.42a16 16 0 0018 0c96.26-65.34 184.09-143.09 183-252.42-.54-52.67-42.32-96.81-95.08-96.81z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"/>
        </svg>
      ),
      label: 'Favorites',
      path: '/favorites',
      color: '#f44336'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="nav-icon">
          <circle cx="176" cy="416" r="32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"/>
          <circle cx="400" cy="416" r="32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"/>
          <path d="M48 80h64l48 272h256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"/>
          <path d="M160 288h249.44a8 8 0 007.85-6.43l28.8-144a8 8 0 00-7.85-9.57H128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"/>
        </svg>
      ),
      label: 'Cart',
      path: '/cart',
      color: '#376E6F'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="nav-icon">
          <path d="M256 48C141.31 48 48 141.31 48 256s93.31 208 208 208 208-93.31 208-208S370.69 48 256 48zm-50 232a18 18 0 1118-18 18 18 0 01-18 18zm100 0a18 18 0 1118-18 18 18 0 01-18 18zm50-18a18 18 0 11-18-18 18 18 0 0118 18z" fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="32"/>
          <path d="M256 48c-58.07 0-112.67 93.31-112.67 208S197.93 464 256 464s112.67-93.31 112.67-208S314.07 48 256 48z" fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="32"/>
          <path d="M117.33 117.33c38.24 27.15 86.38 43.34 138.67 43.34s100.43-16.19 138.67-43.34M394.67 394.67c-38.24-27.15-86.38-43.34-138.67-43.34s-100.43 16.19-138.67 43.34" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"/>
          <path fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="32" d="M256 48v416M464 256H48"/>
        </svg>
      ),
      label: 'Premium',
      path: '/premium',
      color: '#9c27b0'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="nav-icon">
          <path d="M262.29 192.31a64 64 0 1057.4 57.4 64.13 64.13 0 00-57.4-57.4zM416.39 256a154.34 154.34 0 01-1.53 20.79l45.21 35.46a10.81 10.81 0 012.45 13.75l-42.77 74a10.81 10.81 0 01-13.14 4.59l-44.9-18.08a16.11 16.11 0 00-15.17 1.75A164.48 164.48 0 01325 400.8a15.94 15.94 0 00-8.82 12.14l-6.73 47.89a11.08 11.08 0 01-10.68 9.17h-85.54a11.11 11.11 0 01-10.69-8.87l-6.72-47.82a16.07 16.07 0 00-9-12.22 155.3 155.3 0 01-21.46-12.57 16 16 0 00-15.11-1.71l-44.89 18.07a10.81 10.81 0 01-13.14-4.58l-42.77-74a10.8 10.8 0 012.45-13.75l38.21-30a16.05 16.05 0 006-14.08c-.36-4.17-.58-8.33-.58-12.5s.21-8.27.58-12.35a16 16 0 00-6.07-13.94l-38.19-30A10.81 10.81 0 0149.48 186l42.77-74a10.81 10.81 0 0113.14-4.59l44.9 18.08a16.11 16.11 0 0015.17-1.75A164.48 164.48 0 01187 111.2a15.94 15.94 0 008.82-12.14l6.73-47.89A11.08 11.08 0 01213.23 42h85.54a11.11 11.11 0 0110.69 8.87l6.72 47.82a16.07 16.07 0 009 12.22 155.3 155.3 0 0121.46 12.57 16 16 0 0015.11 1.71l44.89-18.07a10.81 10.81 0 0113.14 4.58l42.77 74a10.8 10.8 0 01-2.45 13.75l-38.21 30a16.05 16.05 0 00-6.05 14.08c.33 4.14.55 8.3.55 12.47z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"/>
        </svg>
      ),
      label: 'Settings',
      path: '/settings',
      color: '#2F4454'
    }
  ];

  const handleClick = (index, path) => {
    setActiveIndex(index);
    navigate(path);
  };

  return (
    <nav className="magic-navigation" style={{ '--clr': menuItems[activeIndex].color }}>
      <ul className="magic-nav-list">
        {menuItems.map((item, index) => (
          <li 
            key={index} 
            className={`magic-nav-item ${activeIndex === index ? 'active' : ''}`}
            onClick={() => handleClick(index, item.path)}
          >
            <button className="magic-nav-link" type="button" aria-label={item.label}>
              <span className="magic-nav-icon">{item.icon}</span>
              <span className="magic-nav-label">{item.label}</span>
            </button>
          </li>
        ))}
        <div 
          className="magic-indicator"
          style={{ transform: `translateX(calc(${activeIndex * 100}%))` }}
        ></div>
      </ul>
    </nav>
  );
};

export default MagicNavigation;
