import clsx from 'clsx';

const LoadingSpinner = ({ 
  size = 'md', 
  className = '', 
  text = '', 
  color = 'primary' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const colorClasses = {
    primary: 'border-t-primary-600',
    white: 'border-t-white',
    gray: 'border-t-gray-600',
  };

  return (
    <div className={clsx('flex flex-col items-center justify-center', className)}>
      <div
        className={clsx(
          'loading-spinner',
          sizeClasses[size],
          colorClasses[color]
        )}
      />
      {text && (
        <p className="mt-2 text-sm text-gray-600">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;