// Importing necessary libraries and components
import UserSettings from "./UserSettings";
import { checkAuth, getUserAuth } from "@/lib/auth/utils";
import SignOutBtn from "@/components/auth/SignOutBtn";

// Main component for the Account page
export default async function Account() {
  // Check if the user is authenticated
  await checkAuth();

  // Get the current user's session
  const { session } = await getUserAuth();

  // Render the component
  return (
    <main>
      {/* Container for the title and the sign out button */}
      <div className="flex justify-between w-full my-4">
        <h1 className="text-2xl font-semibold">Account</h1>
        <SignOutBtn />
      </div>

      <div className="space-y-4">
        <UserSettings session={session} />
      </div>
    </main>
  );
}