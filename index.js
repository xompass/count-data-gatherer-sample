const io = require('socket.io-client');
require('dotenv').config();

if (!process.env.API_KEY) {
  throw new Error('API_KEY is not set');
}

if (!process.env.CUSTOMER_ID) {
  throw new Error('CUSTOMER_ID is not set');
}

if (!process.env.ASSET_IDS) {
  throw new Error('assetIds is not set');
}

const customerId = process.env.CUSTOMER_ID;
const assetIds = process.env.ASSET_IDS.split(',');
const apiKey = process.env.API_KEY;

const {
  GetCameras,
  GetSensorSummaries,
  GetSensorDatasets,
  SubscribeToAssetsData,
} = require('./requests');

// Connect to Socket.io
const socket = io(`https://sion.vsaas.ai?api_key=${apiKey}`, {
  transports: ['websocket'],
});

socket.on('connect', async () => {
  // Requests
  const assets = await GetCameras(customerId, assetIds);

  const lastSensor = assets[0]?.sensors?.[0];
  if (!lastSensor) {
    return;
  }

  // Get sensor summaries for the 5 hour
  const hourStart = new Date();
  hourStart.setHours(hourStart.getHours() - 6, 0, 0, 0);
  const hourEnd = new Date();
  hourEnd.setHours(hourEnd.getHours(), 0, 0, 0); // Summaries are generated at the end of the hour

  // summaries are ordered by from DESC
  const summaries = await GetSensorSummaries(lastSensor.id, hourStart, hourEnd);

  let datasetsStart = new Date();
  datasetsStart.setHours(datasetsStart.getHours(), 0, 0, 0);
  // Get the last summary to get the start date for datasets
  if (summaries?.[0]) {
    datasetsStart = new Date(summaries[0].to);
  }
  // Get sensor datasets for the current hour
  const datasetsEnd = new Date();
  const datasets = await GetSensorDatasets(lastSensor.id, datasetsStart, datasetsEnd);

  // Subscribe to Asset data
  await SubscribeToAssetsData(customerId, socket, assetIds);

  // Listen to Asset data
  socket.on('asset.data', (data) => {
    const body = data.body;
    const assetId = data.from.id;
    for (const sensorId in body) {
      // Note that the data is from all sensors in the asset.
      // We load only the CrossLineMultiRecognition sensors, so we need to filter the data.
      const sensor = assets
        .find((asset) => asset.id === assetId)
        ?.sensors?.find((sensor) => sensor.id === sensorId);

      if (!sensor) {
        continue;
      }

      console.log({
        sensorId,
        assetId,
        data: body[sensorId],
      });
    }
  });
});
