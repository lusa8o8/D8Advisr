import type { SupabaseClient } from '@supabase/supabase-js'

export type BudgetPlanRow = {
  id: string
  plan_id: string
  title: string
  actual_cost: number
  created_at: string
}

export async function getBudgetSummary(
  supabase: SupabaseClient,
  userId: string,
  month: string
) {
  const start = new Date(`${month}-01T00:00:00Z`)
  const end = new Date(start)
  end.setMonth(start.getMonth() + 1)

  const { data: planRows } = await supabase
    .from('plans')
    .select('id')
    .eq('user_id', userId)

  const planIds = planRows?.map((plan) => plan.id) ?? []

  const { data: pref } = await supabase
    .from('user_preferences')
    .select('budget_preference')
    .eq('user_id', userId)
    .maybeSingle()

  if (!planIds.length) {
    return {
      budget: pref?.budget_preference ?? 500,
      spent: 0,
      plans: [] as BudgetPlanRow[],
    }
  }

  const { data: logs } = await supabase
    .from('experience_logs')
    .select('actual_cost, created_at, plan:plans(id,title,created_at)')
    .in('plan_id', planIds)
    .gte('created_at', start.toISOString())
    .lt('created_at', end.toISOString())

  const spent = logs?.reduce((sum, log) => sum + (log.actual_cost ?? 0), 0) ?? 0

  const plans: BudgetPlanRow[] = (logs ?? [])
    .map((log: any) => ({
      id: log.plan?.id ?? log.plan_id,
      plan_id: log.plan_id,
      title: log.plan?.title ?? 'Plan',
      actual_cost: log.actual_cost ?? 0,
      created_at: log.plan?.created_at ?? log.created_at,
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return {
    budget: pref?.budget_preference ?? 500,
    spent,
    plans,
  }
}
