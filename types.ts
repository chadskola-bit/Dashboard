export type DealRow = {
  timestamp: string;
  saleDate: string;
  glps: string;
  other: string;
  addOns: string;
  howClosed: string;
  team: string;
  portalAddress: string;
  agentName: string;
  dealId: string;
  totalDeals: number;
  dayOfWeek: string;
  weekStart: string;
  month: string;
  weekend: string;
};

export type Summary = {
  totalDeals: number;
  activeAgents: number;
  averageDealsPerAgent: number;
  club30Count: number;
  weekendDeals: number;
};
