(function(){
  "use strict";

  const TOTAL_STEPS = 8; // 0-indexed 0..7
  let currentStep = 0;

  const coverPage     = document.getElementById('coverPage');
  const appShell      = document.getElementById('appShell');
  const coverStartBtn = document.getElementById('coverStartBtn');

  const form          = document.getElementById('discoveryForm');
  const steps         = Array.from(document.querySelectorAll('.step'));
  const railSteps     = Array.from(document.querySelectorAll('.rail-step'));
  const progressFill  = document.getElementById('progressFill');
  const prevBtn        = document.getElementById('prevBtn');
  const nextBtn        = document.getElementById('nextBtn');
  const navStepCount   = document.getElementById('navStepCount');
  const mobileStepLabel= document.getElementById('mobileStepLabel');
  const navBar         = document.getElementById('navBar');
  const reviewList      = document.getElementById('reviewList');
  const successOverlay = document.getElementById('successOverlay');
  const successRef     = document.getElementById('successRef');
  const restartBtn     = document.getElementById('restartBtn');
  const startBtn       = document.querySelector('[data-action="start"]');

  // Fields required on each step (by field id)
  const requiredByStep = {
    1: ['businessName','contactPerson','position','email','phone','industry','employees','businessDescription'],
    2: ['repetitiveTasks'],
    3: [],
    4: ['biggestChallenges'],
    5: [],
    6: ['businessGoals'],
  };

  // Field metadata for the review step
  const reviewFields = [
    { id: 'businessName',          label: 'Business Name',            step: 1 },
    { id: 'contactPerson',         label: 'Contact Person',           step: 1 },
    { id: 'position',              label: 'Position',                 step: 1 },
    { id: 'email',                 label: 'Email',                    step: 1 },
    { id: 'phone',                 label: 'Phone Number',             step: 1 },
    { id: 'industry',              label: 'Industry',                 step: 1 },
    { id: 'employees',             label: 'Number of Employees',      step: 1 },
    { id: 'businessDescription',   label: 'Business Description',     step: 1 },
    { id: 'repetitiveTasks',       label: 'Repetitive Tasks',         step: 2 },
    { id: 'currentSoftware',       label: 'Current Software',         step: 3 },
    { id: 'biggestChallenges',     label: 'Biggest Challenges',       step: 4 },
    { id: 'automationOpportunity', label: 'Automation Opportunity',   step: 5 },
    { id: 'businessGoals',         label: 'Business Goals',           step: 6 },
  ];

  function getField(id){ return document.getElementById(id); }

  function validateStep(stepIndex){
    const ids = requiredByStep[stepIndex];
    if (!ids) return true;

    let allValid = true;

    ids.forEach(id => {
      const input = getField(id);
      const fieldWrap = input.closest('.field');
      let valid = input.value.trim().length > 0;

      if (valid && input.type === 'email'){
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      }
      if (valid && input.type === 'tel'){
        valid = /^[0-9+\-\s()]{7,}$/.test(input.value.trim());
      }

      if (!valid){
        fieldWrap.classList.add('invalid');
        allValid = false;
      } else {
        fieldWrap.classList.remove('invalid');
      }
    });

    if (!allValid){
      const firstInvalid = document.querySelector('.step.active .field.invalid');
      if (firstInvalid){
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    return allValid;
  }

  // Clear error state as the user types/selects
  document.querySelectorAll('.field input, .field select, .field textarea').forEach(el => {
    el.addEventListener('input', () => el.closest('.field').classList.remove('invalid'));
    el.addEventListener('change', () => el.closest('.field').classList.remove('invalid'));
  });

  function updateProgress(){
    const pct = ((currentStep) / (TOTAL_STEPS - 1)) * 100;
    progressFill.style.width = Math.max(pct, 4) + '%';

    navStepCount.textContent = `Step ${currentStep + 1} of ${TOTAL_STEPS}`;
    mobileStepLabel.textContent = `Step ${currentStep + 1} of ${TOTAL_STEPS}`;

    railSteps.forEach(li => {
      const idx = Number(li.dataset.step);
      li.classList.remove('is-active', 'is-complete');
      if (idx === currentStep) li.classList.add('is-active');
      else if (idx < currentStep) li.classList.add('is-complete');
    });
  }

  function showStep(index){
    steps.forEach(s => s.classList.remove('active'));
    const target = steps.find(s => Number(s.dataset.step) === index);
    if (target) target.classList.add('active');

    prevBtn.disabled = index === 0;
    navBar.style.display = index === 0 ? 'none' : 'flex';
    nextBtn.textContent = '';
    if (index === TOTAL_STEPS - 1){
      nextBtn.innerHTML = 'Submit Discovery <span class="arrow">→</span>';
    } else {
      nextBtn.innerHTML = 'Next <span class="arrow">→</span>';
    }

    if (index === TOTAL_STEPS - 1){
      buildReview();
    }

    updateProgress();
  }

  function goNext(){
    if (currentStep > 0 && !validateStep(currentStep)) return;

    if (currentStep === TOTAL_STEPS - 1){
      submitForm();
      return;
    }
    currentStep++;
    showStep(currentStep);
  }

  function goPrev(){
    if (currentStep === 0) return;
    currentStep--;
    showStep(currentStep);
  }

  function buildReview(){
    reviewList.innerHTML = '';
    reviewFields.forEach(f => {
      const input = getField(f.id);
      const value = input.value.trim();

      const item = document.createElement('div');
      item.className = 'review-item';

      const main = document.createElement('div');
      main.className = 'review-item-main';

      const label = document.createElement('span');
      label.className = 'review-label';
      label.textContent = f.label;

      const val = document.createElement('span');
      val.className = 'review-value' + (value ? '' : ' empty');
      val.textContent = value ? value : 'Not provided';

      main.appendChild(label);
      main.appendChild(val);

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'review-edit';
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', () => {
        currentStep = f.step;
        showStep(currentStep);
      });

      item.appendChild(main);
      item.appendChild(editBtn);
      reviewList.appendChild(item);
    });
  }

  function generateRef(){
    const now = new Date();
    const y = now.getFullYear();
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `GIQ-${y}-${rand}`;
  }

  function submitForm(){
    // No backend connected yet — this is where a future API/database call would go.
    const ref = generateRef();
    successRef.textContent = `Reference: ${ref}`;
    successOverlay.classList.add('visible');
  }

  function resetForm(){
    form.reset();
    document.querySelectorAll('.field.invalid').forEach(f => f.classList.remove('invalid'));
    currentStep = 0;
    showStep(currentStep);
    successOverlay.classList.remove('visible');
  }

  function enterApp(){
    coverPage.classList.add('is-hidden');
    appShell.classList.remove('is-hidden');
  }

  coverStartBtn.addEventListener('click', enterApp);

  startBtn.addEventListener('click', goNext);
  nextBtn.addEventListener('click', goNext);
  prevBtn.addEventListener('click', goPrev);
  restartBtn.addEventListener('click', resetForm);

  form.addEventListener('submit', e => e.preventDefault());

  // Init
  showStep(currentStep);
})();
