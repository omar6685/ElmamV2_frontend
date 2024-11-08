'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { MicrosoftExcelLogo, X as XIcon } from '@phosphor-icons/react';
import { Trash as TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { Controller, useForm } from 'react-hook-form';

import { logger } from '@/lib/default-logger';
import { FileDropzone } from '@/components/core/file-dropzone';
import { toast } from '@/components/core/toaster';

import { Company, companySchema } from '../entity-create-form';

export interface CompanyDialogProps {
  action: 'create' | 'update';
  company?: Company;
  onClose?: () => void;
  onCreate?: (params: Company) => void;
  onDelete?: (companyId: string) => void;
  onUpdate?: (companyId: string, params: Company) => void;
  open?: boolean;
}

export function AddCompanyDialog({
  action = 'create',
  company,
  onClose,
  onCreate,
  onDelete,
  onUpdate,
  open = false,
}: CompanyDialogProps): React.JSX.Element {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Company>({ defaultValues: {} as Company, resolver: zodResolver(companySchema) });
  const [image, setImage] = React.useState<string | null>('');
  const [workersFile, setWorkersFile] = React.useState<string | null>('');
  const [subscribersListFile, setSubscribersListFile] = React.useState<string | null>('');
  const [mainResidentFile, setMainResidentFile] = React.useState<string | null>('');

  const handleFileDrop = React.useCallback(
    async ([file]: File[], setFile: React.Dispatch<React.SetStateAction<string | null>>) => {
      //   const reader = new FileReader();
      //   reader.readAsDataURL(file);
      //   reader.onload = () => {
      //     setFile(reader.result as string);
      //   };
      // check if file is image and apply the above else assign its name to the state
      if (file.type.includes('image')) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          setFile(reader.result as string);
        };
      } else {
        setFile(file.name);
      }
    },
    []
  );

  const onSubmit = React.useCallback(
    async (values: Company): Promise<void> => {
      try {
        const params = {
          name: values.name,
          crn: values.crn,
          adaptation: values.adaptation,
          image: values.image,
          workersFile: values.workersFile,
          subscribersListFile: values.subscribersListFile,
          mainResidentFile: values.mainResidentFile,
        } satisfies Company | Company;

        if (action === 'update') {
          onUpdate?.(company!.crn, params);
        } else {
          onCreate?.(params);
        }
      } catch (err) {
        logger.error(err);
        toast.error('Something went wrong!');
      }
    },
    [action, company, onCreate, onUpdate]
  );

  React.useEffect(() => {
    // Reset form when dialog data changes
    reset({} as Company);
  }, [company, reset]);

  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ p: 3 }}>
          <Typography sx={{ textAlign: 'center' }} variant="h5">
            {company ? 'Edit company' : 'Add company'}
          </Typography>
        </Box>
        <Stack spacing={2} sx={{ p: 3 }}>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <FormControl error={Boolean(errors.name)}>
                <InputLabel>Name</InputLabel>
                <OutlinedInput {...field} />
                {errors.name ? <FormHelperText>{errors.name.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="crn"
            render={({ field }) => (
              <FormControl error={Boolean(errors.crn)}>
                <InputLabel>CRN</InputLabel>
                <OutlinedInput {...field} />
                {errors.crn ? <FormHelperText>{errors.crn.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="image"
            render={({ field }) => (
              <FormControl error={Boolean(errors.image)}>
                <InputLabel sx={{ mb: '10px' }}>Image</InputLabel>
                {image ? (
                  <Box
                    sx={{
                      backgroundImage: `url(${image})`,
                      backgroundPosition: 'center',
                      backgroundSize: 'cover',
                      borderRadius: 1,
                      height: '230px',
                      position: 'relative',
                    }}
                  >
                    <IconButton
                      sx={{ position: 'absolute', right: 2, top: 2 }}
                      onClick={() => {
                        setImage(null);
                      }}
                    >
                      <XIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <FileDropzone
                    accept={{ 'image/*': [] }}
                    caption="(SVG, JPG, PNG, or gif maximum 900x400)"
                    maxFiles={1}
                    onDrop={(files) => handleFileDrop(files, setImage)}
                  />
                )}

                {errors.image ? <FormHelperText>{errors.image.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="workersFile"
            render={({ field }) => (
              <FormControl error={Boolean(errors.workersFile)}>
                <InputLabel sx={{ mb: '10px' }}>Workers File</InputLabel>
                {workersFile ? (
                  //   show a card with the file name and sheet icon
                  <Box
                    sx={{
                      alignItems: 'center',
                      // light green bg color
                      bgcolor: '#e8f5e9',
                      borderRadius: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      p: 2,
                      // green color
                      border: '1px solid #4caf50',
                    }}
                  >
                    <Typography>{workersFile}</Typography>
                    <MicrosoftExcelLogo color="#4caf50" />
                  </Box>
                ) : (
                  <FileDropzone
                    accept={{ 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [] }}
                    caption="(XLSX, XLS, or CSV)"
                    maxFiles={1}
                    onDrop={(files) => handleFileDrop(files, setWorkersFile)}
                  />
                )}

                {errors.workersFile ? <FormHelperText>{errors.workersFile.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="subscribersListFile"
            render={({ field }) => (
              <FormControl error={Boolean(errors.subscribersListFile)}>
                <InputLabel sx={{ mb: '10px' }}>Subscribers List File</InputLabel>
                {subscribersListFile ? (
                  <Box
                    sx={{
                      alignItems: 'center',
                      // light green bg color
                      bgcolor: '#e8f5e9',
                      borderRadius: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      p: 2,
                      // green color
                      border: '1px solid #4caf50',
                    }}
                  >
                    <Typography>{subscribersListFile}</Typography>
                    <MicrosoftExcelLogo color="#4caf50" />
                  </Box>
                ) : (
                  <FileDropzone
                    accept={{ 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [] }}
                    caption="(XLSX, XLS, or CSV)"
                    maxFiles={1}
                    onDrop={(files) => handleFileDrop(files, setSubscribersListFile)}
                  />
                )}

                {errors.subscribersListFile ? (
                  <FormHelperText>{errors.subscribersListFile.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="mainResidentFile"
            render={({ field }) => (
              <FormControl error={Boolean(errors.mainResidentFile)}>
                <InputLabel sx={{ mb: '10px' }}>Main Resident File</InputLabel>
                {mainResidentFile ? (
                  <Box
                    sx={{
                      alignItems: 'center',
                      // light green bg color
                      bgcolor: '#e8f5e9',
                      borderRadius: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      p: 2,
                      // green color
                      border: '1px solid #4caf50',
                    }}
                  >
                    <Typography>{mainResidentFile}</Typography>
                    <MicrosoftExcelLogo color="#4caf50" />
                  </Box>
                ) : (
                  <FileDropzone
                    accept={{ 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [] }}
                    caption="(XLSX, XLS, or CSV)"
                    maxFiles={1}
                    onDrop={(files) => handleFileDrop(files, setMainResidentFile)}
                  />
                )}

                {errors.mainResidentFile ? <FormHelperText>{errors.mainResidentFile.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
        </Stack>
        <Divider />
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
          {action === 'update' ? (
            <IconButton
              color="error"
              onClick={() => {
                onDelete?.(company!.crn);
              }}
            >
              <TrashIcon />
            </IconButton>
          ) : (
            <div />
          )}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button color="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Confirm
            </Button>
          </Stack>
        </Stack>
      </form>
    </Dialog>
  );
}
