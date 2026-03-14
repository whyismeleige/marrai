// src/app/dashboard/pages/[id]/page.tsx
import { auth } from "@clerk/nextjs/server";
import { getBrandPage } from "@/lib/mongodb";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  Calendar,
  Brain,
  FileText,
  ShieldCheck,
  BarChart3,
} from "lucide-react";
import type { AuditFinding } from "@/lib/mongodb";
import PageAuditActions from "@/components/dashboard/page-audit-actions";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scoreGrade(score: number) {
  if (score >= 80)
    return {
      label: "Excellent",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      ring: "stroke-emerald-500",
    };
  if (score >= 60)
    return {
      label: "Good",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      ring: "stroke-blue-500",
    };
  if (score >= 45)
    return {
      label: "Needs Work",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      ring: "stroke-amber-500",
    };
  return {
    label: "Critical",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    ring: "stroke-red-500",
  };
}

// ─── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({
  score,
  grade,
}: {
  score: number;
  grade: ReturnType<typeof scoreGrade>;
}) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="8"
          className="stroke-muted"
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="8"
          className={grade.ring}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-foreground tabular-nums leading-none">
          {score}
        </span>
        <span className="text-[11px] font-semibold text-muted-foreground mt-1">
          / 100
        </span>
      </div>
    </div>
  );
}

// ─── Category Bar ─────────────────────────────────────────────────────────────

function CategoryBar({
  label,
  score,
  max,
  icon: Icon,
  color,
}: {
  label: string;
  score: number;
  max: number;
  icon: React.ElementType;
  color: string;
}) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  const barColor =
    pct >= 70 ? "bg-emerald-500" : pct >= 45 ? "bg-amber-500" : "bg-red-500";

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <Icon className={`h-3.5 w-3.5 ${color}`} />
          <span className="text-xs font-semibold text-muted-foreground">
            {label}
          </span>
        </div>
        <span className="text-xs font-bold text-foreground tabular-nums">
          {score}
          <span className="text-muted-foreground font-normal">/{max}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Finding Row ─────────────────────────────────────────────────────────────

