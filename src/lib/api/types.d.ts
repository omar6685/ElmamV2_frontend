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
  maxAddition: '{"هندي":0,"فلبيني":6,"نيبالي":0,"باكستاني":3,"مصرى":2,"سعودي":19,"يمني":0,"سوداني":6}';
  name: string;
  userId: number;
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
};
