import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs = ({ items, className }: BreadcrumbsProps) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center text-sm text-muted-foreground", className)}
    >
      <ol className="flex items-center gap-1 flex-wrap">
        {items.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
              )}

              {isLast ? (
                <span className="font-semibold text-foreground truncate max-w-[200px]">
                  {isFirst && (
                    <Home className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
                  )}
                  {item.label}
                </span>
              ) : item.href ? (
                <Link
                  to={item.href}
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors truncate max-w-[200px]"
                >
                  {isFirst && <Home className="w-3.5 h-3.5 flex-shrink-0" />}
                  {item.label}
                </Link>
              ) : (
                <span className="truncate max-w-[200px]">
                  {isFirst && (
                    <Home className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
                  )}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
export type { BreadcrumbItem };
