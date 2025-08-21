import React, { useState } from 'react';
import { TradeData } from './types';
import TradeInputForm from './components/TradeInputForm';
import TradeChart from './components/TradeChart';
import ProjectOverview from './components/ProjectOverview';
import UpdateNotification from './components/UpdateNotification';
import { Calculator, Trash2, Edit2, Settings } from 'lucide-react';
import { format } from 'date-fns';

const App: React.FC = () => {
  const [trades, setTrades] = useState<TradeData[]>([]);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const [editingTrade, setEditingTrade] = useState<TradeData | null>(null);
  const [showUpdateNotification, setShowUpdateNotification] = useState<boolean>(false);


  const handleTradeAdd = (trade: TradeData) => {
    setTrades([...trades, trade]);
    setSelectedTradeId(trade.id);
  };

  const handleTradeUpdate = (updatedTrade: TradeData) => {
    setTrades(trades.map(t => t.id === updatedTrade.id ? updatedTrade : t));
    setEditingTrade(null);
  };

  const handleTradeDelete = (tradeId: string) => {
    setTrades(trades.filter(t => t.id !== tradeId));
    if (selectedTradeId === tradeId) {
      setSelectedTradeId(trades.length > 1 ? trades[0].id : null);
    }
  };

  const handleEditTrade = (trade: TradeData) => {
    setEditingTrade(trade);
  };

  const handleCancelEdit = () => {
    setEditingTrade(null);
  };

  const selectedTrade = trades.find(t => t.id === selectedTradeId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-moss-monochrome-mist-canopy to-moss-monochrome-sage-veil">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-moss-monochrome-sage-veil">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <img 
                src="/transparent_moss.png" 
                alt="Company Logo" 
                className="h-12 w-auto object-contain"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-moss-primary-green to-moss-monochrome-pine-vault rounded-lg flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-moss-monochrome-deep-fern">
                  IRA Calculator
                </h1>
                <p className="text-sm text-moss-monochrome-pine-vault">
                  Workforce Planning Tool
                </p>
              </div>
            </div>

            {/* Settings Button */}
            <button
              onClick={() => setShowUpdateNotification(true)}
              className="p-2 rounded-lg hover:bg-moss-monochrome-sage-veil transition-colors"
              title="Check for Updates"
            >
              <Settings className="w-5 h-5 text-moss-monochrome-pine-vault" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calculator Form */}
          <div>
            <TradeInputForm 
              onTradeAdd={handleTradeAdd}
              existingTrades={trades}
              editingTrade={editingTrade}
              onTradeUpdate={handleTradeUpdate}
              onCancelEdit={handleCancelEdit}
            />
            
            {/* Trade Tabs */}
            {trades.length > 0 && (
              <div className="mt-6 card">
                <h3 className="text-lg font-semibold text-moss-monochrome-deep-fern mb-4">
                  Active Trades
                </h3>
                <div className="space-y-2">
                  {trades.map(trade => (
                    <div
                      key={trade.id}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedTradeId === trade.id
                          ? 'bg-moss-primary-green text-white'
                          : editingTrade?.id === trade.id
                          ? 'bg-moss-primary-gold text-white'
                          : 'bg-moss-monochrome-mist-canopy hover:bg-moss-monochrome-sage-veil'
                      }`}
                      onClick={() => setSelectedTradeId(trade.id)}
                    >
                      <div>
                        <div className={`font-medium ${
                          selectedTradeId === trade.id || editingTrade?.id === trade.id ? 'text-white' : 'text-moss-monochrome-deep-fern'
                        }`}>
                          {trade.name} {editingTrade?.id === trade.id && '(Editing)'}
                        </div>
                        <div className={`text-sm ${
                          selectedTradeId === trade.id || editingTrade?.id === trade.id ? 'text-moss-monochrome-mist-canopy' : 'text-moss-monochrome-pine-vault'
                        }`}>
                          {trade.totalMW} MW • {format(trade.startDate, 'MMM dd')} - {format(trade.endDate, 'MMM dd')}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTrade(trade);
                          }}
                          className={`p-2 rounded hover:bg-moss-primary-green hover:text-white transition-colors ${
                            selectedTradeId === trade.id || editingTrade?.id === trade.id ? 'text-white' : 'text-moss-monochrome-pine-vault'
                          }`}
                          title="Edit trade parameters"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTradeDelete(trade.id);
                          }}
                          className={`p-2 rounded hover:bg-red-500 hover:text-white transition-colors ${
                            selectedTradeId === trade.id || editingTrade?.id === trade.id ? 'text-white' : 'text-moss-monochrome-pine-vault'
                          }`}
                          title="Delete trade"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div>
            {selectedTrade ? (
              <TradeChart trade={selectedTrade} allTrades={trades} />
            ) : trades.length > 0 ? (
              <div className="card text-center py-12">
                <Calculator className="w-16 h-16 text-moss-monochrome-sage-veil mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-moss-monochrome-deep-fern mb-2">
                  Select a Trade
                </h3>
                <p className="text-moss-monochrome-pine-vault">
                  Choose a trade from the list to view its workforce details.
                </p>
              </div>
            ) : (
              <div className="card text-center py-12">
                <Calculator className="w-16 h-16 text-moss-monochrome-sage-veil mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-moss-monochrome-deep-fern mb-2">
                  Ready to Calculate
                </h3>
                <p className="text-moss-monochrome-pine-vault">
                  Add a trade to begin workforce planning for IRA compliance.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Project Overview */}
        {trades.length > 0 && (
          <div className="mt-8">
            <ProjectOverview trades={trades} />
          </div>
        )}
      </main>

      {/* Update Notification */}
      <UpdateNotification
        isVisible={showUpdateNotification}
        onClose={() => setShowUpdateNotification(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-moss-monochrome-sage-veil mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-sm text-moss-monochrome-pine-vault">
              <p className="font-medium text-moss-monochrome-deep-fern mb-2">IRA Apprenticeship Requirements</p>
              <p>Projects must maintain ≥15% apprentice hours to qualify for tax credits under the Inflation Reduction Act</p>
              <p className="mt-1">Track each trade separately • Edit worker counts for accurate planning • Monitor compliance status</p>
            </div>
            <div className="mt-4 text-xs text-moss-monochrome-sage-veil">
              <p>IRA Section 45(b)(8) - Prevailing Wage and Apprenticeship Requirements</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App; 