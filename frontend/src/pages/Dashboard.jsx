import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  DocumentTextIcon,
  SparklesIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,    // Fixed: Changed from TrendingUpIcon
  ArrowTrendingDownIcon,  // Fixed: Changed from TrendingDownIcon
} from '@heroicons/react/24/outline';
import { textService } from '../services/api';
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

// Register ChartJS components
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

// Score Trend Chart Component
const ScoreTrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No trend data available yet</p>
        <p className="text-sm mt-1">Start analyzing text to see your progress!</p>
      </div>
    );
  }

  const chartData = {
    labels: data.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [{
      label: 'AI Detection Score %',
      data: data.map(d => d.score),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: data.map(d => {
        if (d.score >= 80) return '#ef4444';
        if (d.score >= 60) return '#f97316';
        if (d.score >= 40) return '#eab308';
        return '#22c55e';
      }),
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12 },
          usePointStyle: true,
        }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const label = ctx.dataset.label || '';
            const value = ctx.raw;
            let message = '';
            if (value >= 80) message = '⚠️ High AI probability';
            else if (value >= 60) message = '⚠️ Moderate AI probability';
            else if (value >= 40) message = '🤔 Mixed signals';
            else if (value >= 20) message = '✅ Likely human';
            else message = '✨ Very human-like';
            return [`${label}: ${value}%`, message];
          }
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        title: {
          display: true,
          text: 'AI Score (%)',
          font: { size: 12, weight: 'bold' }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: (value) => `${value}%`
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date',
          font: { size: 12, weight: 'bold' }
        },
        grid: {
          display: false
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  // Calculate trend
  const getTrend = () => {
    if (data.length < 2) return null;
    const firstScore = data[0].score;
    const lastScore = data[data.length - 1].score;
    const difference = lastScore - firstScore;
    return {
      direction: difference < 0 ? 'down' : 'up',
      improvement: difference < 0,
      percentage: Math.abs(difference).toFixed(1)
    };
  };

  const trend = getTrend();

  return (
    <div className="mt-4">
      {trend && (
        <div className={`mb-4 p-3 rounded-lg ${trend.improvement ? 'bg-green-50' : 'bg-yellow-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {trend.improvement ? (
                <ArrowTrendingDownIcon className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <ArrowTrendingUpIcon className="h-5 w-5 text-yellow-600 mr-2" />
              )}
              <span className={`text-sm font-medium ${trend.improvement ? 'text-green-700' : 'text-yellow-700'}`}>
                {trend.improvement 
                  ? `✨ AI Score improved by ${trend.percentage}% over time!` 
                  : `⚠️ AI Score increased by ${trend.percentage}% - try humanizing more`}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {data.length} analyses
            </span>
          </div>
        </div>
      )}
      <Line data={chartData} options={options} height={250} />
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    detections: 0,
    humanizations: 0,
    avgScore: 0,
    bestScore: 0,
    worstScore: 0
  });
  const [recent, setRecent] = useState([]);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // week, month, all

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      // Load all history for comprehensive stats
      const allHistory = [];
      let currentPage = 1;
      let hasMore = true;
      
      while (hasMore) {
        const response = await textService.getHistory(currentPage, 100);
        allHistory.push(...response.items);
        hasMore = currentPage < response.totalPages;
        currentPage++;
      }

      const total = allHistory.length;
      const detections = allHistory.filter(i => i.processingType === 'detect').length;
      const humanizations = allHistory.filter(i => i.processingType === 'humanize').length;
      const avgScore = total > 0 
        ? Math.round(allHistory.reduce((acc, i) => acc + i.aiScore, 0) / total)
        : 0;
      
      // Find best and worst scores
      const scores = allHistory.map(i => i.aiScore);
      const bestScore = scores.length > 0 ? Math.min(...scores) : 0;
      const worstScore = scores.length > 0 ? Math.max(...scores) : 0;

      setStats({ 
        total, 
        detections, 
        humanizations, 
        avgScore,
        bestScore,
        worstScore
      });

      // Get recent items (last 5)
      setRecent(allHistory.slice(0, 5));

      // Generate score history for trend chart
      const historyMap = new Map();
      
      allHistory.forEach(item => {
        const date = new Date(item.createdAt).toISOString().split('T')[0];
        if (!historyMap.has(date) || historyMap.get(date) > item.aiScore) {
          // Store the lowest score for each day (best improvement)
          historyMap.set(date, item.aiScore);
        }
      });
      
      const trendData = Array.from(historyMap.entries())
        .map(([date, score]) => ({ date, score }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-30); // Last 30 days

      setScoreHistory(trendData);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-500';
    if (score >= 40) return 'text-yellow-500';
    if (score >= 20) return 'text-green-500';
    return 'text-emerald-500';
  };

  const cards = [
    { 
      title: 'Total Analyses', 
      value: stats.total, 
      icon: DocumentTextIcon, 
      color: 'blue',
      description: 'All time'
    },
    { 
      title: 'Detections', 
      value: stats.detections, 
      icon: ChartBarIcon, 
      color: 'green',
      description: 'AI detection scans'
    },
    { 
      title: 'Humanizations', 
      value: stats.humanizations, 
      icon: SparklesIcon, 
      color: 'purple',
      description: 'Texts humanized'
    },
    { 
      title: 'Avg AI Score', 
      value: `${stats.avgScore}%`, 
      icon: ClockIcon, 
      color: 'orange',
      description: 'Average AI probability'
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to AI Text Humanizer</h1>
        <p className="text-primary-100">Detect AI content and make it sound naturally human</p>
        {stats.total > 0 && (
          <div className="mt-4 flex space-x-4 text-sm">
            <span className="bg-white/20 rounded-full px-3 py-1">
              📊 {stats.total} total analyses
            </span>
            <span className="bg-white/20 rounded-full px-3 py-1">
              ✨ {stats.humanizations} humanizations
            </span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className={`bg-${card.color}-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
              <card.icon className={`h-6 w-6 text-${card.color}-600`} />
            </div>
            <h3 className="text-gray-600 text-sm">{card.title}</h3>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Additional Stats Row */}
      {(stats.bestScore > 0 || stats.worstScore > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Best AI Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(stats.bestScore)}`}>
                  {stats.bestScore}%
                </p>
                <p className="text-xs text-green-600 mt-1">Lowest AI probability achieved</p>
              </div>
              <div className="text-3xl">🏆</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium">Worst AI Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(stats.worstScore)}`}>
                  {stats.worstScore}%
                </p>
                <p className="text-xs text-red-600 mt-1">Highest AI probability detected</p>
              </div>
              <div className="text-3xl">⚠️</div>
            </div>
          </div>
        </div>
      )}

      {/* Score Trend Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">AI Score Trend Over Time</h2>
          <div className="text-sm text-gray-500">
            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
            Lower scores = More human-like
          </div>
        </div>
        <ScoreTrendChart data={scoreHistory} />
        {scoreHistory.length > 0 && (
          <p className="text-xs text-gray-500 text-center mt-4">
            Showing trend for the last {scoreHistory.length} days
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <Link 
              to="/detector" 
              className="block p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900">🔍 Detect AI Text</h3>
                  <p className="text-sm text-blue-700">Check if text is AI-generated</p>
                </div>
                <span className="text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
            <Link 
              to="/humanizer" 
              className="block p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-purple-900">✨ Humanize Text</h3>
                  <p className="text-sm text-purple-700">Make AI text sound natural</p>
                </div>
                <span className="text-purple-600 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          {recent.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recent.map((item) => (
                <Link 
                  key={item.id} 
                  to={`/history`} 
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium flex items-center">
                      {item.processingType === 'detect' ? '🔍 Detection' : '✨ Humanized'}
                      {item.tone && item.processingType === 'humanize' && (
                        <span className="ml-2 text-xs text-gray-500 capitalize">
                          ({item.tone})
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{item.originalText?.substring(0, 100)}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className={`text-xs font-medium ${getScoreColor(item.aiScore)}`}>
                      AI Score: {item.aiScore}%
                    </span>
                    {item.processingType === 'humanize' && item.beforeScore && (
                      <span className="text-xs text-green-600">
                        ↓ {Math.round(item.beforeScore - item.aiScore)}% improvement
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent activity</p>
              <Link to="/detector" className="text-primary-600 text-sm mt-2 inline-block">
                Start your first analysis →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Tips Section */}
      {stats.total === 0 && (
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Getting Started</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use the <strong>Detector</strong> to check if text is AI-generated</li>
            <li>• Use the <strong>Humanizer</strong> to make AI text sound natural</li>
            <li>• Choose from 8 different tones to match your style</li>
            <li>• Track your progress in the history section</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dashboard;