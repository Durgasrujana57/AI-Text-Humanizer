import React, { useState, useEffect } from 'react';
import { textService } from '../services/api';
import toast from 'react-hot-toast';
import { TrashIcon, ChevronLeftIcon, ChevronRightIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Score Comparison Chart Component
const ScoreComparisonChart = ({ beforeScore, afterScore, type }) => {
    if (type !== 'humanize') return null;
    
    const data = {
        labels: ['Original AI Score', 'After Humanization'],
        datasets: [{
            label: 'AI Probability %',
            data: [beforeScore, afterScore],
            backgroundColor: ['rgba(239, 68, 68, 0.7)', 'rgba(34, 197, 94, 0.7)'],
            borderColor: ['rgb(239, 68, 68)', 'rgb(34, 197, 94)'],
            borderWidth: 1,
            borderRadius: 8,
        }]
    };
    
    const options = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: { 
                position: 'top',
                labels: { font: { size: 12 } }
            },
            tooltip: { 
                callbacks: { 
                    label: (ctx) => `${ctx.raw}%` 
                } 
            }
        },
        scales: {
            y: { 
                min: 0, 
                max: 100, 
                title: { display: true, text: 'AI Probability %', font: { size: 12 } },
                grid: { color: 'rgba(0, 0, 0, 0.05)' }
            },
            x: {
                ticks: { font: { size: 12 } }
            }
        }
    };
    
    const reduction = Math.round(beforeScore - afterScore);
    const improvementText = reduction > 30 ? 'dramatically improved' : reduction > 15 ? 'significantly improved' : 'improved';
    
    return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-3 text-gray-700">📊 AI Score Improvement</h4>
            <Bar data={data} options={options} height={200} />
            <div className="mt-3 text-sm text-center">
                <span className="text-green-600 font-medium">
                    ↓ Reduced by {reduction}%! 
                </span>
                <span className="text-gray-600 ml-1">
                    Text now sounds {afterScore < 30 ? 'very human' : afterScore < 60 ? 'somewhat human' : 'slightly robotic'}
                </span>
            </div>
            {reduction > 20 && (
                <div className="mt-2 text-xs text-center text-green-500">
                    ✨ Excellent improvement! The text is much more natural now.
                </div>
            )}
        </div>
    );
};

