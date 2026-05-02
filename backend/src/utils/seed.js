require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');

const RANKS = [
  { rank_order: 1,  name: 'Executive',             pairs_required: 3,       reward_name: 'P.P. Set',                          reward_value: 500,       monthly_income: 0,      income_duration_months: 0  },
  { rank_order: 2,  name: 'Team Leader',            pairs_required: 6,       reward_name: 'Dinner Set',                         reward_value: 2000,      monthly_income: 0,      income_duration_months: 0  },
  { rank_order: 3,  name: 'Sr. Team Leader',        pairs_required: 18,      reward_name: 'Mobile Phone or Rs.7,000 cash',      reward_value: 7000,      monthly_income: 0,      income_duration_months: 0  },
  { rank_order: 4,  name: 'Silver',                 pairs_required: 36,      reward_name: 'Thailand Tour or Rs.27,000 cash',    reward_value: 27000,     monthly_income: 0,      income_duration_months: 0  },
  { rank_order: 5,  name: '3 Star Gold',            pairs_required: 130,     reward_name: 'Motor Bike',                         reward_value: 57000,     monthly_income: 0,      income_duration_months: 0  },
  { rank_order: 6,  name: '4 Star Gold',            pairs_required: 510,     reward_name: 'Bullet Bike',                        reward_value: 110000,    monthly_income: 2500,   income_duration_months: 12 },
  { rank_order: 7,  name: '5 Star Ruby',            pairs_required: 1050,    reward_name: 'Auto Car',                           reward_value: 260000,    monthly_income: 30000,  income_duration_months: 12 },
  { rank_order: 8,  name: '6 Star Emerald',         pairs_required: 2250,    reward_name: 'Swift Car',                          reward_value: 750000,    monthly_income: 15000,  income_duration_months: 12 },
  { rank_order: 9,  name: '7 Star Diamond',         pairs_required: 6500,    reward_name: 'Tata Nexon',                         reward_value: 1100000,   monthly_income: 25000,  income_duration_months: 12 },
  { rank_order: 10, name: 'Director',               pairs_required: 13500,   reward_name: 'XUV Mahindra',                       reward_value: 2000000,   monthly_income: 50000,  income_duration_months: 12 },
  { rank_order: 11, name: 'Silver Director',        pairs_required: 27000,   reward_name: 'Hummer',                             reward_value: 2500000,   monthly_income: 30000,  income_duration_months: 12 },
  { rank_order: 12, name: 'Gold Director',          pairs_required: 54000,   reward_name: 'Audi Car',                           reward_value: 9000000,   monthly_income: 40000,  income_duration_months: 12 },
  { rank_order: 13, name: 'Diamond Director',       pairs_required: 108000,  reward_name: 'Furnished Flat',                     reward_value: 20000000,  monthly_income: 60000,  income_duration_months: 60 },
  { rank_order: 14, name: 'Black Diamond Director', pairs_required: 216000,  reward_name: 'Grand Villa',                        reward_value: 50000000,  monthly_income: 125000, income_duration_months: 999 },
];

const PRODUCTS = [
  // BOOKING TIER
  { name: 'Semi-Auto Washing Machine', price: 8500,  tier: 'booking',   category: 'appliance'   },
  { name: 'TV LED 32"',                price: 12000, tier: 'booking',   category: 'electronics' },
  { name: 'Sofa Set (3+1+1)',          price: 15000, tier: 'booking',   category: 'furniture'   },
  { name: 'Wardrobe (3 Door)',         price: 10000, tier: 'booking',   category: 'furniture'   },
  { name: 'Projector',                 price: 9000,  tier: 'booking',   category: 'electronics' },
  { name: 'Battery Inverter',          price: 8000,  tier: 'booking',   category: 'appliance'   },
  { name: 'Mattress (Double)',         price: 7000,  tier: 'booking',   category: 'furniture'   },
  { name: 'Cooler',                    price: 6500,  tier: 'booking',   category: 'appliance'   },
  // MID TIER
  { name: 'Auto Washing Machine',      price: 18000, tier: 'mid',       category: 'appliance'   },
  { name: 'Water Purifier',            price: 12000, tier: 'mid',       category: 'appliance'   },
  { name: 'TV LED 43"',                price: 22000, tier: 'mid',       category: 'electronics' },
  { name: 'Wardrobe (4 Door)',         price: 16000, tier: 'mid',       category: 'furniture'   },
  { name: 'Tablet / iPad',             price: 20000, tier: 'mid',       category: 'electronics' },
  // DELUXE TIER
  { name: 'Temple / Mandir',           price: 8000,  tier: 'deluxe',    category: 'furniture'   },
  { name: 'TV LED 55"',                price: 35000, tier: 'deluxe',    category: 'electronics' },
  { name: 'Gas Stove (4 Burner)',      price: 6000,  tier: 'deluxe',    category: 'appliance'   },
  { name: 'Induction Cooktop',         price: 5000,  tier: 'deluxe',    category: 'appliance'   },
  { name: 'Room Heater',               price: 4500,  tier: 'deluxe',    category: 'appliance'   },
  { name: 'Premium Sofa Set',          price: 30000, tier: 'deluxe',    category: 'furniture'   },
  { name: 'Ceiling Fan (Set of 3)',    price: 5500,  tier: 'deluxe',    category: 'appliance'   },
  { name: 'Wall Art / Painting',       price: 3000,  tier: 'deluxe',    category: 'other'       },
  // DOUBLE ID TIER
  { name: 'Dining Table Set',          price: 25000, tier: 'double_id', category: 'furniture'   },
  { name: 'Dish Washer',               price: 30000, tier: 'double_id', category: 'appliance'   },
  { name: 'Laptop',                    price: 45000, tier: 'double_id', category: 'electronics' },
  { name: 'Split AC (1.5 Ton)',        price: 40000, tier: 'double_id', category: 'appliance'   },
];

