"use client"
import React, { useState, useEffect } from "react";
import axios from "axios";
import { z } from "zod"
import { Button } from "../button";
import { Input } from "../input";
import { format } from "date-fns"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import classNames from "classnames";
import { CalendarIcon } from "lucide-react";

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
  const [formData, setFormData] = useState<FormData>();
  const [formValues, setFormValues] = useState<Record<string, string>>({});


  const FormSchema = z.object({
    type: z.enum(["all", "mentions", "none"], {
      required_error: "You need to select a notification type.",
    }),
  })

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await axios.get<FormData[]>(`${BASE_URL}/api/insurance/forms`);
        console.log("response",response)
        
        const form = response.data.find((f) => f.formId === formId);
        setFormData(form);
      } catch (error) {
        console.error("Error fetching form:", error);
      }
    };
    fetchForm();
  }, [formId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, fieldId: string) => {
    setFormValues({ ...formValues, [fieldId]: e.target.value });
  };

  const renderField = (fields: FormField) => {
    switch (fields.type) {
      case "text":
        return (  
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
            <FormItem>
              <FormLabel>title</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
          );
      case "date":
        return (
          <FormField
          control={form.control}
          name="dob"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date of birth</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={classNames(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Your date of birth is used to calculate your age.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        )
      case "number":
        return (
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
          <FormItem>
            <FormLabel>title</FormLabel>
            <FormControl>
              <Input type="number" placeholder="shadcn" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
        );
      case "select":
        console.log("test2",fields)
          return (
            <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{fields.label}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {fields?.options?.map((option : string) => (
                  <SelectItem value="m@example.com">{option}</SelectItem>
                        ))}
                    </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
             )}
             />
       )
      case "radio":
       return (
        <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>{fields.label}</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                 {fields.options?.map((option) => (
                <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value={option} />
                  </FormControl>
                  <FormLabel className="font-normal">{option}</FormLabel>
                </FormItem>
              ))}

              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
       )

      case "group":
        return (
          <div>
            <h3>{fields.label}</h3>
            {fields.fields?.map((subField) => renderField(subField))}
          </div>
        );
      default:
        return null;
    }
  };


  function onSubmit(values:any) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }

  if (!formData) return <div>Loading...</div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* <FormProvider> */}
            <h2 className="">{formData.title}</h2>
            {formData?.fields?.map((field) => renderField(field))}


        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default DynamicForm;



