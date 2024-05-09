"use client";

// Importing necessary libraries and components
import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { type Task, CompleteTask } from "@/lib/db/schema/tasks";
import Modal from "@/components/shared/Modal";

import { useOptimisticTasks } from "@/app/(app)/tasks/useOptimisticTasks";
import { Button } from "@/components/ui/button";
import TaskForm from "./TaskForm";
import { PlusIcon } from "lucide-react";
import DateFilter from "@/components/shared/DateFilter";
type TOpenModal = (task?: Task) => void;

import { task_map } from "@/lib/utils";
import { format } from "date-fns";

// Main component for the Task List
export default function TaskList({
  tasks,
  dueDate
}: {
  tasks: CompleteTask[];
    dueDate?: Date | null;
}) {
  // Using the useOptimisticTasks hook to manage the tasks state
  const { optimisticTasks, addOptimisticTask } = useOptimisticTasks(
    tasks,
  );
  // State for modal open/close
  const [open, setOpen] = useState(false);

  // State for the active task
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Function to open the modal
  const openModal = (task?: Task) => {
    setOpen(true);
    task ? setActiveTask(task) : setActiveTask(null);
  };
  // Function to close the modal
  const closeModal = () => setOpen(false);

  // State for the filter
  const [filter, setFilter] = useState("all");

  // Filter the tasks based on the filter state
  const filteredTasks = useMemo(() => {
    return optimisticTasks.filter((task) => {
      if (filter === "all") return true;
      return task.status.toLowerCase() === filter;
    });
  }, [optimisticTasks, filter]);

  // Render the component
  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={activeTask ? "Edit Task" : "Create Task"}
      >
        <TaskForm
          task={activeTask}
          addOptimistic={addOptimisticTask}
          openModal={openModal}
          closeModal={closeModal}
        />
      </Modal>

      <div className="absolute right-0 top-0 flex gap-2">
        <DateFilter page="/tasks" initialDate={dueDate} searchParam="dueDate" />
        <Button onClick={() => openModal()} variant={"outline"}>
          +
        </Button>
      </div>

      <div className="my-3">
        <div className="flex gap-2">
          <Button
            variant={"outline"}
            className={
              cn(filter === "all" && "bg-zinc-300/40")
            }
            onClick={() => setFilter("all")}
          >
            All
          </Button>

          <Button
            variant={"outline"}
            className={
              cn(filter === "todo" && "bg-zinc-300/40")
            }
            onClick={() => setFilter("todo")}
          >
            To Do
          </Button>

          <Button
            variant={"outline"}
            className={
              cn(filter === "in_progress" && "bg-yellow-300/40")
            }
            onClick={() => setFilter("in_progress")}
          >
            In Progress
          </Button>

          <Button
            variant={"outline"}
            className={
              cn(filter === "done" && "bg-green-300/40")
            }
            onClick={() => setFilter("done")}
          >
            Done
          </Button>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <Task
              task={task}
              key={task.id}
              openModal={openModal}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

// Component for a single task
const Task = ({
  task,
  openModal,
}: {
  task: CompleteTask;
  openModal: TOpenModal;
}) => {
  const optimistic = task.id === "optimistic";
  const deleting = task.id === "delete";
  const mutating = optimistic || deleting;
  const pathname = usePathname();
  const basePath = pathname.includes("tasks")
    ? pathname
    : pathname + "/tasks/";

  // Render the component
  return (
    <li
      className={cn(
        "my-2 col-span-1 px-5 py-3 rounded bg-zinc-50 dark:bg-zinc-900/70 shadow grow",
      )}
    >
      <Link href={basePath + "/" + task.id} className={cn(
        "flex justify-between",
        mutating ? "opacity-30 animate-pulse" : "",
        deleting ? "text-destructive" : "",
      )}>
        <div className="grow">
          <div className="flex space-x-2">
            <p className={cn(
              "text-muted-foreground mb-2 rounded-full px-3 py-0.5 max-w-max dark:text-zinc-200",
              task.status === "TODO" ? "bg-zinc-300/40" : "",
              task.status === "IN_PROGRESS" ? "bg-yellow-300/40" : "",
              task.status === "DONE" ? "bg-green-300/40" : "",
            )}>{task_map[task.status]}</p>
          </div>
          <h3 className="text-xl font-semibold mb-1">{task.title}</h3>
          {
            task.dueDate && (
              <p className="mb-3">Due: {format(task.dueDate, "d MMMM yyyy")}</p>
            )
          }
          <p className="text-xs line-clamp-2">
            {task.description}
          </p>
        </div>
        <Button variant={"link"} asChild>
          <Link href={basePath + "/" + task.id + '#edit'}>
            Edit
          </Link>
        </Button>
      </Link>
    </li>
  );
};

// Component for the empty state
const EmptyState = ({ openModal }: { openModal: TOpenModal }) => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No tasks
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new task.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Tasks </Button>
      </div>
    </div>
  );
};