import classNames from 'classnames';

interface IFormFieldProps {
  className?: string;
  children: React.ReactNode;
}

const InputGroup: React.FC<IFormFieldProps> = ({ children, className }) => {
  return (
    <div className={classNames('flex flex-col space-y-2 w-full', className)}>
      {children}
    </div>
  );
};

export default InputGroup;
