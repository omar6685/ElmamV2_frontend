import * as React from 'react';
import { Button, Dialog } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Printer } from '@phosphor-icons/react';
import { Flag as FlagIcon } from '@phosphor-icons/react/dist/ssr/Flag';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface NationalitiesReportCardProps {
  onClose: () => void;
  open: boolean;
  report: {
    name: string | null;
    result: string | null;
    saudis: number | null;
    totalEmployees: number | null;
  };
}

export function NationalitiesReportCard({ report, onClose, open }: NationalitiesReportCardProps): React.JSX.Element {
  const { name, result, saudis = 0, totalEmployees = 0 } = report;

  const nationalities = result
    ? result.split(',').map((entry) => {
        const [name, countStr, percentageStr] = entry.split(' ').filter(Boolean);
        return {
          name,
          count: parseInt(countStr, 10),
          percentage: percentageStr,
        };
      })
    : [];

  // PDF generation function
  const handlePrint = async () => {
    const element = document.getElementById('nationality-report-card');
    if (element) {
      const canvas = await html2canvas(element, {
        scale: 2, // Adjust the scale to reduce resolution
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.7); // Set quality to 70%
      const pdf = new jsPDF('p', 'pt', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, width, height);
      pdf.save('nationality-report.pdf');
    }
  };

  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <Card id="nationality-report-card" sx={{ position: 'relative' }}>
        <CardHeader
          avatar={
            <Avatar>
              <FlagIcon fontSize="var(--Icon-fontSize)" />
            </Avatar>
          }
          title={name || 'Nationality Report'}
        />
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={5}>
            <Stack spacing={3} sx={{ flex: '0 0 auto', justifyContent: 'space-between', width: '260px' }}>
              <Stack spacing={2}>
                <Typography color="primary.main" variant="h2">
                  {saudis}
                </Typography>
                <Typography color="text.secondary">Saudi nationals</Typography>
              </Stack>
              <div>
                <Typography color="text.secondary" variant="body2">
                  <Typography color="primary.main" component="span" variant="subtitle2">
                    {totalEmployees}
                  </Typography>{' '}
                  total employees
                </Typography>
              </div>
            </Stack>
            <Stack spacing={2} sx={{ flex: '1 1 auto' }}>
              {nationalities.map(({ name, count, percentage }) => (
                <div key={name}>
                  <Typography variant="subtitle1">{name}</Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <LinearProgress
                      sx={{ flex: '1 1 auto', height: '6px' }}
                      value={parseFloat(percentage)}
                      variant="determinate"
                    />
                    <Typography variant="body2">
                      {count} ({percentage})
                    </Typography>
                  </Stack>
                </div>
              ))}
            </Stack>
          </Stack>
        </CardContent>

        {/* Print report button */}
        <Stack direction="row" justifyContent="flex-end" p={3} mt={2}>
          <Button variant="contained" endIcon={<Printer />} onClick={handlePrint}>
            Print report
          </Button>
        </Stack>
      </Card>
    </Dialog>
  );
}
