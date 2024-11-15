'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearProgress, Select } from '@mui/material';
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
import { MicrosoftExcelLogo, Minus, X as XIcon } from '@phosphor-icons/react';
import { Trash as TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { Controller, useForm } from 'react-hook-form';
import * as XLSX from 'xlsx';
import { z as zod } from 'zod';

import apiInstance from '@/lib/api/axios';
import { authClient } from '@/lib/auth/client';
import { logger } from '@/lib/default-logger';
import { getFirebaseStorage } from '@/lib/storage/firebase/client';
import { FileDropzone } from '@/components/core/file-dropzone';
import { Option } from '@/components/core/option';
import { toast } from '@/components/core/toaster';

export const companySchema = zod.object({
  name: zod.string().min(1, 'Name is required'),
  crn: zod.string().min(1, 'Commercial registration number is required'),
  adaptation: zod.boolean().default(false),
  image: zod.string().nullable(),
  workersFile: zod.string().nullable(),
  subscribersListFile: zod.string().nullable(),
  mainResidentFile: zod.string().nullable(),
  nationalities: zod
    .array(
      zod.object({
        name: zod.string(),
        count: zod.number(),
      })
    )
    .nullable()
    .default([]),
});

export type Company = zod.infer<typeof companySchema>;
export type CrnEntity = Company;

export type XLSFileRow = {
  'رقم العامل': string;
  'اسم العامل': string;
  الجنسية: string;
  'رقم المنشأة': string;
  'إسم المنشأة': string;
  'الإقامة - البطاقة': string;
  المهنة: string;
};

export interface CompanyDialogProps {
  action: 'create' | 'update';
  company?: CrnEntity;
  onClose?: () => void;
  onCreate?: (params: CrnEntity) => void;
  onDelete?: (companyId: string) => void;
  onUpdate?: (companyId: string, params: CrnEntity) => void;
  open?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const companies = [
  {
    crn: '1234567890',
    name: 'Company 1',
  },
  {
    crn: '0987654321',
    name: 'Company 2',
  },
];

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
    getValues,
  } = useForm<CrnEntity>({ defaultValues: {} as CrnEntity, resolver: zodResolver(companySchema) });
  const [image, setImage] = React.useState<string | null>('');
  const [workersFile, setWorkersFile] = React.useState<string | null>('');
  const [subscribersListFile, setSubscribersListFile] = React.useState<string | null>('');
  const [mainResidentFile, setMainResidentFile] = React.useState<string | null>('');
  const [nationalities, setNationalities] = React.useState<{ name: string; count: number }[]>([]);
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

  const handleFileDrop = React.useCallback(
    async (
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
        };
      } else {
        // generate ntionalities report if workers file is uploaded
        if (fileType === 'workersFile') await parseWorkersFile(file);

        console.log(file.name);
        setFile(file.name);
      }
      console.log(fileType, file.name);
      setValue(fileType, file.name);
      setFileUploads((prevUploads) => ({ ...prevUploads, [fileType]: { file, progress: 0 } }));
    },
    []
  );

  const uploadFile = (file: File, fileType: 'image' | 'workersFile' | 'subscribersListFile' | 'mainResidentFile') => {
    console.log(`uploading file ${file.name} of type ${fileType} to firebase storage`);
    const storage = getFirebaseStorage();
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `companies/${getValues().crn}/${fileType}/${file.name}`);
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

  const parseWorkersFile = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      const rows = XLSX.utils.sheet_to_json<XLSFileRow>(worksheet);
      console.log('Rows:', rows);

      // Use a Map to efficiently count each nationality
      const nationalityCount = rows.reduce((acc, row) => {
        const nationality = row['الجنسية'];
        acc.set(nationality, (acc.get(nationality) || 0) + 1);
        return acc;
      }, new Map<string, number>());

      const uniqueNationalities = Array.from(nationalityCount, ([name, count]) => ({ name, count }));
      console.log('Unique nationalities:', uniqueNationalities);
      setNationalities(uniqueNationalities);
    } catch (error) {
      console.error('Error parsing workers file:', error);
    }
  };

  const createNationalityReport = async (data: {
    nationalities: { name: string; count: number }[];
    userId: number;
    entityId: number;
  }) => {
    try {
      const response = await apiInstance.post('/reports/nationality', data);
      console.log('Report created successfully:', response.data);
    } catch (error) {
      console.error('Error creating nationality report:', error);
    }
  };

  const onSubmit = async (
    values: CrnEntity
    // event: React.BaseSyntheticEvent,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // { reset }: { reset: (values?: any) => void }
  ) => {
    try {
      const { data: user } = await authClient.getUser();

      console.log('Submitting form:', values);
      console.log('fileUploads:', fileUploads);

      // 01. Upload files to firebase storage
      const fileUrls = await Promise.all(
        Object.entries(fileUploads).map(
          async ([fileType, fileData]:
            | [string, { file: File | null; progress: number }]
            | [string, { file: File | null; progress: number }]
            | [string, { file: File | null; progress: number }]
            | [string, { file: File | null; progress: number }]) => {
            if (fileData.file) {
              return uploadFile(
                fileData.file,
                fileType as 'image' | 'workersFile' | 'subscribersListFile' | 'mainResidentFile'
              );
            }
            return null;
          }
        )
      );
      console.log('File URLs:', fileUrls);

      // 02. Create company object
      const params = {
        ...values,
        image: fileUrls[0] as string,
        workersFile: fileUrls[1] as string,
        subscribersListFile: fileUrls[2] as string,
        mainResidentFile: fileUrls[3] as string,
        nationalities,
      } satisfies CrnEntity;

      if (action === 'update' && company?.crn) {
        onUpdate?.(company.crn, params);
      } else {
        console.log('Creating company:', params);
        onCreate?.(params);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      // onClose?.();
    }
  };

  React.useEffect(() => {
    // Reset form when dialog data changes
    reset({} as CrnEntity);
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
            name="crn"
            render={({ field }) => (
              <FormControl error={Boolean(errors.crn)}>
                <InputLabel>Commercial Registration Number</InputLabel>
                <Select
                  onChange={(e) => {
                    // update both the name and crn fields
                    const selectedCompany = companies.find((company) => company.crn === e.target.value);
                    if (selectedCompany?.crn) {
                      setValue('name', selectedCompany?.name);
                      setValue('crn', selectedCompany?.crn);
                    }
                  }}
                >
                  <Option value="">Choose a company</Option>
                  {companies?.map((company) => (
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
          {/* <Controller
            control={control}
            disabled
            name="name"
            render={({ field }) => (
              <FormControl error={Boolean(errors.name)}>
                <InputLabel>Name</InputLabel>
                <OutlinedInput {...field} disabled />
                {errors.name ? <FormHelperText>{errors.name.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="crn"
            disabled
            render={({ field }) => (
              <FormControl error={Boolean(errors.crn)}>
                <InputLabel>CRN</InputLabel>
                <OutlinedInput {...field} disabled />
                {errors.crn ? <FormHelperText>{errors.crn.message}</FormHelperText> : null}
              </FormControl>
            )}
          /> */}
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