const History = () => {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterTone, setFilterTone] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);

  // All available tones
  const tones = [
    { id: 'casual', name: 'Casual', emoji: '😎' },
    { id: 'professional', name: 'Professional', emoji: '💼' },
    { id: 'friendly', name: 'Friendly', emoji: '🤗' },
    { id: 'academic', name: 'Academic', emoji: '📚' },
    { id: 'student', name: 'Student', emoji: '🎓' },
    { id: 'creative', name: 'Creative', emoji: '🎨' },
    { id: 'technical', name: 'Technical', emoji: '⚙️' },
    { id: 'persuasive', name: 'Persuasive', emoji: '🎯' }
  ];

  useEffect(() => {
    loadHistory();
  }, [pagination.page]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await textService.getHistory(pagination.page, pagination.pageSize);
      setItems(response.items || []);
      setPagination({
        page: response.page,
        pageSize: response.pageSize,
        total: response.total,
        totalPages: response.totalPages
      });
    } catch (error) {
      toast.error('Failed to load history');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    try {
      await textService.deleteHistoryItem(id);
      toast.success('Deleted successfully');
      loadHistory();
      if (selected?.id === id) setSelected(null);
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Clear all history? This cannot be undone.')) return;
    try {
      await textService.clearHistory();
      toast.success('All history cleared');
      setItems([]);
      setSelected(null);
    } catch {
      toast.error('Failed to clear');
    }
  };

  // Export to CSV function
  const exportToCSV = async () => {
    const toastId = toast.loading('Preparing export...');
    
    try {
      // Get all history items (fetch all pages)
      const allItems = [];
      let currentPage = 1;
      let hasMore = true;
      
      while (hasMore) {
        const response = await textService.getHistory(currentPage, 100);
        allItems.push(...response.items);
        hasMore = currentPage < response.totalPages;
        currentPage++;
      }
      
      if (allItems.length === 0) {
        toast.error('No history to export', { id: toastId });
        return;
      }
      
      // Define CSV headers
      const headers = [
        'ID',
        'Type',
        'Tone',
        'AI Score',
        'Date',
        'Time',
        'Word Count',
        'Character Count',
        'Original Text',
        'Humanized Text'
      ];
      
      // Convert data to CSV rows
      const csvRows = allItems.map(item => {
        // Safely handle text escaping for CSV
        const escapeCSV = (text) => {
          if (!text || text === 'N/A') return 'N/A';
          // Replace quotes with double quotes and remove newlines
          return `"${text.replace(/"/g, '""').replace(/\n/g, ' ').replace(/\r/g, ' ')}"`;
        };
        
        const toneObj = tones.find(t => t.id === item.tone);
        const toneDisplay = toneObj ? `${toneObj.emoji} ${toneObj.name}` : (item.tone || 'N/A');
        
        return [
          item.id,
          item.processingType === 'detect' ? 'Detection' : 'Humanize',
          toneDisplay,
          item.aiScore,
          new Date(item.createdAt).toLocaleDateString(),
          new Date(item.createdAt).toLocaleTimeString(),
          item.originalText ? item.originalText.trim().split(/\s+/).length : 0,
          item.originalText ? item.originalText.length : 0,
          escapeCSV(item.originalText || 'N/A'),
          escapeCSV(item.processedText || 'N/A')
        ];
      });
      
      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');
      
      // Add BOM for UTF-8 encoding (helps with special characters)
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Generate filename with current date and count
      const date = new Date().toISOString().split('T')[0];
      a.download = `ai-history-${date}-${allItems.length}records.csv`;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Exported ${allItems.length} records successfully!`, { id: toastId });
      
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export history', { id: toastId });
    }
  };

  // Filter logic
  const filteredItems = items.filter(item => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      item.originalText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.processedText || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Type filter
    const matchesType = filterType === 'all' || item.processingType === filterType;
    
    // Tone filter
    const matchesTone = filterTone === 'all' || (item.tone || 'none') === filterTone;
    
    // Date filter
    const itemDate = new Date(item.createdAt).toISOString().split('T')[0];
    const matchesStartDate = !dateRange.start || itemDate >= dateRange.start;
    const matchesEndDate = !dateRange.end || itemDate <= dateRange.end;
    
    return matchesSearch && matchesType && matchesTone && matchesStartDate && matchesEndDate;
  });

  const totalFilteredPages = Math.ceil(filteredItems.length / pagination.pageSize);
  const paginatedFilteredItems = filteredItems.slice(
    (pagination.page - 1) * pagination.pageSize,
    pagination.page * pagination.pageSize
  );

  const getScoreBadgeClass = (score) => {
    if (score >= 80) return 'bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium';
    if (score >= 60) return 'bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium';
    if (score >= 40) return 'bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium';
    if (score >= 20) return 'bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium';
    return 'bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium';
  };

  const getScoreIndicator = (score) => {
    if (score >= 80) return '🔴';
    if (score >= 60) return '🟠';
    if (score >= 40) return '🟡';
    return '🟢';
  };

  const calculateWordCount = (text) => {
    return text ? text.trim().split(/\s+/).length : 0;
  };

  const getToneDisplay = (toneId) => {
    const tone = tones.find(t => t.id === toneId);
    return tone ? `${tone.emoji} ${tone.name}` : (toneId || 'None');
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header with Export and Filter Toggle */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h1 className="text-3xl font-bold">Analysis History</h1>
        <div className="flex space-x-2">
          {/* Export Button */}
          <button
            onClick={exportToCSV}
            disabled={items.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            title="Export to CSV"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <FunnelIcon className="h-5 w-5 mr-1" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          {items.length > 0 && (
            <button onClick={handleClearAll} className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center">
              <TrashIcon className="h-5 w-5 mr-1" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 animate-fadeIn">
          <h3 className="font-semibold mb-4 flex items-center">
            <FunnelIcon className="h-5 w-5 mr-2 text-primary-600" />
            Filter Options
          </h3>
          
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search Box */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Text
              </label>
              <input
                type="text"
                placeholder="🔍 Search in original or humanized text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Analysis Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="detect">🔍 Detection Only</option>
                <option value="humanize">✨ Humanized Only</option>
              </select>
            </div>

            {/* Tone Filter - Updated with all 8 tones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tone
              </label>
              <select
                value={filterTone}
                onChange={(e) => setFilterTone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Tones</option>
                {tones.map(tone => (
                  <option key={tone.id} value={tone.id}>
                    {tone.emoji} {tone.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Stats and Clear Button */}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Found {filteredItems.length} results
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterTone('all');
                setDateRange({ start: '', end: '' });
              }}
              className="text-sm text-primary-600 hover:text-primary-800"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <p className="text-gray-500">No results match your filters</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar with history list */}
          <div className="md:col-span-1 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="font-semibold">Recent Analyses ({filteredItems.length})</h2>
            </div>
            <div className="divide-y max-h-[500px] overflow-y-auto">
              {paginatedFilteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selected?.id === item.id ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium flex items-center">
                      {item.processingType === 'detect' ? '🔍 Detection' : '✨ Humanized'}
                      {item.tone && item.processingType === 'humanize' && (
                        <span className="ml-2 text-xs text-gray-500">
                          {getToneDisplay(item.tone)}
                        </span>
                      )}
                    </span>
                    <span className={getScoreBadgeClass(item.aiScore)}>
                      {item.aiScore}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{item.originalText}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </button>
              ))}
            </div>

            {/* Pagination */}
            {totalFilteredPages > 1 && (
              <div className="p-4 border-t flex justify-between items-center">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {totalFilteredPages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === totalFilteredPages}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Main content area with side-by-side comparison */}
          <div className="md:col-span-2">
            {selected ? (
              <div className="bg-white rounded-xl shadow-lg p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold capitalize flex items-center">
                      {selected.processingType === 'detect' ? '🔍' : '✨'}
                      <span className="ml-2">{selected.processingType} Details</span>
                      {selected.tone && selected.processingType === 'humanize' && (
                        <span className="ml-2 text-sm font-normal text-gray-500">
                          ({getToneDisplay(selected.tone)} tone)
                        </span>
                      )}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {new Date(selected.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(selected.id)}
                    className="text-red-600 hover:text-red-800 p-2 transition-colors"
                    title="Delete this item"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* SIDE-BY-SIDE COMPARISON */}
                <div className="grid md:grid-cols-2 gap-6 mt-4">
                  {/* Original Text Column */}
                  <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-red-700 flex items-center">
                        <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                        Original Text
                      </h3>
                      <span className={getScoreBadgeClass(selected.aiScore)}>
                        Score: {selected.aiScore}%
                      </span>
                    </div>
                    <div className="bg-white rounded-lg p-3 max-h-80 overflow-y-auto">
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {selected.originalText}
                      </p>
                    </div>
                    
                    {/* Original text stats */}
                    <div className="mt-3 text-xs text-gray-500 flex justify-between">
                      <span>📝 Words: {calculateWordCount(selected.originalText)}</span>
                      <span>📊 Chars: {selected.originalText.length}</span>
                    </div>
                  </div>

                  {/* Humanized Text Column (if available) */}
                  {selected.processingType === 'humanize' && selected.processedText ? (
                    <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-green-700 flex items-center">
                          <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                          Humanized Text
                        </h3>
                        <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                          New: {selected.aiScore}%
                        </span>
                      </div>
                      <div className="bg-white rounded-lg p-3 max-h-80 overflow-y-auto">
                        <p className="text-gray-800 whitespace-pre-wrap">
                          {selected.processedText}
                        </p>
                      </div>
                      
                      {/* Score Comparison Chart - NEW */}
                      {selected.beforeScore && (
                        <ScoreComparisonChart 
                          beforeScore={selected.beforeScore}
                          afterScore={selected.aiScore}
                          type={selected.processingType}
                        />
                      )}
                      
                      {/* Improvements summary */}
                      <div className="mt-3 bg-yellow-100 rounded-lg p-3">
                        <h4 className="text-xs font-semibold text-yellow-800 mb-1">✨ Improvements:</h4>
                        <ul className="text-xs text-yellow-700 space-y-1">
                          {selected.tone && (
                            <li>• Applied {getToneDisplay(selected.tone)} tone</li>
                          )}
                          <li>• Added natural contractions</li>
                          <li>• Improved sentence flow</li>
                        </ul>
                      </div>
                      
                      {/* Humanized text stats */}
                      <div className="mt-3 text-xs text-gray-500 flex justify-between">
                        <span>📝 Words: {calculateWordCount(selected.processedText)}</span>
                        <span>📊 Chars: {selected.processedText.length}</span>
                      </div>
                    </div>
                  ) : selected.processingType === 'detect' && (
                    <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-4xl mb-2 block">🔍</span>
                        <p className="text-blue-700 font-medium">Detection Only</p>
                        <p className="text-sm text-blue-600 mt-2">
                          This was an AI detection analysis.
                        </p>
                        <p className="text-xs text-blue-500 mt-1">
                          Score: {selected.aiScore}% AI probability
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Metadata Footer */}
                <div className="mt-6 pt-4 border-t grid grid-cols-4 gap-4 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-500 block text-xs">Type</span>
                    <span className="font-medium capitalize">
                      {selected.processingType}
                    </span>
                  </div>
                  {selected.tone && (
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="text-gray-500 block text-xs">Tone</span>
                      <span className="font-medium capitalize flex items-center">
                        {getToneDisplay(selected.tone)}
                      </span>
                    </div>
                  )}
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-500 block text-xs">Date</span>
                    <span className="font-medium text-sm">
                      {new Date(selected.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-500 block text-xs">Time</span>
                    <span className="font-medium text-sm">
                      {new Date(selected.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Copy buttons */}
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selected.originalText);
                      toast.success('Original text copied!');
                    }}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    Copy Original
                  </button>
                  {selected.processedText && selected.processedText !== selected.originalText && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selected.processedText);
                        toast.success('Humanized text copied!');
                      }}
                      className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                    >
                      Copy Humanized
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <p className="text-gray-500">Select an item from the list to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default History;