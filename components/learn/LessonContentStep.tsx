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
import { DopamineCurveChart } from "@/components/textbook/diagrams/DopamineCurveChart";
import { RewardSchedulesChart } from "@/components/textbook/diagrams/RewardSchedulesChart";
import { DopamineIndustriesChart } from "@/components/textbook/diagrams/DopamineIndustriesChart";
import { HedonicAdaptationChart } from "@/components/textbook/diagrams/HedonicAdaptationChart";
import { MarshmallowOutcomesChart } from "@/components/textbook/diagrams/MarshmallowOutcomesChart";
import { PresentBiasChart } from "@/components/textbook/diagrams/PresentBiasChart";
import { CostInstantGratificationChart } from "@/components/textbook/diagrams/CostInstantGratificationChart";
import { StrategiesEffectivenessChart } from "@/components/textbook/diagrams/StrategiesEffectivenessChart";
import { FourScriptsChart } from "@/components/textbook/diagrams/FourScriptsChart";
import { BeliefSourcesChart } from "@/components/textbook/diagrams/BeliefSourcesChart";
import { BeliefReframesChart } from "@/components/textbook/diagrams/BeliefReframesChart";
import { OutcomesByScriptChart } from "@/components/textbook/diagrams/OutcomesByScriptChart";
import { EmotionTriggersChart } from "@/components/textbook/diagrams/EmotionTriggersChart";
import { EmotionCycleChart } from "@/components/textbook/diagrams/EmotionCycleChart";
import { EmotionalSpendingAnnualCostChart } from "@/components/textbook/diagrams/EmotionalSpendingAnnualCostChart";
import { CopingComparisonChart } from "@/components/textbook/diagrams/CopingComparisonChart";
import { AnchoringEffectChart } from "@/components/textbook/diagrams/AnchoringEffectChart";
import { PricingTacticsChart } from "@/components/textbook/diagrams/PricingTacticsChart";
import { LeftDigitEffectChart } from "@/components/textbook/diagrams/LeftDigitEffectChart";
import { DecoyEffectChart } from "@/components/textbook/diagrams/DecoyEffectChart";
import { MindsetComparisonChart } from "@/components/textbook/diagrams/MindsetComparisonChart";
import { ScarcitySpiralChart } from "@/components/textbook/diagrams/ScarcitySpiralChart";
import { OutcomesByMindsetChart } from "@/components/textbook/diagrams/OutcomesByMindsetChart";
import { BuildingAbundanceChart } from "@/components/textbook/diagrams/BuildingAbundanceChart";
import { SatisfactionComparisonChart } from "@/components/textbook/diagrams/SatisfactionComparisonChart";
import { CoreValuesChart } from "@/components/textbook/diagrams/CoreValuesChart";
import { AlignmentMatrixChart } from "@/components/textbook/diagrams/AlignmentMatrixChart";
import { SpendingShiftChart } from "@/components/textbook/diagrams/SpendingShiftChart";
import { VagueVsSmartChart } from "@/components/textbook/diagrams/VagueVsSmartChart";
import { SmartFrameworkChart } from "@/components/textbook/diagrams/SmartFrameworkChart";
import { WhyGoalsFailChart } from "@/components/textbook/diagrams/WhyGoalsFailChart";
import { GoalProcessChart } from "@/components/textbook/diagrams/GoalProcessChart";
import { HabitLoopChart } from "@/components/textbook/diagrams/HabitLoopChart";
import { HabitsRankedChart } from "@/components/textbook/diagrams/HabitsRankedChart";
import { CompoundingHabitsChart } from "@/components/textbook/diagrams/CompoundingHabitsChart";
import { HabitFormationChart } from "@/components/textbook/diagrams/HabitFormationChart";

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
    <div className="my-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 py-6 text-center text-sm text-gray-500 dark:text-gray-300">
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
      <table className="min-w-full border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
        {children}
      </table>
    </div>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
      {children}
    </th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="border-b border-gray-100 dark:border-gray-600 px-3 py-2 text-sm text-gray-700 dark:text-gray-200">{children}</td>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-gray-700 dark:text-gray-100 mb-4 leading-relaxed">{children}</p>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-4 border-primary bg-primary/5 dark:bg-primary/10 py-2 pl-4 pr-4 my-4 rounded-r-lg text-gray-700 dark:text-gray-100">
      {children}
    </blockquote>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-2">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-base font-semibold text-gray-900 dark:text-white mt-4 mb-2">{children}</h3>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-100 mb-4">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-100 mb-4">{children}</ol>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a href={href} className="text-primary dark:text-primary underline hover:no-underline" target={href?.startsWith("http") ? "_blank" : undefined} rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}>
      {children}
    </a>
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
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{title}</h2>
      <div className="prose prose-gray dark:prose-invert prose-sm max-w-none text-left space-y-4">
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
