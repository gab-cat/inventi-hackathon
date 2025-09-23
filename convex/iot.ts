import { mutation, query, httpAction } from './_generated/server';
import { api } from './_generated/api';
import { ActionCtx } from './_generated/server';
import {
  handleWaterMeterReadingArgs,
  handleWaterMeterReadingHandler,
  handleElectricityMeterReadingArgs,
  handleElectricityMeterReadingHandler,
  getIoTDevicesArgs,
  getIoTDevicesHandler,
  getIoTReadingsArgs,
  getIoTReadingsHandler,
  getIoTDevicesArgs as mobileGetIoTDevicesArgs,
  getIoTDevicesHandler as mobileGetIoTDevicesHandler,
  getIoTReadingsMobileArgs as mobileGetIoTReadingsArgs,
  getIoTReadingsMobileHandler as mobileGetIoTReadingsHandler,
} from './iotDefinitions';

// Web mutations (webhook handlers)
export const handleWaterMeterReading = mutation({
  args: handleWaterMeterReadingArgs,
  handler: handleWaterMeterReadingHandler,
});

export const handleElectricityMeterReading = mutation({
  args: handleElectricityMeterReadingArgs,
  handler: handleElectricityMeterReadingHandler,
});

// Web queries
export const getIoTDevices = query({
  args: getIoTDevicesArgs,
  handler: getIoTDevicesHandler,
});

export const getIoTReadings = query({
  args: getIoTReadingsArgs,
  handler: getIoTReadingsHandler,
});

// Mobile queries
export const getIoTDevicesMobile = query({
  args: mobileGetIoTDevicesArgs,
  handler: mobileGetIoTDevicesHandler,
});

export const getIoTReadingsMobile = query({
  args: mobileGetIoTReadingsArgs,
  handler: mobileGetIoTReadingsHandler,
});

// HTTP Actions for webhooks
export const handleWaterMeterWebhook = httpAction(async (ctx: ActionCtx, request: Request) => {
  try {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const body = await request.json();

    const result = await ctx.runMutation(api.iot.handleWaterMeterReading, body);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Water meter webhook error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});

export const handleElectricityMeterWebhook = httpAction(async (ctx: ActionCtx, request: Request) => {
  try {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const body = await request.json();

    const result = await ctx.runMutation(api.iot.handleElectricityMeterReading, body);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Electricity meter webhook error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
