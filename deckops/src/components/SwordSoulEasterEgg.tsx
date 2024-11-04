import React from 'react';

interface SwordSoulEasterEggProps {
  isVisible: boolean;
}

export default function SwordSoulEasterEgg({ isVisible }: SwordSoulEasterEggProps) {
  if (!isVisible) return null;

  const images = [
    'https://images.ygoprodeck.com/images/cards/47710198.jpg', // Swordsoul Chengying
    'https://images.ygoprodeck.com/images/cards/69248256.jpg', // Swordsoul Chixiao
    'https://images.ygoprodeck.com/images/cards/93490856.jpg',
    'https://images.ygoprodeck.com/images/cards/20001443.jpg',
    'https://images.ygoprodeck.com/images/cards/56495147.jpg',
    'https://images.ygoprodeck.com/images/cards/87052196.jpg',
    'https://images.ygoprodeck.com/images/cards/73121813.jpg'
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 15 }).map((_, i) => (
        <img
          key={i}
          src={images[i % 7]}
          alt="Swordsoul"
          className="absolute animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            transform: `scale(${0.5 + Math.random() * 0.5})`,
            animation: `float ${5 + Math.random() * 5}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`,
            opacity: 0.8,
            width: '200px',
            height: '293px',
          }}
        />
      ))}
    </div>
  );
}