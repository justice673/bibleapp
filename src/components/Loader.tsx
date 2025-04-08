import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface LoaderProps {
  darkMode?: boolean;
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

export const Loader: React.FC<LoaderProps> = ({ 
  darkMode = false, 
  size = 'medium',
  text = 'Loading...'
}) => {
  const sizeMap = {
    small: '200px',
    medium: '300px',
    large: '400px',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${darkMode ? 'filter brightness-90' : ''}`}>
        <DotLottieReact
          src="https://lottie.host/836348ec-5ed8-4786-aabe-4c43581129c2/PsmL3MrYSK.lottie"
          loop
          autoplay
          style={{ height: sizeMap[size], width: sizeMap[size] }}
        />
      </div>
      {text && (
        <p className="mt-4 text-center font-medium text-sky-500">
          {text}
        </p>
      )}
    </div>
  );
};
