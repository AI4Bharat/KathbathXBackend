// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
//
// Module to help with all things OTP.

import axios from 'axios';
import { envGetString, envGetBoolean } from '@karya/misc-utils';
import { DbRecordType } from '@karya/core';
import { BasicModel } from '../../Index';
import Application from 'koa';
import * as HttpResponse from '@karya/http-response';

// 2Factor OTP config type
export type PhoneOTPConfig = {
  available: boolean;
  url: string;
  apiKey: string;
};

// Get OTP config from environment
export function getOTPConfig(): PhoneOTPConfig {
  return {
    available: envGetBoolean('PHONE_OTP_AVAILABLE'),
    url: envGetString('PHONE_OTP_URL'),
    apiKey: envGetString('PHONE_OTP_API_KEY'),
  };
}

// Set OTP config to environment
export function setOTPConfig(config: PhoneOTPConfig) {
  process.env.PHONE_OTP_AVAILABLE = 'true';
  process.env.PHONE_OTP_URL = config.url;
  process.env.PHONE_OTP_API_KEY = config.apiKey;
}

/**
 * Generate a random OTP and return it
 * @param length Length of the OTP
 */
export function generateOTP(length: number = 6) {
  const otp = Math.round((Math.random() * 0.9 + 0.1) * Math.pow(10, length));
  //const otp = '112233';

  return otp;
}

/**
 * Send OTP to a phone number
 * @param phone_number Phone number to which to send the OTP
 * @param otp OTP to be sent
 */
export async function sendOTP(phone_number: string, otp: string) {
  try {
    const baseUrl = envGetString('PHONE_OTP_BASE_URL');  
    const apiKey = envGetString('PHONE_OTP_API_KEY');  
    const template = envGetString('PHONE_OTP_TEMPLATE');  

    if (!baseUrl || !apiKey) {
      throw new Error(" Missing PHONE_OTP_BASE_URL or PHONE_OTP_API_KEY");
    }

    //  Ensure baseUrl ends with a `/`
    const formattedBaseUrl = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";

    //  Dynamically insert phone number & OTP into the URL
    const url = `${formattedBaseUrl}${apiKey}/SMS/${phone_number}/${otp}/${template}`;

    console.log(` Corrected Request URL: ${url}`);

    // Send the request
    const response = await axios.get(url);
    console.log(" API Response:", response.data);

    if (response.data.Status !== 'Success') {
      console.error(" OTP Sending Failed:", response.data);
      throw new Error(`Failed to send OTP: ${response.data.Details}`);
    }

    console.log(` OTP ${otp} sent to ${phone_number}`);
  } catch (error) {
    //@ts-ignore
    console.error(' Error in sendOTP():', error?.response?.data || error.message);
    throw new Error('OTP service unavailable. Try again later.');
  }
}



// Expected state for OTP routes
export type OTPState<EntityType extends 'server_user' | 'worker'> = {
  phone_number: string;
  entity: DbRecordType<EntityType>;
};

/**
 * Generates a set of middlewares and route handlers to generate, resend, and
 * verify OTP sent to users.
 * @param entityType Name of the entity: server_user or worker
 */
