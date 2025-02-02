// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
//
// Implementation of the speech-data scenario

import { BaseScenarioInterface } from '../ScenarioInterface';
import Joi from 'joi';
import { LanguageCode, languageMap, languageParameter } from '../../languages/Index';
import { TaskRecordType } from '../Index';

// Speech data task input parameters
type SpeechDCTextTaskInputParameters = {
  language: LanguageCode;
  compress: boolean;
  sampling_rate: string;
  bitwidth: string;
  maxRecordingLength?: number;
  noForcedReplay: boolean;
};

// Speech data input format
type SpeechDCTextMicrotaskInput = { sentence: string, duration?: number};
type SpeechDCTextMicrotaskInputFiles = {};

// Speech data output format
type SpeechDCTextMicrotaskOutput = { duration?: number };
type SpeechDCTextMicrotaskOutputFiles = { recording: string };

// Base speech data scenario type
export type BaseSpeechDCTextScenario = BaseScenarioInterface<
  'SPEECH_DATA',
  SpeechDCTextTaskInputParameters,
  SpeechDCTextMicrotaskInput,
  SpeechDCTextMicrotaskInputFiles,
  SpeechDCTextMicrotaskOutput,
  SpeechDCTextMicrotaskOutputFiles
>;

/**
 * Task parameter input and file formats.
 */
const task_input: BaseSpeechDCTextScenario['task_input'] = [
  languageParameter('language', 'Language', 'Language in which the recordings are collected'),

  {
    id: 'compress',
    label: 'Compress audio files?',
    description: 'If checked, audio files will be compressed using AAC',
    type: 'boolean',
    required: false,
  },

  {
    id: 'sampling_rate',
    label: 'Sampling rate',
    description: 'Sampling rate to be used for the audio recording',
    type: 'enum',
    required: true,
    list: [
      ['8k', '8 Khz'],
      ['16k', '16 Khz'],
      ['44k', '44 Khz'],
    ],
  },

  {
    id: 'bitwidth',
    label: 'Bitwidth per sample',
    description: 'Bitwidth for each sample',
    required: true,
    type: 'enum',
    list: [
      ['8', '8 bit per sample'],
      ['16', '16 bits per sample'],
    ],
  },

  {
    id: 'noForcedReplay',
    label: 'Avoid forced replay of recorded sentence',
    description:
      'App will not force the users to listen to their recorded sentence. Users can optionally listen if they want to',
    required: false,
    type: 'boolean',
  },

  {
    id: 'maxRecordingLength',
    label: 'Max limit on the recording length in seconds',
    description: 'If the recording length exceeds the given number, the recording will be rejected by the app',
    required: false,
    type: 'int',
  },
];

// Task input file format for speech data task
const task_input_file: BaseSpeechDCTextScenario['task_input_file'] = {
  json: {
    required: true,
    description: `\
    JSON file containing an array of objects. Each object must have a sentence field that contains the\
    sentence prompt for the recording.\
    `,
    schema: Joi.array().items(Joi.object({ sentence: Joi.string() }).unknown(true)),
  },
  tgz: { required: false },
};

/**
 * Speech data scenario implementation
 */
export const baseSpeechDCTextScenario: BaseSpeechDCTextScenario = {
  name: 'SPEECH_DATA',
  full_name: 'Speech Data Collection',
  description: 'This scenario allows for collection of speech data from a text corpus.',
  task_input,
  task_input_file,
  microtask_input: Joi.object({ sentence: Joi.string().required() }),
  microtask_input_files: [],
  microtask_output: Joi.object({}),
  microtask_output_files: ['recording'],
  assignment_granularity: 'MICROTASK',
  group_assignment_order: 'EITHER',
  microtask_assignment_order: 'EITHER',
  response_type: 'MULTIPLE_SUBJECTIVE',

  languageString(task:TaskRecordType) {
    return languageMap[task.params.language].primary_name;
  },
};
