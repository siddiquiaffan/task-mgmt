"use server";

import { revalidatePath } from "next/cache";
import {
  createTask,
  deleteTask,
  updateTask,
} from "@/lib/api/tasks/mutations";
import {
  TaskId,
  NewTaskParams,
  UpdateTaskParams,
  taskIdSchema,
  insertTaskParams,
  updateTaskParams,
} from "@/lib/db/schema/tasks";


const handleErrors = (e: unknown) => {
  const errMsg = "Error, please try again.";
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === "object" && "error" in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateTasks = () => revalidatePath("/tasks");

export const createTaskAction = async (input: NewTaskParams) => {
  try {
    const payload = insertTaskParams.parse(input);
    await createTask(payload);
    revalidateTasks();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateTaskAction = async (input: UpdateTaskParams) => {
  try {
    const payload = updateTaskParams.parse(input);
    await updateTask(payload.id, payload);
    revalidateTasks();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteTaskAction = async (input: TaskId) => {
  try {
    const payload = taskIdSchema.parse({ id: input });
    await deleteTask(payload.id);
    revalidateTasks();
  } catch (e) {
    return handleErrors(e);
  }
};