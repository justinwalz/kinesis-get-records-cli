# kinesis-cli

[![npm version](https://badge.fury.io/js/kinesis-get-records-cli.svg)](https://badge.fury.io/js/kinesis-get-records-cli)

This CLI outputs newline separated records from kinesis. Written while developing another application as there did not seem to be a great way to simply dump records from all shards of a stream.

## Install

```bash
npm i -g kinesis-get-records-cli
```

## Usage

To fetch the latest records:

```bash
kinesis-get-records --stream-name <StreamName> --shard-iterator-type <ShardIteratorType>
kinesis-get-records --region us-east-1 -s my-stream -i LATEST
```

If records are JSON objects, consider piping into `jq`

## Example

Put records using the [AWS CLI](https://aws.amazon.com/cli/):

```bash
aws --region <AWSRegion> kinesis put-records --records Data=\'{\"key\":\"blob-$(date --iso-8601=seconds)\"}\',PartitionKey=foo --stream-name <StreamName>
```

Output

```bash
{"key":"blob-2020-03-18T07:22:29-07:00"}
{"key":"blob-2020-03-18T07:22:31-07:00"}
```

## Build

```bash
npm run transpile
```

## Run

```bash
 node lib --region <AWSRegion> -s <StreamName> -i LATEST
```
