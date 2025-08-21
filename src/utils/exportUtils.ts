import { TradeData, WeeklyData } from '../types';
import { calculateWeeklyHours } from './calculations';
import { format } from 'date-fns';

export const exportToCSV = (trades: TradeData[], editedDataMap?: Map<string, WeeklyData[]>) => {
  // CSV Headers
  const headers = [
    'Trade Name',
    'Week',
    'Date',
    'Total Workers',
    'Other Workers',
    'Apprentice Workers',
    'Journeyman Workers',
    'Total Hours',
    'Apprentice Hours',
    'Journeyman Hours',
    'Apprentice Percentage',
    'IRA Compliant',
    'Modified'
  ];

  const rows: string[][] = [];

  // Project summary row
  let projectTotalHours = 0;
  let projectApprenticeHours = 0;

  trades.forEach(trade => {
    const weeklyData = editedDataMap?.get(trade.id) || calculateWeeklyHours(trade);
    const originalData = calculateWeeklyHours(trade);
    
    weeklyData.forEach((week, index) => {
      const apprenticePercentage = week.totalHours > 0 
        ? (week.apprenticeHours / week.totalHours) * 100 
        : 0;
      
      const isModified = editedDataMap?.has(trade.id) && 
        JSON.stringify(week) !== JSON.stringify(originalData[index]);

      projectTotalHours += week.totalHours;
      projectApprenticeHours += week.apprenticeHours;

      rows.push([
        trade.name,
        week.week.toString(),
        format(week.date, 'yyyy-MM-dd'),
        week.totalWorkers.toString(),
        (week.otherWorkers || (week.totalWorkers - week.apprenticeWorkers - week.journeymanWorkers)).toString(),
        week.apprenticeWorkers.toString(),
        week.journeymanWorkers.toString(),
        week.totalHours.toString(),
        week.apprenticeHours.toString(),
        week.journeymanHours.toString(),
        apprenticePercentage.toFixed(2) + '%',
        apprenticePercentage >= 15 ? 'Yes' : 'No',
        isModified ? 'Yes' : 'No'
      ]);
    });
  });

  // Add summary section
  const projectApprenticePercentage = projectTotalHours > 0 
    ? (projectApprenticeHours / projectTotalHours) * 100 
    : 0;

  rows.push([]);
  rows.push(['PROJECT SUMMARY', '', '', '', '', '', '', '', '', '', '', '']);
  rows.push(['Total Project Hours', '', '', '', '', '', projectTotalHours.toString(), '', '', '', '', '']);
  rows.push(['Total Apprentice Hours', '', '', '', '', '', '', projectApprenticeHours.toString(), '', '', '', '']);
  rows.push(['Project Apprentice Percentage', '', '', '', '', '', '', '', '', projectApprenticePercentage.toFixed(2) + '%', '', '']);
  rows.push(['Project IRA Compliance', '', '', '', '', '', '', '', '', '', projectApprenticePercentage >= 15 ? 'Yes' : 'No', '']);

  // Convert to CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Generate filename with current date
  const filename = `IRA_Compliance_Report_${format(new Date(), 'yyyy-MM-dd')}.csv`;

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportTradeToCSV = (trade: TradeData, weeklyData: WeeklyData[]) => {
  // CSV Headers
  const headers = [
    'Week',
    'Date',
    'Total Workers',
    'Other Workers',
    'Apprentice Workers',
    'Journeyman Workers',
    'Total Hours',
    'Apprentice Hours',
    'Journeyman Hours',
    'Apprentice Percentage',
    'IRA Compliant'
  ];

  const rows: string[][] = [];
  let totalHours = 0;
  let totalApprenticeHours = 0;

  weeklyData.forEach(week => {
    const apprenticePercentage = week.totalHours > 0 
      ? (week.apprenticeHours / week.totalHours) * 100 
      : 0;

    totalHours += week.totalHours;
    totalApprenticeHours += week.apprenticeHours;

    rows.push([
      week.week.toString(),
      format(week.date, 'yyyy-MM-dd'),
      week.totalWorkers.toString(),
      (week.otherWorkers || (week.totalWorkers - week.apprenticeWorkers - week.journeymanWorkers)).toString(),
      week.apprenticeWorkers.toString(),
      week.journeymanWorkers.toString(),
      week.totalHours.toString(),
      week.apprenticeHours.toString(),
      week.journeymanHours.toString(),
      apprenticePercentage.toFixed(2) + '%',
      apprenticePercentage >= 15 ? 'Yes' : 'No'
    ]);
  });

  // Add summary
  const overallApprenticePercentage = totalHours > 0 
    ? (totalApprenticeHours / totalHours) * 100 
    : 0;

  rows.push([]);
  rows.push(['TRADE SUMMARY', '', '', '', '', '', '', '', '', '']);
  rows.push(['Trade Name', trade.name, '', '', '', '', '', '', '', '']);
  rows.push(['Total Hours', '', '', '', '', totalHours.toString(), '', '', '', '']);
  rows.push(['Total Apprentice Hours', '', '', '', '', '', totalApprenticeHours.toString(), '', '', '']);
  rows.push(['Overall Apprentice Percentage', '', '', '', '', '', '', '', overallApprenticePercentage.toFixed(2) + '%', '']);
  rows.push(['Overall IRA Compliance', '', '', '', '', '', '', '', '', overallApprenticePercentage >= 15 ? 'Yes' : 'No']);

  // Convert to CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Generate filename
  const filename = `IRA_Compliance_${trade.name}_${format(new Date(), 'yyyy-MM-dd')}.csv`;

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};