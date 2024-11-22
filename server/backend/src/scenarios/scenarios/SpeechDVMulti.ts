// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
//
// Backend implementation of the speech-verification scenario

import { MicrotaskList, IBackendScenarioInterface } from '../ScenarioInterface';
import {
  baseSpeechDVMultiScenario,
  BaseSpeechDVMultiScenario,
  MicrotaskType,
  TaskRecordType,
} from '@karya/core';
import { Promise as BBPromise } from 'bluebird';
import { promises as fsp } from 'fs';

/**
 * Process the input files for the speech verification task.
 * @param task Speech verification task record
 * @param jsonFilePath Path to JSON file
 * @param tarFilePath Path to tar ball
 * @param task_folder Task folder path
 */
async function processInputFile(
  task: TaskRecordType<'SPEECH_DV_MULTI'>,
  jsonData?: any,
  tarFilePath?: string,
  task_folder?: string
): Promise<MicrotaskList<'SPEECH_DV_MULTI'>> {
  // Get all the objects from the json Data
  const verifications: { sentence?:string, audio_prompt?:string, audio_response?:string, image?:string, recording: string, duration: number, chain: any }[] = jsonData!;
  
  // Extract the microtasks
  const microtasks = await BBPromise.mapSeries(verifications, async ({ sentence, audio_prompt, audio_response, image, recording, duration, chain }) => {
    const filePath = `${task_folder}/${recording}`;
    const audioPromptPath = `${task_folder}/${audio_prompt}`;
    const audioResponsePath = `${task_folder}/${audio_response}`;
    const imagePromptPath = `${task_folder}/${image}`;

    console.log(filePath,audioPromptPath,audioResponsePath,imagePromptPath)
    try {
      await fsp.access(filePath);
      if (audio_prompt) await fsp.access(audioPromptPath);
      if (audio_response) await fsp.access(audioResponsePath);
      if (image) await fsp.access(imagePromptPath);

      const microtask: MicrotaskType<'SPEECH_DV_MULTI'> = {
        task_id: task.id,
        input: {
          data: { sentence, duration },
          files: { recording, image, audio_prompt, audio_response },
          chain: {...chain}
        },
        deadline: task.deadline,
        credits: task.params.creditsPerMicrotask,
        status: 'INCOMPLETE',
      };

      return microtask;
    } catch (e) {
      console.log(e)
      throw new Error(`Recording file not present`);
    }
  });

  return [{ mg: null, microtasks }];
}

// Backend speech verification scenario
export const backendSpeechDVMultiScenario: IBackendScenarioInterface<BaseSpeechDVMultiScenario> = {
  ...baseSpeechDVMultiScenario,
  processInputFile,

  /**
   * Generate output for speech verification task. A single JSON file for each
   * completed microtask that contains the source sentence, source recording
   * name and the output.
   */
  async generateOutput(task, assignments, microtasks, task_folder, timestamp) {
    // const files: string[] = [];
    // await BBPromise.mapSeries(microtasks, async (microtask) => {
    //   const jsonData = {
    //     verification_id: microtask.id,
    //     recording: microtask.input.files!.recording,
    //     report: microtask.output!.data,
    //   };

    //   // Write the json data to file
    //   const jsonFile = `${microtask.id}.json`;
    //   await fsp.writeFile(`${task_folder}/${jsonFile}`, JSON.stringify(jsonData, null, 2) + '\n');

    //   // Push json file
    //   files.push(jsonFile);
    // });
    // return files;
    return [];
  },

  /**
   * Generate speech verification microtaks output from a list of verified
   * assignments.
   * TODO: Temporarily return just the average. Does not work well with the
   * speech validation
   */
  async microtaskOutput(task, microtask, assignments) {
    // TODO: Make the reduction function dependent on a task parameter?

    const data = assignments[0].output!.data;
    /*
      .map((mta) => mta.output!.data)
      .reduce((value, current) => {
        if (!current.auto && !value.auto) {
          return {
            auto: false,
            accuracy: current.accuracy + value.accuracy,
            quality: current.quality + value.quality,
            volume: current.volume + value.volume,
          };
        } else if (current.auto && value.auto) {
          return {
            auto: true,
            fraction: value.fraction,
            score: current.score + value.score,
          };
        } else {
          return value;
        }
      }); */
    return { data };
  },

  async getTaskData(task_id) {
    const ob = {} as object;
    return ob;
  },
};
