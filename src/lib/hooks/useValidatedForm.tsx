// Import necessary modules from React and Zod
import { FormEvent, useState } from "react";
import { ZodSchema } from "zod";

// Define a type for entity errors
type EntityZodErrors<T> = Partial<Record<keyof T, string[] | undefined>>;

// Define a custom hook for form validation
export function useValidatedForm<Entity>(insertEntityZodSchema: ZodSchema) {
  // Define a state for form errors
  const [errors, setErrors] = useState<EntityZodErrors<Entity> | null>(null);

  // Check if there are any errors
  const hasErrors =
    errors !== null &&
    Object.values(errors).some((error) => error !== undefined);

  // Define a handler for form changes
  const handleChange = (event: FormEvent<HTMLFormElement>) => {
    // Get the target element from the event
    const target = event.target as EventTarget;

    // Check if the target is an input, select, or textarea element
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLSelectElement ||
      target instanceof HTMLTextAreaElement
    ) {
      // Exclude submit inputs
      if (!(target instanceof HTMLInputElement && target.type === "submit")) {
        // Get the field name and value from the target
        const field = target.name as keyof Entity;
        const result = insertEntityZodSchema.safeParse({
          [field]: target.value,
        });

        // Get the error for the field, if any
        const fieldError = result.success
          ? undefined
          : result.error.flatten().fieldErrors[field];

        // Update the errors state
        setErrors((prev) => ({
          ...prev,
          [field]: fieldError,
        }));
      }
    }
  };

  // Return the errors, setErrors function, handleChange function, and hasErrors flag
  return { errors, setErrors, handleChange, hasErrors };
}