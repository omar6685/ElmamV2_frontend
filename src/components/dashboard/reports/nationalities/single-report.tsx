'use client';

import * as React from 'react';
import RouterLink from 'next/link';
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
import { Flag, Plus } from '@phosphor-icons/react';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { CaretDown as CaretDownIcon } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { CheckCircle as CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { Folder as FolderIcon } from '@phosphor-icons/react/dist/ssr/Folder';
import { PencilSimple as PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { ShieldWarning as ShieldWarningIcon } from '@phosphor-icons/react/dist/ssr/ShieldWarning';
import { ShoppingCartSimple as ShoppingCartSimpleIcon } from '@phosphor-icons/react/dist/ssr/ShoppingCartSimple';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { QueryClient, QueryClientProvider } from 'react-query';

import { paths } from '@/paths';
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
  let actualPercentage = (count / totalEmployees) * 100;
  let increment = 0;

  while (actualPercentage <= allowedPercentage) {
    increment += 1;
    actualPercentage = ((count + increment) / (totalEmployees + increment)) * 100;
  }
  return Math.max(0, increment - 1);
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
}

export function NationalitiesTable({ nationalities, totalEmployees }: NationalitiesTableProps): React.JSX.Element {
  const [nationalityData, setNationalityData] = React.useState<Nationality[]>(
    nationalities.map((nat) => ({
      ...nat,
      maxAdditionCount: calculateMaxAdditionCount(nat.name, nat.count, totalEmployees),
      requiredNumberToAdd: 0,
    }))
  );

  const handleRequiredNumberChange = (index: number, value: number) => {
    setNationalityData((prevData) =>
      prevData.map((nat, i) =>
        i === index
          ? {
              ...nat,
              requiredNumberToAdd: value,
              maxAdditionCount: calculateMaxAdditionCount(nat.name, nat.count + value, totalEmployees),
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
            Add Nationality
          </Button>
        }
        avatar={
          <Avatar>
            <Flag fontSize="var(--Icon-fontSize)" />
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
                  { label: 'Nationality', key: 'name' },
                  { label: 'Count', key: 'count' },
                  { label: 'Percentage', key: 'percentage', format: (val) => `${val}%` },
                  { label: 'Max Addition Count', key: 'maxAdditionCount' },
                  {
                    label: 'Max Addition Percentage',
                    key: 'maxAdditionPercentage',
                    format: (val) => `${val.toFixed(2)}%`,
                  },
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

  return (
    <Box
      sx={{
        maxWidth: 'var(--Content-maxWidth)',
        m: 'var(--Content-margin)',
        p: 'var(--Content-padding)',
        width: 'var(--Content-width)',
      }}
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
                  {nationalityReport?.createdAt}
                </Typography>
              </div>
            </Stack>
            <div>
              <Button endIcon={<Plus />} variant="contained">
                Create report
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
                              {calculateSaudisPercentage() > 100 ? 100 : calculateSaudisPercentage()}%
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
              <Card>
                <CardHeader
                  avatar={
                    <Avatar>
                      <ShieldWarningIcon fontSize="var(--Icon-fontSize)" />
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
              <Card>
                <CardHeader
                  avatar={
                    <Avatar>
                      <ShieldWarningIcon fontSize="var(--Icon-fontSize)" />
                    </Avatar>
                  }
                  title="Security"
                />
                <CardContent>
                  <NationalitiesTable nationalities={[]} totalEmployees={nationalityReport?.totalEmployees || 0} />
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
