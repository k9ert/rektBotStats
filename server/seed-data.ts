import { storage } from './storage';

// Seed some demo data for testing when rektbot hasn't posted recently
export async function seedDemoData() {
  console.log('Seeding demo liquidation data...');
  
  const now = new Date();
  const demoMessages = [
    // Last 24 hours
    { type: 'long' as const, hours: 2, content: 'Long Rekt: $250K @ 96,432' },
    { type: 'short' as const, hours: 5, content: 'Short Rekt: $180K @ 96,890' },
    { type: 'long' as const, hours: 8, content: 'Long Rekt: $420K @ 95,123' },
    { type: 'short' as const, hours: 12, content: 'Short Rekt: $95K @ 97,234' },
    { type: 'long' as const, hours: 15, content: 'Long Rekt: $320K @ 94,567' },
    { type: 'short' as const, hours: 18, content: 'Short Rekt: $510K @ 98,012' },
    { type: 'long' as const, hours: 21, content: 'Long Rekt: $75K @ 95,890' },
    
    // Last 7 days
    { type: 'long' as const, hours: 30, content: 'Long Rekt: $890K @ 92,456' },
    { type: 'short' as const, hours: 48, content: 'Short Rekt: $1.2M @ 99,123' },
    { type: 'long' as const, hours: 72, content: 'Long Rekt: $450K @ 91,234' },
    { type: 'short' as const, hours: 96, content: 'Short Rekt: $680K @ 100,456' },
    { type: 'long' as const, hours: 120, content: 'Long Rekt: $220K @ 90,123' },
    { type: 'short' as const, hours: 144, content: 'Short Rekt: $340K @ 101,789' },
    
    // Last 30 days
    { type: 'long' as const, hours: 200, content: 'Long Rekt: $1.5M @ 88,456' },
    { type: 'short' as const, hours: 250, content: 'Short Rekt: $920K @ 103,234' },
    { type: 'long' as const, hours: 300, content: 'Long Rekt: $670K @ 87,123' },
    { type: 'short' as const, hours: 350, content: 'Short Rekt: $1.1M @ 105,678' },
    { type: 'long' as const, hours: 400, content: 'Long Rekt: $540K @ 86,234' },
    { type: 'short' as const, hours: 450, content: 'Short Rekt: $780K @ 107,890' },
    { type: 'long' as const, hours: 500, content: 'Long Rekt: $990K @ 85,567' },
    { type: 'short' as const, hours: 550, content: 'Short Rekt: $1.3M @ 109,123' },
  ];

  for (const msg of demoMessages) {
    const timestamp = new Date(now.getTime() - msg.hours * 60 * 60 * 1000);
    await storage.insertRektMessage({
      nostrEventId: `demo-${msg.type}-${msg.hours}`,
      type: msg.type,
      content: msg.content,
      timestamp,
    });
  }

  console.log(`Seeded ${demoMessages.length} demo messages`);
}
