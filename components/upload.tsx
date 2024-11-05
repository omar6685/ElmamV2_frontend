"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "./ui/button";

type TNationality = { name: string; count: number };
type TResult = {
  result: string;
  saudis: number;
  totalEmployees: number;
  maxAddition: '{"saudi":0}';
  name: string;
  userId: number;
  commercialRegistrationNumberId: string;
  id: string;
  createdAt: string;
  updatedAt: string;
};

export default function Upload() {
  const [nationalities, setNationalities] = useState<TNationality[]>([]);
  const [result, setResult] = useState<TResult>({} as TResult);

  // Function to handle file upload and parse Excel to JSON
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    //+
    // ... rest of the function//+
    const file = (event?.target?.files ?? [])[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      type TParsedData = {
        "رقم العامل": string;
        "اسم العامل": string;
        الجنسية: string;
        "رقم المنشأة": string;
        "إسم المنشأة": string;
        "رقم الحدود": string;
        "الإقامة - البطاقة": string;
        المهنة: string;
        "تاريخ انتهاء الاقامة": string;
        "تاريخ دخول المملكة": string;
      };
      if (e.target?.result) {
        const data = new Uint8Array(e.target.result as any);
        const workbook: XLSX.WorkBook = XLSX.read(data, { type: "array" });

        // Assuming the data is in the first sheet
        const sheetName: string = workbook.SheetNames[0];
        const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];
        // Convert worksheet to JSON
        const parsedData: TParsedData[] = XLSX.utils.sheet_to_json(worksheet);
        // calculate each uniaue nationality and how many times its repeated
        const nationalityCountMap = parsedData.reduce(
          (acc: TParsedData, curr: TParsedData) => {
            acc[curr.الجنسية] = (acc[curr.الجنسية] || 0) + 1;
            return acc;
          },
          {}
        );

        // Sort nationalities by their count in descending order
        const sortedNationalities = Object.entries(nationalityCountMap)
          .sort((a, b) => b[1] - a[1])
          .map(([name, count]) => ({
            name,
            count,
          }));

        setNationalities(sortedNationalities);

        // You can also send parsedData to your backend if needed
        // sendToBackend(parsedData);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Function to send data to the backend (example)
  const sendToBackend = async (data: TNationality[]) => {
    try {
      const response = await fetch(
        "http://127.0.0.1:4000/api/v1/reports/nationality",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNTUiLCJmaXJzdE5hbWUiOiJhZG1pbiIsImxhc3ROYW1lIjoiYWRtaW4iLCJwaG9uZSI6IjA1NTYxOTA0OTEiLCJlbWFpbCI6Inppbm91QGVsbWFtLmNvbSIsInJvbGVzIjpbImN1c3RvbWVyIl0sImlhdCI6MTczMDUzOTcxNCwiZXhwIjoxNzMxMTQ0NTE0fQ.ZOQeU4bpFiUmOEXmbnxzPLWVXJTo7YrvUqWgADXMIOg",
          },
          body: JSON.stringify({
            crnId: 1,
            userId: 1,
            nationalities: data,
          }),
        }
      );
      const result = await response.json();
      setResult(result);
    } catch (error) {
      console.error("Error sending data to backend:", error);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-x-5">
        <div className="relative">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0"
          />
          <Button
            type="button"
            variant="secondary"
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          >
            Upload Excel File
          </Button>
        </div>

        <Button
          type="button"
          variant="secondary"
          className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 bg-blue-400 hover:bg-blue-500 dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          disabled={nationalities.length <= 0}
          onClick={() => sendToBackend(nationalities)}
        >
          Generate Report
        </Button>
      </div>
      {nationalities.length > 0 && (
        <ul className="grid grid-cols-3 items-start gap-2 mt-4">
          {nationalities.map(({ name, count }) => (
            <li key={name} className="ml-auto font-bold">
              {name}: {count}
            </li>
          ))}
        </ul>
      )}
      {result.result && (
        <h1 className="font-bold text-xl mt-10">Nationality Report:</h1>
      )}
      <ul>
        {result.result && (
          <li>
            Name: {result.name}
            <br />
            Result: {result.result.split(",").join("  __  ")}
            <br />
            Saudis: {result.saudis}
            <br />
            Total Employees: {result.totalEmployees}
            <br />
            Max Addition: {JSON.parse(result.maxAddition).saudi}
          </li>
        )}
      </ul>
    </div>
  );
}
