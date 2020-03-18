import * as yargs from 'yargs';

import { fatal } from './console';

export interface CLIArgs {
  region: string;
  streamName: string;
  shardIteratorType: string;
}

type ShardIteratorType = 'AT_SEQUENCE_NUMBER' | 'AFTER_SEQUENCE_NUMBER' | 'TRIM_HORIZON' | 'LATEST';

const shardIteratorTypes: ReadonlyArray<ShardIteratorType> = [
  'AT_SEQUENCE_NUMBER',
  'AFTER_SEQUENCE_NUMBER',
  'TRIM_HORIZON',
  'LATEST',
] as const;

// supply the iterator type
// optionally supply the shardID(s). if not supplied, get the first (v1) or list all of them (v2)
// optionally (v3) accept kms fields to decrypt messages
export function getCLIArgs(): CLIArgs {
  const argv = yargs
    .options({
      region: {
        demandOption: true,
        description: 'aws region',
        default: 'us-east-1',
        type: 'string',
      },
      streamName: {
        alias: 's',
        demandOption: true,
        description: 'stream name',
        type: 'string',
      },
      shardIteratorType: {
        alias: 'i',
        choices: shardIteratorTypes,
        description: 'Shard iterator type for get-shard-iterator api call',
        type: 'string',
      },
    })
    .check(_data => {
      return true;
    }).argv;
  const { region, streamName, shardIteratorType } = argv;
  if (!region) fatal(new Error(`--region is required`));
  if (!streamName) fatal(new Error(`--stream-name is required`));
  if (!shardIteratorType) fatal(new Error(`--shard-iterator-type is required`));
  return { region, streamName, shardIteratorType };
}
