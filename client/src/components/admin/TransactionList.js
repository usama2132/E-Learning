import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import Loading from '../common/Loading';
import Pagination from '../common/Pagination';

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    dateRange: '30days',
    search: ''
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const { get } = useApi();

  // Styles object
  const styles = {
    container: {
      padding: '24px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#1f2937',
      margin: 0
    },
    button: {
      padding: '10px 16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease'
    },
    btnPrimary: {
      backgroundColor: '#3b82f6',
      color: 'white'
    },
    btnSecondary: {
      backgroundColor: '#6b7280',
      color: 'white'
    },
    btnWarning: {
      backgroundColor: '#f59e0b',
      color: 'white'
    },
    btnOutline: {
      backgroundColor: 'transparent',
      color: '#6b7280',
      border: '1px solid #d1d5db'
    },
    btnSm: {
      padding: '6px 12px',
      fontSize: '12px'
    },
    filters: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px',
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151'
    },
    select: {
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: 'white',
      color: '#374151'
    },
    searchInput: {
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      width: '100%',
      boxSizing: 'border-box'
    },
    errorMessage: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    errorText: {
      color: '#dc2626',
      margin: 0
    },
    tableContainer: {
      backgroundColor: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      marginBottom: '24px'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      backgroundColor: '#f9fafb',
      padding: '12px 16px',
      textAlign: 'left',
      fontSize: '12px',
      fontWeight: '600',
      color: '#374151',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      borderBottom: '1px solid #e5e7eb',
      cursor: 'pointer',
      userSelect: 'none'
    },
    td: {
      padding: '16px',
      borderBottom: '1px solid #f3f4f6',
      fontSize: '14px',
      color: '#374151'
    },
    transactionId: {
      fontFamily: 'Monaco, Consolas, monospace',
      fontSize: '12px',
      backgroundColor: '#f3f4f6',
      padding: '4px 8px',
      borderRadius: '4px',
      color: '#6b7280'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    userAvatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      objectFit: 'cover'
    },
    userName: {
      fontWeight: '500',
      color: '#1f2937'
    },
    userEmail: {
      fontSize: '12px',
      color: '#6b7280'
    },
    courseInfo: {
      maxWidth: '200px'
    },
    courseTitle: {
      fontWeight: '500',
      color: '#1f2937',
      marginBottom: '2px'
    },
    courseInstructor: {
      fontSize: '12px',
      color: '#6b7280'
    },
    amount: {
      fontWeight: '600',
      fontSize: '16px'
    },
    positive: {
      color: '#059669'
    },
    negative: {
      color: '#dc2626'
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      textTransform: 'capitalize'
    },
    badgeSuccess: {
      backgroundColor: '#d1fae5',
      color: '#065f46'
    },
    badgeWarning: {
      backgroundColor: '#fef3c7',
      color: '#92400e'
    },
    badgeError: {
      backgroundColor: '#fee2e2',
      color: '#991b1b'
    },
    badgeInfo: {
      backgroundColor: '#dbeafe',
      color: '#1e40af'
    },
    badgeSecondary: {
      backgroundColor: '#f3f4f6',
      color: '#6b7280'
    },
    typeBadge: {
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '500',
      textTransform: 'capitalize'
    },
    typePurchase: {
      backgroundColor: '#ecfdf5',
      color: '#047857'
    },
    typeRefund: {
      backgroundColor: '#fef2f2',
      color: '#dc2626'
    },
    typePayout: {
      backgroundColor: '#eff6ff',
      color: '#2563eb'
    },
    typeWithdrawal: {
      backgroundColor: '#fefce8',
      color: '#ca8a04'
    },
    typeOther: {
      backgroundColor: '#f3f4f6',
      color: '#6b7280'
    },
    actionButtons: {
      display: 'flex',
      gap: '8px'
    },
    noTransactions: {
      textAlign: 'center',
      padding: '48px 24px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    noTransactionsIcon: {
      fontSize: '48px',
      color: '#d1d5db',
      marginBottom: '16px'
    },
    noTransactionsTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px'
    },
    noTransactionsText: {
      color: '#6b7280',
      fontSize: '14px'
    },
    summary: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginTop: '24px'
    },
    summaryCard: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      textAlign: 'center'
    },
    summaryTitle: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#6b7280',
      marginBottom: '8px',
      margin: 0
    },
    summaryValue: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#1f2937',
      margin: 0
    },
    sortAsc: {
      position: 'relative'
    },
    sortDesc: {
      position: 'relative'
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, filters, sortBy, sortOrder]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage.toString(),
        limit: '20',
        sortBy,
        sortOrder
      };

      if (filters.status && filters.status !== 'all') {
        params.status = filters.status;
      }
      if (filters.type && filters.type !== 'all') {
        params.type = filters.type;
      }
      if (filters.dateRange) {
        params.dateRange = filters.dateRange;
      }
      if (filters.search && filters.search.trim()) {
        params.search = filters.search.trim();
      }

      const queryParams = new URLSearchParams(params);
      console.log('Making API call to:', `/admin/transactions?${queryParams}`);
      
      const response = await get(`/admin/transactions?${queryParams}`);
      
      if (!response) {
        throw new Error('No response received from server');
      }
      
      if (response.error) {
        throw new Error(response.error);
      }

      const transactionsData = response.data?.transactions || response.transactions || [];
      const totalPagesData = response.data?.totalPages || response.totalPages || 1;
      
      setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
      setTotalPages(totalPagesData);
      
      console.log('Transactions loaded:', transactionsData.length);
      
    } catch (err) {
      console.error('Error fetching transactions:', err);
      
      let errorMessage = 'Failed to fetch transactions';
      
      if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status) {
        switch (err.response.status) {
          case 401:
            errorMessage = 'Unauthorized. Please log in again.';
            break;
          case 403:
            errorMessage = 'Access denied. You don\'t have permission to view transactions.';
            break;
          case 404:
            errorMessage = 'Transaction endpoint not found.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = `HTTP ${err.response.status}: Failed to fetch transactions`;
        }
      } else if (err.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
      setTransactions([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    console.log(`Filter changed: ${filterType} = ${value}`);
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setCurrentPage(1);
  };

  const handleSort = (column) => {
    console.log(`Sort changed: ${column}`);
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const formatAmount = (amount, currency = 'USD') => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
      }).format(amount || 0);
    } catch (err) {
      return `${currency} ${amount || 0}`;
    }
  };

  const formatDate = (date) => {
    try {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Invalid Date';
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    
    const statusStyles = {
      completed: { ...styles.statusBadge, ...styles.badgeSuccess },
      pending: { ...styles.statusBadge, ...styles.badgeWarning },
      failed: { ...styles.statusBadge, ...styles.badgeError },
      refunded: { ...styles.statusBadge, ...styles.badgeInfo },
      cancelled: { ...styles.statusBadge, ...styles.badgeSecondary }
    };

    return (
      <span style={statusStyles[status] || { ...styles.statusBadge, ...styles.badgeSecondary }}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    if (!type) return null;
    
    const typeStyles = {
      purchase: { ...styles.typeBadge, ...styles.typePurchase },
      refund: { ...styles.typeBadge, ...styles.typeRefund },
      payout: { ...styles.typeBadge, ...styles.typePayout },
      withdrawal: { ...styles.typeBadge, ...styles.typeWithdrawal }
    };

    return (
      <span style={typeStyles[type] || { ...styles.typeBadge, ...styles.typeOther }}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const exportTransactions = async () => {
    try {
      setError(null);
      
      const params = {};
      
      if (filters.status && filters.status !== 'all') {
        params.status = filters.status;
      }
      if (filters.type && filters.type !== 'all') {
        params.type = filters.type;
      }
      if (filters.dateRange) {
        params.dateRange = filters.dateRange;
      }
      if (filters.search && filters.search.trim()) {
        params.search = filters.search.trim();
      }
      
      params.export = 'csv';
      
      const queryParams = new URLSearchParams(params);
      console.log('Exporting transactions:', `/admin/transactions/export?${queryParams}`);
      
      const response = await get(`/admin/transactions/export?${queryParams}`);
      
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Error exporting transactions:', err);
      setError('Failed to export transactions. Please try again.');
    }
  };

  const retryFetch = () => {
    console.log('Retrying fetch...');
    fetchTransactions();
  };

  console.log('Current state:', {
    loading,
    error,
    transactionsCount: transactions.length,
    currentPage,
    totalPages,
    filters
  });

  if (loading) return <Loading />;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Transaction Management</h2>
        <button 
          style={{ ...styles.button, ...styles.btnSecondary }}
          onClick={exportTransactions}
          disabled={loading}
        >
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <label style={styles.label}>Status:</label>
          <select
            style={styles.select}
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.label}>Type:</label>
          <select
            style={styles.select}
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="purchase">Purchase</option>
            <option value="refund">Refund</option>
            <option value="payout">Payout</option>
            <option value="withdrawal">Withdrawal</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.label}>Date Range:</label>
          <select
            style={styles.select}
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="6months">Last 6 months</option>
            <option value="1year">Last year</option>
            <option value="all">All time</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <input
            type="text"
            placeholder="Search by transaction ID, user, or course..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {error && (
        <div style={styles.errorMessage}>
          <div>
            <p style={styles.errorText}>{error}</p>
            <small>Check the browser console for more details.</small>
          </div>
          <button 
            onClick={retryFetch} 
            style={{ ...styles.button, ...styles.btnPrimary, ...styles.btnSm }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Transaction Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th 
                style={{
                  ...styles.th,
                  ...(sortBy === 'transactionId' ? styles[`sort${sortOrder === 'asc' ? 'Asc' : 'Desc'}`] : {})
                }}
                onClick={() => handleSort('transactionId')}
              >
                Transaction ID
              </th>
              <th 
                style={{
                  ...styles.th,
                  ...(sortBy === 'user' ? styles[`sort${sortOrder === 'asc' ? 'Asc' : 'Desc'}`] : {})
                }}
                onClick={() => handleSort('user')}
              >
                User
              </th>
              <th 
                style={{
                  ...styles.th,
                  ...(sortBy === 'course' ? styles[`sort${sortOrder === 'asc' ? 'Asc' : 'Desc'}`] : {})
                }}
                onClick={() => handleSort('course')}
              >
                Course
              </th>
              <th 
                style={{
                  ...styles.th,
                  ...(sortBy === 'amount' ? styles[`sort${sortOrder === 'asc' ? 'Asc' : 'Desc'}`] : {})
                }}
                onClick={() => handleSort('amount')}
              >
                Amount
              </th>
              <th 
                style={{
                  ...styles.th,
                  ...(sortBy === 'type' ? styles[`sort${sortOrder === 'asc' ? 'Asc' : 'Desc'}`] : {})
                }}
                onClick={() => handleSort('type')}
              >
                Type
              </th>
              <th 
                style={{
                  ...styles.th,
                  ...(sortBy === 'status' ? styles[`sort${sortOrder === 'asc' ? 'Asc' : 'Desc'}`] : {})
                }}
                onClick={() => handleSort('status')}
              >
                Status
              </th>
              <th 
                style={{
                  ...styles.th,
                  ...(sortBy === 'createdAt' ? styles[`sort${sortOrder === 'asc' ? 'Asc' : 'Desc'}`] : {})
                }}
                onClick={() => handleSort('createdAt')}
              >
                Date
              </th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id || transaction._id}>
                <td style={styles.td}>
                  <code style={styles.transactionId}>
                    {transaction.transactionId || transaction.id || 'N/A'}
                  </code>
                </td>
                <td style={styles.td}>
                  <div style={styles.userInfo}>
                    <img 
                      src={transaction.user?.avatar || '/default-avatar.png'} 
                      alt={transaction.user?.name || 'User'}
                      style={styles.userAvatar}
                      onError={(e) => {
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                    <div>
                      <div style={styles.userName}>{transaction.user?.name || 'Unknown User'}</div>
                      <div style={styles.userEmail}>{transaction.user?.email || 'No email'}</div>
                    </div>
                  </div>
                </td>
                <td style={styles.td}>
                  {transaction.course ? (
                    <div style={styles.courseInfo}>
                      <div style={styles.courseTitle}>{transaction.course.title}</div>
                      <div style={styles.courseInstructor}>by {transaction.course.instructor}</div>
                    </div>
                  ) : (
                    <span>N/A</span>
                  )}
                </td>
                <td style={{ ...styles.td, ...styles.amount }}>
                  <span style={transaction.type === 'refund' ? styles.negative : styles.positive}>
                    {transaction.type === 'refund' ? '-' : ''}
                    {formatAmount(transaction.amount, transaction.currency)}
                  </span>
                </td>
                <td style={styles.td}>{getTypeBadge(transaction.type)}</td>
                <td style={styles.td}>{getStatusBadge(transaction.status)}</td>
                <td style={styles.td}>{formatDate(transaction.createdAt)}</td>
                <td style={styles.td}>
                  <div style={styles.actionButtons}>
                    <button 
                      style={{ ...styles.button, ...styles.btnOutline, ...styles.btnSm }}
                      onClick={() => {
                        console.log('View transaction:', transaction.id);
                      }}
                      title="View Details"
                    >
                      👁️
                    </button>
                    {transaction.status === 'completed' && transaction.type === 'purchase' && (
                      <button 
                        style={{ ...styles.button, ...styles.btnWarning, ...styles.btnSm }}
                        onClick={() => {
                          console.log('Process refund:', transaction.id);
                        }}
                        title="Process Refund"
                      >
                        ↩️
                      </button>
                    )}
                    <button 
                      style={{ ...styles.button, ...styles.btnSecondary, ...styles.btnSm }}
                      onClick={() => {
                        console.log('Download receipt:', transaction.id);
                      }}
                      title="Download Receipt"
                    >
                      📥
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {transactions.length === 0 && !loading && !error && (
        <div style={styles.noTransactions}>
          <div style={styles.noTransactionsIcon}>🧾</div>
          <h3 style={styles.noTransactionsTitle}>No transactions found</h3>
          <p style={styles.noTransactionsText}>No transactions match your current filters.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Transaction Summary */}
      {transactions.length > 0 && (
        <div style={styles.summary}>
          <div style={styles.summaryCard}>
            <h4 style={styles.summaryTitle}>Total Transactions</h4>
            <p style={styles.summaryValue}>{transactions.length}</p>
          </div>
          <div style={styles.summaryCard}>
            <h4 style={styles.summaryTitle}>Total Revenue</h4>
            <p style={styles.summaryValue}>
              {formatAmount(
                transactions
                  .filter(t => t.type === 'purchase' && t.status === 'completed')
                  .reduce((sum, t) => sum + (t.amount || 0), 0)
              )}
            </p>
          </div>
          <div style={styles.summaryCard}>
            <h4 style={styles.summaryTitle}>Total Refunds</h4>
            <p style={{ ...styles.summaryValue, ...styles.negative }}>
              {formatAmount(
                transactions
                  .filter(t => t.type === 'refund' && t.status === 'completed')
                  .reduce((sum, t) => sum + (t.amount || 0), 0)
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;