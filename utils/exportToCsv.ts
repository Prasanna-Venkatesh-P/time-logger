export function exportToCSV(logs: any[], filename: string = "logs"): void {
    // Generate timestamp for filename
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);
    
    // Create CSV content
    const csvRows = [
      ['"Activity"', '"Time"', '"Date"'].join(','), // Header with quoted columns
      ...logs.map(log => {
        const time = new Date(log.created_at + "Z").toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        });
        
        const date = new Date(log.created_at + "Z").toLocaleDateString([], {
          month: 'short',
          day: 'numeric'
        });
  
        return [
          `"${log.activity.replace(/"/g, '""')}"`, // Properly escaped CSV value
          `"${time}"`,
          `"${date}"`
        ].join(',');
      })
    ];
  
    // Create and trigger download
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${timestamp}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }