import { taskSchema } from "@/zodAutoGenSchemas";
import { z } from "zod";
import { timestamps } from "@/lib/utils";
import { getTasks } from "@/lib/api/tasks/queries";


// Schema for tasks - used to validate API requests
const baseSchema = taskSchema.omit(timestamps)

export const insertTaskSchema = baseSchema.omit({ id: true });
export const insertTaskParams = baseSchema.extend({
  dueDate: z.coerce.date({
    coerce: true
  }).optional(),
}).omit({ 
  id: true,
  userId: true
});

export const updateTaskSchema = baseSchema;
export const updateTaskParams = updateTaskSchema.extend({}).omit({ 
  userId: true
});
export const taskIdSchema = baseSchema.pick({ id: true });

// Types for tasks - used to type API request params and within Components
export type Task = z.infer<typeof taskSchema>;
export type NewTask = z.infer<typeof insertTaskSchema>;
export type NewTaskParams = z.infer<typeof insertTaskParams>;
export type UpdateTaskParams = z.infer<typeof updateTaskParams>;
export type TaskId = z.infer<typeof taskIdSchema>["id"];
    
// this type infers the return from getTasks() - meaning it will include any joins
export type CompleteTask = Awaited<ReturnType<typeof getTasks>>["tasks"][number];

