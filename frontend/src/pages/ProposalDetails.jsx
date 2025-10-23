import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  ThumbsUp, 
  ThumbsDown, 
  MinusCircle,
  Bot,
  Clock,
  User,
  DollarSign,
  FileText
} from 'lucide-react';
import { proposalAPI, voteAPI, aiAnalysisAPI } from '../services/api';

const ProposalDetails = () => {
  const { id } = useParams();
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const [selectedVote, setSelectedVote] = useState('');

  const { data: proposal, isLoading } = useQuery({
    queryKey: ['proposal', id],
    queryFn: () => proposalAPI.getById(id),
  });

  const voteMutation = useMutation({
    mutationFn: (voteData) => voteAPI.cast(voteData),
    onSuccess: () => {
      toast.success('Vote cast successfully!');
      queryClient.invalidateQueries(['proposal', id]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cast vote');
    },
  });

  const handleVote = async () => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!selectedVote) {
      toast.error('Please select a vote option');
      return;
    }

    voteMutation.mutate({
      proposalId: parseInt(id),
      walletAddress: address,
      voteType: selectedVote,
      votingPower: 100, // TODO: Get actual voting power from token balance
      isAIVote: false,
    });
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4 loading-shimmer"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 loading-shimmer"></div>
          <div className="h-32 bg-gray-200 rounded loading-shimmer"></div>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="card text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Proposal Not Found</h2>
        <p className="text-gray-600 mb-6">The proposal you're looking for doesn't exist.</p>
        <Link to="/proposals" className="btn btn-primary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Proposals
        </Link>
      </div>
    );
  }

  const aiAnalysis = proposal.aiAnalyses?.[0];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/proposals" className="inline-flex items-center text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Proposals
      </Link>

      {/* Proposal Header */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <span className={`badge ${
                proposal.status === 'Passed' ? 'badge-success' :
                proposal.status === 'Rejected' ? 'badge-danger' :
                'badge-warning'
              }`}>
                {proposal.status}
              </span>
              <span className="text-sm text-gray-500">{proposal.proposalType}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{proposal.title}</h1>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                {proposal.submitterName || `${proposal.submitterAddress.slice(0, 6)}...${proposal.submitterAddress.slice(-4)}`}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {new Date(proposal.createdAt).toLocaleDateString()}
              </div>
              {proposal.requestedAmount > 0 && (
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  ${proposal.requestedAmount.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{proposal.description}</p>
        </div>
      </div>

      {/* AI Analysis */}
      {aiAnalysis && (
        <div className="card bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <div className="flex items-center space-x-2 mb-4">
            <Bot className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">AI Analysis</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Risk Score</div>
              <div className={`text-3xl font-bold ${
                aiAnalysis.riskScore < 40 ? 'text-green-600' :
                aiAnalysis.riskScore < 70 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {aiAnalysis.riskScore}/100
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Fraud Probability</div>
              <div className={`text-3xl font-bold ${
                aiAnalysis.fraudProbability < 30 ? 'text-green-600' :
                aiAnalysis.fraudProbability < 60 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {aiAnalysis.fraudProbability}/100
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Confidence Level</div>
              <div className="text-3xl font-bold text-blue-600">
                {aiAnalysis.confidenceLevel}%
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="font-semibold text-gray-900 mb-2">Recommendation: {aiAnalysis.recommendedAction}</div>
            <div className="text-sm text-gray-700 whitespace-pre-wrap">{aiAnalysis.keyInsights}</div>
          </div>
        </div>
      )}

      {/* Voting */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vote Casting */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Cast Your Vote</h2>
          
          <div className="space-y-3 mb-4">
            <button
              onClick={() => setSelectedVote('For')}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                selectedVote === 'For'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ThumbsUp className="w-5 h-5 text-green-600 mr-3" />
                  <span className="font-medium">Vote For</span>
                </div>
              </div>
            </button>

            <button
              onClick={() => setSelectedVote('Against')}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                selectedVote === 'Against'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ThumbsDown className="w-5 h-5 text-red-600 mr-3" />
                  <span className="font-medium">Vote Against</span>
                </div>
              </div>
            </button>

            <button
              onClick={() => setSelectedVote('Abstain')}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                selectedVote === 'Abstain'
                  ? 'border-gray-500 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MinusCircle className="w-5 h-5 text-gray-600 mr-3" />
                  <span className="font-medium">Abstain</span>
                </div>
              </div>
            </button>
          </div>

          <button
            onClick={handleVote}
            disabled={!selectedVote || voteMutation.isPending}
            className="btn btn-primary w-full"
          >
            {voteMutation.isPending ? 'Submitting...' : 'Submit Vote'}
          </button>
        </div>

        {/* Voting Results */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Voting Results</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium text-green-600">For</span>
                <span className="font-bold">{proposal.votesFor}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${(proposal.votesFor / Math.max(proposal.totalVotingPower, 1)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium text-red-600">Against</span>
                <span className="font-bold">{proposal.votesAgainst}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-red-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${(proposal.votesAgainst / Math.max(proposal.totalVotingPower, 1)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium text-gray-600">Abstain</span>
                <span className="font-bold">{proposal.votesAbstain}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gray-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${(proposal.votesAbstain / Math.max(proposal.totalVotingPower, 1)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Voters</span>
              <span className="font-bold">{proposal.totalVoters}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-600">Total Voting Power</span>
              <span className="font-bold">{proposal.totalVotingPower}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalDetails;

