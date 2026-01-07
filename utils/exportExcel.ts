
export const exportToExcel = (sections: { sheetName: string, data: any[] }[], fileName: string) => {
  const XLSX = (window as any).XLSX;
  if (!XLSX) {
    alert("يرجى الانتظار، مكتبة التصدير قيد التحميل...");
    return;
  }

  const wb = XLSX.utils.book_new();

  sections.forEach(section => {
    if (section.data.length > 0) {
      const ws = XLSX.utils.json_to_sheet(section.data);
      
      // ضبط اتجاه الصفحة من اليمين لليسار
      if (!ws['!views']) ws['!views'] = [];
      ws['!views'].push({ RTL: true });

      // ضبط عرض الأعمدة تلقائياً
      const wscols = Object.keys(section.data[0] || {}).map(() => ({ wch: 22 }));
      ws['!cols'] = wscols;

      XLSX.utils.book_append_sheet(wb, ws, section.sheetName);
    }
  });

  if (wb.SheetNames.length === 0) {
    alert("لا توجد بيانات لتصديرها في هذه الفترة");
    return;
  }

  XLSX.writeFile(wb, `${fileName}.xlsx`);
};
