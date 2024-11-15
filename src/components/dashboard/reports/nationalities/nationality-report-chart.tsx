'use client';

import * as React from 'react';
import { CircularProgress, OutlinedInput } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Flag as FlagIcon } from '@phosphor-icons/react/dist/ssr/Flag';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { NoSsr } from '@/components/core/no-ssr';

import { countries } from './data/countries';
import { useGetNationalityReport } from './hooks/useGetNationalityReport';
import { Nationality } from './types';
import { calculateMaxAdditionCount, extractNationalities } from './utils';

const bars = [
  { name: 'Percentage', dataKey: 'percentage', color: 'var(--mui-palette-primary-main)' },
  { name: 'Max Addition Percentage', dataKey: 'maxAddPercentage', color: 'var(--mui-palette-primary-100)' },
] satisfies { name: string; dataKey: string; color: string }[];

interface NationalityReportChartProps {
  reportId: string;
}
const CHART_HEIGHT = 550;

export function NationalityReportChart({ reportId }: NationalityReportChartProps): React.JSX.Element {
  const { isLoading, data: originalReport, error } = useGetNationalityReport({ id: reportId });
  const totalOriginalEmployees = Number(originalReport?.totalEmployees) - Number(originalReport?.saudis);
  const originalNationalities = originalReport ? extractNationalities(originalReport) : [];

  // Extract and manage nationality data
  const [nationalityData, setNationalityData] = React.useState<Nationality[]>([]);

  React.useEffect(() => {
    if (originalReport) {
      setNationalityData(extractNationalities(originalReport));
    }
  }, [originalReport]);

  // Transform data into the format expected by the chart
  const chartData = React.useMemo(() => {
    if (!nationalityData) return [];
    // return ma.map((nat) => ({
    //   name: nat.name,
    //   percentage: nat.percentage, // Actual percentage
    //   maxAddPercentage: Number(nat.maxAdditionPercentage), // Max allowed percentage
    //   count: nat.count,
    //   maxAdditionCount: Number(nat.maxAdditionCount),
    // }));
    return nationalityData.map((nat) => ({
      name: nat.name,
      percentage: nat.percentage, // Actual percentage
      maxAddPercentage: Number(nat.maxAdditionPercentage), // Max allowed percentage
      count: nat.count,
      maxAdditionCount: Number(nat.maxAdditionCount),
      requiredNumberToAdd: nat.requiredNumberToAdd,
    }));
  }, [nationalityData]);

  const handleRequiredNumberChange = (index: number, value: number) => {
    if (value < 0) return;

    setNationalityData((prevData) => {
      const updatedData = prevData.map((nat, i) => {
        if (i === index) {
          const updatedCount = originalNationalities[i].count + value;
          return {
            ...nat,
            count: updatedCount,
            requiredNumberToAdd: value,
          };
        }
        return nat;
      });

      // Recalculate total employees and adjust percentages
      const updatedTotalEmployees =
        totalOriginalEmployees + updatedData.reduce((acc, curr) => acc + curr.requiredNumberToAdd, 0);
      return updatedData.map((nat) => {
        const originalNat = originalNationalities.find((on) => on.name === nat.name);
        const updatedPercentage = Number(((nat.count / updatedTotalEmployees) * 100).toFixed(2));
        return {
          ...nat,
          percentage: updatedPercentage,
          maxAdditionCount: calculateMaxAdditionCount(originalNat?.name || '', nat.count, updatedTotalEmployees),
        };
      });
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error || !originalReport) return <Typography>Error loading data</Typography>;

  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar>
            <FlagIcon fontSize="var(--Icon-fontSize)" />
          </Avatar>
        }
        title="Nationalities Overview (Chart View)"
      />
      <CardContent className="relative">
        <Grid container spacing={4}>
          <Grid
            size={{
              md: 9,
              xs: 12,
            }}
          >
            <Stack divider={<Divider />} spacing={3}>
              <NoSsr fallback={<Box sx={{ height: `${CHART_HEIGHT}px` }} />}>
                <ResponsiveContainer height={CHART_HEIGHT} className="mt-10">
                  <BarChart
                    barGap={10}
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 20, right: 0, bottom: 0, left: 200 }}
                  >
                    <CartesianGrid horizontal={false} strokeDasharray="2 4" syncWithTicks />
                    <XAxis axisLine={false} tickLine={false} type="number" tick={<XTick />} />
                    <YAxis
                      axisLine={false}
                      dataKey="name"
                      tick={(props) => (
                        <YTick
                          {...props}
                          payload={{
                            ...props.payload,
                            flag: countries[props.payload?.value as keyof typeof countries]?.flag,
                            count: chartData[props.index].count,
                            maxAdditionCount: chartData[props.index].maxAdditionCount,
                          }}
                        />
                      )}
                      tickLine={false}
                      type="category"
                    />
                    {bars.map(
                      (bar): React.JSX.Element => (
                        <Bar
                          animationDuration={300}
                          barSize={12}
                          dataKey={bar.dataKey}
                          fill={bar.color}
                          key={bar.name}
                          name={bar.name}
                          radius={[5, 5, 5, 5]}
                        />
                      )
                    )}
                    <Tooltip animationDuration={50} content={<TooltipContent />} cursor={false} />
                  </BarChart>
                </ResponsiveContainer>
              </NoSsr>
              <Legend />
            </Stack>
          </Grid>

          <Grid
            size={{
              md: 3,
              xs: 12,
            }}
            sx={{
              mt: 5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'between',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <Stack
              spacing={2}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'between',
                flexDirection: 'column',
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{
                  width: '100%',
                }}
              >
                <Typography variant="body2" align="left">
                  Require number to add
                </Typography>
                <Typography variant="body2" align="left">
                  Max addition
                </Typography>
              </Stack>
              {chartData.map((nat, index) => (
                <Stack direction="row" key={nat.name} spacing={2} alignItems="center" className="mb-[14px]">
                  {/* <Typography variant="body2">Require number to add</Typography> */}
                  <OutlinedInput
                    type="number"
                    value={nat.requiredNumberToAdd || 0}
                    onChange={(e) => handleRequiredNumberChange(index, Number(e.target.value))}
                  />
                  <OutlinedInput
                    type="number"
                    // display maxAddition count
                    value={nat.maxAdditionCount < 0 ? 0 : nat.maxAdditionCount}
                    disabled
                  />
                </Stack>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

interface YTickProps {
  height?: number;
  payload?: { name: string; value: string; count: number; maxAdditionCount: number };
  width?: number;
  x?: number;
  y?: number;
}

function YTick({ height, payload, width, x, y }: YTickProps): React.JSX.Element {
  const { nameAr, flag } = countries[payload?.value as keyof typeof countries] ?? { name: 'Unknown', flag: '' };
  console.log(nameAr, flag);
  return (
    <foreignObject height={width} width={height} x={(x ?? 0) - 240} y={(y ?? 0) - 13}>
      <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Box sx={{ height: '1rem', width: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box alt={nameAr} component="img" src={flag} sx={{ height: 'auto', width: '100%' }} />
          </Box>
          <Typography noWrap variant="body2">
            {payload?.value} ({payload?.count})
          </Typography>
        </Stack>

        <Typography
          noWrap
          variant="body2"
          sx={{
            color:
              Number(payload?.maxAdditionCount) < 0
                ? 'var(--mui-palette-text-secondary)'
                : 'var(--mui-palette-text-main)',
          }}
        >
          {Number(payload?.maxAdditionCount) < 0 ? 0 : payload?.maxAdditionCount}
        </Typography>
      </Stack>
    </foreignObject>
  );
}

interface XTickProps {
  height?: number;
  payload?: { value: string };
  width?: number;
  x?: number;
  y?: number;
}

function XTick({ height, payload, width, x, y }: XTickProps): React.JSX.Element {
  return (
    <foreignObject height={height} width={width} x={Number(x) - 22} y={y ?? 0}>
      <Typography
        noWrap
        variant="body2"
        sx={{
          color: 'var(--mui-palette-text-secondary)',
        }}
      >
        {payload?.value}%
      </Typography>
    </foreignObject>
  );
}

function Legend(): React.JSX.Element {
  return (
    <Stack direction="row" spacing={2}>
      {bars.map((bar) => (
        <Stack direction="row" key={bar.name} spacing={1} sx={{ alignItems: 'center' }}>
          <Box sx={{ bgcolor: bar.color, borderRadius: '2px', height: '4px', width: '16px' }} />
          <Typography color="text.secondary" variant="caption">
            {bar.name}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}

interface TooltipContentProps {
  active?: boolean;
  payload?: { fill: string; name: string; value: number }[];
  label?: string;
}

function TooltipContent({ active, payload }: TooltipContentProps): React.JSX.Element | null {
  if (!active) {
    return null;
  }

  return (
    <Paper sx={{ border: '1px solid var(--mui-palette-divider)', boxShadow: 'var(--mui-shadows-16)', p: 1 }}>
      <Stack spacing={2}>
        {payload?.map(
          (entry): React.JSX.Element => (
            <Stack direction="row" key={entry.name} spacing={3} sx={{ alignItems: 'center' }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flex: '1 1 auto' }}>
                <Box sx={{ bgcolor: entry.fill, borderRadius: '2px', height: '8px', width: '8px' }} />
                <Typography sx={{ whiteSpace: 'nowrap' }}>{entry.name}</Typography>
              </Stack>
              <Typography color="text.secondary" variant="body2">
                {new Intl.NumberFormat('en-US').format(entry.value)}
              </Typography>
            </Stack>
          )
        )}
      </Stack>
    </Paper>
  );
}
