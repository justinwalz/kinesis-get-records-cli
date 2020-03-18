import * as AWS from 'aws-sdk';

import { fatal } from './console';

let KINESIS: AWS.Kinesis | undefined;

export function getKinesisClient(region: string): AWS.Kinesis {
  if (KINESIS) return KINESIS;

  return (KINESIS = new AWS.Kinesis({ region }));
}

export async function getShardsForStream(region: string, streamName: string): Promise<AWS.Kinesis.Shard[]> {
  const client = getKinesisClient(region);
  const streamInfo = await client
    .describeStream({ StreamName: streamName })
    .promise()
    .catch(fatal);

  if (streamInfo.StreamDescription.StreamStatus !== 'ACTIVE') {
    fatal(new Error(`${streamName} StreamStatus is not ACTIVE`));
  }

  if (streamInfo.StreamDescription.EncryptionType !== 'NONE') {
    console.warn(`${streamName} is encrypted, output will be hidden`);
  }

  return streamInfo.StreamDescription.Shards;
}
