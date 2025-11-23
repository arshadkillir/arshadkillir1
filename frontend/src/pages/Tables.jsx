import React, { useState, useEffect } from 'react';
import API from '@/services/api.js';
import QrCodeModal from '@/components/QrCodeModal.jsx';
import { useAuth } from '../context/AuthContext.jsx'; // Import useAuth
import styles from './Tables.module.css';

const getStatusColor = (status) => {
  switch (status) {
    case 'FREE':
      return '#28a745'; // Green
    case 'OCCUPIED':
      return '#dc3545'; // Red
    case 'MERGED':
      return '#ffc107'; // Yellow
    case 'RESERVED':
      return '#17a2b8'; // Teal
    default:
      return '#6c757d'; // Gray
  }
};

export default function Tables() {
  const { user: currentUser } = useAuth(); // Get current user from AuthContext
  const [tables, setTables] = useState([]);
  const [filteredTables, setFilteredTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrModalTable, setQrModalTable] = useState(null);

  const [outlets, setOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState('');
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState('');

  useEffect(() => {
    // If user is a staff member assigned to a specific outlet
    if (currentUser.role === 'STAFF' && currentUser.outletId) {
      setSelectedOutlet(currentUser.outletId);
      setOutlets([]); // No need to fetch other outlets
    } else {
      // For admins/managers, fetch all outlets for the tenant
      const fetchOutlets = async () => {
        setLoading(true);
        try {
          // This backend call MUST be filtered by tenantId implicitly
          const response = await API.get('/outlets');
          setOutlets(response.data);
          if (response.data.length > 0) {
            setSelectedOutlet(response.data[0].id);
          } else {
            setLoading(false);
          }
        } catch (err) {
          setError('Failed to fetch outlets.');
          console.error(err);
          setLoading(false);
        }
      };
      fetchOutlets();
    }
  }, [currentUser]);

  useEffect(() => {
    if (!selectedOutlet) return;
    
    // Clear previous data to prevent showing stale tables
    setTables([]);
    setFilteredTables([]);
    
    const fetchTables = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/tables?outletId=${selectedOutlet}`);
        setTables(response.data);

        // Correctly extract unique floors from the nested floor object
        const floorsFromTables = response.data
          .map(table => table.floor)
          .filter(Boolean); // Filter out any tables without a floor
        const uniqueFloors = [...new Map(floorsFromTables.map(floor => [floor.id, floor])).values()];
        setFloors(uniqueFloors); // Now an array of {id, name} objects
        setSelectedFloor(''); // Reset floor selection
        setError(null);
      } catch (err) {
        setError('Failed to fetch tables for the selected outlet.');
        console.error(err);
        setTables([]);
        setFloors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTables();
  }, [selectedOutlet]);

  useEffect(() => {
    // Filter tables based on the selected floor's ID
    const tablesToShow = selectedFloor
      ? tables.filter(table => table.floor?.id === selectedFloor) : tables;
    setFilteredTables(tablesToShow);
  }, [selectedFloor, tables]);

  return (
    <div className={styles.container}>
      <h1>Table Management</h1>
      {loading && <p>Loading tables...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <>
          <div className={styles.filters}>
            {/* Only show outlet selector if user is not a staff member with a single assigned outlet */}
            {!(currentUser.role === 'STAFF' && currentUser.outletId) && outlets.length > 0 && (
              <div className={styles.filterGroup}>
                <label htmlFor="outlet-select">Outlet:</label>
                <select id="outlet-select" value={selectedOutlet} onChange={(e) => setSelectedOutlet(e.target.value)} className={styles.select}>
                  {outlets.map(outlet => (
                    <option key={outlet.id} value={outlet.id}>{outlet.name}</option>
                  ))}
                </select>
              </div>
            )}
            {floors.length > 0 && (
              <div className={styles.filterGroup}>
                <label htmlFor="floor-select">Floor:</label>
                <select id="floor-select" value={selectedFloor} onChange={(e) => setSelectedFloor(e.target.value)} className={styles.select}>
                  <option value="">All Floors</option>
                  {floors.map(floor => (<option key={floor.id} value={floor.id}>{floor.name}</option>))}
                </select>
              </div>
            )}
          </div>

          <div className={styles.grid}>
            {filteredTables.map((table) => (
            <div key={table.id} className={styles.card} style={{ borderColor: getStatusColor(table.status) }}>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{table.name}</h3>
                <p className={styles.cardCovers}>Seats: {table.seats}</p>
                <span className={styles.cardStatus} style={{ background: getStatusColor(table.status) }}>{table.status}</span>
              </div>
              <div className={styles.cardFooter}>
                <button onClick={() => setQrModalTable(table)} className={styles.qrButton} aria-label={`Generate QR Code for ${table.name}`}>
                  {/* Simple SVG for QR Code Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path key="path1" d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h6v6h-6z"/>
                    <path key="path2" d="M9 9h6v6H9z"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
          </div>
        </>
      )}
      {qrModalTable && (
        <QrCodeModal table={qrModalTable} onClose={() => setQrModalTable(null)} />
      )}
    </div>
  );
}