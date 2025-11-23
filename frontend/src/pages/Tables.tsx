import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import apiFetch from '@/api';
import CreateOrderModal from '@/components/CreateOrderModal.tsx';
import styles from './Tables.module.css';
import { useAuth } from '@/context/AuthContext';

// --- Define the shape of your data for TypeScript ---
interface Order {
  id: string;
  createdAt: string;
  // Add other order properties as needed
}

interface Table {
  id: string;
  name: string;
  orders: Order[];
  outletId: string; // Add outletId, as it's used by the CreateOrderModal
}

interface Floor {
  id: string;
  name: string;
  tables: Table[];
}

// SVG Icons (Simple inline placeholders - replace with Lucide-React or Heroicons if you have them)
const ReloadIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
const FloorPlanIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>;

export default function Tables() {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null); // Track active tab
  const [filterType, setFilterType] = useState('ALL'); // ALL, RUNNING, COMPLETED
  
  const { user } = useAuth(); // Get the current user
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  // --- 1. Fetch Data ---
  const fetchFloorsAndTables = async () => {
    try {
      setLoading(true);
      // Reset the selected floor so the default can be re-applied
      setSelectedFloorId(null);
      const data = await apiFetch<Floor[]>('/tables');
      // Handle cases where the API returns a successful but empty response (e.g., 204 No Content)
      setFloors(data || []);
      // Default to first floor if available and none selected
      if (data && data.length > 0 && !selectedFloorId) {
        setSelectedFloorId(data[0].id);
      }
      setError(null);
    } catch (err: any) {
      setError('Failed to fetch table layout. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) { // Only fetch if a user is logged in
      fetchFloorsAndTables();
    }
  }, [user]); // Re-run this effect when the user object changes

  // --- 2. Calculate Stats & Filter Data ---
  const tableStats = useMemo(() => {
    let available = 0;
    let occupied = 0;
    let doneSoon = 0; // Logic for this depends on your backend, placeholder for now
    
    floors.forEach(floor => {
      floor.tables.forEach(table => {
        if (table.orders && table.orders.length > 0) occupied++;
        else available++;
      });
    });

    return { available, occupied, doneSoon };
  }, [floors]);

  // Get active floor object
  const activeFloor = floors.find(f => f.id === selectedFloorId);
  
  // Filter tables based on active floor AND filterType
  const displayedTables: Table[] = activeFloor ? activeFloor.tables.filter(table => {
    const isOccupied = table.orders && table.orders.length > 0;
    if (filterType === 'RUNNING') return isOccupied;
    if (filterType === 'AVAILABLE') return !isOccupied; // Mapping "Completed" to available or logic of your choice
    return true; // 'ALL'
  }) : [];


  // --- 3. Handlers ---
  const handleTableClick = (table: Table) => {
    if (table.orders && table.orders.length > 0) {
      const activeOrderId = table.orders[0].id;
      navigate(`/orders/${activeOrderId}`);
    } else {
      setSelectedTable(table);
      setIsModalOpen(true);
    }
  };

  if (loading && floors.length === 0) return <div className={styles.loadingScreen}>Loading Restaurant Layout...</div>;
  if (error) return <div className={styles.errorScreen}>{error} <button onClick={fetchFloorsAndTables}>Retry</button></div>;

  return (
    <div className={styles.container}>
      {/* --- Top Header Bar --- */}
      <header className={styles.topBar}>
        <div className={styles.locationSelector}>
           {/* Placeholder for outlet name if you have it in context */}
           <h3>Samurai Japanese Restaurant</h3> 
           <button className={styles.reloadBtn} onClick={fetchFloorsAndTables}>
             <ReloadIcon /> Reload
           </button>
        </div>

        <div className={styles.topFilters}>
          <button 
            className={`${styles.filterBtn} ${filterType === 'ALL' ? styles.activeFilter : ''}`}
            onClick={() => setFilterType('ALL')}
          >
            All Tables
          </button>
          <button 
            className={`${styles.filterBtn} ${filterType === 'RUNNING' ? styles.activeFilter : ''}`}
            onClick={() => setFilterType('RUNNING')}
          >
            Running Orders
          </button>
          {/* Example: "Completed" might mean recently paid but table not cleared? using AVAILABLE for now */}
          <button 
            className={`${styles.filterBtn} ${filterType === 'AVAILABLE' ? styles.activeFilter : ''}`}
            onClick={() => setFilterType('AVAILABLE')}
          >
            Available
          </button>
        </div>
      </header>

      {/* --- Sub-Header: Floor Tabs & Stats --- */}
      <div className={styles.subHeader}>
        <div className={styles.floorControls}>
          <div className={styles.floorTabs}>
            {floors.map(floor => (
              <button 
                key={floor.id} 
                className={`${styles.floorTab} ${selectedFloorId === floor.id ? styles.activeFloor : ''}`}
                onClick={() => setSelectedFloorId(floor.id)}
              >
                {floor.name}
              </button>
            ))}
          </div>
          
          <div className={styles.actionButtons}>
             <button className={styles.floorPlanBtn}><FloorPlanIcon /> View Floor Plan</button>
             <button className={styles.mergeBtn}>Merge Tables</button>
          </div>
        </div>

        <div className={styles.statsContainer}>
          <div className={styles.statItem}>
            <span className={`${styles.badge} ${styles.badgeGreen}`}>{tableStats.available}</span>
            <span className={styles.statLabel}>Available</span>
          </div>
          <div className={styles.statItem}>
            <span className={`${styles.badge} ${styles.badgeGrey}`}>{tableStats.occupied}</span>
            <span className={styles.statLabel}>Occupied</span>
          </div>
          {/* Add more stats if your backend supports them */}
          <div className={styles.statItem}>
            <span className={`${styles.badge} ${styles.badgeOrange}`}>{tableStats.doneSoon}</span>
            <span className={styles.statLabel}>Done Soon</span>
          </div>
        </div>
      </div>

      {/* --- Main Table Grid --- */}
      <div className={styles.gridArea}>
        {displayedTables.length > 0 ? (
          displayedTables.map(table => {
             const isOccupied = table.orders && table.orders.length > 0;
             return (
              <div
                key={table.id}
                className={`${styles.tableCard} ${isOccupied ? styles.cardOccupied : styles.cardAvailable}`}
                onClick={() => handleTableClick(table)}
              >
                <span className={styles.tableNumber}>{table.name}</span>
                {isOccupied && (
                   <div className={styles.orderInfo}>
                     ⏱️ {new Date(table.orders[0].createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                   </div>
                )}
              </div>
            );
          })
        ) : (
          <div className={styles.emptyState}>No tables found in this section.</div>
        )}
      </div>

      <CreateOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        table={selectedTable}
        onOrderCreated={fetchFloorsAndTables}
      />
    </div>
  );
}