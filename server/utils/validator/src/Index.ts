// This file contains code to validate worker
// inputs provided while creating an user

import {
  languageMap,
  RegistrationFormInput,
  isJobType,
  isMostTimeSpend,
  isHighestQualification,
  isState,
  isDistrict,
  isGender,
  genderMap,
  ValidationOutput,
  mostTimeSpendMap,
  MostTimeSpend,
  jobTypeMap,
  JobType,
  highestQualificationMap,
  HighestQualification,
  Gender,
  LanguageCode,
} from '@karya/core';

function _checkAge(output: ValidationOutput, ...value: string[]): ValidationOutput {
  const ageValidator = new RegExp('(^[0-9]{2}$)|(^1[0-1][0-9])');
  output.newValue = value[0];
  if (ageValidator.test(value[0])) {
    const age: number = parseInt(value[0]);
    if (age < 18) {
      output.msg = 'Participant should be atleast 18 years of old.';
      output.status = false;
    }
    output.newValue = age;
  } else {
    output.status = false;
    output.msg = 'Invalid age';
  }
  return output;
}

function _checkPhoneNumber(output: ValidationOutput, ...value: string[]): ValidationOutput {
  const phoneNumberPattern = new RegExp('^[0-9]{10}$');
  output.status = phoneNumberPattern.test(value[0]);
  if (!output.status) {
    output.msg = 'Invalid phone number';
    return output;
  }
  output.newValue = value[0];
  return output;
}

function _checkName(output: ValidationOutput, ...value: string[]): ValidationOutput {
  const namePattern = new RegExp('^[A-Za-z]?([A-Za-z] ?)+$');
  output.status = namePattern.test(value[0]);
  if (!output.status) {
    output.msg = `Invalid ${output.key}`;
    return output;
  }
  output.newValue = value[0];
  return output;
}

function _checkLanguage(output: ValidationOutput, ...value: string[]): ValidationOutput {
  output.status = value[0] in languageMap;
  if (!output.status) {
    output.msg = 'Invalid language';
    return output;
  }
  console.log("Check language", value[0]);
  output.newValue = languageMap[value[0] as LanguageCode].name;
  return output;
}

function _checkGender(output: ValidationOutput, ...value: string[]): ValidationOutput {
  output.status = value[0] in genderMap;
  if (!output.status) {
    output.msg = 'Invalid gender';
    return output;
  }
  output.newValue = genderMap[value[0] as Gender];
  return output;
}

function _checkMostOfTimeSpend(output: ValidationOutput, ...value: string[]): ValidationOutput {
  output.status = isMostTimeSpend(value[0]);
  if (!output.status) {
    output.msg = 'Invalid most time spend value';
    return output;
  }
  output.newValue = mostTimeSpendMap[value[0] as MostTimeSpend];
  return output;
}
function _checkJobType(output: ValidationOutput, ...value: string[]): ValidationOutput {
  output.status = isJobType(value[0]);
  if (!output.status) {
    output.msg = 'Invalid job type value';
    return output;
  }
  output.newValue = jobTypeMap[value[0] as JobType];
  return output;
}
function _checkHighestQualification(output: ValidationOutput, ...value: string[]): ValidationOutput {
  output.status = isHighestQualification(value[0]);
  if (!output.status) {
    output.msg = 'Invalid higher qualification value';
    return output;
  }
  output.newValue = highestQualificationMap[value[0] as HighestQualification];
  return output;
}

function _checkStateName(output: ValidationOutput, ...value: string[]): ValidationOutput {
  [output.status, output.newValue] = isState(value[0]);
  if (!output.status) {
    output.msg = 'Invalid state name';
    return output;
  }
  return output;
}

function _checkDistrictName(output: ValidationOutput, ...value: string[]): ValidationOutput {
  [output.status, output.newValue] = isDistrict(value[0], value[1]);
  if (!output.status) {
    output.msg = 'Invalid district name';
    return output;
  }
  return output;
}

function checkInputs(func: Function, key: string, ...args: (string | number)[]): ValidationOutput {
  const output: ValidationOutput = {
    status: true,
    msg: '',
    key: key,
    newValue: '',
  };
  args = args.filter((arg) => arg !== undefined);
  if (args === null || args === undefined) {
    output.status = false;
    output.msg = `The value of ${key} is empty`;
    return output;
  }
  args = args
    .map((arg) => {
      if (typeof arg === 'string') return arg.trim();
      else return arg;
    })
    .filter((arg) => arg !== '');
  if (args.length === 0) {
    output.status = false;
    output.msg = `The value of ${key} is empty`;
    return output;
  }
  return func(output, ...args);
}

export function checkRegistrationInputs(inputs: RegistrationFormInput): ValidationOutput[] {
  const validationResult = [];

  try {
    validationResult.push(checkInputs(_checkPhoneNumber, 'phone_number', inputs.phone_number));
    validationResult.push(checkInputs(_checkName, 'name', inputs.full_name));
    validationResult.push(checkInputs(_checkName, 'occupation', inputs.occupation));
    validationResult.push(checkInputs(_checkAge, 'age', inputs.age));
    validationResult.push(checkInputs(_checkLanguage, 'language', inputs.language));
    validationResult.push(checkInputs(_checkMostOfTimeSpend, 'most_time_spent', inputs.most_time_spent));
    validationResult.push(checkInputs(_checkJobType, 'job_type', inputs.job_type));
    validationResult.push(checkInputs(_checkGender, 'gender', inputs.gender));
    validationResult.push(
      checkInputs(_checkHighestQualification, 'highest_qualification', inputs.highest_qualification)
    );
    validationResult.push(checkInputs(_checkStateName, 'native_place_state', inputs.native_place_state));
    validationResult.push(
      checkInputs(_checkDistrictName, 'native_place_district', inputs.native_place_district, inputs.native_place_state)
    );
  } catch (error) {
    console.log(error);
  }
  return validationResult;
}
