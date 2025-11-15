import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { promotionsAPI } from '../services/api';
import { Search, Filter, Plus, Eye, Edit, Trash2, CheckCircle, XCircle, Tag, Calendar, Percent, Users } from 'lucide-react';

const Promotions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    type: ''
  });
  const queryClient = useQueryClient();

  const { data: promotionsResponse, isLoading, error } = useQuery(
    ['promotions', { search: searchTerm, ...filters }], 
    () => promotionsAPI.getPromotions({ search: searchTerm, ...filters })
  );

  const deleteMutation = useMutation(promotionsAPI.deletePromotion, {
    onSuccess: () => {
      queryClient.invalidateQueries(['promotions']);
    },
    onError: (error) => {
      alert(`Error deleting promotion: ${error.response?.data?.detail || 'Unknown error'}`);
    }
  });

  const activateMutation = useMutation(promotionsAPI.activatePromotion, {
    onSuccess: () => {
      queryClient.invalidateQueries(['promotions']);
    },
    onError: (error) => {
      alert(`Error activating promotion: ${error.response?.data?.detail || 'Unknown error'}`);
    }
  });

  const deactivateMutation = useMutation(promotionsAPI.deactivatePromotion, {
    onSuccess: () => {
      queryClient.invalidateQueries(['promotions']);
    },
    onError: (error) => {
      alert(`Error deactivating promotion: ${error.response?.data?.detail || 'Unknown error'}`);
    }
  });

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      fontFamily: "'Poppins', sans-serif",
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: 0,
      fontFamily: "'Poppins', sans-serif",
    },
    addButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#004aad',
      color: 'white',
      border: 'none',
      padding: '10px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      fontFamily: "'Poppins', sans-serif",
      transition: 'background-color 0.2s',
    },
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '16px',
    },
    statCard: {
      backgroundColor: 'white',
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      textAlign: 'center',
    },
    statValue: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#004aad',
      margin: '0 0 4px 0',
    },
    statLabel: {
      fontSize: '0.875rem',
      color: '#6b7280',
      margin: 0,
    },
    searchContainer: {
      backgroundColor: 'white',
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    searchRow: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    searchInputContainer: {
      position: 'relative',
      flex: 1,
    },
    searchIcon: {
      position: 'absolute',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af',
      width: '16px',
      height: '16px',
    },
    searchInput: {
      width: '100%',
      paddingLeft: '36px',
      paddingRight: '16px',
      paddingTop: '8px',
      paddingBottom: '8px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '0.875rem',
      fontFamily: "'Poppins', sans-serif",
      outline: 'none',
    },
    filtersContainer: {
      display: 'flex',
      gap: '16px',
      flexWrap: 'wrap',
    },
    select: {
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '0.875rem',
      fontFamily: "'Poppins', sans-serif",
      outline: 'none',
      backgroundColor: 'white',
      minWidth: '150px',
    },
    errorContainer: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#dc2626',
      padding: '12px 16px',
      borderRadius: '6px',
    },
    tableContainer: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      overflow: 'hidden',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    tableHeader: {
      backgroundColor: '#f9fafb',
    },
    tableHeaderCell: {
      padding: '12px 16px',
      textAlign: 'left',
      fontSize: '0.75rem',
      fontWeight: '600',
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontFamily: "'Poppins', sans-serif",
    },
    tableRow: {
      borderBottom: '1px solid #e5e7eb',
      transition: 'background-color 0.2s',
    },
    tableCell: {
      padding: '16px',
      fontSize: '0.875rem',
      color: '#1f2937',
      fontFamily: "'Poppins', sans-serif",
    },
    loadingCell: {
      padding: '32px 16px',
      textAlign: 'center',
    },
    spinner: {
      animation: 'spin 1s linear infinite',
      border: '2px solid #e5e7eb',
      borderTop: '2px solid #004aad',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      margin: '0 auto',
    },
    emptyCell: {
      padding: '32px 16px',
      textAlign: 'center',
      color: '#6b7280',
    },
    badge: {
      padding: '4px 8px',
      fontSize: '0.75rem',
      borderRadius: '9999px',
      fontWeight: '500',
      display: 'inline-block',
    },
    statusBadge: {
      active: { backgroundColor: '#dcfce7', color: '#166534' },
      inactive: { backgroundColor: '#fecaca', color: '#dc2626' },
      scheduled: { backgroundColor: '#dbeafe', color: '#1d4ed8' },
      expired: { backgroundColor: '#f3f4f6', color: '#374151' },
    },
    typeBadge: {
      percentage: { backgroundColor: '#f0f9ff', color: '#0369a1' },
      fixed: { backgroundColor: '#f0fdf4', color: '#15803d' },
      free_shipping: { backgroundColor: '#fffbeb', color: '#d97706' },
      bogo: { backgroundColor: '#faf5ff', color: '#7c3aed' },
    },
    actionsContainer: {
      display: 'flex',
      gap: '8px',
    },
    actionButton: {
      padding: '6px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    viewButton: {
      color: '#2563eb',
    },
    editButton: {
      color: '#059669',
    },
    activateButton: {
      color: '#16a34a',
    },
    deactivateButton: {
      color: '#dc2626',
    },
    deleteButton: {
      color: '#991b1b',
    },
    promotionInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    promotionIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '6px',
      backgroundColor: '#f0f9ff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#004aad',
    },
    promotionDetails: {
      display: 'flex',
      flexDirection: 'column',
    },
    promotionName: {
      fontWeight: '500',
      color: '#1f2937',
      margin: 0,
    },
    promotionCode: {
      fontSize: '0.75rem',
      color: '#6b7280',
      margin: 0,
    },
    discountInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontWeight: '600',
    },
    discountValue: {
      color: '#059669',
    },
    dateInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
    },
    dateItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '0.75rem',
      color: '#6b7280',
    },
    usageInfo: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2px',
    },
    usageValue: {
      fontWeight: '600',
      color: '#004aad',
    },
    usageLabel: {
      fontSize: '0.7rem',
      color: '#6b7280',
    },
  };

  const columns = [
    {
      key: 'promotion',
      header: 'Promotion',
      render: (promotion) => (
        <div style={styles.promotionInfo}>
          <div style={styles.promotionIcon}>
            <Tag size={20} />
          </div>
          <div style={styles.promotionDetails}>
            <p style={styles.promotionName}>{promotion.name || 'Unnamed Promotion'}</p>
            <p style={styles.promotionCode}>Code: {promotion.code || 'N/A'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'discount',
      header: 'Discount',
      render: (promotion) => (
        <div style={styles.discountInfo}>
          {promotion.type === 'percentage' ? (
            <>
              <Percent size={14} />
              <span style={styles.discountValue}>{promotion.discount_value}%</span>
            </>
          ) : promotion.type === 'fixed' ? (
            <>
              <span style={styles.discountValue}>${promotion.discount_value}</span>
              <span>off</span>
            </>
          ) : (
            <span style={styles.discountValue}>{promotion.type?.replace('_', ' ')}</span>
          )}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (promotion) => (
        <span style={{ 
          ...styles.badge, 
          ...styles.typeBadge[promotion.type] || styles.typeBadge.percentage 
        }}>
          {promotion.type?.replace('_', ' ') || 'percentage'}
        </span>
      ),
    },
    {
      key: 'dates',
      header: 'Validity',
      render: (promotion) => (
        <div style={styles.dateInfo}>
          <div style={styles.dateItem}>
            <Calendar size={10} />
            Start: {new Date(promotion.start_date).toLocaleDateString()}
          </div>
          <div style={styles.dateItem}>
            <Calendar size={10} />
            End: {new Date(promotion.end_date).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      key: 'usage',
      header: 'Usage',
      render: (promotion) => (
        <div style={styles.usageInfo}>
          <div style={styles.usageValue}>
            {promotion.usage_count || 0}/{promotion.usage_limit || '∞'}
          </div>
          <div style={styles.usageLabel}>Used/Limit</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (promotion) => {
        const now = new Date();
        const startDate = new Date(promotion.start_date);
        const endDate = new Date(promotion.end_date);
        
        let status = promotion.status;
        if (now < startDate) status = 'scheduled';
        else if (now > endDate) status = 'expired';
        
        return (
          <span style={{ 
            ...styles.badge, 
            ...styles.statusBadge[status?.toLowerCase()] || styles.statusBadge.inactive 
          }}>
            {status}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (promotion) => {
        const now = new Date();
        const startDate = new Date(promotion.start_date);
        const endDate = new Date(promotion.end_date);
        const isActive = promotion.status === 'active' && now >= startDate && now <= endDate;
        
        return (
          <div style={styles.actionsContainer}>
            <button
              onClick={() => {
                // View promotion details
                console.log('View promotion:', promotion);
              }}
              style={{ ...styles.actionButton, ...styles.viewButton }}
              title="View promotion details"
              onMouseEnter={(e) => e.target.style.backgroundColor = '#dbeafe'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <Eye size={16} />
            </button>
            
            <button
              onClick={() => {
                // Edit promotion
                console.log('Edit promotion:', promotion);
              }}
              style={{ ...styles.actionButton, ...styles.editButton }}
              title="Edit promotion"
              onMouseEnter={(e) => e.target.style.backgroundColor = '#dcfce7'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <Edit size={16} />
            </button>
            
            {!isActive && now <= endDate && (
              <button
                onClick={() => {
                  if (window.confirm('Activate this promotion?')) {
                    activateMutation.mutate(promotion.id);
                  }
                }}
                style={{ ...styles.actionButton, ...styles.activateButton }}
                title="Activate promotion"
                onMouseEnter={(e) => e.target.style.backgroundColor = '#dcfce7'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <CheckCircle size={16} />
              </button>
            )}
            
            {isActive && (
              <button
                onClick={() => {
                  if (window.confirm('Deactivate this promotion?')) {
                    deactivateMutation.mutate(promotion.id);
                  }
                }}
                style={{ ...styles.actionButton, ...styles.deactivateButton }}
                title="Deactivate promotion"
                onMouseEnter={(e) => e.target.style.backgroundColor = '#fecaca'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <XCircle size={16} />
              </button>
            )}
            
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this promotion? This action cannot be undone.')) {
                  deleteMutation.mutate(promotion.id);
                }
              }}
              style={{ ...styles.actionButton, ...styles.deleteButton }}
              title="Delete promotion"
              onMouseEnter={(e) => e.target.style.backgroundColor = '#fecaca'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      },
    },
  ];

  const promotions = promotionsResponse?.data || [];
  const stats = promotionsResponse?.stats || {};

  const promotionStats = [
    { label: 'Total Promotions', value: stats.total || promotions.length },
    { label: 'Active', value: stats.active || 0 },
    { label: 'Scheduled', value: stats.scheduled || 0 },
    { label: 'Total Usage', value: stats.total_usage || 0 },
  ];

  if (isLoading) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Promotions Management</h1>
        <div style={styles.loadingCell}>
          <div style={styles.spinner}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Promotions Management</h1>
        <div style={styles.errorContainer}>
          Error loading promotions: {error.response?.data?.detail || error.message}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Promotions Management</h1>
        <button 
          style={styles.addButton}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#003366'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#004aad'}
        >
          <Plus size={16} />
          <span>Create Promotion</span>
        </button>
      </div>

      {/* Promotion Stats */}
      <div style={styles.statsContainer}>
        {promotionStats.map((stat, index) => (
          <div key={index} style={styles.statCard}>
            <div style={styles.statValue}>{stat.value}</div>
            <div style={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div style={styles.searchContainer}>
        <div style={styles.searchRow}>
          <div style={styles.searchInputContainer}>
            <Search style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search promotions by name, code, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
              onFocus={(e) => e.target.style.borderColor = '#004aad'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
          
          <div style={styles.filtersContainer}>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              style={styles.select}
              onFocus={(e) => e.target.style.borderColor = '#004aad'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="scheduled">Scheduled</option>
              <option value="expired">Expired</option>
            </select>
            
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              style={styles.select}
              onFocus={(e) => e.target.style.borderColor = '#004aad'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            >
              <option value="">All Types</option>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
              <option value="free_shipping">Free Shipping</option>
              <option value="bogo">Buy One Get One</option>
            </select>
          </div>
        </div>
      </div>

      {/* Promotions Table */}
      <div style={styles.tableContainer}>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    style={styles.tableHeaderCell}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {promotions.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} style={styles.emptyCell}>
                    {searchTerm || filters.status || filters.type 
                      ? 'No promotions match your search criteria' 
                      : 'No promotions found'
                    }
                  </td>
                </tr>
              ) : (
                promotions.map((promotion) => (
                  <tr 
                    key={promotion.id} 
                    style={styles.tableRow}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    {columns.map((column) => (
                      <td key={column.key} style={styles.tableCell}>
                        {column.render ? column.render(promotion) : promotion[column.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {promotionsResponse?.pagination && (
          <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Showing {promotions.length} of {promotionsResponse.pagination.total} promotions
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Promotions;