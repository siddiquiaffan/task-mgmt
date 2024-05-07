
import { type Task, type CompleteTask } from "@/lib/db/schema/tasks";
import { OptimisticAction } from "@/lib/utils";
import { useOptimistic } from "react";

export type TAddOptimistic = (action: OptimisticAction<Task>) => void;

export const useOptimisticTasks = (
  tasks: CompleteTask[],
  
) => {
  const [optimisticTasks, addOptimisticTask] = useOptimistic(
    tasks,
    (
      currentState: CompleteTask[],
      action: OptimisticAction<Task>,
    ): CompleteTask[] => {
      const { data } = action;

      

      const optimisticTask = {
        ...data,
        
        id: "optimistic",
      };

      switch (action.action) {
        case "create":
          return currentState.length === 0
            ? [optimisticTask]
            : [...currentState, optimisticTask];
        case "update":
          return currentState.map((item) =>
            item.id === data.id ? { ...item, ...optimisticTask } : item,
          );
        case "delete":
          return currentState.map((item) =>
            item.id === data.id ? { ...item, id: "delete" } : item,
          );
        default:
          return currentState;
      }
    },
  );

  return { addOptimisticTask, optimisticTasks };
};
