import { IGetNationalityReport } from '@/lib/api/types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Nationality } from '../types';

export const calculateAllowedPercentage = (nationality: string): number => {
  switch (nationality) {
    case 'سعودي':
      return 100.0;
    case 'يمني':
      return 25.0;
    case 'أثيوبي':
      return 1.0;
    default:
      return 40.0;
  }
};

export const calculateMaxAdditionCount = (name: string, count: number, totalEmployees: number): number => {
  const allowedPercentage = calculateAllowedPercentage(name);

  // Calculate the exact target count needed to reach the allowed percentage
  const targetCount = (allowedPercentage / 100) * totalEmployees;

  // Calculate the difference, which tells us how much to add or remove
  const requiredAdjustment = Math.round(targetCount - count);

  return requiredAdjustment;
};

export const extractNationalities = (nationalityReport: IGetNationalityReport): Nationality[] => {
  return nationalityReport.result.split('|').map((entry) => {
    const [name, countStr, percentageStr] = entry.split(',').filter(Boolean);
    return {
      name,
      count: parseInt(countStr, 10),
      percentage: parseFloat(percentageStr),
      maxAdditionCount: calculateMaxAdditionCount(name, parseInt(countStr, 10), nationalityReport?.totalEmployees || 0),
      maxAdditionPercentage: calculateAllowedPercentage(name),
      requiredNumberToAdd: 0,
    };
  });
};

export const generatePDF = async (reportName: string) => {
  const element = document.getElementById('nationality-report-card');
  if (element) {
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/jpeg', 0.7);
    const pdf = new jsPDF('p', 'pt', 'a4');
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, 'JPEG', 0, 0, width, height);
    pdf.save(`${reportName}.pdf`);
  }
};
