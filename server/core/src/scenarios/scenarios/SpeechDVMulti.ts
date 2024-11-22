// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
//
// Base implementation of the speech-verification scenario

import { BaseScenarioInterface } from '../ScenarioInterface';
import Joi from 'joi';
import { LanguageCode, languageMap, languageParameter } from '../../languages/Index';
import { TaskRecordType } from '../Index';

// Speech verification task input parameters
type SpeechDVMultiTaskInputParameters = {
  language: LanguageCode;
  onlyAccuracy: boolean;
};

// Speech verification microtask input format
type SpeechDVMultiMicrotaskInput = { sentence?: string, duration?: number, chain?:any};

type SpeechDVMultiMicrotaskInputFiles = { audio_prompt?: string, audio_response?:string, image?: string, recording?: string } ;

// Speech verificaion microtask output format
type SpeechDVMultiMicrotaskOutput =
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
type SpeechDVMultiMicrotaskOutputFiles = { };

// Base speech verification scenario type
export type BaseSpeechDVMultiScenario = BaseScenarioInterface<
  'SPEECH_DV_MULTI',
  SpeechDVMultiTaskInputParameters,
  SpeechDVMultiMicrotaskInput,
  SpeechDVMultiMicrotaskInputFiles,
  SpeechDVMultiMicrotaskOutput,
  SpeechDVMultiMicrotaskOutputFiles
>;

// Speech verification task inputs
const task_input: BaseSpeechDVMultiScenario['task_input'] = [
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
const task_input_file: BaseSpeechDVMultiScenario['task_input_file'] = {
  json: {
    required: true,
    description: `JSON file containing an array of objects. Each object must have a sentence field that contains the sentence prompt and a recording field that contains the name of the recording file`,
    schema: Joi.array().items(
      Joi.object({ audio_prompt: Joi.string(), audio_response: Joi.string(), image: Joi.string(), recording: Joi.string() }).unknown(true)
    ),
  },
  tgz: {
    required: true,
    description: `Tar ball containing all the recordings with the names matching those provided in the JSON file`,
  },
};

// Base speech verification scenario
export const baseSpeechDVMultiScenario: BaseSpeechDVMultiScenario = {
  name: 'SPEECH_DV_MULTI',
  full_name: 'Speech Verification (Multi)',
  description: 'This scenario allows users to verify an audio recording against a sentence, image, audio_prompt and an audio_response',
  task_input,
  task_input_file,
  microtask_input: Joi.object({ sentence: Joi.string() }).unknown(true),
  microtask_input_files: ['audio_prompt','audio_response','image','recording'],
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
