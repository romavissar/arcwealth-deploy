"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { PropertiesRadarChart } from "@/components/textbook/diagrams/PropertiesRadarChart";
import { EvolutionTimeline } from "@/components/textbook/diagrams/EvolutionTimeline";
import { BarterVsMoneyChart } from "@/components/textbook/diagrams/BarterVsMoneyChart";
import { MoneyDonutChart } from "@/components/textbook/diagrams/MoneyDonutChart";
import { NeedsWantsSplitChart } from "@/components/textbook/diagrams/NeedsWantsSplitChart";
import { WantEscalationChart } from "@/components/textbook/diagrams/WantEscalationChart";
import { CostOfConfusionChart } from "@/components/textbook/diagrams/CostOfConfusionChart";
import { ImpulseCycleChart } from "@/components/textbook/diagrams/ImpulseCycleChart";
import { WhereImpulseChart } from "@/components/textbook/diagrams/WhereImpulseChart";
import { AnnualCostChart } from "@/components/textbook/diagrams/AnnualCostChart";
import { WaitingEffectChart } from "@/components/textbook/diagrams/WaitingEffectChart";

const CHART_SRC = [
  "chart_properties_radar.png",
  "chart_evolution.png",
  "chart_barter_vs_money.png",
  "chart_money_donut.png",
  "chart_1_1_2_A_needs_wants_split.png",
  "chart_1_1_2_B_want_escalation.png",
  "chart_1_1_2_C_cost_of_confusion.png",
  "chart_1_1_3_A_where_impulse.png",
  "chart_1_1_3_B_impulse_cycle.png",
  "chart_1_1_3_C_annual_cost.png",
  "chart_1_1_3_D_waiting_effect.png",
] as const;

function ChartBlock({ src }: { src: string }) {
  if (src === "chart_properties_radar.png") return <PropertiesRadarChart />;
  if (src === "chart_evolution.png") return <EvolutionTimeline />;
  if (src === "chart_barter_vs_money.png") return <BarterVsMoneyChart />;
  if (src === "chart_money_donut.png") return <MoneyDonutChart />;
  if (src === "chart_1_1_2_A_needs_wants_split.png") return <NeedsWantsSplitChart />;
  if (src === "chart_1_1_2_B_want_escalation.png") return <WantEscalationChart />;
  if (src === "chart_1_1_2_C_cost_of_confusion.png") return <CostOfConfusionChart />;
  if (src === "chart_1_1_3_A_where_impulse.png") return <WhereImpulseChart />;
  if (src === "chart_1_1_3_B_impulse_cycle.png") return <ImpulseCycleChart />;
  if (src === "chart_1_1_3_C_annual_cost.png") return <AnnualCostChart />;
  if (src === "chart_1_1_3_D_waiting_effect.png") return <WaitingEffectChart />;
  return (
    <div className="my-4 rounded-lg border border-gray-200 bg-gray-50 py-6 text-center text-sm text-gray-500">
      [Chart: {src}]
    </div>
  );
}

function splitMarkdownAndCharts(markdown: string): Array<{ type: "markdown"; value: string } | { type: "chart"; src: string }> {
  const segments: Array<{ type: "markdown"; value: string } | { type: "chart"; src: string }> = [];
  const chartRegex = /!\[[^\]]*\]\((chart_[^)]+\.png)\)/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = chartRegex.exec(markdown)) !== null) {
    const src = m[1];
    if (CHART_SRC.includes(src as (typeof CHART_SRC)[number])) {
      if (m.index > lastIndex) {
        segments.push({ type: "markdown", value: markdown.slice(lastIndex, m.index) });
      }
      segments.push({ type: "chart", src });
      lastIndex = m.index + m[0].length;
    }
  }
  if (lastIndex < markdown.length) {
    segments.push({ type: "markdown", value: markdown.slice(lastIndex) });
  }
  return segments.length > 0 ? segments : [{ type: "markdown", value: markdown }];
}

const mdComponents = {
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
        {children}
      </table>
    </div>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="border-b border-gray-200 bg-gray-50 px-3 py-2 text-left text-sm font-medium text-gray-900">
      {children}
    </th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="border-b border-gray-100 px-3 py-2 text-sm text-gray-700">{children}</td>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-gray-700 mb-4 leading-relaxed">{children}</p>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-4 border-primary bg-primary/5 py-2 pl-4 pr-4 my-4 rounded-r-lg text-gray-700">
      {children}
    </blockquote>
  ),
};

interface LessonContentStepProps {
  title: string;
  body: string;
  onNext: () => void;
}

export function LessonContentStep({ title, body, onNext }: LessonContentStepProps) {
  const segments = splitMarkdownAndCharts(body);

  return (
    <div className="w-full max-w-2xl mx-auto pb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="prose prose-gray prose-sm max-w-none text-left space-y-4">
        {segments.map((seg, i) =>
          seg.type === "markdown" ? (
            <ReactMarkdown key={i} remarkPlugins={[remarkGfm]} components={mdComponents}>
              {seg.value}
            </ReactMarkdown>
          ) : (
            <ChartBlock key={i} src={seg.src} />
          )
        )}
      </div>
      <Button size="lg" onClick={onNext} className="w-full sm:w-auto mt-6">
        Continue
      </Button>
    </div>
  );
}
