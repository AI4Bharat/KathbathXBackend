import { LanguageCode } from './Custom';

export type RegistrationFormInput = {
  full_name: string;
  box_id: string;
  phone_number: string;
  gender: Gender;
  language: LanguageCode;
  age: string;
  job_type: JobType;
  occupation: string;
  most_time_spent: MostTimeSpend;
  highest_qualification: HighestQualification;
  native_place_state: string;
  native_place_district: string;
};

export type ValidationOutput = {
  key: string;
  status: boolean;
  msg: string;
  newValue: string | number; // Will hold the value istead of keys eg: 'Big town' instead of 'big_town'
};

const gender = ['male', 'female', 'other'] as const;
export type Gender = typeof gender[number];

export const genderMap: { [key in Gender]: string } = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
};
export function isGender(value: string): value is Gender {
  return value in genderMap;
}

const mostTimeSpend = ['city', 'big_town', 'small_town', 'village'] as const;
export type MostTimeSpend = typeof mostTimeSpend[number];

export const mostTimeSpendMap: { [key in MostTimeSpend]: string } = {
  city: 'City',
  big_town: 'Big Town',
  small_town: 'Small Town',
  village: 'Village',
};

export function isMostTimeSpend(value: string): value is MostTimeSpend {
  return value in mostTimeSpendMap;
}

const jobType = ['blue_collar', 'white_collar', 'student', 'unemployed'] as const;
export type JobType = typeof jobType[number];

export const jobTypeMap: { [key in JobType]: string } = {
  blue_collar: 'Blue Collar',
  white_collar: 'White Collar',
  student: 'Student',
  unemployed: 'Unemployed',
};

export function isJobType(value: string): value is JobType {
  return value in jobTypeMap;
}

const highestQualification = [
  'no_schooling',
  'high_school',
  'senior_high_school',
  'diploma',
  'ug',
  'graduate',
  'post_graduate',
  'doctoral',
] as const;
export type HighestQualification = typeof highestQualification[number];

export const highestQualificationMap: { [key in HighestQualification]: string } = {
  no_schooling: 'No Schooling',
  high_school: 'Higher Secondary Level at School (10th)',
  senior_high_school: 'Senior Secondary Level at School (10+2)',
  diploma: 'Diploma Holder',
  ug: 'Under Graduate Student',
  graduate: 'Graduate',
  post_graduate: 'Post Graduate',
  doctoral: 'Doctoral (PhD) or higher level',
};
export function isHighestQualification(value: string): value is HighestQualification {
  return value in highestQualificationMap;
}
