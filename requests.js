const apiKey = process.env.API_KEY;
const apiUrl = 'https://api-worker.vsaas.ai/api';

module.exports = {
  GetCameras,
  GetSensorSummaries,
  GetSensorDatasets,
  SubscribeToAssetsData,
};

async function makeGETRequest(url) {
  const headers = { api_key: apiKey };
  const response = await fetch(url, {
    headers,
  });

  return response.json();
}

/**
 * Get Cameras
 */
async function GetCameras(customerId, assetIds) {
  const filter = {
    where: { id: { inq: assetIds } },
    fields: ['id', 'name'],
    include: {
      relation: 'sensors',
      scope: {
        fields: ['id', 'name', 'relativeId', 'parameters.points'],
        where: { type: 'CrossLineMultiRecognition' },
      },
    },
  };

  const url = `${apiUrl}/customers/${customerId}/assets?filter=${JSON.stringify(filter)}`;

  return makeGETRequest(url);
}

/**
 * Get Sensor Summaries. Summaries are grouped by hour.
 * @param {string} sensorId
 * @param {Date} start - start date. Note that the "from" field is the start of an hour
 * @param {Date} end - end date.
 */
async function GetSensorSummaries(sensorId, start, end) {
  const filter = {
    where: {
      and: [
        { updated: true }, // Only get summaries that are calculated
        { from: { gte: start } },
        { from: { lt: end } },
      ],
    },
    fields: ['detail.content', 'length', 'sensorId', 'from', 'to'],
    order: 'from DESC',
  };

  const url = `${apiUrl}/sensors/${sensorId}/summaries?filter=${JSON.stringify(filter)}`;

  return makeGETRequest(url);
}

/**
 * Get Sensor Datasets. Datasets are grouped by 5 minutes.
 * @param {string} sensorId
 * @param {Date} start - start date. Note that the "from" field is the start of a period of 5 minutes
 * @param {Date} end - end date.
 */
async function GetSensorDatasets(sensorId, start, end) {
  const filter = {
    where: { and: [{ from: { gte: start } }, { from: { lt: end } }] },
    fields: ['_data.content', '_data.from', 'from', 'sensorId'],
    order: 'from DESC',
  };

  const url = `${apiUrl}/sensors/${sensorId}/datasets?filter=${JSON.stringify(filter)}`;

  return makeGETRequest(url);
}

async function SubscribeToAssetsData(customerId, socket, assetIds) {
  const socketId = socket.id;
  const body = {
    id: customerId,
    socketId,
    where: {
      id: { inq: assetIds },
    },
  };

  const url = `${apiUrl}/customers/${customerId}/sockets/${socketId}/subscribe/assets`;

  const headers = {
    'Content-Type': 'application/json',
    api_key: apiKey,
  };

  await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });

  for (let assetId of assetIds) {
    socket.emit('subscribe', {
      modelName: 'Asset',
      modelId: assetId,
      channels: { data: true },
    });
  }
}
