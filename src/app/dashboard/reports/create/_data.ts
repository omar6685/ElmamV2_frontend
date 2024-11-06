import {
  ApproximateEquals,
  Building,
  Calculator,
  CashRegister,
  Files,
  Flag,
  Gavel,
  HandCoins,
  HardHat,
  PlusMinus,
  Pulse,
  ReadCvLogo,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react/dist/lib/types';

interface Report {
  name: string;
  description: string;
  icon: Icon;
  soon?: boolean;
}

export const reports = [
  {
    name: 'Establishment Quota Report',
    description:
      'A report that shows the current quota of the establishment, the factors affecting it, and how to improve it with the easiest possible solutions and at the lowest cost.',
    icon: Building,
  },
  {
    name: 'Nationalities Ratios Report',
    description:
      'It shows the ratios of nationalities in unified establishments, allowing the employer to know the number that the establishment can attract from nationalities.',
    icon: Flag,
  },
  {
    name: 'Local Occupations Report',
    description:
      'A report that shows the local occupations in the establishment and their ratios, and provides guidance to align them with the regulations of the Ministry of Human Resources.',
    icon: ReadCvLogo,
  },
  {
    name: 'Interactive Ranges Calculator',
    description:
      'It is an interactive calculator that helps build employment and exclusion plans, observe changes in the range and the attraction balance instantly.',
    icon: Calculator,
  },
  {
    name: 'Unaccounted for Labor Report',
    description:
      'It is a report that shows unaccounted for employees in the Ministry of Human Resources or Social Insurance, as well as the cases that prevent accounting in the range and negatively affect the establishment.',
    icon: HardHat,
  },
  {
    name: 'Establishment Records and Licenses Alerts',
    description:
      'You can archive all establishment records and licenses and easily monitor them and receive alerts when they are about to expire.',
    icon: Files,
  },
  {
    name: 'Top Localization Activities Report in the Commercial Register',
    description:
      'Knowing the highest and lowest localization activities in your commercial register, and under which (range activities) these activities fall within the Ministry of Human Resources.',
    icon: CashRegister,
  },
  {
    name: 'Commercial Register Activities Localization Calculator',
    description:
      'It is an interactive calculator that shows the range of the establishment based on the selected activities in the commercial register and knows the necessary localization ratios.',
    icon: PlusMinus,
  },
  {
    name: 'Activities Associated with Establishment Activity Report',
    description:
      'A report that shows the job titles associated with the economic activity of the establishment to know the appropriate professions before issuing visas and transferring sponsorship to the establishment.',
    icon: Pulse,
  },
  {
    name: 'Interactive Local Occupations Calculator',
    description:
      'It is an interactive calculator through which you can add the localization list for the profession and determine the number of foreigners in this profession and calculate the number of Saudis necessary to localize them in this list you have in the establishment.',
    icon: ApproximateEquals,
  },
  {
    name: 'Government Procedures',
    description:
      'A guide to government procedures that helps the employer and government relations employees understand and implement most government procedures easily and simply.',
    icon: Gavel,
    soon: true,
  },
  {
    name: 'Human Resources Fund Support Programs Status Alerts',
    description:
      "Enables the employer to calculate the establishment's quota, recruitment balance, and how to improve it and build its future plans in the recruitment process.",
    icon: HandCoins,
    soon: true,
  },
] satisfies Report[];
