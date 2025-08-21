import React, { useState, useEffect } from 'react';
import { TradeData } from '../types';
import { Calculator } from 'lucide-react';

interface TradeInputFormProps {
  onTradeAdd: (trade: TradeData) => void;
  existingTrades: TradeData[];
  editingTrade?: TradeData | null;
  onTradeUpdate?: (trade: TradeData) => void;
  onCancelEdit?: () => void;
}

const TRADE_OPTIONS = [
  { value: 'electrical', label: 'Electrical' },
  { value: 'mechanical', label: 'Mechanical' },
  { value: 'civil', label: 'Civil' },
  { value: 'all', label: 'All Trades' }
];

const TradeInputForm: React.FC<TradeInputFormProps> = ({ 
  onTradeAdd, 
  existingTrades, 
  editingTrade, 
  onTradeUpdate, 
  onCancelEdit 
}) => {
  const [formData, setFormData] = useState({
    tradeName: 'electrical',
    manHoursPerMW: 40,
    totalMW: 100,
    apprenticeRatio: 0.15,
    rampUpWeeks: 2,
    rampDownWeeks: 2,
    startDate: new Date().toISOString().split('T')[0],
    projectWeeks: 10
  });

  // Calculate end date based on start date and project weeks
  const calculateEndDate = (startDate: string, weeks: number): Date => {
    const start = new Date(startDate);
    const endDate = new Date(start);
    endDate.setDate(start.getDate() + (weeks * 7));
    return endDate;
  };

  const endDate = calculateEndDate(formData.startDate, formData.projectWeeks);

  // Update form data when editingTrade changes
  useEffect(() => {
    if (editingTrade) {
      setFormData({
        tradeName: editingTrade.name.toLowerCase(),
        manHoursPerMW: editingTrade.manHoursPerMW,
        totalMW: editingTrade.totalMW,
        apprenticeRatio: editingTrade.apprenticeRatio,
        rampUpWeeks: editingTrade.rampUpWeeks,
        rampDownWeeks: editingTrade.rampDownWeeks,
        startDate: editingTrade.startDate.toISOString().split('T')[0],
        projectWeeks: Math.ceil((editingTrade.endDate.getTime() - editingTrade.startDate.getTime()) / (1000 * 60 * 60 * 24 * 7))
      });
    } else {
      // Reset form when not editing
      setFormData({
        tradeName: 'electrical',
        manHoursPerMW: 40,
        totalMW: 100,
        apprenticeRatio: 0.15,
        rampUpWeeks: 2,
        rampDownWeeks: 2,
        startDate: new Date().toISOString().split('T')[0],
        projectWeeks: 10
      });
    }
  }, [editingTrade]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate ramp periods
    if (formData.rampUpWeeks + formData.rampDownWeeks > formData.projectWeeks) {
      alert('Ramp up and ramp down weeks combined cannot exceed the project duration.');
      return;
    }
    
    // Check for duplicate trades (excluding the one being edited)
    const existingTradeNames = existingTrades
      .filter(t => !editingTrade || t.id !== editingTrade.id)
      .map(t => t.name.toLowerCase());
    
    if (formData.tradeName === 'all') {
      // Check if any of the three trades already exist
      const tradesToAdd = ['Electrical', 'Mechanical', 'Civil'].filter(
        tradeName => !existingTradeNames.includes(tradeName.toLowerCase())
      );
      
      if (tradesToAdd.length === 0) {
        alert('All trades (Electrical, Mechanical, Civil) are already added to this project.');
        return;
      }
      
      // Add only the missing trades
      tradesToAdd.forEach((tradeName, index) => {
        const trade: TradeData = {
          id: Date.now().toString() + '-' + index,
          name: tradeName,
          manHoursPerMW: formData.manHoursPerMW,
          totalMW: formData.totalMW,
          apprenticeRatio: tradeName.toLowerCase() === 'civil' ? 0 : formData.apprenticeRatio,
          rampUpWeeks: formData.rampUpWeeks,
          rampDownWeeks: formData.rampDownWeeks,
          startDate: new Date(formData.startDate),
          endDate: endDate
        };
        onTradeAdd(trade);
      });
    } else {
      const selectedTradeName = TRADE_OPTIONS.find(t => t.value === formData.tradeName)?.label || 'Trade';
      
      // Check if this specific trade already exists
      if (existingTradeNames.includes(selectedTradeName.toLowerCase()) && !editingTrade) {
        alert(`${selectedTradeName} trade is already added to this project.`);
        return;
      }
      
      const trade: TradeData = {
        id: editingTrade?.id || Date.now().toString(),
        name: selectedTradeName,
        manHoursPerMW: formData.manHoursPerMW,
        totalMW: formData.totalMW,
        apprenticeRatio: selectedTradeName.toLowerCase() === 'civil' ? 0 : formData.apprenticeRatio,
        rampUpWeeks: formData.rampUpWeeks,
        rampDownWeeks: formData.rampDownWeeks,
        startDate: new Date(formData.startDate),
        endDate: endDate
      };
      
      if (editingTrade && onTradeUpdate) {
        onTradeUpdate(trade);
      } else {
        onTradeAdd(trade);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'apprenticeRatio' 
        ? parseFloat(value) / 100 
        : name === 'startDate' || name === 'tradeName'
        ? value
        : parseFloat(value) || 0
    }));
  };

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-6 h-6 text-moss-primary-green" />
        <h2 className="text-2xl font-semibold text-moss-monochrome-deep-fern">
          {editingTrade ? `Edit ${editingTrade.name} Trade` : 'IRA Calculator'}
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trade Selection */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-moss-monochrome-deep-fern mb-2">
              Trade Selection
            </label>
            <select
              name="tradeName"
              value={formData.tradeName}
              onChange={handleInputChange}
              className="input-field"
              required
              disabled={editingTrade !== null}
            >
              {TRADE_OPTIONS.map(option => {
                const isDisabled = !editingTrade && 
                  existingTrades.some(t => t.name.toLowerCase() === option.label.toLowerCase());
                
                return (
                  <option 
                    key={option.value} 
                    value={option.value}
                    disabled={isDisabled}
                  >
                    {option.label} {isDisabled ? '(Already Added)' : ''}
                  </option>
                );
              })}
            </select>
            <p className="mt-1 text-xs text-moss-monochrome-pine-vault">
              {editingTrade 
                ? `Editing ${editingTrade.name} trade parameters`
                : 'Select individual trades or "All Trades" to add missing trades'
              }
            </p>
          </div>

          {/* Man Hours per MW */}
          <div>
            <label className="block text-sm font-medium text-moss-monochrome-deep-fern mb-2">
              Man Hours per MW
            </label>
            <input
              type="number"
              name="manHoursPerMW"
              value={formData.manHoursPerMW}
              onChange={handleInputChange}
              className="input-field"
              placeholder="40"
              min="0"
              step="0.1"
              required
            />
            <p className="mt-1 text-xs text-moss-monochrome-pine-vault">
              Total labor hours required per megawatt
            </p>
          </div>

          {/* Total MW */}
          <div>
            <label className="block text-sm font-medium text-moss-monochrome-deep-fern mb-2">
              Total MW
            </label>
            <input
              type="number"
              name="totalMW"
              value={formData.totalMW}
              onChange={handleInputChange}
              className="input-field"
              placeholder="100"
              min="0"
              step="0.1"
              required
            />
            <p className="mt-1 text-xs text-moss-monochrome-pine-vault">
              Project capacity in megawatts
            </p>
          </div>

          {/* Apprentice Hours */}
          <div>
            <label className="block text-sm font-medium text-moss-monochrome-deep-fern mb-2">
              Apprentice Hours (%)
            </label>
            <input
              type="number"
              name="apprenticeRatio"
              value={formData.tradeName === 'civil' ? 0 : formData.apprenticeRatio * 100}
              onChange={handleInputChange}
              className="input-field"
              placeholder="15"
              min="0"
              max="100"
              step="1"
              required
              disabled={formData.tradeName === 'civil'}
            />
            <p className="mt-1 text-xs text-moss-monochrome-pine-vault">
              IRA requires minimum 15% for tax credit eligibility
              {formData.tradeName === 'civil' && " (Civil trade has no apprentices)"}
            </p>
          </div>

          {/* Project Duration - Editable */}
          <div>
            <label className="block text-sm font-medium text-moss-monochrome-deep-fern mb-2">
              Project Duration (Weeks)
            </label>
            <input
              type="number"
              name="projectWeeks"
              value={formData.projectWeeks}
              onChange={handleInputChange}
              className="input-field"
              placeholder="10"
              min="1"
              step="1"
              required
            />
          </div>

          {/* Ramp Up Weeks */}
          <div>
            <label className="block text-sm font-medium text-moss-monochrome-deep-fern mb-2">
              Ramp Up Weeks
            </label>
            <input
              type="number"
              name="rampUpWeeks"
              value={formData.rampUpWeeks}
              onChange={handleInputChange}
              className="input-field"
              placeholder="2"
              min="0"
              max={formData.projectWeeks}
              required
            />
            <p className="mt-1 text-xs text-moss-monochrome-pine-vault">
              Gradual workforce increase period
            </p>
          </div>

          {/* Ramp Down Weeks */}
          <div>
            <label className="block text-sm font-medium text-moss-monochrome-deep-fern mb-2">
              Ramp Down Weeks
            </label>
            <input
              type="number"
              name="rampDownWeeks"
              value={formData.rampDownWeeks}
              onChange={handleInputChange}
              className="input-field"
              placeholder="2"
              min="0"
              max={formData.projectWeeks}
              required
            />
            <p className="mt-1 text-xs text-moss-monochrome-pine-vault">
              Gradual workforce decrease period
            </p>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-moss-monochrome-deep-fern mb-2">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-moss-monochrome-deep-fern mb-2">
              End Date
            </label>
            <div className="input-field bg-gray-100 text-gray-600 text-sm">
              {endDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <p className="mt-1 text-xs text-moss-monochrome-pine-vault">
              Calculated based on start date + {formData.projectWeeks} weeks
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {editingTrade && onCancelEdit && (
            <button 
              type="button" 
              onClick={onCancelEdit}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
          <button type="submit" className="flex-1 btn-primary">
            {editingTrade 
              ? 'Update Trade' 
              : formData.tradeName === 'all' 
                ? 'Calculate All Trades' 
                : 'Calculate Workforce'
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default TradeInputForm; 