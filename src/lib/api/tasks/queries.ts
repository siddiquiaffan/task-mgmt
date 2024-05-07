import { db } from "@/lib/db/index";
import { getUserAuth } from "@/lib/auth/utils";
import { type TaskId, taskIdSchema } from "@/lib/db/schema/tasks";

// Function to get all tasks for the current user
export const getTasks = async () => {
  // Get the current user's session
  const { session } = await getUserAuth();

  // Fetch all tasks for the current user from the database
  const t = await db.task.findMany({ where: { userId: session?.user.id! } });

  // Return the tasks
  return { tasks: t };
};

// Function to get a task by its ID for the current user
export const getTaskById = async (id: TaskId) => {
  // Get the current user's session
  const { session } = await getUserAuth();

  // Validate the task ID
  const { id: taskId } = taskIdSchema.parse({ id });

  // Fetch the task from the database
  const t = await db.task.findFirst({
    where: { id: taskId, userId: session?.user.id! }
  });

  // Return the task
  return { task: t };
};

// Type for the options of the getTasksByDate function
type GetTasksByDate = {
  till?: Date;
}


// Function to get tasks by their creation date
export const getTasksByDate = async (date: Date, options: GetTasksByDate = {}) => {
  // Get the end date from the options
  const { till } = options;

  // Fetch tasks that were created between the start date and the end date
  const t = await db.task.findMany({
    where: {
      createdAt: {
        gte: date,
        // If the end date is provided, set the time to 23:59:59
        lte: till ? till : new Date(new Date(date).setHours(23, 59, 59))
      }
    },
  });

  // Return the tasks
  return { tasks: t };
}


// get tasks which are active and their dueDate is not passed or is null
export const getActiveTasks = async (
  { dueDate }: { dueDate?: Date } = { dueDate: new Date() }
) => {
  // Get the current user's session
  const { session } = await getUserAuth();
  const tillDate = new Date(dueDate!);
  tillDate.setHours(23, 59, 59);

  // Fetch all active tasks for the current user from the database
  const t = await db.task.findMany({
    where: {
      userId: session?.user.id!,
      dueDate: {
        gte: dueDate,
        lte: tillDate
      }
    }
  });

  // Return the tasks
  return { tasks: t };
}

