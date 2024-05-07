// Importing necessary libraries and components
import Link from "next/link";
import SidebarItems from "./SidebarItems";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { AuthSession, getUserAuth } from "@/lib/auth/utils";

// Main component for the Sidebar
const Sidebar = async () => {
  // Get the current user's session
  const session = await getUserAuth();

  // If the user is not authenticated, don't render the sidebar
  if (session.session === null) return null;

  // Render the sidebar
  return (
    <aside className="h-screen min-w-52 bg-muted hidden md:block p-4 pt-8 border-r border-border shadow-inner">
      <div className="flex flex-col justify-between h-full">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold ml-4">task.manager</h3>
          <SidebarItems />
        </div>
        <UserDetails session={session} />
      </div>
    </aside>
  );
};

export default Sidebar;

// Component for the user details in the sidebar
const UserDetails = ({ session }: { session: AuthSession }) => {
  // If the user is not authenticated, don't render the user details
  if (session.session === null) return null;

  // Get the user from the session
  const { user } = session.session;

  // If the user doesn't have a name, don't render the user details
  if (!user?.name || user.name.length == 0) return null;

  // Render the user details
  return (
    <Link href="/account">
      <div className="flex items-center justify-between w-full border-t border-border pt-4 px-2">
        <div className="text-muted-foreground">
          <p className="text-xs">{user.name ?? "John Doe"}</p>
          <p className="text-xs font-light pr-4">
            {user.email ?? "john@doe.com"}
          </p>
        </div>
        <Avatar className="h-10 w-10">
          <AvatarFallback className="border-border border-2 text-muted-foreground">
            {user.name
              ? user.name
                ?.split(" ")
                .map((word) => word[0].toUpperCase())
                .join("")
              : "~"}
          </AvatarFallback>
        </Avatar>
      </div>
    </Link>
  );
};