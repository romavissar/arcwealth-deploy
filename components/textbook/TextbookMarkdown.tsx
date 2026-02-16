"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { PropertiesRadarChart } from "./diagrams/PropertiesRadarChart";
import { EvolutionTimeline } from "./diagrams/EvolutionTimeline";
import { BarterVsMoneyChart } from "./diagrams/BarterVsMoneyChart";
import { MoneyDonutChart } from "./diagrams/MoneyDonutChart";
import { NeedsWantsSplitChart } from "./diagrams/NeedsWantsSplitChart";
import { WantEscalationChart } from "./diagrams/WantEscalationChart";
import { CostOfConfusionChart } from "./diagrams/CostOfConfusionChart";
import { ImpulseCycleChart } from "./diagrams/ImpulseCycleChart";
import { WhereImpulseChart } from "./diagrams/WhereImpulseChart";
import { AnnualCostChart } from "./diagrams/AnnualCostChart";
import { WaitingEffectChart } from "./diagrams/WaitingEffectChart";
import { DopamineCurveChart } from "./diagrams/DopamineCurveChart";
import { RewardSchedulesChart } from "./diagrams/RewardSchedulesChart";
import { DopamineIndustriesChart } from "./diagrams/DopamineIndustriesChart";
import { HedonicAdaptationChart } from "./diagrams/HedonicAdaptationChart";
import { MarshmallowOutcomesChart } from "./diagrams/MarshmallowOutcomesChart";
import { PresentBiasChart } from "./diagrams/PresentBiasChart";
import { CostInstantGratificationChart } from "./diagrams/CostInstantGratificationChart";
import { StrategiesEffectivenessChart } from "./diagrams/StrategiesEffectivenessChart";
import { FourScriptsChart } from "./diagrams/FourScriptsChart";
import { BeliefSourcesChart } from "./diagrams/BeliefSourcesChart";
import { BeliefReframesChart } from "./diagrams/BeliefReframesChart";
import { OutcomesByScriptChart } from "./diagrams/OutcomesByScriptChart";
import { EmotionTriggersChart } from "./diagrams/EmotionTriggersChart";
import { EmotionCycleChart } from "./diagrams/EmotionCycleChart";
import { EmotionalSpendingAnnualCostChart } from "./diagrams/EmotionalSpendingAnnualCostChart";
import { CopingComparisonChart } from "./diagrams/CopingComparisonChart";
import { AnchoringEffectChart } from "./diagrams/AnchoringEffectChart";
import { PricingTacticsChart } from "./diagrams/PricingTacticsChart";
import { LeftDigitEffectChart } from "./diagrams/LeftDigitEffectChart";
import { DecoyEffectChart } from "./diagrams/DecoyEffectChart";
import { MindsetComparisonChart } from "./diagrams/MindsetComparisonChart";
import { ScarcitySpiralChart } from "./diagrams/ScarcitySpiralChart";
import { OutcomesByMindsetChart } from "./diagrams/OutcomesByMindsetChart";
import { BuildingAbundanceChart } from "./diagrams/BuildingAbundanceChart";
import { SatisfactionComparisonChart } from "./diagrams/SatisfactionComparisonChart";
import { CoreValuesChart } from "./diagrams/CoreValuesChart";
import { AlignmentMatrixChart } from "./diagrams/AlignmentMatrixChart";
import { SpendingShiftChart } from "./diagrams/SpendingShiftChart";
import { VagueVsSmartChart } from "./diagrams/VagueVsSmartChart";
import { SmartFrameworkChart } from "./diagrams/SmartFrameworkChart";
import { WhyGoalsFailChart } from "./diagrams/WhyGoalsFailChart";
import { GoalProcessChart } from "./diagrams/GoalProcessChart";
import { HabitLoopChart } from "./diagrams/HabitLoopChart";
import { HabitsRankedChart } from "./diagrams/HabitsRankedChart";
import { CompoundingHabitsChart } from "./diagrams/CompoundingHabitsChart";
import { HabitFormationChart } from "./diagrams/HabitFormationChart";

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
  "chart_1_1_4_A_dopamine_curve.png",
  "chart_1_1_4_B_reward_schedules.png",
  "chart_1_1_4_C_dopamine_industries.png",
  "chart_1_1_4_D_hedonic_adaptation.png",
  "chart_1_1_5_A_marshmallow_outcomes.png",
  "chart_1_1_5_B_present_bias.png",
  "chart_1_1_5_C_cost_instant_gratification.png",
  "chart_1_1_5_D_strategies.png",
  "chart_1_1_6_A_four_scripts.png",
  "chart_1_1_6_B_belief_sources.png",
  "chart_1_1_6_C_belief_reframes.png",
  "chart_1_1_6_D_outcomes_by_script.png",
  "chart_1_1_7_A_emotion_triggers.png",
  "chart_1_1_7_B_emotion_cycle.png",
  "chart_1_1_7_C_annual_cost.png",
  "chart_1_1_7_D_coping_comparison.png",
  "chart_1_1_8_A_anchoring_effect.png",
  "chart_1_1_8_B_pricing_tactics.png",
  "chart_1_1_8_C_left_digit_effect.png",
  "chart_1_1_8_D_decoy_effect.png",
  "chart_1_1_9_A_mindset_comparison.png",
  "chart_1_1_9_B_outcomes_by_mindset.png",
  "chart_1_1_9_C_scarcity_spiral.png",
  "chart_1_1_9_D_building_abundance.png",
  "chart_1_1_10_A_satisfaction_comparison.png",
  "chart_1_1_10_B_core_values.png",
  "chart_1_1_10_C_alignment_matrix.png",
  "chart_1_1_10_D_spending_shift.png",
  "chart_1_1_11_A_vague_vs_smart.png",
  "chart_1_1_11_B_smart_framework.png",
  "chart_1_1_11_C_why_goals_fail.png",
  "chart_1_1_11_D_goal_process.png",
  "chart_1_1_12_A_habit_loop.png",
  "chart_1_1_12_B_habits_ranked.png",
  "chart_1_1_12_C_compounding_habits.png",
  "chart_1_1_12_D_habit_formation.png",
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
  if (src === "chart_1_1_4_A_dopamine_curve.png") return <DopamineCurveChart />;
  if (src === "chart_1_1_4_B_reward_schedules.png") return <RewardSchedulesChart />;
  if (src === "chart_1_1_4_C_dopamine_industries.png") return <DopamineIndustriesChart />;
  if (src === "chart_1_1_4_D_hedonic_adaptation.png") return <HedonicAdaptationChart />;
  if (src === "chart_1_1_5_A_marshmallow_outcomes.png") return <MarshmallowOutcomesChart />;
  if (src === "chart_1_1_5_B_present_bias.png") return <PresentBiasChart />;
  if (src === "chart_1_1_5_C_cost_instant_gratification.png") return <CostInstantGratificationChart />;
  if (src === "chart_1_1_5_D_strategies.png") return <StrategiesEffectivenessChart />;
  if (src === "chart_1_1_6_A_four_scripts.png") return <FourScriptsChart />;
  if (src === "chart_1_1_6_B_belief_sources.png") return <BeliefSourcesChart />;
  if (src === "chart_1_1_6_C_belief_reframes.png") return <BeliefReframesChart />;
  if (src === "chart_1_1_6_D_outcomes_by_script.png") return <OutcomesByScriptChart />;
  if (src === "chart_1_1_7_A_emotion_triggers.png") return <EmotionTriggersChart />;
  if (src === "chart_1_1_7_B_emotion_cycle.png") return <EmotionCycleChart />;
  if (src === "chart_1_1_7_C_annual_cost.png") return <EmotionalSpendingAnnualCostChart />;
  if (src === "chart_1_1_7_D_coping_comparison.png") return <CopingComparisonChart />;
  if (src === "chart_1_1_8_A_anchoring_effect.png") return <AnchoringEffectChart />;
  if (src === "chart_1_1_8_B_pricing_tactics.png") return <PricingTacticsChart />;
  if (src === "chart_1_1_8_C_left_digit_effect.png") return <LeftDigitEffectChart />;
  if (src === "chart_1_1_8_D_decoy_effect.png") return <DecoyEffectChart />;
  if (src === "chart_1_1_9_A_mindset_comparison.png") return <MindsetComparisonChart />;
  if (src === "chart_1_1_9_B_outcomes_by_mindset.png") return <OutcomesByMindsetChart />;
  if (src === "chart_1_1_9_C_scarcity_spiral.png") return <ScarcitySpiralChart />;
  if (src === "chart_1_1_9_D_building_abundance.png") return <BuildingAbundanceChart />;
  if (src === "chart_1_1_10_A_satisfaction_comparison.png") return <SatisfactionComparisonChart />;
  if (src === "chart_1_1_10_B_core_values.png") return <CoreValuesChart />;
  if (src === "chart_1_1_10_C_alignment_matrix.png") return <AlignmentMatrixChart />;
  if (src === "chart_1_1_10_D_spending_shift.png") return <SpendingShiftChart />;
  if (src === "chart_1_1_11_A_vague_vs_smart.png") return <VagueVsSmartChart />;
  if (src === "chart_1_1_11_B_smart_framework.png") return <SmartFrameworkChart />;
  if (src === "chart_1_1_11_C_why_goals_fail.png") return <WhyGoalsFailChart />;
  if (src === "chart_1_1_11_D_goal_process.png") return <GoalProcessChart />;
  if (src === "chart_1_1_12_A_habit_loop.png") return <HabitLoopChart />;
  if (src === "chart_1_1_12_B_habits_ranked.png") return <HabitsRankedChart />;
  if (src === "chart_1_1_12_C_compounding_habits.png") return <CompoundingHabitsChart />;
  if (src === "chart_1_1_12_D_habit_formation.png") return <HabitFormationChart />;
  return (
    <div className="my-8 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-8 text-center text-gray-500 dark:text-gray-400">
      [Chart: {src}]
    </div>
  );
}

