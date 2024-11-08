'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearProgress } from '@mui/material';
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
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { logger } from '@/lib/default-logger';
import { getFirebaseStorage } from '@/lib/storage/firebase/client';
import { FileDropzone } from '@/components/core/file-dropzone';
import { toast } from '@/components/core/toaster';

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

export interface CompanyDialogProps {
  action: 'create' | 'update';
  company?: Company;
  onClose?: () => void;
  onCreate?: (params: Company) => void;
  onDelete?: (companyId: string) => void;
  onUpdate?: (companyId: string, params: Company) => void;
  open?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
    setValue,
  } = useForm<Company>({ defaultValues: {} as Company, resolver: zodResolver(companySchema) });
  const [image, setImage] = React.useState<string | null>('');
  const [workersFile, setWorkersFile] = React.useState<string | null>('');
  const [subscribersListFile, setSubscribersListFile] = React.useState<string | null>('');
  const [mainResidentFile, setMainResidentFile] = React.useState<string | null>('');
  const [fileUploads, setFileUploads] = React.useState<
    Record<
      'image' | 'workersFile' | 'subscribersListFile' | 'mainResidentFile',
      { file: File | null; progress: number }
    >
  >({
    image: { file: null, progress: 0 },
    workersFile: { file: null, progress: 0 },
    subscribersListFile: { file: null, progress: 0 },
    mainResidentFile: { file: null, progress: 0 },
  });
  console.log('Errors: ', errors);
  const handleFileDrop = React.useCallback(
    (
      file: File,
      setFile: React.Dispatch<React.SetStateAction<string | null>>,
      fileType: 'image' | 'workersFile' | 'subscribersListFile' | 'mainResidentFile'
    ) => {
      if (file.size > MAX_FILE_SIZE) {
        alert('File size exceeds 5MB');
        return;
      }
      if (fileType === 'image') {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          setFile(reader.result as string);
          setValue(fileType, reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        console.log(file.name);
        setFile(file.name);
        setValue(fileType, file.name);
      }
      setFileUploads((prevUploads) => ({ ...prevUploads, [fileType]: { file, progress: 0 } }));
    },
    []
  );

  const uploadFile = (file: File, fileType: 'image' | 'workersFile' | 'subscribersListFile' | 'mainResidentFile') => {
    console.log(`uploading file ${file.name} of type ${fileType} to firebase storage`);
    const storage = getFirebaseStorage();
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `companies/${fileType}/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setFileUploads((prevUploads) => ({
            ...prevUploads,
            [fileType]: { ...prevUploads[fileType], progress },
          }));
        },
        (error) => {
          console.error('Upload failed:', error);
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => resolve(downloadURL));
        }
      );
    });
  };

  const onSubmit = async (
    values: Company
    // event: React.BaseSyntheticEvent,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // { reset }: { reset: (values?: any) => void }
  ) => {
    try {
      console.log('Submitting form:', values);
      // const fileUrls = await Promise.all(
      //   Object.entries(fileUploads).map(
      //     async ([fileType, fileData]:
      //       | [string, { file: File | null; progress: number }]
      //       | [string, { file: File | null; progress: number }]
      //       | [string, { file: File | null; progress: number }]
      //       | [string, { file: File | null; progress: number }]) => {
      //       if (fileData.file) {
      //         return uploadFile(
      //           fileData.file,
      //           fileType as 'image' | 'workersFile' | 'subscribersListFile' | 'mainResidentFile'
      //         );
      //       }
      //       return null;
      //     }
      //   )
      // );

      const params = {
        ...values,
        // image: fileUrls[0] as string,
        // workersFile: fileUrls[1] as string,
        // subscribersListFile: fileUrls[2] as string,
        // mainResidentFile: fileUrls[3] as string,
      } satisfies Company;

      if (action === 'update' && company?.crn) {
        onUpdate?.(company.crn, params);
      } else {
        onCreate?.(params);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      onClose?.();
    }
  };

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
                    onDrop={(files) => handleFileDrop(files[0], setImage, 'image')}
                  />
                )}
                {fileUploads.image.progress > 0 ? (
                  <LinearProgress sx={{ flex: '1 1 auto' }} value={fileUploads.image.progress} variant="determinate" />
                ) : null}
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
                    onDrop={(files) => handleFileDrop(files[0], setWorkersFile, 'workersFile')}
                  />
                )}
                {fileUploads.workersFile.progress > 0 ? (
                  <LinearProgress
                    sx={{ flex: '1 1 auto' }}
                    value={fileUploads.workersFile.progress}
                    variant="determinate"
                  />
                ) : null}
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
                    onDrop={(files) => handleFileDrop(files[0], setSubscribersListFile, 'subscribersListFile')}
                  />
                )}
                {fileUploads.subscribersListFile.progress > 0 ? (
                  <LinearProgress
                    sx={{ flex: '1 1 auto' }}
                    value={fileUploads.subscribersListFile.progress}
                    variant="determinate"
                  />
                ) : null}
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
                    onDrop={(files) => handleFileDrop(files[0], setMainResidentFile, 'mainResidentFile')}
                  />
                )}
                {fileUploads.mainResidentFile.progress > 0 ? (
                  <LinearProgress
                    sx={{ flex: '1 1 auto' }}
                    value={fileUploads.mainResidentFile.progress}
                    variant="determinate"
                  />
                ) : null}
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
