import { z } from "zod";

import { useState, useTransition, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useValidatedForm } from "@/lib/hooks/useValidatedForm";

import { type Action, cn } from "@/lib/utils";
import { type TAddOptimistic } from "@/app/(app)/tasks/useOptimisticTasks";

import { task_map } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBackPath } from "@/components/shared/BackButton";

import { CalendarIcon } from "lucide-react";

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { date } from "zod";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


import { type Task, insertTaskParams } from "@/lib/db/schema/tasks";
import {
  createTaskAction,
  deleteTaskAction,
  updateTaskAction,
} from "@/lib/actions/tasks";

const TaskForm = ({
  task,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  task?: Task | null;

  openModal?: (task?: Task) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<Task>(insertTaskParams);
  const editing = !!task?.id;

  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();
  const backpath = useBackPath("tasks");

  const [dueDate, setDueDate] = useState<Date | null>(
    task?.dueDate ? new Date(task.dueDate) : new Date(new Date().setHours(23, 59, 59))
  );


  const onSuccess = (
    action: Action,
    data?: { error: string; values: Task },
  ) => {
    const failed = Boolean(data?.error);
    if (failed) {
      openModal && openModal(data?.values);
      toast.error(`Failed to ${action}`, {
        description: data?.error ?? "Error",
      });
    } else {
      router.refresh();
      postSuccess && postSuccess();
      toast.success(`Task ${action}d!`);
      if (action === "delete") router.push(backpath);
    }
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const taskParsed = await insertTaskParams.safeParseAsync({ ...payload });
    if (!taskParsed.success) {
      setErrors(taskParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = taskParsed.data;
    const pendingTask: Task = {
      updatedAt: task?.updatedAt ?? new Date(),
      createdAt: task?.createdAt ?? new Date(),
      id: task?.id ?? "",
      userId: task?.userId ?? "",
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic && addOptimistic({
          data: pendingTask,
          action: editing ? "update" : "create",
        });

        const error = editing
          ? await updateTaskAction({ ...values, id: task.id })
          : await createTaskAction(values);

        const errorFormatted = {
          error: error ?? "Error",
          values: pendingTask
        };
        onSuccess(
          editing ? "update" : "create",
          error ? errorFormatted : undefined,
        );
      });
    } catch (e) {
      if (e instanceof z.ZodError) {
        setErrors(e.flatten().fieldErrors);
      }
    }
  };

  return (
    <form action={handleSubmit} onChange={handleChange} className={"space-y-4"}>
      {/* Schema fields start */}
      <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.title ? "text-destructive" : "",
          )}
        >
          Title
        </Label>
        <Input
          type="text"
          name="title"
          className={cn(errors?.title ? "ring ring-destructive" : "")}
          defaultValue={task?.title ?? ""}
        />
        {errors?.title ? (
          <p className="text-xs text-destructive mt-2">{errors.title[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.description ? "text-destructive" : "",
          )}
        >
          Description
        </Label>
        <Input
          type="text"
          name="description"
          className={cn(errors?.description ? "ring ring-destructive" : "")}
          defaultValue={task?.description ?? ""}
        />
        {errors?.description ? (
          <p className="text-xs text-destructive mt-2">{errors.description[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.dueDate ? "text-destructive" : "",
          )}
        >
          Due Date
        </Label>

        {/* Select Option for task */}
        {/* a date input with default date as today */}
        <input
          type="date"
          name="dueDate"
          // className={cn(errors?.dueDate ? "ring ring-destructive" : "")}
          // defaultValue={(task?.dueDate ? task.dueDate.toISOString().split("T")[0] : new Date(new Date().setHours(23, 59, 59))) as string}
          className="hidden"
          value={dueDate?.toISOString().split("T")[0] as string}
        />
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="flex w-auto flex-col space-y-2 p-2"
            >
              <Select
                onValueChange={(value: any) =>
                  setDueDate(addDays(new Date(), parseInt(value)))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="0">Today</SelectItem>
                  <SelectItem value="1">Tomorrow</SelectItem>
                  <SelectItem value="3">In 3 days</SelectItem>
                  <SelectItem value="7">In a week</SelectItem>
                </SelectContent>
              </Select>
              <div className="rounded-md border">
                <Calendar
                  mode="single"
                  disabled={(date: Date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                  selected={dueDate!}
                  onSelect={(value) => {
                    let date = new Date(value! ?? '')
                    date.setHours(23, 59, 59) // set time to 23:59:59
                    setDueDate(date)
                  }}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>




        {errors?.dueDate ? (
          <p className="text-xs text-destructive mt-2">{errors.dueDate[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.status ? "text-destructive" : "",
          )}
        >
          Status
        </Label>

        {/* Select Option for task */}
        <Select defaultValue={task?.status ?? "TODO"} name='status'>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>

          <SelectContent>
            {
              Object.entries(task_map).map((t) => {
                return (
                  <SelectItem key={t[0]} value={t[0]}>{t[1]}</SelectItem>
                )
              })
            }
          </SelectContent>
        </Select>

        {errors?.status ? (
          <p className="text-xs text-destructive mt-2">{errors.status[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>

      {/* Schema fields end */}

      {/* Save Button */}
      <SaveButton errors={hasErrors} editing={editing} />

      {/* Delete Button */}
      {editing ? (
        <Button
          type="button"
          disabled={isDeleting || pending || hasErrors}
          variant={"destructive"}
          onClick={() => {
            setIsDeleting(true);
            closeModal && closeModal();
            startMutation(async () => {
              addOptimistic && addOptimistic({ action: "delete", data: task });
              const error = await deleteTaskAction(task.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? "Error",
                values: task,
              };

              onSuccess("delete", error ? errorFormatted : undefined);
            });
          }}
        >
          Delet{isDeleting ? "ing..." : "e"}
        </Button>
      ) : null}
    </form>
  );
};

export default TaskForm;

const SaveButton = ({
  editing,
  errors,
}: {
  editing: Boolean;
  errors: boolean;
}) => {
  const { pending } = useFormStatus();
  const isCreating = pending && editing === false;
  const isUpdating = pending && editing === true;
  return (
    <Button
      type="submit"
      className="mr-2"
      disabled={isCreating || isUpdating || errors}
      aria-disabled={isCreating || isUpdating || errors}
    >
      {editing
        ? `Sav${isUpdating ? "ing..." : "e"}`
        : `Creat${isCreating ? "ing..." : "e"}`}
    </Button>
  );
};
