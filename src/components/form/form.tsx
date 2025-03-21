import { ReactNode } from 'react';
import classNames from 'classnames';

interface IFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  disabled?: boolean;
  loading?: boolean;
  children?: ReactNode;
  customClasses?: {
    fieldsetWrapper?: string;
  }; 
}

const FormProvider: React.FC<IFormProps> = ({
  children,
  customClasses,
  disabled,
  className,
  ...props
}) => {
  return (
    <form
      {...props}
      className={classNames(className, '')}
    >
      <fieldset
        disabled={disabled}
        className={classNames(customClasses?.fieldsetWrapper, 'space-y-4')}
      >
        {children}
      </fieldset>
    </form>
  );
};

export default FormProvider;
