import { TradeData, WeeklyData, ChartData } from '../types';
import { format, addWeeks } from 'date-fns';

export const calculateWeeklyHours = (trade: TradeData): WeeklyData[] => {
  const weeks: WeeklyData[] = [];
  const totalWeeks = Math.ceil(
    (trade.endDate.getTime() - trade.startDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
  );
  
  const totalManHours = trade.manHoursPerMW * trade.totalMW;
  const hoursPerWorkerPerWeek = 40; // Standard 40-hour work week
  const steadyStateWeeks = totalWeeks - trade.rampUpWeeks - trade.rampDownWeeks;
  
  // Civil trade has no apprentices per IRA rules
  const actualApprenticeRatio = trade.name.toLowerCase() === 'civil' ? 0 : trade.apprenticeRatio;
  
  // Calculate peak workforce needed during steady state
  // This is based on distributing total hours across the project duration
  // accounting for reduced capacity during ramp periods
  
  // Calculate total capacity-adjusted weeks
  let totalCapacityWeeks = steadyStateWeeks; // Full capacity weeks
  
  // Add ramp-up capacity (average 50% for linear ramp)
  if (trade.rampUpWeeks > 0) {
    totalCapacityWeeks += trade.rampUpWeeks * 0.5;
  }
  
  // Add ramp-down capacity (average 50% for linear ramp)
  if (trade.rampDownWeeks > 0) {
    totalCapacityWeeks += trade.rampDownWeeks * 0.5;
  }
  
  // Calculate hours per capacity week
  const hoursPerCapacityWeek = totalManHours / totalCapacityWeeks;
  
  // Calculate peak workers needed (during steady state)
  const peakWorkers = Math.round(hoursPerCapacityWeek / hoursPerWorkerPerWeek);
  
  // Calculate apprentice and journeyman counts at peak
  // Apprentices should be 15% of total workers
  // Apprentice to journeyman ratio should be 1:1
  // So: apprentices = journeymen = 15% of total workers
  // Other workers = 70% of total workers (100% - 15% apprentices - 15% journeymen)
  const peakApprentices = Math.round(peakWorkers * actualApprenticeRatio);
  const peakJourneymen = peakApprentices; // 1:1 ratio with apprentices
  const peakOtherWorkers = peakWorkers - peakApprentices - peakJourneymen;
  
  // Generate weekly data
  for (let week = 1; week <= totalWeeks; week++) {
    let weekWorkers = 0;
    let weekApprentices = 0;
    let weekJourneymen = 0;
    
    if (week <= trade.rampUpWeeks) {
      // Ramp-up phase - linear increase
      const capacityMultiplier = getRampCapacityMultiplier(week, trade.rampUpWeeks, 'up');
      
      weekWorkers = Math.round(peakWorkers * capacityMultiplier);
      weekApprentices = Math.round(peakApprentices * capacityMultiplier);
      weekJourneymen = weekApprentices; // 1:1 ratio with apprentices
    } else if (week > totalWeeks - trade.rampDownWeeks) {
      // Ramp-down phase - linear decrease
      const rampDownWeek = week - (totalWeeks - trade.rampDownWeeks);
      const capacityMultiplier = getRampCapacityMultiplier(rampDownWeek, trade.rampDownWeeks, 'down');
      
      weekWorkers = Math.round(peakWorkers * capacityMultiplier);
      weekApprentices = Math.round(peakApprentices * capacityMultiplier);
      weekJourneymen = weekApprentices; // 1:1 ratio with apprentices
    } else {
      // Full production phase - peak workforce
      weekWorkers = peakWorkers;
      weekApprentices = peakApprentices;
      weekJourneymen = peakJourneymen;
    }
    
    // Calculate hours based on workers
    const weekHours = weekWorkers * hoursPerWorkerPerWeek;
    const apprenticeWeekHours = weekApprentices * hoursPerWorkerPerWeek;
    const journeymanWeekHours = weekJourneymen * hoursPerWorkerPerWeek;
    
    // Calculate other workers (non-apprentice, non-journeymen)
    const weekOtherWorkers = weekWorkers - weekApprentices - weekJourneymen;
    const otherWeekHours = weekOtherWorkers * hoursPerWorkerPerWeek;
    
    weeks.push({
      week,
      totalHours: weekHours,
      apprenticeHours: apprenticeWeekHours,
      journeymanHours: journeymanWeekHours,
      date: addWeeks(trade.startDate, week - 1),
      totalWorkers: weekWorkers,
      apprenticeWorkers: weekApprentices,
      journeymanWorkers: weekJourneymen,
      otherWorkers: weekOtherWorkers
    });
  }
  
  return weeks;
};



// Get capacity multiplier for ramp periods with linear logic
const getRampCapacityMultiplier = (week: number, totalWeeks: number, direction: 'up' | 'down'): number => {
  if (totalWeeks === 0) return 1;
  
  const progress = week / totalWeeks;
  
  if (direction === 'up') {
    // Ramp up: Linear increase from 0% to 100%
    return progress;
  } else {
    // Ramp down: Linear decrease from 100% to 0%
    return 1 - progress;
  }
};

export const generateChartData = (trade: TradeData & { weeklyData?: WeeklyData[] }): ChartData => {
  const weeklyData = trade.weeklyData || calculateWeeklyHours(trade);
  
  return {
    labels: weeklyData.map(w => `Week ${w.week} (${format(w.date, 'MMM dd')})`),
    datasets: [
      {
        label: 'Total Hours',
        data: weeklyData.map(w => w.totalHours),
        borderColor: '#026837',
        backgroundColor: 'rgba(2, 104, 55, 0.1)',
        tension: 0
      },
      {
        label: 'Apprentice Hours',
        data: weeklyData.map(w => w.apprenticeHours),
        borderColor: '#886e4b',
        backgroundColor: 'rgba(136, 110, 75, 0.1)',
        tension: 0
      },
      {
        label: 'Journeyman Hours',
        data: weeklyData.map(w => w.journeymanHours),
        borderColor: '#5ab48b',
        backgroundColor: 'rgba(90, 180, 139, 0.1)',
        tension: 0
      }
    ]
  };
};

export const generateWorkerChartData = (trade: TradeData & { weeklyData?: WeeklyData[] }): ChartData => {
  const weeklyData = trade.weeklyData || calculateWeeklyHours(trade);
  
  return {
    labels: weeklyData.map(w => `Week ${w.week} (${format(w.date, 'MMM dd')})`),
    datasets: [
      {
        label: 'Total Workers',
        data: weeklyData.map(w => w.totalWorkers),
        borderColor: '#026837',
        backgroundColor: 'rgba(2, 104, 55, 0.1)',
        tension: 0
      },
      {
        label: 'Other Workers',
        data: weeklyData.map(w => w.otherWorkers || 0),
        borderColor: '#4169E1',
        backgroundColor: 'rgba(65, 105, 225, 0.1)',
        tension: 0
      },
      {
        label: 'Apprentices',
        data: weeklyData.map(w => w.apprenticeWorkers),
        borderColor: '#886e4b',
        backgroundColor: 'rgba(136, 110, 75, 0.1)',
        tension: 0
      },
      {
        label: 'Journeymen',
        data: weeklyData.map(w => w.journeymanWorkers),
        borderColor: '#5ab48b',
        backgroundColor: 'rgba(90, 180, 139, 0.1)',
        tension: 0
      }
    ]
  };
};

export const generateOverviewChartData = (trades: TradeData[]): ChartData => {
  const allWeeks: { [key: string]: { hours: number, weekNumber: number, date: Date } } = {};
  
  trades.forEach(trade => {
    const weeklyData = calculateWeeklyHours(trade);
    weeklyData.forEach(week => {
      const weekKey = format(week.date, 'yyyy-MM-dd');
      if (!allWeeks[weekKey]) {
        allWeeks[weekKey] = { hours: 0, weekNumber: week.week, date: week.date };
      }
      allWeeks[weekKey].hours += week.totalHours;
    });
  });
  
  const sortedWeeks = Object.keys(allWeeks).sort();
  
  return {
    labels: sortedWeeks.map(week => {
      const weekData = allWeeks[week];
      return `Week ${weekData.weekNumber} (${format(weekData.date, 'MMM dd')})`;
    }),
    datasets: [
      {
        label: 'Total Project Hours',
        data: sortedWeeks.map(week => allWeeks[week].hours),
        borderColor: '#026837',
        backgroundColor: 'rgba(2, 104, 55, 0.1)',
        tension: 0
      }
    ]
  };
};

// Helper function to get workforce summary for a trade
export const getWorkforceSummary = (trade: TradeData) => {
  const weeklyData = calculateWeeklyHours(trade);
  const totalWeeks = weeklyData.length;
  const steadyStateWeeks = totalWeeks - trade.rampUpWeeks - trade.rampDownWeeks;
  
  // Calculate peak workforce
  const totalManHours = trade.manHoursPerMW * trade.totalMW;
  const hoursPerWorkerPerWeek = 40;
  
  // Calculate total capacity-adjusted weeks
  let totalCapacityWeeks = steadyStateWeeks;
  if (trade.rampUpWeeks > 0) {
    totalCapacityWeeks += trade.rampUpWeeks * 0.5;
  }
  if (trade.rampDownWeeks > 0) {
    totalCapacityWeeks += trade.rampDownWeeks * 0.5;
  }
  
  const hoursPerCapacityWeek = totalManHours / totalCapacityWeeks;
  const peakWorkers = Math.round(hoursPerCapacityWeek / hoursPerWorkerPerWeek);
  
  // Civil trade has no apprentices per IRA rules
  const actualApprenticeRatio = trade.name.toLowerCase() === 'civil' ? 0 : trade.apprenticeRatio;
  const peakApprentices = Math.round(peakWorkers * actualApprenticeRatio);
  const peakJourneymen = peakApprentices; // 1:1 ratio with apprentices
  
  return {
    totalManHours,
    steadyStateWorkers: peakWorkers,
    steadyStateApprentices: peakApprentices,
    steadyStateJourneymen: peakJourneymen,
    effectiveWeeks: totalCapacityWeeks,
    hoursPerEffectiveWeek: hoursPerCapacityWeek
  };
};

// Calculate required apprentice hours for electrical/mechanical trades to compensate for civil
export const calculateRequiredApprenticeRatio = (trades: TradeData[], targetRatio: number = 0.15): { [tradeName: string]: number } => {
  const tradeHours: { [name: string]: number } = {};
  let totalProjectHours = 0;
  let civilHours = 0;
  
  // Calculate total hours for each trade
  trades.forEach(trade => {
    const weeklyData = calculateWeeklyHours(trade);
    const totalHours = weeklyData.reduce((sum, week) => sum + week.totalHours, 0);
    tradeHours[trade.name] = totalHours;
    totalProjectHours += totalHours;
    
    if (trade.name.toLowerCase() === 'civil') {
      civilHours = totalHours;
    }
  });
  
  // Calculate required apprentice hours for the entire project
  const requiredApprenticeHours = totalProjectHours * targetRatio;
  
  // Since civil has no apprentices, electrical and mechanical must compensate
  const nonCivilHours = totalProjectHours - civilHours;
  const requiredNonCivilApprenticeRatio = nonCivilHours > 0 ? requiredApprenticeHours / nonCivilHours : targetRatio;
  
  const result: { [tradeName: string]: number } = {};
  trades.forEach(trade => {
    if (trade.name.toLowerCase() === 'civil') {
      result[trade.name] = 0;
    } else {
      result[trade.name] = requiredNonCivilApprenticeRatio;
    }
  });
  
  return result;
};

// Generate combined project chart data showing all trades overlapping
export const generateProjectChartData = (trades: TradeData[]): ChartData => {
  if (trades.length === 0) {
    return { labels: [], datasets: [] };
  }
  
  // Find the project timeline span
  const startDates = trades.map(t => t.startDate.getTime());
  const endDates = trades.map(t => t.endDate.getTime());
  const projectStart = new Date(Math.min(...startDates));
  const projectEnd = new Date(Math.max(...endDates));
  
  // Calculate total project weeks
  const totalProjectWeeks = Math.ceil(
    (projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24 * 7)
  );
  
  // Initialize weekly totals
  const weeklyTotals: { [week: number]: { total: number, apprentice: number, byTrade: { [name: string]: number } } } = {};
  const labels: string[] = [];
  
  for (let week = 0; week <= totalProjectWeeks; week++) {
    const weekDate = new Date(projectStart);
    weekDate.setDate(projectStart.getDate() + week * 7);
    labels.push(format(weekDate, 'MMM d'));
    weeklyTotals[week] = { total: 0, apprentice: 0, byTrade: {} };
  }
  
  // Aggregate hours from all trades
  trades.forEach(trade => {
    const weeklyData = calculateWeeklyHours(trade);
    const tradeStartWeek = Math.floor(
      (trade.startDate.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24 * 7)
    );
    
    weeklyData.forEach((data, index) => {
      const projectWeek = tradeStartWeek + index;
      if (projectWeek >= 0 && projectWeek <= totalProjectWeeks) {
        weeklyTotals[projectWeek].total += data.totalHours;
        weeklyTotals[projectWeek].apprentice += data.apprenticeHours;
        weeklyTotals[projectWeek].byTrade[trade.name] = data.totalHours;
      }
    });
  });
  
  // Prepare datasets
  const datasets = [];
  
  // Total hours line
  datasets.push({
    label: 'Total Project Hours',
    data: Object.keys(weeklyTotals).map(week => weeklyTotals[Number(week)].total),
    borderColor: '#2B3F26',
    backgroundColor: '#2B3F26',
    tension: 0.1
  });
  
  // Individual trade lines
  const tradeColors = {
    'Electrical': '#6B9A4C',
    'Mechanical': '#F5A623',
    'Civil': '#8B9A8B'
  };
  
  trades.forEach(trade => {
    const data = Object.keys(weeklyTotals).map(week => 
      weeklyTotals[Number(week)].byTrade[trade.name] || 0
    );
    
    datasets.push({
      label: `${trade.name} Hours`,
      data,
      borderColor: tradeColors[trade.name as keyof typeof tradeColors] || '#666666',
      backgroundColor: tradeColors[trade.name as keyof typeof tradeColors] || '#666666',
      tension: 0.1
    });
  });
  
  // Apprentice percentage line
  const apprenticePercentages = Object.keys(weeklyTotals).map(week => {
    const total = weeklyTotals[Number(week)].total;
    return total > 0 ? (weeklyTotals[Number(week)].apprentice / total) * 100 : 0;
  });
  
  datasets.push({
    label: 'Apprentice %',
    data: apprenticePercentages,
    borderColor: '#E74C3C',
    backgroundColor: '#E74C3C',
    tension: 0.1,
    yAxisID: 'percentage'
  });
  
  return { labels, datasets };
}; 