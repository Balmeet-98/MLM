require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');

const RANKS = [
  { rank_order: 1,  name: 'Executive',             pairs_required: 3,       reward_name: 'P.P. Set',                                      reward_value: 500,       monthly_income: 0,      income_duration_months: 0   },
  { rank_order: 2,  name: 'Team Leader',           pairs_required: 6,       reward_name: 'Dinner Set',                                    reward_value: 2000,      monthly_income: 0,      income_duration_months: 0   },
  { rank_order: 3,  name: 'Sr. Team Leader',       pairs_required: 18,      reward_name: 'Mobile Phone or Rs.7,000 cash',                 reward_value: 7000,      monthly_income: 0,      income_duration_months: 0   },
  { rank_order: 4,  name: 'Silver',                pairs_required: 36,      reward_name: 'Thailand Tour or Rs.27,000 cash',               reward_value: 27000,     monthly_income: 0,      income_duration_months: 0   },
  { rank_order: 5,  name: '3 Star Gold',           pairs_required: 130,     reward_name: 'Motor Bike (D.P) Rs.57,000',                    reward_value: 57000,     monthly_income: 0,      income_duration_months: 0   },
  { rank_order: 6,  name: '4 Star Gold',           pairs_required: 510,     reward_name: 'Bullet Bike (D.P) Rs.1,10,000',                 reward_value: 110000,    monthly_income: 2500,   income_duration_months: 12  },
  { rank_order: 7,  name: '5 Star Ruby',           pairs_required: 1050,    reward_name: 'Alto Car (D.P) Rs.2,60,000',                    reward_value: 260000,    monthly_income: 5000,   income_duration_months: 12  },
  { rank_order: 8,  name: '6 Star Emerald',        pairs_required: 2250,    reward_name: 'Swift Car (D.P) Rs.7,50,000',                   reward_value: 750000,    monthly_income: 7500,   income_duration_months: 12  },
  { rank_order: 9,  name: '7 Star Diamond',        pairs_required: 5500,    reward_name: 'Tata Nexon (D.P) Rs.11,00,000',                 reward_value: 1100000,   monthly_income: 10000,  income_duration_months: 12  },
  { rank_order: 10, name: 'Director',              pairs_required: 13500,   reward_name: 'XUV Mahindra (D.P) Rs.20,00,000',               reward_value: 2000000,   monthly_income: 20000,  income_duration_months: 12  },
  { rank_order: 11, name: 'Silver Director',       pairs_required: 27000,   reward_name: 'Harrier (D.P) Rs.25,00,000 + latest iPhone',    reward_value: 2500000,   monthly_income: 30000,  income_duration_months: 12  },
  { rank_order: 12, name: 'Gold Director',         pairs_required: 54000,   reward_name: 'Audi Car (D.P) Rs.30,00,000 + latest iPhone',   reward_value: 3000000,   monthly_income: 40000,  income_duration_months: 12  },
  { rank_order: 13, name: 'Diamond Director',      pairs_required: 100000,  reward_name: 'Furnished Flat (D.P) Rs.50,00,000',             reward_value: 5000000,   monthly_income: 50000,  income_duration_months: 60  },
  { rank_order: 14, name: 'Black Diamond Director', pairs_required: 200000, reward_name: 'Grand Villa (D.P) Rs.1,00,00,000',              reward_value: 10000000,  monthly_income: 100000, income_duration_months: 999 },
];

const PRODUCTS = [
  { name: 'Semi-Auto Washing Machine', price: 8500,  tier: 'booking',   category: 'appliance'   },
  { name: 'TV LED 32"',              price: 12000, tier: 'booking',   category: 'electronics' },
  { name: 'Sofa Set (3+1+1)',        price: 15000, tier: 'booking',   category: 'furniture'   },
  { name: 'Wardrobe (3 Door)',       price: 10000, tier: 'booking',   category: 'furniture'   },
  { name: 'Projector',               price: 9000,  tier: 'booking',   category: 'electronics' },
  { name: 'Battery Inverter',        price: 8000,  tier: 'booking',   category: 'appliance'   },
  { name: 'Mattress (Double)',       price: 7000,  tier: 'booking',   category: 'furniture'   },
  { name: 'Cooler',                  price: 6500,  tier: 'booking',   category: 'appliance'   },
  { name: 'Auto Washing Machine',    price: 18000, tier: 'mid',       category: 'appliance'   },
  { name: 'Water Purifier',          price: 12000, tier: 'mid',       category: 'appliance'   },
  { name: 'TV LED 43"',              price: 22000, tier: 'mid',       category: 'electronics' },
  { name: 'Wardrobe (4 Door)',       price: 16000, tier: 'mid',       category: 'furniture'   },
  { name: 'Tablet / iPad',           price: 20000, tier: 'mid',       category: 'electronics' },
  { name: 'Temple / Mandir',         price: 8000,  tier: 'deluxe',    category: 'furniture'   },
  { name: 'TV LED 55"',              price: 35000, tier: 'deluxe',    category: 'electronics' },
  { name: 'Gas Stove (4 Burner)',    price: 6000,  tier: 'deluxe',    category: 'appliance'   },
  { name: 'Induction Cooktop',       price: 5000,  tier: 'deluxe',    category: 'appliance'   },
  { name: 'Room Heater',             price: 4500,  tier: 'deluxe',    category: 'appliance'   },
  { name: 'Premium Sofa Set',        price: 30000, tier: 'deluxe',    category: 'furniture'   },
  { name: 'Ceiling Fan (Set of 3)',  price: 5500,  tier: 'deluxe',    category: 'appliance'   },
  { name: 'Wall Art / Painting',     price: 3000,  tier: 'deluxe',    category: 'other'       },
  { name: 'Dining Table Set',        price: 25000, tier: 'double_id', category: 'furniture'   },
  { name: 'Dish Washer',             price: 30000, tier: 'double_id', category: 'appliance'   },
  { name: 'Laptop',                  price: 45000, tier: 'double_id', category: 'electronics' },
  { name: 'Split AC (1.5 Ton)',      price: 40000, tier: 'double_id', category: 'appliance'   },
];

const seed = async () => {
  console.log('Starting seed...');

  console.log('Seeding ranks...');
  for (const rank of RANKS) {
    const { error } = await supabase.from('ranks').upsert(rank, { onConflict: 'rank_order' });
    if (error) console.error('Rank seed error:', error.message);
  }

  console.log('Seeding products...');
  const { error: prodErr } = await supabase.from('products').insert(PRODUCTS);
  if (prodErr) console.log('Products may already exist:', prodErr.message);

  console.log('Seeding default group...');
  const { data: existingGroup } = await supabase
    .from('groups')
    .select('id')
    .eq('status', 'active')
    .limit(1)
    .single();

  if (!existingGroup) {
    const { error: groupErr } = await supabase.from('groups').insert({
      name: 'Samriddhi Network',
      status: 'active',
      max_members: 999999,
      cycle_months: 16,
      monthly_amount: 1200,
    });
    if (groupErr) console.log('Group seed error:', groupErr.message);
    else console.log('Default group created');
  }

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
      await supabase.from('wallets').insert({ user_id: adminUser.id, balance: 0 });
      await supabase.from('tree_nodes').insert({ user_id: adminUser.id });
      console.log('Admin created: admin@samriddhi.com / Admin@123');
    }
  } else {
    console.log('Admin already exists');
  }

  console.log('Seed completed!');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
