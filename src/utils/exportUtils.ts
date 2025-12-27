import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToJSON = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    link.click();
};

export const exportToExcel = (data: any[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToXML = (data: any[], filename: string) => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';
    data.forEach(item => {
        xml += '  <item>\n';
        Object.entries(item).forEach(([key, value]) => {
            xml += `    <${key}>${value}</${key}>\n`;
        });
        xml += '  </item>\n';
    });
    xml += '</root>';
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.xml`;
    link.click();
};

export const exportToPDF = (data: any[], filename: string, title: string) => {
    const doc = new jsPDF() as any;
    doc.text(title, 14, 15);

    const headers = Object.keys(data[0] || {});
    const rows = data.map(item => Object.values(item));

    doc.autoTable({
        head: [headers],
        body: rows,
        startY: 20,
    });

    doc.save(`${filename}.pdf`);
};
