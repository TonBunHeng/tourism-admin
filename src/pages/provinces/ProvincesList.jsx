import React from 'react';
import { Clock, Eye, Edit, Trash2, MapPin, Users, Maximize2, Building2 } from 'lucide-react';
import { getStatusColor, getTypeBadgeColor } from '../../utils/StatusUtils';

export default function ProvincesList({
  provinces = [],
  onViewProvince,
  onEditProvince,
  onDeleteProvince,
  onView,
  onEdit,
  onDelete,
  startIndex = 0
}) {
  const handleView = onViewProvince || onView || (() => {});
  const handleEdit = onEditProvince || onEdit || (() => {});
  const handleDeleteItem = onDeleteProvince || onDelete || (() => {});

  const safeProvinces = provinces || [];

  return (
    <>
      {/* Mobile Card List View (sm:hidden) */}
      <div className="sm:hidden divide-y divide-[var(--color-border-subtle-light)] dark:divide-[var(--color-border-dark)]">
        {safeProvinces.length > 0 ? (
          safeProvinces.map((province) => (
            <div
              key={province.id}
              onClick={() => handleView(province)}
              className="p-4 flex flex-col gap-3 hover:bg-[var(--color-surface-hover-light)]/50 dark:hover:bg-[var(--color-surface-hover-dark)]/30 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[var(--color-rose-badge-text)] shrink-0" />
                    <p className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                      {province.name}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 mt-1 text-[10px] font-medium rounded-md border ${getTypeBadgeColor(province.type)}`}>
                    {province.type}
                  </span>
                </div>

                <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-semibold rounded-md border ${getStatusColor(province.status)}`}>
                  <Clock className="w-3 h-3" />
                  {province.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] pt-1 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
                <div>
                  <span className="text-[10px] text-[var(--color-text-muted-light)] block">Pop.</span>
                  <span className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">{province.population}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--color-text-muted-light)] block">Area</span>
                  <span className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">{province.area}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--color-text-muted-light)] block">Districts</span>
                  <span className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">{province.districts}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => handleView(province)}
                  className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleEdit(province)}
                  className="p-1.5 text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)] hover:bg-[var(--color-info-bg)] dark:hover:bg-[var(--color-info-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(province.id || province)}
                  className="p-1.5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">No provinces found</h3>
            <p className="text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Desktop Table View (hidden sm:block) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--color-border-subtle-light)] dark:divide-[var(--color-border-dark)]">
          <thead className="bg-[var(--color-surface-hover-light)]/50 dark:bg-[var(--color-surface-hover-dark)]/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider">Province</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider">Population</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider">Area</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider">Districts</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] divide-y divide-[var(--color-border-subtle-light)] dark:divide-[var(--color-border-dark)]">
            {safeProvinces.length > 0 ? (
              safeProvinces.map((province, index) => (
                <tr
                  key={province.id}
                  onClick={() => handleView(province)}
                  className="hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                      {province.name}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-md border ${getTypeBadgeColor(province.type)}`}>
                      {province.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                    {province.population}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                    {province.area}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                    {province.districts}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md border ${getStatusColor(province.status)}`}>
                      <Clock className="w-3 h-3" />
                      {province.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleView(province)}
                        className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(province)}
                        className="p-1.5 text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)] hover:bg-[var(--color-info-bg)] dark:hover:bg-[var(--color-info-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(province.id || province)}
                        className="p-1.5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-12">
                  <h3 className="text-lg font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">No provinces found</h3>
                  <p className="text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">Try adjusting your search or filter criteria</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
