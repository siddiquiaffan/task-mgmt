"use client";

// Importing necessary libraries and components
import { useOptimistic, useState } from "react";
import { TAddOptimistic } from "@/app/(app)/tasks/useOptimisticTasks";
import { type Task } from "@/lib/db/schema/tasks";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import Modal from "@/components/shared/Modal";
import TaskForm from "@/components/tasks/TaskForm";

import { task_map } from "@/lib/utils";
import { format } from "date-fns";

// The main component
export default function OptimisticTask({
  task,
}: {
  task: Task;
}) {
  // State for modal open/close
  const [open, setOpen] = useState(false);

  // Function to open the modal
  const openModal = (_?: Task) => {
    setOpen(true);
  };

  // Function to close the modal
  const closeModal = () => setOpen(false);

  // Using optimistic UI pattern to handle task state
  const [optimisticTask, setOptimisticTask] = useOptimistic(task);

  // Function to update the task
  const updateTask: TAddOptimistic = (input) =>
    setOptimisticTask({ ...input.data });

  // Rendering the component
  return (
    <div className="m-4">
      <Modal open={open} setOpen={setOpen}>
        <TaskForm
          task={optimisticTask}
          closeModal={closeModal}
          openModal={openModal}
          addOptimistic={updateTask}
        />
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <p className={cn(
          "text-gray-800 dark:text-gray-100 max-w-max px-5 py-1 rounded-full",
          task.status === "TODO" ? "bg-zinc-300/40" : "",
          task.status === "IN_PROGRESS" ? "bg-yellow-300/40" : "",
          task.status === "DONE" ? "bg-green-300/40" : "",
        )}>{task_map[optimisticTask.status]}</p>
        <Button className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
      <h1 className="font-semibold text-2xl">{optimisticTask.title}</h1>
      {
        task.dueDate && (
          <p className="my-3">Due: {format(task.dueDate, "d MMMM yyyy")}</p>
        )
      }
      <p className="mt-5">{optimisticTask.description}</p>
    </div>
  );
}