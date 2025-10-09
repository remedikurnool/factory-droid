import { Button } from "@/components/ui/button";
import { PackageX, Search, AlertCircle } from "lucide-react";

interface EmptyStateProps {
  type: "no-products" | "no-results" | "error";
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const emptyStateConfig = {
  "no-products": {
    icon: PackageX,
    defaultTitle: "No Products Found",
    defaultDescription: "There are no products available at the moment.",
  },
  "no-results": {
    icon: Search,
    defaultTitle: "No Results Found",
    defaultDescription:
      "We couldn't find any medicines matching your search. Try adjusting your filters or search terms.",
  },
  error: {
    icon: AlertCircle,
    defaultTitle: "Something Went Wrong",
    defaultDescription:
      "We encountered an error while loading the products. Please try again.",
  },
};

export function EmptyState({
  type,
  title,
  description,
  action,
}: EmptyStateProps) {
  const config = emptyStateConfig[type];
  const Icon = config.icon;

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 rounded-full bg-muted p-6">
        <Icon className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-xl font-semibold">
        {title || config.defaultTitle}
      </h3>
      <p className="mb-6 max-w-md text-sm text-muted-foreground">
        {description || config.defaultDescription}
      </p>
      {action && (
        <Button onClick={action.onClick} variant="default">
          {action.label}
        </Button>
      )}
    </div>
  );
}
