// // Copyright (c) Microsoft Corporation.
// // Licensed under the MIT license.
// //
// // Backend implementation of the speech-transcription scenario

// import { MicrotaskList, IBackendScenarioInterface } from '../ScenarioInterface';
// import {
//   baseSpeechTranscriptionScenario,
//   BaseSpeechTranscriptionScenario,
//   MicrotaskType,
//   TaskRecordType,
// } from '@karya/core';
// import { Promise as BBPromise } from 'bluebird';
// import { promises as fsp } from 'fs';

// /**
//  * Process the input files for the speech Transcription task.
//  * @param task Speech Transcription task record
//  * @param jsonFilePath Path to JSON file
//  * @param tarFilePath Path to tar ball
//  * @param task_folder Task folder path
//  */
// async function processInputFile(
//   task: TaskRecordType<'SPEECH_TRANSCRIPTION'>,
//   jsonData?: any,
//   tarFilePath?: string,
//   task_folder?: string
// ): Promise<MicrotaskList<'SPEECH_TRANSCRIPTION'>> {
//   // Get all the objects from the json Data
//   const transcribeObjects: { sentence: string; recording: string }[] = jsonData!;

//   // Extract the microtasks
//   const microtasks = await BBPromise.mapSeries(transcribeObjects, async ({ sentence, recording }) => {
//     const filePath = `${task_folder}/${recording}`;
//     try {
//       await fsp.access(filePath);

//       const microtask: MicrotaskType<'SPEECH_TRANSCRIPTION'> = {
//         task_id: task.id,
//         input: {
//           data: { sentence },
//           files: { recording },
//         },
//         deadline: task.deadline,
//         credits: task.params.creditsPerMicrotask,
//         status: 'INCOMPLETE',
//       };

//       return microtask;
//     } catch (e) {
//       throw new Error(`Recording file not present`);
//     }
//   });

//   return [{ mg: null, microtasks }];
// }

// // Backend speech transcription scenario
// export const backendSpeechTranscriptionScenario: IBackendScenarioInterface<BaseSpeechTranscriptionScenario> = {
//   ...baseSpeechTranscriptionScenario,
//   processInputFile,

//   /**
//    * Generate output for speech transcription task. A single JSON file for each
//    * completed microtask that contains the source sentence, source recording
//    * name and the output.
//    */
//   async generateOutput(task, assignments, microtasks, task_folder, timestamp) {
//     const files: string[] = [];
//     await BBPromise.mapSeries(microtasks, async (microtask) => {
//       const jsonData = {
//         verification_id: microtask.id,
//         sentence: microtask.input.data.sentence,
//         recording: microtask.input.files!.recording,
//         transcription: microtask.output!.data.transcription,
//       };

//       // Write the json data to file
//       const jsonFile = `${microtask.id}.json`;
//       await fsp.writeFile(`${task_folder}/${jsonFile}`, JSON.stringify(jsonData, null, 2) + '\n');

//       // Push json file
//       files.push(jsonFile);
//     });
//     return files;
//   },

//   /**
//    * Generate speech verification microtaks output from a list of verified
//    * assignments.
//    * TODO: Temporarily return just the average. Does not work well with the
//    * speech validation
//    */
//   async microtaskOutput(task, microtask, assignments) {
//     // TODO: Make the reduction function dependent on a task parameter?

//     const data = assignments[0].output!.data;
//     /*
//       .map((mta) => mta.output!.data)
//       .reduce((value, current) => {
//         if (!current.auto && !value.auto) {
//           return {
//             auto: false,
//             accuracy: current.accuracy + value.accuracy,
//             quality: current.quality + value.quality,
//             volume: current.volume + value.volume,
//           };
//         } else if (current.auto && value.auto) {
//           return {
//             auto: true,
//             fraction: value.fraction,
//             score: current.score + value.score,
//           };
//         } else {
//           return value;
//         }
//       }); */
//     return { data };
//   },

//   async getTaskData(task_id) {
//     const ob = {} as object;
//     return ob;
//   },
// };
