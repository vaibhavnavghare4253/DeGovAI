import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import toast from 'react-hot-toast';
import { ArrowLeft, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { proposalAPI } from '../services/api';

const CreateProposal = () => {
  const navigate = useNavigate();
  const { address } = useAccount();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    proposalType: 'Treasury',
    requestedAmount: '',
    recipientAddress: '',
  });

  const createMutation = useMutation({
    mutationFn: (data) => proposalAPI.create(data),
    onSuccess: (data) => {
      toast.success('Proposal created successfully!');
      navigate(`/proposals/${data.proposalId}`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create proposal');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    createMutation.mutate({
      ...formData,
      walletAddress: address,
      requestedAmount: parseFloat(formData.requestedAmount) || 0,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/proposals" className="inline-flex items-center text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Proposals
      </Link>

      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Proposal</h1>
        <p className="text-gray-600 mb-8">
          Submit a proposal for community voting. AI agents will automatically analyze it.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proposal Title *
            </label>
            <input
              type="text"
              required
              className="input"
              placeholder="e.g., Fund Solar Panel Installation Project"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proposal Type *
            </label>
            <select
              required
              className="input"
              value={formData.proposalType}
              onChange={(e) => setFormData({ ...formData, proposalType: e.target.value })}
            >
              <option value="Treasury">Treasury - Fund Allocation</option>
              <option value="Governance">Governance - DAO Rules</option>
              <option value="Technical">Technical - System Upgrade</option>
              <option value="Climate">Climate - Environmental Impact</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              rows={8}
              className="input"
              placeholder="Provide detailed information about your proposal..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <p className="text-sm text-gray-500 mt-2">
              Tip: Include project goals, timeline, expected impact, and why this matters to the DAO
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requested Amount (USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input"
                placeholder="0.00"
                value={formData.requestedAmount}
                onChange={(e) => setFormData({ ...formData, requestedAmount: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                className="input"
                placeholder="0x..."
                value={formData.recipientAddress}
                onChange={(e) => setFormData({ ...formData, recipientAddress: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">📊 What happens next?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your proposal will be submitted to the blockchain</li>
              <li>• AI agents will automatically analyze it for risks and fraud</li>
              <li>• Community members can start voting immediately</li>
              <li>• Voting period lasts 7 days by default</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-4">
            <Link to="/proposals" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn btn-primary flex items-center"
            >
              {createMutation.isPending ? (
                'Creating...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Create Proposal
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProposal;

