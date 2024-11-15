'use client';

import * as React from 'react';
import { CircularProgress, OutlinedInput } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Flag } from '@phosphor-icons/react';

import { DataTable } from '@/components/core/data-table';

import { useGetNationalityReport } from './hooks/useGetNationalityReport';
import { Nationality } from './types';
import { calculateMaxAdditionCount, extractNationalities } from './utils';

// Table component for Nationalities
interface NationalitiesTableProps {
  reportId: string;
}

export function NationalitiesTable({ reportId }: NationalitiesTableProps): React.JSX.Element {
  const { isLoading, data: originalReport, error } = useGetNationalityReport({ id: reportId });
  const totalOriginalEmployees = Number(originalReport?.totalEmployees) - Number(originalReport?.saudis);
  const originalNationalities = originalReport ? extractNationalities(originalReport) : [];
  const [nationalityData, setNationalityData] = React.useState<Nationality[]>(originalNationalities);

  React.useEffect(() => {
    if (originalReport) {
      setNationalityData(extractNationalities(originalReport));
    }
  }, [originalReport]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error || !originalReport) return <Typography>Error loading data</Typography>;

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

  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar>
            <Flag fontSize="inherit" />
          </Avatar>
        }
        title="Nationalities Overview (Table View)"
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
                        {row.maxAdditionCount < 0 ? 0 : row.maxAdditionCount}
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
              {/* <span>Sum percentage: {nationalityData.reduce((acc, curr) => acc + curr.percentage, 0)}%</span> */}
              {/* <br /> */}
              {/* <span>Total employees: {totalEmployees}</span> */}
            </Box>
          </Card>
        </Stack>
      </CardContent>
    </Card>
  );
}
