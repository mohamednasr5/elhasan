
export const exportToExcel = (sections: { sheetName: string, data: any[] }[], fileName: string) => {
  const XLSX = (window as any).XLSX;
  if (!XLSX) return alert("مكتبة التصدير غير جاهزة!");
  
  const wb = XLSX.utils.book_new();
  sections.forEach(section => {
    if (section.data.length > 0) {
      const ws = XLSX.utils.json_to_sheet(section.data);
      if (!ws['!views']) ws['!views'] = [];
      ws['!views'].push({ RTL: true });
      const wscols = Object.keys(section.data[0] || {}).map(() => ({ wch: 22 }));
      ws['!cols'] = wscols;
      XLSX.utils.book_append_sheet(wb, ws, section.sheetName);
    }
  });
  
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};
