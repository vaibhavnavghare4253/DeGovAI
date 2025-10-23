import { useQuery } from '@tanstack/react-query';
import { Wallet, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { treasuryAPI } from '../services/api';

const Treasury = () => {
  const { data: treasury, isLoading } = useQuery({
    queryKey: ['treasury-status'],
    queryFn: () => treasuryAPI.getStatus(),
  });

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3 loading-shimmer"></div>
          <div className="h-32 bg-gray-200 rounded loading-shimmer"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Treasury</h1>
        <p className="text-gray-600 mt-2">DAO treasury management and fund allocation</p>
      </div>

      {/* Treasury Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Balance</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {treasury?.currentBalance?.toFixed(4) || '0.00'} ETH
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Wallet className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Deposits</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {treasury?.totalDeposits?.toFixed(4) || '0.00'} ETH
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Allocated</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {treasury?.totalAllocations?.toFixed(4) || '0.00'} ETH
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingDown className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {treasury?.totalTransactions || 0}
              </p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Transactions</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">From/To</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {treasury?.recentTransactions?.map((tx) => (
                <tr key={tx.transactionId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <span className={`badge ${
                      tx.transactionType === 'Deposit' ? 'badge-success' :
                      tx.transactionType === 'Withdrawal' ? 'badge-danger' :
                      'badge-info'
                    }`}>
                      {tx.transactionType}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-medium">{tx.amount} ETH</td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {tx.toAddress ? `${tx.toAddress.slice(0, 6)}...${tx.toAddress.slice(-4)}` : '-'}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`badge ${
                      tx.status === 'Confirmed' ? 'badge-success' :
                      tx.status === 'Failed' ? 'badge-danger' :
                      'badge-warning'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!treasury?.recentTransactions?.length && (
            <div className="text-center py-12 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No transactions yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Allocations by Type */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Allocations by Type</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {treasury?.allocationsByType?.map((allocation) => (
            <div key={allocation.proposalType} className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{allocation.proposalType}</h3>
              <p className="text-2xl font-bold text-primary-600 mb-1">
                {allocation.totalAllocated.toFixed(2)} ETH
              </p>
              <p className="text-sm text-gray-600">
                {allocation.proposalCount} proposals
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Avg: {allocation.averageAmount.toFixed(2)} ETH
              </p>
            </div>
          ))}
        </div>

        {!treasury?.allocationsByType?.length && (
          <div className="text-center py-8 text-gray-500">
            <p>No allocations yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Treasury;

