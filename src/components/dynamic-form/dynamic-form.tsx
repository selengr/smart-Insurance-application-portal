"use client"
import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = "https://assignment.devotel.io";

// Define interfaces for the form structure
interface FormField {
  id: string;
  type: "text" | "date" | "number" | "select" | "radio" | "group";
  label?: string;
  required?: boolean;
  options?: string[];
  fields?: FormField[];
}

interface FormData {
  formId: string;
  title: string;
  fields: FormField[];
}

interface DynamicFormProps {
  formId: string;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ formId }) => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await axios.get<FormData[]>(`${BASE_URL}/api/insurance/forms`);
        console.log("response",response)
        
        const form = response.data.find((f) => f.formId === formId);
        setFormData(form || null);
      } catch (error) {
        console.error("Error fetching form:", error);
      }
    };
    fetchForm();
  }, [formId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, fieldId: string) => {
    setFormValues({ ...formValues, [fieldId]: e.target.value });
  };

  const renderField = (field: FormField) => {debugger
    switch (field.type) {
      case "text":
      case "date":
      case "number":
        return (
          <input
            type={field.type}
            value={formValues[field.id] || ""}
            onChange={(e) => handleChange(e, field.id)}
            required={field.required}
          />
        );
      case "select":
        return (
          <select
            value={formValues[field.id] || ""}
            onChange={(e) => handleChange(e, field.id)}
            required={field.required}
          >
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case "radio":
        return field.options?.map((option) => (
          <label key={option}>
            <input
              type="radio"
              name={field.id}
              value={option}
              checked={formValues[field.id] === option}
              onChange={(e) => handleChange(e, field.id)}
              required={field.required}
            />
            {option}
          </label>
        ));
      case "group":
        return (
          <div>
            <h3>{field.label}</h3>
            {field.fields?.map((subField) => renderField(subField))}
          </div>
        );
      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/api/insurance/forms/submit`, formValues);
      alert("Form submitted successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  if (!formData) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <h2>{formData.title}</h2>
      {formData.fields.map((field) => renderField(field))}
      <button type="submit">Submit</button>
    </form>
  );
};

export default DynamicForm;