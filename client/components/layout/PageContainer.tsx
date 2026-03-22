import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  /** Extra classes — e.g. override vertical padding or spacing */
  className?: string;
}

/**
 * Full-width page wrapper that fills whatever space the sidebar leaves.
 * Replaces the old `container max-w-4xl` pattern so content never has a
 * hard cap — it responds dynamically when the sidebar opens or collapses.
 *
 * Usage:
 *   <PageContainer>…cards…</PageContainer>
 *   <PageContainer className="space-y-4">…</PageContainer>
 */
export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn('w-full py-6 space-y-6', className)}>
      {children}
    </div>
  );
}
