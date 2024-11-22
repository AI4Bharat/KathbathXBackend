// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
//
// Entry point for backend scenario functionality. Manages creation and
// execution of task operations: processing input files, and generating output
// files.

import { ScenarioName } from '@karya/core';
import { BackendScenarioInterface } from './ScenarioInterface';

import { backendSpeechDCTextScenario } from './scenarios/SpeechDCText';
import { backendSpeechDCImageAudioScenario } from './scenarios/SpeechDCImageAudio';
import { backendSpeechDCAudioScenario } from './scenarios/SpeechDCAudio';
import { backendSpeechDCAudioRefinementScenario } from './scenarios/SpeechDCAudioRefinement';
import { backendSpeechDVScenario } from './scenarios/SpeechDV';
import { backendSpeechDVMultiScenario } from './scenarios/SpeechDVMulti';
import { backendImageTranscriptionScenario } from './scenarios/ImageTranscription';
import { backendSignLanguageVideoScenario } from './scenarios/SignLanguageVideo';
import { backendSignLanguageVideoVerificationScenario } from './scenarios/SignLanguageVideoVerification';
// import { backendSpeechDataFromImageAudioScenario } from './scenarios/SpeechDCImageAudio';
// import { backendSpeechDataFromAudioScenario } from './scenarios/SpeechDCAudio';
// Local scenario Map
export const backendScenarioMap: {
  [key in ScenarioName]: BackendScenarioInterface<key, any, object, any, object, any>;
} = {
  SPEECH_DATA: backendSpeechDCTextScenario,
  SPEECH_DC_AUD: backendSpeechDCAudioScenario,
  SPEECH_DC_AUDREF: backendSpeechDCAudioRefinementScenario,
  SPEECH_DC_IMGAUD: backendSpeechDCImageAudioScenario,
  SPEECH_VERIFICATION: backendSpeechDVScenario,
  SPEECH_DV_MULTI: backendSpeechDVMultiScenario,
  IMAGE_DC_TEXT: backendImageTranscriptionScenario,
  SIGN_LANGUAGE_VIDEO: backendSignLanguageVideoScenario,
  SGN_LANG_VIDEO_VERIFICATION: backendSignLanguageVideoVerificationScenario,
};
