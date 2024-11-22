// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
//
// Handlers for all the worker related routes.

import { KaryaMiddleware } from '../KoaContextState';
import * as HttpResponse from '@karya/http-response';
import { checkRegistrationInputs } from '@karya/validator';
import { BasicModel, WorkerModel } from '@karya/common';
import { Worker, RegistrationFormInput, RegistrationMechanism, WorkerRecord, Gender, ValidationOutput, languageMap } from '@karya/core';
import { VERSION } from '../Server';
/**
 * Get worker information. Returns relevant properties of the worker record
 * depending on the type of authentication mechanism.
 * @param ctx Karya request context
 */
export const get: KaryaMiddleware = async (ctx) => {
  // extract relevant fields from worker.
  const ver: any = ctx.header.version
  if (ver == undefined || parseInt(ver) < VERSION) {
    return HttpResponse.BadRequest(ctx, 'Please update your application first');
  }
  const {
    id,
    access_code,
    reg_mechanism,
    phone_number,
    auth_id,
    id_token,
    full_name,
    year_of_birth,
    gender,
    language,
    tags,
    created_at,
    last_updated_at,
    profile
  } = ctx.state.entity;

  // If auth mechanism is id token, then return all relevant fields
  if (ctx.state.auth_mechanism == 'karya-id-token') {
    const worker = {
      id,
      access_code,
      reg_mechanism,
      phone_number,
      auth_id,
      id_token,
      full_name,
      year_of_birth,
      gender,
      language,
      tags,
      created_at,
      last_updated_at,
      profile
    };
    HttpResponse.OK(ctx, worker);
  } else if (ctx.state.auth_mechanism == 'access-code') {
    const worker = { id, language, reg_mechanism, access_code, profile };
    HttpResponse.OK(ctx, worker);
  }
};

/**
 * Update the worker information.
 * @param ctx Karya request context
 */
export const update: KaryaMiddleware = async (ctx) => {
  const action = ctx.request.query['action'];

  // action should be either register or update
  if (action != 'register' && action != 'update' && action != 'disable') {
    HttpResponse.BadRequest(ctx, 'Missing or invalid action parameter');
    return;
  }

  // Get updates from the request body
  const updates: Worker = ctx.request.body;
  updates.profile_updated_at = new Date().toISOString();

  if (action == 'register') {
    const { year_of_birth, gender } = updates;
    if (!year_of_birth || !gender) {
      HttpResponse.BadRequest(ctx, 'Missing year of birth or gender with registration request');
      return;
    }
  }

  if (action == 'disable') {
    const worker_id: string = ctx.state.entity.id;
    const worker = await WorkerModel.markDisabled(worker_id);
    HttpResponse.OK(ctx, worker);
    return;
  }

  // TODO: check if only the updatable properties are updated
  const updatedRecord = await BasicModel.updateSingle('worker', { id: ctx.state.entity.id }, updates);
  HttpResponse.OK(ctx, updatedRecord);
};

/**
 * Register a worker after verifying phone OTP
 */
export const registerWorker: KaryaMiddleware = async (ctx) => {
  // extract relevant fields from worker.
  const now = new Date().toISOString();
  const record = await BasicModel.updateSingle(
    'worker',
    { id: ctx.state.entity.id },
    { reg_mechanism: 'phone-otp', registered_at: now, profile_updated_at: now }
  );
  const id_token = ctx.state.entity.id_token;
  ctx.state.entity = { ...record, id_token };

  HttpResponse.OK(ctx, ctx.state.entity);
};

/**
 * Send the generated token as HTTP response
 */
export const sendGeneratedIdToken: KaryaMiddleware = async (ctx) => {
  HttpResponse.OK(ctx, { id_token: ctx.state.entity.id_token });
};

export const createNewWorker: KaryaMiddleware = async (ctx) => {
  const body: RegistrationFormInput = ctx.request.body;
  const now = new Date().toISOString();

  const validationResults: ValidationOutput[] = checkRegistrationInputs(body);
  const errorMessages: ValidationOutput[] = validationResults
    .filter((validationResult) => validationResult.status === false)
    .map((validationResult) => {
      return validationResult;
    });

  if (errorMessages.length > 0) {
    HttpResponse.UnprocessableContent(ctx, errorMessages);
    return;
  }

  // For creating the access code we use our main data collection box id
  const BOX_ID: string = languageMap[body['language']]['box_id'];
  const access_code = body['phone_number'] + '222222' + BOX_ID
  const worker: Partial<WorkerRecord> = {
    full_name: body['full_name'],
    box_id: "24",
    phone_number: body['phone_number'],
    gender: body['gender'],
    language: body['language'],
    access_code,
    reg_mechanism: 'phone-otp' as RegistrationMechanism,
    registered_at: now,
    profile_updated_at: now,
    created_at: now,
    profile: body,
    tags: {
      tags: ['test', "pilot", "crowdsource", 'semi-extempore', 'wikipedia_sentences', 'alexa_commands', 'bigbasket_commands', 'umang_commands',
      ]
    },
  };
  for (const validationResult of validationResults) {
    const { key, newValue } = validationResult;
    // @ts-ignore
    worker['profile'][key] = newValue;
    if (key === 'gender') {
      worker[key] = newValue as Gender;
    }
    if (key === 'language') {
      worker.tags?.tags.push((newValue as string).toLowerCase());
      //@ts-ignore
      worker['profile']['primary_language'] = newValue;
    }
  }
  //@ts-ignore

  console.log('New value is', worker);
  try {
    const workerRecord: WorkerRecord = await BasicModel.getSingle('worker', { access_code })
    HttpResponse.Conflict(ctx, "User already exist")
    return
  } catch (error) {
  }

  try {
    const workerRecord: WorkerRecord = await BasicModel.insertRecord('worker', worker);
    console.log("Success");
    HttpResponse.OK(ctx, { access_code: workerRecord.access_code });
  } catch (e) {
    HttpResponse.InternalError(ctx, `Error occured while adding new worker`);
  }
}