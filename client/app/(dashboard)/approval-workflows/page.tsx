"use client";
export const dynamic = 'force-dynamic';

import { useMemo, useState } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { useApprovalWorkflows, useDeleteApprovalWorkflow, useToggleApprovalWorkflow } from '@/hooks/approval-workflows/useApprovalWorkflows';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  Layers,
  Search,
  GitBranch,
  User,
  Shield,
  UserCheck,
  Building2,
  Banknote,
  ShieldCheck,
  Server,
  HelpCircle,
  ChevronRight,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { ApprovalStep, ApprovalWorkflow } from '@/lib/api/approval-workflow';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

// ─── Approver type metadata ──────────────────────────────────────────────────

const APPROVER_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  SpecificUser:      { label: 'Specific User',    icon: User,        color: 'text-blue-600' },
  Role:              { label: 'By Role',           icon: Shield,      color: 'text-violet-600' },
  RequestersManager: { label: "Requester's Mgr",  icon: UserCheck,   color: 'text-teal-600' },
  DepartmentHead:    { label: 'Dept. Head',        icon: Building2,   color: 'text-orange-600' },
  CostCenterOwner:   { label: 'Cost Center Owner', icon: Banknote,    color: 'text-amber-600' },
  SecurityTeam:      { label: 'Security Team',     icon: ShieldCheck, color: 'text-red-600' },
  ITManagement:      { label: 'IT Management',     icon: Server,      color: 'text-indigo-600' },
};