const REWARD_CATALOG = [
  // Months 1-5
  { month_range_start: 1,  month_range_end: 5,  reward_name: 'Water Purifier',         reward_category: 'appliance',   quantity_per_draw: 1 },
  { month_range_start: 1,  month_range_end: 5,  reward_name: 'Split AC',               reward_category: 'appliance',   quantity_per_draw: 1 },
  { month_range_start: 1,  month_range_end: 5,  reward_name: 'TV LED',                 reward_category: 'electronics', quantity_per_draw: 1 },
  { month_range_start: 1,  month_range_end: 5,  reward_name: 'Washing Machine',        reward_category: 'appliance',   quantity_per_draw: 1 },
  { month_range_start: 1,  month_range_end: 5,  reward_name: 'Cooler',                 reward_category: 'appliance',   quantity_per_draw: 1 },
  // Months 6-10
  { month_range_start: 6,  month_range_end: 10, reward_name: 'Motorcycle (HF Deluxe)', reward_category: 'vehicle',     quantity_per_draw: 1 },
  { month_range_start: 6,  month_range_end: 10, reward_name: 'Scooter (Activa)',        reward_category: 'vehicle',     quantity_per_draw: 1 },
  { month_range_start: 6,  month_range_end: 10, reward_name: 'TV LED 43"',             reward_category: 'electronics', quantity_per_draw: 1 },
  { month_range_start: 6,  month_range_end: 10, reward_name: 'Home Theater System',    reward_category: 'electronics', quantity_per_draw: 1 },
  { month_range_start: 6,  month_range_end: 10, reward_name: 'Wardrobe / Almirah',     reward_category: 'furniture',   quantity_per_draw: 1 },
  { month_range_start: 6,  month_range_end: 10, reward_name: 'Sofa Set',               reward_category: 'furniture',   quantity_per_draw: 1 },
  // Months 11-13
  { month_range_start: 11, month_range_end: 13, reward_name: 'Washing Machine (Auto)', reward_category: 'appliance',   quantity_per_draw: 1 },
  { month_range_start: 11, month_range_end: 13, reward_name: 'Sofa Set',               reward_category: 'furniture',   quantity_per_draw: 1 },
  { month_range_start: 11, month_range_end: 13, reward_name: 'Bed Set',                reward_category: 'furniture',   quantity_per_draw: 1 },
  { month_range_start: 11, month_range_end: 13, reward_name: 'Motorcycle',             reward_category: 'vehicle',     quantity_per_draw: 1 },
  { month_range_start: 11, month_range_end: 13, reward_name: 'Scooter',                reward_category: 'vehicle',     quantity_per_draw: 1 },
  { month_range_start: 11, month_range_end: 13, reward_name: 'Battery Inverter',       reward_category: 'appliance',   quantity_per_draw: 1 },
  // Month 16 — Big Draw (multiple winners)
  { month_range_start: 16, month_range_end: 16, reward_name: 'Split AC (1.5 Ton)',     reward_category: 'appliance',   quantity_per_draw: 7 },
  { month_range_start: 16, month_range_end: 16, reward_name: 'LED TV 50"',             reward_category: 'electronics', quantity_per_draw: 7 },
  { month_range_start: 16, month_range_end: 16, reward_name: 'HF Deluxe Bike',         reward_category: 'vehicle',     quantity_per_draw: 10 },
  // Grand Prizes (special months — admin assigns manually)
  { month_range_start: 17, month_range_end: 17, reward_name: 'Royal Enfield Bullet Standard', reward_category: 'vehicle', quantity_per_draw: 1 },
  { month_range_start: 17, month_range_end: 17, reward_name: 'Alto Car',               reward_category: 'vehicle',     quantity_per_draw: 1 },
];

const seed = async () => {
  console.log('Starting seed...');

  // Seed ranks
  console.log('Seeding ranks...');
  for (const rank of RANKS) {
    const { error } = await supabase
      .from('ranks')
      .upsert(rank, { onConflict: 'rank_order' });
    if (error) console.error('Rank seed error:', error.message);
  }

  // Seed products
  console.log('Seeding products...');
  const { error: prodErr } = await supabase.from('products').insert(PRODUCTS);
  if (prodErr) console.log('Products may already exist:', prodErr.message);

  // Seed reward catalog
  console.log('Seeding reward catalog...');
  const { error: rewErr } = await supabase.from('reward_catalog').insert(REWARD_CATALOG);
  if (rewErr) console.log('Reward catalog may already exist:', rewErr.message);

  // Create default admin user
  console.log('Creating default admin...');
  const passwordHash = await bcrypt.hash('Admin@123', 12);
  const { data: existingAdmin } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'admin@samriddhi.com')
    .single();

  if (!existingAdmin) {
    const { data: adminUser, error: adminErr } = await supabase
      .from('users')
      .insert({
        name: 'Admin',
        email: 'admin@samriddhi.com',
        password_hash: passwordHash,
        phone: '9419185768',
        referral_code: 'ADMIN001',
        role: 'admin',
        is_active: true,
      })
      .select()
      .single();

    if (adminErr) {
      console.error('Admin creation error:', adminErr.message);
    } else {
      // Create wallet for admin
      await supabase.from('wallets').insert({ user_id: adminUser.id, balance: 0 });
      // Create binary tree node for admin (root)
      await supabase.from('binary_tree').insert({ user_id: adminUser.id });
      console.log('Admin created: admin@samriddhi.com / Admin@123');
    }
  } else {
    console.log('Admin already exists');
  }

  console.log('Seed completed!');
  process.exit(0);
};

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
