'use client';

import * as React from 'react';
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
import { CloudArrowUp, Plus } from '@phosphor-icons/react';
import { PlusCircle as PlusCircleIcon } from '@phosphor-icons/react/dist/ssr/PlusCircle';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { paths } from '@/paths';
import { dayjs } from '@/lib/dayjs';
import { logger } from '@/lib/default-logger';
import { useDialog } from '@/hooks/use-dialog';
import type { ColumnDef } from '@/components/core/data-table';
import { DataTable } from '@/components/core/data-table';
import { Option } from '@/components/core/option';
import { toast } from '@/components/core/toaster';

import { AddCompanyDialog } from './dialogs/add-company';

export const companySchema = zod.object({
  name: zod.string().min(1, 'Name is required'),
  crn: zod.string().min(1, 'Commercial registration number is required'),
  adaptation: zod.boolean().default(false),
  image: zod.string().nullable(),
  workersFile: zod.string().nullable(),
  subscribersListFile: zod.string().nullable(),
  mainResidentFile: zod.string().nullable(),
});

export type Company = zod.infer<typeof companySchema>;

// You could memoize this function to avoid re-creating the columns on every render.
function getCompaniesColumns({ onEdit }: { onEdit?: (companyId: string) => void }): ColumnDef<Company>[] {
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
      width: '220px',
    },
    {
      formatter: (row): React.JSX.Element => (
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          {row.crn}
        </Stack>
      ),
      name: 'CRN',
      width: '220px',
    },
    {
      formatter: (row): React.JSX.Element => (
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Button variant="outlined" startIcon={<CloudArrowUp />}>
            Workers File
          </Button>
        </Stack>
      ),
      name: 'Workers File',
      width: '220px',
    },
    {
      formatter: (row): React.JSX.Element => (
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Button variant="outlined" startIcon={<CloudArrowUp />}>
            Subscribers List File
          </Button>
        </Stack>
      ),
      name: 'Subscribers List File',
      width: '220px',
    },
    {
      formatter: (row): React.JSX.Element => (
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Button variant="outlined" startIcon={<CloudArrowUp />}>
            Main Resident File
          </Button>
        </Stack>
      ),
      name: 'Main Resident File',
      width: '220px',
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
      width: '220px',
    },
  ];
}

const entitiesSchema = zod.object({
  activity: zod.string().min(1, 'Activity is required'),
  ajirContracts: zod.number().min(0, 'Ajir contracts must be a positive number'),
  disabled: zod.number().min(0, 'Disabled must be a positive number'),
  freedJailed: zod.number().min(0, 'Freed jailed must be a positive number'),
  students: zod.number().min(0, 'Students must be a positive number'),
  remoteWorker: zod.number().min(0, 'Remote worker must be a positive number'),
  sportsPlayer: zod.number().min(0, 'Sports player must be a positive number'),
  lended: zod.number().min(0, 'Lended must be a positive number'),
  citizenshipExempt: zod
    .number()
    .min(0, 'Citizenships exempt from deportation and treated as expatriate must be a positive number'),
  citizenshipExemptSaudi: zod
    .number()
    .min(0, 'Citizenships exempt from deportation and treated as Saudis must be a positive number'),
  specialForeigner: zod.number().min(0, 'Special foreigners must be a positive number'),
  displacedTribes: zod.number().min(0, 'Displaced tribes must be a positive number'),
  gccCitizen: zod.number().min(0, 'GCC citizens must be a positive number'),
  owner: zod.number().min(0, 'Owner number must be a positive number'),
  saudisAfterRules: zod.number().min(0, 'Saudis after rules must be a positive number'),
  foreignersAfterRules: zod.number().min(0, 'Foreigners after rules must be a positive number'),
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
  ajirContracts: 0,
  disabled: 0,
  freedJailed: 0,
  students: 0,
  remoteWorker: 0,
  sportsPlayer: 0,
  lended: 0,
  citizenshipExempt: 0,
  citizenshipExemptSaudi: 0,
  specialForeigner: 0,
  displacedTribes: 0,
  gccCitizen: 0,
  owner: 0,
  saudisAfterRules: 0,
  foreignersAfterRules: 0,
  companies: [],
} satisfies Values;

export function EntityCreateForm(): React.JSX.Element {
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
    async (_: Values): Promise<void> => {
      try {
        // Make API request
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
                      <Option value="act1">Activity 01</Option>
                      <Option value="act2">Activity 02</Option>
                      <Option value="act3">Activity 03</Option>
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
            setValue('companies', [...getValues('companies'), params]);
            addCompanyDialog.handleClose();
          }}
          open
        />
      ) : null}
    </form>
  );
}