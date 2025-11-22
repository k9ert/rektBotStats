import { SimplePool, nip19, type Event } from 'nostr-tools';
import { Point } from '@influxdata/influxdb-client';
import { influxDB, BUCKET_LONGS, BUCKET_SHORTS } from '../server/db';

const REKTBOT_NPUB = 'npub1r3kty2vkh247jgdu63wgkcsnktdtp9hc3e962eudg0getgvxs4gsz4uytc';

const RELAYS = [
  'wss://relay.nostr.band',
  'wss://relay.primal.net',
  'wss://nostr.oxtr.dev',
  'wss://nos.lol',
  'wss://relay.damus.io',
  'wss://nostr.mom',
  'wss://relay.snort.social',
  // WOT relays (may require auth)
  'wss://wot.nostr.net',
  'wss://wot.utxo.one',
];

class NostrCollector {
  private pool: SimplePool;
  private rektbotPubkey: string;
  private processedEvents: Set<string> = new Set();

  constructor() {
    this.pool = new SimplePool();
    const decoded = nip19.decode(REKTBOT_NPUB);
    this.rektbotPubkey = decoded.data as string;
  }

  async run() {
    console.log('Nostr Collector started');
    console.log('Rektbot pubkey:', this.rektbotPubkey);
    console.log('InfluxDB buckets:', BUCKET_LONGS, BUCKET_SHORTS);

    // Fetch recent historical messages
    await this.fetchHistoricalMessages();

    // Subscribe to new messages
    this.subscribeToNewMessages();
  }

  private async fetchHistoricalMessages() {
    console.log('Fetching historical messages...');
    console.log('Relays:', RELAYS);

    try {
      // Try last 7 days first
      let since = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);

      console.log('Trying last 7 days...');
      let events = await this.pool.querySync(RELAYS, {
        authors: [this.rektbotPubkey],
        kinds: [1],
        since,
        limit: 1000,
      });

      console.log(`Fetched ${events.length} events from last 7 days`);

      // If no events, try without time limit (get any events)
      if (events.length === 0) {
        console.log('No recent events, trying all time...');
        events = await this.pool.querySync(RELAYS, {
          authors: [this.rektbotPubkey],
          kinds: [1],
          limit: 100,
        });
        console.log(`Fetched ${events.length} events (all time)`);
      }

      let processed = 0;
      const total = events.length;
      for (const event of events) {
        await this.processEvent(event);
        processed++;
        if (processed % 50 === 0 || processed === total) {
          console.log(`Progress: ${processed}/${total} events processed (${Math.round(processed/total*100)}%)`);
        }
      }

      console.log(`Historical messages processed: ${total} events`);
    } catch (error) {
      console.error('Error fetching historical messages:', error);
    }
  }

  private subscribeToNewMessages() {
    console.log('Subscribing to new messages...');

    const processEventBound = this.processEvent.bind(this);

    this.pool.subscribeMany(
      RELAYS,
      [
        {
          authors: [this.rektbotPubkey],
          kinds: [1],
          since: Math.floor(Date.now() / 1000),
        } as any,
      ],
      {
        onevent(event: Event) {
          console.log('New event:', event.id.substring(0, 8));
          processEventBound(event);
        },
        oneose() {
          console.log('Subscription established');
        },
      }
    );
  }

  private async processEvent(event: Event) {
    try {
      if (this.processedEvents.has(event.id)) {
        return;
      }

      const content = event.content.trim();
      const contentLower = content.toLowerCase();

      let type: 'long' | 'short' | null = null;

      if (contentLower.includes('long rekt') || contentLower.startsWith('long ')) {
        type = 'long';
      } else if (contentLower.includes('short rekt') || contentLower.startsWith('short ')) {
        type = 'short';
      }

      if (!type) {
        return;
      }

      const bucket = type === 'long' ? BUCKET_LONGS : BUCKET_SHORTS;
      const org = process.env.INFLUX_ORG || 'rektBotStats';
      const writeApi = influxDB.getWriteApi(org, bucket, 'ns');

      const point = new Point('rekt_event')
        .tag('type', type)
        .stringField('nostrEventId', event.id)
        .stringField('content', content)
        .timestamp(new Date(event.created_at * 1000));

      writeApi.writePoint(point);
      await writeApi.close();

      this.processedEvents.add(event.id);
    } catch (error) {
      console.error('Error processing event:', error);
    }
  }

  stop() {
    this.pool.close(RELAYS);
    console.log('Collector stopped');
  }
}

const collector = new NostrCollector();
collector.run();

process.on('SIGINT', () => {
  console.log('\nShutting down...');
  collector.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down...');
  collector.stop();
  process.exit(0);
});
