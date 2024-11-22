// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
//
// Implementation of the speech-data scenario

import { MicrotaskList, IBackendScenarioInterface } from '../ScenarioInterface';
import {
  baseSpeechDCAudioScenario,
  BaseSpeechDCAudioScenario,
  TaskRecordType,
  MicrotaskType,
  MicrotaskRecordType,
} from '@karya/core';
import { Promise as BBPromise } from 'bluebird';
import { BasicModel, knex } from '@karya/common';
import { promises as fsp } from 'fs';

/**
 * Process the input file for the speech data task.
 * @param task Speech data task record
 * @param jsonFilePath Path to JSON file
 * @param tarFilePath --
 * @param task_folder Task folder path
 */
async function processInputFile(
  task: TaskRecordType<'SPEECH_DC_AUD'>,
  jsonData?: any,
  tarFilePath?: string,
  task_folder?: string
): Promise<MicrotaskList<'SPEECH_DC_AUD'>> {
  const prompts: { audio_prompt:string }[] = jsonData!;

  const microtasks = await BBPromise.mapSeries(prompts, async ({ audio_prompt }) => {
    const audioPromptFilePath = `${task_folder}/${audio_prompt}`;

    // console.log(task_folder)
    try {
      await fsp.access(audioPromptFilePath);

      const microtask: MicrotaskType<'SPEECH_DC_AUD'> = {
        task_id: task.id,
        input: {
          data: {  },
          files: { audio_prompt },
        },
        deadline: task.deadline,
        credits: task.params.creditsPerMicrotask,
        status: 'INCOMPLETE',
      };
      return microtask;
    } catch (e) {
      throw new Error(`audio or image prompt file not present`);
    }
  });

  return [{ mg: null, microtasks }];
}

// Backend speech data scenario
export const backendSpeechDCAudioScenario: IBackendScenarioInterface<BaseSpeechDCAudioScenario> = {
  ...baseSpeechDCAudioScenario,
  processInputFile,

  /**
   * Generate output files for speech data task. There are two files for each
   * verified assignment. A JSON file describing the details of the assignment,
   * and a recording file. Completed microtasks do not play a role.
   */
  async generateOutput(task, assignments, microtasks, task_folder, timestamp) {
    return [];
  },

  /**
   * Speech data microtask output
   * TODO: Temporarily returning null, as microtask output can be generated
   * directly from the task level output and is typically not necessary for
   * chaining.
   */
  async microtaskOutput(task, microtask, assignments) {
    return null;
  },

  async getTaskData(task_id) {

    return ({} as object)
  }
};
