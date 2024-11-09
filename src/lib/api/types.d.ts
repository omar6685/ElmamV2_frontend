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
