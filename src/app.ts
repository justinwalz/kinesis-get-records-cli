import * as AWS from 'aws-sdk';
import * as bluebird from 'bluebird';

import * as args from './args';
import * as kinesis from './kinesis';
import { fatal, warn, warnMillisBehindLatest, handleShardRecords } from './console';

export async function main(args: args.CLIArgs): Promise<void> {
  const { region, streamName } = args;

  const shards = await kinesis.getShardsForStream(region, streamName);
  await bluebird.map(shards, async shard => watchShard({ args, shard }));
}

export interface WatchShardInput {
  args: args.CLIArgs;
  shard: AWS.Kinesis.Shard;
}

async function watchShard(input: WatchShardInput): Promise<void> {
  const { args, shard } = input;
  const { region, streamName, shardIteratorType } = args;

  const shardID = shard.ShardId;
  warn(shard.ShardId, {
    StartingHashKey: shard.HashKeyRange.StartingHashKey,
    StartingSequenceNumber: shard.SequenceNumberRange.StartingSequenceNumber,
  });

  // const startingSequenceNumber = 0; // used with AT_SEQUENCE_NUMBER, AFTER_SEQUENCE_NUMBER
  // const timestamp = ''; // used with AT_TIMESTAMP
  const shardIteratorResponse = await kinesis
    .getKinesisClient(region)
    .getShardIterator({ StreamName: streamName, ShardId: shardID, ShardIteratorType: shardIteratorType })
    .promise();

  let shardIterator = shardIteratorResponse.ShardIterator;
  if (!shardIterator) fatal(new Error(`shard ${shardID} unable to fetch iterator`));

  await watchShardIterator({ region, shard, shardIterator });
}

export interface WatchShardIteratorInput {
  region: string;
  shard: AWS.Kinesis.Shard;
  shardIterator?: string;
}

async function watchShardIterator(input: WatchShardIteratorInput): Promise<void> {
  const { region, shard, shardIterator } = input;

  if (!shardIterator) return;

  const getRecordsOutput = await kinesis
    .getKinesisClient(region)
    .getRecords({
      ShardIterator: shardIterator,
      Limit: 10_000,
    })
    .promise();

  warnMillisBehindLatest(shard.ShardId, getRecordsOutput.MillisBehindLatest);
  handleShardRecords(shard.ShardId, getRecordsOutput.Records);
  return watchShardIterator({ region, shard, shardIterator: getRecordsOutput.NextShardIterator });
}
