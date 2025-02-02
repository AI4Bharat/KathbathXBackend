// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
//
// Entry point for the task chaining module.
//
// Task chaining allows the platform to generate microtasks of a particular task
// from completed assignments of a different task. This concept will enable work
// providers to easily create validationt tasks for their data collection tasks.

import { ScenarioName } from '../scenarios/Index';
import { BaseChainInterface } from './BaseChainInterface';
import { baseSpeechValidationChain, baseSpeechValidationMultiChain, baseSpeechSuperValidationChain } from './chains/SpeechValidation';

import { baseSignLanguageVideoValidation } from './chains/SignLanguageVideoValidation'

export * from './BaseChainInterface';
export * from './chains/SpeechValidation';
export * from './chains/SignLanguageVideoValidation';


// List of chains
export const chainNames = [
  'SPEECH_VALIDATION',
  'SPEECH_VALIDATION_MULTI',
  'SPEECH_SUPERVALIDATION',
  'SIGN_VIDEO_VALIDATION'
] as const;

export type ChainName = typeof chainNames[number];

/**
 * Chain Status type
 *
 * Defines the current status of a chain.
 *
 * 'ACTIVE': Chain is active and should be executed on completed assignmetns of
 *    the source task
 * 'INACTIVE': Chain is inactive and should not be executed on completed
 *    assignments of the source task
 */
export const chainStatuses = ['ACTIVE', 'INACTIVE'] as const;
export type ChainStatus = typeof chainStatuses[number];

// Chain map
export const baseChainMap: { [key in ChainName]: BaseChainInterface<ScenarioName, ScenarioName> } = {
  SPEECH_VALIDATION: baseSpeechValidationChain,
  SPEECH_VALIDATION_MULTI:baseSpeechValidationMultiChain,
  SPEECH_SUPERVALIDATION: baseSpeechSuperValidationChain,
  SIGN_VIDEO_VALIDATION: baseSignLanguageVideoValidation
};
