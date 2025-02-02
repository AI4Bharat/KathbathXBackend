// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
//
// Process an input file for a task via CLI

import dotenv from 'dotenv';
dotenv.config();

import { knex, setupDbConnection, setupBlobStore, BasicModel } from '@karya/common';
import { promises as fsp } from 'fs';
import { processInputFile } from '../task-ops/ops/InputProcessor';
import { TaskRecordType } from '@karya/core';

const task_id = process.argv[1];
const jsonPath = process.argv[2];
const tgzFilePath = process.argv[3];
const taskFolder = process.argv[4];

/** Main Script */
(async () => {
  setupDbConnection();
  setupBlobStore();

  const task = (await BasicModel.getSingle('task', { id: task_id })) as TaskRecordType;
  await fsp.mkdir(taskFolder);

  await processInputFile(task, jsonPath, tgzFilePath, taskFolder);
})().finally(() => knex.destroy());
