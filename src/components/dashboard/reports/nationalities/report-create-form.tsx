'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Select } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CloudArrowUp, Minus, Plus, Trash } from '@phosphor-icons/react';
import { PlusCircle as PlusCircleIcon } from '@phosphor-icons/react/dist/ssr/PlusCircle';
import { AxiosResponse } from 'axios';
import { deleteObject, listAll, ref, StorageReference } from 'firebase/storage';
import { Controller, useForm } from 'react-hook-form';
import { QueryClient, QueryClientProvider } from 'react-query';
import { z as zod } from 'zod';

import { paths } from '@/paths';
import apiInstance from '@/lib/api/axios';
import { ICreateEntityResponse, ICreateNationalityReport, IGetCrnEntity } from '@/lib/api/types';
import { authClient } from '@/lib/auth/client';
import { dayjs } from '@/lib/dayjs';
import { logger } from '@/lib/default-logger';
import { getFirebaseStorage } from '@/lib/storage/firebase/client';
import { useDialog } from '@/hooks/use-dialog';
import type { ColumnDef } from '@/components/core/data-table';
import { DataTable } from '@/components/core/data-table';
import { Option } from '@/components/core/option';
import { toast } from '@/components/core/toaster';

import { useCrnEntities } from './hooks/useCrnEntities';
import { NationalitiesReportCard } from './nationalities-report-card';

const entitiesSchema = zod.object({
  crnId: zod.string().min(1, 'Commercial registration number is required'),
  entityId: zod.string().min(1, 'Entity ID is required'),
});

export type Values = zod.infer<typeof entitiesSchema>;

const defaultValues = {
  crnId: '',
  entityId: '',
} satisfies Values;

function EntityForm(): React.JSX.Element {
  const router = useRouter();
  const { isLoading, error, data: companies, isFetching } = useCrnEntities();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    getValues,
    setValue,
  } = useForm<Values>({ defaultValues, resolver: zodResolver(entitiesSchema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      try {
        const { data: user } = await authClient.getUser();

        // Make API request
        // 01. Create report
        const response: AxiosResponse<ICreateNationalityReport> = await apiInstance.post('reports/nationality', {
          entityId: parseInt(values.entityId, 10),
          userId: parseInt(user?.sub as string, 10),
        });

        toast.success('Nationality report created');
        router.push(paths.dashboard.reports.list);
      } catch (err) {
        logger.error(err);
        toast.error('Something went wrong!');
      }
    },
    [router]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent>
          <Stack divider={<Divider />} spacing={4}>
            <>
              <Controller
                control={control}
                name="crnId"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.crnId)}>
                    <InputLabel>Commercial Registration Number</InputLabel>
                    <Select
                      onChange={(e) => {
                        // update both the name and crn fields
                        const selectedCompany = companies?.find(
                          (company: IGetCrnEntity) => company.commercialRegistrationNumberId === e.target.value
                        );
                        if (selectedCompany?.commercialRegistrationNumberId) {
                          setValue('crnId', selectedCompany?.commercialRegistrationNumberId);
                          setValue('entityId', selectedCompany?.entityId);
                        }
                      }}
                    >
                      <Option value="">Choose a company</Option>
                      {companies?.map((company: IGetCrnEntity) => (
                        <Option
                          key={company.commercialRegistrationNumberId}
                          value={company.commercialRegistrationNumberId}
                        >
                          {company.commercialRegistrationNumberId} <Minus className="mx-1" />{' '}
                          <span className="text-sm text-gray-500">{company.commercialRegistrationNumberId}</span>
                        </Option>
                      ))}
                    </Select>
                    {errors.crnId ? <FormHelperText>{errors.crnId.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </>
          </Stack>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button color="secondary">Cancel</Button>
          <Button type="submit" variant="contained">
            Create report
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}

const queryClient = new QueryClient();

export function NationalitiesReportCreateForm() {
  const nationalitiesReportDialog = useDialog();

  return (
    <QueryClientProvider client={queryClient}>
      <EntityForm />
      {nationalitiesReportDialog.open ? (
        <NationalitiesReportCard
          onClose={nationalitiesReportDialog.handleClose}
          open={nationalitiesReportDialog.open}
          report={{
            name: 'Annual Nationality Report',
            result:
              'هندي 31 38.75%, فلبيني 1 1.25%, نيبالي 7 8.75%, باكستاني 4 5%, مصرى 5 6.25%, سعودي 8 10%, يمني 15 18.75%, سوداني 1 1.25%',
            saudis: 8,
            totalEmployees: 72,
          }}
        />
      ) : null}
    </QueryClientProvider>
  );
}
