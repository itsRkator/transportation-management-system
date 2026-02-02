import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import AddIcon from '@mui/icons-material/Add';
import SortIcon from '@mui/icons-material/Sort';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { SHIPMENTS } from '../graphql/operations';
import { useAuth } from '../context/AuthContext';
import ShipmentsGrid from '../components/ShipmentsGrid';
import ShipmentsTiles from '../components/ShipmentsTiles';
import ShipmentDetail from '../components/ShipmentDetail';
import ShipmentFilters from '../components/ShipmentFilters';
import CreateShipmentModal from '../components/CreateShipmentModal';
import EditShipmentModal from '../components/EditShipmentModal';
import ErrorDisplay from '../components/ErrorDisplay';
import Spinner from '../components/Spinner';
import styles from './Shipments.module.css';

const PAGE_SIZE = 10;

export default function Shipments() {
  const [view, setView] = useState('grid'); // 'grid' | 'tile'
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [detailId, setDetailId] = useState(null);
  const [editShipmentId, setEditShipmentId] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [flaggedIds, setFlaggedIds] = useState(() => new Set());
  const { user } = useAuth();

  const toggleFlag = (s) => setFlaggedIds((prev) => {
    const next = new Set(prev);
    if (next.has(s.id)) next.delete(s.id);
    else next.add(s.id);
    return next;
  });

  const queryFilters = {};
  if (filters.shipperName) queryFilters.shipperName = filters.shipperName;
  if (filters.carrierName) queryFilters.carrierName = filters.carrierName;
  if (filters.status) queryFilters.status = filters.status;

  const sortByField = { createdAt: 'created_at', shipperName: 'shipper_name', carrierName: 'carrier_name' }[sortBy] ?? sortBy;

  const { data, loading, error, refetch } = useQuery(SHIPMENTS, {
    variables: {
      filters: queryFilters,
      sortBy: sortByField,
      sortOrder,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    },
  });

  const connection = data?.shipments;
  const items = connection?.items ?? [];
  const total = connection?.total ?? 0;
  const pageInfo = connection?.pageInfo;

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <h1 className={styles.title}>Shipments</h1>
        {user?.role === 'admin' && (
          <button type="button" className={styles.newBtn} onClick={() => setCreateOpen(true)}>
            <AddIcon className={styles.btnIcon} fontSize="small" />
            New Shipment
          </button>
        )}
        <ShipmentFilters filters={filters} onFiltersChange={setFilters} />
        <div className={styles.viewToggle}>
          <button
            type="button"
            className={view === 'grid' ? styles.active : ''}
            onClick={() => setView('grid')}
            title="Grid view"
          >
            <GridViewIcon fontSize="small" />
            Grid
          </button>
          <button
            type="button"
            className={view === 'tile' ? styles.active : ''}
            onClick={() => setView('tile')}
            title="Tile view"
          >
            <ViewModuleIcon fontSize="small" />
            Tiles
          </button>
        </div>
        <div className={styles.sort}>
          <SortIcon className={styles.sortIcon} fontSize="small" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="createdAt">Date</option>
            <option value="shipperName">Shipper</option>
            <option value="carrierName">Carrier</option>
            <option value="status">Status</option>
          </select>
          <button
            type="button"
            onClick={() => setSortOrder((o) => (o === 'DESC' ? 'ASC' : 'DESC'))}
            title={sortOrder === 'DESC' ? 'Ascending' : 'Descending'}
          >
            {sortOrder === 'DESC' ? '↓' : '↑'}
          </button>
        </div>
      </div>

      {loading && (
        <div className={styles.loading}>
          <Spinner size="large" />
          <span>Loading shipments…</span>
        </div>
      )}
      {error && <ErrorDisplay error={error} onRetry={() => refetch()} compact />}

      {!loading && !error && (
        <>
          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <LocalShippingIcon className={styles.emptyIcon} />
              <p>No shipments found</p>
              <p className={styles.emptyHint}>Try adjusting filters or add a new shipment (admin).</p>
            </div>
          ) : (
            <>
              {view === 'grid' && (
                <ShipmentsGrid
                  shipments={items}
                  onRowClick={(s) => setDetailId(s.id)}
                />
              )}
              {view === 'tile' && (
                <ShipmentsTiles
                  shipments={items}
                  flaggedIds={flaggedIds}
                  onTileClick={(s) => setDetailId(s.id)}
                  onEdit={(s) => setEditShipmentId(s.id)}
                  onFlag={toggleFlag}
                  onDelete={(s) => {}}
                />
              )}
            </>
          )}

          {total > 0 && (
          <div className={styles.pagination}>
            <button
              type="button"
              disabled={!pageInfo?.hasPreviousPage}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <span>
              Page {page + 1} of {Math.ceil(total / PAGE_SIZE) || 1} ({total} total)
            </span>
            <button
              type="button"
              disabled={!pageInfo?.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
          )}
        </>
      )}

      {detailId && (
        <ShipmentDetail
          shipmentId={detailId}
          onClose={() => setDetailId(null)}
          canEdit={user?.role === 'admin'}
          onEdit={(s) => {
            setDetailId(null);
            setEditShipmentId(s.id);
          }}
        />
      )}

      {createOpen && (
        <CreateShipmentModal
          onClose={() => setCreateOpen(false)}
          onSuccess={() => refetch()}
        />
      )}

      {editShipmentId && (
        <EditShipmentModal
          shipmentId={editShipmentId}
          onClose={() => setEditShipmentId(null)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}
