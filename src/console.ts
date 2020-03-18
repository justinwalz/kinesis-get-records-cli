export function fatal(e: Error): never {
  console.warn(e.toString());
  process.exit(1);
}

export function warn(shardID: string, o: object): void {
  console.warn(`${shardID}: ${JSON.stringify(o, null, 2)}`);
}

export function warnMillisBehindLatest(shardID: string, millisBehindLatest?: number): void {
  if (!millisBehindLatest || millisBehindLatest === 0) return;
  warn(shardID, { MillisBehindLatest: millisBehindLatest });
}

export function handleShardRecords(shardID: string, records: AWS.Kinesis.Record[]): void {
  shardID; // potentially add to output
  records.forEach(record => console.log(record.Data.toString()));
}

