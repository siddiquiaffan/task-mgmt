// Importing necessary components
import { Card } from "@/components/ui/card";

// Interface for the AccountCard component props
interface AccountCardProps {
  params: {
    header: string;
    description: string;
    price?: number;
  };
  children: React.ReactNode;
}

// AccountCard component
export function AccountCard({ params, children }: AccountCardProps) {
  // Destructuring the params
  const { header, description } = params;

  // Render the component
  return (
    <Card>
      <div id="body" className="p-4 ">
        <h3 className="text-xl font-semibold">{header}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {children}
    </Card>
  );
}

// AccountCardBody component
export function AccountCardBody({ children }: { children: React.ReactNode }) {
  return (
    // Body of the card
    <div className="p-4">{children}</div>
  );
}

// AccountCardFooter component
export function AccountCardFooter({
  description,
  children,
}: {
  children: React.ReactNode;
  description: string;
}) {
  // Render the component
  return (
    // Footer of the card
    <div
      className="bg-muted p-4 border dark:bg-card flex justify-between items-center rounded-b-lg"
      id="footer"
    >
      <p className="text-muted-foreground text-sm">{description}</p>
      {children}
    </div>
  );
}