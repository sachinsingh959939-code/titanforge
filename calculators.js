/**
 * TITAN FORGE CALCULATORS MODULE
 * - Interactive Body Mass Index (BMI) with visual meter gauge
 * - Daily Calorie & Macro Nutrient Target Calculator (Mifflin-St Jeor TDEE formula)
 */

function initCalculators() {
  // Tab Switching
  const tabs = document.querySelectorAll('.calc-tab');
  const contents = document.querySelectorAll('.calc-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.getAttribute('data-target');
      const targetContent = document.getElementById(target);
      if (targetContent) targetContent.classList.add('active');
    });
  });

  // BMI Unit Toggle
  const unitSelect = document.getElementById('bmi-unit');
  const metricFields = document.getElementById('bmi-metric-fields');
  const imperialFields = document.getElementById('bmi-imperial-fields');

  if (unitSelect) {
    unitSelect.addEventListener('change', (e) => {
      if (e.target.value === 'imperial') {
        metricFields.style.display = 'none';
        imperialFields.style.display = 'grid';
      } else {
        metricFields.style.display = 'grid';
        imperialFields.style.display = 'none';
      }
    });
  }

  // BMI Calculation
  const bmiForm = document.getElementById('bmi-form');
  if (bmiForm) {
    bmiForm.addEventListener('submit', (e) => {
      e.preventDefault();
      calculateBMI();
    });
  }

  // Calorie & Macro Calculation
  const macroForm = document.getElementById('macro-form');
  if (macroForm) {
    macroForm.addEventListener('submit', (e) => {
      e.preventDefault();
      calculateMacros();
    });
  }
}

function calculateBMI() {
  const unit = document.getElementById('bmi-unit').value;
  let heightMeters = 0;
  let weightKg = 0;

  if (unit === 'metric') {
    const heightCm = parseFloat(document.getElementById('bmi-height-cm').value);
    weightKg = parseFloat(document.getElementById('bmi-weight-kg').value);

    if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
      if (window.showToast) window.showToast('Please enter valid height and weight values', 'error');
      return;
    }
    heightMeters = heightCm / 100;
  } else {
    const heightFt = parseFloat(document.getElementById('bmi-height-ft').value) || 0;
    const heightIn = parseFloat(document.getElementById('bmi-height-in').value) || 0;
    const weightLbs = parseFloat(document.getElementById('bmi-weight-lbs').value);

    if ((!heightFt && !heightIn) || !weightLbs || weightLbs <= 0) {
      if (window.showToast) window.showToast('Please enter valid imperial values', 'error');
      return;
    }
    const totalInches = (heightFt * 12) + heightIn;
    heightMeters = totalInches * 0.0254;
    weightKg = weightLbs * 0.453592;
  }

  const bmi = weightKg / (heightMeters * heightMeters);
  const roundedBMI = bmi.toFixed(1);

  let category = '';
  let color = '#4ade80';
  let percentage = 50;

  if (bmi < 18.5) {
    category = 'Underweight';
    color = '#38bdf8';
    percentage = Math.max(5, (bmi / 18.5) * 20);
  } else if (bmi < 25) {
    category = 'Optimal & Healthy';
    color = '#4ade80';
    percentage = 20 + ((bmi - 18.5) / 6.5) * 35;
  } else if (bmi < 30) {
    category = 'Overweight';
    color = '#facc15';
    percentage = 55 + ((bmi - 25) / 5) * 25;
  } else {
    category = 'Obese';
    color = '#f87171';
    percentage = Math.min(95, 80 + ((bmi - 30) / 10) * 20);
  }

  // Calculate healthy weight range for this height
  const minHealthyKg = (18.5 * heightMeters * heightMeters).toFixed(1);
  const maxHealthyKg = (24.9 * heightMeters * heightMeters).toFixed(1);

  // Update UI
  const resultBox = document.getElementById('bmi-result-box');
  const bmiValEl = document.getElementById('bmi-val');
  const bmiCategoryEl = document.getElementById('bmi-category');
  const bmiPointer = document.getElementById('bmi-pointer');
  const bmiRangeEl = document.getElementById('bmi-healthy-range');

  if (resultBox) resultBox.style.display = 'block';
  if (bmiValEl) bmiValEl.textContent = roundedBMI;
  if (bmiCategoryEl) {
    bmiCategoryEl.textContent = category;
    bmiCategoryEl.style.color = color;
  }
  if (bmiPointer) {
    bmiPointer.style.left = `${Math.min(96, Math.max(4, percentage))}%`;
  }
  if (bmiRangeEl) {
    bmiRangeEl.textContent = `Your ideal weight range: ${minHealthyKg} kg - ${maxHealthyKg} kg`;
  }

  if (window.showToast) {
    window.showToast(`BMI calculated: ${roundedBMI} (${category})`, 'success');
  }
}

function calculateMacros() {
  const gender = document.getElementById('macro-gender').value;
  const age = parseInt(document.getElementById('macro-age').value);
  const weight = parseFloat(document.getElementById('macro-weight').value);
  const height = parseFloat(document.getElementById('macro-height').value);
  const activity = parseFloat(document.getElementById('macro-activity').value);
  const goal = document.getElementById('macro-goal').value;

  if (!age || !weight || !height) {
    if (window.showToast) window.showToast('Please fill out all macro calculator fields', 'error');
    return;
  }

  // Mifflin - St Jeor formula
  let bmr = 0;
  if (gender === 'male') {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }

  let tdee = bmr * activity;
  let targetCalories = tdee;

  if (goal === 'cut') {
    targetCalories = tdee - 500; // Caloric deficit
  } else if (goal === 'lean-gain') {
    targetCalories = tdee + 300; // Lean surplus
  } else if (goal === 'heavy-bulk') {
    targetCalories = tdee + 600; // Hypertrophy surplus
  }

  targetCalories = Math.round(targetCalories);

  // Protein: 2.2g per kg bodyweight
  const proteinGrams = Math.round(weight * 2.2);
  const proteinCals = proteinGrams * 4;

  // Fat: 0.9g per kg bodyweight
  const fatGrams = Math.round(weight * 0.9);
  const fatCals = fatGrams * 9;

  // Carbs: Remaining calories
  let carbCals = targetCalories - (proteinCals + fatCals);
  if (carbCals < 0) carbCals = 0;
  const carbGrams = Math.round(carbCals / 4);

  // Update DOM
  const resultBox = document.getElementById('macro-result-box');
  if (resultBox) resultBox.style.display = 'block';

  document.getElementById('target-cals-val').textContent = `${targetCalories} kcal`;
  document.getElementById('target-bmr-val').textContent = `Basal Metabolic Rate: ${Math.round(bmr)} kcal`;

  document.getElementById('macro-protein-val').textContent = `${proteinGrams}g`;
  document.getElementById('macro-carbs-val').textContent = `${carbGrams}g`;
  document.getElementById('macro-fats-val').textContent = `${fatGrams}g`;

  if (window.showToast) {
    window.showToast(`Custom Nutrition Target: ${targetCalories} kcal calculated!`, 'success');
  }
}

document.addEventListener('DOMContentLoaded', initCalculators);
