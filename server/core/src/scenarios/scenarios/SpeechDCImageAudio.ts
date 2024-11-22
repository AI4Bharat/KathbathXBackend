// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
//
// Implementation of the speech-data scenario

import { BaseScenarioInterface } from '../ScenarioInterface';
import Joi from 'joi';
import { LanguageCode, languageMap, languageParameter } from '../../languages/Index';
import { TaskRecordType } from '../Index';

//  task input parameters
type SpeechDCImageAudioTaskInputParameters = {
  language: LanguageCode;
  compress: boolean;
  sampling_rate: string;
  bitwidth: string;
  maxRecordingLength?: number;
  noForcedReplay: boolean;
};

//  input format
type SpeechDCImageAudioMicrotaskInput = { };
type SpeechDCImageAudioMicrotaskInputFiles = { image: string, audio_prompt: string };

//  output format
type SpeechDCImageAudioMicrotaskOutput = { duration?: number };
type SpeechDCImageAudioMicrotaskOutputFiles = { recording: string };

// Base  scenario type
export type BaseSpeechDCImageAudioScenario = BaseScenarioInterface<
  'SPEECH_DC_IMGAUD',
  SpeechDCImageAudioTaskInputParameters,
  SpeechDCImageAudioMicrotaskInput,
  SpeechDCImageAudioMicrotaskInputFiles,
  SpeechDCImageAudioMicrotaskOutput,
  SpeechDCImageAudioMicrotaskOutputFiles
>;

/**
 * Task parameter input and file formats.
 */
const task_input: BaseSpeechDCImageAudioScenario['task_input'] = [
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

// Task input file format for  task
const task_input_file: BaseSpeechDCImageAudioScenario['task_input_file'] = {
  json: {
    required: true,
    description: `\
    JSON file containing an array of objects. Each object must have a sentence field that contains the\
    sentence prompt for the recording.\
    `,
    schema: Joi.array().items(Joi.object({ audio_prompt: Joi.string(), image: Joi.string() }).unknown(true)),
  },
  tgz: { 
    required: true,
    description: 'TGZ file contains the image and audio_prompt which can be used as prompts'
  },
};

/**
 *  scenario implementation
 */
export const baseSpeechDCImageAudioScenario: BaseSpeechDCImageAudioScenario = {
  name: 'SPEECH_DC_IMGAUD',
  full_name: 'Speech Collection from Image and Audio',
  description: 'This scenario allows for collection of speech data from image and audio prompt',
  task_input,
  task_input_file,
  microtask_input: Joi.object({ audio_prompt: Joi.string().required(), image: Joi.string().required() }),
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
