/**
 * TITAN FORGE DATA MODULE
 * Contains all structured data for Programs, Schedules, Products, Trainers, Transformations, and FAQs.
 */

const PRODUCT_STORAGE_KEY = 'titan_store_products';

function sanitizeProduct(product = {}) {
  return {
    id: product.id || `prod-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    name: product.name || 'New Product',
    category: product.category || 'Supplements',
    price: Number(product.price) || 0,
    originalPrice: Number(product.originalPrice) || Number(product.price) || 0,
    badge: product.badge || 'New',
    rating: Number(product.rating) || 4.8,
    reviews: Number(product.reviews) || 0,
    image: product.image || 'assets/supplements.jpg',
    shortDesc: product.shortDesc || 'Premium Titan Forge product.',
    tags: Array.isArray(product.tags) ? product.tags : []
  };
}

function loadPersistedProducts() {
  try {
    const saved = JSON.parse(localStorage.getItem(PRODUCT_STORAGE_KEY) || 'null');
    if (Array.isArray(saved) && saved.length) {
      return saved.map(sanitizeProduct);
    }
  } catch (e) {
    console.warn('Could not read saved products:', e);
  }
  return [];
}

function persistProducts(productList) {
  const normalized = (Array.isArray(productList) ? productList : []).map(sanitizeProduct);
  try {
    localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(normalized));
  } catch (e) {
    console.warn('Could not save products:', e);
  }
  if (window.GYM_DATA) {
    window.GYM_DATA.products = normalized;
  }
  window.dispatchEvent(new CustomEvent('titan-products-updated', { detail: normalized }));
  return normalized;
}

window.TITAN_PRODUCTS = {
  STORAGE_KEY: PRODUCT_STORAGE_KEY,
  load: loadPersistedProducts,
  save: persistProducts,
  sanitize: sanitizeProduct
};

const GYM_DATA = {
  programs: [
    {
      id: 'hypertrophy',
      title: 'Hypertrophy & Heavy Iron',
      tagline: 'Scientific muscle building & progressive overload',
      badge: 'Most Popular',
      category: 'Strength',
      icon: '🏋️‍♂️',
      desc: 'Targeted hypertrophy programming utilizing compound movements, tempo variations, and specialized isolation to stimulate maximum muscle growth and density.',
      stats: { duration: '60-75 Mins', intensity: 'Very High', level: 'Intermediate to Advanced' },
      features: ['Periodized strength cycles', 'Form coaching & spotter assistance', 'Custom hypertrophy split guidance', 'Free recovery shake post-session']
    },
    {
      id: 'crossfit',
      title: 'Titan Functional CrossFit',
      tagline: 'High-intensity power, conditioning & gymnastics',
      badge: 'High Energy',
      category: 'Functional',
      icon: '⚡',
      desc: 'High-octane functional workouts blending Olympic weightlifting, kettlebells, plyometrics, and gymnastics to forge unbreakable cardiovascular endurance.',
      stats: { duration: '50 Mins', intensity: 'Extreme', level: 'All Levels Scaled' },
      features: ['Daily WOD challenges', 'Olympic barbell platform work', 'Rogue & Assault fitness gear', 'Heart-rate telemetry tracking']
    },
    {
      id: 'combat',
      title: 'Combat Strike & Boxing',
      tagline: 'Striking technique, footwork & explosive stamina',
      badge: 'Championship Level',
      category: 'Combat',
      icon: '🥊',
      desc: 'Learn genuine fight mechanics, slipping, heavy bag combinations, and mitt work taught by decorated fighters. Burn up to 850 calories per session.',
      stats: { duration: '55 Mins', intensity: 'High', level: 'Beginner to Pro' },
      features: ['Authentic full-sized boxing ring', 'Water-filled teardrop heavy bags', 'Pad & mitt work with coaches', 'Hand wrap & glove rental included']
    },
    {
      id: 'recovery',
      title: 'Mobility, Yoga & Cryo-Spa',
      tagline: 'Active decompression, joint longevity & restoration',
      badge: 'Wellness',
      category: 'Recovery',
      icon: '🧘‍♀️',
      desc: 'Unlock tight hip flexors, alleviate spine compression, and accelerate muscular recovery with guided breathwork, mobility drills, infrared sauna, and cold plunge.',
      stats: { duration: '45 Mins', intensity: 'Low to Moderate', level: 'All Levels' },
      features: ['Cold plunge baths (3°C - 5°C)', 'Infrared detox sauna', 'Guided fascia release & foam rolling', 'Sound bath & breathwork']
    }
  ],

  schedules: [
    { id: 's1', day: 'Monday', time: '06:00 AM - 07:00 AM', name: 'Dawn Barbell Hypertrophy', trainer: 'Alex Vance', category: 'Strength', spotsTotal: 20, spotsLeft: 4, room: 'Heavy Iron Arena' },
    { id: 's2', day: 'Monday', time: '07:30 AM - 08:30 AM', name: 'Titan WOD Blitz', trainer: 'Maya Lin', category: 'Functional', spotsTotal: 18, spotsLeft: 2, room: 'CrossFit Zone' },
    { id: 's3', day: 'Monday', time: '05:30 PM - 06:30 PM', name: 'Boxing Strike Combinations', trainer: 'Marcus Cole', category: 'Combat', spotsTotal: 16, spotsLeft: 5, room: 'Combat Ring' },
    { id: 's4', day: 'Monday', time: '07:00 PM - 08:00 PM', name: 'Power Lifting Foundations', trainer: 'Alex Vance', category: 'Strength', spotsTotal: 15, spotsLeft: 1, room: 'Heavy Iron Arena' },

    { id: 's5', day: 'Tuesday', time: '06:30 AM - 07:30 AM', name: 'HIIT Kettlebell Surge', trainer: 'Maya Lin', category: 'Functional', spotsTotal: 22, spotsLeft: 8, room: 'Turf Zone' },
    { id: 's6', day: 'Tuesday', time: '09:00 AM - 10:00 AM', name: 'Deep Mobility & Yin Yoga', trainer: 'Elena Rostova', category: 'Recovery', spotsTotal: 25, spotsLeft: 12, room: 'Zen Studio' },
    { id: 's7', day: 'Tuesday', time: '06:00 PM - 07:00 PM', name: 'Upper Body Pump & Tone', trainer: 'Alex Vance', category: 'Strength', spotsTotal: 20, spotsLeft: 6, room: 'Heavy Iron Arena' },
    { id: 's8', day: 'Tuesday', time: '07:30 PM - 08:30 PM', name: 'Kickboxing Cardio Burn', trainer: 'Marcus Cole', category: 'Combat', spotsTotal: 18, spotsLeft: 3, room: 'Combat Ring' },

    { id: 's9', day: 'Wednesday', time: '06:00 AM - 07:00 AM', name: 'Leg Day Annihilation', trainer: 'Alex Vance', category: 'Strength', spotsTotal: 18, spotsLeft: 3, room: 'Heavy Iron Arena' },
    { id: 's10', day: 'Wednesday', time: '12:00 PM - 01:00 PM', name: 'Express Lunch Circuit', trainer: 'Maya Lin', category: 'Functional', spotsTotal: 20, spotsLeft: 7, room: 'Turf Zone' },
    { id: 's11', day: 'Wednesday', time: '06:00 PM - 07:00 PM', name: 'Spartan Strength WOD', trainer: 'Maya Lin', category: 'Functional', spotsTotal: 18, spotsLeft: 2, room: 'CrossFit Zone' },
    { id: 's12', day: 'Wednesday', time: '07:30 PM - 08:30 PM', name: 'Active Recovery & Breathwork', trainer: 'Elena Rostova', category: 'Recovery', spotsTotal: 25, spotsLeft: 14, room: 'Zen Studio' },

    { id: 's13', day: 'Thursday', time: '06:30 AM - 07:30 AM', name: 'Golden Gloves Boxing', trainer: 'Marcus Cole', category: 'Combat', spotsTotal: 16, spotsLeft: 5, room: 'Combat Ring' },
    { id: 's14', day: 'Thursday', time: '08:00 AM - 09:00 AM', name: 'Olympic Clean & Jerk Workshop', trainer: 'Maya Lin', category: 'Functional', spotsTotal: 12, spotsLeft: 1, room: 'CrossFit Zone' },
    { id: 's15', day: 'Thursday', time: '06:00 PM - 07:15 PM', name: 'Chest & Back Mastery', trainer: 'Alex Vance', category: 'Strength', spotsTotal: 20, spotsLeft: 4, room: 'Heavy Iron Arena' },

    { id: 's16', day: 'Friday', time: '06:00 AM - 07:00 AM', name: 'Endurance Hyrox Simulation', trainer: 'Maya Lin', category: 'Functional', spotsTotal: 24, spotsLeft: 6, room: 'Turf Zone' },
    { id: 's17', day: 'Friday', time: '05:30 PM - 06:30 PM', name: 'Heavy Bag Rhythm & Sparring', trainer: 'Marcus Cole', category: 'Combat', spotsTotal: 18, spotsLeft: 2, room: 'Combat Ring' },
    { id: 's18', day: 'Friday', time: '07:00 PM - 08:00 PM', name: 'Friday Night Pump & Beats', trainer: 'Alex Vance', category: 'Strength', spotsTotal: 30, spotsLeft: 7, room: 'Heavy Iron Arena' },

    { id: 's19', day: 'Saturday', time: '08:00 AM - 09:15 AM', name: 'Weekend Titan Team Challenge', trainer: 'Maya & Alex', category: 'Functional', spotsTotal: 35, spotsLeft: 9, room: 'CrossFit Zone' },
    { id: 's20', day: 'Saturday', time: '10:00 AM - 11:00 AM', name: 'Fighter Conditioning & Abs', trainer: 'Marcus Cole', category: 'Combat', spotsTotal: 20, spotsLeft: 4, room: 'Combat Ring' },
    { id: 's21', day: 'Saturday', time: '11:30 AM - 12:45 PM', name: 'Full Body Decompression & Spa', trainer: 'Elena Rostova', category: 'Recovery', spotsTotal: 25, spotsLeft: 10, room: 'Zen Studio' },

    { id: 's22', day: 'Sunday', time: '09:00 AM - 10:15 AM', name: 'Sunday Open Mat & Mobility Flow', trainer: 'Elena Rostova', category: 'Recovery', spotsTotal: 30, spotsLeft: 15, room: 'Zen Studio' },
    { id: 's23', day: 'Sunday', time: '10:30 AM - 12:00 PM', name: 'Heavy Lifting Club Open Platform', trainer: 'Alex Vance', category: 'Strength', spotsTotal: 20, spotsLeft: 8, room: 'Heavy Iron Arena' }
  ],

  products: [
    {
      id: 'prod-1',
      name: 'VOLT 100% Pure Whey Isolate (2.5kg)',
      category: 'Supplements',
      price: 4499,
      originalPrice: 5499,
      badge: 'Best Seller',
      rating: 4.9,
      reviews: 428,
      image: 'assets/supplements.jpg',
      shortDesc: '30g ultra-filtered whey isolate per serving with zero sugar and BCAAs.',
      tags: ['Fast Absorbing', 'Zero Sugar', '30g Protein']
    },
    {
      id: 'prod-2',
      name: 'VOLT High-Stim Igniter Pre-Workout (300g)',
      category: 'Supplements',
      price: 1999,
      originalPrice: 2499,
      badge: 'New Formula',
      rating: 4.8,
      reviews: 312,
      image: 'assets/supplements.jpg',
      shortDesc: 'Explosive focus, 350mg caffeine, 6g L-Citrulline, and clinical Beta-Alanine.',
      tags: ['Laser Focus', 'Skin-Splitting Pumps', 'Electrolytes']
    },
    {
      id: 'prod-3',
      name: 'VOLT Pure Micronized Creatine Monohydrate (500g)',
      category: 'Supplements',
      price: 1199,
      originalPrice: 1499,
      badge: 'Essential',
      rating: 5.0,
      reviews: 640,
      image: 'assets/supplements.jpg',
      shortDesc: '100% Creapure pharmaceutical grade for maximum ATP energy and strength.',
      tags: ['Unflavored', '100 Servings', 'Strength & Power']
    },
    {
      id: 'prod-4',
      name: 'Titan Heavy Duty 10mm Leather Powerlifting Belt',
      category: 'Gear',
      price: 2999,
      originalPrice: 3999,
      badge: 'IPF Spec',
      rating: 4.9,
      reviews: 189,
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
      shortDesc: 'Premium vegetable-tanned genuine leather with quick-release steel lever.',
      tags: ['Steel Lever', 'Heavy Duty', 'Lifetime Warranty']
    },
    {
      id: 'prod-5',
      name: 'Titan Forge Heavyweight Acid-Wash Pump Cover',
      category: 'Apparel',
      price: 1299,
      originalPrice: 1799,
      badge: 'Trending',
      rating: 4.7,
      reviews: 215,
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
      shortDesc: '280 GSM luxury combed cotton with dropped shoulders and distress wash.',
      tags: ['Oversized Fit', '100% Combed Cotton', 'Breathable']
    },
    {
      id: 'prod-6',
      name: 'Titan Pro Figure-8 Heavy Lifting Straps',
      category: 'Gear',
      price: 699,
      originalPrice: 999,
      badge: 'Must Have',
      rating: 4.8,
      reviews: 350,
      image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80',
      shortDesc: 'Reinforced industrial stitch cotton canvas for extreme deadlifts beyond 300kg.',
      tags: ['Extra Thick', 'Deadlift Safe', 'Anti-Slip']
    },
    {
      id: 'prod-7',
      name: 'Volt Double-Wall Insulated Steel Shaker (750ml)',
      category: 'Accessories',
      price: 899,
      originalPrice: 1199,
      badge: 'Cold 24h',
      rating: 4.9,
      reviews: 172,
      image: 'assets/supplements.jpg',
      shortDesc: 'Surgical grade stainless steel with silent mixing mesh and zero odor retention.',
      tags: ['BPA Free', 'Leak Proof', 'Cold All Day']
    },
    {
      id: 'prod-8',
      name: 'Titan Pro Seamless Compression Performance Tights',
      category: 'Apparel',
      price: 1499,
      originalPrice: 1999,
      badge: 'Athletic',
      rating: 4.6,
      reviews: 140,
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80',
      shortDesc: 'Graduated compression technology to boost circulation and muscle stability.',
      tags: ['4-Way Stretch', 'Sweat Wicking', 'Phone Pocket']
    }
  ],

  trainers: [
    {
      id: 'alex-vance',
      name: 'Alex Vance',
      role: 'Head of Strength & Hypertrophy',
      experience: '12+ Years Experience',
      badge: 'Master Coach',
      image: 'assets/trainers.jpg',
      specialties: ['Powerlifting & Hypertrophy', 'Periodized Strength Cycles', 'Biomechanics & Form Rectification'],
      credentials: ['CSCS (Certified Strength & Conditioning Specialist)', 'USAPL National Level Coach', 'B.Sc. Exercise Science'],
      achievements: ['Trained 14 national powerlifting record holders', 'Coached 250+ dramatic body transformations'],
      bio: 'Alex is renowned for turning plateaued lifters into absolute powerhouses. He combines evidence-based biomechanics with relentless intensity and mindset coaching.',
      social: { instagram: '@alex_titanstrength', linkedin: 'alex-vance-cscs' }
    },
    {
      id: 'maya-lin',
      name: 'Maya Lin',
      role: 'Olympic Lifting & CrossFit Director',
      experience: '9+ Years Experience',
      badge: 'CrossFit L3',
      image: 'assets/trainers.jpg',
      specialties: ['Olympic Snatch & Clean', 'Metabolic Conditioning (MetCon)', 'Gymnastics & Core Rigidity'],
      credentials: ['USAW Level 2 Olympic Weightlifting', 'CrossFit Level 3 Trainer', 'EXOS Performance Specialist'],
      achievements: ['Former CrossFit Games Regional Athlete', 'Over 1,200 coached classes with 99% 5-star rating'],
      bio: 'Maya believes that athletic power is an art form. Her dynamic classes push endurance ceilings while maintaining strict movement integrity and joint safety.',
      social: { instagram: '@mayalin_lifts', linkedin: 'maya-lin-fitness' }
    },
    {
      id: 'marcus-cole',
      name: 'Marcus Cole',
      role: 'Combat Striking & Conditioning Coach',
      experience: '11+ Years Experience',
      badge: 'Golden Gloves',
      image: 'https://images.unsplash.com/photo-1549476464-37392f717541?w=600&auto=format&fit=crop&q=80',
      specialties: ['Boxing Footwork & Defense', 'High-Intensity Fight Prep', 'Explosive Rotational Power'],
      credentials: ['USA Boxing Certified Coach', 'NASM Performance Enhancement Specialist (PES)', 'Muay Thai Black Armband'],
      achievements: ['Golden Gloves Semi-Finalist', 'Conditioning coach to 4 professional UFC / Bellator contenders'],
      bio: 'Marcus brings authentic fight grit into the gym. His sessions build lightning reflexes, rock-solid core torque, and fierce cardiovascular work capacity.',
      social: { instagram: '@marcus_cole_striking', linkedin: 'marcus-cole-combat' }
    },
    {
      id: 'elena-rostova',
      name: 'Elena Rostova, RD',
      role: 'Lead Sports Nutritionist & Mobility Specialist',
      experience: '8+ Years Experience',
      badge: 'Dietetics Pro',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80',
      specialties: ['Clinical Sports Dietetics', 'Post-Injury Fascia Mobility', 'Hormonal & Gut Optimization'],
      credentials: ['Registered Dietitian (RD/LDN)', 'Functional Movement Systems (FMS Certified)', 'M.Sc. Clinical Nutrition'],
      achievements: ['Created nutrition protocols for 500+ athletes', 'Author of "The Anabolic Fuel Guide"'],
      bio: 'Elena bridges the vital gap between intense training and internal recovery. Her nutrition and mobility strategies ensure longevity, peak output, and lean body composition.',
      social: { instagram: '@elena_nutrition_fit', linkedin: 'elena-rostova-rd' }
    }
  ],

  transformations: [
    {
      name: 'Vikram Mehta',
      age: 32,
      duration: '6 Months',
      trainer: 'Alex Vance',
      result: 'Lost 22 kg & Added 45kg to Deadlift',
      beforeWeight: '98 kg (31% Body Fat)',
      afterWeight: '76 kg (12% Body Fat)',
      quote: '"Titan Forge changed my entire life. I was lethargic and constantly dealing with lower back pain. Alex fixed my form and built a monster physique."',
      beforeImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80',
      image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80'
    },
    {
      name: 'Rhea Sharma',
      age: 27,
      duration: '4 Months',
      trainer: 'Maya Lin',
      result: 'First Muscle-Up & 14% Body Fat Drop',
      beforeWeight: '68 kg',
      afterWeight: '58 kg Athletic Lean',
      quote: '"Maya makes you feel capable of anything. From struggling with a single pull-up to competing in my first local CrossFit showdown!"',
      beforeImage: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=600&auto=format&fit=crop&q=80',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80'
    },
    {
      name: 'David Miller',
      age: 41,
      duration: '8 Months',
      trainer: 'Marcus & Elena',
      result: 'Reversed Pre-Diabetes & Gained 7kg Lean Muscle',
      beforeWeight: '104 kg',
      afterWeight: '88 kg Chiseled',
      quote: '"The combination of boxing cardio and Elena\'s macro strategy gave me the energy of my 20s. Titan Forge is in a league of its own."',
      beforeImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80'
    }
  ],

  faqs: [
    {
      question: 'What is included in the Free 3-Day VIP Trial Pass?',
      answer: 'Your VIP Pass grants 100% full access to our Heavy Iron floor, functional CrossFit turf, group classes, cryo-plunge and sauna recovery suites, plus a complimentary 30-minute body composition analysis with one of our master trainers.'
    },
    {
      question: 'Can I freeze or cancel my membership anytime?',
      answer: 'Yes! Titan Forge values freedom. All monthly memberships can be cancelled or put on hold (up to 60 days per year) with zero cancellation fees through our member portal.'
    },
    {
      question: 'Are classes suitable for beginners?',
      answer: 'Absolutely. Every workout at Titan Forge is coached by certified specialists with scalable progressions for every fitness level—from absolute beginners to competitive athletes.'
    },
    {
      question: 'How fast does the supplement store ship?',
      answer: 'All orders placed before 2:00 PM are dispatched same-day with premium expedited shipping (1-3 business days delivery). We also offer free in-club pickup at our reception desk within 1 hour.'
    },
    {
      question: 'Do I get personal trainer support with standard membership?',
      answer: 'All new members receive an initial 1-on-1 goal assessment, baseline functional movement screen, and workout orientation program. Additional 1-on-1 private coaching packages are available at discounted member rates.'
    }
  ],

  celebrityDiets: [
    {
      id: 'virat-kohli',
      name: 'Virat Kohli',
      title: 'King Kohli - Peak Athletic Lean Diet',
      category: 'Athletes',
      tag: 'Gluten-Free & Plant-Dominant',
      bodyFat: '8.5% Body Fat',
      dailyCalories: '2,500 kcal',
      macros: { protein: '145g', carbs: '275g', fats: '60g' },
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80',
      tagline: 'High endurance, zero inflammation, explosive speed and mental sharpness.',
      meals: [
        {
          time: '07:30 AM',
          name: 'Wake-Up Cellular Detox',
          items: ['Warm water with half freshly squeezed lemon', 'Black coffee (no sugar, single espresso)', '1 handful raw organic almonds & walnuts'],
          calories: '140 kcal'
        },
        {
          time: '08:45 AM',
          name: 'Power Breakfast',
          items: ['3 Boiled Egg Whites + 1 Whole Egg Omelette with Baby Spinach', '1 bowl fresh Papaya & Dragon Fruit', '2 slices Gluten-free Multi-grain Toast with 1 tbsp Almond Butter'],
          calories: '480 kcal'
        },
        {
          time: '01:30 PM',
          name: 'Clean Muscle Fuel Lunch',
          items: ['150g Steamed Quinoa or Brown Basmati Rice', '1 bowl Green Moong Dal / Rajma', '150g Grilled Tofu or Grilled Chicken Breast', 'Large plate of steamed broccoli, baby carrots & spinach'],
          calories: '680 kcal'
        },
        {
          time: '05:30 PM',
          name: 'Evening Pre-Training Fuel',
          items: ['1 cup Green Tea or Espresso', '1 bowl Dry Roasted Makhana (Foxnuts) with rock salt', '1 Green Apple or Seasonal Berry bowl'],
          calories: '220 kcal'
        },
        {
          time: '08:30 PM',
          name: 'Light Recovery Dinner',
          items: ['Clear vegetable & lentil soup with black pepper', 'Stir-fried zucchini, bell peppers & grilled tofu/cottage cheese', 'Zero heavy carbs at night for maximum fat burn'],
          calories: '450 kcal'
        }
      ],
      collegeHack: {
        dailyBudget: '₹140 - ₹180 / day',
        whereToBuy: [
          'Eggs: Buy 30-egg crate from local wholesale market (₹180/tray = ₹6/egg). 4 eggs = ₹24.',
          'Carbs: Local Kirana brown rice or regular broken basmati rice (₹50/kg). 100g = ₹5.',
          'Protein & Dal: Green moong dal (₹120/kg) or Soya chunks (₹45 for 200g gives 104g protein!).',
          'Snack: Roasted chana (bhuna chana) from street cart (₹120/kg, 50g = ₹6). Replaces expensive almonds.',
          'Fruit: Seasonal bananas or papaya from local fruit thela (₹30-40/kg).'
        ],
        hostelPrep: 'Boil eggs and rice together in an electric kettle. Soak green moong overnight in a plastic container in your hostel room—eat as sprouted protein salad!'
      },
      corporateHack: {
        dailyBudget: '₹350 - ₹480 / day',
        whereToBuy: [
          'Morning Snack: Order Epigamia Greek Yogurt / Pintola Almond Butter via Blinkit/Zepto (10-min delivery to office).',
          'Lunch: EatClub / EatFit Quinoa High-Protein Bowl or Subway Roast Chicken / Paneer salad with oil & vinegar dressing.',
          'Office Drawer: Keep a jar of roasted almonds, unsweetened makhana, and green tea bags at your work desk.'
        ],
        hostelPrep: 'Prep 3 days of brown rice and boiled chicken/paneer on Sunday evening. Pack into glass meal-prep boxes with airtight seals.'
      }
    },
    {
      id: 'hrithik-roshan',
      name: 'Hrithik Roshan',
      title: 'Greek God - 8-Pack Superhero Shred',
      category: 'Bollywood',
      tag: 'Extreme Hypertrophy & Low Fat',
      bodyFat: '7.5% Body Fat',
      dailyCalories: '2,650 kcal',
      macros: { protein: '185g', carbs: '240g', fats: '50g' },
      image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80',
      tagline: 'Razor-sharp muscle striations, vascularity, and high metabolic conditioning.',
      meals: [
        {
          time: '08:00 AM',
          name: 'Anabolic Breakfast',
          items: ['6 Egg whites scrambled with oregano & pink salt', '1 bowl Steel-cut oatmeal prepared in water with cinnamon & blueberries', '10 raw almonds'],
          calories: '490 kcal'
        },
        {
          time: '11:30 AM',
          name: 'Mid-Morning Whey Surge',
          items: ['1 Scoop VOLT Whey Isolate in cold water (30g protein)', '1 medium Apple or sweet lime'],
          calories: '220 kcal'
        },
        {
          time: '02:00 PM',
          name: 'Clean Carb & Meat Lunch',
          items: ['200g Grilled Chicken Breast or 200g Low-fat Paneer', '150g Boiled Sweet Potato (Shakarkandi)', 'Steamed green beans, broccoli and cucumber slices'],
          calories: '650 kcal'
        },
        {
          time: '05:30 PM',
          name: 'Pre-Workout Ignition',
          items: ['2 slices Whole Wheat / Brown Bread with 1 tbsp peanut butter', '1 cup strong Black Coffee', '1 banana 30 mins before lifting'],
          calories: '340 kcal'
        },
        {
          time: '07:30 PM',
          name: 'Post-Workout Anabolic Window',
          items: ['1 Scoop VOLT Whey Protein with 5g Creatine Monohydrate', 'Rice cakes or 200ml coconut water'],
          calories: '230 kcal'
        },
        {
          time: '09:15 PM',
          name: 'Lean Protein Dinner',
          items: ['180g Grilled Fish (Tilapia/Surmai) or Tofu Steak', 'Tossed green leafy salad with olive oil & lemon mist'],
          calories: '420 kcal'
        }
      ],
      collegeHack: {
        dailyBudget: '₹170 - ₹220 / day',
        whereToBuy: [
          'Sweet Potato (Shakarkandi): Buy from local vegetable mandi at ₹40-50/kg. 200g costs just ₹9 and provides clean complex carbs!',
          'Egg Whites: Street egg vendor will sell boiled eggs for ₹8-10. Discard yolks for 4 eggs to get 14g pure protein.',
          'Low-Fat Paneer: Buy Mother Dairy / Amul Paneer (₹85 for 200g) or make your own using toned milk and lemon in hostel!',
          'Oats: 1kg Quaker or Patanjali Rolled Oats costs ₹160 (lasts 20-25 breakfasts).'
        ],
        hostelPrep: 'Boil sweet potatoes in kettle or induction plate; mash with a pinch of chaat masala. Keep roasted chana handy for hunger pangs between lectures.'
      },
      corporateHack: {
        dailyBudget: '₹400 - ₹550 / day',
        whereToBuy: [
          'Pre-Cut Meats: FreshToHome / Licious antibiotic-free chicken breast pre-cut cubes.',
          'Office Micro-cooking: Sweet potatoes cook in 4 minutes flat in the office microwave (poke with fork, wrap in damp paper napkin).',
          'Amul High-Protein Lassi / Buttermilk: Grab from office cafeteria or Swiggy Instamart (₹25 for 15g protein, 0 added sugar).'
        ],
        hostelPrep: 'Cook batch chicken breast on George Foreman / air fryer, portion into 3 glass containers with boiled shakarkandi.'
      }
    },
    {
      id: 'john-abraham',
      name: 'John Abraham',
      title: 'Indian Muscle Titan - High Protein Heavy Mass',
      category: 'Bollywood',
      tag: 'Heavy Compound Mass & Clean Indian Nutrition',
      bodyFat: '9-10% Thick Muscle',
      dailyCalories: '3,100 kcal',
      macros: { protein: '200g', carbs: '360g', fats: '75g' },
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
      tagline: 'Massive shoulder girth, natural strength, and disciplined vegetarian/lean sources.',
      meals: [
        {
          time: '07:30 AM',
          name: 'Titan Morning Kick',
          items: ['Black coffee with cold-pressed coconut oil', '6 Egg whites with 2 slices multigrain bread', '1 bowl sprouted moong with lemon & tomato'],
          calories: '520 kcal'
        },
        {
          time: '11:00 AM',
          name: 'Mid-Morning Mass Shake',
          items: ['VOLT Whey Protein blended with oats, 1 tbsp peanut butter & 1 banana in toned milk'],
          calories: '460 kcal'
        },
        {
          time: '01:45 PM',
          name: 'Heavy Desi Lunch',
          items: ['3 Multi-grain Chapatis (Jowar / Bajra / Wheat)', '1 large bowl thick Arhar / Rajma dal', '200g Soya Bhurji or Grilled Paneer', 'Big bowl of cucumber-curd raita'],
          calories: '850 kcal'
        },
        {
          time: '05:30 PM',
          name: 'Pre-Workout Fuel',
          items: ['Boiled potatoes with black salt or sweet potato chaat', '4 boiled egg whites', 'Black coffee / Pre-workout'],
          calories: '380 kcal'
        },
        {
          time: '09:00 PM',
          name: 'Muscle Repair Dinner',
          items: ['150g Grilled Fish or 150g Tofu / Paneer bhurji', 'Stir-fried mushrooms and green vegetables', '1 cup warm turmeric toned milk before bed'],
          calories: '550 kcal'
        }
      ],
      collegeHack: {
        dailyBudget: '₹130 - ₹170 / day (Budget Beast)',
        whereToBuy: [
          'Soya Chunks (Budget Protein Staple): Fortune 200g packet = ₹45. 100g gives 52g pure protein for ₹22. Boil with salt, squeeze out the water and stir with onions.',
          'Sprouted Moong: Buy raw green moong from D-Mart (₹110/kg). 50g = ₹5.50 (gives 12g protein + enzymes).',
          'Sattu Drink (Bihari Whey): Pure Chana Sattu (₹80/500g). 4 spoons in chilled water with jeera and salt = 20g natural protein for ₹15!',
          'Local Boiled Potatoes: ₹20/kg at any local mandi. Instant pre-workout glycogen fuel.'
        ],
        hostelPrep: 'Soak soya chunks in boiling water in a kettle for 3 minutes. Squeeze them out and mix with tomato pickle or Schezwan chutney for an instant high-protein hostel meal.'
      },
      corporateHack: {
        dailyBudget: '₹300 - ₹420 / day',
        whereToBuy: [
          'Office Lunchbox Tip: Ask your corporate meal vendor to replace one vegetable dish with double paneer bhurji or extra-thick dal.',
          'Amul High-Protein Milk / Shakes: Keep Amul 25g protein shake bottles in office fridge (₹50 each).',
          'Subway Roasted Chicken / Veggie Double Patty: Swap mayo with mustard and mint mayo for clean macros.'
        ],
        hostelPrep: 'Order 5kg unflavored Sattu from Amazon or Blinkit. Keep shaker cup at your office desk for a 3 PM energizing protein drink.'
      }
    },
    {
      id: 'chris-hemsworth',
      name: 'Chris Hemsworth',
      title: 'Thor Odinson - Nordic God Physique',
      category: 'Hollywood',
      tag: 'Hollywood Super-Soldier Bulk',
      bodyFat: '8.5% Lean Mass',
      dailyCalories: '3,600 kcal',
      macros: { protein: '220g', carbs: '420g', fats: '95g' },
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80',
      tagline: 'Massive shoulder-to-waist V-taper, thick arms, and relentless heavy barbell volume.',
      meals: [
        {
          time: '08:00 AM',
          name: 'Thunder Breakfast',
          items: ['1 cup rolled oats with 1 scoop Whey, blueberries & chopped walnuts', '4 Whole poached eggs', '1 glass fresh orange juice'],
          calories: '650 kcal'
        },
        {
          time: '11:00 AM',
          name: 'Pre-Workout Superload',
          items: ['200g Grilled Chicken Breast or Paneer', '1 cup Jasmine rice or Basmati rice', 'Steamed green vegetables'],
          calories: '620 kcal'
        },
        {
          time: '02:30 PM',
          name: 'Post-Workout Feast',
          items: ['2 Scoops VOLT Whey Protein with almond milk & honey', '2 bananas', '1 cup Greek yogurt'],
          calories: '550 kcal'
        },
        {
          time: '06:00 PM',
          name: 'Anabolic Surge',
          items: ['200g Seared fish / chicken or paneer tikka', 'Baked potato with olive oil drizzle', 'Large garden salad'],
          calories: '720 kcal'
        },
        {
          time: '09:30 PM',
          name: 'Overnight Slow Recovery',
          items: ['1 bowl Cottage cheese / slow-release Casein with almond butter', 'Warm herbal chamomile tea'],
          calories: '450 kcal'
        }
      ],
      collegeHack: {
        dailyBudget: '₹190 - ₹250 / day',
        whereToBuy: [
          'Rice & Potatoes in Bulk: Buy 10kg sack of rice from wholesale mandi (₹450) and 5kg potatoes (₹100). Carbs cost ₹15/day.',
          'Local Whole Eggs: 6 whole eggs from street stall (₹48 = 36g protein, healthy fats & choline).',
          'Curd (Dahi): Mother Dairy 400g tub (₹35) gives 14g slow-digesting casein protein before sleeping in hostel room.'
        ],
        hostelPrep: 'Cook large batch of boiled potatoes and rice on your induction stove. Store in lunch box for post-workout carbs.'
      },
      corporateHack: {
        dailyBudget: '₹450 - ₹650 / day',
        whereToBuy: [
          'Corporate Pantry Oats: Keep quick rolled oats, honey bottle, and whey protein tub in your office locker.',
          'EatFit / Cure.fit Subscriptions: Daily high-protein lunch subscription delivered straight to your office tower front desk at 1:00 PM.',
          'Dry Fruit Medley: Nutraj raw walnuts and almonds bought in 500g pouches from Amazon for office desk snacking.'
        ],
        hostelPrep: 'Pack 2 protein shakers every morning before driving to office—one for 11 AM, second for post-work gym session.'
      }
    },
    {
      id: 'desi-influencer',
      name: 'Indian Fitness Creator Diet',
      title: 'Real Indian Youth Budget Shred (Hostel / PG Special)',
      category: 'Indian Budget Friendly',
      tag: '100% Pocket Friendly & Mess Proof',
      bodyFat: '10-12% Aesthetic',
      dailyCalories: '2,200 kcal',
      macros: { protein: '140g', carbs: '260g', fats: '45g' },
      image: 'https://images.unsplash.com/photo-1549476464-37392f717541?w=600&auto=format&fit=crop&q=80',
      tagline: 'Specifically designed for students living in college hostels, PGs, and young corporate freshers on tight budgets.',
      meals: [
        {
          time: '08:00 AM',
          name: 'Mess / PG Breakfast Hack',
          items: ['Hostel mess poha, upma or two parathas with no butter or extra oil', 'Three boiled eggs from a nearby food stall or one glass of sattu drink', 'Black tea or coffee with a small amount of milk'],
          calories: '420 kcal'
        },
        {
          time: '11:30 AM',
          name: 'Campus / Office Snack',
          items: ['50g Bhuna Chana (Roasted gram with skin)', '1 seasonal fruit (Banana / Guava / Orange)'],
          calories: '220 kcal'
        },
        {
          time: '02:00 PM',
          name: 'Mess Lunch Smart Swap',
          items: ['Two rotis without ghee and one cup of rice', 'One large bowl of mess dal', '50g boiled soya chunks cooked with the vegetable dish (26g protein)', 'Cucumber salad'],
          calories: '650 kcal'
        },
        {
          time: '05:30 PM',
          name: 'Pocket Pre-Workout',
          items: ['One cup of low-cost black coffee without sugar', 'Two slices of brown bread with one tablespoon of peanut butter or one banana'],
          calories: '250 kcal'
        },
        {
          time: '08:30 PM',
          name: 'Hostel Night Recovery',
          items: ['100g Paneer (Amul or local dairy raw with black salt) OR 4 boiled egg whites', 'Hostel Mess sabzi + 2 rotis', '1 glass warm milk or curd before sleep'],
          calories: '480 kcal'
        }
      ],
      collegeHack: {
        dailyBudget: '₹90 - ₹130 / day (Cheapest Diet in India!)',
        whereToBuy: [
          'Boiled Eggs: Three boiled eggs from a street food vendor outside the college gate cost about ₹25.',
          'Fortune Soya Chunks: ₹22 for 50g gives 26g protein. Carry raw chunks to the mess and add them to hot dal for 3 minutes until soft.',
          'Amul Toned Milk: ₹27 for 500ml pouch (gives 16g protein + 300 kcal).',
          'Bhuna Chana: ₹20 packet from local kirana store lasts 2-3 days in your hostel bag.',
          'Total Monthly Cost: Just ₹3,000 - ₹3,500/month for 130g+ daily protein!'
        ],
        hostelPrep: 'Keep an electric kettle (₹500 on Amazon) in your room. Use it to boil eggs, sweet potato, oats, and soya chunks without needing a kitchen.'
      },
      corporateHack: {
        dailyBudget: '₹180 - ₹240 / day',
        whereToBuy: [
          'Amul High Protein Buttermilk (₹15 for 15g protein) from Amul parlour or Zepto.',
          'Local Office Cafeteria: Request extra boiled egg whites (₹10/egg) or raw paneer bowl.',
          'Carry a 500g jar of Pintola or Disano peanut butter in your laptop bag.'
        ],
        hostelPrep: 'Keep roasted chana and soya nuts in airtight container on office table for healthy 4 PM munching.'
      }
    }
  ],

  gymStates: [
    {
      state: 'Delhi NCR',
      isPopular: true,
      badge: '⭐ Delhi NCR (Flagship Hubs)',
      districts: ['All Districts', 'South Delhi', 'Central Delhi', 'West Delhi']
    },
    {
      state: 'Haryana',
      isPopular: true,
      badge: '🔥 Haryana (Faridabad Mega Arena)',
      districts: ['All Districts', 'Faridabad', 'Gurgaon']
    },
    {
      state: 'Uttar Pradesh',
      isPopular: false,
      badge: 'UP NCR (Noida)',
      districts: ['All Districts', 'Noida']
    },
    {
      state: 'Maharashtra',
      isPopular: false,
      badge: 'Mumbai',
      districts: ['All Districts', 'Mumbai Suburban']
    }
  ],

  gymLocations: [
    {
      id: 'titan-delhi-south-gk',
      name: 'Titan Forge Iron Coliseum — South Delhi Flagship',
      state: 'Delhi NCR',
      district: 'South Delhi',
      isHighlighted: true,
      badge: '⭐ DELHI NCR FLAGSHIP',
      address: 'Plot 42, M-Block Main Market, Greater Kailash II (GK-2), New Delhi 110048',
      landmark: 'Near M-Block Metro & Savitri Cinema',
      rating: 4.9,
      reviews: 1840,
      phone: '+91 98110 44221',
      whatsapp: '919811044221',
      openHours: '05:30 AM - 11:30 PM (Mon - Sun)',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
      owner: {
        name: 'Mr. Vikramaditya Sharma',
        title: 'Founder & Managing Director',
        experience: '16+ Years Experience in Elite Athletics & Gym Management',
        bio: 'Ex-Mr. North India Silver Medalist and sports biomechanics specialist. Founded Titan Forge Delhi to bring Olympic-grade platforms, science-backed hypertrophy, and world-class recovery under one roof.',
        phone: '+91 98110 44221',
        avatar: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=300&auto=format&fit=crop&q=80',
        awards: 'Winner - Best Strength Club Delhi NCR 2024, CSCS Advisor'
      },
      trainers: [
        {
          name: 'Coach Aryan Singhania',
          role: 'Head Strength & Biomechanics Lead',
          experience: '10+ Years Experience',
          certifications: 'CSCS (Certified Strength & Conditioning Specialist), ACE Master Coach',
          specialty: 'Powerlifting, Deadlift Lockout & Heavy Hypertrophy',
          avatar: 'https://images.unsplash.com/photo-1549476464-37392f717541?w=300&auto=format&fit=crop&q=80'
        },
        {
          name: 'Coach Simran Oberoi',
          role: 'Senior Functional & Olympic Lifting Lead',
          experience: '8+ Years Experience',
          certifications: 'CrossFit L3 Certified, USAW Weightlifting Coach',
          specialty: 'MetCon, Fat Loss, Kettlebell Athletics & Female Transformation',
          avatar: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&auto=format&fit=crop&q=80'
        },
        {
          name: 'Coach Devender Rawat',
          role: 'Combat Striking & Boxing Specialist',
          experience: '11+ Years Experience',
          certifications: 'Former Delhi State Boxing Champion, AIBA 1-Star Coach',
          specialty: 'Fight Conditioning, Heavy Bag Combos & Explosive Stamina',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
        }
      ],
      slotCapacities: [
        { slot: '05:30 AM - 08:30 AM', label: 'Dawn Sunrise Pump', percent: 76, occupied: 46, total: 60, status: 'Moderate Rush', crowdLevel: 'moderate' },
        { slot: '08:30 AM - 11:30 AM', label: 'Morning High Peak', percent: 94, occupied: 56, total: 60, status: 'Peak Rush 🔥', crowdLevel: 'peak' },
        { slot: '11:30 AM - 04:30 PM', label: 'Afternoon Quiet Hours', percent: 32, occupied: 19, total: 60, status: 'Low Crowd 🟢 (Best for Quick Machines)', crowdLevel: 'low' },
        { slot: '04:30 PM - 08:30 PM', label: 'Prime Beast Evening', percent: 98, occupied: 59, total: 60, status: 'Full Capacity 🔥', crowdLevel: 'peak' },
        { slot: '08:30 PM - 11:30 PM', label: 'Night Owls & Cool Down', percent: 45, occupied: 27, total: 60, status: 'Moderate 🟢', crowdLevel: 'moderate' }
      ],
      priceList: {
        dailyPass: { price: 349, original: 500, label: '1-Day Walk-In Pass', perks: 'Full arena access + luxury shower & locker' },
        monthly: { price: 2499, original: 3499, label: 'Monthly Silver', perks: 'Unlimited open gym, free locker & app tracking' },
        quarterly: { price: 6299, original: 8999, label: '3-Months Gold Pro', perks: 'Includes 1 InBody scan + group boxing classes' },
        halfYearly: { price: 10999, original: 15999, label: '6-Months Transformation', perks: 'Free custom diet chart + 2 PT starter sessions' },
        annual: { price: 17999, original: 27999, label: '12-Months Titan VIP', perks: 'Sauna + Cold plunge + 2 monthly guest passes + 20% store discount' },
        couplePlan: { price: 29999, original: 45000, label: '1-Year Duo / Couple', perks: 'VIP access for 2 members across all Delhi NCR clubs' },
        personalTraining: { price: 3500, label: 'Personal Coach Add-on', perks: '12 dedicated 1-on-1 private sessions/month' }
      },
      amenities: ['Eleiko Olympic Platforms', 'Hammer Strength Iso-Lateral', 'Cold Plunge & Cryo-Spa', 'Infrared Detox Sauna', 'Combat Boxing Ring', 'Valet Parking', 'Protein Shake Bar & Lounge'],
      memberLevels: { beginner: 1470, intermediate: 1890, advanced: 840 }
    },

    {
      id: 'titan-faridabad-sec15',
      name: 'Titan Forge Ultra Coliseum — Faridabad Sector 15',
      state: 'Haryana',
      district: 'Faridabad',
      isHighlighted: true,
      badge: '🔥 FARIDABAD MEGA ARENA',
      address: 'SCO 88-91, HUDA Commercial Complex, Sector 15 Main Market, Faridabad, Haryana 121007',
      landmark: 'Opposite Crown Plaza & Near Sector 15 Community Centre',
      rating: 4.9,
      reviews: 1620,
      phone: '+91 98188 55312',
      whatsapp: '919818855312',
      openHours: '05:30 AM - 11:30 PM (Mon - Sun)',
      image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&auto=format&fit=crop&q=80',
      owner: {
        name: 'Mr. Rakesh Singh Choudhary',
        title: 'Managing Director & Co-Owner (Faridabad Arena)',
        experience: '15+ Years Experience in Strength Athletics & Facility Operations',
        bio: 'Haryana powerlifting icon and fitness entrepreneur with 15+ years transforming the gym landscape in Faridabad. Passionate about athlete mentoring and world-class equipment.',
        phone: '+91 98188 55312',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
        awards: 'Former Haryana Strongman Gold Medalist, Fitness Pioneer Award 2023'
      },
      trainers: [
        {
          name: 'Coach Jaideep Bhati',
          role: 'Head Powerlifting & Muscle Hypertrophy',
          experience: '9+ Years Experience',
          certifications: 'K11 Academy Gold Certified, StrongFirst Kettlebell Specialist',
          specialty: 'Raw Deadlift & Squat Form Rectification, Mass Gaining Splits',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
        },
        {
          name: 'Coach Pooja Deshmukh',
          role: 'CrossFit & Functional Conditioning Lead',
          experience: '7+ Years Experience',
          certifications: 'CrossFit Level 2 Trainer, Reebok Master Coach',
          specialty: 'High-Octane WODs, Agility, Core Shred & Endurance',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80'
        },
        {
          name: 'Coach Mohit Tanwar',
          role: 'MMA, Kickboxing & Combat Fitness Coach',
          experience: '10+ Years Experience',
          certifications: 'WAKO National Kickboxing Medalist, CSCS Trainer',
          specialty: 'Explosive Striking, Pad Work, High Stamina & Core Torque',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80'
        }
      ],
      slotCapacities: [
        { slot: '05:30 AM - 08:30 AM', label: 'Sunrise Heavy Iron', percent: 70, occupied: 42, total: 60, status: 'Moderate Rush', crowdLevel: 'moderate' },
        { slot: '08:30 AM - 11:30 AM', label: 'Morning High Surge', percent: 90, occupied: 54, total: 60, status: 'Peak Rush 🔥', crowdLevel: 'peak' },
        { slot: '11:30 AM - 04:30 PM', label: 'Midday Quiet Hours', percent: 28, occupied: 17, total: 60, status: 'Low Crowd 🟢 (Spacious & Clean)', crowdLevel: 'low' },
        { slot: '04:30 PM - 08:30 PM', label: 'Evening Prime Heavy Rush', percent: 96, occupied: 58, total: 60, status: 'Heavy Rush 🔥', crowdLevel: 'peak' },
        { slot: '08:30 PM - 11:30 PM', label: 'Night Power Sessions', percent: 40, occupied: 24, total: 60, status: 'Moderate 🟢', crowdLevel: 'moderate' }
      ],
      priceList: {
        dailyPass: { price: 299, original: 450, label: '1-Day Walk-In Pass', perks: 'Open gym floor, lockers & shower facilities' },
        monthly: { price: 2199, original: 2999, label: 'Monthly Silver', perks: 'Full gym access, certified floor guidance & mobile app' },
        quarterly: { price: 5499, original: 7999, label: '3-Months Gold Pro', perks: 'Free diet chart + unlimited functional classes' },
        halfYearly: { price: 9499, original: 13999, label: '6-Months Transformation', perks: 'InBody scans + 2 free guest passes / month' },
        annual: { price: 15499, original: 24999, label: '12-Months Titan VIP', perks: 'Sauna + Steam + Boxing Ring + 15% supplement discount' },
        couplePlan: { price: 25999, original: 40000, label: '1-Year Duo / Couple', perks: 'Full dual access for friends/couples in Faridabad' },
        personalTraining: { price: 3000, label: 'Personal Coach Add-on', perks: '12 personal 1-on-1 sessions with senior trainer' }
      },
      amenities: ['12,000 sq.ft Colossal Floor Area', 'Heavy Dumbbells up to 75kg', 'CrossFit Rig & Turf Zone', 'Steam & Sauna Suites', 'Smoothie & Juice Bar', 'Private Ample Parking'],
      memberLevels: { beginner: 1440, intermediate: 1440, advanced: 720 }
    },

    {
      id: 'titan-faridabad-greenfield',
      name: 'Titan Forge Spartan Hub — Faridabad Green Field',
      state: 'Haryana',
      district: 'Faridabad',
      isHighlighted: true,
      badge: '🔥 FARIDABAD SPARTAN HUB',
      address: 'Block C, Main Commercial Belt, Green Field Colony, Near Surajkund, Faridabad, Haryana 121010',
      landmark: 'Near NHPC Chowk Metro & Surajkund Roundabout',
      rating: 4.8,
      reviews: 1290,
      phone: '+91 98188 66418',
      whatsapp: '919818866418',
      openHours: '05:30 AM - 11:30 PM (Mon - Sun)',
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
      owner: {
        name: 'Mr. Amitav Rawal',
        title: 'Franchise Partner & Sports Director',
        experience: '13+ Years Experience in CrossFit Coaching & Sports Management',
        bio: 'Former state track & field champion dedicated to making elite functional fitness, calisthenics, and barbell training accessible to Faridabad athletes.',
        phone: '+91 98188 66418',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
        awards: 'CrossFit Regional Head Coach 2022'
      },
      trainers: [
        {
          name: 'Coach Kunal Khatri',
          role: 'Functional Conditioning & Calisthenics Lead',
          experience: '8+ Years Experience',
          certifications: 'ISSA Master Trainer, Calisthenics Movement Specialist',
          specialty: 'Bodyweight Mastery, Ring Work & Explosive Core Strength',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80'
        },
        {
          name: 'Coach Neha Kashyap',
          role: 'Hypertrophy & Posture Specialist',
          experience: '7+ Years Experience',
          certifications: 'ACE Certified Personal Trainer, FMS Level 1',
          specialty: 'Glute Hypertrophy, Mobility, Core Stability & Posture',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80'
        }
      ],
      slotCapacities: [
        { slot: '05:30 AM - 08:30 AM', label: 'Morning Spartan Circuit', percent: 65, occupied: 39, total: 60, status: 'Moderate', crowdLevel: 'moderate' },
        { slot: '08:30 AM - 11:30 AM', label: 'Late Morning Blast', percent: 85, occupied: 51, total: 60, status: 'High Rush', crowdLevel: 'peak' },
        { slot: '11:30 AM - 04:30 PM', label: 'Midday Zen & Lifting', percent: 25, occupied: 15, total: 60, status: 'Low Crowd 🟢 (Smooth Machines)', crowdLevel: 'low' },
        { slot: '04:30 PM - 08:30 PM', label: 'Evening Prime WOD', percent: 92, occupied: 55, total: 60, status: 'Peak Rush 🔥', crowdLevel: 'peak' },
        { slot: '08:30 PM - 11:30 PM', label: 'Night Warriors', percent: 38, occupied: 23, total: 60, status: 'Low/Moderate 🟢', crowdLevel: 'low' }
      ],
      priceList: {
        dailyPass: { price: 299, original: 400, label: '1-Day Walk-In Pass', perks: 'Free locker, shower & open gym floor' },
        monthly: { price: 1999, original: 2800, label: 'Monthly Silver', perks: 'Full cardio & strength arena access' },
        quarterly: { price: 4999, original: 7200, label: '3-Months Gold Pro', perks: 'Free assessment + 1 InBody body composition scan' },
        halfYearly: { price: 8999, original: 13000, label: '6-Months Transformation', perks: 'Includes free functional group classes' },
        annual: { price: 14499, original: 22000, label: '12-Months Titan VIP', perks: 'Full access + locker reserve + 2 guest passes/month' },
        couplePlan: { price: 24499, original: 38000, label: '1-Year Duo / Couple', perks: 'Year-round couple membership for Faridabad lifters' },
        personalTraining: { price: 2800, label: 'Personal Coach Add-on', perks: '12 customized 1-on-1 sessions' }
      },
      amenities: ['Olympic Lifting Turf', 'Assault Bikes & Rowers', 'Infrared Sauna', 'Steam Room', 'Free Shaker & Towel Rental'],
      memberLevels: { beginner: 1260, intermediate: 1120, advanced: 420 }
    },

    {
      id: 'titan-delhi-central-cp',
      name: 'Titan Forge Powerhouse — Central Delhi (Connaught Place)',
      state: 'Delhi NCR',
      district: 'Central Delhi',
      isHighlighted: true,
      badge: '⭐ CENTRAL DELHI METRO HUB',
      address: 'Block E, Inner Circle, Connaught Place, New Delhi 110001',
      landmark: 'Near Rajiv Chowk Metro Gate 5 & Marina Hotel',
      rating: 4.9,
      reviews: 2150,
      phone: '+91 98110 33910',
      whatsapp: '919811033910',
      openHours: '05:30 AM - 11:30 PM (Mon - Sun)',
      image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
      owner: {
        name: 'Mr. Vikramaditya Sharma & Dr. Sameer Batra',
        title: 'Co-Founders & Sports Medicine Advisors',
        experience: '16+ Years Experience in Sports Science & Fitness',
        bio: 'Central Delhi premier executive fitness hub catering to corporate athletes, lawyers, and elite lifters with cutting-edge recovery suites and Olympic platforms.',
        phone: '+91 98110 33910',
        avatar: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=300&auto=format&fit=crop&q=80',
        awards: 'National Fitness Excellence Award 2023'
      },
      trainers: [
        {
          name: 'Coach Rohit Saxena',
          role: 'Executive Conditioning & Strength Coach',
          experience: '10+ Years Experience',
          certifications: 'CSCS, ACSM CPT, Kettlebell Specialist',
          specialty: 'Posture Correction, Rapid Fat Loss & Hypertrophy for Busy Pros',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
        },
        {
          name: 'Coach Ananya Sen',
          role: 'Functional Movement & Mobility Lead',
          experience: '8+ Years Experience',
          certifications: 'FMS Level 2, Certified Pilates & Strength Coach',
          specialty: 'Spine Longevity, Fascia Release, Core Rigidity',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80'
        }
      ],
      slotCapacities: [
        { slot: '05:30 AM - 08:30 AM', label: 'Dawn Executive Workout', percent: 80, occupied: 48, total: 60, status: 'Busy', crowdLevel: 'moderate' },
        { slot: '08:30 AM - 11:30 AM', label: 'Office Rush Hours', percent: 95, occupied: 57, total: 60, status: 'Peak 🔥', crowdLevel: 'peak' },
        { slot: '11:30 AM - 04:30 PM', label: 'Lunch Express & Quiet Lifters', percent: 35, occupied: 21, total: 60, status: 'Low Crowd 🟢', crowdLevel: 'low' },
        { slot: '04:30 PM - 08:30 PM', label: 'Post-Work Beast Surge', percent: 96, occupied: 58, total: 60, status: 'Peak Rush 🔥', crowdLevel: 'peak' },
        { slot: '08:30 PM - 11:30 PM', label: 'Night Power Sessions', percent: 44, occupied: 26, total: 60, status: 'Moderate 🟢', crowdLevel: 'moderate' }
      ],
      priceList: {
        dailyPass: { price: 399, original: 600, label: '1-Day Walk-In Pass', perks: 'CP Executive pass + locker & shower' },
        monthly: { price: 2599, original: 3800, label: 'Monthly Silver', perks: 'Full CP Arena access + app tracking' },
        quarterly: { price: 6599, original: 9500, label: '3-Months Gold Pro', perks: 'Includes free functional sessions + 1 InBody scan' },
        halfYearly: { price: 11499, original: 16500, label: '6-Months Transformation', perks: 'Free nutrition consultation + 2 guest passes' },
        annual: { price: 18999, original: 29000, label: '12-Months Titan VIP', perks: '24/7 keycard + Steam + Cryo + 20% discount' },
        couplePlan: { price: 31999, original: 48000, label: '1-Year Duo / Couple', perks: 'Dual all-access membership for CP hub' },
        personalTraining: { price: 3800, label: 'Personal Coach Add-on', perks: '12 personalized sessions with senior coach' }
      },
      amenities: ['Biometric 24/7 Access', 'Cryo Chamber & Sauna', 'Express Laundry & Lockers', 'Executive Co-working Lounge', 'Protein Bar'],
      memberLevels: { beginner: 1200, intermediate: 2160, advanced: 1440 }
    },

    {
      id: 'titan-delhi-west-rajouri',
      name: 'Titan Forge Heavy Iron — West Delhi (Rajouri Garden)',
      state: 'Delhi NCR',
      district: 'West Delhi',
      isHighlighted: true,
      badge: '⭐ WEST DELHI POWERHOUSE',
      address: 'Main Ring Road, Near Metro Pillar 384, Rajouri Garden, New Delhi 110027',
      landmark: 'Next to TDI Mall & Rajouri Garden Metro',
      rating: 4.9,
      reviews: 1410,
      phone: '+91 98110 55890',
      whatsapp: '919811055890',
      openHours: '05:30 AM - 11:30 PM (Mon - Sun)',
      image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&auto=format&fit=crop&q=80',
      owner: {
        name: 'Mr. Harpreet Singh Sethi',
        title: 'Co-Founder & Powerlifting Coach',
        experience: '14+ Years Experience in Bodybuilding & Strength Sports',
        bio: 'Passionate powerlifter and strength mentor with 14+ years coaching North India’s top heavy barbell athletes and natural bodybuilders.',
        phone: '+91 98110 55890',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        awards: 'Delhi Strongest Lifter Award 2021'
      },
      trainers: [
        {
          name: 'Coach Gurpreet Chawla',
          role: 'Senior Hypertrophy Coach',
          experience: '9+ Years Experience',
          certifications: 'K11 Master Trainer, ISSA Nutritionist',
          specialty: 'Bodybuilding Prep, Barbell Squats & Form Coaching',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80'
        }
      ],
      slotCapacities: [
        { slot: '05:30 AM - 08:30 AM', label: 'Dawn Heavy Iron', percent: 74, occupied: 44, total: 60, status: 'Moderate', crowdLevel: 'moderate' },
        { slot: '08:30 AM - 11:30 AM', label: 'Morning High Surge', percent: 91, occupied: 55, total: 60, status: 'Peak Rush 🔥', crowdLevel: 'peak' },
        { slot: '11:30 AM - 04:30 PM', label: 'Midday Clean Focus', percent: 29, occupied: 17, total: 60, status: 'Low Crowd 🟢', crowdLevel: 'low' },
        { slot: '04:30 PM - 08:30 PM', label: 'Evening Beast Mode', percent: 97, occupied: 58, total: 60, status: 'Full 🔥', crowdLevel: 'peak' },
        { slot: '08:30 PM - 11:30 PM', label: 'Late Night Pump', percent: 41, occupied: 25, total: 60, status: 'Moderate 🟢', crowdLevel: 'moderate' }
      ],
      priceList: {
        dailyPass: { price: 320, original: 500, label: '1-Day Walk-In Pass', perks: 'Full floor & locker pass' },
        monthly: { price: 2299, original: 3200, label: 'Monthly Silver', perks: 'Unlimited open gym + mobile app' },
        quarterly: { price: 5799, original: 8500, label: '3-Months Gold Pro', perks: 'Free diet consultation + group classes' },
        halfYearly: { price: 10299, original: 15000, label: '6-Months Transformation', perks: 'Includes free InBody composition analysis' },
        annual: { price: 16499, original: 25000, label: '12-Months Titan VIP', perks: 'Full VIP privileges + Sauna + 2 guest passes' },
        couplePlan: { price: 27999, original: 42000, label: '1-Year Duo / Couple', perks: 'Dual pass for West Delhi club' },
        personalTraining: { price: 3200, label: 'Personal Coach Add-on', perks: '12 1-on-1 private training sessions' }
      },
      amenities: ['Heavy Barbell Platforms', 'Squat Racks & Benches', 'Steam & Sauna', 'Cafe & Supplements', 'Valet Parking'],
      memberLevels: { beginner: 990, intermediate: 1650, advanced: 660 }
    },

    {
      id: 'titan-haryana-gurgaon-cybercity',
      name: 'Titan Forge Cyber Athletic Hub — Gurgaon DLF Phase 3',
      state: 'Haryana',
      district: 'Gurgaon',
      isHighlighted: false,
      badge: 'GURGAON TECH & PERFORMANCE HUB',
      address: 'DLF CyberCity, Building 10 Tower B Retail concourse, Gurgaon, Haryana 122002',
      landmark: 'Near CyberHub & Rapid Metro',
      rating: 4.9,
      reviews: 1520,
      phone: '+91 98124 99100',
      whatsapp: '919812499100',
      openHours: '05:30 AM - 11:30 PM (Mon - Sun)',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
      owner: {
        name: 'Mr. Aditya Singhal',
        title: 'Managing Director (Gurgaon Cluster)',
        experience: '12+ Years Experience in Corporate Athletics & Sports Management',
        bio: 'Ex-corporate director turned fitness visionary, bringing world-class high-performance coaching to Gurgaon leaders.',
        phone: '+91 98124 99100',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
        awards: 'Haryana Corporate Wellness Award 2023'
      },
      trainers: [
        {
          name: 'Coach Siddharth Rao',
          role: 'Senior S&C Coach',
          experience: '8+ Years Experience',
          certifications: 'CSCS, EXOS Specialist',
          specialty: 'Athletic Conditioning & Hypertrophy',
          avatar: 'https://images.unsplash.com/photo-1549476464-37392f717541?w=300&auto=format&fit=crop&q=80'
        }
      ],
      slotCapacities: [
        { slot: '05:30 AM - 08:30 AM', label: 'Early Executive Run', percent: 72, occupied: 43, total: 60, status: 'Moderate', crowdLevel: 'moderate' },
        { slot: '08:30 AM - 11:30 AM', label: 'Morning High Peak', percent: 93, occupied: 56, total: 60, status: 'Peak Rush 🔥', crowdLevel: 'peak' },
        { slot: '11:30 AM - 04:30 PM', label: 'Lunch Break Lifters', percent: 34, occupied: 20, total: 60, status: 'Low Crowd 🟢', crowdLevel: 'low' },
        { slot: '04:30 PM - 08:30 PM', label: 'Post-Work Prime Rush', percent: 97, occupied: 58, total: 60, status: 'Heavy Rush 🔥', crowdLevel: 'peak' },
        { slot: '08:30 PM - 11:30 PM', label: 'Night Tech Owls', percent: 43, occupied: 26, total: 60, status: 'Moderate 🟢', crowdLevel: 'moderate' }
      ],
      priceList: {
        dailyPass: { price: 399, original: 600, label: '1-Day Walk-In Pass', perks: 'Full access + steam & sauna' },
        monthly: { price: 2699, original: 3800, label: 'Monthly Silver', perks: 'Unlimited open floor & locker' },
        quarterly: { price: 6899, original: 9900, label: '3-Months Gold Pro', perks: 'Free InBody scan + group classes' },
        halfYearly: { price: 11999, original: 17000, label: '6-Months Transformation', perks: 'Diet blueprint + 2 guest passes' },
        annual: { price: 19499, original: 30000, label: '12-Months Titan VIP', perks: 'Full VIP privileges + Cryo + Sauna' },
        couplePlan: { price: 32999, original: 50000, label: '1-Year Duo / Couple', perks: 'Dual access for Gurgaon center' },
        personalTraining: { price: 3900, label: 'Personal Coach Add-on', perks: '12 sessions with master coach' }
      },
      amenities: ['Cryo Recovery Pods', 'Infrared Sauna', 'Olympic Platforms', 'Shower & Valet'],
      memberLevels: { beginner: 1170, intermediate: 1950, advanced: 780 }
    },

    {
      id: 'titan-up-noida-sec62',
      name: 'Titan Forge Iron Sanctum — Noida Sector 62',
      state: 'Uttar Pradesh',
      district: 'Noida',
      isHighlighted: false,
      badge: 'NOIDA METRO ARENA',
      address: 'C-Block, Electronic City Commercial Hub, Sector 62, Noida, UP 201309',
      landmark: 'Near Noida Electronic City Metro Station',
      rating: 4.8,
      reviews: 1180,
      phone: '+91 98120 77112',
      whatsapp: '919812077112',
      openHours: '05:30 AM - 11:30 PM (Mon - Sun)',
      image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&auto=format&fit=crop&q=80',
      owner: {
        name: 'Mr. Pradeep Tyagi',
        title: 'Director & Regional Head (UP NCR)',
        experience: '12+ Years Experience in Sports Training & Gym Operations',
        bio: 'Former state athlete and certified fitness trainer bringing state-of-the-art gym equipment to Noida.',
        phone: '+91 98120 77112',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        awards: 'UP Fitness Leadership Award'
      },
      trainers: [
        {
          name: 'Coach Rahul Kashyap',
          role: 'Senior Strength Coach',
          experience: '8+ Years Experience',
          certifications: 'ACE Certified, Kettlebell Coach',
          specialty: 'Powerlifting & Functional Training',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80'
        }
      ],
      slotCapacities: [
        { slot: '05:30 AM - 08:30 AM', label: 'Morning Warriors', percent: 68, occupied: 41, total: 60, status: 'Moderate', crowdLevel: 'moderate' },
        { slot: '08:30 AM - 11:30 AM', label: 'Morning Peak', percent: 88, occupied: 53, total: 60, status: 'High Rush', crowdLevel: 'peak' },
        { slot: '11:30 AM - 04:30 PM', label: 'Quiet Hours', percent: 27, occupied: 16, total: 60, status: 'Low Crowd 🟢', crowdLevel: 'low' },
        { slot: '04:30 PM - 08:30 PM', label: 'Evening Peak Rush', percent: 94, occupied: 56, total: 60, status: 'Peak Rush 🔥', crowdLevel: 'peak' },
        { slot: '08:30 PM - 11:30 PM', label: 'Late Night Lifters', percent: 36, occupied: 22, total: 60, status: 'Moderate 🟢', crowdLevel: 'low' }
      ],
      priceList: {
        dailyPass: { price: 280, original: 400, label: '1-Day Walk-In Pass', perks: 'Floor access + locker' },
        monthly: { price: 1999, original: 2800, label: 'Monthly Silver', perks: 'Unlimited gym floor access' },
        quarterly: { price: 4999, original: 7200, label: '3-Months Gold Pro', perks: 'Free assessment + classes' },
        halfYearly: { price: 8999, original: 13000, label: '6-Months Transformation', perks: 'Diet plan included' },
        annual: { price: 14499, original: 22000, label: '12-Months Titan VIP', perks: 'All VIP amenities + sauna' },
        couplePlan: { price: 23999, original: 36000, label: '1-Year Duo / Couple', perks: 'Dual membership' },
        personalTraining: { price: 2800, label: 'Personal Coach Add-on', perks: '12 sessions' }
      },
      amenities: ['CrossFit Rig', 'Heavy Dumbbells', 'Sauna', 'Locker & Shower'],
      memberLevels: { beginner: 1350, intermediate: 1200, advanced: 450 }
    },

    {
      id: 'titan-mumbai-bandra',
      name: 'Titan Forge Coastal Sanctuary — Mumbai Bandra West',
      state: 'Maharashtra',
      district: 'Mumbai Suburban',
      isHighlighted: false,
      badge: 'MUMBAI PRO SANCTUARY',
      address: 'Hill Road, Near Bandra Police Station, Bandra West, Mumbai, Maharashtra 400050',
      landmark: 'Near Linking Road & Bandstand',
      rating: 4.9,
      reviews: 1940,
      phone: '+91 98200 44810',
      whatsapp: '919820044810',
      openHours: '05:30 AM - 11:30 PM (Mon - Sun)',
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
      owner: {
        name: 'Mr. Farhan Merchant',
        title: 'Director & Celebrity Fitness Coach',
        experience: '15+ Years Experience in Celebrity Coaching & Hypertrophy',
        bio: 'Trained Bollywood stars and athletes, known for bespoke transformation, fascia recovery, and elite gym aesthetics.',
        phone: '+91 98200 44810',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        awards: 'Maharashtra Best Celebrity Club 2023'
      },
      trainers: [
        {
          name: 'Coach Tanya Fernandez',
          role: 'Lead Pilates & Functional Coach',
          experience: '8+ Years Experience',
          certifications: 'STOTT Pilates, ACSM CPT',
          specialty: 'Core Sculpting & Mobility',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80'
        }
      ],
      slotCapacities: [
        { slot: '05:30 AM - 08:30 AM', label: 'Morning High Energy', percent: 78, occupied: 47, total: 60, status: 'Busy', crowdLevel: 'moderate' },
        { slot: '08:30 AM - 11:30 AM', label: 'Prime Rush', percent: 96, occupied: 58, total: 60, status: 'Peak 🔥', crowdLevel: 'peak' },
        { slot: '11:30 AM - 04:30 PM', label: 'Afternoon Zen', percent: 36, occupied: 22, total: 60, status: 'Low Crowd 🟢', crowdLevel: 'low' },
        { slot: '04:30 PM - 08:30 PM', label: 'Evening Peak', percent: 95, occupied: 57, total: 60, status: 'Peak 🔥', crowdLevel: 'peak' },
        { slot: '08:30 PM - 11:30 PM', label: 'Night Owls', percent: 45, occupied: 27, total: 60, status: 'Moderate 🟢', crowdLevel: 'moderate' }
      ],
      priceList: {
        dailyPass: { price: 449, original: 700, label: '1-Day Walk-In Pass', perks: 'Full Bandra sanctuary access' },
        monthly: { price: 2999, original: 4200, label: 'Monthly Silver', perks: 'Unlimited open gym' },
        quarterly: { price: 7499, original: 11000, label: '3-Months Gold Pro', perks: 'Classes + InBody scan' },
        halfYearly: { price: 12999, original: 18500, label: '6-Months Transformation', perks: 'Diet & trainer guidance' },
        annual: { price: 21999, original: 34000, label: '12-Months Titan VIP', perks: 'All VIP perks + Cryo' },
        couplePlan: { price: 36999, original: 55000, label: '1-Year Duo / Couple', perks: 'Dual Mumbai pass' },
        personalTraining: { price: 4500, label: 'Personal Coach Add-on', perks: '12 sessions' }
      },
      amenities: ['Cryo Recovery', 'Infrared Sauna', 'Valet Parking', 'Protein Bar'],
      memberLevels: { beginner: 1025, intermediate: 2050, advanced: 1025 }
    }
  ],

  competitions: [
    { id: 'delhi-ncr-classic', state: 'Delhi NCR', city: 'New Delhi', name: 'Delhi NCR Physique Classic', type: 'Bodybuilding', date: '18 Oct 2026', venue: 'Talkatora Indoor Stadium', federation: 'Open federation listing', categories: 'Men\'s Physique, Classic Physique, Women\'s Fitness', registrationUrl: '#lead-section', badge: 'Featured' },
    { id: 'haryana-strength-open', state: 'Haryana', city: 'Faridabad', name: 'Haryana Strength Open', type: 'Powerlifting', date: '25 Oct 2026', venue: 'Sector 12 Sports Complex', federation: 'State-level open meet', categories: 'Squat, Bench Press, Deadlift', registrationUrl: '#lead-section', badge: 'State Open' },
    { id: 'maharashtra-muscle-cup', state: 'Maharashtra', city: 'Mumbai', name: 'Maharashtra Muscle Cup', type: 'Bodybuilding', date: '08 Nov 2026', venue: 'NESCO Centre, Goregaon', federation: 'Open federation listing', categories: 'Junior, Senior, Masters', registrationUrl: '#lead-section', badge: 'Popular' },
    { id: 'karnataka-fitness-fest', state: 'Karnataka', city: 'Bengaluru', name: 'Karnataka Fitness Fest', type: 'Fitness', date: '15 Nov 2026', venue: 'KTPO Convention Centre', federation: 'Fitness expo listing', categories: 'Transformation, Model Physique, Fitness', registrationUrl: '#lead-section', badge: 'New' },
    { id: 'telangana-power-classic', state: 'Telangana', city: 'Hyderabad', name: 'Telangana Power Classic', type: 'Powerlifting', date: '22 Nov 2026', venue: 'GMC Balayogi Stadium', federation: 'State-level open meet', categories: 'Raw and equipped divisions', registrationUrl: '#lead-section', badge: 'Open Meet' },
    { id: 'west-bengal-bodybuilding', state: 'West Bengal', city: 'Kolkata', name: 'East India Bodybuilding Championship', type: 'Bodybuilding', date: '29 Nov 2026', venue: 'Science City Auditorium', federation: 'Regional championship listing', categories: 'Men\'s Bodybuilding, Classic Physique', registrationUrl: '#lead-section', badge: 'Regional' },
    { id: 'kerala-physique-show', state: 'Kerala', city: 'Kochi', name: 'Kerala Physique & Fitness Show', type: 'Fitness', date: '06 Dec 2026', venue: 'Jawaharlal Nehru Stadium', federation: 'Open federation listing', categories: 'Women\'s Fitness, Men\'s Physique', registrationUrl: '#lead-section', badge: 'Open Show' },
    { id: 'rajasthan-strength-league', state: 'Rajasthan', city: 'Jaipur', name: 'Rajasthan Strength League', type: 'Powerlifting', date: '13 Dec 2026', venue: 'Sawai Mansingh Indoor Hall', federation: 'State-level open meet', categories: 'Teen, Junior, Open, Masters', registrationUrl: '#lead-section', badge: 'State Open' },
    { id: 'punjab-power-showdown', state: 'Punjab', city: 'Ludhiana', name: 'Punjab Power Showdown', type: 'Powerlifting', date: '20 Dec 2026', venue: 'Guru Nanak Stadium Hall', federation: 'State-level open meet', categories: 'Raw powerlifting, Junior, Masters', registrationUrl: '#lead-section', badge: 'New Listing' },
    { id: 'gujarat-fitness-arena', state: 'Gujarat', city: 'Ahmedabad', name: 'Gujarat Fitness Arena', type: 'Fitness', date: '10 Jan 2027', venue: 'Sardar Patel Sports Enclave', federation: 'Fitness expo listing', categories: 'Athletic Physique, Transformation, Model', registrationUrl: '#lead-section', badge: 'New Listing' },
    { id: 'tamil-nadu-classic', state: 'Tamil Nadu', city: 'Chennai', name: 'Tamil Nadu Classic Physique Meet', type: 'Bodybuilding', date: '17 Jan 2027', venue: 'YMCA Nandanam Indoor Arena', federation: 'Regional championship listing', categories: 'Classic Physique, Men\'s Physique, Junior', registrationUrl: '#lead-section', badge: 'Regional' },
    { id: 'andhra-strength-cup', state: 'Andhra Pradesh', city: 'Visakhapatnam', name: 'Andhra Strength Cup', type: 'Powerlifting', date: '24 Jan 2027', venue: 'Port Indoor Stadium', federation: 'State-level open meet', categories: 'Squat, Bench Press, Deadlift, Team', registrationUrl: '#lead-section', badge: 'State Open' },
    { id: 'odisha-bodybuilding-open', state: 'Odisha', city: 'Bhubaneswar', name: 'Odisha Bodybuilding Open', type: 'Bodybuilding', date: '31 Jan 2027', venue: 'Kalinga Stadium Complex', federation: 'Open federation listing', categories: 'Men\'s Bodybuilding, Classic, Masters', registrationUrl: '#lead-section', badge: 'Open Show' },
    { id: 'madhya-pradesh-fit-games', state: 'Madhya Pradesh', city: 'Indore', name: 'MP Fit Games', type: 'Fitness', date: '07 Feb 2027', venue: 'AB Road Convention Grounds', federation: 'Fitness expo listing', categories: 'Functional Fitness, Endurance, Team Relay', registrationUrl: '#lead-section', badge: 'Popular' },
    { id: 'uttar-pradesh-strength-circuit', state: 'Uttar Pradesh', city: 'Noida', name: 'UP Strength Circuit', type: 'Powerlifting', date: '14 Feb 2027', venue: 'Noida Indoor Sports Hall', federation: 'NCR open meet listing', categories: 'Raw, Equipped, Teen, Open', registrationUrl: '#lead-section', badge: 'NCR Open' },
    { id: 'goa-beach-physique', state: 'Goa', city: 'Panaji', name: 'Goa Beach Physique Festival', type: 'Fitness', date: '21 Feb 2027', venue: 'Campal Sports Ground', federation: 'Open federation listing', categories: 'Beach Body, Fitness Model, Couples', registrationUrl: '#lead-section', badge: 'Featured' },
    { id: 'assam-north-east-classic', state: 'Assam', city: 'Guwahati', name: 'North East Classic Championship', type: 'Bodybuilding', date: '28 Feb 2027', venue: 'Sarjusai Stadium Indoor Hall', federation: 'Regional championship listing', categories: 'Men\'s Physique, Classic, Women\'s Fitness', registrationUrl: '#lead-section', badge: 'Regional' },
    { id: 'bihar-strength-meet', state: 'Bihar', city: 'Patna', name: 'Bihar Strength Meet', type: 'Powerlifting', date: '07 Mar 2027', venue: 'Pataliputra Sports Complex', federation: 'State-level open meet', categories: 'Junior, Open, Masters, Team', registrationUrl: '#lead-section', badge: 'State Open' }
  ]
};

// Explicitly bind to global window object
window.GYM_DATA = GYM_DATA;

// Initialize persisted products if available
try {
  const persisted = loadPersistedProducts();
  if (Array.isArray(persisted) && persisted.length > 0) {
    window.GYM_DATA.products = persisted;
  }
} catch (e) {
  console.warn('Persisted products init error:', e);
}

