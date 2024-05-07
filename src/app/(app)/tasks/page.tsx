// Importing necessary libraries and components
import { Suspense } from "react";
import Loading from "@/app/loading";
import TaskList from "@/components/tasks/TaskList";
import { getActiveTasks, getTasks, getTasksByDate } from "@/lib/api/tasks/queries";
import { checkAuth } from "@/lib/auth/utils";

// Revalidation time for the page
export const revalidate = 0;

// Main component for the Tasks Page
export default async function TasksPage({
  searchParams
}: {
  searchParams: Record<string, string>;
}) {
  // Get the date from the search parameters or use the current date
  const dueDate = new Date(searchParams.dueDate ?? new Date())
  dueDate.setHours(0, 0, 0)

  // Render the Tasks component with the provided date
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Tasks</h1>
        </div>
        <Tasks dueDate={dueDate} />
      </div>
    </main>
  );
}

// Tasks component that fetches and displays tasks
const Tasks = async ({ dueDate }: { dueDate: Date }) => {
  // Check if the user is authenticated
  await checkAuth();

  // Fetch the tasks by their creation date
  const { tasks } = await getActiveTasks({ dueDate });

  // Render the tasks inside a Suspense component
  // If the tasks data is not ready, show a loading spinner
  return (
    <Suspense fallback={<Loading />}>
      <TaskList tasks={tasks} dueDate={dueDate!} />
    </Suspense>
  );
};