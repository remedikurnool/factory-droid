import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@onemedi.com' },
    update: {},
    create: {
      email: 'admin@onemedi.com',
      phone: '+919876543210',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      isVerified: true,
    },
  });

  console.log('Created admin user:', admin.email);

  // Create Medicine Categories
  const categories = [
    { name: 'Pain Relief', slug: 'pain-relief', image: '/categories/pain-relief.jpg' },
    { name: 'Cold & Cough', slug: 'cold-cough', image: '/categories/cold-cough.jpg' },
    { name: 'Diabetes', slug: 'diabetes', image: '/categories/diabetes.jpg' },
    { name: 'Vitamins & Supplements', slug: 'vitamins-supplements', image: '/categories/vitamins.jpg' },
    { name: 'First Aid', slug: 'first-aid', image: '/categories/first-aid.jpg' },
    { name: 'Skin Care', slug: 'skin-care', image: '/categories/skin-care.jpg' },
  ];

  for (const cat of categories) {
    await prisma.medicineCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log('Created medicine categories');

  // Create Brands
  const brands = [
    { name: 'Apollo Pharmacy', slug: 'apollo-pharmacy', logo: '/brands/apollo.png' },
    { name: 'Cipla', slug: 'cipla', logo: '/brands/cipla.png' },
    { name: 'Sun Pharma', slug: 'sun-pharma', logo: '/brands/sun-pharma.png' },
    { name: 'Dr. Reddy\'s', slug: 'dr-reddys', logo: '/brands/dr-reddys.png' },
  ];

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: brand,
    });
  }

  console.log('Created brands');

  // Create Lab Categories
  const labCategories = [
    { name: 'Blood Tests', slug: 'blood-tests', image: '/lab/blood-tests.jpg' },
    { name: 'Radiology', slug: 'radiology', image: '/lab/radiology.jpg' },
    { name: 'Full Body Checkup', slug: 'full-body-checkup', image: '/lab/checkup.jpg' },
  ];

  for (const labCat of labCategories) {
    await prisma.labCategory.upsert({
      where: { slug: labCat.slug },
      update: {},
      create: labCat,
    });
  }

  console.log('Created lab categories');

  // Create Service Categories
  const serviceCategories = [
    { name: 'Nursing Care', slug: 'nursing-care', image: '/services/nursing.jpg' },
    { name: 'Physiotherapy', slug: 'physiotherapy', image: '/services/physio.jpg' },
    { name: 'Diabetes Management', slug: 'diabetes-management', image: '/services/diabetes.jpg' },
  ];

  for (const srvCat of serviceCategories) {
    await prisma.serviceCategory.upsert({
      where: { slug: srvCat.slug },
      update: {},
      create: srvCat,
    });
  }

  console.log('Created service categories');

  // Create Banners
  const banners = [
    {
      title: 'Flat 20% Off on All Medicines',
      description: 'Use code HEALTH20',
      image: '/banners/medicine-sale.jpg',
      link: '/medicines',
      position: 1,
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Book Lab Tests from Home',
      description: 'Free home sample collection',
      image: '/banners/lab-tests.jpg',
      link: '/lab-tests',
      position: 2,
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const banner of banners) {
    await prisma.banner.create({ data: banner });
  }

  console.log('Created banners');

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
