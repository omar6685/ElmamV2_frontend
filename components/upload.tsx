"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { CldUploadWidget } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash } from "lucide-react";

export default function Upload() {
  const [jsonData, setJsonData] = useState(null);
  const [files, setFiles] = useState<string[]>([]);

  // Handle adding a new file URL to the list
  const handleAddFile = (url: string) => {
    setFiles((prevFiles) => [...prevFiles, url]);
  };

  // Handle removing a file URL from the list
  const handleRemoveFile = (url: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file !== url));
  };

  // Function to parse Excel file to JSON
  const parseExcelFile = (file: File) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target?.result) {
        const data = new Uint8Array(e.target.result as ArrayBuffer);
        const workbook: XLSX.WorkBook = XLSX.read(data, { type: "array" });

        // Assuming data is in the first sheet
        const sheetName: string = workbook.SheetNames[0];
        const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];

        // Convert worksheet to JSON
        const parsedData = XLSX.utils.sheet_to_json(worksheet);
        setJsonData(parsedData as any);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Cloudinary upload widget callback
  const onUpload = (result: any) => {
    console.log(result.info);
    const fileUrl = result.info.secure_url;
    handleAddFile(fileUrl);
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-xl font-bold mb-4">Upload Excel Files</h1>

      <CldUploadWidget
        onUpload={onUpload}
        uploadPreset="n4xkesvd"
        options={{
          sources: ["local"],
          resourceType: "raw", // 'raw' is used for non-image files like Excel files
          clientAllowedFormats: ["xls", "xlsx"], // Limit to Excel file formats
        }}
      >
        {({ open }) => {
          const onClick = () => {
            open((file: File) => {
              console.log(file);
              parseExcelFile(file); // Parse the file to JSON after selection
            });
          };

          return (
            <Button type="button" variant="secondary" onClick={onClick}>
              <ImagePlus className="h-4 w-4 mr-2" />
              Upload Excel File
            </Button>
          );
        }}
      </CldUploadWidget>

      {/* Display the uploaded files */}
      <div className="mt-4">
        <h2 className="text-lg font-semibold">Uploaded Files:</h2>
        <ul className="list-disc pl-5">
          {files.map((fileUrl, index) => (
            <li key={index} className="mt-2">
              <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                {fileUrl.split("/").pop()} {/* Display file name */}
              </a>
              <Button
                type="button"
                onClick={() => handleRemoveFile(fileUrl)}
                variant="destructive"
                size="sm"
                className="ml-2"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </div>

      {/* Display JSON data parsed from Excel file */}
      {jsonData && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Parsed Data:</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
            {JSON.stringify(jsonData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
