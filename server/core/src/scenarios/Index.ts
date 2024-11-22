// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
//
// Entry file for the scenarios

import { MicrotaskAssignmentRecord, MicrotaskRecord, TaskRecord } from '../auto/TableInterfaces';
import { PolicyName, PolicyParamsType } from '../policies/Index';
import { ParameterArray } from '@karya/parameter-specs';

import { BaseScenarioInterface } from './ScenarioInterface';
import { BaseSpeechDCTextScenario, baseSpeechDCTextScenario } from './scenarios/SpeechDCText';
import { BaseSpeechDVScenario, baseSpeechDVScenario } from './scenarios/SpeechDV';
import { BaseSpeechDVMultiScenario, baseSpeechDVMultiScenario } from './scenarios/SpeechDVMulti';
import { BaseSpeechDCImageAudioScenario, baseSpeechDCImageAudioScenario } from './scenarios/SpeechDCImageAudio';
import { BaseSpeechDCAudioScenario, baseSpeechDCAudioScenario } from './scenarios/SpeechDCAudio';
import { BaseSpeechDCAudioRefinementScenario, baseSpeechDCAudioRefinementScenario } from './scenarios/SpeechDCAudioRefinement';
import { BaseImageTranscriptionScenario, baseImageTranscriptionScenario } from './scenarios/ImageTranscription';
import { BaseSignLanguageVideoScenario, baseSignLanguageVideoScenario } from './scenarios/SignLanguageVideo';
import { BaseSignLanguageVideoVerificationScenario, baseSignLanguageVideoVerificationScenario } from './scenarios/SignLanguageVideoVerification';

export * from './ScenarioInterface';
export * from './scenarios/SpeechDCText';
export * from './scenarios/SpeechDCAudio';
export * from './scenarios/SpeechDCAudioRefinement';
export * from './scenarios/SpeechDCImageAudio';
export * from './scenarios/SpeechDV';
export * from './scenarios/SpeechDVMulti';
export * from './scenarios/ImageTranscription';
export * from './scenarios/SignLanguageVideo';
export * from './scenarios/SignLanguageVideoVerification';

// List of scenario names
export const scenarioNames = [
  'SPEECH_DATA',
  'SPEECH_VERIFICATION',
  'SPEECH_DC_AUD',
  'SPEECH_DC_AUDREF',
  'SPEECH_DC_IMGAUD',
  'IMAGE_DC_TEXT',
  'SPEECH_DV_MULTI',
  'SIGN_LANGUAGE_VIDEO',
  'SGN_LANG_VIDEO_VERIFICATION'
] as const;
export type ScenarioName = typeof scenarioNames[number];

// Scenario name to type map
export type ScenarioType<SN extends ScenarioName> = 
  SN extends 'SPEECH_DATA'
  ? BaseSpeechDCTextScenario
  : SN extends 'SPEECH_VERIFICATION'
  ? BaseSpeechDVScenario
  : SN extends 'SPEECH_DV_MULTI'
  ? BaseSpeechDVMultiScenario
  : SN extends 'SPEECH_DC_IMGAUD'
  ? BaseSpeechDCImageAudioScenario
  : SN extends 'SPEECH_DC_AUD'
  ? BaseSpeechDCAudioScenario
  : SN extends 'SPEECH_DC_AUDREF'
  ? BaseSpeechDCAudioRefinementScenario
  : SN extends 'IMAGE_DC_TEXT'
  ? BaseImageTranscriptionScenario
  : SN extends 'SIGN_LANGUAGE_VIDEO'
  ? BaseSignLanguageVideoScenario
  : SN extends 'SGN_LANG_VIDEO_VERIFICATION'
  ? BaseSignLanguageVideoVerificationScenario
  : never;

// Scenario name to instance map
export const scenarioMap: {
  [key in ScenarioName]: BaseScenarioInterface<key, any, object, any, object, any>;
} = {
  SPEECH_DATA: baseSpeechDCTextScenario,
  SPEECH_VERIFICATION: baseSpeechDVScenario,
  SPEECH_DV_MULTI: baseSpeechDVMultiScenario,
  SPEECH_DC_IMGAUD: baseSpeechDCImageAudioScenario,
  SPEECH_DC_AUD: baseSpeechDCAudioScenario,
  IMAGE_DC_TEXT: baseImageTranscriptionScenario,
  SPEECH_DC_AUDREF: baseSpeechDCAudioRefinementScenario,
  SIGN_LANGUAGE_VIDEO: baseSignLanguageVideoScenario,
  SGN_LANG_VIDEO_VERIFICATION: baseSignLanguageVideoVerificationScenario
};

