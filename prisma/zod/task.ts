// Import the necessary modules from "zod" and "@prisma/client"
import * as z from "zod"
import { TaskStatus } from "@prisma/client"

// Define a schema for tasks using zod
export const taskSchema = z.object({
  id: z.string(), // The task's unique identifier
  title: z.string(), // The task's title
  description: z.string(), // The task's description
  status: z.nativeEnum(TaskStatus), // The task's status, using the TaskStatus enum from Prisma
  userId: z.string(), // The user's unique identifier who owns the task
  dueDate: z.coerce.date().nullish(), // The task's due date, which can be null
  createdAt: z.date(), // The date when the task was created
  updatedAt: z.date(), // The date when the task was last updated
})