/** Split markdown into segments: text chunks and chart placeholders. Charts are rendered as blocks, never inside markdown, so no figure-in-p. */
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

interface TextbookMarkdownProps {
  markdown: string;
  topicId: string;
  topicTitle: string;
  levelName?: string;
  sectionName?: string;
}

export function TextbookMarkdown({
  markdown,
  topicId,
  topicTitle,
  levelName = "Topic 1",
  sectionName = "Money Psychology",
}: TextbookMarkdownProps) {
  const segments = splitMarkdownAndCharts(markdown);
  const mdComponents = {
    h2: ({ children }: { children?: React.ReactNode }) => {
      const isSummary = String(children).toLowerCase().includes("lesson summary");
      return (
        <h2
          className={
            isSummary
              ? "mt-10 mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100 rounded-t-xl border border-b-0 border-gray-200 dark:border-gray-600 bg-primary/5 dark:bg-primary/10 px-4 py-3"
              : "mt-10 mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700 pb-2"
          }
        >
          {children}
        </h2>
      );
    },
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="mt-6 mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">{children}</h3>
    ),
    p: ({ children }: { children?: React.ReactNode }) => <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{children}</p>,
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">{children}</ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">{children}</ol>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-4 border-primary bg-primary/5 dark:bg-primary/10 py-2 pl-4 pr-4 my-4 rounded-r-lg text-gray-700 dark:text-gray-300">
        {children}
      </blockquote>
    ),
    table: ({ children }: { children?: React.ReactNode }) => (
      <div className="my-6 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600 text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }: { children?: React.ReactNode }) => <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>,
    th: ({ children }: { children?: React.ReactNode }) => (
      <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">{children}</th>
    ),
    td: ({ children }: { children?: React.ReactNode }) => (
      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700">{children}</td>
    ),
    tr: ({ children }: { children?: React.ReactNode }) => <tr>{children}</tr>,
    tbody: ({ children }: { children?: React.ReactNode }) => <tbody className="divide-y divide-gray-100 dark:divide-gray-700">{children}</tbody>,
    strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-semibold text-gray-900 dark:text-gray-100">{children}</strong>,
    em: ({ children }: { children?: React.ReactNode }) => <em className="italic">{children}</em>,
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => {
      if (href?.startsWith("/")) {
        return (
          <Link href={href} className="text-primary underline hover:no-underline">
            {children}
          </Link>
        );
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline">
          {children}
        </a>
      );
    },
    hr: () => <hr className="my-8 border-gray-200 dark:border-gray-700" />,
  };

  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      <header className="mb-8">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {levelName} · {sectionName}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Topic {topicId} — {topicTitle}
        </h1>
      </header>
      {segments.map((seg, i) =>
        seg.type === "chart" ? (
          <div key={i} className="my-8">
            <ChartBlock src={seg.src} />
          </div>
        ) : (
          <ReactMarkdown key={i} remarkPlugins={[remarkGfm]} components={mdComponents}>
            {seg.value}
          </ReactMarkdown>
        )
      )}
    </article>
  );
}
