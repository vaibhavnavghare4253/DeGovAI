import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Bot,
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { proposalAPI, treasuryAPI } from '../services/api';

const Dashboard = () => {
  // Fetch proposals
  const { data: proposalsData } = useQuery({
    queryKey: ['proposals', { pageSize: 5 }],
    queryFn: () => proposalAPI.getAll({ pageSize: 5 }),
  });

  // Fetch treasury status
  const { data: treasuryData } = useQuery({
    queryKey: ['treasury-status'],
    queryFn: () => treasuryAPI.getStatus(),
  });

  const stats = [
    {
      label: 'Total Proposals',
      value: proposalsData?.totalCount || 0,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      label: 'Active Voters',
      value: '1,234', // TODO: Get from API
      icon: Users,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      label: 'Treasury Balance',
      value: `${treasuryData?.currentBalance?.toFixed(2) || '0.00'} ETH`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      label: 'AI Analyses',
      value: '89', // TODO: Get from API
      icon: Bot,
      color: 'text-indigo-600',
      bg: 'bg-indigo-100',
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Passed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'Active':
      case 'Pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-10">
      {/* Header with Neon Effect */}
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-3xl rounded-full opacity-30"></div>
        <div className="relative">
          <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent mb-3 animate-slide-down">
            Dashboard
          </h1>
          <p className="text-gray-300 text-lg">
            Overview of DAO governance activity and AI-powered insights ✨
          </p>
        </div>
      </div>

      {/* Stats Grid with 3D Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.label} 
              className="card stat-card-3d group cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">{stat.label}</p>
                  <p className="text-3xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mt-3">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.bg} p-4 rounded-2xl relative overflow-hidden group-hover:scale-110 transition-transform duration-300`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Icon className={`w-7 h-7 ${stat.color} relative z-10 group-hover:animate-float`} />
                </div>
              </div>
              {/* Holographic shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
            </div>
          );
        })}
      </div>

      {/* Recent Proposals */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Proposals</h2>
          <Link
            to="/proposals"
            className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            View all
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="space-y-4">
          {proposalsData?.proposals?.map((proposal) => (
            <Link
              key={proposal.proposalId}
              to={`/proposals/${proposal.proposalId}`}
              className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(proposal.status)}
                    <span className="text-xs font-medium text-gray-500">
                      {proposal.proposalType}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{proposal.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{proposal.description}</p>
                  
                  {/* Voting Stats */}
                  <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                    <span>👍 {proposal.votesFor} For</span>
                    <span>👎 {proposal.votesAgainst} Against</span>
                    <span>⏱️ {proposal.hoursRemaining}h remaining</span>
                  </div>
                </div>

                {/* AI Score */}
                {proposal.riskScore !== null && (
                  <div className="ml-4 text-center">
                    <div className={`text-2xl font-bold ${
                      proposal.riskScore < 40 ? 'text-green-600' :
                      proposal.riskScore < 70 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {proposal.riskScore}
                    </div>
                    <div className="text-xs text-gray-500">Risk Score</div>
                  </div>
                )}
              </div>
            </Link>
          ))}

          {!proposalsData?.proposals?.length && (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No proposals yet. Be the first to create one!</p>
              <Link to="/proposals/create" className="btn btn-primary mt-4 inline-flex items-center">
                Create Proposal
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/proposals/create"
          className="card hover:shadow-lg transition-shadow cursor-pointer group"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-primary-100 p-4 rounded-lg group-hover:bg-primary-200 transition-colors">
              <FileText className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Create Proposal</h3>
              <p className="text-sm text-gray-600">Submit a new governance proposal</p>
            </div>
          </div>
        </Link>

        <Link
          to="/ai-analytics"
          className="card hover:shadow-lg transition-shadow cursor-pointer group"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 p-4 rounded-lg group-hover:bg-purple-200 transition-colors">
              <Bot className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Analytics</h3>
              <p className="text-sm text-gray-600">View AI-powered insights</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;

