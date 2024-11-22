// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
//
// Backend implementation of the speech validation chain

import { baseSpeechSuperValidationChain, MicrotaskType } from '@karya/core';
import { BackendChainInterface } from '../BackendChainInterface';

export const speechSuperValidationChain: BackendChainInterface<'SPEECH_DV_MULTI', 'SPEECH_DV_MULTI'> = {
  ...baseSpeechSuperValidationChain,

  /**
   * Generate speech verification microtasks for completed speech data assignments
   */
  async handleCompletedFromAssignments(fromTask, toTask, assignments, microtasks) {
    const chainedMicrotasks = assignments.map((assignment, i) => {
      const microtask = microtasks[i];
      
      // Temporary fix for output files that may be sent as array
      // const output_files = assignment.output!.files!;
      // const input_files = microtask.input!.files!;
      // let recording: string;
      
      // if (output_files instanceof Array) {
      //   recording = output_files[0];
      // } else {
      //   recording = output_files.recording;
      // }


      // TODO: Define a critera for the tasks to be created

      const chainedMicrotask: MicrotaskType<'SPEECH_DV_MULTI'> = {
        task_id: toTask.id,
        input: microtask.input,
        input_file_id: microtask.input_file_id,
        deadline: toTask.deadline,
        base_credits: toTask.params.baseCreditsPerMicrotask,
        credits: toTask.params.creditsPerMicrotask,
        status: 'INCOMPLETE',
      };
      return chainedMicrotask;
    });
    return chainedMicrotasks;
  },

  /**
   * Handle completion of speech verification microtasks. Generate verification
   * updates for the corresponding assignments
   */
  async handleCompletedToMicrotasks(fromTask, toTask, microtasks, assignments) {
    const verificationUpdates = microtasks.map((microtask, i) => {
      const assignment = assignments[i];
      const report = microtask.output!.data;
      let fraction = 0;

      if (report.auto) {
        fraction = report.fraction;
      } else {
        const { accuracy, volume, quality, fluency: rfluency } = report;
        const fluency = rfluency ?? 0;

        // if (accuracy == 0 || volume == 0 || quality == 0 || fluency == 0) {
        //   fraction = 0;
        // } else if (accuracy == 1 || fluency == 1) {
        //   fraction = 0.75;
        // } else {
        //   fraction = 1;
        // }

        const sum = accuracy + quality + volume;
        if (accuracy == 0 || quality == 0 || volume == 0) {
          fraction = 0;
        } else if (sum == 3) {
          fraction = 0.25;
        } else if (sum == 4) {
          fraction = 0.5;
        } else if (sum == 5) {
          fraction = 0.75;
        } else if (sum == 6) {
          fraction = 1;
        }
      }

      const credits = fraction * fromTask.params.creditsPerMicrotask;
      assignment.credits = credits;
      assignment.report = report;
      return assignment;
    });
    return verificationUpdates;
  },
};
