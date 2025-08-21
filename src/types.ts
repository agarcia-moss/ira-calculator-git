export interface TradeData {
  id: string;
  name: string;
  manHoursPerMW: number;
  totalMW: number;
  apprenticeRatio: number;
  rampUpWeeks: number;
  rampDownWeeks: number;
  startDate: Date;
  endDate: Date;
}

export interface WeeklyData {
  week: number;
  totalHours: number;
  apprenticeHours: number;
  journeymanHours: number;
  date: Date;
  totalWorkers: number;
  apprenticeWorkers: number;
  journeymanWorkers: number;
  otherWorkers?: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
  }[];
} 