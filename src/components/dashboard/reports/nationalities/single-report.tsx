'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { CircularProgress, OutlinedInput } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Flag, Minus, Plus, Printer } from '@phosphor-icons/react';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { Folder as FolderIcon } from '@phosphor-icons/react/dist/ssr/Folder';
import { Info as InfoIcon } from '@phosphor-icons/react/dist/ssr/Info';
import { PencilSimple as PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { QueryClient, QueryClientProvider } from 'react-query';

import { paths } from '@/paths';
import { IGetNationalityReport } from '@/lib/api/types';
import { dayjs } from '@/lib/dayjs';
import type { ColumnDef } from '@/components/core/data-table';
import { DataTable } from '@/components/core/data-table';
import { PropertyItem } from '@/components/core/property-item';
import { PropertyList } from '@/components/core/property-list';

import { useGetNationalityReport } from './hooks/useGetNationalityReport';

// Utility functions
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

const calculateMaxAdditionCount = (name: string, count: number, totalEmployees: number): number => {
  const allowedPercentage = calculateAllowedPercentage(name);

  // Calculate the exact target count needed to reach the allowed percentage
  const targetCount = (allowedPercentage / 100) * totalEmployees;

  // Calculate the difference, which tells us how much to add or remove
  const requiredAdjustment = Math.round(targetCount - count);

  return requiredAdjustment;
};

// PDF generation function
const generatePDF = async (reportName: string) => {
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

// Interface for Nationality data
interface Nationality {
  name: string;
  count: number;
  percentage: number;
  maxAdditionCount: number;
  maxAdditionPercentage: number;
  requiredNumberToAdd: number;
}

// Table component for Nationalities
interface NationalitiesTableProps {
  nationalities: Nationality[];
  totalEmployees: number;
  reportId: string;
}

const extractNationalities = (nationalityReport: IGetNationalityReport): Nationality[] => {
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

export function NationalitiesTable({
  nationalities,
  totalEmployees,
  reportId,
}: NationalitiesTableProps): React.JSX.Element {
  const { isLoading, data: originalReport } = useGetNationalityReport({ id: reportId });

  const totalOriginalEmployees = originalReport?.totalEmployees || 0;
  const originalNationalities = originalReport ? extractNationalities(originalReport) : [];

  const [nationalityData, setNationalityData] = React.useState<Nationality[]>(originalNationalities);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleRequiredNumberChange = (index: number, value: number) => {
    if (value < 0) return;

    setNationalityData((prevData) =>
      prevData.map((nat, i) => {
        if (i === index) {
          const originalNat = originalNationalities[i];
          const updatedCount = originalNat.count + value;
          const updatedPercentage = Number(((updatedCount / (totalOriginalEmployees + value)) * 100).toFixed(2));
          const updatedMaxAdditionCount = calculateMaxAdditionCount(
            originalNat.name,
            updatedCount,
            totalOriginalEmployees
          );

          return {
            ...nat,
            count: updatedCount,
            percentage: updatedPercentage,
            maxAdditionCount: updatedMaxAdditionCount,
            requiredNumberToAdd: value,
          };
        }
        return nat; // Return unchanged data for other rows
      })
    );
  };

  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar>
            <Flag fontSize="inherit" />
          </Avatar>
        }
        title="Nationalities Overview"
      />
      <CardContent>
        <Stack spacing={3}>
          <Card variant="outlined" sx={{ borderRadius: 1 }}>
            <Box sx={{ overflowX: 'auto' }}>
              <DataTable<Nationality>
                columns={[
                  {
                    name: 'Nationality',
                    formatter: (row) => (
                      <Typography sx={{ whiteSpace: 'nowrap' }} variant="inherit">
                        {row.name}
                      </Typography>
                    ),
                  },
                  {
                    name: 'Count',
                    formatter: (row) => (
                      <Typography sx={{ whiteSpace: 'nowrap' }} variant="inherit">
                        {row.count}
                      </Typography>
                    ),
                  },
                  {
                    name: 'Percentage',
                    formatter: (row) => (
                      <Typography sx={{ whiteSpace: 'nowrap' }} variant="inherit">
                        {row.percentage}%
                      </Typography>
                    ),
                  },
                  {
                    name: 'Max Addition',
                    formatter: (row) => (
                      <Typography
                        sx={{
                          whiteSpace: 'nowrap',
                          color: row.maxAdditionCount < 0 ? 'red' : 'inherit',
                        }}
                        variant="inherit"
                      >
                        {row.maxAdditionCount}
                      </Typography>
                    ),
                  },
                  {
                    name: 'Max Addition Percentage',
                    formatter: (row) => (
                      <Typography sx={{ whiteSpace: 'nowrap' }} variant="inherit">
                        {row.maxAdditionPercentage}%
                      </Typography>
                    ),
                  },
                  {
                    name: 'Required Number to Add',
                    formatter: (row, index) => (
                      <OutlinedInput
                        type="number"
                        value={row.requiredNumberToAdd}
                        onChange={(e) => handleRequiredNumberChange(index, Number(e.target.value))}
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

function SingleReport({ params }: { params: { reportId: string } }): React.JSX.Element {
  const {
    isLoading,
    error,
    data: nationalityReport,
    isFetching,
  } = useGetNationalityReport({
    id: params.reportId,
  });

  const calculateSaudisPercentage = () => {
    if (!nationalityReport) return 0;
    return parseInt((((nationalityReport.saudis || 0) / (nationalityReport.totalEmployees || 0)) * 100).toString(), 10);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 'var(--Content-maxWidth)',
        m: 'var(--Content-margin)',
        p: 'var(--Content-padding)',
        width: 'var(--Content-width)',
      }}
      id="nationality-report-card"
    >
      <Stack spacing={4}>
        <Stack spacing={3}>
          <div>
            <Link
              color="text.primary"
              component={RouterLink}
              href={paths.dashboard.customers.list}
              sx={{ alignItems: 'center', display: 'inline-flex', gap: 1 }}
              variant="subtitle2"
            >
              <ArrowLeftIcon fontSize="var(--icon-fontSize-md)" />
              Reports
            </Link>
          </div>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ alignItems: 'flex-start' }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flex: '1 1 auto' }}>
              <div>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                  <Typography variant="h4">{nationalityReport?.name}</Typography>
                  {/* <Chip
                    icon={<CheckCircleIcon color="var(--mui-palette-success-main)" weight="fill" />}
                    label="Active"
                    size="small"
                    variant="outlined"
                  /> */}
                </Stack>
                <Typography color="text.secondary" variant="body1">
                  {dayjs(nationalityReport?.createdAt).format('MMM D, YYYY hh:mm A')}
                </Typography>
              </div>
            </Stack>
            <div className="min-w-64 flex items-center justify-end">
              <Button
                endIcon={<Printer />}
                variant="contained"
                onClick={() => generatePDF(nationalityReport?.name || '')}
              >
                Print report
              </Button>
            </div>
          </Stack>
        </Stack>
        <Grid container spacing={4}>
          <Grid
            size={{
              lg: 12,
              xs: 12,
            }}
          >
            <Stack spacing={4}>
              <Card>
                <CardHeader
                  avatar={
                    <Avatar>
                      <InfoIcon fontSize="var(--Icon-fontSize)" />
                    </Avatar>
                  }
                  title="Disclaimer"
                />
                <CardContent>
                  <Stack spacing={1}>
                    {[
                      'This report presents the proportions of nationalities in unified number establishments, enabling employers to determine the number of individuals they can recruit from each nationality.',
                      'The maximum percentages for nationalities announced by the Ministry of Human Resources are: 40% for Indian and Bangladeshi nationalities, 25% for Yemeni nationality, and 1% for Ethiopian nationality.',
                      'The report is based on the assumption that the maximum limit for each nationality is 40%, except for nationalities specified by the Ministry of Human Resources. Adhering to this assumption is recommended to avoid exceeding the maximum limits for nationalities during transfer of sponsorship or issuance of new visas.',
                      "It's essential to understand that the number that can be added without exceeding the allowed limit does not represent a recruitment quota but rather the maximum number allowed for each nationality, provided that the establishment has a recruitment quota available.",
                    ].map(
                      (item): React.JSX.Element => (
                        <Typography
                          color="text.secondary"
                          variant="body2"
                          className="my-1 flex items-center gap-x-2 p-2"
                        >
                          <Minus /> <span>{item}</span>
                        </Typography>
                      )
                    )}
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardHeader
                  action={
                    <IconButton>
                      <PencilSimpleIcon />
                    </IconButton>
                  }
                  avatar={
                    <Avatar>
                      <FolderIcon fontSize="var(--Icon-fontSize)" />
                    </Avatar>
                  }
                  title="Basic details"
                />
                <PropertyList
                  divider={<Divider />}
                  orientation="vertical"
                  sx={{ '--PropertyItem-padding': '12px 24px' }}
                >
                  {(
                    [
                      {
                        key: 'Report Number',
                        value: <Chip label={nationalityReport?.id} size="small" variant="soft" />,
                      },
                      { key: 'Name', value: nationalityReport?.name },
                      { key: 'Companies', value: nationalityReport?.companies },
                      {
                        key: 'Total uncounted saudis from all companies in this report',
                        value: (
                          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                            <LinearProgress
                              sx={{ flex: '1 1 auto' }}
                              value={calculateSaudisPercentage() > 100 ? 100 : calculateSaudisPercentage()}
                              variant="determinate"
                            />
                            <Typography color="text.secondary" variant="body2">
                              {calculateSaudisPercentage() > 100 ? 100 : calculateSaudisPercentage()}% (
                              {nationalityReport?.saudis} out of {nationalityReport?.totalEmployees})
                            </Typography>
                          </Stack>
                        ),
                      },
                    ] satisfies { key: string; value: React.ReactNode }[]
                  ).map(
                    (item): React.JSX.Element => (
                      <PropertyItem key={item.key} name={item.key} value={item.value} />
                    )
                  )}
                </PropertyList>
              </Card>

              <NationalitiesTable
                nationalities={extractNationalities(nationalityReport as IGetNationalityReport)}
                totalEmployees={nationalityReport?.totalEmployees || 0}
                reportId={nationalityReport?.id || ''}
              />

              <Card>
                <CardHeader
                  avatar={
                    <Avatar>
                      <InfoIcon fontSize="var(--Icon-fontSize)" />
                    </Avatar>
                  }
                  title="Security"
                />
                <CardContent>
                  <Stack spacing={1}>
                    <div>
                      <Button color="error" variant="contained">
                        Delete report
                      </Button>
                    </div>
                    <Typography color="text.secondary" variant="body2">
                      A deleted report cannot be recovered. All the data will be lost.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}

const queryClient = new QueryClient();

export function SingleReportPage({ params }: { params: { reportId: string } }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SingleReport params={params} />
    </QueryClientProvider>
  );
}
