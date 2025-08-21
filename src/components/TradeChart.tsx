import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { TradeData, WeeklyData } from '../types';
import { generateChartData, generateWorkerChartData, calculateWeeklyHours, calculateRequiredApprenticeRatio } from '../utils/calculations';
import { exportTradeToCSV } from '../utils/exportUtils';
import { BarChart3, Users, Edit2, Save, X, AlertCircle, Download } from 'lucide-react';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TradeChartProps {
  trade: TradeData;
  allTrades?: TradeData[];
}

interface EditingCell {
  week: number;
  field: 'totalWorkers' | 'apprenticeWorkers' | 'journeymanWorkers';
}

const TradeChart: React.FC<TradeChartProps> = ({ trade, allTrades = [] }) => {
  const [activeTab, setActiveTab] = useState<'hours' | 'workers'>('workers');
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [editedData, setEditedData] = useState<WeeklyData[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [tempValue, setTempValue] = useState('');

  useEffect(() => {
    const calculatedData = calculateWeeklyHours(trade);
    setWeeklyData(calculatedData);
    setEditedData(calculatedData);
  }, [trade]);



  // Generate chart data based on edited data
  const chartData = activeTab === 'hours' 
    ? generateChartData({ ...trade, weeklyData: editedData } as any)
    : generateWorkerChartData({ ...trade, weeklyData: editedData } as any);
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: 'Inter',
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: activeTab === 'hours' ? 'Weekly Workforce Hours' : 'Weekly Worker Count',
        font: {
          family: 'Inter',
          size: 16,
          weight: 'bold' as const
        },
        color: '#02351b'
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#02351b',
        bodyColor: '#02351b',
        borderColor: '#a3d3bd',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        usePointStyle: true
      }
    },
    scales: {
      x: {
        grid: {
          color: '#e6f4ec',
          drawBorder: false
        },
        ticks: {
          font: {
            family: 'Inter',
            size: 11
          },
          color: '#054f2a'
        }
      },
      y: {
        grid: {
          color: '#e6f4ec',
          drawBorder: false
        },
        ticks: {
          font: {
            family: 'Inter',
            size: 11
          },
          color: '#054f2a'
        },
        title: {
          display: true,
          text: activeTab === 'hours' ? 'Hours' : 'Workers',
          font: {
            family: 'Inter',
            size: 12,
            weight: 'bold' as const
          },
          color: '#054f2a'
        }
      }
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6
      }
    }
  };

  const handleEditClick = (week: number, field: EditingCell['field']) => {
    if (!isEditMode) return;
    
    const weekData = editedData.find(w => w.week === week);
    if (!weekData) return;

    setEditingCell({ week, field });
    setTempValue(weekData[field].toString());
  };

  const handleSaveEdit = () => {
    if (!editingCell) return;

    const value = parseInt(tempValue);
    if (isNaN(value) || value < 0) return;

    setEditedData(prev => prev.map(week => {
      if (week.week === editingCell.week) {
        const updated = { ...week };
        updated[editingCell.field] = value;

        // Recalculate hours based on new worker counts
        if (editingCell.field === 'totalWorkers') {
          // Maintain apprentice percentage (15% for non-civil trades)
          const apprenticeRatio = trade.name.toLowerCase() === 'civil' ? 0 : 0.15;
          updated.apprenticeWorkers = Math.round(value * apprenticeRatio);
          updated.journeymanWorkers = updated.apprenticeWorkers; // 1:1 ratio
        } else if (editingCell.field === 'apprenticeWorkers') {
          // Maintain 1:1 ratio with journeymen
          updated.journeymanWorkers = value;
          // Ensure total workers is sufficient
          const minTotal = value + updated.journeymanWorkers;
          if (updated.totalWorkers < minTotal) {
            updated.totalWorkers = minTotal;
          }
        } else if (editingCell.field === 'journeymanWorkers') {
          // Maintain 1:1 ratio with apprentices
          updated.apprenticeWorkers = value;
          // Ensure total workers is sufficient
          const minTotal = value + updated.apprenticeWorkers;
          if (updated.totalWorkers < minTotal) {
            updated.totalWorkers = minTotal;
          }
        }

        // Calculate other workers
        updated.otherWorkers = updated.totalWorkers - updated.apprenticeWorkers - updated.journeymanWorkers;

        // Update hours
        updated.totalHours = updated.totalWorkers * 40;
        updated.apprenticeHours = updated.apprenticeWorkers * 40;
        updated.journeymanHours = updated.journeymanWorkers * 40;

        return updated;
      }
      return week;
    }));

    setEditingCell(null);
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setTempValue('');
  };

  const handleResetData = () => {
    const calculatedData = calculateWeeklyHours(trade);
    setEditedData(calculatedData);
    setIsEditMode(false);
  };

  const hasEdits = JSON.stringify(weeklyData) !== JSON.stringify(editedData);

  // Calculate totals for edited data
  const editedTotals = editedData.reduce((acc, week) => ({
    totalHours: acc.totalHours + week.totalHours,
    apprenticeHours: acc.apprenticeHours + week.apprenticeHours,
    totalWorkers: Math.max(acc.totalWorkers, week.totalWorkers)
  }), { totalHours: 0, apprenticeHours: 0, totalWorkers: 0 });

  const apprenticePercentage = editedTotals.totalHours > 0 
    ? (editedTotals.apprenticeHours / editedTotals.totalHours) * 100 
    : 0;
    
  // Calculate required apprentice ratio for this trade
  const requiredRatios = allTrades.length > 0 ? calculateRequiredApprenticeRatio(allTrades) : {};
  const requiredPercentage = requiredRatios[trade.name] ? requiredRatios[trade.name] * 100 : 15;
  const isIRACompliant = trade.name.toLowerCase() === 'civil' ? true : apprenticePercentage >= requiredPercentage;

  return (
    <div className="card">
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
          <h3 className="text-lg font-semibold text-moss-monochrome-deep-fern flex-shrink-0">
            Workforce Results - {trade.name}
          </h3>
          
          {/* Edit Mode Toggle */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {hasEdits && (
              <button
                onClick={handleResetData}
                className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors whitespace-nowrap"
              >
                Reset
              </button>
            )}
            <button
              onClick={() => exportTradeToCSV(trade, editedData)}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-moss-primary-gold hover:bg-moss-primary-green text-white rounded-lg transition-colors whitespace-nowrap"
              title="Export this trade's data to CSV"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`flex items-center gap-1 px-3 py-1 text-sm rounded-lg transition-colors whitespace-nowrap ${
                isEditMode 
                  ? 'bg-moss-primary-green text-white' 
                  : 'bg-moss-monochrome-sage-veil hover:bg-moss-monochrome-mint-vale text-moss-monochrome-deep-fern'
              }`}
            >
              <Edit2 className="w-4 h-4" />
              <span className="hidden sm:inline">{isEditMode ? 'Exit Edit' : 'Edit'}</span>
            </button>
          </div>
        </div>

        {/* IRA Compliance Status */}
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm ${
          isIRACompliant 
            ? 'bg-green-100 text-green-700' 
            : 'bg-amber-100 text-amber-700'
        }`}>
          {trade.name.toLowerCase() === 'civil' ? (
            'Civil Trade - No Apprentices Required'
          ) : isIRACompliant ? (
            'IRA Compliant'
          ) : (
            <>
              <AlertCircle className="w-4 h-4" />
              Below {requiredPercentage.toFixed(1)}% required ({apprenticePercentage.toFixed(1)}%)
            </>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4 mt-4">
          <div className="bg-moss-monochrome-mist-canopy p-3 rounded-lg">
            <div className="text-moss-monochrome-deep-fern font-medium">Total Hours</div>
            <div className="text-moss-primary-green font-semibold">
              {Math.round(editedTotals.totalHours).toLocaleString()}
            </div>
            {hasEdits && (
              <div className="text-xs text-moss-monochrome-pine-vault mt-1">
                Original: {Math.round(trade.manHoursPerMW * trade.totalMW).toLocaleString()}
              </div>
            )}
          </div>
          <div className="bg-moss-monochrome-mist-canopy p-3 rounded-lg">
            <div className="text-moss-monochrome-deep-fern font-medium">Apprentice Hours</div>
            <div className={`font-semibold ${isIRACompliant ? 'text-moss-primary-gold' : 'text-amber-600'}`}>
              {apprenticePercentage.toFixed(1)}% / {requiredPercentage.toFixed(1)}%
            </div>
            <div className="text-xs text-moss-monochrome-pine-vault mt-1">
              {trade.name.toLowerCase() === 'civil' ? 'No apprentices required' : `Required: ${requiredPercentage.toFixed(1)}%`}
            </div>
          </div>
          <div className="bg-moss-monochrome-mist-canopy p-3 rounded-lg">
            <div className="text-moss-monochrome-deep-fern font-medium">Ramp Up</div>
            <div className="text-moss-monochrome-pine-vault font-semibold">
              {trade.rampUpWeeks} weeks
            </div>
          </div>
          <div className="bg-moss-monochrome-mist-canopy p-3 rounded-lg">
            <div className="text-moss-monochrome-deep-fern font-medium">Ramp Down</div>
            <div className="text-moss-monochrome-pine-vault font-semibold">
              {trade.rampDownWeeks} weeks
            </div>
          </div>
        </div>
      </div>

      {/* Chart Tabs */}
      <div className="mb-4">
        <div className="flex space-x-4 border-b border-moss-monochrome-sage-veil">
          <button
            onClick={() => setActiveTab('workers')}
            className={`py-2 px-4 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'workers'
                ? 'border-b-2 border-moss-primary-green text-moss-primary-green'
                : 'text-moss-monochrome-pine-vault hover:text-moss-monochrome-deep-fern'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Workers per Week
            </div>
          </button>
          <button
            onClick={() => setActiveTab('hours')}
            className={`py-2 px-4 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'hours'
                ? 'border-b-2 border-moss-primary-green text-moss-primary-green'
                : 'text-moss-monochrome-pine-vault hover:text-moss-monochrome-deep-fern'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Hours per Week
            </div>
          </button>
        </div>
      </div>
      
      <div className="h-80 mb-6">
        <Line data={chartData} options={options} />
      </div>

      {/* Weekly Worker Breakdown Table */}
      <div className="bg-moss-monochrome-mist-canopy rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-moss-monochrome-deep-fern">
            Weekly Worker Breakdown
          </h4>
          {isEditMode && (
            <p className="text-xs text-moss-monochrome-pine-vault">
              Click on worker numbers to edit
            </p>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-moss-monochrome-sage-veil">
                <th className="text-left py-2 text-moss-monochrome-deep-fern font-medium text-sm">Week</th>
                <th className="text-left py-2 text-moss-monochrome-deep-fern font-medium text-sm min-w-[100px]">Date</th>
                <th className="text-right py-2 text-moss-monochrome-deep-fern font-medium text-sm px-2">Total<br/>Workers</th>
                <th className="text-right py-2 text-moss-monochrome-deep-fern font-medium text-sm px-2">Other<br/>Workers</th>
                <th className="text-right py-2 text-moss-monochrome-deep-fern font-medium text-sm px-2">Apprentices</th>
                <th className="text-right py-2 text-moss-monochrome-deep-fern font-medium text-sm px-2">Journeymen</th>
                <th className="text-right py-2 text-moss-monochrome-deep-fern font-medium text-sm px-2">Total<br/>Hours</th>
              </tr>
            </thead>
            <tbody>
              {editedData.map((week) => {
                const isEdited = JSON.stringify(week) !== JSON.stringify(weeklyData.find(w => w.week === week.week));
                
                return (
                  <tr key={week.week} className={`border-b border-moss-monochrome-sage-veil ${
                    isEdited ? 'bg-yellow-50' : ''
                  }`}>
                    <td className="py-2 text-moss-monochrome-deep-fern font-medium">{week.week}</td>
                    <td className="py-2 text-moss-monochrome-pine-vault">{format(week.date, 'MMM dd, yyyy')}</td>
                    
                    {/* Total Workers */}
                    <td className="py-2 text-right">
                      {editingCell?.week === week.week && editingCell.field === 'totalWorkers' ? (
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className="w-16 px-1 py-0.5 text-right border border-moss-primary-green rounded"
                            autoFocus
                          />
                          <button onClick={handleSaveEdit} className="text-green-600 hover:text-green-700">
                            <Save className="w-4 h-4" />
                          </button>
                          <button onClick={handleCancelEdit} className="text-red-600 hover:text-red-700">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span 
                          className={`text-moss-primary-green font-semibold ${
                            isEditMode ? 'cursor-pointer hover:bg-moss-monochrome-sage-veil px-2 py-1 rounded' : ''
                          }`}
                          onClick={() => handleEditClick(week.week, 'totalWorkers')}
                        >
                          {week.totalWorkers}
                        </span>
                      )}
                    </td>
                    
                    {/* Other Workers */}
                    <td className="py-2 text-right">
                      <span className="text-blue-600 font-semibold">
                        {(week.otherWorkers || (week.totalWorkers - week.apprenticeWorkers - week.journeymanWorkers))}
                      </span>
                    </td>
                    
                    {/* Apprentices */}
                    <td className="py-2 text-right">
                      {editingCell?.week === week.week && editingCell.field === 'apprenticeWorkers' ? (
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className="w-16 px-1 py-0.5 text-right border border-moss-primary-gold rounded"
                            autoFocus
                          />
                          <button onClick={handleSaveEdit} className="text-green-600 hover:text-green-700">
                            <Save className="w-4 h-4" />
                          </button>
                          <button onClick={handleCancelEdit} className="text-red-600 hover:text-red-700">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span 
                          className={`text-moss-primary-gold font-semibold ${
                            isEditMode ? 'cursor-pointer hover:bg-moss-monochrome-sage-veil px-2 py-1 rounded' : ''
                          }`}
                          onClick={() => handleEditClick(week.week, 'apprenticeWorkers')}
                        >
                          {week.apprenticeWorkers}
                        </span>
                      )}
                    </td>
                    
                    {/* Journeymen */}
                    <td className="py-2 text-right">
                      {editingCell?.week === week.week && editingCell.field === 'journeymanWorkers' ? (
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className="w-16 px-1 py-0.5 text-right border border-moss-monochrome-mint-vale rounded"
                            autoFocus
                          />
                          <button onClick={handleSaveEdit} className="text-green-600 hover:text-green-700">
                            <Save className="w-4 h-4" />
                          </button>
                          <button onClick={handleCancelEdit} className="text-red-600 hover:text-red-700">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span 
                          className={`text-moss-monochrome-mint-vale font-semibold ${
                            isEditMode ? 'cursor-pointer hover:bg-moss-monochrome-sage-veil px-2 py-1 rounded' : ''
                          }`}
                          onClick={() => handleEditClick(week.week, 'journeymanWorkers')}
                        >
                          {week.journeymanWorkers}
                        </span>
                      )}
                    </td>
                    
                    <td className="py-2 text-right text-moss-monochrome-deep-fern font-semibold">
                      {Math.round(week.totalHours)}
                      {isEdited && (
                        <span className="text-xs text-amber-600 ml-1">*</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {hasEdits && (
          <p className="text-xs text-amber-600 mt-2">
            * Modified values. Charts and totals reflect your edits.
          </p>
        )}
      </div>
    </div>
  );
};

export default TradeChart; 