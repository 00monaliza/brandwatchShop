import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './PremiumHero.css';

const PremiumHero = ({ 
  title = "КОЛЛЕКЦИЯ ЧАСОВ",
  subtitle = "Безупречное мастерство и элегантность",
  videoSrc = null,
  imageSrc = "/images/hero-watch.jpg",
  ctaText = "Открыть коллекцию",
  onCtaClick = () => {}
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { scrollY } = useScroll();
  
  // Parallax effect
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <section className="premium-hero">
      {/* Background with Parallax */}
      <motion.div 
        className="premium-hero__background"
        style={{ y }}
      >
        {videoSrc ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="premium-hero__video"
            onLoadedData={() => setIsLoaded(true)}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : (
          <img 
            src={imageSrc} 
            alt="Hero"
            className="premium-hero__image"
            onLoad={() => setIsLoaded(true)}
          />
        )}
        <div className="premium-hero__overlay" />
      </motion.div>

      {/* Content */}
      <motion.div 
        className="premium-hero__content"
        style={{ opacity }}
      >
        <motion.span
          className="premium-hero__eyebrow"
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          ЭКСКЛЮЗИВНО
        </motion.span>

        <motion.h1
          className="premium-hero__title"
          initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
          animate={isLoaded ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          {title}
        </motion.h1>

        <motion.p
          className="premium-hero__subtitle"
          initial={{ opacity: 0, y: 30 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          {subtitle}
        </motion.p>

        <motion.button
          className="premium-hero__cta"
          onClick={onCtaClick}
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.1, ease: [0.4, 0, 0.2, 1] }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>{ctaText}</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </motion.button>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="premium-hero__scroll-indicator"
        onClick={scrollToContent}
        initial={{ opacity: 0 }}
        animate={isLoaded ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 1.5 }}
      >
        <span>Прокрутите вниз</span>
        <motion.div
          className="premium-hero__scroll-arrow"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M19 12l-7 7-7-7"/>
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default PremiumHero;