// Core scenario parameters
type CoreScenarioParamsType = {
  instruction: string;
  baseCreditsPerMicrotask: number;
  creditsPerMicrotask: number;
  allowSkipping: boolean;
  startTime?: string;
  endTime?: string;
  deadline?: string;
  includeLogs: boolean;
};

export const coreScenarioParameters: ParameterArray<CoreScenarioParamsType> = [
  {
    id: 'instruction',
    type: 'string',
    label: 'Microtask Instruction',
    description:
      'Instruction to be given to the user on the client application for them to accurately complete each microtask of this task',
    required: true,
  },

  {
    id: 'baseCreditsPerMicrotask',
    type: 'float',
    label: 'Base Credits per Microtask',
    description: 'Number of credits given to a user upon successfully submitting a microtask',
    required: true,
  },

  {
    id: 'creditsPerMicrotask',
    type: 'float',
    label: 'Additional Credits per Microtask',
    description: 'Number of additional credits to be given to a user upon successful validation of a microtask',
    required: true,
  },

  {
    id: 'allowSkipping',
    label: 'Allow users to skip sentences',
    description: 'Allow users to skip recording sentences',
    required: false,
    type: 'boolean',
  },

  {
    id: 'startTime',
    type: 'time',
    label: 'Start Time (24h format. leave empty for none)',
    description: 'Strict start time for tasks on each day',
    required: false,
  },

  {
    id: 'endTime',
    type: 'time',
    label: 'End Time (24h format. leave empty for none)',
    description: 'Strict end time for tasks on each day',
    required: false,
  },

  {
    id: 'deadline',
    type: 'date',
    label: 'Deadline date: YYYY-DD-MM format',
    description: 'Strict date for completion of tasks',
    required: false,
  },

  {
    id: 'includeLogs',
    label: 'Include logs in output',
    description: 'Include detailed work logs in output',
    required: false,
    type: 'boolean',
  },
];

/**
 * Return the language string for a task record to be displayed in the web app
 */
export function languageString(task: TaskRecordType) {
  return scenarioMap[task.scenario_name].languageString(task);
}

// Utility types to extract task, microtask, assignment record types
export type TaskRecordType<
  SN extends ScenarioName = ScenarioName,
  PN extends PolicyName = PolicyName
> = ScenarioType<SN> extends BaseScenarioInterface<
  SN,
  infer TaskParamsType,
  infer _InputDataType,
  infer _InputFilesType,
  infer _OutputDataType,
  infer _OutputFilesType
>
  ? TaskRecord<CoreScenarioParamsType & TaskParamsType & PolicyParamsType<PN>>
  : never;

export type TaskType<SN extends ScenarioName = ScenarioName, PN extends PolicyName = PolicyName> = Partial<
  TaskRecordType<SN, PN>
>;

export type MicrotaskRecordType<
  SN extends ScenarioName = ScenarioName
> = ScenarioType<SN> extends BaseScenarioInterface<
  SN,
  infer _TaskParamsType,
  infer InputDataType,
  infer InputFilesType,
  infer OutputDataType,
  infer OutputFilesType
>
  ? MicrotaskRecord<InputDataType, InputFilesType, OutputDataType, OutputFilesType>
  : never;

export type MicrotaskType<SN extends ScenarioName = ScenarioName> = Partial<MicrotaskRecordType<SN>>;

export type AssignmentRecordType<
  SN extends ScenarioName = ScenarioName
> = ScenarioType<SN> extends BaseScenarioInterface<
  SN,
  infer _TaskParamsType,
  infer _InputDataType,
  infer _InputFilesType,
  infer OutputDataType,
  infer OutputFilesType
>
  ? MicrotaskAssignmentRecord<OutputDataType, OutputFilesType>
  : never;

export type AssignmentType<SN extends ScenarioName = ScenarioName> = Partial<AssignmentRecordType<SN>>;
