import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsAPI } from '../services/api';
import { Search, Filter, Plus, Eye, Edit, Trash2, CheckCircle, XCircle, Package, Tag } from 'lucide-react';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    priceRange: ''
  });
  const queryClient = useQueryClient();

  const { data: productsResponse, isLoading, error } = useQuery(
    ['products', { search: searchTerm, ...filters }], 
    () => productsAPI.getProducts({ search: searchTerm, ...filters })
  );

  const deleteMutation = useMutation(productsAPI.deleteProduct, {
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
    },
    onError: (error) => {
      alert(`Error deleting product: ${error.response?.data?.detail || 'Unknown error'}`);
    }
  });

  const updateStatusMutation = useMutation(
    ({ id, status }) => status === 'approved' ? productsAPI.approveProduct(id) : productsAPI.rejectProduct(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['products']);
      },
      onError: (error) => {
        alert(`Error updating product: ${error.response?.data?.detail || 'Unknown error'}`);
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
      pending: { backgroundColor: '#fef3c7', color: '#d97706' },
      approved: { backgroundColor: '#dbeafe', color: '#1d4ed8' },
      rejected: { backgroundColor: '#f3f4f6', color: '#374151' },
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
    approveButton: {
      color: '#16a34a',
    },
    rejectButton: {
      color: '#dc2626',
    },
    deleteButton: {
      color: '#991b1b',
    },
    price: {
      fontWeight: '600',
      color: '#059669',
    },
    productInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    productImage: {
      width: '40px',
      height: '40px',
      borderRadius: '6px',
      objectFit: 'cover',
      backgroundColor: '#f3f4f6',
    },
    productDetails: {
      display: 'flex',
      flexDirection: 'column',
    },
    productName: {
      fontWeight: '500',
      color: '#1f2937',
      margin: 0,
    },
    productCategory: {
      fontSize: '0.75rem',
      color: '#6b7280',
      margin: 0,
    },
    stockInfo: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    stockQuantity: {
      fontWeight: '600',
      color: '#1f2937',
    },
    stockLabel: {
      fontSize: '0.75rem',
      color: '#6b7280',
    },
  };

  const columns = [
    {
      key: 'product',
      header: 'Product',
      render: (product) => (
        <div style={styles.productInfo}>
          <img 
            src={product.images?.[0] || '/api/placeholder/40/40'} 
            alt={product.name}
            style={styles.productImage}
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODIgMTIgMTIgMTUuNTgyIDEyIDIwQzEyIDI0LjQxOCAxNS41ODIgMjggMjAgMjhDMjQuNDE4IDI4IDI4IDI0LjQxOCAyOCAyMEMyOCAxNS41ODIgMjQuNDE4IDEyIDIwIDEyWk0yMCAyNkMxNy43OTEgMjYgMTYgMjQuMjA5IDE2IDIyQzE2IDE5Ljc5MSAxNy43OTEgMTggMjAgMThDMjIuMjA5IDE4IDI0IDE5Ljc5MSAyNCAyMkMyNCAyNC4yMDkgMjIuMjA5IDI2IDIwIDI2WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
            }}
          />
          <div style={styles.productDetails}>
            <p style={styles.productName}>{product.name || 'Unnamed Product'}</p>
            <p style={styles.productCategory}>{product.category || 'Uncategorized'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (product) => (
        <span style={styles.price}>
          ${product.price ? parseFloat(product.price).toFixed(2) : '0.00'}
        </span>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (product) => (
        <div style={styles.stockInfo}>
          <span style={styles.stockQuantity}>{product.stock_quantity || 0}</span>
          <span style={styles.stockLabel}>in stock</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (product) => (
        <span style={{ 
          ...styles.badge, 
          ...styles.statusBadge[product.status?.toLowerCase()] || styles.statusBadge.pending 
        }}>
          {product.status || 'pending'}
        </span>
      ),
    },
    {
      key: 'vendor',
      header: 'Vendor',
      render: (product) => product.vendor_name || product.shop_name || 'Unknown',
    },
    {
      key: 'created_at',
      header: 'Added',
      render: (product) => new Date(product.created_at).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (product) => (
        <div style={styles.actionsContainer}>
          <button
            onClick={() => {
              // View product details
              console.log('View product:', product);
            }}
            style={{ ...styles.actionButton, ...styles.viewButton }}
            title="View product"
            onMouseEnter={(e) => e.target.style.backgroundColor = '#dbeafe'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <Eye size={16} />
          </button>
          
          <button
            onClick={() => {
              // Edit product
              console.log('Edit product:', product);
            }}
            style={{ ...styles.actionButton, ...styles.editButton }}
            title="Edit product"
            onMouseEnter={(e) => e.target.style.backgroundColor = '#dcfce7'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <Edit size={16} />
          </button>
          
          {product.status !== 'approved' && (
            <button
              onClick={() => {
                if (window.confirm('Approve this product?')) {
                  updateStatusMutation.mutate({ id: product.id, status: 'approved' });
                }
              }}
              style={{ ...styles.actionButton, ...styles.approveButton }}
              title="Approve product"
              onMouseEnter={(e) => e.target.style.backgroundColor = '#dcfce7'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <CheckCircle size={16} />
            </button>
          )}
          
          {product.status !== 'rejected' && (
            <button
              onClick={() => {
                const reason = prompt('Reason for rejection:');
                if (reason) {
                  updateStatusMutation.mutate({ id: product.id, status: 'rejected' });
                }
              }}
              style={{ ...styles.actionButton, ...styles.rejectButton }}
              title="Reject product"
              onMouseEnter={(e) => e.target.style.backgroundColor = '#fecaca'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <XCircle size={16} />
            </button>
          )}
          
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
                deleteMutation.mutate(product.id);
              }
            }}
            style={{ ...styles.actionButton, ...styles.deleteButton }}
            title="Delete product"
            onMouseEnter={(e) => e.target.style.backgroundColor = '#fecaca'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const products = productsResponse?.data || [];
  const stats = productsResponse?.stats || {};

  const productStats = [
    { label: 'Total Products', value: stats.total || products.length },
    { label: 'Active', value: stats.active || 0 },
    { label: 'Pending Review', value: stats.pending || 0 },
    { label: 'Out of Stock', value: stats.out_of_stock || 0 },
  ];

  if (isLoading) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Products Management</h1>
        <div style={styles.loadingCell}>
          <div style={styles.spinner}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Products Management</h1>
        <div style={styles.errorContainer}>
          Error loading products: {error.response?.data?.detail || error.message}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Products Management</h1>
        <button 
          style={styles.addButton}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#003366'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#004aad'}
        >
          <Plus size={16} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Product Stats */}
      <div style={styles.statsContainer}>
        {productStats.map((stat, index) => (
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
              placeholder="Search products by name, category, or vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
              onFocus={(e) => e.target.style.borderColor = '#004aad'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
          
          <div style={styles.filtersContainer}>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              style={styles.select}
              onFocus={(e) => e.target.style.borderColor = '#004aad'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            >
              <option value="">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="home">Home & Garden</option>
              <option value="sports">Sports</option>
              <option value="other">Other</option>
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
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={filters.priceRange}
              onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
              style={styles.select}
              onFocus={(e) => e.target.style.borderColor = '#004aad'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            >
              <option value="">All Prices</option>
              <option value="0-50">$0 - $50</option>
              <option value="50-100">$50 - $100</option>
              <option value="100-500">$100 - $500</option>
              <option value="500+">$500+</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
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
              {products.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} style={styles.emptyCell}>
                    {searchTerm || filters.category || filters.status 
                      ? 'No products match your search criteria' 
                      : 'No products found'
                    }
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr 
                    key={product.id} 
                    style={styles.tableRow}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    {columns.map((column) => (
                      <td key={column.key} style={styles.tableCell}>
                        {column.render ? column.render(product) : product[column.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {productsResponse?.pagination && (
          <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Showing {products.length} of {productsResponse.pagination.total} products
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;