import { SimplePool, nip19, type Event } from 'nostr-tools';
import { storage } from './storage';
import { seedDemoData } from './seed-data';

const REKTBOT_NPUB = 'npub1r3kty2vkh247jgdu63wgkcsnktdtp9hc3e962eudg0getgvxs4gsz4uytc';

// Relays where rektbot publishes (from profile at njump.me/rektbot@utxo.one)
const RELAYS = [
  'wss://relay.nostr.band',
  'wss://wot.nostr.net',
  'wss://relay.primal.net',
  'wss://wot.utxo.one',
  'wss://nostr.oxtr.dev',
  'wss://multiplexer.huszonegy.world',
];

export class NostrService {
  private pool: SimplePool;
  private rektbotPubkey: string;
  private isRunning: boolean = false;

  constructor() {
    this.pool = new SimplePool();
    const decoded = nip19.decode(REKTBOT_NPUB);
    this.rektbotPubkey = decoded.data as string;
  }

  async start() {
    if (this.isRunning) {
      console.log('Nostr service already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting Nostr service...');
    console.log('Rektbot pubkey:', this.rektbotPubkey);

    // Fetch historical messages first
    await this.fetchHistoricalMessages();

    // Subscribe to new messages
    this.subscribeToNewMessages();
  }

  private async fetchHistoricalMessages() {
    console.log('Fetching historical messages from rektbot...');
    console.log('Trying relays:', RELAYS);
    
    try {
      // Try fetching from the last 30 days
      const since = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
      
      const events = await this.pool.querySync(RELAYS, {
        authors: [this.rektbotPubkey],
        kinds: [1], // Kind 1 = text notes
        since,
        limit: 1000,
      });

      console.log(`Fetched ${events.length} historical events from the last 30 days`);

      if (events.length === 0) {
        console.log('No events found. This could mean:');
        console.log('1. The bot hasn\'t posted recently');
        console.log('2. The relays may require authentication (WOT)');
        console.log('3. The events may not be indexed on these relays');
        console.log('');
        console.log('Loading demo data for demonstration purposes...');
        await seedDemoData();
      } else {
        for (const event of events) {
          await this.processEvent(event);
        }
      }

      console.log('Historical messages processed');
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
          console.log('New event received:', event.id);
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
      // Check if message already exists
      const existing = await storage.getRektMessageByEventId(event.id);
      if (existing) {
        return;
      }

      const content = event.content.trim();
      const contentLower = content.toLowerCase();

      // Determine if it's a long or short rekt
      let type: 'long' | 'short' | null = null;
      
      if (contentLower.includes('long rekt') || contentLower.startsWith('long ')) {
        type = 'long';
      } else if (contentLower.includes('short rekt') || contentLower.startsWith('short ')) {
        type = 'short';
      }

      if (!type) {
        // Skip messages that don't match the pattern
        return;
      }

      const timestamp = new Date(event.created_at * 1000);

      await storage.insertRektMessage({
        nostrEventId: event.id,
        type,
        content,
        timestamp,
      });

      console.log(`Stored ${type} rekt message:`, event.id);
    } catch (error) {
      console.error('Error processing event:', error);
    }
  }

  stop() {
    this.isRunning = false;
    this.pool.close(RELAYS);
    console.log('Nostr service stopped');
  }
}

export const nostrService = new NostrService();
