import React from 'react';
import videoSrc from '../images/IMG_0644.MP4';
import './HeroVideo.css';

const HeroVideo = () => {
  return (
    <div className="hero-video-container">
      <video 
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
          <p>Luxury Watches</p>
        </div>
      </div>
    </div>
  );
};

export default HeroVideo;
