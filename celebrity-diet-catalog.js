/* Celebrity Diet Lab catalog: educational, celebrity-inspired examples. */
(function () {
  const actors = [
    'Shah Rukh Khan', 'Aamir Khan', 'Salman Khan', 'Akshay Kumar', 'Ajay Devgn',
    'Ranbir Kapoor', 'Ranveer Singh', 'Varun Dhawan', 'Tiger Shroff', 'Shahid Kapoor',
    'Vicky Kaushal', 'Rajkummar Rao', 'Ayushmann Khurrana', 'Kartik Aaryan', 'Sidharth Malhotra',
    'Aditya Roy Kapur', 'Arjun Kapoor', 'John Abraham', 'Hrithik Roshan', 'Saif Ali Khan',
    'Allu Arjun', 'Prabhas', 'Ram Charan', 'Jr NTR', 'Mahesh Babu',
    'Vijay Deverakonda', 'Yash', 'Dulquer Salmaan', 'Suriya', 'Vijay',
    'Dhanush', 'Rajinikanth', 'Kamal Haasan', 'Sivakarthikeyan', 'Nani',
    'Chris Hemsworth', 'Dwayne Johnson', 'Henry Cavill', 'Chris Evans', 'Ryan Reynolds',
    'Michael B Jordan', 'Jason Momoa', 'Zac Efron', 'Tom Hardy', 'Hugh Jackman',
    'Mark Wahlberg', 'Will Smith', 'Arnold Schwarzenegger', 'Sylvester Stallone', 'Daniel Craig'
  ];

  const actresses = [
    'Deepika Padukone', 'Alia Bhatt', 'Priyanka Chopra Jonas', 'Kareena Kapoor Khan', 'Katrina Kaif',
    'Anushka Sharma', 'Taapsee Pannu', 'Disha Patani', 'Sara Ali Khan', 'Janhvi Kapoor',
    'Kiara Advani', 'Kriti Sanon', 'Shraddha Kapoor', 'Rashmika Mandanna', 'Samantha Ruth Prabhu',
    'Nayanthara', 'Tamannaah Bhatia', 'Anushka Shetty', 'Nithya Menen', 'Sai Pallavi',
    'Madhuri Dixit', 'Shilpa Shetty', 'Bipasha Basu', 'Sushmita Sen', 'Kangana Ranaut',
    'Mrunal Thakur', 'Bhumi Pednekar', 'Yami Gautam', 'Rakul Preet Singh', 'Sonakshi Sinha',
    'Gal Gadot', 'Scarlett Johansson', 'Jennifer Aniston', 'Angelina Jolie', 'Zendaya',
    'Margot Robbie', 'Natalie Portman', 'Anne Hathaway', 'Jessica Alba', 'Halle Berry',
    'Jennifer Lopez', 'Gwyneth Paltrow', 'Mila Kunis', 'Emily Blunt', 'Charlize Theron',
    'Brie Larson', 'Florence Pugh', 'Keira Knightley', 'Emma Stone', 'Priyanka Chopra'
  ];

  const photoPool = [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&auto=format&fit=crop&q=82',
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=900&auto=format&fit=crop&q=82',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=900&auto=format&fit=crop&q=82',
    'https://images.unsplash.com/photo-1549476464-37392f717541?w=900&auto=format&fit=crop&q=82',
    'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=900&auto=format&fit=crop&q=82',
    'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=900&auto=format&fit=crop&q=82'
  ];

  const styles = [
    { goal: 'Athletic lean', style: 'High-protein Indian performance', calories: 2350, protein: 155, carbs: 260, fats: 65, badge: 'Athletic performance' },
    { goal: 'Muscle gain', style: 'Clean hypertrophy fuel', calories: 2950, protein: 190, carbs: 340, fats: 78, badge: 'Lean muscle gain' },
    { goal: 'Fat loss', style: 'High-satiety calorie control', calories: 1850, protein: 145, carbs: 180, fats: 58, badge: 'Fat-loss focused' },
    { goal: 'Vegetarian strength', style: 'Plant-forward Indian protein', calories: 2500, protein: 150, carbs: 300, fats: 70, badge: 'Vegetarian strength' },
    { goal: 'Screen-ready conditioning', style: 'Balanced recovery nutrition', calories: 2100, protein: 140, carbs: 225, fats: 62, badge: 'Conditioning & recovery' }
  ];

  const mealSets = [
    [
      ['07:00 AM', 'Protein breakfast', ['Oats with whey or Greek yogurt', 'Seasonal fruit and 8 almonds'], '420 kcal'],
      ['10:30 AM', 'Mid-morning fuel', ['Coconut water', 'Paneer cubes or two boiled eggs'], '220 kcal'],
      ['01:30 PM', 'Performance lunch', ['Brown rice or 2 multigrain rotis', 'Dal, grilled protein and a large salad'], '650 kcal'],
      ['05:30 PM', 'Training snack', ['Banana with roasted chana', 'Black coffee or green tea'], '260 kcal'],
      ['08:30 PM', 'Recovery dinner', ['Grilled protein or tofu', 'Vegetable soup and sauteed greens'], '520 kcal']
    ],
    [
      ['07:30 AM', 'Power breakfast', ['Four egg whites and two whole eggs or tofu bhurji', 'Oats with banana and peanut butter'], '560 kcal'],
      ['11:00 AM', 'Mass shake', ['Milk or soy milk with whey', 'Oats, banana and cinnamon'], '420 kcal'],
      ['02:00 PM', 'Heavy lunch', ['Rice or chapati', 'Chicken, fish, paneer or soya', 'Curd and seasonal vegetables'], '820 kcal'],
      ['05:30 PM', 'Pre-workout plate', ['Sweet potato or poha', 'Fruit and salted lemon water'], '360 kcal'],
      ['09:00 PM', 'Muscle repair dinner', ['Lean protein with dal', 'Vegetable stir-fry and one roti'], '610 kcal']
    ],
    [
      ['07:00 AM', 'Light start', ['Warm water and fruit', 'Moong chilla or egg-white scramble'], '300 kcal'],
      ['11:00 AM', 'Satiety snack', ['Greek yogurt or unsweetened soy yogurt', 'Cucumber and roasted seeds'], '180 kcal'],
      ['01:30 PM', 'Balanced lunch', ['One cup dal', 'One roti or quinoa', 'Two cups vegetables and salad'], '510 kcal'],
      ['05:00 PM', 'Smart snack', ['Apple with 1 tsp peanut butter', 'Green tea'], '180 kcal'],
      ['08:00 PM', 'Early dinner', ['Grilled tofu, fish or chicken', 'Clear soup and steamed vegetables'], '430 kcal']
    ]
  ];

  function slugify(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function createPlan(name, type, index) {
    const profile = styles[index % styles.length];
    const mealSet = mealSets[index % mealSets.length];
    const slug = slugify(name);
    const category = type === 'Actor' ? 'Actors' : 'Actresses';
    return {
      id: `celebrity-${slug}-${type.toLowerCase()}`,
      name,
      profileType: type,
      title: `${profile.goal} plan inspired by ${name}`,
      category,
      tag: profile.badge,
      bodyFat: 'Adjust with a qualified coach',
      dailyCalories: `${profile.calories} kcal`,
      macros: { protein: `${profile.protein}g`, carbs: `${profile.carbs}g`, fats: `${profile.fats}g` },
      image: photoPool[index % photoPool.length],
      tagline: `${profile.style} built as an educational starting point for training, recovery and consistent eating.`,
      youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${name} diet workout nutrition interview`)}`,
      meals: mealSet.map(meal => ({ time: meal[0], name: meal[1], items: meal[2], calories: meal[3] })),
      collegeHack: {
        dailyBudget: '₹180 - ₹300 / day',
        whereToBuy: ['Buy dal, rice, oats and soya in bulk from a local market.', 'Use eggs, curd, roasted chana or soya as affordable protein.', 'Choose seasonal fruit and vegetables instead of imported produce.'],
        hostelPrep: 'Batch-cook rice, dal and soya twice a week. Keep fruit, roasted chana and curd ready for quick meals.'
      },
      corporateHack: {
        dailyBudget: '₹400 - ₹700 / day',
        whereToBuy: ['Order a double-protein bowl with dressing on the side.', 'Keep whey, fruit, nuts and roasted makhana in the office.', 'Use a meal-prep service when training days become busy.'],
        hostelPrep: 'Prepare three lunch boxes on Sunday with a grain, lean protein and two vegetables.'
      }
    };
  }

  const catalog = [...actors.map((name, index) => createPlan(name, 'Actor', index)), ...actresses.map((name, index) => createPlan(name, 'Actress', index))];
  window.CELEBRITY_DIET_CATALOG = catalog;
}());
