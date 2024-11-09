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
import { ICreateEntityResponse } from '@/lib/api/types';
import { authClient } from '@/lib/auth/client';
import { dayjs } from '@/lib/dayjs';
import { logger } from '@/lib/default-logger';
import { getFirebaseStorage } from '@/lib/storage/firebase/client';
import { useDialog } from '@/hooks/use-dialog';
import type { ColumnDef } from '@/components/core/data-table';
import { DataTable } from '@/components/core/data-table';
import { Option } from '@/components/core/option';
import { toast } from '@/components/core/toaster';

import { useActivities } from './hooks/useCompanies';

const entitiesSchema = zod.object({
  name: zod.string().min(1, 'Name is required'),
  crn: zod.string().min(1, 'Commercial registration number is required'),
});

export type Values = zod.infer<typeof entitiesSchema>;

const defaultValues = {
  name: '',
  crn: '',
} satisfies Values;

function EntityForm(): React.JSX.Element {
  const router = useRouter();
  const addCompanyDialog = useDialog();

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
        console.log('Entity created', values);

        toast.success('Entity created');
        router.push(paths.dashboard.entities.list);
      } catch (err) {
        logger.error(err);
        toast.error('Something went wrong!');
      }
    },
    [router]
  );

  const handleAdd = React.useCallback(() => {
    addCompanyDialog.handleOpen();
  }, [addCompanyDialog]);

  const handleRemoveFolder = React.useCallback((crn: string) => {
    // Initialize Firebase storage
    const storage = getFirebaseStorage();
    const folderRef: StorageReference = ref(storage, `companies/${crn}`);

    // List all files in the folder and delete them
    listAll(folderRef)
      .then((res: any) => {
        // Create an array of promises to delete each item
        const deletePromises = res.items.map((itemRef: StorageReference) => deleteObject(itemRef));

        // Wait for all deletions to complete
        Promise.all(deletePromises)
          .then(() => {
            toast.success('Company folder removed');
          })
          .catch((error) => {
            console.log(error);
            toast.error('Failed to delete all items in the folder');
          });
      })
      .catch((error) => {
        if (error.code === 'storage/object-not-found') {
          toast.error('Folder does not exist');
        } else {
          console.log(error);
          toast.error('Something went wrong!');
        }
      });
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent>
          <Stack divider={<Divider />} spacing={4}>
            <Grid
              size={{
                // full width on mobile
                xs: 12,
                // half width on desktop
                md: 12,
              }}
            >
              <Controller
                control={control}
                name="crn"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.crn)}>
                    <InputLabel>Commercial Registration Number</InputLabel>
                    <Select
                      onChange={(e) => {
                        // update both the name and crn fields
                        const selectedCompany: any = [].find((company: any) => company.crn === e.target.value);
                        if (selectedCompany?.crn) {
                          setValue('name', selectedCompany?.name);
                          setValue('crn', selectedCompany?.crn);
                        }
                      }}
                    >
                      <Option value="">Choose a company</Option>
                      {[]?.map((company: any) => (
                        <Option key={company.crn} value={company.crn}>
                          {company.name} <Minus className="mx-1" />{' '}
                          <span className="text-sm text-gray-500">{company.crn}</span>
                        </Option>
                      ))}
                    </Select>
                    {errors.crn ? <FormHelperText>{errors.crn.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
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
  return (
    <QueryClientProvider client={queryClient}>
      <EntityForm />
    </QueryClientProvider>
  );
}
