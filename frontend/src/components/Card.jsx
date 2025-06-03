import React from 'react';

const Card = ({
  children,
  title,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footer,
  footerClassName = '',
  shadow = 'md',
  border = true,
  glow = false,
}) => {
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  return (
    <div 
      className={`
        bg-white rounded-xl 
        ${border ? 'border border-blue-100' : ''} 
        ${shadowClasses[shadow]} 
        ${glow ? 'glow-effect' : ''} 
        ${className}
      `}
    >
      {title && (
        <div className={`p-4 border-b border-blue-50 ${headerClassName}`}>
          {typeof title === 'string' ? (
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          ) : (
            title
          )}
        </div>
      )}
      
      <div className={`p-5 ${bodyClassName}`}>
        {children}
      </div>
      
      {footer && (
        <div className={`p-4 border-t border-blue-50 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
