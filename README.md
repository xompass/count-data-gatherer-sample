# Get Count Data

## Requirements

- Node.js
- npm
- A Customer Id
- An API Key
- A List of assets to get data for

## How to use

1. Clone this repository
2. Run `npm install`
3. Create a file called `.env` in the root of the project
4. Add the following to the `.env` file:

```
CUSTOMER_ID=your-customer-id
API_KEY=your-api-key
ASSET_IDS=comma,separated,list,of,asset,ids
```

5. Run `npm start`

## Example Outputs

### GetCameras

```js
[
  {
    name: '<camera_name>',
    id: '<camera_id>',
    sensors: [
      {
        name: '<sensor_name>',
        // The data structure depends on the sensor type. In this case it will be CrossLineMultiRecognition
        type: '<sensor_type>',
        relativeId: '<sensor_relative_id>', // This field is unique in the asset
        parameters: {
          // This is the line that is drawn on the camera image
          points: [
            {
              x: 415,
              y: 595,
            },
            {
              x: 1433,
              y: 583,
            },
          ],
        },
        id: '<sensor_id>',
        assetId: '<camera_id>',
      },
    ],
  },
];
```

### GetSensorSummaries

Summaries are summaries of the data points in a time period. The time period is always 1 hour.

```js
[
  {
    from: '2023-09-07T12:00:00.000Z', // Start of the time period Always UTC
    to: '2023-09-07T13:00:00.000Z', // End of the time period Always UTC
    length: 17, // Amount of data received in the time period
    detail: {
      content: {
        class: {
          car: {
            incoming: {
              count: 15, // Amount of data received with incoming crossings for this class
              sum: 15, // Amount of incoming crossings for this class
              min: 1, // Minimum amount of incoming crossings in a single data point
              max: 1, // Maximum amount of incoming crossings in a single data point
              avg: 1, // Average amount of incoming crossings in a single data point
            },
            outgoing: {
              count: 15, // Amount of data received with outgoing crossings for this class
              sum: 0, // Amount of outgoing crossings for this class
              min: 0, // Minimum amount of outgoing crossings in a single data point
              max: 0, // Maximum amount of outgoing crossings in a single data point
            },
          },
          person: {
            incoming: {
              count: 2,
              sum: 1,
              min: 0,
              max: 1,
              avg: 0.5,
            },
            outgoing: {
              count: 2,
              sum: 1,
              min: 0,
              max: 1,
              avg: 0.5,
            },
          },
        },
        incoming: {
          count: 17, // Amount of data received with incoming crossings in the time period
          sum: 16, // Amount of incoming crossings in the time period
          min: 0, // Minimum amount of crossings in a single data point
          max: 1, // Maximum amount of crossings in a single data point
          avg: 0.9411764705882353, // Average amount of crossings in a single data point
        },
        outgoing: {
          count: 17, // Amount of data received with outgoing crossings in the time period
          sum: 1, // Amount of outgoing crossings in the time period
          min: 0, // Minimum amount of crossings in a single data point
          max: 1, // Maximum amount of crossings in a single data point
          avg: 0.058823529411764705, // Average amount of crossings in a single data point
        },
      },
    },
    sensorId: '<sensor_id>',
  },
];
```

### GetSensorDatasets

Datasets are groups of data points that are grouped together in intervals of 5 minutes.

```js
[
  {
    from: '2023-09-07T13:40:00.000Z', // Start of the 5 minutes period. Always UTC
    _data: [
      {
        from: '2023-09-07T13:43:45.658Z', // Date of the data point. Always UTC
        content: {
          car: {
            // Class of the crossing
            incoming: 1, // Amount of incoming crossings
            outgoing: 0, // Amount of outgoing crossings
          },
        },
      },
    ],
    sensorId: '<sensor_id>',
  },
];
```

### Event `asset.data`

```js
{
    "type": "asset.data",
    "from": {
        "model": "Asset",
        "id": "<camera_id>"
    },
    "through": {
        "model": "Asset",
        "id": "<camera_id>"
    },
    "body": {
        "<sensor_id>": [
            {
                "id": "<data_id>",
                "type": "<sensor_type>",
                "from": "2023-09-07T13:55:54.766Z", // Data point date. Always UTC
                "to": "2023-09-07T13:55:54.766Z",
                "content": {
                    "car": { // Class of the crossing
                        "incoming": 0, // Amount of incoming crossings
                        "outgoing": 1 // Amount of outgoing crossings
                    }
                },
                "created": "2023-09-07T13:55:54.917Z", // Date the data point was created. Always UTC
                "modified": "2023-09-07T13:55:54.917Z", // Date the data point was modified. Always UTC
            }
        ]
    }
}

```
