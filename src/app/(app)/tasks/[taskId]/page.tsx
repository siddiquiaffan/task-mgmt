// Importing necessary libraries and components
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTaskById } from "@/lib/api/tasks/queries";
import OptimisticTask from "./OptimisticTask";
import { checkAuth } from "@/lib/auth/utils";
import { BackButton } from "@/components/shared/BackButton";
import Loading from "@/app/loading";

// Revalidation time for the page
export const revalidate = 0;

// Main component for the Task Page
export default async function TaskPage({
  params,
}: {
  params: { taskId: string };
}) {
  // Render the Task component with the provided task ID
  return (
    <main className="overflow-auto">
      <Task id={params.taskId} />
    </main>
  );
}

// Task component that fetches and displays a task
const Task = async ({ id }: { id: string }) => {
  // Check if the user is authenticated
  await checkAuth();

  // Fetch the task by its ID
  const { task } = await getTaskById(id);

  // If the task doesn't exist, navigate to the not found page
  if (!task) notFound();

  // Render the task details inside a Suspense component
  // If the task data is not ready, show a loading spinner
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <BackButton currentResource="tasks" />
        <OptimisticTask task={task} />
      </div>
    </Suspense>
  );
};