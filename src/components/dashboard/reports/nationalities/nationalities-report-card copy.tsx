import * as React from 'react';
import { Box, Button, CircularProgress, Dialog } from '@mui/material';
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
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { ShoppingCartSimple as ShoppingCartSimpleIcon } from '@phosphor-icons/react/dist/ssr/ShoppingCartSimple';
import { useState } from 'react';

import { dayjs } from '@/lib/dayjs';
import type { ColumnDef } from '@/components/core/data-table';
import { DataTable } from '@/components/core/data-table';
import { ICreateNationalityReport } from '@/lib/api/types';



// Define the Nationality interface
interface Nationality {
  name: string;
  count: number;
  percentage: number;
  maxAdditionCount: number;
  maxAdditionPercentage: number;
  requiredNumberToAdd: number;
}

// Define the component props interface
export interface NationalitiesTableProps {
  nationalities: Nationality[];
  totalEmployees: number;
  ordersValue: number;
  refundsValue: number;
  totalOrders: number;
}

export function NationalitiesTable({
  nationalities,
  totalEmployees,
  ordersValue,
  refundsValue,
  totalOrders,
}: NationalitiesTableProps): React.JSX.Element {
  const [nationalityData, setNationalityData] = useState<Nationality[]>(
    nationalities.map((nat) => ({
      ...nat,
      maxAdditionCount: calculateMaxAdditionCount(nat.name, nat.count),
      requiredNumberToAdd: 0,
    }))
  );

  // Calculates the max addition count for a given nationality
  const calculateAllowedPercentage = (nationality: string): number => {
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

  const calculateMaxAdditionCount = (name: string, count: number): number => {
    const allowedPercentage = calculateAllowedPercentage(name);
    let actualPercentage = (count / totalEmployees) * 100;
    let inc = 0;

    while (actualPercentage <= allowedPercentage) {
      inc += 1;
      actualPercentage = ((count + inc) / (totalEmployees + inc)) * 100;
    }

    return Math.max(0, inc - 1);
  };

  const handleRequiredNumberChange = (index: number, value: number) => {
    setNationalityData((prevData) =>
      prevData.map((nat, i) =>
        i === index
          ? {
              ...nat,
              requiredNumberToAdd: value,
              maxAdditionCount: calculateMaxAdditionCount(nat.name, nat.count + value),
              maxAdditionPercentage: ((nat.count + value) / (totalEmployees + value)) * 100,
            }
          : nat
      )
    );
  };

  return (
    <Card>
      <CardHeader
        action={
          <Button color="secondary" startIcon={<PlusIcon />}>
            Create Nationality
          </Button>
        }
        avatar={
          <Avatar>
            <ShoppingCartSimpleIcon fontSize="var(--Icon-fontSize)" />
          </Avatar>
        }
        title="Nationalities"
      />
      <CardContent>
        <Stack spacing={3}>
          <Card sx={{ borderRadius: 1 }} variant="outlined">
            <Stack
              direction="row"
              divider={<Divider flexItem orientation="vertical" />}
              spacing={3}
              sx={{ justifyContent: 'space-between', p: 2 }}
            >
              <div>
                <Typography color="text.secondary" variant="overline">
                  Total orders
                </Typography>
                <Typography variant="h6">{new Intl.NumberFormat('en-US').format(totalOrders)}</Typography>
              </div>
              <div>
                <Typography color="text.secondary" variant="overline">
                  Orders value
                </Typography>
                <Typography variant="h6">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(ordersValue)}
                </Typography>
              </div>
              <div>
                <Typography color="text.secondary" variant="overline">
                  Refunds
                </Typography>
                <Typography variant="h6">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(refundsValue)}
                </Typography>
              </div>
            </Stack>
          </Card>
          <Card sx={{ borderRadius: 1 }} variant="outlined">
            <Box sx={{ overflowX: 'auto' }}>
              <DataTable<Nationality>
                columns={[
                  { label: 'Nationality', key: 'name' },
                  { label: 'Count', key: 'count' },
                  { label: 'Percentage', key: 'percentage', format: (val) => `${val}%` },
                  { label: 'Max Addition Count', key: 'maxAdditionCount' },
                  { label: 'Max Addition Percentage', key: 'maxAdditionPercentage', format: (val) => `${val.toFixed(2)}%` },
                  {
                    label: 'Required Number to Add',
                    key: 'requiredNumberToAdd',
                    render: (row, index) => (
                      <input
                        type="number"
                        value={row.requiredNumberToAdd}
                        onChange={(e) => handleRequiredNumberChange(index, parseInt(e.target.value))}
                      />
                    ),
                  },
                ]}
                rows={nationalityData}
              />
            </Box>
          </Card>
        </Stack>
      </CardContent>
    </Card>
  );
}



export interface NationalitiesReportCardProps {
  onClose: () => void;
  open: boolean;
  report: ICreateNationalityReport | null;
}

export function NationalitiesReportCard({ report, onClose, open }: NationalitiesReportCardProps): React.JSX.Element {
  if (!report)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );

  const { name, result, saudis = 0, totalEmployees = 0 } = report;

  const nationalities = result
    ? result.split('|').map((entry) => {
        const [name, countStr, percentageStr] = entry.split(',').filter(Boolean);
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
      pdf.save(report.name + '.pdf');
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
