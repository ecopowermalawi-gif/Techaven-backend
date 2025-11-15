import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI } from '../services/api';
import { Edit, Trash2, Search, Plus, RefreshCw } from 'lucide-react';

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    status: ''
  });
  const queryClient = useQueryClient();

  const { 
    data: usersResponse, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['users', { search: searchTerm, ...filters }], 
    queryFn: () => usersAPI.getUsers({ search: searchTerm, ...filters }),
    onError: (error) => {
      console.error('Error fetching users:', error);
    },
    onSuccess: (data) => {
      console.log('Users data received:', data);
    }
  });

  const deleteMutation = useMutation(usersAPI.deleteUser, {
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
    onError: (error) => {
      alert(`Error deleting user: ${error.response?.data?.detail || 'Unknown error'}`);
    }
  });

  const updateStatusMutation = useMutation(
    ({ id, status }) => usersAPI.updateUserStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
      },
      onError: (error) => {
        alert(`Error updating user: ${error.response?.data?.detail || 'Unknown error'}`);
      }
    }
  );

  const handleStatusChange = (userId, newStatus) => {
    if (window.confirm(`Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} this user?`)) {
      updateStatusMutation.mutate({ id: userId, status: newStatus });
    }
  };

  // Debug: Log the actual data structure
  console.log('Users Response:', usersResponse);
  console.log('Users Array:', usersResponse?.data);

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
    headerActions: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
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
    refreshButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#6b7280',
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
      maxWidth: '400px',
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
    },
    select: {
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '0.875rem',
      fontFamily: "'Poppins', sans-serif",
      outline: 'none',
      backgroundColor: 'white',
    },
    errorContainer: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#dc2626',
      padding: '12px 16px',
      borderRadius: '6px',
    },
    debugContainer: {
      backgroundColor: '#f3f4f6',
      border: '1px solid #d1d5db',
      color: '#374151',
      padding: '12px 16px',
      borderRadius: '6px',
      fontSize: '0.875rem',
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
      padding: '12px 24px',
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
      padding: '16px 24px',
      fontSize: '0.875rem',
      color: '#1f2937',
      whiteSpace: 'nowrap',
      fontFamily: "'Poppins', sans-serif",
    },
    loadingCell: {
      padding: '32px 24px',
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
      padding: '32px 24px',
      textAlign: 'center',
      color: '#6b7280',
    },
    badge: {
      padding: '4px 8px',
      fontSize: '0.75rem',
      borderRadius: '9999px',
      fontWeight: '500',
    },
    roleBadge: {
      admin: { backgroundColor: '#f3e8ff', color: '#7e22ce' },
      vendor: { backgroundColor: '#dbeafe', color: '#1d4ed8' },
      customer: { backgroundColor: '#f3f4f6', color: '#374151' },
    },
    statusBadge: {
      active: { backgroundColor: '#dcfce7', color: '#166534' },
      inactive: { backgroundColor: '#fecaca', color: '#dc2626' },
      default: { backgroundColor: '#f3f4f6', color: '#374151' },
    },
    actionsContainer: {
      display: 'flex',
      gap: '8px',
    },
    actionButton: {
      padding: '4px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      fontSize: '0.75rem',
      fontFamily: "'Poppins', sans-serif",
    },
    editButton: {
      color: '#2563eb',
    },
    statusButton: {
      active: { color: '#ea580c' },
      inactive: { color: '#16a34a' },
    },
    deleteButton: {
      color: '#dc2626',
    },
    pagination: {
      padding: '16px 24px',
      borderTop: '1px solid #e5e7eb',
    },
    paginationText: {
      fontSize: '0.875rem',
      color: '#6b7280',
      fontFamily: "'Poppins', sans-serif",
    },
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (user) => `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A',
    },
    {
      key: 'email',
      header: 'Email',
      render: (user) => user.email || 'N/A',
    },
    {
      key: 'role',
      header: 'Role',
      render: (user) => (
        <span style={{ ...styles.badge, ...styles.roleBadge[user.role] || styles.roleBadge.customer }}>
          {user.role || 'customer'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => (
        <span style={{ ...styles.badge, ...styles.statusBadge[user.status] || styles.statusBadge.default }}>
          {user.status || 'active'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Joined',
      render: (user) => user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user) => (
        <div style={styles.actionsContainer}>
          <button
            onClick={() => {
              console.log('Edit user:', user);
            }}
            style={{ ...styles.actionButton, ...styles.editButton }}
            title="Edit user"
            onMouseEnter={(e) => e.target.style.backgroundColor = '#dbeafe'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <Edit size={16} />
          </button>
          
          <button
            onClick={() => handleStatusChange(
              user.id, 
              user.status === 'active' ? 'inactive' : 'active'
            )}
            style={{ 
              ...styles.actionButton, 
              ...(user.status === 'active' ? styles.statusButton.active : styles.statusButton.inactive)
            }}
            title={user.status === 'active' ? 'Deactivate user' : 'Activate user'}
            onMouseEnter={(e) => e.target.style.backgroundColor = user.status === 'active' ? '#ffedd5' : '#dcfce7'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            {user.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
          
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                deleteMutation.mutate(user.id);
              }
            }}
            style={{ ...styles.actionButton, ...styles.deleteButton }}
            title="Delete user"
            onMouseEnter={(e) => e.target.style.backgroundColor = '#fecaca'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  // Handle different data structures
  const users = React.useMemo(() => {
    if (!usersResponse) return [];
    
    // If response is an array
    if (Array.isArray(usersResponse)) {
      return usersResponse;
    }
    
    // If response has data property
    if (usersResponse.data && Array.isArray(usersResponse.data)) {
      return usersResponse.data;
    }
    
    // If response has users property
    if (usersResponse.users && Array.isArray(usersResponse.users)) {
      return usersResponse.users;
    }
    
    // If response has results property
    if (usersResponse.results && Array.isArray(usersResponse.results)) {
      return usersResponse.results;
    }
    
    console.warn('Unexpected data structure:', usersResponse);
    return [];
  }, [usersResponse]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Users Management</h1>
        <div style={styles.headerActions}>
          <button 
            style={styles.refreshButton}
            onClick={() => refetch()}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#6b7280'}
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button 
            style={styles.addButton}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#003366'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#004aad'}
          >
            <Plus size={16} />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div style={styles.debugContainer}>
          <strong>Debug Info:</strong> 
          <br />
          Loading: {isLoading ? 'Yes' : 'No'}
          <br />
          Error: {error ? error.message : 'None'}
          <br />
          Users Count: {users.length}
          <br />
          Data Structure: {JSON.stringify(usersResponse ? Object.keys(usersResponse) : 'No data')}
        </div>
      )}

      {/* Search and Filters */}
      <div style={styles.searchContainer}>
        <div style={styles.searchRow}>
          <div style={styles.searchInputContainer}>
            <Search style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
              onFocus={(e) => e.target.style.borderColor = '#004aad'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
          
          <div style={styles.filtersContainer}>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              style={styles.select}
              onFocus={(e) => e.target.style.borderColor = '#004aad'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="vendor">Vendor</option>
              <option value="customer">Customer</option>
            </select>
            
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
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div style={styles.errorContainer}>
          <strong>Error loading users:</strong> {error.response?.data?.detail || error.message}
          <br />
          <button 
            onClick={() => refetch()}
            style={{
              marginTop: '8px',
              padding: '8px 16px',
              backgroundColor: '#004aad',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Users Table */}
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
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} style={styles.loadingCell}>
                    <div style={styles.spinner}></div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} style={styles.emptyCell}>
                    {searchTerm || filters.role || filters.status 
                      ? 'No users match your search criteria' 
                      : 'No users found in the database'
                    }
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr 
                    key={user.id || index} 
                    style={styles.tableRow}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    {columns.map((column) => (
                      <td key={column.key} style={styles.tableCell}>
                        {column.render ? column.render(user) : user[column.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {users.length > 0 && (
          <div style={styles.pagination}>
            <div style={styles.paginationText}>
              Showing {users.length} users
              {usersResponse?.pagination?.total && ` of ${usersResponse.pagination.total}`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;