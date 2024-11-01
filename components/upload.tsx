"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

export default function Upload() {
  const [jsonData, setJsonData] = useState(null);

  // Function to handle file upload and parse Excel to JSON
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    //+
    // ... rest of the function//+
    const file = (event?.target?.files ?? [])[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target?.result) {
        const data = new Uint8Array(e.target.result);
        const workbook: XLSX.WorkBook = XLSX.read(data, { type: "array" });

        // Assuming the data is in the first sheet
        const sheetName: string = workbook.SheetNames[0];
        const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];

        // Convert worksheet to JSON
        const parsedData = XLSX.utils.sheet_to_json(worksheet);
        setJsonData(parsedData as any);

        // You can also send parsedData to your backend if needed
        // sendToBackend(parsedData);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Function to send data to the backend (example)
  const sendToBackend = async (data) => {
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      console.log("Response from backend:", result);
    } catch (error) {
      console.error("Error sending data to backend:", error);
    }
  };

  return (
    <div>
      <h1>Upload Excel File</h1>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
      />

      {jsonData && <pre>{JSON.stringify(jsonData, null, 2)}</pre>}
    </div>
  );
}
