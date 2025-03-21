import classNames from 'classnames';
import React from 'react';

interface FormTitleProps {
  children: React.ReactNode;
  className?: string;
}

const FormTitle: React.FC<FormTitleProps> = ({ children, className }) => {
  return (
    <div>
      <h1
        className={classNames(
          'text-primary-darker text-m-h5 md:text-d-h4 font-bold mb-6',
          className
        )}
      >
        {children}
      </h1>
    </div>
  );
};

FormTitle.displayName = 'FormTitle';

export default FormTitle;
