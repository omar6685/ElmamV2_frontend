export type ICreateEntityResponse = {
  ajier: number;
  saudiPlayer: number;
  saudiJailed: number;
  saudiDisable: number;
  saudiOnline: number;
  saudiStudent: number;
  foreignerLikeSaudi: number;
  foreignerLikeForeigner: number;
  saudiLoanPlayer: number;
  gulfCitizen: number;
  tribeSaudi: number;
  specialyForeigner: number;
  owner: number;
  realForeigner: number;
  realSaudi: number;
  commercialRegistrationNumberId: number;
  userId: number;
  activityTableId: number;
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type ICreateNationalityReport = {
  result: string;
  saudis: number;
  totalEmployees: number;
  maxAddition: string;
  name: string;
  userId: number;
  companies: string
  entityId: string;
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type IGetActivity = {
  id: string;
  activitiy: string;
  fixedValueLowGreen: number;
  fixedCurveValueLowGreen: number;
  fixedValueMidGreen: number;
  fixedCurveValueMidGreen: number;
  fixedValueHiGreen: number;
  fixedCurveValueHiGreen: number;
  fixedValuePlatiniumGreen: number;
  fixedCurveValuePlatiniumGreen: number;
};

export type IGetCrnEntity = {
  id: string;
  entityId: string;
  adaptation: false;
  logoUrl: string;
  createdAt: string;
  updatedAt: string;
  commercialRegistrationNumberId: string;
  xlsxFileLocal: string;
  subscribersXlsxFile: string;
  residentXlsxFile: string;
  nationalities: { name: string; count: number }[];
  commercialRegistrationNumber: IGetCRN;
};

export type IGetCRN = {
  id: string;
  crName: string;
  crType: string;
  crExpiryDate: string;
  crMainNumber: string;
  subscriptionStatus: string;
  currentPeriodEnd: any;
  userId: string;
  createdAt: string;
  updatedAt: string;
  crNumber: string;
  crIssueDate: string;
  trueCrNumber: any;
  crEntityNumber: any;
  crMainEntityNumber: any;
  businessType: string;
  crStatus: any;
  location: string;
  company: string;
  activities: string;
};

export type IGetNationalityReport = {
  id: string
  result: string
  saudis: number;
  totalEmployees: number;
  maxAddition: string
  name: string
  userId: string
  companies: string
  createdAt: string
  updatedAt: string
  entityId: string
};
