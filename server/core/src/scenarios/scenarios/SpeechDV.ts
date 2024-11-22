// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
//
// Base implementation of the speech-verification scenario

import { BaseScenarioInterface } from '../ScenarioInterface';
import Joi from 'joi';
import { LanguageCode, languageMap, languageParameter } from '../../languages/Index';
import { TaskRecordType } from '../Index';

// Speech verification task input parameters
type SpeechDVTaskInputParameters = {
  language: LanguageCode;
  onlyAccuracy: boolean;
};

// Speech verification microtask input format
type SpeechDVMicrotaskInput = { sentence: string, duration?: number, chain?:any};

type SpeechDVMicrotaskInputFiles = { recording?: string } ;

// Speech verificaion microtask output format
type SpeechDVMicrotaskOutput =
  | {
      auto: false | undefined;
      accuracy: number;
      quality: number;
      volume: number;
      fluency?: number;
    }
  | {
      auto: true;
      score: number;
      fraction: number;
    };
type SpeechDVMicrotaskOutputFiles = {};

// Base speech verification scenario type
export type BaseSpeechDVScenario = BaseScenarioInterface<
  'SPEECH_VERIFICATION',
  SpeechDVTaskInputParameters,
  SpeechDVMicrotaskInput,
  SpeechDVMicrotaskInputFiles,
  SpeechDVMicrotaskOutput,
  SpeechDVMicrotaskOutputFiles
>;

// Speech verification task inputs
const task_input: BaseSpeechDVScenario['task_input'] = [
  {
    id: 'onlyAccuracy',
    type: 'boolean',
    label: 'Check only for accuracy',
    description: 'Check only the accuracy of the sentence against the recording',
    required: false,
  },

  languageParameter('language', 'Language', 'Language of the recordings and transcript'),
];

// Task input file format for speech verification
const task_input_file: BaseSpeechDVScenario['task_input_file'] = {
  json: {
    required: true,
    description: `JSON file containing an array of objects. Each object must have a sentence field that contains the sentence prompt and a recording field that contains the name of the recording file`,
    schema: Joi.array().items(
      Joi.object({ recording: Joi.string().required() }).unknown(true)
    ),
  },
  tgz: {
    required: true,
    description: `Tar ball containing all the recordings with the names matching those provided in the JSON file`,
  },
};

// Base speech verification scenario
export const baseSpeechDVScenario: BaseSpeechDVScenario = {
  name: 'SPEECH_VERIFICATION',
  full_name: 'Speech Verification',
  description: 'This scenario allows users to verify an audio recording against a sentence and rate its quality',
  task_input,
  task_input_file,
  microtask_input: Joi.object({ sentence: Joi.string().required() }).unknown(true),
  microtask_input_files: ['recording'],
  microtask_output: Joi.object({
    accuracy: Joi.number().required(),
    quality: Joi.number().required(),
    volume: Joi.number().required(),
  }),
  microtask_output_files: [],
  assignment_granularity: 'MICROTASK',
  group_assignment_order: 'EITHER',
  microtask_assignment_order: 'EITHER',
  response_type: 'MULTIPLE_SUBJECTIVE',

  languageString(task:TaskRecordType) {
    return languageMap[task.params.language].primary_name;
  },
};
