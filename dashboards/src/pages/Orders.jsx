import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersAPI } from '../services/api';
import { Search, Filter, Eye, Edit, Truck, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    dateRange: ''
  });
  const queryClient = useQueryClient();

  const { data: ordersResponse, isLoading, error } = useQuery(
    ['orders', { search: searchTerm, ...filters }], 
    () => ordersAPI.getOrders({ search: searchTerm, ...filters })
  );

  const updateStatusMutation = useMutation(
    ({ id, status }) => ordersAPI.updateOrderStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['orders']);
      },
      onError: (error) => {
        alert(`Error updating order: ${error.response?.data?.detail || 'Unknown error'}`);
      }
    }
  );

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
      pending: { backgroundColor: '#fef3c7', color: '#d97706' },
      confirmed: { backgroundColor: '#dbeafe', color: '#1d4ed8' },
      shipped: { backgroundColor: '#e0e7ff', color: '#3730a3' },
      delivered: { backgroundColor: '#dcfce7', color: '#166534' },
      cancelled: { backgroundColor: '#fecaca', color: '#dc2626' },
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
    statusButton: {
      color: '#7c3aed',
    },
    amount: {
      fontWeight: '600',
      color: '#059669',
    },
    customerInfo: {
      display: 'flex',
      flexDirection: 'column',
    },
    customerName: {
      fontWeight: '500',
      color: '#1f2937',
    },
    customerEmail: {
      fontSize: '0.75rem',
      color: '#6b7280',
    },
  };

  const columns = [
    {
      key: 'id',
      header: 'Order ID',
      render: (order) => `#${order.id?.slice(0, 8) || 'N/A'}`,
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (order) => (
        <div style={styles.customerInfo}>
          <span style={styles.customerName}>
            {order.customer_name || 'Unknown Customer'}
          </span>
          <span style={styles.customerEmail}>
            {order.customer_email || 'No email'}
          </span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (order) => (
        <span style={styles.amount}>
          ${order.total_amount ? parseFloat(order.total_amount).toFixed(2) : '0.00'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (order) => (
        <span style={{ 
          ...styles.badge, 
          ...styles.statusBadge[order.status?.toLowerCase()] || styles.statusBadge.pending 
        }}>
          {order.status || 'pending'}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Order Date',
      render: (order) => new Date(order.created_at || order.order_date).toLocaleDateString(),
    },
    {
      key: 'items',
      header: 'Items',
      render: (order) => order.items_count || order.products?.length || 0,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (order) => (
        <div style={styles.actionsContainer}>
          <button
            onClick={() => {
              // View order details
              console.log('View order:', order);
            }}
            style={{ ...styles.actionButton, ...styles.viewButton }}
            title="View order details"
            onMouseEnter={(e) => e.target.style.backgroundColor = '#dbeafe'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <Eye size={16} />
          </button>
          
          <button
            onClick={() => {
              // Edit order
              console.log('Edit order:', order);
            }}
            style={{ ...styles.actionButton, ...styles.editButton }}
            title="Edit order"
            onMouseEnter={(e) => e.target.style.backgroundColor = '#dcfce7'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <Edit size={16} />
          </button>
          
          <button
            onClick={() => {
              // Update status
              const newStatus = prompt('Update status (pending/confirmed/shipped/delivered/cancelled):', order.status);
              if (newStatus && newStatus !== order.status) {
                updateStatusMutation.mutate({ id: order.id, status: newStatus });
              }
            }}
            style={{ ...styles.actionButton, ...styles.statusButton }}
            title="Update status"
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f3e8ff'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <Truck size={16} />
          </button>
        </div>
      ),
    },
  ];

  const orders = ordersResponse?.data || [];
  const stats = ordersResponse?.stats || {};

  const orderStats = [
    { label: 'Total Orders', value: stats.total || orders.length },
    { label: 'Pending', value: stats.pending || 0 },
    { label: 'Delivered', value: stats.delivered || 0 },
    { label: 'Revenue', value: `$${stats.revenue || '0.00'}` },
  ];

  if (isLoading) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Orders Management</h1>
        <div style={styles.loadingCell}>
          <div style={styles.spinner}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Orders Management</h1>
        <div style={styles.errorContainer}>
          Error loading orders: {error.response?.data?.detail || error.message}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Orders Management</h1>
      </div>

      {/* Order Stats */}
      <div style={styles.statsContainer}>
        {orderStats.map((stat, index) => (
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
              placeholder="Search orders by ID, customer name or email..."
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
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              style={styles.select}
              onFocus={(e) => e.target.style.borderColor = '#004aad'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
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
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} style={styles.emptyCell}>
                    {searchTerm || filters.status || filters.dateRange 
                      ? 'No orders match your search criteria' 
                      : 'No orders found'
                    }
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr 
                    key={order.id} 
                    style={styles.tableRow}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    {columns.map((column) => (
                      <td key={column.key} style={styles.tableCell}>
                        {column.render ? column.render(order) : order[column.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {ordersResponse?.pagination && (
          <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Showing {orders.length} of {ordersResponse.pagination.total} orders
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;