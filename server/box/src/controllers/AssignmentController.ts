// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
//
// Handlers for all assignment related routes

import { KaryaMiddleware } from '../KoaContextState';
import * as HttpResponse from '@karya/http-response';
import { MicrotaskAssignmentRecord } from '@karya/core';
import { BasicModel, TaskOpModel, WorkerModel } from '@karya/common';
import { Promise as BBPromise } from 'bluebird';
import { assignMicrotasksForWorker } from '../assignments/AssignmentService';
import { executeForwardLink, handleNewlyCompletedAssignmentCustom } from '@karya/backend';
import { VERSION } from '../Server';
import { WorkerRecord } from '@karya/core';
import { TaskRecordType } from '@karya/core';
import { AssignmentRecordType } from '@karya/core';

/**
 * Get list of (new or verified) assignments for a worker
 * @param ctx Karya request context
 */
export const get: KaryaMiddleware = async (ctx) => {
  const worker = ctx.state.entity;
  const assignment_type = ctx.request.query.type;
  const from = ctx.request.query.from;
  const limit_param = ctx.request.query.limit;

  const ver:any = ctx.header.version
  if (ver == undefined || parseInt(ver) < VERSION){
      return HttpResponse.BadRequest(ctx, 'Please update your application first');
  }
  const workerObj = (await BasicModel.getSingle('worker', { id: worker.id})) as WorkerRecord;
  if (WorkerModel.isDisabled(workerObj)){
    return HttpResponse.BadRequest(ctx, 'Please contact your administrator first - Error Code BOB');
  }

  // Check assignment type
  if (assignment_type != 'new' && assignment_type != 'verified') {
    HttpResponse.BadRequest(ctx, 'Invalid assignment type');
    return;
  }

  // Check if from is valid
  // TODO: Check if from is formatted correctly
  if (!from || from instanceof Array) {
    HttpResponse.BadRequest(ctx, 'Missing or invalid from time');
    return;
  }

  // Check limit
  if (limit_param instanceof Array) {
    HttpResponse.BadRequest(ctx, 'Invalid limit');
    return;
  }
  const limit = limit_param ? Number.parseInt(limit_param, 10) : 1000;

  if (assignment_type == 'verified') {
    const records = await BasicModel.getRecords(
      'microtask_assignment',
      { worker_id: worker.id, status: 'VERIFIED' },
      [],
      [['verified_at', from, null]],
      'verified_at',
      limit
    );
    HttpResponse.OK(ctx, records);
  } else {
    // TODO: Adjust max credits
    await assignMicrotasksForWorker(worker, 10000);
    const assignments = await BasicModel.getRecords(
      'microtask_assignment',
      { worker_id: worker.id, status: 'ASSIGNED' },
      [],
      [['created_at', from, null]],
      'created_at'
    );
    const mtIds = assignments.map((mta) => mta.microtask_id);
    const microtasks = await BasicModel.getRecords('microtask', {}, [['id', mtIds]]);
    // This can be optimized to just be distinct task_ids
    const taskIds = microtasks.map((t) => t.task_id);
    const tasks = await BasicModel.getRecords('task', {}, [['id', taskIds]]);
    HttpResponse.OK(ctx, { tasks, microtasks, assignments });
  }
};

/**
 * Submitted completed or skipped assignments to the server
 * @param ctx Karya request context
 */
export const submit: KaryaMiddleware = async (ctx) => {
  const worker = ctx.state.entity;
  const assignments: MicrotaskAssignmentRecord[] = ctx.request.body;

  // TODO: Need to validate incoming request

  try {
    const ids: string[] = [];
    const submitted_to_box_at = new Date().toISOString();
    await BBPromise.mapSeries(assignments, async (assignment) => {
      const mtaDB = await BasicModel.getSingle('microtask_assignment',{'id':assignment.id}) as AssignmentRecordType
      // console.log(mtaDB)
      if (assignment.worker_id != worker.id) {
        // TODO: Internally log this error. User does not have access to assignment
      } else if (assignment.status != 'COMPLETED') { // 
        // TODO: Internally log this error. Can only submit completed
        // assignments through this route
      } else if (assignment.status == mtaDB.status) { // 
        // TODO: Internally log this error. Can only submit completed
        console.log(`${assignment.id} already COMPLETED`)
        // assignments through this route
        ids.push(assignment.id);
      } else {
        const { id, ...updates } = assignment;
        await BasicModel.updateSingle(
          'microtask_assignment',
          { id },
          { ...updates, submitted_to_box_at, base_credits: assignment.max_base_credits, submitted_to_server_at: null }
        );
        if (assignment.status == 'COMPLETED') {
          // TODO: Handle microtask assignment completion, by invoking policy
          // console.log(assignment)
          const assignments = [assignment] as AssignmentRecordType[]
          const task = await BasicModel.getSingle('task',{id:assignment.task_id}) as TaskRecordType
          // const taskOp = 'EXECUTE_FORWARD_TASK_LINK'
          const links = await BasicModel.getRecords('task_link', { from_task: task.id, status: 'ACTIVE' });

          let blocking = false;
          await BBPromise.mapSeries(links, async (link) => {
          if (link.blocking) blocking = true;
            await executeForwardLink(assignments, task, link);
          });
          // Get task links and execute forward task link
          
          if (!blocking){
            await handleNewlyCompletedAssignmentCustom(assignments[0],task)  
          }
          // Check for task_links and run the 
        }
        ids.push(id);
      }
    });

    HttpResponse.OK(ctx, ids);
  } catch (e) {
    console.log(e)
    HttpResponse.Forbidden(ctx, 'Cannot access assignments');
  }
};

/**
 * Submitted skipped and expired assignments to the server
 * @param ctx Karya request context
 */
export const submitSkippedExpired: KaryaMiddleware = async (ctx) => {
  const worker = ctx.state.entity;
  const assignments: MicrotaskAssignmentRecord[] = ctx.request.body;

  // TODO: Need to validate incoming request

  try {
    const ids: string[] = [];
    const submitted_to_box_at = new Date().toISOString();
    await BBPromise.mapSeries(assignments, async (assignment) => {
      const mtaDB = await BasicModel.getSingle('microtask_assignment',{'id':assignment.id}) as AssignmentRecordType

      if (assignment.worker_id != worker.id) {
        // TODO: Internally log this error. User does not have access to assignment
      } else if (assignment.status != 'SKIPPED' && assignment.status != 'EXPIRED') {
        // TODO: Internally log this error. Can only submit skipped or expired
        // assignments through this route
      } else if (assignment.status == mtaDB.status) {
        // TODO: Internally log this error. Can only submit skipped or expired
        console.log('Something seems incorrect.',assignment.id, assignment.status, mtaDB.status)
        ids.push(assignment.id);
        // assignments through this route
      } else {
        const { id, ...updates } = assignment;
        await BasicModel.updateSingle('microtask_assignment', { id }, { ...updates, submitted_to_box_at });
        ids.push(id);
      }
    });

    HttpResponse.OK(ctx, ids);
  } catch (e) {
    HttpResponse.Forbidden(ctx, 'Cannot access assignments');
  }
};
