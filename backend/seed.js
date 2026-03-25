/**
 * IBR Database Seeder
 * Seeds initial data into MongoDB if collections are empty
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Story = require('./models/Story');
const Highlight = require('./models/Highlight');
const RidePost = require('./models/RidePost');
const Journey = require('./models/Journey');
const Rider = require('./models/Rider');
const Place = require('./models/Place');
const HeroSlide = require('./models/HeroSlide');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('🌱 Connected. Starting seed...');

  // Admin user
  const adminExists = await User.findOne({ role: 'admin' });
  if (!adminExists) {
    const hash = await bcrypt.hash('IBR2025PRIME', 10);
    await User.create({ username: 'Super Admin', email: 'admin@ibr.in', passwordHash: hash, role: 'admin' });
    console.log('✅ Admin user created');
  }

  // Hero Slides
  const slidesExist = await HeroSlide.countDocuments();
  if (!slidesExist) {
    await HeroSlide.insertMany([
      { image: 'https://images.unsplash.com/photo-1558981403-c5f91cbba527?auto=format&fit=crop&q=80&w=1920', title: 'OWN THE ROAD', subtitle: 'ESTABLISHED IN KOLKATA. BENGALI HEART.' },
      { image: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=1920', title: 'THE SQUAD', subtitle: 'BROTHERHOOD BEYOND THE BORDER.' },
      { image: 'https://images.unsplash.com/photo-1610647752706-3bb12232b3ab?auto=format&fit=crop&q=80&w=1920', title: 'NIGHT RUNNERS', subtitle: 'HIGH PERFORMANCE BENGALI SPIRIT.' },
    ]);
    console.log('✅ Hero slides seeded');
  }

  // Stories
  const storiesExist = await Story.countDocuments();
  if (!storiesExist) {
    await Story.insertMany([
      { type: 'image', url: 'https://picsum.photos/seed/s1/1080/1920', thumbnail: 'https://picsum.photos/seed/s1/200/200', createdAt: Date.now() - 7200000 },
      { type: 'video', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', thumbnail: 'https://picsum.photos/seed/s2/200/200', createdAt: Date.now() - 14400000 },
      { type: 'image', url: 'https://picsum.photos/seed/s3/1080/1920', thumbnail: 'https://picsum.photos/seed/s3/200/200', createdAt: Date.now() - 28800000 },
      { type: 'image', url: 'https://picsum.photos/seed/s4/1080/1920', thumbnail: 'https://picsum.photos/seed/s4/200/200', createdAt: Date.now() - 43200000 },
    ]);
    console.log('✅ Stories seeded');
  }

  // Highlights
  const highlightsExist = await Highlight.countDocuments();
  if (!highlightsExist) {
    const stories = await Story.find().limit(4);
    if (stories.length >= 2) {
      await Highlight.insertMany([
        { title: 'Ladakh 2023', cover: 'https://picsum.photos/seed/ladakh/400/400', storyIds: stories.slice(0, 2).map(s => s._id.toString()) },
        { title: 'Night Runs', cover: 'https://picsum.photos/seed/night/400/400', storyIds: stories.slice(2).map(s => s._id.toString()) },
      ]);
      console.log('✅ Highlights seeded');
    }
  }

  // Posts
  const postsExist = await RidePost.countDocuments();
  if (!postsExist) {
    await RidePost.insertMany([
      { type: 'photo', imageUrl: 'https://picsum.photos/seed/p1/800/1000', likes: 242, comments: 18, description: 'Midnight run through the neon lights.' },
      { type: 'photo', imageUrl: 'https://picsum.photos/seed/p2/800/800', likes: 156, comments: 4, description: 'Morning dew and heated grips.' },
      { type: 'photo', imageUrl: 'https://picsum.photos/seed/p3/800/1200', likes: 890, comments: 42, description: 'The squad hits the coast.' },
      { type: 'photo', imageUrl: 'https://picsum.photos/seed/p4/800/900', likes: 431, comments: 12, description: 'Pure mechanical aggression.' },
      { type: 'photo', imageUrl: 'https://picsum.photos/seed/p5/800/1100', likes: 672, comments: 22, description: 'Carbon fiber dreams.' },
      { type: 'photo', imageUrl: 'https://picsum.photos/seed/p6/800/800', likes: 311, comments: 8, description: 'Safety first, speed second.' },
    ]);
    console.log('✅ Posts seeded');
  }

  // Riders
  const ridersExist = await Rider.countDocuments();
  if (!ridersExist) {
    await Rider.insertMany([
      { name: 'Ace "Phantom"', bike: 'Ducati Panigale V4', image: 'https://picsum.photos/seed/rider1/600/800', category: 'founder' },
      { name: 'Siren', bike: 'Kawasaki Ninja H2', image: 'https://picsum.photos/seed/rider2/600/800', category: 'elite' },
      { name: 'Drift', bike: 'Yamaha R1M', image: 'https://picsum.photos/seed/rider3/600/800', category: 'community' },
      { name: 'Chrome', bike: 'BMW S1000RR', image: 'https://picsum.photos/seed/rider4/600/800', category: 'community' },
    ]);
    console.log('✅ Riders seeded');
  }

  // Journeys
  const journeysExist = await Journey.countDocuments();
  if (!journeysExist) {
    await Journey.insertMany([
      { title: 'The North Run', date: '2025-10-15', route: 'Kolkata-Siliguri', description: 'Exploring the gateway to the Himalayas.', price: '12,000', status: 'upcoming' },
      { title: 'Coastal Cruise', date: '2023-12-26', route: 'Digha-Mandarmoni', description: 'Legendary beach run.', price: '5,000', status: 'completed' },
    ]);
    console.log('✅ Journeys seeded');
  }

  // Places
  const placesExist = await Place.countDocuments();
  if (!placesExist) {
    await Place.insertMany([
      { name: 'Darjeeling', description: 'The Queen of Hills', coverImage: 'https://picsum.photos/seed/darj/800/600' },
      { name: 'Silk Route', description: 'Ancient trading paths', coverImage: 'https://picsum.photos/seed/silk/800/600' },
    ]);
    console.log('✅ Places seeded');
  }

  console.log('🏁 Seeding complete!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
