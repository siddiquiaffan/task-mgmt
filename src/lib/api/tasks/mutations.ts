import { db } from "@/lib/db/index";
import { 
  TaskId, 
  NewTaskParams,
  UpdateTaskParams, 
  updateTaskSchema,
  insertTaskSchema, 
  taskIdSchema 
} from "@/lib/db/schema/tasks";
import { getUserAuth } from "@/lib/auth/utils";

export const createTask = async (task: NewTaskParams) => {
  const { session } = await getUserAuth();
  const newTask = insertTaskSchema.parse({ ...task, userId: session?.user.id! });
  try {
    const t = await db.task.create({ data: newTask });
    return { task: t };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const updateTask = async (id: TaskId, task: UpdateTaskParams) => {
  const { session } = await getUserAuth();
  const { id: taskId } = taskIdSchema.parse({ id });
  const newTask = updateTaskSchema.parse({ ...task, userId: session?.user.id! });
  try {
    const t = await db.task.update({ where: { id: taskId, userId: session?.user.id! }, data: newTask})
    return { task: t };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const deleteTask = async (id: TaskId) => {
  const { session } = await getUserAuth();
  const { id: taskId } = taskIdSchema.parse({ id });
  try {
    const t = await db.task.delete({ where: { id: taskId, userId: session?.user.id! }})
    return { task: t };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

