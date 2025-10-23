import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Filter, Search } from 'lucide-react';
import { proposalAPI } from '../services/api';

const Proposals = () => {
  const [filters, setFilters] = useState({
    status: '',
    proposalType: '',
    search: '',
    page: 1,
    pageSize: 10,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['proposals', filters],
    queryFn: () => proposalAPI.getAll(filters),
  });

  const getStatusBadge = (status) => {
    const badges = {
      Pending: 'badge badge-warning',
      Active: 'badge badge-info',
      Passed: 'badge badge-success',
      Rejected: 'badge badge-danger',
      Executed: 'badge badge-success',
    };
    return badges[status] || 'badge';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proposals</h1>
          <p className="text-gray-600 mt-2">Browse and vote on governance proposals</p>
        </div>
        <Link to="/proposals/create" className="btn btn-primary flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Create Proposal
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Search
            </label>
            <input
              type="text"
              placeholder="Search proposals..."
              className="input"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Status
            </label>
            <select
              className="input"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Active">Active</option>
              <option value="Passed">Passed</option>
              <option value="Rejected">Rejected</option>
              <option value="Executed">Executed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              className="input"
              value={filters.proposalType}
              onChange={(e) => setFilters({ ...filters, proposalType: e.target.value, page: 1 })}
            >
              <option value="">All Types</option>
              <option value="Treasury">Treasury</option>
              <option value="Governance">Governance</option>
              <option value="Technical">Technical</option>
              <option value="Climate">Climate</option>
            </select>
          </div>
        </div>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="card">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded loading-shimmer"></div>
              ))}
            </div>
          </div>
        ) : (
          data?.proposals?.map((proposal) => (
            <Link
              key={proposal.proposalId}
              to={`/proposals/${proposal.proposalId}`}
              className="card hover:shadow-lg transition-shadow block"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={getStatusBadge(proposal.status)}>{proposal.status}</span>
                    <span className="text-xs text-gray-500">{proposal.proposalType}</span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{proposal.title}</h3>
                  <p className="text-gray-600 line-clamp-2 mb-3">{proposal.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">For:</span> {proposal.votesFor}
                    </div>
                    <div>
                      <span className="font-medium">Against:</span> {proposal.votesAgainst}
                    </div>
                    <div>
                      <span className="font-medium">Voters:</span> {proposal.totalVoters}
                    </div>
                    {proposal.requestedAmount > 0 && (
                      <div>
                        <span className="font-medium">Amount:</span> ${proposal.requestedAmount.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Analysis Badge */}
                {proposal.riskScore !== null && (
                  <div className="ml-6 text-center min-w-[80px]">
                    <div
                      className={`text-3xl font-bold ${
                        proposal.riskScore < 40
                          ? 'text-green-600'
                          : proposal.riskScore < 70
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    >
                      {proposal.riskScore}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Risk Score</div>
                    {proposal.recommendedAction && (
                      <div className="text-xs font-medium text-gray-700 mt-2">
                        AI: {proposal.recommendedAction}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          {[...Array(data.totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setFilters({ ...filters, page: i + 1 })}
              className={`px-4 py-2 rounded-lg ${
                filters.page === i + 1
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Proposals;

