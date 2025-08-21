import React from 'react';
import { TradeData } from '../types';
import { calculateWeeklyHours, calculateRequiredApprenticeRatio, generateProjectChartData } from '../utils/calculations';
import { exportToCSV } from '../utils/exportUtils';
import { FileText, AlertCircle, CheckCircle2, Download, TrendingUp } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { format } from 'date-fns';
import annotationPlugin from 'chartjs-plugin-annotation';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

interface ProjectOverviewProps {
  trades: TradeData[];
}

const ProjectOverview: React.FC<ProjectOverviewProps> = ({ trades }) => {
  // Calculate aggregate data
  const calculateProjectTotals = () => {
    let totalHours = 0;
    let totalApprenticeHours = 0;
    let totalJourneymanHours = 0;
    let earliestStart = new Date(8640000000000000); // Max date
    let latestEnd = new Date(-8640000000000000); // Min date

    trades.forEach(trade => {
      const weeklyData = calculateWeeklyHours(trade);
      
      weeklyData.forEach(week => {
        totalHours += week.totalHours;
        totalApprenticeHours += week.apprenticeHours;
        totalJourneymanHours += week.journeymanHours;
      });

      if (trade.startDate < earliestStart) earliestStart = trade.startDate;
      if (trade.endDate > latestEnd) latestEnd = trade.endDate;
    });

    const apprenticePercentage = totalHours > 0 ? (totalApprenticeHours / totalHours) * 100 : 0;
    const meetsIRARequirement = apprenticePercentage >= 15;

    return {
      totalHours,
      totalApprenticeHours,
      totalJourneymanHours,
      apprenticePercentage,
      meetsIRARequirement,
      projectStart: earliestStart,
      projectEnd: latestEnd
    };
  };

  const totals = calculateProjectTotals();
  const requiredRatios = calculateRequiredApprenticeRatio(trades);
  const projectChartData = generateProjectChartData(trades);

  // Chart options for the project overview
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Hours'
        }
      },
      percentage: {
        position: 'right' as const,
        beginAtZero: true,
        max: 30,
        title: {
          display: true,
          text: 'Apprentice %'
        },
        grid: {
          drawOnChartArea: false
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
      annotation: {
        annotations: {
          line1: {
            type: 'line' as const,
            yMin: 15,
            yMax: 15,
            yScaleID: 'percentage',
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              display: true,
              content: '15% IRA Requirement',
              position: 'end' as const,
              backgroundColor: 'rgba(75, 192, 192, 0.8)',
              color: 'white',
              font: {
                size: 12
              }
            }
          }
        }
      }
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-moss-primary-green" />
          <h2 className="text-2xl font-semibold text-moss-monochrome-deep-fern">
            Project Overview
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          {/* IRA Compliance Status */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            totals.meetsIRARequirement 
              ? 'bg-green-100 text-green-700' 
              : 'bg-amber-100 text-amber-700'
          }`}>
            {totals.meetsIRARequirement ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">IRA Compliant</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Below IRA Threshold</span>
              </>
            )}
          </div>
          
          {/* Export Button */}
          <button
            onClick={() => exportToCSV(trades)}
            className="flex items-center gap-2 px-4 py-2 bg-moss-primary-green hover:bg-moss-monochrome-pine-vault text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="font-medium">Export Report</span>
          </button>
        </div>
      </div>

      {/* Project Timeline */}
      <div className="mb-8 p-6 bg-gradient-to-r from-moss-monochrome-mist-canopy to-white rounded-lg border border-moss-monochrome-sage-veil">
        <h3 className="text-lg font-semibold text-moss-monochrome-deep-fern mb-4">Project Timeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-base">
          <div className="text-center p-3 bg-white rounded-lg shadow-sm">
            <div className="text-sm text-moss-monochrome-pine-vault mb-1">Start Date</div>
            <div className="text-xl font-bold text-moss-primary-green">
              {format(totals.projectStart, 'MMM dd, yyyy')}
            </div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg shadow-sm">
            <div className="text-sm text-moss-monochrome-pine-vault mb-1">End Date</div>
            <div className="text-xl font-bold text-moss-primary-gold">
              {format(totals.projectEnd, 'MMM dd, yyyy')}
            </div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg shadow-sm">
            <div className="text-sm text-moss-monochrome-pine-vault mb-1">Duration</div>
            <div className="text-xl font-bold text-moss-monochrome-deep-fern">
              {Math.ceil((totals.projectEnd.getTime() - totals.projectStart.getTime()) / (1000 * 60 * 60 * 24 * 7))} weeks
            </div>
          </div>
        </div>
      </div>

      {/* Apprentice Percentage Average */}
      <div className="mb-6 p-4 bg-gradient-to-r from-moss-monochrome-mist-canopy to-white rounded-lg border border-moss-monochrome-sage-veil">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-moss-monochrome-deep-fern mb-1">
              Overall Apprentice Percentage
            </h3>
            <div className={`text-3xl font-bold ${
              totals.apprenticePercentage >= 15 ? 'text-green-600' : 'text-amber-600'
            }`}>
              {totals.apprenticePercentage.toFixed(1)}%
            </div>
            <p className="text-xs text-moss-monochrome-pine-vault mt-1">
              {totals.apprenticePercentage >= 15 
                ? 'Meets IRA requirement (≥15%)'
                : `Below IRA requirement (needs ${(15 - totals.apprenticePercentage).toFixed(1)}% more)`
              }
            </p>
          </div>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            totals.apprenticePercentage >= 15 
              ? 'bg-green-100 text-green-600' 
              : 'bg-amber-100 text-amber-600'
          }`}>
            {totals.apprenticePercentage >= 15 ? (
              <CheckCircle2 className="w-8 h-8" />
            ) : (
              <AlertCircle className="w-8 h-8" />
            )}
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-moss-monochrome-mist-canopy to-white p-4 rounded-lg">
          <div className="text-sm text-moss-monochrome-pine-vault mb-1">Total Hours</div>
          <div className="text-2xl font-bold text-moss-primary-green">
            {Math.round(totals.totalHours).toLocaleString()}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-moss-monochrome-mist-canopy to-white p-4 rounded-lg">
          <div className="text-sm text-moss-monochrome-pine-vault mb-1">Apprentice Hours</div>
          <div className="text-2xl font-bold text-moss-primary-gold">
            {Math.round(totals.totalApprenticeHours).toLocaleString()}
          </div>
          <div className={`text-xs mt-1 ${
            totals.apprenticePercentage >= 15 ? 'text-green-600' : 'text-amber-600'
          }`}>
            {totals.apprenticePercentage.toFixed(1)}% average
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-moss-monochrome-mist-canopy to-white p-4 rounded-lg">
          <div className="text-sm text-moss-monochrome-pine-vault mb-1">Journeyman Hours</div>
          <div className="text-2xl font-bold text-moss-monochrome-mint-vale">
            {Math.round(totals.totalJourneymanHours).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Trade Summary Table */}
      <div className="overflow-x-auto">
        <h3 className="text-sm font-medium text-moss-monochrome-deep-fern mb-3">Trade Breakdown</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-moss-monochrome-sage-veil">
              <th className="text-left py-2 text-moss-monochrome-deep-fern font-medium">Trade</th>
              <th className="text-right py-2 text-moss-monochrome-deep-fern font-medium">Total Hours</th>
              <th className="text-right py-2 text-moss-monochrome-deep-fern font-medium">Apprentice %</th>
              <th className="text-right py-2 text-moss-monochrome-deep-fern font-medium">Required %</th>
              <th className="text-right py-2 text-moss-monochrome-deep-fern font-medium">Duration</th>
              <th className="text-center py-2 text-moss-monochrome-deep-fern font-medium">IRA Status</th>
            </tr>
          </thead>
          <tbody>
            {trades.map(trade => {
              const weeklyData = calculateWeeklyHours(trade);
              const tradeHours = weeklyData.reduce((sum, week) => sum + week.totalHours, 0);
              const apprenticeHours = weeklyData.reduce((sum, week) => sum + week.apprenticeHours, 0);
              const apprenticePercent = tradeHours > 0 ? (apprenticeHours / tradeHours) * 100 : 0;
              const requiredPercent = requiredRatios[trade.name] * 100;
              const duration = Math.ceil((trade.endDate.getTime() - trade.startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
              const meetsRequirement = trade.name.toLowerCase() === 'civil' ? true : apprenticePercent >= requiredPercent;
              
              return (
                <tr key={trade.id} className="border-b border-moss-monochrome-sage-veil">
                  <td className="py-2 font-medium text-moss-monochrome-deep-fern">
                    {trade.name}
                    {trade.name.toLowerCase() === 'civil' && (
                      <span className="ml-2 text-xs text-moss-monochrome-pine-vault">(No apprentices)</span>
                    )}
                  </td>
                  <td className="py-2 text-right text-moss-monochrome-pine-vault">
                    {Math.round(tradeHours).toLocaleString()}
                  </td>
                  <td className={`py-2 text-right font-medium ${
                    meetsRequirement ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {apprenticePercent.toFixed(1)}%
                  </td>
                  <td className="py-2 text-right text-moss-monochrome-pine-vault">
                    {requiredPercent.toFixed(1)}%
                  </td>
                  <td className="py-2 text-right text-moss-monochrome-pine-vault">
                    {duration} weeks
                  </td>
                  <td className="py-2 text-center">
                    {meetsRequirement ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 mx-auto" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600 mx-auto" />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Project Timeline Chart */}
      {trades.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-moss-primary-green" />
            <h3 className="text-xl font-semibold text-moss-monochrome-deep-fern">
              Project Timeline & Overlapping Trades
            </h3>
          </div>
          <div className="h-[28rem] bg-moss-monochrome-mist-canopy rounded-lg p-6">
            <Line data={projectChartData} options={chartOptions} />
          </div>
          <div className="mt-4 text-sm text-moss-monochrome-pine-vault">
            <p>• Shows overlapping trade schedules and combined project hours</p>
            <p>• Red line indicates apprentice percentage (must stay above 15% for IRA compliance)</p>
            {trades.some(t => t.name.toLowerCase() === 'civil') && (
              <p>• Civil trade has no apprentices - Electrical and Mechanical trades must compensate</p>
            )}
          </div>
        </div>
      )}

      {/* IRA Compliance Note */}
      {!totals.meetsIRARequirement && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">IRA Compliance Alert</p>
              <p>
                The project currently has {totals.apprenticePercentage.toFixed(1)}% apprentice hours, 
                below the 15% minimum required for IRA tax credit eligibility. 
                Consider adjusting apprentice ratios in individual trades.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectOverview;