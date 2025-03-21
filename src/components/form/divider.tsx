import classNames from 'classnames';
import React from 'react';

interface IDividerProps {
  className?: string;
}

const Divider: React.FC<IDividerProps> = ({ className }) => {
  return <hr className={classNames('text-[#DCEAEF] my-8', className)} />;
};

export default Divider;
