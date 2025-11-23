import React, { useState, useEffect } from 'react';
import API from '@/services/api.js';
import styles from './MenuManagement.module.css'; // Renamed stylesheet

// Using a data URI for the placeholder to avoid a missing file error.
const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23e9ecef"/%3E%3Ctext x="50" y="55" font-family="Arial" font-size="12" fill="%236c757d" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [imageUploadState, setImageUploadState] = useState({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        // This corresponds to the GET /api/menu/items endpoint on your backend
        const response = await API.get('/menu/items');
        setMenuItems(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch menu items. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('csvFile', file);

    try {
      setUploading(true);
      setError(null);
      // This corresponds to the POST /api/menu/upload-csv endpoint
      await API.post('/menu/upload-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Refresh menu items after successful upload
      const response = await API.get('/menu/items');
      setMenuItems(response.data);
    } catch (err) {
      setError('Failed to upload CSV. Please check the file format and try again.');
      console.error(err);
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  const handleDownload = async () => {
    // This corresponds to the GET /api/menu/download-csv endpoint
    window.open(`${API.defaults.baseURL}/menu/download-csv`, '_blank');
  };

  const handleImageFileChange = (event, itemId) => {
    setImageUploadState(prev => ({
      ...prev,
      [itemId]: { file: event.target.files[0] }
    }));
  };

  const handleImageUpload = async (itemId) => {
    const currentItemState = imageUploadState[itemId];
    if (!currentItemState || !currentItemState.file) {
      setError('Please select an image file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('image', currentItemState.file);

    try {
      setError(null); // Clear previous errors before a new upload
      setImageUploadState(prev => ({ ...prev, [itemId]: { ...prev[itemId], uploading: true } }));
      // This corresponds to POST /api/menu/items/:id/upload-image
      const response = await API.post(`/menu/items/${itemId}/upload-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Update the specific menu item in the state with the new image URL
      setMenuItems(prevItems => prevItems.map(item =>
        item.id === itemId ? { ...item, imageUrl: response.data.imageUrl } : item
      ));
    } catch (err) {
      setError('Failed to upload image.');
      console.error(err);
    } finally {
      setImageUploadState(prev => ({ ...prev, [itemId]: { file: null, uploading: false } }));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Menu Items</h1>
        <button onClick={handleDownload} className={styles.actionButton}>Download CSV</button>
      </div>
      {loading && <p>Loading menu...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && (
        <div className={styles.grid}>
          {menuItems.length > 0 ? (
            menuItems.map(item => (
              <div key={item.id} className={styles.card}>
                <img 
                  src={item.imageUrl ? `${API.defaults.baseURL}${item.imageUrl}` : placeholderImage} 
                  alt={item.name} 
                  className={styles.itemImage}
                />
                <h3>{item.name}</h3>
                <p>{item.description || 'No description available.'}</p>
                <p className={styles.price}>${Number(item.price).toFixed(2)}</p>
                <div className={styles.imageUpload}>
                  <input type="file" accept="image/*" onChange={(e) => handleImageFileChange(e, item.id)} />
                  <button onClick={() => handleImageUpload(item.id)} disabled={imageUploadState[item.id]?.uploading}>
                    {imageUploadState[item.id]?.uploading ? 'Uploading...' : 'Upload Image'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noItems}><p>No menu items found.</p></div>
          )}
        </div>
      )}

      <div className={styles.uploadSection}>
        <h2>Upload Menu CSV</h2>
        <p>Upload a CSV with columns: `name`, `description`, `price`, `categoryId`.</p>
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={uploading || !file}>
          {uploading ? 'Uploading...' : 'Upload CSV'}
        </button>
      </div>
    </div>
  );
}