import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import videoSrc from '../images/IMG_0644.MP4';
import './HeroVideo.css';

const HeroVideo = () => {
  const { t } = useTranslation();
  const videoRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (videoRef.current) {
        const scrolled = window.scrollY;
        videoRef.current.style.transform = `scale(1.1) translateY(${scrolled * 0.5}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="hero-video-container">
      <video 
        ref={videoRef}
        className="hero-video" 
        autoPlay 
        loop 
        muted 
        playsInline
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="hero-overlay">
        <div className="hero-content">
          <h1>brandwatch</h1>
          <p>Luxury Timepieces Collection</p>
          <a href="#catalog" className="hero-btn">{t('nav.catalog')}</a>
        </div>
        <div className="scroll-indicator">
          <span className="scroll-text">Scroll</span>
          <div className="scroll-line"></div>
        </div>
      </div>
    </div>
  );
};

export default HeroVideo;
