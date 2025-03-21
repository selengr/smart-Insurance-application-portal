import classNames from 'classnames';
import { ReactNode } from 'react';


type TFormRowProps = {
  children: ReactNode;
  className?: string;
};

const FormRow: React.FC<TFormRowProps> = ({ children, className }) => {
  return (
    <div
      className={classNames(
        'flex items-start flex-col md:flex-row gap-6 w-full',
        className
      )}
    >
      {children}
    </div>
  );
};

export default FormRow;
