'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Select } from '@mui/material';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import { AxiosResponse } from 'axios';
import { Controller, useForm } from 'react-hook-form';
import { QueryClient, QueryClientProvider } from 'react-query';
import { z as zod } from 'zod';

import { paths } from '@/paths';
import apiInstance from '@/lib/api/axios';
import { ICreateNationalityReport, IGetCrnEntity } from '@/lib/api/types';
import { authClient } from '@/lib/auth/client';
import { logger } from '@/lib/default-logger';
import { useDialog } from '@/hooks/use-dialog';
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

type EntityFormProps = {
  openDialog: () => void;
  setNationalityReport: (nationalityReport: ICreateNationalityReport | null) => void;
};

function EntityForm({ openDialog, setNationalityReport }: EntityFormProps): React.JSX.Element {
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

        // 02. Set the report
        setNationalityReport(response.data);

        // 03. Open the dialog
        openDialog();
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
                          {company.commercialRegistrationNumber.crName}
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
  const [nationalityReport, setNationalityReport] = React.useState<ICreateNationalityReport | null>(null);
  const nationalitiesReportDialog = useDialog();

  return (
    <QueryClientProvider client={queryClient}>
      <EntityForm openDialog={nationalitiesReportDialog.handleOpen} setNationalityReport={setNationalityReport} />
      {nationalitiesReportDialog.open ? (
        <NationalitiesReportCard
          onClose={nationalitiesReportDialog.handleClose}
          open={nationalitiesReportDialog.open}
          report={nationalityReport}
        />
      ) : null}
    </QueryClientProvider>
  );
}