export function OTPHandlerTemplate<EntityType extends 'server_user' | 'worker'>(entityType: EntityType) {
  // OTP middleware
  type OTPMiddleware = Application.Middleware<OTPState<EntityType>>;

  /**
   * Middleware to check if
   * 1) phone number is provided as part of the header,
   * 2) phone number is valid, and
   * 3) record not associated with a different phone number
   * @param ctx Karya request context
   */
  const checkPhoneNumber: OTPMiddleware = async (ctx, next) => {
    // Extract phone number from header
    const phone_number = ctx.request.header['phone-number'];

    // Check if phone number is valid
    if (!phone_number || phone_number instanceof Array) {
      HttpResponse.BadRequest(ctx, 'Missing or multiple phone numbers');
      return;
    }

    // Ensure that phone number is 10 digits
    if (!/^\d+$/.test(phone_number) || phone_number.length != 10) {
      HttpResponse.BadRequest(ctx, `Invalid phone number '${phone_number}'`);
      return;
    }

    // Check if record is already used by another phone number
    if (ctx.state.entity.reg_mechanism && ctx.state.entity.phone_number != phone_number) {
      HttpResponse.Forbidden(ctx, 'Record already used by another phone number');
      return;
    }

    ctx.state.phone_number = phone_number;
    await next();
  };

  /**
   * Generate OTP for the worker.
   * @param ctx Karya request context
   */
  const generate: OTPMiddleware = async (ctx, next) => {
    try {
      const phone_number = ctx.state.phone_number;
  
      // Generate OTP
      const otp = generateOTP();
      console.log(` Generated OTP: ${otp} for phone ${phone_number}`);
  
      // Fetch worker record first
      //@ts-ignore
      const worker = await BasicModel.getSingle(entityType, { phone_number });
  
      if (!worker) {
        console.error(`No worker found for phone number: ${phone_number}`);
        HttpResponse.BadRequest(ctx, 'Phone number not registered');
        return;
      }
  
      console.log(`Updating OTP for worker ID: ${worker.id}`);
  
      // Update worker record and store `otp_generated_at` as a JSON object
      //@ts-ignore
      const updateResult = await BasicModel.updateSingle(
        entityType,//@ts-ignore 
        { id: worker.id }, 
        { 
          otp, 
          otp_generated_at: JSON.stringify({ timestamp: new Date().toISOString() }) // ✅ Convert to JSON object
        }
      );
  
      console.log("OTP update result:", updateResult);
  
      //  Send OTP via 2Factor API
      await sendOTP(phone_number, otp.toString());
  
      HttpResponse.OK(ctx, { success: true });
      await next();
    } catch (error) {
      console.error(" Error in generate function:", error);
      HttpResponse.Unavailable(ctx, 'Could not send OTP');
    }
  };
  
  
  
  /**
   * Resend a previously generated OTP for the worker.
   * @param ctx Karya request context
   */
  const resend: OTPMiddleware = async (ctx, next) => {
    const entity = ctx.state.entity;
    const phone_number = ctx.state.phone_number;
    const otp = entity.otp;

    // Check if OTP was sent to this phone number before
    if (!otp) {
      HttpResponse.BadRequest(ctx, 'OTP was never sent to worker');
      return;
    }

    // Send the otp
    try {
      await sendOTP(phone_number, otp);
      HttpResponse.OK(ctx, {});
      await next();
    } catch (e) {
      HttpResponse.Unavailable(ctx, 'Could not send OTP');
    }
  };

  /**
   * Verify OTP for the worker.
   * @param ctx Karya request context
   */
  const verify: OTPMiddleware = async (ctx, next): Promise<boolean> => {
    try {
      const phone_number = ctx.request.header['phone-number'];
      const otp = ctx.request.header['otp'];
  
      console.log(` Verifying OTP for ${phone_number}`);
  
      // Check if OTP and phone number are provided
      if (!otp || otp instanceof Array || !phone_number) {
        console.error(" Missing OTP or phone number");
        HttpResponse.BadRequest(ctx, 'Missing OTP or phone number');
        return false;
      }
  
      // Fetch stored OTP from database
      //@ts-ignore
      const worker = await BasicModel.getSingle(entityType, { phone_number });
  
      if (!worker) {
        console.error(` Phone number not found: ${phone_number}`);
        HttpResponse.BadRequest(ctx, 'Phone number not found');
        return false;
      }
  
      console.log(`Stored OTP in DB: '${worker.otp}', Received OTP: '${otp}'`);
  
      // Ensure OTP is a string before comparison
      const storedOtp = worker.otp ? String(worker.otp).trim() : "";
      const receivedOtp = String(otp).trim();
  
      // Check if OTP is valid
      if (storedOtp !== receivedOtp) {
        console.error(" Invalid OTP entered!");
        HttpResponse.Unauthorized(ctx, 'Invalid OTP');
        return false;
      }
  
      console.log(`OTP verified successfully for ${phone_number}`);
  
      //  Send ONLY `{ success: true }`
      HttpResponse.OK(ctx, { message: "Verified" });
  
      return true;
    } catch (error) {
      console.error(" Error verifying OTP:", error);
      HttpResponse.InternalError(ctx, 'Failed to verify OTP');
      return false;
    }
  };
  
  
  

  return { generate, resend, verify, checkPhoneNumber };
}
