// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
//
// Base implementation of the speech validation chain

import { BaseChainInterface } from '../BaseChainInterface';

export const baseSpeechValidationChain: BaseChainInterface<'SPEECH_DATA', 'SPEECH_VERIFICATION'> = {
  name: 'SPEECH_VALIDATION',
  full_name: 'Speech Validation',
  fromScenario: 'SPEECH_DATA',
  toScenario: 'SPEECH_VERIFICATION',
  blocking: 'EITHER',
  delay: 'EITHER',
  grouping: 'EITHER',
};

export const baseSpeechValidationMultiChain: BaseChainInterface<'SPEECH_DC_IMGAUD'|'SPEECH_DC_AUD'|'SPEECH_DC_AUDREF', 'SPEECH_DV_MULTI'> = {
  name: 'SPEECH_VALIDATION_MULTI',
  full_name: 'Speech Validation (Multi)',
  fromScenario: 'SPEECH_DC_IMGAUD',
  toScenario: 'SPEECH_DV_MULTI',
  blocking: 'EITHER',
  delay: 'EITHER',
  grouping: 'EITHER',
};

export const baseSpeechSuperValidationChain: BaseChainInterface<'SPEECH_DV_MULTI', 'SPEECH_DV_MULTI'> = {
  name: 'SPEECH_SUPERVALIDATION',
  full_name: 'Speech Super Validation',
  fromScenario: 'SPEECH_DV_MULTI',
  toScenario: 'SPEECH_DV_MULTI',
  blocking: 'EITHER',
  delay: 'EITHER',
  grouping: 'EITHER',
};

