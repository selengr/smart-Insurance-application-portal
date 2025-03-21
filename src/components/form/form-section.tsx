import React from 'react';
import { Divider, FormTitle } from '.';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  hasDivider?: boolean;
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  children,
  hasDivider = false,
}) => {
  return (
    <>
      {!hasDivider && <Divider />}
      <FormTitle>{title}</FormTitle>
      {children}
    </>
  );
};

export default FormSection;
