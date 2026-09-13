import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useAlert } from '../../context/AlertContext';
import securityService from '../../services/securityService';
import SecurityHeader from './SecurityHeader';
import SecurityStats from './SecurityStats';
import SecurityList from './SecurityList';
import SecurityDetailsModal from './SecurityDetailsModal';
import SecurityExportModal from './SecurityExportModal';
import SimplePagination from '../../components/common/SimplePagination';

export default function Security() {
  const { showConfirm, showSuccess, showError } = useAlert();

  const [alerts, setAlerts] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);

  // Modal States
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Pagination States (10 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchSecurityAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await securityService.getAlerts({ per_page: 100 });
      const data = res?.data || [];
      setAlerts(Array.isArray(data) ? data : []);
      if (res?.meta) {
        setMeta(res.meta);
      }
    } catch (err) {
      console.error('Failed to load security alerts from DB:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSecurityAlerts();
  }, [fetchSecurityAlerts]);

  const totalRecords = alerts.length;
  const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalRecords);
  const paginatedAlerts = alerts.slice(startIndex, endIndex);

  const handleOpenDetails = (alert) => {
    setSelectedAlert(alert);
    setIsDetailsModalOpen(true);

    if (!alert.is_read) {
      handleMarkRead(alert.id);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await securityService.markAsRead(id);
      setAlerts(prev =>
        prev.map(a => (a.id === id ? { ...a, is_read: true } : a))
      );
      if (selectedAlert && selectedAlert.id === id) {
        setSelectedAlert(prev => ({ ...prev, is_read: true }));
      }
      setMeta(prev => ({ ...prev, unread_count: Math.max(0, (prev.unread_count || 1) - 1) }));
    } catch (err) {
      console.error('Failed to mark alert as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await securityService.markAllRead();
      setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
      setMeta(prev => ({ ...prev, unread_count: 0 }));
      showSuccess('All security incidents marked as acknowledged.', 'Success');
    } catch (err) {
      showError(err.message || 'Failed to mark alerts as read.', 'Error');
    }
  };

  const handleBlockIp = async (ipAddress) => {
    if (!ipAddress) return;
    const confirmed = await showConfirm({
      title: 'Block IP Address',
      message: `Are you sure you want to block IP address "${ipAddress}"? All login requests and access from this IP will be immediately rejected.`,
      confirmText: 'Block IP',
      type: 'danger'
    });

    if (confirmed) {
      try {
        await securityService.blockIp(ipAddress, 'Blocked by admin due to security threshold violation.');
        setAlerts(prev =>
          prev.map(a => (a.ip_address === ipAddress ? { ...a, is_ip_blocked: true } : a))
        );
        if (selectedAlert && selectedAlert.ip_address === ipAddress) {
          setSelectedAlert(prev => ({ ...prev, is_ip_blocked: true }));
        }
        setMeta(prev => ({ ...prev, blocked_ips_count: (prev.blocked_ips_count || 0) + 1 }));
        showSuccess(`IP address ${ipAddress} has been blocked.`, 'IP Blocked');
      } catch (err) {
        showError(err.message || 'Failed to block IP address.', 'Error');
      }
    }
  };

  const handleUnblockIp = async (ipAddress) => {
    if (!ipAddress) return;
    const confirmed = await showConfirm({
      title: 'Unblock IP Address',
      message: `Are you sure you want to unblock IP address "${ipAddress}"?`,
      confirmText: 'Unblock IP',
      type: 'info'
    });

    if (confirmed) {
      try {
        await securityService.unblockIp(ipAddress);
        setAlerts(prev =>
          prev.map(a => (a.ip_address === ipAddress ? { ...a, is_ip_blocked: false } : a))
        );
        if (selectedAlert && selectedAlert.ip_address === ipAddress) {
          setSelectedAlert(prev => ({ ...prev, is_ip_blocked: false }));
        }
        setMeta(prev => ({ ...prev, blocked_ips_count: Math.max(0, (prev.blocked_ips_count || 1) - 1) }));
        showSuccess(`IP address ${ipAddress} is now unblocked.`, 'IP Unblocked');
      } catch (err) {
        showError(err.message || 'Failed to unblock IP address.', 'Error');
      }
    }
  };

  const handleDeleteAlert = async (id) => {
    const confirmed = await showConfirm({
      title: 'Delete Security Alert',
      message: 'Are you sure you want to permanently remove this incident record?',
      confirmText: 'Delete',
      type: 'danger'
    });

    if (confirmed) {
      try {
        await securityService.deleteAlert(id);
        setAlerts(prev => prev.filter(a => a.id !== id));
        if (selectedAlert && selectedAlert.id === id) {
          setIsDetailsModalOpen(false);
          setSelectedAlert(null);
        }
        setMeta(prev => ({ ...prev, total_alerts: Math.max(0, (prev.total_alerts || 1) - 1) }));
        showSuccess('Security alert deleted.', 'Success');
      } catch (err) {
        showError(err.message || 'Failed to delete security alert.', 'Error');
      }
    }
  };

  return (
    <>
      {/* Details Modal with IP Blocking Controls */}
      <SecurityDetailsModal
        isOpen={isDetailsModalOpen}
        alert={selectedAlert}
        onClose={() => setIsDetailsModalOpen(false)}
        onMarkRead={handleMarkRead}
        onDelete={handleDeleteAlert}
        onBlockIp={handleBlockIp}
        onUnblockIp={handleUnblockIp}
      />

      {/* Download Data / Export Modal */}
      <SecurityExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        alerts={alerts}
        meta={meta}
      />

      {/* Header */}
      <SecurityHeader
        onOpenExport={() => setIsExportModalOpen(true)}
      />

      {/* Standard KPI Stats Cards */}
      <SecurityStats meta={meta} />

      {/* Standard Table List View with Pagination */}
      {loading ? (
        <div className="p-12 text-center flex flex-col items-center justify-center space-y-3 bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
          <Loader2 className="w-8 h-8 text-[#003E83] dark:text-blue-500 animate-spin" />
          <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
            Loading real security logs from database...
          </p>
        </div>
      ) : (
        <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] overflow-hidden shadow-xs">
          <SecurityList
            alerts={paginatedAlerts}
            loading={loading}
            onOpenDetails={handleOpenDetails}
            onMarkRead={handleMarkRead}
            onDeleteAlert={handleDeleteAlert}
            startIndex={startIndex}
          />

          {/* Simple Pagination Footer */}
          <SimplePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            startIndex={startIndex}
            endIndex={endIndex}
            totalRecords={totalRecords}
            label="alerts"
          />
        </div>
      )}
    </>
  );
}
