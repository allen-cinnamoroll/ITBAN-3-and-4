import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { backgroundImages } from './assets/imageData';
import './index.css';

function App() {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    // Debug log
    console.log('Current image:', backgroundImages[currentImageIndex]);

    // Preload images
    const loadImages = async () => {
      const imagePromises = backgroundImages.map(src => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = () => reject(`Failed to load image: ${src}`);
        });
      });

      try {
        await Promise.all(imagePromises);
        setImagesLoaded(true);
        console.log('All images loaded successfully');
      } catch (error) {
        console.error('Image loading error:', error);
      }
    };

    loadImages();

    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % backgroundImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing-container">
      {imagesLoaded ? (
        <div className="background-slider">
          {backgroundImages.map((image, index) => (
            <div
              key={index}
              className={`slide ${index === currentImageIndex ? 'active' : ''}`}
              style={{ 
                backgroundImage: `url(${image})`,
                zIndex: index === currentImageIndex ? 1 : 0
              }}
            />
          ))}
        </div>
      ) : (
        <div>Loading images...</div>
      )}
      <h1 className="main-heading">Too many places, not enough time?</h1>
      <h2 className="sub-heading">Let SmartTour pick your perfect destination!</h2>
      <button className="cta-button" onClick={() => navigate('/travel-input')}>
        Start Your Journey in DavOr
      </button>
    </div>
  );
}

export default App;