function getApproverMeta(type: string) {
  return APPROVER_META[type] ?? { label: type, icon: HelpCircle, color: 'text-muted-foreground' };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ApprovalWorkflowsPage() {
  const { navigateTo } = useNavigation();
  const { data: workflows = [], isLoading } = useApprovalWorkflows();
  const deleteMutation = useDeleteApprovalWorkflow();
  const toggleMutation = useToggleApprovalWorkflow();

  const [search, setSearch] = useState('');
  const [showActive, setShowActive] = useState<'all' | 'active' | 'inactive'>('all');

  const stats = useMemo(() => ({
    total:    workflows.length,
    active:   workflows.filter((w) => w.isActive).length,
    inactive: workflows.filter((w) => !w.isActive).length,
    steps:    workflows.reduce((s, w) => s + (w.steps?.length ?? 0), 0),
  }), [workflows]);

  const filtered = useMemo(() => {
    return workflows.filter((w) => {
      if (showActive === 'active'   && !w.isActive) return false;
      if (showActive === 'inactive' &&  w.isActive) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!w.name.toLowerCase().includes(q) && !(w.description ?? '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [workflows, search, showActive]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <GitBranch className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Approval Workflows</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Define multi-step approval chains for service requests
            </p>
          </div>
        </div>
        <Button onClick={() => navigateTo('/approval-workflows/create')} size="sm">
          <Plus className="h-4 w-4 mr-1.5" /> New Workflow
        </Button>
      </div>

      {/* ── Stats ── */}
      {workflows.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MiniStat label="Total" value={stats.total} icon={<Layers className="h-4 w-4 text-primary" />} accent="primary" />
          <MiniStat label="Active" value={stats.active} icon={<CheckCircle2 className="h-4 w-4 text-green-600" />} accent="green" />
          <MiniStat label="Inactive" value={stats.inactive} icon={<XCircle className="h-4 w-4 text-muted-foreground" />} accent="gray" />
          <MiniStat label="Total Steps" value={stats.steps} icon={<Zap className="h-4 w-4 text-violet-600" />} accent="violet" />
        </div>
      )}

      {/* ── Filter bar ── */}
      {workflows.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search workflows…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
          <div className="flex rounded-lg border overflow-hidden text-sm h-9">
            {(['all', 'active', 'inactive'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setShowActive(v)}
                className={cn(
                  'px-3 capitalize transition-colors',
                  showActive === v
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                {v}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground ml-auto">
            {filtered.length} of {workflows.length} workflow{workflows.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* ── List ── */}
      {workflows.length === 0 ? (
        <EmptyState onCreateNew={() => navigateTo('/approval-workflows/create')} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No workflows match your filters</p>
          <button onClick={() => { setSearch(''); setShowActive('all'); }} className="text-sm text-primary underline mt-1">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((wf) => (
            <WorkflowCard
              key={wf.id}
              workflow={wf}
              onNavigate={(path) => navigateTo(path)}
              onToggle={() => toggleMutation.mutate({ id: wf.id, isActive: wf.isActive })}
              onDelete={() => deleteMutation.mutate(wf.id)}
              isToggling={toggleMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}


function WorkflowCard({ workflow: wf, onNavigate, onToggle, onDelete, isToggling }: {
  workflow: ApprovalWorkflow;
  onNavigate: (path: string) => void;
  onToggle: () => void;
  onDelete: () => void;
  isToggling: boolean;
}) {
  return (
    <div
      className="rounded-xl border bg-card hover:shadow-sm transition-shadow"
    >
      <div
        className="p-4 cursor-pointer"
        onClick={() => onNavigate(`/approval-workflows/${wf.id}`)}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-base">{wf.name}</span>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  wf.isActive
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {wf.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            {wf.description && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{wf.description}</p>
            )}
          </div>

          {/* Actions — stop propagation so card click doesn't fire */}
          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            <Switch
              checked={wf.isActive}
              onCheckedChange={onToggle}
              disabled={isToggling}
              aria-label={wf.isActive ? 'Deactivate workflow' : 'Activate workflow'}
            />
            <Separator orientation="vertical" className="h-5 mx-1" />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onNavigate(`/approval-workflows/${wf.id}/edit`)}
              title="Edit"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive/70 hover:text-destructive"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete &quot;{wf.name}&quot;? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={onDelete}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50 ml-1" />
          </div>
        </div>

        {/* Step chain */}
        {(wf.steps?.length ?? 0) > 0 && (
          <div className="mt-3">
            <StepChain steps={wf.steps} />
          </div>
        )}

        {/* Footer metadata */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 pt-3 border-t border-border/50">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Layers className="h-3.5 w-3.5" />
            {wf.steps?.length ?? 0} approval step{(wf.steps?.length ?? 0) !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {wf.escalationTimeoutHours}h escalation timeout
          </span>
          {(wf.requestTypes?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1 ml-auto">
              {wf.requestTypes.map((type) => (
                <Badge key={type} variant="outline" className="text-xs px-1.5 py-0">
                  {type}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


function StepChain({ steps }: { steps: ApprovalStep[] }) {
  const sorted = [...steps].sort((a, b) => a.order - b.order);
  const MAX_VISIBLE = 4;
  const visible = sorted.slice(0, MAX_VISIBLE);
  const overflow = sorted.length - MAX_VISIBLE;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {visible.map((step, i) => {
        const meta = getApproverMeta(step.approverType);
        const Icon = meta.icon;
        return (
          <div key={step.id ?? i} className="flex items-center gap-1">
            <div className="flex items-center gap-1.5 rounded-lg bg-muted/60 border px-2.5 py-1.5 text-xs">
              <span className={cn('font-bold text-[10px] tabular-nums w-3.5 h-3.5 rounded-full bg-muted-foreground/20 flex items-center justify-center shrink-0', meta.color)}>
                {step.order}
              </span>
              <Icon className={cn('h-3 w-3 shrink-0', meta.color)} />
              <span className="font-medium max-w-[100px] truncate" title={step.name}>
                {step.name}
              </span>
              {step.requireAll && (
                <span className="text-[10px] text-muted-foreground">(all)</span>
              )}
            </div>
            {i < visible.length - 1 || overflow > 0 ? (
              <ArrowRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
            ) : null}
          </div>
        );
      })}
      {overflow > 0 && (
        <span className="text-xs text-muted-foreground bg-muted rounded-lg px-2 py-1.5 border">
          +{overflow} more
        </span>
      )}
    </div>
  );
}

// ─── MiniStat ────────────────────────────────────────────────────────────────

const accentCls: Record<string, string> = {
  primary: 'bg-primary/5 dark:bg-primary/10',
  green:   'bg-green-50 dark:bg-green-950/30',
  gray:    'bg-muted/60',
  violet:  'bg-violet-50 dark:bg-violet-950/30',
};

function MiniStat({ label, value, icon, accent }: {
  label: string; value: number; icon: React.ReactNode; accent: string;
}) {
  return (
    <div className={cn('flex items-center gap-3 rounded-xl border p-3.5', accentCls[accent] ?? accentCls.gray)}>
      <div className="shrink-0">{icon}</div>
      <div>
        <p className="text-xl font-bold leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <div className="flex flex-col items-center py-20 text-center gap-4">
      <div className="rounded-full bg-primary/10 p-5">
        <GitBranch className="h-8 w-8 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-lg">No approval workflows yet</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
          Create workflows to define who must approve service requests before they&rsquo;re fulfilled.
        </p>
      </div>
      <Button onClick={onCreateNew}>
        <Plus className="h-4 w-4 mr-1.5" /> Create First Workflow
      </Button>
    </div>
  );
}