function FindingRow({ finding }: { finding: AuditFinding }) {
  const config = {
    critical: {
      Icon: AlertCircle,
      color: "text-red-500",
      bg: "bg-red-500/5 border-red-500/15",
    },
    warning: {
      Icon: AlertTriangle,
      color: "text-amber-500",
      bg: "bg-amber-500/5 border-amber-500/15",
    },
    suggestion: {
      Icon: Lightbulb,
      color: "text-blue-500",
      bg: "bg-blue-500/5 border-blue-500/15",
    },
  }[finding.priority];

  const { Icon } = config;

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border ${config.bg}`}
    >
      <Icon className={`h-4 w-4 ${config.color} shrink-0 mt-0.5`} />
      <p className="text-sm text-foreground leading-relaxed">{finding.text}</p>
    </div>
  );
}

// ─── Empty / Auditing State ───────────────────────────────────────────────────

function AuditingState({ status }: { status: "unaudited" | "auditing" }) {
  return (
    <div className="surface-card rounded-2xl p-12 text-center">
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 ${
          status === "auditing" ? "bg-primary/10" : "bg-muted"
        }`}
      >
        <RefreshCw
          className={`h-6 w-6 ${
            status === "auditing"
              ? "text-primary animate-spin"
              : "text-muted-foreground"
          }`}
        />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2">
        {status === "auditing" ? "Audit in progress…" : "Not yet audited"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        {status === "auditing"
          ? "We're analyzing this page for AEO signals. Results will appear in about 30 seconds."
          : 'Click "Re-audit" in the top right to analyze this page for AI search visibility.'}
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const page = await getBrandPage(id);

  // Guard: not found or wrong user
  if (!page || page.userId !== userId) notFound();

  const domain = (() => {
    try {
      return new URL(page.url).hostname.replace(/^www\./, "");
    } catch {
      return page.url;
    }
  })();

  const isUnaudited = page.status === "unaudited" || page.status === "auditing";
  const score = page.score ?? 0;
  const grade = scoreGrade(score);
  const cats = page.categoryScores ?? {
    schema: 0,
    content: 0,
    technical: 0,
    structure: 0,
  };
  const findings = page.findings ?? [];
  const criticals = findings.filter((f) => f.priority === "critical");
  const warnings = findings.filter((f) => f.priority === "warning");
  const suggestions = findings.filter((f) => f.priority === "suggestion");

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* ── Back + Header ── */}
      <Link
        href="/dashboard/pages"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Pages
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <img
              src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
              alt=""
              className="w-4 h-4 rounded-sm shrink-0"
            />
            <span className="text-sm text-muted-foreground truncate max-w-[300px]">
              {page.url}
            </span>
            <a
              href={page.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
            </a>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            {page.label || domain}
          </h1>
          {page.lastAuditedAt && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              Last audited{" "}
              {new Date(page.lastAuditedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          )}
        </div>

        {/* Re-audit button (client component) */}
        <PageAuditActions pageId={id} status={page.status} />
      </div>

      {/* ── Unaudited / Auditing ── */}
      {isUnaudited ? (
        <AuditingState status={page.status as "unaudited" | "auditing"} />
      ) : (
        <>
          {/* ── Score hero ── */}
          <div className="surface-card rounded-2xl p-6 sm:p-8 mb-4">
            <div className="grid sm:grid-cols-[auto,1fr] gap-6 sm:gap-8 items-center">
              {/* Ring + grade badge */}
              <div className="flex flex-col items-center gap-3">
                <ScoreRing score={score} grade={grade} />
                <div
                  className={`text-sm font-bold px-3.5 py-1 rounded-full border ${grade.bg} ${grade.color} ${grade.border}`}
                >
                  {grade.label}
                </div>
              </div>

              {/* Category bars */}
              <div>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  {score >= 80
                    ? "Excellent AEO coverage — this page is well-positioned to be cited by AI tools."
                    : score >= 60
                      ? "Good foundation. A few targeted improvements will boost AI visibility significantly."
                      : score >= 45
                        ? "Moderate optimisation needed. Address the critical issues below for quick wins."
                        : "Significant AEO work needed. Start with schema markup and content structure today."}
                </p>
                <div className="space-y-3">
                  <CategoryBar
                    label="Schema & AI Signals"
                    score={cats.schema}
                    max={25}
                    icon={Brain}
                    color="text-violet-500"
                  />
                  <CategoryBar
                    label="Content Quality"
                    score={cats.content}
                    max={30}
                    icon={FileText}
                    color="text-blue-500"
                  />
                  <CategoryBar
                    label="Technical Signals"
                    score={cats.technical}
                    max={25}
                    icon={ShieldCheck}
                    color="text-emerald-500"
                  />
                  <CategoryBar
                    label="Page Structure"
                    score={cats.structure}
                    max={20}
                    icon={BarChart3}
                    color="text-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Issue count summary ── */}
          {findings.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                {
                  label: "Critical",
                  count: criticals.length,
                  textColor: "text-red-500",
                  borderColor: "border-red-500/20",
                  bgColor: "bg-red-500/5",
                },
                {
                  label: "Warnings",
                  count: warnings.length,
                  textColor: "text-amber-500",
                  borderColor: "border-amber-500/20",
                  bgColor: "bg-amber-500/5",
                },
                {
                  label: "Suggestions",
                  count: suggestions.length,
                  textColor: "text-blue-500",
                  borderColor: "border-blue-500/20",
                  bgColor: "bg-blue-500/5",
                },
              ].map(({ label, count, textColor, borderColor, bgColor }) => (
                <div
                  key={label}
                  className={`rounded-xl p-4 border text-center ${bgColor} ${borderColor}`}
                >
                  <div
                    className={`text-2xl font-black tabular-nums ${textColor}`}
                  >
                    {count}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Findings ── */}
          {findings.length === 0 ? (
            <div className="surface-card rounded-2xl p-10 text-center">
              <div className="text-3xl mb-3">🎉</div>
              <h3 className="text-base font-semibold text-foreground mb-1">
                No issues found!
              </h3>
              <p className="text-sm text-muted-foreground">
                This page looks great from an AEO perspective. Keep it up.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Critical */}
              {criticals.length > 0 && (
                <div className="surface-card rounded-2xl p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                    </div>
                    <h2 className="text-sm font-semibold text-foreground">
                      Critical Issues{" "}
                      <span className="text-muted-foreground font-normal">
                        ({criticals.length})
                      </span>
                    </h2>
                    <span className="ml-auto text-[11px] text-red-500 font-medium bg-red-500/8 border border-red-500/15 px-2 py-0.5 rounded-full">
                      Fix first
                    </span>
                  </div>
                  <div className="space-y-2">
                    {criticals.map((f, i) => (
                      <FindingRow key={i} finding={f} />
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {warnings.length > 0 && (
                <div className="surface-card rounded-2xl p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    </div>
                    <h2 className="text-sm font-semibold text-foreground">
                      Warnings{" "}
                      <span className="text-muted-foreground font-normal">
                        ({warnings.length})
                      </span>
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {warnings.map((f, i) => (
                      <FindingRow key={i} finding={f} />
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="surface-card rounded-2xl p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Lightbulb className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    <h2 className="text-sm font-semibold text-foreground">
                      Suggestions{" "}
                      <span className="text-muted-foreground font-normal">
                        ({suggestions.length})
                      </span>
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {suggestions.map((f, i) => (
                      <FindingRow key={i} finding={f} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── CTA: Schema library ── */}
          <div className="mt-4 surface-card rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Ready to fix these issues?
              </h3>
              <p className="text-xs text-muted-foreground">
                Generate JSON-LD snippets from our Schema Library and paste them
                into your page.
              </p>
            </div>
            <Link
              href="/dashboard/schema"
              className="btn-primary h-9 px-4 text-sm shrink-0"
            >
              Open Schema Library
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
