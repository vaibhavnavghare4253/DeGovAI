import { Bot, TrendingUp, Shield, AlertTriangle } from 'lucide-react';

const AIAnalytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Analytics</h1>
        <p className="text-gray-600 mt-2">Insights and trends from AI-powered analysis</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Analyses</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">89</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Bot className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Risk Score</p>
              <p className="text-2xl font-bold text-green-600 mt-2">32.5</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Risk</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">67%</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Fraud Detected</p>
              <p className="text-2xl font-bold text-red-600 mt-2">3</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* AI Models Info */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">AI Models</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
            <h3 className="font-semibold text-gray-900 mb-2">🤖 GPT-4 Hybrid (Paid)</h3>
            <p className="text-sm text-gray-600 mb-4">
              Advanced analysis with deep understanding of proposal context and nuances.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Accuracy:</span>
                <span className="font-medium">95%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Response Time:</span>
                <span className="font-medium">2.5s</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-6 border border-green-200">
            <h3 className="font-semibold text-gray-900 mb-2">🌟 Local LLaMA (Free)</h3>
            <p className="text-sm text-gray-600 mb-4">
              Local model providing reliable analysis without external dependencies.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Accuracy:</span>
                <span className="font-medium">85%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Response Time:</span>
                <span className="font-medium">1.2s</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent AI Insights */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent AI Insights</h2>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="font-medium text-blue-900">✅ Low-risk climate proposal approved</p>
            <p className="text-sm text-blue-700 mt-1">
              AI analysis: Risk score 28/100. Strong community support with clear objectives.
            </p>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
            <p className="font-medium text-yellow-900">⚠️ High-value treasury proposal flagged</p>
            <p className="text-sm text-yellow-700 mt-1">
              AI analysis: Risk score 72/100. Large amount requested, recommend extended review period.
            </p>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="font-medium text-red-900">🚨 Potential fraud detected</p>
            <p className="text-sm text-red-700 mt-1">
              AI analysis: Fraud probability 89/100. Multiple red flags identified in proposal text.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalytics;

