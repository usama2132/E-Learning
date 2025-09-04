import React, { useState, useEffect, useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { useTheme } from '../../context/ThemeContext';
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
  const { theme } = useTheme();

  // Dynamic styles based on theme
  const styles = useMemo(() => ({
    container: {
      padding: '16px',
      backgroundColor: theme === 'dark' ? '#0f172a' : '#f8fafc',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      transition: 'all 0.3s ease',
      '@media (min-width: 768px)': {
        padding: '24px'
      }
    },
    header: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      marginBottom: '20px',
      backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
      padding: '16px',
      borderRadius: '12px',
      boxShadow: theme === 'dark' 
        ? '0 1px 3px rgba(0, 0, 0, 0.3)' 
        : '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: theme === 'dark' ? '1px solid #334155' : 'none',
      '@media (min-width: 768px)': {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
        marginBottom: '24px'
      }
    },
    title: {
      fontSize: '20px',
      fontWeight: '600',
      color: theme === 'dark' ? '#f1f5f9' : '#1f2937',
      margin: 0,
      '@media (min-width: 768px)': {
        fontSize: '24px'
      }
    },
    button: {
      padding: '8px 14px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      outline: 'none',
      '@media (min-width: 768px)': {
        padding: '10px 16px'
      }
    },
    btnPrimary: {
      backgroundColor: theme === 'dark' ? '#3b82f6' : '#3b82f6',
      color: 'white'
    },
    btnSecondary: {
      backgroundColor: theme === 'dark' ? '#64748b' : '#6b7280',
      color: 'white'
    },
    btnWarning: {
      backgroundColor: theme === 'dark' ? '#f59e0b' : '#f59e0b',
      color: 'white'
    },
    btnOutline: {
      backgroundColor: 'transparent',
      color: theme === 'dark' ? '#94a3b8' : '#6b7280',
      border: `1px solid ${theme === 'dark' ? '#475569' : '#d1d5db'}`
    },
    btnSm: {
      padding: '4px 8px',
      fontSize: '12px',
      '@media (min-width: 768px)': {
        padding: '6px 12px'
      }
    },
    filters: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '12px',
      marginBottom: '20px',
      backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
      padding: '16px',
      borderRadius: '12px',
      boxShadow: theme === 'dark' 
        ? '0 1px 3px rgba(0, 0, 0, 0.3)' 
        : '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: theme === 'dark' ? '1px solid #334155' : 'none',
      '@media (min-width: 640px)': {
        gridTemplateColumns: 'repeat(2, 1fr)'
      },
      '@media (min-width: 768px)': {
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        padding: '20px',
        marginBottom: '24px'
      }
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: theme === 'dark' ? '#e2e8f0' : '#374151'
    },
    select: {
      padding: '8px 12px',
      border: `1px solid ${theme === 'dark' ? '#475569' : '#d1d5db'}`,
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: theme === 'dark' ? '#334155' : 'white',
      color: theme === 'dark' ? '#e2e8f0' : '#374151',
      transition: 'all 0.2s ease',
      outline: 'none'
    },
    searchInput: {
      padding: '8px 12px',
      border: `1px solid ${theme === 'dark' ? '#475569' : '#d1d5db'}`,
      borderRadius: '6px',
      fontSize: '14px',
      width: '100%',
      boxSizing: 'border-box',
      backgroundColor: theme === 'dark' ? '#334155' : 'white',
      color: theme === 'dark' ? '#e2e8f0' : '#374151',
      transition: 'all 0.2s ease',
      outline: 'none'
    },
    errorMessage: {
      backgroundColor: theme === 'dark' ? '#7f1d1d' : '#fef2f2',
      border: `1px solid ${theme === 'dark' ? '#dc2626' : '#fecaca'}`,
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      '@media (min-width: 768px)': {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        marginBottom: '24px'
      }
    },
    errorText: {
      color: theme === 'dark' ? '#fca5a5' : '#dc2626',
      margin: 0,
      fontSize: '14px'
    },
    tableContainer: {
      backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: theme === 'dark' 
        ? '0 1px 3px rgba(0, 0, 0, 0.3)' 
        : '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: theme === 'dark' ? '1px solid #334155' : 'none',
      marginBottom: '20px',
      overflowX: 'auto',
      '@media (min-width: 768px)': {
        marginBottom: '24px'
      }
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: '800px'
    },
    th: {
      backgroundColor: theme === 'dark' ? '#0f172a' : '#f9fafb',
      padding: '8px 12px',
      textAlign: 'left',
      fontSize: '11px',
      fontWeight: '600',
      color: theme === 'dark' ? '#cbd5e1' : '#374151',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      borderBottom: `1px solid ${theme === 'dark' ? '#334155' : '#e5e7eb'}`,
      cursor: 'pointer',
      userSelect: 'none',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      '@media (min-width: 768px)': {
        padding: '12px 16px',
        fontSize: '12px'
      }
    },
    td: {
      padding: '12px',
      borderBottom: `1px solid ${theme === 'dark' ? '#334155' : '#f3f4f6'}`,
      fontSize: '13px',
      color: theme === 'dark' ? '#e2e8f0' : '#374151',
      '@media (min-width: 768px)': {
        padding: '16px',
        fontSize: '14px'
      }
    },
    transactionId: {
      fontFamily: 'Monaco, Consolas, monospace',
      fontSize: '11px',
      backgroundColor: theme === 'dark' ? '#334155' : '#f3f4f6',
      padding: '4px 6px',
      borderRadius: '4px',
      color: theme === 'dark' ? '#94a3b8' : '#6b7280',
      '@media (min-width: 768px)': {
        fontSize: '12px',
        padding: '4px 8px'
      }
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      '@media (min-width: 768px)': {
        gap: '12px'
      }
    },
    userAvatar: {
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      objectFit: 'cover',
      '@media (min-width: 768px)': {
        width: '32px',
        height: '32px'
      }
    },
    userName: {
      fontWeight: '500',
      color: theme === 'dark' ? '#f1f5f9' : '#1f2937',
      fontSize: '13px',
      '@media (min-width: 768px)': {
        fontSize: '14px'
      }
    },
    userEmail: {
      fontSize: '11px',
      color: theme === 'dark' ? '#94a3b8' : '#6b7280',
      '@media (min-width: 768px)': {
        fontSize: '12px'
      }
    },
    courseInfo: {
      maxWidth: '150px',
      '@media (min-width: 768px)': {
        maxWidth: '200px'
      }
    },
    courseTitle: {
      fontWeight: '500',
      color: theme === 'dark' ? '#f1f5f9' : '#1f2937',
      marginBottom: '2px',
      fontSize: '13px',
      lineHeight: '1.3',
      '@media (min-width: 768px)': {
        fontSize: '14px'
      }
    },
    courseInstructor: {
      fontSize: '11px',
      color: theme === 'dark' ? '#94a3b8' : '#6b7280',
      '@media (min-width: 768px)': {
        fontSize: '12px'
      }
    },
    amount: {
      fontWeight: '600',
      fontSize: '14px',
      '@media (min-width: 768px)': {
        fontSize: '16px'
      }
    },
    positive: {
      color: theme === 'dark' ? '#34d399' : '#059669'
    },
    negative: {
      color: theme === 'dark' ? '#f87171' : '#dc2626'
    },
    statusBadge: {
      padding: '3px 6px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '500',
      textTransform: 'capitalize',
      '@media (min-width: 768px)': {
        padding: '4px 8px',
        fontSize: '12px'
      }
    },
    badgeSuccess: {
      backgroundColor: theme === 'dark' ? '#065f46' : '#d1fae5',
      color: theme === 'dark' ? '#34d399' : '#065f46'
    },
    badgeWarning: {
      backgroundColor: theme === 'dark' ? '#92400e' : '#fef3c7',
      color: theme === 'dark' ? '#fbbf24' : '#92400e'
    },
    badgeError: {
      backgroundColor: theme === 'dark' ? '#991b1b' : '#fee2e2',
      color: theme === 'dark' ? '#f87171' : '#991b1b'
    },
    badgeInfo: {
      backgroundColor: theme === 'dark' ? '#1e40af' : '#dbeafe',
      color: theme === 'dark' ? '#60a5fa' : '#1e40af'
    },
    badgeSecondary: {
      backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
      color: theme === 'dark' ? '#9ca3af' : '#6b7280'
    },
    typeBadge: {
      padding: '3px 6px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: '500',
      textTransform: 'capitalize',
      '@media (min-width: 768px)': {
        padding: '4px 8px',
        fontSize: '12px'
      }
    },
    typePurchase: {
      backgroundColor: theme === 'dark' ? '#065f46' : '#ecfdf5',
      color: theme === 'dark' ? '#34d399' : '#047857'
    },
    typeRefund: {
      backgroundColor: theme === 'dark' ? '#7f1d1d' : '#fef2f2',
      color: theme === 'dark' ? '#f87171' : '#dc2626'
    },
    typePayout: {
      backgroundColor: theme === 'dark' ? '#1e3a8a' : '#eff6ff',
      color: theme === 'dark' ? '#60a5fa' : '#2563eb'
    },
    typeWithdrawal: {
      backgroundColor: theme === 'dark' ? '#a16207' : '#fefce8',
      color: theme === 'dark' ? '#fbbf24' : '#ca8a04'
    },
    typeOther: {
      backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
      color: theme === 'dark' ? '#9ca3af' : '#6b7280'
    },
    actionButtons: {
      display: 'flex',
      gap: '4px',
      '@media (min-width: 768px)': {
        gap: '8px'
      }
    },
    noTransactions: {
      textAlign: 'center',
      padding: '32px 16px',
      backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
      borderRadius: '12px',
      boxShadow: theme === 'dark' 
        ? '0 1px 3px rgba(0, 0, 0, 0.3)' 
        : '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: theme === 'dark' ? '1px solid #334155' : 'none',
      '@media (min-width: 768px)': {
        padding: '48px 24px'
      }
    },
    noTransactionsIcon: {
      fontSize: '40px',
      color: theme === 'dark' ? '#475569' : '#d1d5db',
      marginBottom: '12px',
      '@media (min-width: 768px)': {
        fontSize: '48px',
        marginBottom: '16px'
      }
    },
    noTransactionsTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: theme === 'dark' ? '#e2e8f0' : '#374151',
      marginBottom: '6px',
      '@media (min-width: 768px)': {
        fontSize: '18px',
        marginBottom: '8px'
      }
    },
    noTransactionsText: {
      color: theme === 'dark' ? '#94a3b8' : '#6b7280',
      fontSize: '13px',
      '@media (min-width: 768px)': {
        fontSize: '14px'
      }
    },
    summary: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '12px',
      marginTop: '20px',
      '@media (min-width: 640px)': {
        gridTemplateColumns: 'repeat(2, 1fr)'
      },
      '@media (min-width: 768px)': {
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginTop: '24px'
      }
    },
    summaryCard: {
      backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
      padding: '16px',
      borderRadius: '12px',
      boxShadow: theme === 'dark' 
        ? '0 1px 3px rgba(0, 0, 0, 0.3)' 
        : '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: theme === 'dark' ? '1px solid #334155' : 'none',
      textAlign: 'center',
      '@media (min-width: 768px)': {
        padding: '20px'
      }
    },
    summaryTitle: {
      fontSize: '13px',
      fontWeight: '500',
      color: theme === 'dark' ? '#94a3b8' : '#6b7280',
      marginBottom: '6px',
      margin: 0,
      '@media (min-width: 768px)': {
        fontSize: '14px',
        marginBottom: '8px'
      }
    },
    summaryValue: {
      fontSize: '20px',
      fontWeight: '700',
      color: theme === 'dark' ? '#f1f5f9' : '#1f2937',
      margin: 0,
      '@media (min-width: 768px)': {
        fontSize: '24px'
      }
    },
    sortAsc: {
      position: 'relative'
    },
    sortDesc: {
      position: 'relative'
    }
  }), [theme]);

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
    filters,
    theme
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
            <small style={{ color: theme === 'dark' ? '#94a3b8' : '#6b7280' }}>
              Check the browser console for more details.
            </small>
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