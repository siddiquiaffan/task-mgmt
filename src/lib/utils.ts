import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { TaskStatus } from "@prisma/client"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const timestamps: { createdAt: true; updatedAt: true } = {
  createdAt: true,
  updatedAt: true,
};



export type Action = "create" | "update" | "delete";

export type OptimisticAction<T> = {
  action: Action;
  data: T;
};


export const task_map = {
  [TaskStatus.TODO]: "To Do",
  [TaskStatus.IN_PROGRESS]: "In Progress",
  [TaskStatus.DONE]: "Done",
}