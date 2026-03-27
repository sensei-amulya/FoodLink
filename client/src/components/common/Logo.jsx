import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../../image/logo.jpeg';

const Logo = ({ width = 64, height = 64, className = '', showText = false, imageClassName = '' }) => {
  return (
    <Link to="/" className={`inline-flex items-center justify-center group cursor-pointer ${className}`}>
      <div 
        style={{ width: `${width}px`, height: `${height}px`, minWidth: `${width}px` }}
        className={`rounded-2xl overflow-hidden flex items-center justify-center shadow-sm border border-green-100/50 bg-white transition-transform duration-200 group-hover:scale-105 group-active:scale-95 ${imageClassName}`}
      >
        <img src={logoImg} alt="FoodLink Logo" className="h-full w-full object-cover" />
      </div>
      {showText && (
        <span className="ml-3 text-xl font-extrabold tracking-tight text-green-700 group-hover:text-green-800 transition-colors">
          FoodLink
        </span>
      )}
    </Link>
  );
};

export default Logo;
