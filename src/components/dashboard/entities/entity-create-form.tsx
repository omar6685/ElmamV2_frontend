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
import { CloudArrowUp, Plus, Trash } from '@phosphor-icons/react';
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

import { AddCompanyDialog, Company, companySchema } from './dialogs/add-company';
import { useActivities } from './hooks/useActivities';

// You could memoize this function to avoid re-creating the columns on every render.
function getCompaniesColumns({
  onEdit,
  onRemove,
}: {
  onEdit?: (companyId: string) => void;
  onRemove?: (companyId: string) => void;
}): ColumnDef<Company>[] {
  return [
    {
      formatter: (row): React.JSX.Element => {
        return (
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                backgroundImage: `url(${row.image})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                bgcolor: 'var(--mui-palette-background-level2)',
                bentityRadius: 1,
                flex: '0 0 auto',
                height: '40px',
                width: '40px',
              }}
            />
            <Typography variant="subtitle2">{row.name}</Typography>
          </Stack>
        );
      },
      name: 'Company',
      width: '200px',
    },
    {
      formatter: (row): React.JSX.Element => (
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          {row.crn}
        </Stack>
      ),
      name: 'CRN',
      width: '200px',
    },
    {
      formatter: (row): React.JSX.Element => (
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Link href={row.workersFile as string} target="_blank">
            <Button variant="outlined" startIcon={<CloudArrowUp />}>
              Workers File
            </Button>
          </Link>
        </Stack>
      ),
      name: 'Workers File',
      width: '200px',
    },
    {
      formatter: (row): React.JSX.Element => (
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Link href={row.workersFile as string} target="_blank">
            <Button variant="outlined" startIcon={<CloudArrowUp />}>
              Subscribers List File
            </Button>
          </Link>
        </Stack>
      ),
      name: 'Subscribers List File',
      width: '200px',
    },
    {
      formatter: (row): React.JSX.Element => (
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Link href={row.workersFile as string} target="_blank">
            <Button variant="outlined" startIcon={<CloudArrowUp />}>
              Main Resident File
            </Button>
          </Link>
        </Stack>
      ),
      name: 'Main Resident File',
      width: '200px',
    },
    {
      formatter: (row): React.JSX.Element => (
        <FormControlLabel
          control={
            <Checkbox
              checked={row.adaptation}
              onChange={() => {
                // Update the row in the table
                onEdit?.(row.crn);
              }}
            />
          }
          label=""
          labelPlacement="end"
        />
      ),
      name: 'Adaptation',
      width: '200px',
    },
    {
      formatter: (row): React.JSX.Element => (
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Button
            color="secondary"
            variant="outlined"
            onClick={() => {
              onRemove?.(row.crn);
            }}
          >
            <Trash />
          </Button>
        </Stack>
      ),
      name: '',
      width: '100px',
    },
  ];
}

const entitiesSchema = zod.object({
  activity: zod.string().min(1, 'Activity is required'),
  ajirContracts: zod.string().refine(
    // check if the value is a positive number
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    'Ajir contracts must be a positive number'
  ),
  disabled: zod.string().refine(
    // check if the value is a positive number
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    'Disabled must be a positive number'
  ),
  freedJailed: zod.string().refine(
    // check if the value is a positive number
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    'Freed jailed must be a positive number'
  ),
  students: zod.string().refine(
    // check if the value is a positive number
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    'Students must be a positive number'
  ),
  remoteWorker: zod.string().refine(
    // check if the value is a positive number
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    'Remote worker must be a positive number'
  ),
  sportsPlayer: zod.string().refine(
    // check if the value is a positive number
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    'Sports player must be a positive number'
  ),
  lended: zod.string().refine(
    // check if the value is a positive number
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    'Lended must be a positive number'
  ),
  citizenshipExempt: zod.string().refine(
    // check if the value is a positive number
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    'Citizenships exempt from deportation and treated as expatriate must be a positive number'
  ),
  citizenshipExemptSaudi: zod.string().refine(
    // check if the value is a positive number
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    'Citizenships exempt from deportation and treated as Saudis must be a positive number'
  ),
  specialForeigner: zod.string().refine(
    // check if the value is a positive number
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    'Special foreigners must be a positive number'
  ),
  displacedTribes: zod.string().refine(
    // check if the value is a positive number
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    'Displaced tribes must be a positive number'
  ),
  gccCitizen: zod.string().refine(
    // check if the value is a positive number
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    'GCC citizens must be a positive number'
  ),
  owner: zod.string().refine(
    // check if the value is a positive number
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    'Owner number must be a positive number'
  ),
  saudisAfterRules: zod.string().refine(
    // check if the value is a positive number
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    'Saudis after rules must be a positive number'
  ),
  foreignersAfterRules: zod.string().refine(
    // check if the value is a positive number
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    'Foreigners after rules must be a positive number'
  ),
  companies: zod
    .array(companySchema)
    .min(1, 'At least one company must be added')
    .refine((companies) => {
      // check if crn is unique
      const crns = new Set<string>();
      for (const company of companies) {
        if (crns.has(company.crn)) {
          console.log('Company CRN must be unique');
          return false;
        }
        crns.add(company.crn);
      }
      return true;
    })
    .default([] satisfies Company[]),
});

export type Values = zod.infer<typeof entitiesSchema>;

const defaultValues = {
  activity: '',
  ajirContracts: '0',
  disabled: '0',
  freedJailed: '0',
  students: '0',
  remoteWorker: '0',
  sportsPlayer: '0',
  lended: '0',
  citizenshipExempt: '0',
  citizenshipExemptSaudi: '0',
  specialForeigner: '0',
  displacedTribes: '0',
  gccCitizen: '0',
  owner: '0',
  saudisAfterRules: '0',
  foreignersAfterRules: '0',
  companies: [],
} satisfies Values;

function EntityForm(): React.JSX.Element {
  const router = useRouter();
  const addCompanyDialog = useDialog();
  const { isLoading, error, data: activities, isFetching } = useActivities();

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
        // 01. Create entity first then use it's id to create the companies
        const response: AxiosResponse<ICreateEntityResponse> = await apiInstance.post('entities', {
          ajier: parseInt(values.ajirContracts),
          saudiPlayer: parseInt(values.sportsPlayer),
          saudiJailed: parseInt(values.freedJailed),
          saudiDisable: parseInt(values.disabled),
          saudiOnline: parseInt(values.remoteWorker),
          saudiStudent: parseInt(values.students),
          foreignerLikeSaudi: parseInt(values.citizenshipExemptSaudi),
          foreignerLikeForeigner: parseInt(values.citizenshipExempt),
          saudiLoanPlayer: parseInt(values.lended),
          gulfCitizen: parseInt(values.gccCitizen),
          tribeSaudi: parseInt(values.displacedTribes),
          specialyForeigner: parseInt(values.specialForeigner),
          owner: parseInt(values.owner),
          realForeigner: parseInt(values.foreignersAfterRules),
          realSaudi: parseInt(values.saudisAfterRules),
          commercialRegistrationNumberId: 3,
          userId: parseInt(user?.sub as string) ?? '',
          activityTableId: parseInt(values.activity),
        });

        // 02. Create companies
        // endpoint: /entities/crn-entity
        // example company body
        const companies = values.companies.map((company) => {
          return {
            entityId: parseInt(response.data.id),
            adaptation: company.adaptation,
            logoUrl: company.image,
            commercialRegistrationNumberId: 3,
            xlsxFileLocal: company.workersFile,
            subscribersXlsxFile: company.subscribersListFile,
            residentXlsxFile: company.mainResidentFile,
          };
        });

        // Make API request to create companies
        await Promise.all(
          companies.map((company) => {
            return apiInstance.post('entities/crn-entity', company);
          })
        );

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
                md: 6,
                xs: 12,
              }}
            >
              <Controller
                control={control}
                name="activity"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.activity)} fullWidth>
                    <InputLabel required>Activity</InputLabel>
                    <Select {...field}>
                      <Option value="">Choose an activity</Option>
                      {activities?.map((activity) => (
                        <Option key={activity.id} value={activity.id}>
                          {activity.activitiy}
                        </Option>
                      ))}
                    </Select>
                    {errors.activity ? <FormHelperText>{errors.activity?.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>

            <Stack spacing={3}>
              <Typography variant="h6">Companies list</Typography>
              <Stack spacing={2}>
                <Card sx={{ bentityRadius: 1 }} variant="outlined">
                  <DataTable<Company>
                    columns={getCompaniesColumns({
                      onEdit: (companyId) => {
                        // Update the company in the companies list
                        const updatedCompanies = getValues('companies').map((company) => {
                          if (company.crn === companyId) {
                            return { ...company, adaptation: !company.adaptation };
                          }
                          return company;
                        });
                        setValue('companies', updatedCompanies);
                      },
                      onRemove: (companyId) => {
                        const updatedCompanies = getValues('companies').filter((company) => company.crn !== companyId);
                        setValue('companies', updatedCompanies);
                        handleRemoveFolder(companyId);
                      },
                    })}
                    rows={watch('companies')}
                  />
                </Card>
                <div>
                  <Button
                    color="secondary"
                    startIcon={<PlusCircleIcon />}
                    variant="outlined"
                    sx={{ width: { xs: '100%', md: 'auto' } }}
                    onClick={handleAdd}
                  >
                    Add company
                  </Button>
                </div>
              </Stack>
            </Stack>

            <Stack spacing={3}>
              <Typography variant="h6">Basic information</Typography>
              <Grid container spacing={3}>
                <Grid
                  size={{
                    md: 3,
                    xs: 12,
                  }}
                >
                  <Controller
                    control={control}
                    name="ajirContracts"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.ajirContracts)} fullWidth>
                        <InputLabel>Ajir Contracts</InputLabel>
                        <OutlinedInput {...field} type="number" />
                        {errors.ajirContracts ? <FormHelperText>{errors.ajirContracts.message}</FormHelperText> : null}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid
                  size={{
                    md: 3,
                    xs: 12,
                  }}
                >
                  <Controller
                    control={control}
                    name="disabled"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.disabled)} fullWidth>
                        <InputLabel>Disabled</InputLabel>
                        <OutlinedInput {...field} type="number" />
                        {errors.disabled ? <FormHelperText>{errors.disabled.message}</FormHelperText> : null}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid
                  size={{
                    md: 3,
                    xs: 12,
                  }}
                >
                  <Controller
                    control={control}
                    name="freedJailed"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.freedJailed)} fullWidth>
                        <InputLabel>Freed jailed</InputLabel>
                        <OutlinedInput {...field} type="number" />
                        {errors.freedJailed ? <FormHelperText>{errors.freedJailed.message}</FormHelperText> : null}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid
                  size={{
                    md: 3,
                    xs: 12,
                  }}
                >
                  <Controller
                    control={control}
                    name="students"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.students)} fullWidth>
                        <InputLabel>Students</InputLabel>
                        <OutlinedInput {...field} type="number" />
                        {errors.students ? <FormHelperText>{errors.students.message}</FormHelperText> : null}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid
                  size={{
                    md: 3,
                    xs: 12,
                  }}
                >
                  <Controller
                    control={control}
                    name="remoteWorker"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.remoteWorker)} fullWidth>
                        <InputLabel>Remote worker</InputLabel>
                        <OutlinedInput {...field} type="number" />
                        {errors.remoteWorker ? <FormHelperText>{errors.remoteWorker.message}</FormHelperText> : null}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid
                  size={{
                    md: 3,
                    xs: 12,
                  }}
                >
                  <Controller
                    control={control}
                    name="sportsPlayer"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.sportsPlayer)} fullWidth>
                        <InputLabel>Sports player</InputLabel>
                        <OutlinedInput {...field} type="number" />
                        {errors.sportsPlayer ? <FormHelperText>{errors.sportsPlayer.message}</FormHelperText> : null}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid
                  size={{
                    md: 3,
                    xs: 12,
                  }}
                >
                  <Controller
                    control={control}
                    name="lended"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.lended)} fullWidth>
                        <InputLabel>Lended</InputLabel>
                        <OutlinedInput {...field} type="number" />
                        {errors.lended ? <FormHelperText>{errors.lended.message}</FormHelperText> : null}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid
                  size={{
                    md: 3,
                    xs: 12,
                  }}
                >
                  <Controller
                    control={control}
                    name="citizenshipExempt"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.citizenshipExempt)} fullWidth>
                        <InputLabel>Citizenship exempt</InputLabel>
                        <OutlinedInput {...field} type="number" />
                        {errors.citizenshipExempt ? (
                          <FormHelperText>{errors.citizenshipExempt.message}</FormHelperText>
                        ) : null}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid
                  size={{
                    md: 3,
                    xs: 12,
                  }}
                >
                  <Controller
                    control={control}
                    name="citizenshipExemptSaudi"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.citizenshipExemptSaudi)} fullWidth>
                        <InputLabel>Citizenship exempt Saudi</InputLabel>
                        <OutlinedInput {...field} type="number" />
                        {errors.citizenshipExemptSaudi ? (
                          <FormHelperText>{errors.citizenshipExemptSaudi.message}</FormHelperText>
                        ) : null}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid
                  size={{
                    md: 3,
                    xs: 12,
                  }}
                >
                  <Controller
                    control={control}
                    name="specialForeigner"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.specialForeigner)} fullWidth>
                        <InputLabel>Special foreigner</InputLabel>
                        <OutlinedInput {...field} type="number" />
                        {errors.specialForeigner ? (
                          <FormHelperText>{errors.specialForeigner.message}</FormHelperText>
                        ) : null}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid
                  size={{
                    md: 3,
                    xs: 12,
                  }}
                >
                  <Controller
                    control={control}
                    name="displacedTribes"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.displacedTribes)} fullWidth>
                        <InputLabel>Displaced tribes</InputLabel>
                        <OutlinedInput {...field} type="number" />
                        {errors.displacedTribes ? (
                          <FormHelperText>{errors.displacedTribes.message}</FormHelperText>
                        ) : null}
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid
                  size={{
                    md: 3,
                    xs: 12,
                  }}
                >
                  <Controller
                    control={control}
                    name="gccCitizen"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.gccCitizen)} fullWidth>
                        <InputLabel>GCC citizen</InputLabel>
                        <OutlinedInput {...field} type="number" />
                        {errors.gccCitizen ? <FormHelperText>{errors.gccCitizen.message}</FormHelperText> : null}
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid
                  size={{
                    md: 3,
                    xs: 12,
                  }}
                >
                  <Controller
                    control={control}
                    name="owner"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.owner)} fullWidth>
                        <InputLabel>Owner</InputLabel>
                        <OutlinedInput {...field} type="number" />
                        {errors.owner ? <FormHelperText>{errors.owner.message}</FormHelperText> : null}
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid
                  size={{
                    md: 3,
                    xs: 12,
                  }}
                >
                  <Controller
                    control={control}
                    name="saudisAfterRules"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.saudisAfterRules)} fullWidth>
                        <InputLabel>Saudis after rules</InputLabel>
                        <OutlinedInput {...field} type="number" />
                        {errors.saudisAfterRules ? (
                          <FormHelperText>{errors.saudisAfterRules.message}</FormHelperText>
                        ) : null}
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid
                  size={{
                    md: 3,
                    xs: 12,
                  }}
                >
                  <Controller
                    control={control}
                    name="foreignersAfterRules"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.foreignersAfterRules)} fullWidth>
                        <InputLabel>Foreigners after rules</InputLabel>
                        <OutlinedInput {...field} type="number" />
                        {errors.foreignersAfterRules ? (
                          <FormHelperText>{errors.foreignersAfterRules.message}</FormHelperText>
                        ) : null}
                      </FormControl>
                    )}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Stack>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button color="secondary">Cancel</Button>
          <Button type="submit" variant="contained">
            Create entity
          </Button>
        </CardActions>
      </Card>

      {addCompanyDialog.open ? (
        <AddCompanyDialog
          action="create"
          onClose={addCompanyDialog.handleClose}
          onCreate={(params) => {
            // Add company to companies list
            console.log('Company added:', params);
            setValue('companies', [...getValues('companies'), params]);
            addCompanyDialog.handleClose();
          }}
          open
        />
      ) : null}
    </form>
  );
}

const queryClient = new QueryClient();

export function EntityCreateForm() {
  return (
    <QueryClientProvider client={queryClient}>
      <EntityForm />
    </QueryClientProvider>
  );
}
