import { useEffect } from 'react';

export const CosmicBackground = () => {
  useEffect(() => {
    // Clean up any existing stars
    const existingStars = document.querySelectorAll('.cosmic-star, .cosmic-dust');
    existingStars.forEach(star => star.remove());

    const createStars = () => {
      const starfield = document.querySelector('.cosmic-starfield');
      if (!starfield) return;
      
      const starCount = 300;
      
      for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'cosmic-star';
        
        // Random position
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        
        // Random size and type
        const rand = Math.random();
        if (rand < 0.7) {
          star.classList.add('small');
        } else if (rand < 0.9) {
          star.classList.add('medium');
        } else {
          star.classList.add('large');
        }
        
        // Special star types
        if (Math.random() < 0.1) {
          star.classList.add('blue');
        } else if (Math.random() < 0.05) {
          star.classList.add('bright');
        }
        
        // Random animation delay
        star.style.animationDelay = Math.random() * 2 + 's';
        star.style.animationDuration = (Math.random() * 3 + 2) + 's';
        
        starfield.appendChild(star);
      }
    };

    const createCosmicDust = () => {
      const starfield = document.querySelector('.cosmic-starfield');
      if (!starfield) return;
      
      const dustCount = 50;
      
      for (let i = 0; i < dustCount; i++) {
        const dust = document.createElement('div');
        dust.className = 'cosmic-dust';
        dust.style.left = Math.random() * 100 + '%';
        dust.style.top = Math.random() * 100 + '%';
        dust.style.animationDelay = Math.random() * 15 + 's';
        starfield.appendChild(dust);
      }
    };

    const createShootingStar = () => {
      const starfield = document.querySelector('.cosmic-starfield');
      if (!starfield) return;
      
      const shootingStar = document.createElement('div');
      shootingStar.className = 'shooting-star';
      
      // Random starting position (off-screen)
      shootingStar.style.left = Math.random() * 100 + '%';
      shootingStar.style.top = Math.random() * 50 + '%';
      
      // Animation
      shootingStar.style.animation = 'shootingStar 3s linear forwards';
      
      starfield.appendChild(shootingStar);
      
      // Remove after animation
      setTimeout(() => {
        if (shootingStar.parentNode) {
          shootingStar.parentNode.removeChild(shootingStar);
        }
      }, 3000);
    };

    // Initialize
    createStars();
    createCosmicDust();
    
    // Create shooting stars periodically
    const shootingStarInterval = setInterval(createShootingStar, 8000 + Math.random() * 12000);
    
    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      const stars = document.querySelectorAll('.cosmic-star');
      const mouseX = e.clientX / window.innerWidth;
      const mouseY = e.clientY / window.innerHeight;
      
      stars.forEach((star, index) => {
        if (index % 10 === 0) { // Only affect every 10th star for performance
          const offsetX = (mouseX - 0.5) * 20;
          const offsetY = (mouseY - 0.5) * 20;
          (star as HTMLElement).style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        }
      });
    };

    // Click interaction to create burst of stars
    const handleClick = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      
      for (let i = 0; i < 5; i++) {
        const burstStar = document.createElement('div');
        burstStar.className = 'cosmic-star bright';
        burstStar.style.position = 'fixed';
        burstStar.style.left = x + 'px';
        burstStar.style.top = y + 'px';
        burstStar.style.pointerEvents = 'none';
        burstStar.style.animation = 'brightTwinkle 1s ease-out forwards';
        burstStar.style.zIndex = '9999';
        
        document.body.appendChild(burstStar);
        
        setTimeout(() => {
          if (burstStar.parentNode) {
            burstStar.parentNode.removeChild(burstStar);
          }
        }, 1000);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);

    // Cleanup function
    return () => {
      clearInterval(shootingStarInterval);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      const stars = document.querySelectorAll('.cosmic-star, .cosmic-dust, .shooting-star');
      stars.forEach(star => star.remove());
    };
  }, []);

  return (
    <div className="cosmic-starfield">
      <div className="nebula"></div>
      <div className="galaxy-cluster galaxy-1"></div>
      <div className="galaxy-cluster galaxy-2"></div>
      
      {/* Black Hole Components */}
      <div className="black-hole">
        <div className="gravitational-lensing"></div>
        <div className="accretion-disk"></div>
        <div className="relativistic-jet"></div>
        <div className="relativistic-jet jet-opposite"></div>
        <div className="photon-sphere"></div>
        <div className="hawking-radiation"></div>
        <div className="event-horizon"></div>
      </div>
    </div>
  );
};