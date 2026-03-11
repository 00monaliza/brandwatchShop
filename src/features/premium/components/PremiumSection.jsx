import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import './PremiumSection.css';

const PremiumSection = ({ 
  children, 
  title,
  subtitle,
  align = 'center',
  background = 'default',
  className = ''
}) => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const titleVariants = {
    hidden: { 
      opacity: 0, 
      y: 40,
      filter: 'blur(10px)'
    },
    visible: { 
      opacity: 1, 
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const subtitleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  return (
    <section 
      ref={sectionRef}
      className={`premium-section premium-section--${background} premium-section--${align} ${className}`}
    >
      <motion.div
        className="premium-section__container"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {(title || subtitle) && (
          <div className="premium-section__header">
            {title && (
              <motion.h2 
                className="premium-section__title"
                variants={titleVariants}
              >
                {title}
              </motion.h2>
            )}
            {subtitle && (
              <motion.p 
                className="premium-section__subtitle"
                variants={subtitleVariants}
              >
                {subtitle}
              </motion.p>
            )}
          </div>
        )}

        <motion.div 
          className="premium-section__content"
          variants={{
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1,
              transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
            }
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default PremiumSection;
