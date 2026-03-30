import { useCallback } from 'react';

export const useExports = (data) => {
  const exportCSV = useCallback(() => {
    const headers = ['ID', 'Proyecto', 'Título', 'Estado', 'Versión', 'Peso', 'Tipo'];
    const rows = [...data.backlog, ...data.anomalies, ...data.masters].map(item => [
      item.id,
      item.project_id || item.project,
      `"${item.title?.replace(/"/g, '""')}"`,
      item.status,
      item.version,
      item.weight,
      item.type
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `nereohub_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [data]);

  const exportExcel = useCallback(() => {
    // Basic CSV as Excel fallback if library not loaded
    exportCSV();
  }, [exportCSV]);

  const exportPDF = useCallback(() => {
     window.print();
  }, []);

  return { exportCSV, exportExcel, exportPDF };
};
