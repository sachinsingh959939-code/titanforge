/* Dedicated Celebrity Diet Lab page */
(function () {
  const legacyPlans = (window.GYM_DATA && window.GYM_DATA.celebrityDiets) || [];
  const catalogPlans = window.CELEBRITY_DIET_CATALOG || [];
  const plans = [...legacyPlans, ...catalogPlans];
  const grid = document.getElementById('diet-plans-grid');
  const filters = document.getElementById('diet-filters');
  const search = document.getElementById('diet-search');
  const count = document.getElementById('diet-results-count');
  const modal = document.getElementById('diet-modal');
  const modalContent = document.getElementById('diet-modal-content');
  let activeCategory = 'All';

  const swapFoods = {
    whey: { names: ['whey', 'whey protein', 'protein powder'], label: 'Whey protein', alternate: 'Soya chunks + milk/curd', alternates: ['Soya chunks + milk/curd', 'Moong dal + curd bowl', 'Paneer bhurji with roti', 'Soy milk + roasted chana'], preference: 'vegetarian', originalCost: 95, alternateCost: 32, protein: '24g per serving', alternateProtein: '27g per serving', reason: 'Soya chunks deliver a high protein hit at a fraction of the cost. Add curd or milk if you need a smoother snack.', tip: 'Boil, squeeze and season 50g dry soya chunks; pair with 200g curd.', buyLinks: { blinkit: 'https://www.blinkit.com/search?query=whey%20protein', swiggy: 'https://www.swiggy.com/instamart/search?query=whey%20protein', instamart: 'https://www.swiggy.com/instamart/search?query=whey%20protein', bigbasket: 'https://www.bigbasket.com/ps/?q=whey%20protein', zepto: 'https://www.zepto.in/search?searchTerm=whey%20protein' } },
    salmon: { names: ['salmon', 'smoked salmon'], label: 'Salmon', alternate: 'Rohu or local lean fish', alternates: ['Rohu or local lean fish', 'Tuna steak or sardines', 'Tilapia + flax seeds', 'Eggs + rajma bowl'], preference: 'non-vegetarian', originalCost: 420, alternateCost: 125, protein: '20g per 100g', alternateProtein: '20-22g per 100g', reason: 'Local fresh fish gives a similar protein serving for much less. Add flax or walnuts for omega-3 support.', tip: 'Choose fresh local fish, grill with lemon and keep the oil measured.', buyLinks: { blinkit: 'https://www.blinkit.com/search?query=rohu%20fish', swiggy: 'https://www.swiggy.com/instamart/search?query=rohu%20fish', instamart: 'https://www.swiggy.com/instamart/search?query=rohu%20fish', bigbasket: 'https://www.bigbasket.com/ps/?q=fresh%20fish', zepto: 'https://www.zepto.in/search?searchTerm=fresh%20fish' } },
    avocado: { names: ['avocado', 'avocado toast'], label: 'Avocado', alternate: 'Peanuts + cucumber + mustard', alternates: ['Peanuts + cucumber + mustard', 'Mashed boiled chana + toast', 'Roasted peanut butter sandwich', 'Paneer salad with lemon'], preference: 'vegan', originalCost: 120, alternateCost: 28, protein: '2g per 100g', alternateProtein: '8g per 30g peanuts', reason: 'Peanuts bring more protein and healthy fats; cucumber and mustard recreate the creamy-crunchy toast experience.', tip: 'Make a peanut-mustard spread and serve on multigrain toast.', buyLinks: { blinkit: 'https://www.blinkit.com/search?query=peanuts', swiggy: 'https://www.swiggy.com/instamart/search?query=peanuts', instamart: 'https://www.swiggy.com/instamart/search?query=peanuts', bigbasket: 'https://www.bigbasket.com/ps/?q=peanuts', zepto: 'https://www.zepto.in/search?searchTerm=peanuts' } },
    greek: { names: ['greek yogurt', 'greek yoghurt', 'skyr'], label: 'Greek yogurt', alternate: 'Hung curd / homemade dahi', alternates: ['Hung curd / homemade dahi', 'Plain curd + chia seeds', 'Curd + roasted peanuts', 'Buttermilk + boiled chana'], preference: 'vegetarian', originalCost: 75, alternateCost: 25, protein: '10g per 100g', alternateProtein: '8-10g per 100g', reason: 'Hung curd has a similar thick texture and protein profile when you strain regular curd overnight.', tip: 'Strain plain curd in a clean cloth for 6-8 hours; avoid sugary flavoured cups.', buyLinks: { blinkit: 'https://www.blinkit.com/search?query=curd', swiggy: 'https://www.swiggy.com/instamart/search?query=curd', instamart: 'https://www.swiggy.com/instamart/search?query=curd', bigbasket: 'https://www.bigbasket.com/ps/?q=curd', zepto: 'https://www.zepto.in/search?searchTerm=curd' } },
    almond: { names: ['almond butter', 'almond', 'almonds'], label: 'Almond butter', alternate: 'Roasted peanut butter', alternates: ['Roasted peanut butter', 'Ground peanut chutney', 'Sunflower seed butter', 'Cashew butter + chia'], preference: 'vegan', originalCost: 55, alternateCost: 22, protein: '6g per 30g', alternateProtein: '7g per 30g', reason: 'Natural peanut butter is usually cheaper and has comparable protein and healthy fats.', tip: 'Pick unsweetened peanut butter or grind roasted peanuts at home.', buyLinks: { blinkit: 'https://www.blinkit.com/search?query=peanut%20butter', swiggy: 'https://www.swiggy.com/instamart/search?query=peanut%20butter', instamart: 'https://www.swiggy.com/instamart/search?query=peanut%20butter', bigbasket: 'https://www.bigbasket.com/ps/?q=peanut%20butter', zepto: 'https://www.zepto.in/search?searchTerm=peanut%20butter' } },
    quinoa: { names: ['quinoa'], label: 'Quinoa', alternate: 'Moong dal + brown rice', alternates: ['Moong dal + brown rice', 'Rajma + rice bowl', 'Soya chunks + jeera rice', 'Millet khichdi + curd'], preference: 'vegan', originalCost: 70, alternateCost: 22, protein: '4g per 100g cooked', alternateProtein: '6-7g per 100g cooked', reason: 'The dal-rice combination is a complete, affordable protein pairing with familiar Indian taste.', tip: 'Use a 1:1 dal-rice ratio and add vegetables for fibre.', buyLinks: { blinkit: 'https://www.blinkit.com/search?query=moong%20dal', swiggy: 'https://www.swiggy.com/instamart/search?query=moong%20dal', instamart: 'https://www.swiggy.com/instamart/search?query=moong%20dal', bigbasket: 'https://www.bigbasket.com/ps/?q=moong%20dal', zepto: 'https://www.zepto.in/search?searchTerm=moong%20dal' } },
    berries: { names: ['berries', 'blueberries', 'strawberries'], label: 'Imported berries', alternate: 'Guava or seasonal papaya', alternates: ['Guava or seasonal papaya', 'Apple + pomegranate', 'Orange + banana', 'Amla + berries substitute'], preference: 'vegan', originalCost: 110, alternateCost: 25, protein: '1g per serving', alternateProtein: '1-2g per serving', reason: 'Guava and papaya provide fibre and vitamin C without the imported-fruit price.', tip: 'Buy seasonal fruit locally and freeze chopped portions for smoothies.', buyLinks: { blinkit: 'https://www.blinkit.com/search?query=guava', swiggy: 'https://www.swiggy.com/instamart/search?query=guava', instamart: 'https://www.swiggy.com/instamart/search?query=guava', bigbasket: 'https://www.bigbasket.com/ps/?q=guava', zepto: 'https://www.zepto.in/search?searchTerm=guava' } },
    olive: { names: ['olive oil', 'extra virgin olive oil'], label: 'Extra virgin olive oil', alternate: 'Mustard oil or groundnut oil', alternates: ['Mustard oil or groundnut oil', 'Rice bran oil', 'Coconut oil for cooking', 'Ghee in small quantity'], preference: 'vegan', originalCost: 22, alternateCost: 9, protein: '0g', alternateProtein: '0g', reason: 'For everyday Indian cooking, measured mustard or groundnut oil is a practical lower-cost fat.', tip: 'Use a teaspoon measure; the quantity matters more than the trendy bottle.', buyLinks: { blinkit: 'https://www.blinkit.com/search?query=mustard%20oil', swiggy: 'https://www.swiggy.com/instamart/search?query=mustard%20oil', instamart: 'https://www.swiggy.com/instamart/search?query=mustard%20oil', bigbasket: 'https://www.bigbasket.com/ps/?q=mustard%20oil', zepto: 'https://www.zepto.in/search?searchTerm=mustard%20oil' } },
    chicken: { names: ['chicken breast', 'chicken'], label: 'Chicken breast', alternate: 'Eggs + soya chunks', alternates: ['Eggs + soya chunks', 'Chicken thigh + beans', 'Rajma + chicken curry mix', 'Cottage cheese + eggs'], preference: 'non-vegetarian', originalCost: 75, alternateCost: 38, protein: '31g per 100g', alternateProtein: '28-30g combined serving', reason: 'If chicken is costly, combine eggs with soya to keep protein high while reducing the plate cost.', tip: 'Use 3 eggs with 30g dry soya and add onions, tomato and spices.', buyLinks: { blinkit: 'https://www.blinkit.com/search?query=eggs', swiggy: 'https://www.swiggy.com/instamart/search?query=eggs', instamart: 'https://www.swiggy.com/instamart/search?query=eggs', bigbasket: 'https://www.bigbasket.com/ps/?q=eggs', zepto: 'https://www.zepto.in/search?searchTerm=eggs' } },
    paneer: { names: ['paneer', 'cottage cheese', 'indian cheese'], label: 'Paneer', alternate: 'Tofu + chana or curd', alternates: ['Tofu + chana or curd', 'Soya chunks + spinach', 'Boiled chana + curd salad', 'Besan cheela + curd'], preference: 'vegetarian', originalCost: 180, alternateCost: 58, protein: '18g per 100g', alternateProtein: '15-18g combined serving', reason: 'Tofu and chana give a similar satiety and protein profile while fitting a tighter daily budget.', tip: 'Pan-fry tofu cubes and toss with chana, onion and spices for a high-protein bowl.', buyLinks: { blinkit: 'https://www.blinkit.com/search?query=tofu', swiggy: 'https://www.swiggy.com/instamart/search?query=tofu', instamart: 'https://www.swiggy.com/instamart/search?query=tofu', bigbasket: 'https://www.bigbasket.com/ps/?q=tofu', zepto: 'https://www.zepto.in/search?searchTerm=tofu' } },
    eggs: { names: ['eggs', 'boiled eggs', 'egg whites'], label: 'Eggs', alternate: 'Moong dal + sprouts + 1 egg', alternates: ['Moong dal + sprouts + 1 egg', 'Besan chilla + curd', 'Soya chunks + tomato curry', 'Rajma + salad'], preference: 'non-vegetarian', originalCost: 70, alternateCost: 28, protein: '13g per 2 eggs', alternateProtein: '15-17g combined meal', reason: 'Sprouts and moong dal add fibre, protein and volume while keeping the meal cheap and filling.', tip: 'Cook moong with onion, tomato and chilli; add sprouts for crunch and extra nutrition.', buyLinks: { blinkit: 'https://www.blinkit.com/search?query=moong%20dal', swiggy: 'https://www.swiggy.com/instamart/search?query=moong%20dal', instamart: 'https://www.swiggy.com/instamart/search?query=moong%20dal', bigbasket: 'https://www.bigbasket.com/ps/?q=moong%20dal', zepto: 'https://www.zepto.in/search?searchTerm=moong%20dal' } },
    oats: { names: ['oats', 'rolled oats', 'instant oats'], label: 'Oats', alternate: 'Broken wheat + poha + nuts', alternates: ['Broken wheat + poha + nuts', 'Suji upma + peanut chaat', 'Daliya khichdi + curd', 'Poha + sprouts + sesame'], preference: 'vegan', originalCost: 65, alternateCost: 22, protein: '8g per 50g', alternateProtein: '9-10g per bowl', reason: 'Broken wheat and poha are much cheaper staples that still give slow-release carbs and a solid breakfast base.', tip: 'Cook broken wheat with milk or curd and top with peanuts for a fuller meal.', buyLinks: { blinkit: 'https://www.blinkit.com/search?query=broken%20wheat', swiggy: 'https://www.swiggy.com/instamart/search?query=broken%20wheat', instamart: 'https://www.swiggy.com/instamart/search?query=broken%20wheat', bigbasket: 'https://www.bigbasket.com/ps/?q=broken%20wheat', zepto: 'https://www.zepto.in/search?searchTerm=broken%20wheat' } },
    banana: { names: ['banana', 'bananas'], label: 'Banana', alternate: 'Seasonal local fruit + peanut chaat', alternates: ['Seasonal local fruit + peanut chaat', 'Apple + roasted chana', 'Papaya + peanut butter toast', 'Dates + almonds'], preference: 'vegan', originalCost: 48, alternateCost: 16, protein: '1g per fruit', alternateProtein: '6-8g with peanuts', reason: 'A banana is convenient, but a local fruit with peanuts gives more staying power and better value.', tip: 'Mix chopped seasonal fruit with roasted peanuts, lemon and chaat masala.', buyLinks: { blinkit: 'https://www.blinkit.com/search?query=peanuts', swiggy: 'https://www.swiggy.com/instamart/search?query=peanuts', instamart: 'https://www.swiggy.com/instamart/search?query=peanuts', bigbasket: 'https://www.bigbasket.com/ps/?q=peanuts', zepto: 'https://www.zepto.in/search?searchTerm=peanuts' } },
    tofu: { names: ['tofu'], label: 'Tofu', alternate: 'Soy chunks + chana + spinach', alternates: ['Soy chunks + chana + spinach', 'Soya kebab + salad', 'Rajma + sprouts bowl', 'Masala chana + tofu substitute'], preference: 'vegan', originalCost: 120, alternateCost: 33, protein: '12g per 100g', alternateProtein: '18-20g combined bowl', reason: 'Soy chunks and chana are one of the most cost-effective ways to create a high-protein vegetarian meal.', tip: 'Soak and cook soy chunks with spinach and garlic for a cheap protein bowl.', buyLinks: { blinkit: 'https://www.blinkit.com/search?query=soy%20chunks', swiggy: 'https://www.swiggy.com/instamart/search?query=soy%20chunks', instamart: 'https://www.swiggy.com/instamart/search?query=soy%20chunks', bigbasket: 'https://www.bigbasket.com/ps/?q=soy%20chunks', zepto: 'https://www.zepto.in/search?searchTerm=soy%20chunks' } },
    tuna: { names: ['tuna', 'canned tuna'], label: 'Tuna', alternate: 'Sprouted chana + fish curry', alternates: ['Sprouted chana + fish curry', 'Local sardines + rice', 'Mackerel + dal', 'Roasted chana + boiled eggs'], preference: 'non-vegetarian', originalCost: 160, alternateCost: 45, protein: '20g per can', alternateProtein: '18-20g meal', reason: 'Small local fish or sprouted chana brings protein and satiety without the premium canned-fish cost.', tip: 'Use local fish pieces in curry, or pair sprouted chana with onion and lemon.', buyLinks: { blinkit: 'https://www.blinkit.com/search?query=fish%20curry', swiggy: 'https://www.swiggy.com/instamart/search?query=fish%20curry', instamart: 'https://www.swiggy.com/instamart/search?query=fish%20curry', bigbasket: 'https://www.bigbasket.com/ps/?q=local%20fish', zepto: 'https://www.zepto.in/search?searchTerm=local%20fish' } },
    proteinbar: { names: ['protein bar', 'nutrition bar'], label: 'Protein bar', alternate: 'Roasted chana + dates + curd', alternates: ['Roasted chana + dates + curd', 'Peanut chaat + yogurt', 'Boiled chana + fruit bowl', 'Besan laddoo + milk'], preference: 'vegan', originalCost: 90, alternateCost: 24, protein: '10-15g per bar', alternateProtein: '12-14g combo', reason: 'Roasted chana and curd are much cheaper, more filling, and easier to carry for a busy day.', tip: 'Pack roasted chana with a couple of dates and a small cup of curd for a ready snack.', buyLinks: { blinkit: 'https://www.blinkit.com/search?query=roasted%20chana', swiggy: 'https://www.swiggy.com/instamart/search?query=roasted%20chana', instamart: 'https://www.swiggy.com/instamart/search?query=roasted%20chana', bigbasket: 'https://www.bigbasket.com/ps/?q=roasted%20chana', zepto: 'https://www.zepto.in/search?searchTerm=roasted%20chana' } }
  };

  const swapFoodList = document.getElementById('swap-food-list');
  if (swapFoodList) swapFoodList.innerHTML = Object.values(swapFoods).flatMap(food => food.names).map(name => `<option value="${safeText(name)}"></option>`).join('');

  const categories = ['All', ...new Set(plans.map(plan => plan.category))];
  document.getElementById('plan-count').textContent = plans.length;

  filters.innerHTML = categories.map(category => `<button type="button" class="diet-filter ${category === 'All' ? 'active' : ''}" data-category="${category}">${category}</button>`).join('');

  function safeText(value) {
    return String(value || '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]);
  }

  function findSwap(foodInput) {
    const input = foodInput.trim().toLowerCase();
    return Object.values(swapFoods).find(food => food.names.some(name => input.includes(name) || name.includes(input))) || null;
  }

  async function loadCelebrityImages() {
    const imageElements = [...grid.querySelectorAll('[data-celebrity-name]')];
    await Promise.all(imageElements.map(async image => {
      const name = image.dataset.celebrityName;
      try {
        const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name.replace(/ /g, '_'))}`);
        if (!response.ok) return;
        const article = await response.json();
        const thumbnail = article.thumbnail?.source || article.originalimage?.source;
        if (thumbnail) image.src = thumbnail;
      } catch (error) {
        // Keep the catalog fallback image when the public image service is unavailable.
      }
    }));
  }

  function renderBuyLinks(food) {
    const buyStores = [
      { key: 'blinkit', label: 'Blinkit', url: food.buyLinks?.blinkit },
      { key: 'swiggy', label: 'Swiggy', url: food.buyLinks?.swiggy },
      { key: 'instamart', label: 'Instamart', url: food.buyLinks?.instamart },
      { key: 'bigbasket', label: 'BigBasket', url: food.buyLinks?.bigbasket },
      { key: 'zepto', label: 'Zepto', url: food.buyLinks?.zepto }
    ];

    return `<div class="agent-buy-links"><span>Buy now:</span>${buyStores.filter(store => store.url).map(store => `<a class="agent-buy-link" href="${store.url}" target="_blank" rel="noopener noreferrer">${store.label}</a>`).join('')}</div>`;
  }

  const mealImages = {
    breakfast: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=420&auto=format&fit=crop&q=85',
    lunch: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=420&auto=format&fit=crop&q=85',
    snack: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=420&auto=format&fit=crop&q=85',
    dinner: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=420&auto=format&fit=crop&q=85',
    general: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=420&auto=format&fit=crop&q=85'
  };

  function getMealImage(meal, mealIndex) {
    const name = `${meal.name} ${meal.items.join(' ')}`.toLowerCase();
    if (/breakfast|power breakfast|oats|egg|chilla|bhurji/.test(name)) return mealImages.breakfast;
    if (/lunch|rice|roti|dal|performance|balanced/.test(name)) return mealImages.lunch;
    if (/snack|shake|smoothie|fuel|pre-workout|mid-morning|fruit/.test(name)) return mealImages.snack;
    if (/dinner|recovery|soup|stir-fry|repair/.test(name)) return mealImages.dinner;
    return mealImages.general;
  }

  function initFoodSwapAgent() {
    const form = document.getElementById('food-swap-form');
    const result = document.getElementById('food-swap-result');
    if (!form || !result) return;
    form.addEventListener('submit', event => {
      event.preventDefault();
      const foodInput = document.getElementById('swap-food-input').value;
      const food = findSwap(foodInput);
      if (!food) {
        result.innerHTML = '<div class="agent-result-empty agent-result-error"><span>!</span><h3>No match found for this food</h3><p>Try whey, salmon, avocado, Greek yogurt, almonds, quinoa, berries, olive oil or chicken.</p></div>';
        return;
      }
      const budget = document.getElementById('swap-budget').value;
      const preference = document.getElementById('swap-preference').value;
      const compatible = preference === 'any' || preference === food.preference || (preference === 'vegetarian' && food.preference === 'vegan');
      const budgetMultiplier = budget === 'student' ? 0.9 : budget === 'premium' ? 1.08 : 1;
      const saving = Math.round((food.originalCost - food.alternateCost) * budgetMultiplier);
      const alternatives = Array.isArray(food.alternates) && food.alternates.length ? food.alternates : [food.alternate];
      result.innerHTML = `<div class="agent-result-heading"><span class="agent-live-dot"></span><span>SMART MATCH READY</span></div><h3>${safeText(food.label)} → <span>${safeText(food.alternate)}</span></h3>${compatible ? '' : '<div class="agent-warning">This alternative does not fully match your selected preference. Try “Any option” or choose a compatible preference.</div>'}<div class="agent-comparison"><div><small>Original estimate</small><strong>₹${food.originalCost}</strong></div><div class="agent-arrow">→</div><div><small>Alternative estimate</small><strong>₹${food.alternateCost}</strong></div><div class="agent-saving"><small>Estimated saving</small><strong>₹${saving}</strong></div></div><p class="agent-reason">${safeText(food.reason)}</p><div class="agent-nutrition"><span><b>Original:</b> ${safeText(food.protein)}</span><span><b>Alternative:</b> ${safeText(food.alternateProtein)}</span></div><div class="agent-alternates"><b>Other cheap swaps:</b><ul>${alternatives.map(item => `<li>${safeText(item)}</li>`).join('')}</ul></div><div class="agent-tip"><b>Kitchen tip:</b> ${safeText(food.tip)}</div>${renderBuyLinks(food)}`;
    });
  }

  function renderPlans() {
    const query = search.value.trim().toLowerCase();
    const visiblePlans = plans.filter(plan => {
      const matchesCategory = activeCategory === 'All' || plan.category === activeCategory;
      const haystack = `${plan.name} ${plan.title} ${plan.tag} ${plan.tagline}`.toLowerCase();
      return matchesCategory && (!query || haystack.includes(query));
    });

    count.textContent = `${visiblePlans.length} plan${visiblePlans.length === 1 ? '' : 's'} available`;
    grid.innerHTML = visiblePlans.length ? visiblePlans.map(plan => `
      <article class="diet-plan-card">
        <button class="diet-plan-image" type="button" data-open-plan="${safeText(plan.id)}" aria-label="Open ${safeText(plan.name)} diet details"><img src="${safeText(plan.image)}" data-celebrity-name="${safeText(plan.name)}" alt="${safeText(plan.name)}" loading="lazy" onerror="this.onerror=null; this.src='${safeText(plan.image)}'"><span>${safeText(plan.tag)}</span></button>
        <div class="diet-plan-body">
          <div class="diet-plan-category">${safeText(plan.category)}</div>
          <h3>${safeText(plan.name)}</h3>
          <p class="diet-plan-title">${safeText(plan.title)}</p>
          <p class="diet-plan-tagline">${safeText(plan.tagline)}</p>
          <div class="diet-macro-row"><strong>🔥 ${safeText(plan.dailyCalories)}</strong><span>${safeText(plan.macros.protein)} protein</span><span>${safeText(plan.macros.carbs)} carbs</span></div>
          <button class="btn btn-primary btn-block" type="button" data-open-plan="${safeText(plan.id)}">Open full diet plan →</button>
        </div>
      </article>
    `).join('') : '<div class="diet-empty"><h3>No matching plans</h3><p>Try another name, goal or category.</p></div>';
    if (visiblePlans.length) loadCelebrityImages();
  }

  const cookingModal = document.getElementById('cooking-video-modal');
  const cookingModalContent = document.getElementById('cooking-video-modal-content');

  function slugify(text) {
    return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function getMealTiming(mealName, mealIndex, mealTime) {
    const combined = `${mealName} ${mealTime}`.toLowerCase();
    if (mealIndex === 0 || /breakfast|morning|am|chilla|bhurji|oats|egg/.test(combined)) return 'breakfast';
    if (mealIndex === 1 || /mid-morning|shake|smoothie|fuel/.test(combined)) return 'mid-morning';
    if (mealIndex === 2 || /lunch|noon|pm|midday|rice|roti|chicken|dal/.test(combined)) return 'lunch';
    if (mealIndex === 3 || /snack|pre-workout|fruit|chana|tea/.test(combined)) return 'snack';
    if (mealIndex === 4 || /dinner|night|post-workout|soup|recovery|repair/.test(combined)) return 'dinner';
    return `meal${mealIndex + 1}`;
  }

  async function openCookingVideo(celebName, mealName, mealTime, mealIndex, mealItems) {
    if (!cookingModal || !cookingModalContent) return;
    const celebSlug = slugify(celebName);
    const mealSlug = slugify(mealName);
    const timing = getMealTiming(mealName, mealIndex, mealTime);
    const ytQuery = encodeURIComponent(`${celebName} ${mealName} ${mealItems || ''} cooking recipe preparation`);

    let localVideos = [];
    try {
      const res = await fetch('/api/cooking-videos');
      if (res.ok) {
        localVideos = await res.json();
      }
    } catch (e) {
      console.log('Local video list offline');
    }

    // Candidate file matches
    const candidateSuffixes = [
      `videos/cooking/${celebSlug}/${mealSlug}.mp4`,
      `videos/cooking/${celebSlug}/${timing}.mp4`,
      `videos/cooking/${celebSlug}/meal${mealIndex + 1}.mp4`,
      `videos/cooking/${celebSlug}/${mealIndex + 1}.mp4`,
      `videos/cooking/${celebSlug}/morning.mp4`,
      `videos/cooking/${celebSlug}/afternoon.mp4`,
      `videos/cooking/${celebSlug}/evening.mp4`,
      `videos/cooking/${celebSlug}/night.mp4`,
      `videos/cooking/${celebSlug}_${timing}.mp4`,
      `videos/cooking/${celebSlug}_${mealSlug}.mp4`,
      `videos/cooking/${celebSlug}_meal${mealIndex + 1}.mp4`,
      `videos/cooking/${timing}.mp4`,
      `videos/cooking/${mealSlug}.mp4`
    ];

    let matchedVideo = null;
    
    // 1. Direct candidate matching
    for (const cand of candidateSuffixes) {
      const found = localVideos.find(v => v.video_url.toLowerCase() === cand.toLowerCase() || v.video_url.toLowerCase().endsWith(cand.toLowerCase()));
      if (found) {
        matchedVideo = found.video_url;
        break;
      }
    }

    // 2. Keyword & Subfolder matching inside celebrity's folder
    if (!matchedVideo) {
      const celebVideos = localVideos.filter(v => v.video_url.toLowerCase().includes(`/cooking/${celebSlug}/`) || v.video_url.toLowerCase().includes(`/cooking/${celebSlug}_`));
      
      const mealKeywords = {
        0: ['breakfast', 'morning', 'am', 'oats', 'egg', 'chilla', 'bhurji', 'meal1', '1'],
        1: ['mid-morning', 'shake', 'smoothie', 'curd', 'snack', 'coconut', 'meal2', '2'],
        2: ['lunch', 'afternoon', 'noon', 'rice', 'roti', 'dal', 'chicken', 'paneer', 'heavy', 'performance', 'meal3', '3'],
        3: ['snack', 'evening', 'pre-workout', 'chana', 'fruit', 'smart', 'plate', 'meal4', '4'],
        4: ['dinner', 'night', 'recovery', 'repair', 'soup', 'salad', 'stir-fry', 'early', 'meal5', '5']
      };

      const keywords = (mealKeywords[mealIndex] || [timing, mealSlug]).concat([timing, mealSlug]).filter(k => k && k.length >= 2);
      
      for (const cv of celebVideos) {
        const urlLower = cv.video_url.toLowerCase();
        if (keywords.some(kw => urlLower.includes(kw))) {
          matchedVideo = cv.video_url;
          break;
        }
      }

      // If only 1 video in celeb folder, use it as fallback
      if (!matchedVideo && celebVideos.length === 1) {
        matchedVideo = celebVideos[0].video_url;
      }
    }

    if (matchedVideo) {
      const safeVideoSrc = encodeURI(matchedVideo);
      // Local Saved Video Found -> Play it!
      cookingModalContent.innerHTML = `
        <div style="margin-bottom: 16px;">
          <span class="section-tag" style="background:var(--diet-lime); color:#080b0f; border-color:var(--diet-lime); font-weight:900;">▶ PLAYING SAVED LOCAL VIDEO</span>
          <h2 id="cooking-modal-title" style="color:#fff; font-size:1.65rem; margin:8px 0 4px;">${safeText(mealName)} Cooking Process</h2>
          <p style="color:var(--diet-lime); margin:0; font-size:0.92rem;">${safeText(celebName)} · ${safeText(mealTime)}</p>
        </div>
        <div style="background:#000; border-radius:6px; overflow:hidden; border:2px solid var(--diet-lime); box-shadow:0 0 30px rgba(212,255,0,0.22); margin-bottom:14px;">
          <video controls autoplay playsinline preload="auto" style="width:100%; max-height:480px; display:block;" src="${safeVideoSrc}">
            Your browser does not support the video tag.
          </video>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <span style="color:var(--text-muted); font-size:0.78rem;">Saved video file: <code>${safeText(matchedVideo)}</code></span>
          <button class="btn btn-secondary btn-sm" type="button" data-close-cooking-modal>Close Player</button>
        </div>
      `;
    } else {
      // No local video saved yet -> Show upload instructions + search
      const targetFolder = `videos/cooking/${celebSlug}/${timing}.mp4`;
      cookingModalContent.innerHTML = `
        <div style="margin-bottom: 16px;">
          <span class="section-tag" style="background:rgba(255,112,67,0.18); color:var(--diet-orange); border-color:var(--diet-orange);">🎬 COOKING PROCESS VIDEO</span>
          <h2 id="cooking-modal-title" style="color:#fff; font-size:1.65rem; margin:8px 0 4px;">${safeText(mealName)}</h2>
          <p style="color:var(--diet-lime); margin:0; font-size:0.92rem;">${safeText(celebName)} · ${safeText(mealTime)}</p>
        </div>
        <div style="background:rgba(0,0,0,0.45); border:1px dashed rgba(212,255,0,0.4); border-radius:8px; padding:28px 20px; text-align:center; margin-bottom:14px;">
          <div style="font-size:2.8rem; margin-bottom:12px;">📁</div>
          <h3 style="color:#fff; font-size:1.25rem; margin:0 0 10px;">Aapki Saved Video Yahan Save Karein</h3>
          <p style="color:var(--text-secondary); max-width:520px; margin:0 auto 16px; font-size:0.88rem; line-height:1.6;">
            Aap is meal ki video ko folder me daal dein, agli baar click karne par direct aapki video chalegi:<br>
            <code style="background:rgba(212,255,0,0.15); color:var(--diet-lime); padding:6px 12px; border-radius:4px; display:inline-block; margin-top:8px; font-size:0.85rem; font-weight:bold;">${targetFolder}</code>
          </p>
          <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap; margin-top:20px;">
            <a class="btn btn-primary btn-sm" href="https://www.youtube.com/results?search_query=${ytQuery}" target="_blank" rel="noopener noreferrer">▶ Search YouTube Recipe</a>
            <button class="btn btn-secondary btn-sm" type="button" data-close-cooking-modal>Close</button>
          </div>
        </div>
      `;
    }

    cookingModal.classList.add('active');
    cookingModal.setAttribute('aria-hidden', 'false');
  }

  function closeCookingModal() {
    if (!cookingModal) return;
    const video = cookingModal.querySelector('video');
    if (video) {
      video.pause();
      video.src = '';
    }
    cookingModal.classList.remove('active');
    cookingModal.setAttribute('aria-hidden', 'true');
  }

  function openPlan(id) {
    const plan = plans.find(item => item.id === id);
    if (!plan) return;
    modalContent.innerHTML = `
      <div class="diet-modal-heading"><div><span class="section-tag">${safeText(plan.tag)}</span><h2 id="diet-modal-title">${safeText(plan.name)}</h2><p>${safeText(plan.title)} · ${safeText(plan.bodyFat)}</p><a class="diet-video-link" href="${safeText(plan.youtube || `https://www.youtube.com/results?search_query=${encodeURIComponent(`${plan.name} diet workout nutrition`)}`)}" target="_blank" rel="noopener">▶ Watch diet & workout videos on YouTube</a></div><div class="diet-modal-stats"><strong>${safeText(plan.dailyCalories)}</strong><span>${safeText(plan.macros.protein)} protein · ${safeText(plan.macros.carbs)} carbs · ${safeText(plan.macros.fats)} fats</span></div></div>
      <h3 class="meal-heading">24-hour meal schedule</h3>
      <div class="diet-meal-list">${plan.meals.map((meal, mealIndex) => { 
        const image = getMealImage(meal, mealIndex); 
        return `
          <div class="diet-meal">
            <div>
              <span>${safeText(meal.time)}</span>
              <div class="diet-meal-title-row">
                <h4>${safeText(meal.name)}</h4>
                <button class="meal-process-btn" type="button" data-open-cooking-modal data-celeb-name="${safeText(plan.name)}" data-meal-name="${safeText(meal.name)}" data-meal-time="${safeText(meal.time)}" data-meal-index="${mealIndex}" data-meal-items="${safeText(meal.items.join(', '))}">▶ Cooking Process</button>
              </div>
            </div>
            <strong>${safeText(meal.calories)}</strong>
            <img class="meal-food-image" src="${image}" alt="${safeText(meal.name)} food" loading="lazy" onerror="this.onerror=null; this.src='${mealImages.general}'">
            <ul>${meal.items.map(item => `<li>${safeText(item)}</li>`).join('')}</ul>
          </div>
        `; 
      }).join('')}</div>
      <div class="diet-sourcing-grid"><section><span>🎓 Student / hostel route</span><strong>${safeText(plan.collegeHack.dailyBudget)}</strong><ul>${plan.collegeHack.whereToBuy.map(item => `<li>${safeText(item)}</li>`).join('')}</ul><p>${safeText(plan.collegeHack.hostelPrep)}</p></section><section><span>💼 Working professional route</span><strong>${safeText(plan.corporateHack.dailyBudget)}</strong><ul>${plan.corporateHack.whereToBuy.map(item => `<li>${safeText(item)}</li>`).join('')}</ul><p>${safeText(plan.corporateHack.hostelPrep)}</p></section></div>
      <button class="btn btn-secondary btn-block" type="button" data-close-diet-modal>Close plan</button>
    `;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  function closePlan() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  filters.addEventListener('click', event => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    activeCategory = button.dataset.category;
    filters.querySelectorAll('.diet-filter').forEach(item => item.classList.toggle('active', item === button));
    renderPlans();
  });
  search.addEventListener('input', renderPlans);
  document.getElementById('clear-diet-filter').addEventListener('click', () => { activeCategory = 'All'; search.value = ''; filters.querySelectorAll('.diet-filter').forEach(item => item.classList.toggle('active', item.dataset.category === 'All')); renderPlans(); });
  grid.addEventListener('click', event => { const button = event.target.closest('[data-open-plan]'); if (button) openPlan(button.dataset.openPlan); });
  
  modal.addEventListener('click', event => { 
    if (event.target.closest('[data-close-diet-modal]')) closePlan(); 
    const cookingBtn = event.target.closest('[data-open-cooking-modal]');
    if (cookingBtn) {
      openCookingVideo(
        cookingBtn.dataset.celebName,
        cookingBtn.dataset.mealName,
        cookingBtn.dataset.mealTime,
        parseInt(cookingBtn.dataset.mealIndex, 10),
        cookingBtn.dataset.mealItems
      );
    }
  });

  if (cookingModal) {
    cookingModal.addEventListener('click', event => {
      if (event.target.closest('[data-close-cooking-modal]')) closeCookingModal();
    });
  }

  document.addEventListener('keydown', event => { 
    if (event.key === 'Escape') {
      if (cookingModal && cookingModal.classList.contains('active')) {
        closeCookingModal();
      } else {
        closePlan(); 
      }
    }
  });

  initFoodSwapAgent();
  renderPlans();
}());
