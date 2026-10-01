/**
 * TITAN AI VISION - ADVANCED REAL-TIME WORKOUT ECOSYSTEM
 * Features:
 * - 28+ Exercises with Biomechanical Angle Tracking & Green/Red Skeleton Lines
 * - Hands-Free Voice Commands (Web Speech Recognition)
 * - 15-Minute Smart AI Circuit Routine Mode (45s Work / 15s Rest Interval Timer)
 * - Holographic Ghost Silhouette Alignment Guide
 * - Gamification: Form Streaks, XP Levels & Confetti Celebrations
 * - Post-Workout AI Performance Report Card & Calorie Engine
 * - Looping How-To Dummy Demo Biomechanical Simulator
 */

(function () {
  // Application State
  const state = {
    cameraRunning: false,
    workoutMode: 'free', // 'free' or 'circuit'
    selectedCategory: 'all',
    selectedExercise: 'squats',
    repCount: 0,
    validReps: 0,
    currentStreak: 0,
    maxStreak: 0,
    currentStage: 'up', // 'up' or 'down' or 'hold'
    voiceEnabled: true,
    voiceCmdEnabled: true,
    ghostEnabled: true,
    audioBeepEnabled: true,
    sessionStartTime: null,
    totalFramesAnalyzed: 0,
    correctFrames: 0,
    formScore: 100,
    holdSeconds: 0,
    holdTimer: null,
    lastVoiceMsg: '',
    lastVoiceTime: 0,
    stream: null,

    // Circuit Mode State
    circuitActive: false,
    circuitStationIndex: 0,
    circuitStations: ['squats', 'pushups', 'glute-bridges', 'jumping-jacks'],
    circuitPhase: 'work', // 'work' or 'rest'
    circuitTimeRemaining: 45,
    circuitTimerInterval: null,

    // Demo Player State
    demoPlaying: true,
    demoSpeed: 1.0
  };

  // DOM Elements
  let videoEl, canvasEl, ctx;
  let ghostCanvasEl, ghostCtx;
  let confettiCanvasEl, confettiCtx;
  let demoCanvasEl, demoCtx;

  let standbyOverlay, startCamBtn, stopCamBtn, resetRepsBtn, voiceToggleBtn;
  let voiceCmdToggleBtn, ghostToggleBtn, finishWorkoutBtn;
  let modeBtnFree, modeBtnCircuit;

  let repCountEl, validRepCountEl, formScoreEl, activeExerciseTitleEl;
  let feedbackBanner, feedbackIcon, feedbackMsg, feedbackSub, angleHud;
  let cameraStatusDot, cameraStatusText, stanceBadge, streakBadge;

  // Circuit Elements
  let circuitTimerStrip, circuitStationPill, circuitExerciseName, circuitPhaseLabel, circuitTimerDigits, circuitSkipBtn;

  // Demo Player Elements
  let demoPhaseText, demoTargetAngle, demoTargetMuscles, demoBreathingTempo, demoCueTip;
  let btnDemoTogglePlay, btnDemoToggleSpeed;

  // Report Modal Elements
  let reportModalOverlay, btnCloseReport, btnShareReport;
  let reportTotalReps, reportValidReps, reportAccuracyScore, reportCalories, reportDuration, reportTitanLevel, reportAiAssessment;

  // Comprehensive Exercise Database & Biomechanical Rules
  const EXERCISES = {
    // 🤸 WITHOUT EQUIPMENT / HOME BODYWEIGHT
    'squats': {
      title: 'Bodyweight Air Squats',
      category: 'bodyweight',
      badge: 'No Equipment',
      stance: 'Side View',
      targetAngle: 'Target: 90°',
      targetMuscles: 'Quadriceps, Glutes, Core',
      breathing: '💨 Inhale ↓ / Exhale ↑',
      proTip: 'Keep chest tall, push knees out over toes, and drive up through heels.',
      demoType: 'squat',
      calPerRep: 0.32,
      rulesGood: [
        'Squat until thighs break parallel to floor (~90° knee angle).',
        'Keep chest upright and back straight (> 60° torso angle).',
        'Push knees out tracking over your toes.'
      ],
      rulesBad: [
        'Avoid shallow squats (stopping above 110°).',
        'Don’t let knees cave inward or lean excessively forward.'
      ]
    },
    'pushups': {
      title: 'Standard Push-Ups',
      category: 'bodyweight',
      badge: 'No Equipment',
      stance: 'Side View',
      targetAngle: 'Target: 90°',
      targetMuscles: 'Chest, Triceps, Anterior Delts',
      breathing: '💨 Inhale ↓ / Exhale ↑',
      proTip: 'Keep head-to-heel in a straight 180° line. Don\'t let your hips sag.',
      demoType: 'pushup',
      calPerRep: 0.35,
      rulesGood: [
        'Lower chest until elbows reach 90° bend.',
        'Keep head, back, and hips in a straight 180° line.',
        'Lock out at top for full chest contraction.'
      ],
      rulesBad: [
        'Do not let hips sag down or pike buttocks up.',
        'Avoid flaring elbows wide at 90° to shoulders.'
      ]
    },
    'diamond-pushups': {
      title: 'Diamond Push-Ups',
      category: 'bodyweight',
      badge: 'No Equipment',
      stance: 'Side View',
      targetAngle: 'Target: 90°',
      targetMuscles: 'Triceps, Inner Chest, Core',
      breathing: '💨 Inhale ↓ / Exhale ↑',
      proTip: 'Form a triangle with thumbs and index fingers under your chest.',
      demoType: 'pushup',
      calPerRep: 0.38,
      rulesGood: [
        'Place hands close forming a diamond index-to-thumb shape.',
        'Lower chest towards hands to 90° elbow bend for tricep overload.',
        'Keep body rigid in a tight plank line.'
      ],
      rulesBad: [
        'Do not let elbows splay outwards.',
        'Avoid dropping your neck.'
      ]
    },
    'pike-pushups': {
      title: 'Pike Push-Ups (Shoulders)',
      category: 'bodyweight',
      badge: 'No Equipment',
      stance: 'Side View',
      targetAngle: 'Target: 80°',
      targetMuscles: 'Anterior Delts, Upper Chest, Triceps',
      breathing: '💨 Inhale ↓ / Exhale ↑',
      proTip: 'Pike hips high into an inverted V. Lower crown of head forward.',
      demoType: 'pike-pushup',
      calPerRep: 0.40,
      rulesGood: [
        'Pike hips high into an inverted V (hip angle 70°-90°).',
        'Lower head forward until elbows bend to 90° to hit anterior delts.',
        'Press vertically back to peak pike position.'
      ],
      rulesBad: [
        'Flattening into standard pushup instead of maintaining pike.',
        'Flaring elbows out to the sides.'
      ]
    },
    'lunges': {
      title: 'Bodyweight Lunges',
      category: 'bodyweight',
      badge: 'No Equipment',
      stance: 'Side View',
      targetAngle: 'Target: 90°',
      targetMuscles: 'Quads, Glutes, Hamstrings',
      breathing: '💨 Inhale Step ↓ / Exhale Up ↑',
      proTip: 'Drop back knee straight down until both knees form 90° right angles.',
      demoType: 'lunge',
      calPerRep: 0.30,
      rulesGood: [
        'Step forward and drop hips until front knee forms a 90° angle.',
        'Keep chest tall and gaze straight ahead.',
        'Push off front heel back to standing.'
      ],
      rulesBad: [
        'Front knee collapsing inward past toes.',
        'Torso slouching forward.'
      ]
    },
    'plank': {
      title: 'Plank Hold (Core)',
      category: 'bodyweight',
      badge: 'No Equipment',
      stance: 'Side View',
      targetAngle: 'Target: 180°',
      targetMuscles: 'Rectus Abdominis, Obliques, Shoulders',
      breathing: '💨 Rhythmic Deep Breaths',
      proTip: 'Pull belly button to spine, squeeze glutes, maintain 180° flat back.',
      demoType: 'plank',
      calPerRep: 0.15,
      rulesGood: [
        'Maintain a straight 180° alignment from shoulders to ankles.',
        'Engage core and squeeze glutes.',
        'Breathe steadily through the hold.'
      ],
      rulesBad: [
        'Hips dropping down towards floor.',
        'Piking hips too high in the air.'
      ]
    },
    'side-plank': {
      title: 'Side Plank Hold (Obliques)',
      category: 'bodyweight',
      badge: 'No Equipment',
      stance: 'Front View',
      targetAngle: 'Target: 180°',
      targetMuscles: 'Obliques, Quadratus Lumborum, Glutes',
      breathing: '💨 Steady Core Breathing',
      proTip: 'Lift bottom hip up off floor into a rigid diagonal line.',
      demoType: 'side-plank',
      calPerRep: 0.15,
      rulesGood: [
        'Align shoulder, hip, and ankle in a continuous lateral diagonal line.',
        'Lift bottom hip up away from the floor.',
        'Keep neck neutral with spine.'
      ],
      rulesBad: [
        'Sagging bottom hip toward floor.',
        'Rolling top shoulder forward.'
      ]
    },
    'glute-bridges': {
      title: 'Glute Bridges',
      category: 'bodyweight',
      badge: 'No Equipment',
      stance: 'Side View',
      targetAngle: 'Target: 180°',
      targetMuscles: 'Gluteus Maximus, Hamstrings',
      breathing: '💨 Inhale Down ↓ / Exhale Squeeze ↑',
      proTip: 'Drive through heels, squeeze glutes at the top for 1 full second.',
      demoType: 'glute-bridge',
      calPerRep: 0.28,
      rulesGood: [
        'Drive through heels and lift hips into a straight 180° line with knees.',
        'Squeeze glutes hard at the top for 1 second.',
        'Lower hips slowly under control.'
      ],
      rulesBad: [
        'Over-arching lumbar spine.',
        'Incomplete hip extension.'
      ]
    },
    'tricep-dips': {
      title: 'Chair / Floor Tricep Dips',
      category: 'bodyweight',
      badge: 'No Equipment',
      stance: 'Side View',
      targetAngle: 'Target: 90°',
      targetMuscles: 'Triceps, Front Delts',
      breathing: '💨 Inhale Down ↓ / Exhale Press ↑',
      proTip: 'Keep your back skimming close to the chair or bench.',
      demoType: 'tricep-dip',
      calPerRep: 0.32,
      rulesGood: [
        'Keep back and hips close to chair or floor support.',
        'Lower until elbows bend to 90° angle.',
        'Press firmly through palms back to lockout.'
      ],
      rulesBad: [
        'Shoulders rolling forward.',
        'Shallow elbow bend.'
      ]
    },
    'wall-sit': {
      title: 'Wall Sit Hold (Legs)',
      category: 'bodyweight',
      badge: 'No Equipment',
      stance: 'Side View',
      targetAngle: 'Target: 90°',
      targetMuscles: 'Quadriceps, Adductors',
      breathing: '💨 Steady Oxygenation',
      proTip: 'Slide down until thighs are parallel with floor. Rest arms at sides.',
      demoType: 'wall-sit',
      calPerRep: 0.18,
      rulesGood: [
        'Back flat against wall with thighs parallel to ground (90° knee angle).',
        'Knees directly over ankles.',
        'Keep hands off your thighs.'
      ],
      rulesBad: [
        'Sitting too high above 110° knee angle.',
        'Letting knees cave inward.'
      ]
    },
    'burpees': {
      title: 'Full Burpees',
      category: 'bodyweight',
      badge: 'No Equipment',
      stance: 'Side View',
      targetAngle: 'Target: 160°',
      targetMuscles: 'Total Body Cardiovascular, Chest, Legs',
      breathing: '💨 Quick Dynamic Breathing',
      proTip: 'Drop full chest to floor, snap feet under hips, and jump high reaching overhead.',
      demoType: 'burpee',
      calPerRep: 0.55,
      rulesGood: [
        'Drop chest and hips to floor into plank/pushup.',
        'Pop feet back under hips and jump overhead with arms extended (>150°).',
        'Maintain quick, fluid transitions.'
      ],
      rulesBad: [
        'Skipping the full chest floor drop.',
        'Not jumping overhead at the top.'
      ]
    },
    'mountain-climbers': {
      title: 'Mountain Climbers (Speed)',
      category: 'bodyweight',
      badge: 'No Equipment',
      stance: 'Side View',
      targetAngle: 'Target: 80°',
      targetMuscles: 'Core, Hip Flexors, Shoulders',
      breathing: '💨 Rapid Inhale/Exhale Cadence',
      proTip: 'Keep hips locked down low and drive alternating knees up to chest.',
      demoType: 'mountain-climber',
      calPerRep: 0.22,
      rulesGood: [
        'Hold rigid plank position with hands under shoulders.',
        'Drive alternating knees up towards chest (knee angle < 85°).',
        'Keep hips low and level.'
      ],
      rulesBad: [
        'Bouncing hips high in the air.',
        'Letting feet lag behind.'
      ]
    },
    'crunches': {
      title: 'Abdominal Crunches',
      category: 'bodyweight',
      badge: 'No Equipment',
      stance: 'Side View',
      targetAngle: 'Target: 120°',
      targetMuscles: 'Upper Rectus Abdominis',
      breathing: '💨 Exhale Squeeze ↑ / Inhale Down ↓',
      proTip: 'Flex your abs to lift shoulder blades 3 inches off floor. Do not yank neck.',
      demoType: 'crunch',
      calPerRep: 0.20,
      rulesGood: [
        'Lie on back with knees bent at 90°.',
        'Flex abs and curl shoulder blades 3-4 inches off the floor.',
        'Exhale on the squeeze up, inhale on descent.'
      ],
      rulesBad: [
        'Yanking neck with hands.',
        'Using hip momentum instead of abdominal flexion.'
      ]
    },
    'leg-raises': {
      title: 'Lying Leg Raises (Lower Abs)',
      category: 'bodyweight',
      badge: 'No Equipment',
      stance: 'Side View',
      targetAngle: 'Target: 90°',
      targetMuscles: 'Lower Abs, Hip Flexors',
      breathing: '💨 Exhale Lift ↑ / Inhale Lower ↓',
      proTip: 'Keep lower back pressed flat into floor. Lower legs under control.',
      demoType: 'leg-raise',
      calPerRep: 0.25,
      rulesGood: [
        'Lie flat, press lower back into ground.',
        'Raise straight legs together up to 90° vertical angle.',
        'Lower legs slowly without letting heels touch floor.'
      ],
      rulesBad: [
        'Arching lower back off the floor on descent.',
        'Bending knees excessively.'
      ]
    },
    'calf-raises': {
      title: 'Standing Calf Raises',
      category: 'bodyweight',
      badge: 'No Equipment',
      stance: 'Front View',
      targetAngle: 'Target: 175°',
      targetMuscles: 'Gastrocnemius, Soleus',
      breathing: '💨 Exhale Rise ↑ / Inhale Down ↓',
      proTip: 'Drive high onto big toes and pause for 1 second peak burn.',
      demoType: 'calf-raise',
      calPerRep: 0.18,
      rulesGood: [
        'Stand tall and drive onto balls of feet as high as possible.',
        'Hold peak contraction for 1 second at top.',
        'Lower heels slowly for a deep stretch.'
      ],
      rulesBad: [
        'Rocking torso back and forth.',
        'Bouncing reps without pausing at peak.'
      ]
    },
    'superman': {
      title: 'Superman Hold (Spine)',
      category: 'bodyweight',
      badge: 'No Equipment',
      stance: 'Side View',
      targetAngle: 'Target: 180°',
      targetMuscles: 'Erector Spinae, Glutes, Rear Delts',
      breathing: '💨 Steady Controlled Breaths',
      proTip: 'Simultaneously lift chest and thighs off floor and hold steady.',
      demoType: 'superman',
      calPerRep: 0.15,
      rulesGood: [
        'Lie face down on stomach with arms and legs extended.',
        'Simultaneously lift chest, arms, and thighs off the floor.',
        'Squeeze glutes and mid-back muscles steadily.'
      ],
      rulesBad: [
        'Craning neck backwards.',
        'Holding breath during the isometric hold.'
      ]
    },

    // 🏋️ DUMBBELL EXERCISES
    'db-shoulder-press': {
      title: 'Dumbbell Shoulder Press',
      category: 'dumbbells',
      badge: 'Dumbbells',
      stance: 'Front View',
      targetAngle: 'Target: 170°',
      targetMuscles: 'Deltoids, Triceps, Upper Traps',
      breathing: '💨 Inhale Down ↓ / Exhale Press ↑',
      proTip: 'Press dumbbells vertically without arching your lower back.',
      demoType: 'shoulder-press',
      calPerRep: 0.38,
      rulesGood: [
        'Press dumbbells fully overhead until arms are nearly straight (~170°).',
        'Lower dumbbells until elbows are bent at 90° level with shoulders.',
        'Keep core tight without excessively arching your lower back.'
      ],
      rulesBad: [
        'Do not flare elbows back behind your ears.',
        'Avoid leaning back or hyperextending your lumbar spine.'
      ]
    },
    'db-lateral-raises': {
      title: 'Dumbbell Lateral Raises',
      category: 'dumbbells',
      badge: 'Dumbbells',
      stance: 'Front View',
      targetAngle: 'Target: 90°',
      targetMuscles: 'Lateral Deltoids (Side Shoulders)',
      breathing: '💨 Exhale Raise ↑ / Inhale Down ↓',
      proTip: 'Lead with elbows out to sides until arms reach shoulder level (90°).',
      demoType: 'lateral-raise',
      calPerRep: 0.28,
      rulesGood: [
        'Raise dumbbells out to sides until arms reach shoulder height (85°-95°).',
        'Lead with elbows and keep a slight soft bend in arms.',
        'Control descent down slowly.'
      ],
      rulesBad: [
        'Do not swing body momentum to fling weights.',
        'Avoid hiking neck or shrugging traps.'
      ]
    },
    'db-bicep-curls': {
      title: 'Dumbbell Bicep Curls',
      category: 'dumbbells',
      badge: 'Dumbbells',
      stance: 'Side View',
      targetAngle: 'Target: 40°',
      targetMuscles: 'Biceps Brachii, Brachialis',
      breathing: '💨 Exhale Curl ↑ / Inhale Down ↓',
      proTip: 'Pin your elbows firmly against your ribs. Squeeze biceps at peak.',
      demoType: 'bicep-curl',
      calPerRep: 0.26,
      rulesGood: [
        'Full extension at bottom (150°-170°).',
        'Squeeze biceps at top (35°-45°).',
        'Pin elbows firmly against ribs throughout rep.'
      ],
      rulesBad: [
        'Do not swing elbows forward past hips.',
        'Avoid rocking back for momentum.'
      ]
    },
    'db-hammer-curls': {
      title: 'Dumbbell Hammer Curls',
      category: 'dumbbells',
      badge: 'Dumbbells',
      stance: 'Side View',
      targetAngle: 'Target: 40°',
      targetMuscles: 'Brachioradialis (Forearms), Biceps',
      breathing: '💨 Exhale Curl ↑ / Inhale Down ↓',
      proTip: 'Keep palms facing each other (neutral grip) throughout movement.',
      demoType: 'bicep-curl',
      calPerRep: 0.26,
      rulesGood: [
        'Keep palms facing each other (neutral grip).',
        'Curl up to 40° squeeze and lower to full 160° stretch.',
        'Keep upper body stationary.'
      ],
      rulesBad: [
        'Swinging torso back and forth.',
        'Incomplete range of motion.'
      ]
    },
    'db-rdl': {
      title: 'Dumbbell Romanian Deadlift (RDL)',
      category: 'dumbbells',
      badge: 'Dumbbells',
      stance: 'Side View',
      targetAngle: 'Target: 90°',
      targetMuscles: 'Hamstrings, Glutes, Lower Back',
      breathing: '💨 Inhale Down ↓ / Exhale Drive ↑',
      proTip: 'Hinge hips backward with soft knees. Feel deep stretch in hamstrings.',
      demoType: 'rdl',
      calPerRep: 0.45,
      rulesGood: [
        'Hinge at hips, pushing glutes backward with neutral spine.',
        'Keep dumbbells gliding close down the front of your shins.',
        'Maintain soft knee bend (150°-165°) without squatting down.'
      ],
      rulesBad: [
        'Do not round lower or upper back.',
        'Do not bend knees completely into a squat.'
      ]
    },
    'db-bent-over-rows': {
      title: 'Dumbbell Bent-Over Rows',
      category: 'dumbbells',
      badge: 'Dumbbells',
      stance: 'Side View',
      targetAngle: 'Target: 80°',
      targetMuscles: 'Latissimus Dorsi, Rhomboids, Biceps',
      breathing: '💨 Exhale Row ↑ / Inhale Down ↓',
      proTip: 'Hinge forward at 45° with flat back. Pull elbows straight past ribs.',
      demoType: 'row',
      calPerRep: 0.40,
      rulesGood: [
        'Hinge torso forward at 45° angle with flat back.',
        'Pull elbows straight back past ribcage (elbow angle ~80°).',
        'Squeeze shoulder blades together at the top.'
      ],
      rulesBad: [
        'Rounding spine into a hunch.',
        'Jerking chest upwards during pull.'
      ]
    },
    'db-goblet-squat': {
      title: 'Dumbbell Goblet Squat',
      category: 'dumbbells',
      badge: 'Dumbbells',
      stance: 'Side View',
      targetAngle: 'Target: 90°',
      targetMuscles: 'Quads, Glutes, Core',
      breathing: '💨 Inhale Down ↓ / Exhale Up ↑',
      proTip: 'Hold dumbbell vertically against chest. Squat down to 90° parallel.',
      demoType: 'squat',
      calPerRep: 0.42,
      rulesGood: [
        'Hold dumbbell vertically against chest with both hands.',
        'Squat down until thighs break parallel (approx 90° knee angle).',
        'Keep torso upright and drive through heels.'
      ],
      rulesBad: [
        'Allowing dumbbell to pull chest forward.',
        'Knees caving inward upon ascent.'
      ]
    },
    'db-lunges': {
      title: 'Dumbbell Lunges',
      category: 'dumbbells',
      badge: 'Dumbbells',
      stance: 'Side View',
      targetAngle: 'Target: 90°',
      targetMuscles: 'Quads, Glutes, Forearm Grip',
      breathing: '💨 Inhale Step ↓ / Exhale Drive ↑',
      proTip: 'Hold dumbbells at sides with tall posture. Lower until knee reaches 90°.',
      demoType: 'lunge',
      calPerRep: 0.38,
      rulesGood: [
        'Hold dumbbells at sides with tall upright posture.',
        'Step forward and lower until front thigh is parallel (90°).',
        'Back knee hovers 2 inches above ground.'
      ],
      rulesBad: [
        'Front knee shooting excessively past toes.',
        'Torso tipping forward.'
      ]
    },

    // ⚡ CARDIO & CORE HIIT
    'jumping-jacks': {
      title: 'Jumping Jacks',
      category: 'cardio',
      badge: 'Cardio',
      stance: 'Front View',
      targetAngle: 'Target: 160°',
      targetMuscles: 'Cardiovascular, Calves, Deltoids',
      breathing: '💨 Rhythmic Breath Cadence',
      proTip: 'Bring hands fully overhead (>150°) and land softly on balls of feet.',
      demoType: 'jumping-jacks',
      calPerRep: 0.20,
      rulesGood: [
        'Bring hands fully overhead (> 150° arm raise).',
        'Land softly on balls of feet with knees springy.',
        'Keep steady, rhythmic bounce.'
      ],
      rulesBad: [
        'Short arm swings that don’t reach overhead.',
        'Stiff knees upon landing.'
      ]
    },
    'high-knees': {
      title: 'High Knees Sprint',
      category: 'cardio',
      badge: 'Cardio',
      stance: 'Front View',
      targetAngle: 'Target: 90°',
      targetMuscles: 'Hip Flexors, Quads, Cardio Endurance',
      breathing: '💨 Fast Pace Breathing',
      proTip: 'Drive knees up to hip height (90°) and pump arms rapidly.',
      demoType: 'high-knees',
      calPerRep: 0.18,
      rulesGood: [
        'Drive knees up to hip level (90° hip angle).',
        'Pump opposite arms in coordination.',
        'Stay light on balls of feet.'
      ],
      rulesBad: [
        'Leaning backwards while raising knees.',
        'Shallow knee drives below waist.'
      ]
    },
    'butt-kicks': {
      title: 'Butt Kicks (Hamstring Cardio)',
      category: 'cardio',
      badge: 'Cardio',
      stance: 'Front View',
      targetAngle: 'Target: 60°',
      targetMuscles: 'Hamstrings, Calves, Heart Rate',
      breathing: '💨 Fast Dynamic Breathing',
      proTip: 'Kick heels straight up to touch glutes with quick ground contact.',
      demoType: 'butt-kicks',
      calPerRep: 0.16,
      rulesGood: [
        'Jog in place kicking heels straight up to touch glutes (< 65° knee angle).',
        'Keep thighs vertical and torso upright.',
        'Pace quickly with quick ground turnover.'
      ],
      rulesBad: [
        'Swinging knees forward instead of kicking back.',
        'Slouching chest.'
      ]
    },
    'shadow-boxing': {
      title: 'Shadow Boxing (Speed Punches)',
      category: 'cardio',
      badge: 'Cardio',
      stance: 'Front View',
      targetAngle: 'Target: 160°',
      targetMuscles: 'Shoulders, Core Rotation, Cardio',
      breathing: '💨 Sharp Exhale on Each Punch',
      proTip: 'Snap punches forward with hip rotation and return guard to chin.',
      demoType: 'shadow-boxing',
      calPerRep: 0.15,
      rulesGood: [
        'Snap punches forward to near full extension (~160° elbow angle).',
        'Rotate shoulders and hips with each jab/cross.',
        'Keep guard up protecting chin.'
      ],
      rulesBad: [
        'Dropping hands down to hips.',
        'Hyperextending elbows violently.'
      ]
    }
  };

  // Web Audio Beep Generator
  let audioCtx = null;
  function playBeep(freq = 880, type = 'sine', duration = 0.15) {
    if (!state.audioBeepEnabled) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  // Voice Speech Cue Engine
  function speakCoach(msg, priority = false) {
    if (!state.voiceEnabled || !('speechSynthesis' in window)) return;
    const now = Date.now();
    if (!priority && msg === state.lastVoiceMsg && now - state.lastVoiceTime < 3500) return;
    if (!priority && now - state.lastVoiceTime < 2200) return;

    state.lastVoiceMsg = msg;
    state.lastVoiceTime = now;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(msg);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  }

  // Joint Angle Calculator: Angle ABC at point B
  function calculateAngle(a, b, c) {
    if (!a || !b || !c) return 0;
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) angle = 360.0 - angle;
    return Math.round(angle);
  }

  // =========================================================
  // INITIALIZE APP & BINDINGS
  // =========================================================
  function init() {
    videoEl = document.getElementById('webcam-video');
    canvasEl = document.getElementById('skeleton-canvas');
    if (canvasEl) ctx = canvasEl.getContext('2d');

    ghostCanvasEl = document.getElementById('ghost-canvas');
    if (ghostCanvasEl) ghostCtx = ghostCanvasEl.getContext('2d');

    confettiCanvasEl = document.getElementById('confetti-canvas');
    if (confettiCanvasEl) confettiCtx = confettiCanvasEl.getContext('2d');

    demoCanvasEl = document.getElementById('demo-animation-canvas');
    if (demoCanvasEl) demoCtx = demoCanvasEl.getContext('2d');

    standbyOverlay = document.getElementById('camera-standby-overlay');
    startCamBtn = document.getElementById('btn-start-camera');
    stopCamBtn = document.getElementById('btn-stop-camera');
    resetRepsBtn = document.getElementById('btn-reset-reps');
    voiceToggleBtn = document.getElementById('btn-toggle-voice');
    voiceCmdToggleBtn = document.getElementById('btn-toggle-voice-cmd');
    ghostToggleBtn = document.getElementById('btn-toggle-ghost');
    finishWorkoutBtn = document.getElementById('btn-finish-workout');

    modeBtnFree = document.getElementById('mode-btn-free');
    modeBtnCircuit = document.getElementById('mode-btn-circuit');

    repCountEl = document.getElementById('hud-rep-count');
    validRepCountEl = document.getElementById('hud-valid-reps');
    formScoreEl = document.getElementById('hud-form-score');
    activeExerciseTitleEl = document.getElementById('active-exercise-title');

    feedbackBanner = document.getElementById('posture-feedback-banner');
    feedbackIcon = document.getElementById('feedback-icon');
    feedbackMsg = document.getElementById('feedback-msg');
    feedbackSub = document.getElementById('feedback-sub');
    angleHud = document.getElementById('hud-live-angle');

    cameraStatusDot = document.getElementById('hud-camera-dot');
    cameraStatusText = document.getElementById('hud-camera-text');
    stanceBadge = document.getElementById('hud-stance-badge');
    streakBadge = document.getElementById('hud-streak-badge');

    // Circuit Mode Elements
    circuitTimerStrip = document.getElementById('circuit-timer-strip');
    circuitStationPill = document.getElementById('circuit-station-pill');
    circuitExerciseName = document.getElementById('circuit-exercise-name');
    circuitPhaseLabel = document.getElementById('circuit-phase-label');
    circuitTimerDigits = document.getElementById('circuit-timer-digits');
    circuitSkipBtn = document.getElementById('circuit-skip-btn');

    // Demo Elements
    demoPhaseText = document.getElementById('demo-phase-text');
    demoTargetAngle = document.getElementById('demo-target-angle');
    demoTargetMuscles = document.getElementById('demo-target-muscles');
    demoBreathingTempo = document.getElementById('demo-breathing-tempo');
    demoCueTip = document.getElementById('demo-cue-tip');
    btnDemoTogglePlay = document.getElementById('btn-demo-toggle-play');
    btnDemoToggleSpeed = document.getElementById('btn-demo-toggle-speed');

    // Report Elements
    reportModalOverlay = document.getElementById('report-modal-overlay');
    btnCloseReport = document.getElementById('btn-close-report');
    btnShareReport = document.getElementById('btn-share-report');
    reportTotalReps = document.getElementById('report-total-reps');
    reportValidReps = document.getElementById('report-valid-reps');
    reportAccuracyScore = document.getElementById('report-accuracy-score');
    reportCalories = document.getElementById('report-calories');
    reportDuration = document.getElementById('report-duration');
    reportTitanLevel = document.getElementById('report-titan-level');
    reportAiAssessment = document.getElementById('report-ai-assessment');

    // Mode Buttons
    if (modeBtnFree) {
      modeBtnFree.addEventListener('click', () => setWorkoutMode('free'));
    }
    if (modeBtnCircuit) {
      modeBtnCircuit.addEventListener('click', () => setWorkoutMode('circuit'));
    }

    // Render Exercise Picker Chips
    renderExerciseChips();

    // Category Filter Buttons
    document.querySelectorAll('.cat-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cat-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.selectedCategory = btn.dataset.category;
        renderExerciseChips();
      });
    });

    if (startCamBtn) startCamBtn.addEventListener('click', startCamera);
    if (stopCamBtn) stopCamBtn.addEventListener('click', stopCamera);
    if (resetRepsBtn) resetRepsBtn.addEventListener('click', resetCounter);

    if (voiceToggleBtn) {
      voiceToggleBtn.addEventListener('click', () => {
        state.voiceEnabled = !state.voiceEnabled;
        voiceToggleBtn.classList.toggle('active', state.voiceEnabled);
        voiceToggleBtn.innerHTML = state.voiceEnabled ? '🔊 Coach ON' : '🔇 Coach OFF';
        if (state.voiceEnabled) speakCoach('Voice coach enabled', true);
      });
    }

    if (voiceCmdToggleBtn) {
      voiceCmdToggleBtn.addEventListener('click', () => {
        state.voiceCmdEnabled = !state.voiceCmdEnabled;
        voiceCmdToggleBtn.classList.toggle('active', state.voiceCmdEnabled);
        voiceCmdToggleBtn.innerHTML = state.voiceCmdEnabled ? '🎙️ Voice ON' : '🎙️ Voice OFF';
        if (state.voiceCmdEnabled) {
          initVoiceRecognition();
          speakCoach('Voice commands active.', true);
        }
      });
    }

    if (ghostToggleBtn) {
      ghostToggleBtn.addEventListener('click', () => {
        state.ghostEnabled = !state.ghostEnabled;
        ghostToggleBtn.classList.toggle('active', state.ghostEnabled);
        ghostToggleBtn.innerHTML = state.ghostEnabled ? '👻 Ghost: ON' : '👻 Ghost: OFF';
        if (!state.ghostEnabled && ghostCtx) {
          ghostCtx.clearRect(0, 0, ghostCanvasEl.width, ghostCanvasEl.height);
        }
      });
    }

    if (finishWorkoutBtn) {
      finishWorkoutBtn.addEventListener('click', openReportModal);
    }
    if (btnCloseReport) {
      btnCloseReport.addEventListener('click', () => {
        if (reportModalOverlay) reportModalOverlay.style.display = 'none';
      });
    }
    if (btnShareReport) {
      btnShareReport.addEventListener('click', shareWorkoutSummary);
    }

    if (circuitSkipBtn) {
      circuitSkipBtn.addEventListener('click', nextCircuitStation);
    }

    if (btnDemoTogglePlay) {
      btnDemoTogglePlay.addEventListener('click', () => {
        state.demoPlaying = !state.demoPlaying;
        btnDemoTogglePlay.textContent = state.demoPlaying ? '⏸ Pause' : '▶ Play';
      });
    }

    if (btnDemoToggleSpeed) {
      btnDemoToggleSpeed.addEventListener('click', () => {
        state.demoSpeed = state.demoSpeed === 1.0 ? 0.5 : state.demoSpeed === 0.5 ? 1.5 : 1.0;
        btnDemoToggleSpeed.textContent = `⚡ ${state.demoSpeed}x`;
      });
    }

    updateExerciseUI();

    // Start Demo Simulator Loop
    startDemoAnimationLoop();

    // Start Voice Recognition Engine
    initVoiceRecognition();
  }

  // =========================================================
  // WORKOUT MODES (FREE PRACTICE VS SMART 15-MIN CIRCUIT)
  // =========================================================
  function setWorkoutMode(mode) {
    state.workoutMode = mode;
    if (modeBtnFree) modeBtnFree.classList.toggle('active', mode === 'free');
    if (modeBtnCircuit) modeBtnCircuit.classList.toggle('active', mode === 'circuit');

    const catBar = document.getElementById('category-filter-bar');
    const pickBar = document.getElementById('exercise-picker');

    if (mode === 'circuit') {
      if (catBar) catBar.style.display = 'none';
      if (pickBar) pickBar.style.display = 'none';
      startCircuitMode();
    } else {
      if (catBar) catBar.style.display = 'flex';
      if (pickBar) pickBar.style.display = 'flex';
      stopCircuitMode();
    }
  }

  function startCircuitMode() {
    state.circuitActive = true;
    state.circuitStationIndex = 0;
    state.circuitPhase = 'work';
    state.circuitTimeRemaining = 45;
    if (circuitTimerStrip) circuitTimerStrip.style.display = 'flex';

    loadCircuitStation(0);

    if (state.circuitTimerInterval) clearInterval(state.circuitTimerInterval);
    state.circuitTimerInterval = setInterval(updateCircuitTimer, 1000);

    speakCoach('15-Minute Smart Circuit started! Station 1: Air Squats for 45 seconds. Ready, Go!', true);
    playBeep(1040, 'triangle', 0.3);
  }

  function stopCircuitMode() {
    state.circuitActive = false;
    if (state.circuitTimerInterval) {
      clearInterval(state.circuitTimerInterval);
      state.circuitTimerInterval = null;
    }
    if (circuitTimerStrip) circuitTimerStrip.style.display = 'none';
  }

  function loadCircuitStation(index) {
    const exKey = state.circuitStations[index] || 'squats';
    state.selectedExercise = exKey;
    updateExerciseUI();

    if (circuitStationPill) circuitStationPill.textContent = `Station ${index + 1} of ${state.circuitStations.length}`;
    if (circuitExerciseName) circuitExerciseName.textContent = EXERCISES[exKey].title;
  }

  function updateCircuitTimer() {
    if (!state.circuitActive) return;
    state.circuitTimeRemaining--;

    const mins = String(Math.floor(state.circuitTimeRemaining / 60)).padStart(2, '0');
    const secs = String(state.circuitTimeRemaining % 60).padStart(2, '0');
    if (circuitTimerDigits) circuitTimerDigits.textContent = `${mins}:${secs}`;

    if (state.circuitTimeRemaining <= 3 && state.circuitTimeRemaining > 0) {
      playBeep(700, 'sine', 0.1);
    }

    if (state.circuitTimeRemaining <= 0) {
      if (state.circuitPhase === 'work') {
        state.circuitPhase = 'rest';
        state.circuitTimeRemaining = 15;
        if (circuitPhaseLabel) {
          circuitPhaseLabel.textContent = 'REST INTERVAL (Breathe)';
          circuitPhaseLabel.style.color = '#f59e0b';
        }
        playBeep(520, 'sine', 0.4);
        speakCoach('Rest for 15 seconds. Breathe deeply.', true);
      } else {
        nextCircuitStation();
      }
    }
  }

  function nextCircuitStation() {
    state.circuitStationIndex++;
    if (state.circuitStationIndex >= state.circuitStations.length) {
      stopCircuitMode();
      speakCoach('Awesome job! Circuit Complete! Opening your workout report card.', true);
      triggerConfetti();
      openReportModal();
      return;
    }

    state.circuitPhase = 'work';
    state.circuitTimeRemaining = 45;
    if (circuitPhaseLabel) {
      circuitPhaseLabel.textContent = 'WORK INTERVAL';
      circuitPhaseLabel.style.color = '#4ade80';
    }

    loadCircuitStation(state.circuitStationIndex);
    playBeep(1040, 'triangle', 0.3);
    speakCoach(`Next station: ${EXERCISES[state.selectedExercise].title}! Go!`, true);
  }

  // =========================================================
  // 🎙️ HANDS-FREE VOICE COMMAND RECOGNITION (Web Speech API)
  // =========================================================
  let recognition = null;
  function initVoiceRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return;

    try {
      recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        if (!state.voiceCmdEnabled) return;
        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex][0].transcript.trim().toLowerCase();
        handleVoiceCommand(transcript);
      };

      recognition.onerror = () => {};
      recognition.onend = () => {
        if (state.voiceCmdEnabled) {
          try { recognition.start(); } catch (e) {}
        }
      };

      recognition.start();
    } catch (e) {}
  }

  function handleVoiceCommand(cmd) {
    if (cmd.includes('start') || cmd.includes('camera on')) {
      if (!state.cameraRunning) startCamera();
    } else if (cmd.includes('stop') || cmd.includes('pause camera')) {
      if (state.cameraRunning) stopCamera();
    } else if (cmd.includes('reset') || cmd.includes('restart reps')) {
      resetCounter();
      speakCoach('Reps reset');
    } else if (cmd.includes('finish') || cmd.includes('report') || cmd.includes('done')) {
      openReportModal();
    } else if (cmd.includes('circuit') || cmd.includes('routine')) {
      setWorkoutMode('circuit');
    } else if (cmd.includes('free') || cmd.includes('practice')) {
      setWorkoutMode('free');
    } else if (cmd.includes('switch') || cmd.includes('next')) {
      switchToNextExercise();
    } else {
      // Check exercise names
      for (const [key, ex] of Object.entries(EXERCISES)) {
        if (cmd.includes(ex.title.toLowerCase()) || cmd.includes(key.replace(/-/g, ' '))) {
          state.selectedExercise = key;
          resetCounter();
          updateExerciseUI();
          renderExerciseChips();
          speakCoach(`Switched to ${ex.title}`);
          break;
        }
      }
    }
  }

  function switchToNextExercise() {
    const exKeys = Object.keys(EXERCISES);
    const currentIndex = exKeys.indexOf(state.selectedExercise);
    const nextIndex = (currentIndex + 1) % exKeys.length;
    state.selectedExercise = exKeys[nextIndex];

    resetCounter();
    updateExerciseUI();
    renderExerciseChips();

    playBeep(1200, 'triangle', 0.3);
    triggerConfetti();
    speakCoach(`Switched to ${EXERCISES[state.selectedExercise].title}!`, true);
  }

  // =========================================================
  // UI RENDERING & CONTROLS
  // =========================================================
  function renderExerciseChips() {
    const picker = document.getElementById('exercise-picker');
    if (!picker) return;

    const filteredKeys = Object.keys(EXERCISES).filter(key => {
      if (state.selectedCategory === 'all') return true;
      return EXERCISES[key].category === state.selectedCategory;
    });

    picker.innerHTML = filteredKeys.map(key => {
      const ex = EXERCISES[key];
      const isActive = key === state.selectedExercise;
      const icon = ex.category === 'dumbbells' ? '🏋️' : ex.category === 'cardio' ? '⚡' : '🤸';
      return `
        <button class="exercise-chip ${isActive ? 'active' : ''}" type="button" data-exercise="${key}">
          <span>${icon}</span>
          <span>${ex.title}</span>
          <span class="chip-tag">${ex.badge}</span>
        </button>
      `;
    }).join('');

    picker.querySelectorAll('.exercise-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        picker.querySelectorAll('.exercise-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.selectedExercise = chip.dataset.exercise;
        resetCounter();
        updateExerciseUI();
        speakCoach(`Switched to ${EXERCISES[state.selectedExercise].title}`);
      });
    });
  }

  function updateExerciseUI() {
    const config = EXERCISES[state.selectedExercise] || EXERCISES.squats;
    if (activeExerciseTitleEl) activeExerciseTitleEl.textContent = config.title;

    if (stanceBadge) {
      stanceBadge.innerHTML = `<span>📐 Stance: <strong>${config.stance || 'Side View'}</strong></span>`;
    }

    const rulesEl = document.getElementById('form-rules-container');
    if (rulesEl) {
      rulesEl.innerHTML = `
        ${config.rulesGood.map(r => `<li class="form-rule-item good"><span class="rule-icon">✓</span><span>${r}</span></li>`).join('')}
        ${config.rulesBad.map(r => `<li class="form-rule-item bad"><span class="rule-icon">✕</span><span>${r}</span></li>`).join('')}
      `;
    }

    if (demoTargetAngle) demoTargetAngle.textContent = config.targetAngle || 'Target: 90°';
    if (demoTargetMuscles) demoTargetMuscles.textContent = config.targetMuscles || 'Primary Muscles';
    if (demoBreathingTempo) demoBreathingTempo.textContent = config.breathing || '💨 Inhale / Exhale';
    if (demoCueTip) demoCueTip.innerHTML = `💡 <strong>Pro Tip:</strong> ${config.proTip || 'Perform with controlled form and full range of motion.'}`;

    updateFeedback('info', '✦ Stand in frame', `AI is ready to track your ${config.title}.`);
  }

  function resetCounter() {
    state.repCount = 0;
    state.validReps = 0;
    state.currentStreak = 0;
    state.currentStage = 'up';
    state.formScore = 100;
    state.totalFramesAnalyzed = 0;
    state.correctFrames = 0;
    if (state.holdTimer) {
      clearInterval(state.holdTimer);
      state.holdTimer = null;
    }
    state.holdSeconds = 0;

    if (repCountEl) repCountEl.textContent = '0';
    if (validRepCountEl) validRepCountEl.textContent = '0';
    if (formScoreEl) formScoreEl.textContent = '100%';
    const scoreFill = document.getElementById('accuracy-bar-fill');
    if (scoreFill) scoreFill.style.width = '100%';
    updateStreakHUD();
  }

  function updateFeedback(type, title, subtitle, angleText = '') {
    if (!feedbackBanner) return;
    feedbackBanner.className = `posture-feedback-banner ${type}`;
    if (feedbackIcon) {
      feedbackIcon.textContent = type === 'correct' ? '✓' : type === 'wrong' ? '✕' : type === 'warning' ? '⚠' : 'ℹ';
    }
    if (feedbackMsg) feedbackMsg.textContent = title;
    if (feedbackSub) feedbackSub.textContent = subtitle;
    if (angleHud && angleText) angleHud.textContent = angleText;
  }

  function recordRepSuccess() {
    state.repCount++;
    state.validReps++;
    state.currentStreak++;
    if (state.currentStreak > state.maxStreak) state.maxStreak = state.currentStreak;

    updateStreakHUD();
    updateCounters();

    // Streak and Milestones celebration
    if (state.currentStreak >= 5 && state.currentStreak % 5 === 0) {
      speakCoach(`${state.currentStreak} Perfect Form Streak! Keep firing!`, true);
      playBeep(1200, 'triangle', 0.25);
    } else {
      speakCoach(`Rep ${state.repCount}!`);
      playBeep(980, 'sine', 0.16);
    }

    if (state.repCount === 10 || state.repCount === 25 || state.repCount === 50) {
      triggerConfetti();
    }
  }

  function updateStreakHUD() {
    if (!streakBadge) return;
    streakBadge.innerHTML = `<span>🔥 Streak: <strong>${state.currentStreak}x</strong></span>`;
    streakBadge.classList.toggle('fire', state.currentStreak >= 3);
  }

  function updateCounters() {
    if (repCountEl) repCountEl.textContent = state.repCount;
    if (validRepCountEl) validRepCountEl.textContent = state.validReps;
  }

  // =========================================================
  // 📊 POST-WORKOUT REPORT CARD & CALORIE ENGINE
  // =========================================================
  function openReportModal() {
    if (state.cameraRunning) stopCamera();

    const elapsedMs = state.sessionStartTime ? Date.now() - state.sessionStartTime : (state.repCount * 3000);
    const totalSecs = Math.max(10, Math.floor(elapsedMs / 1000));
    const mins = String(Math.floor(totalSecs / 60)).padStart(2, '0');
    const secs = String(totalSecs % 60).padStart(2, '0');

    const exConfig = EXERCISES[state.selectedExercise] || EXERCISES.squats;
    const estCalories = Math.round(state.validReps * (exConfig.calPerRep || 0.35) + (totalSecs * 0.05));

    if (reportTotalReps) reportTotalReps.textContent = state.repCount;
    if (reportValidReps) reportValidReps.textContent = state.validReps;
    if (reportAccuracyScore) reportAccuracyScore.textContent = `${state.formScore}%`;
    if (reportCalories) reportCalories.textContent = `${estCalories} kcal`;
    if (reportDuration) reportDuration.textContent = `${mins}:${secs}`;

    let levelTitle = '⚡ Level 1 Recruit';
    if (state.validReps >= 30) levelTitle = '👑 Level 5 Titan Elite';
    else if (state.validReps >= 20) levelTitle = '⚔️ Level 4 Gladiator';
    else if (state.validReps >= 10) levelTitle = '🔥 Level 3 Vanguard';
    else if (state.validReps >= 5) levelTitle = '⚡ Level 2 Warrior';

    if (reportTitanLevel) reportTitanLevel.textContent = levelTitle;

    if (reportAiAssessment) {
      if (state.formScore >= 90) {
        reportAiAssessment.textContent = `Outstanding execution! Form precision was ${state.formScore}%. High consistency in range of motion and joint stability.`;
      } else if (state.formScore >= 75) {
        reportAiAssessment.textContent = `Solid workout with ${state.formScore}% accuracy! Keep focusing on posture symmetry and locking out at the top of each rep.`;
      } else {
        reportAiAssessment.textContent = `Good effort! To improve your ${state.formScore}% score, slow down your descent and check the How-To Demo for exact joint angles.`;
      }
    }

    if (reportModalOverlay) reportModalOverlay.style.display = 'flex';
  }

  function shareWorkoutSummary() {
    const summary = `🏆 TITAN FORGE AI WORKOUT SUMMARY:\n⚡ Workout: ${EXERCISES[state.selectedExercise].title}\n🔥 Reps: ${state.validReps}/${state.repCount} Perfect Form\n🎯 Form Accuracy: ${state.formScore}%\n⚡ Titan Rank: ${reportTitanLevel ? reportTitanLevel.textContent : 'Warrior'}\nTracked with Titan Forge AI Vision Coach!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
      alert('Workout Summary copied to clipboard! You can share it anywhere.');
    } else {
      alert(summary);
    }
  }

  // =========================================================
  // 📷 WEBCAM & MEDIAPIPE POSE TRACKING PIPELINE
  // =========================================================
  let poseInstance = null;
  let cameraInstance = null;
  let animationFrameId = null;

  async function startCamera() {
    try {
      if (cameraStatusText) cameraStatusText.textContent = 'Initializing AI Pose Model...';
      if (cameraStatusDot) cameraStatusDot.style.background = '#f59e0b';

      if (!poseInstance && typeof Pose !== 'undefined') {
        poseInstance = new Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });

        poseInstance.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        poseInstance.onResults(onPoseResults);
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });

      state.stream = stream;
      if (videoEl) {
        videoEl.srcObject = stream;
        await videoEl.play();
      }

      state.cameraRunning = true;
      state.sessionStartTime = Date.now();

      if (standbyOverlay) standbyOverlay.style.display = 'none';
      if (stopCamBtn) stopCamBtn.style.display = 'inline-block';
      if (cameraStatusDot) cameraStatusDot.style.background = '#22c55e';
      if (cameraStatusText) cameraStatusText.textContent = '⚡ Camera Active (Live)';

      speakCoach(`Camera active! AI is tracking your ${EXERCISES[state.selectedExercise].title}. Stand in frame.`);

      // Direct frame pump loop with Pose
      async function processVideoFrame() {
        if (!state.cameraRunning) return;
        if (videoEl && videoEl.readyState >= 2 && poseInstance) {
          try {
            await poseInstance.send({ image: videoEl });
          } catch (err) {
            console.warn('Pose frame processing warning:', err);
          }
        }
        animationFrameId = requestAnimationFrame(processVideoFrame);
      }
      processVideoFrame();

    } catch (err) {
      console.error('Camera startup error:', err);
      alert('Camera access error. Please ensure your webcam is connected and permission is allowed.');
      if (cameraStatusDot) cameraStatusDot.style.background = '#ef4444';
      if (cameraStatusText) cameraStatusText.textContent = 'Camera Error / Blocked';
    }
  }

  function stopCamera() {
    state.cameraRunning = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    if (state.stream) {
      state.stream.getTracks().forEach(track => track.stop());
      state.stream = null;
    }

    if (videoEl) {
      videoEl.srcObject = null;
    }

    if (canvasEl && ctx) {
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    }
    if (ghostCanvasEl && ghostCtx) {
      ghostCtx.clearRect(0, 0, ghostCanvasEl.width, ghostCanvasEl.height);
    }

    if (standbyOverlay) standbyOverlay.style.display = 'flex';
    if (stopCamBtn) stopCamBtn.style.display = 'none';
    if (cameraStatusDot) cameraStatusDot.style.background = '#64748b';
    if (cameraStatusText) cameraStatusText.textContent = 'Camera Off (Standby)';

    speakCoach('Camera stopped.');
  }

  // =========================================================
  // ⚡ POSE RESULTS DISPATCHER & BIOMECHANICAL ANALYSIS
  // =========================================================
  function onPoseResults(results) {
    if (!state.cameraRunning) return;

    const w = canvasEl ? canvasEl.clientWidth : 640;
    const h = canvasEl ? canvasEl.clientHeight : 480;

    if (canvasEl && (canvasEl.width !== w || canvasEl.height !== h)) {
      canvasEl.width = w;
      canvasEl.height = h;
    }
    if (ghostCanvasEl && (ghostCanvasEl.width !== w || ghostCanvasEl.height !== h)) {
      ghostCanvasEl.width = w;
      ghostCanvasEl.height = h;
    }

    if (ctx) ctx.clearRect(0, 0, w, h);

    if (state.ghostEnabled) {
      renderGhostSilhouette();
    }

    if (!results.poseLandmarks) {
      updateFeedback('info', '✦ Stand in View', 'Ensure your full body is in frame.');
      return;
    }

    const lm = results.poseLandmarks;
    const analysis = analyzeExercisePosture(lm, w, h);

    drawSkeleton(lm, w, h, analysis);
  }

  function analyzeExercisePosture(lm, w, h) {
    const exKey = state.selectedExercise;
    let analysis = {
      color: '#22c55e',
      primaryAngle: 0,
      primaryAnglePoint: null
    };

    state.totalFramesAnalyzed++;

    // Key points (MediaPipe Pose landmark IDs)
    const lSh = lm[11], rSh = lm[12];
    const lEl = lm[13], rEl = lm[14];
    const lWr = lm[15], rWr = lm[16];
    const lHp = lm[23], rHp = lm[24];
    const lKn = lm[25], rKn = lm[26];
    const lAn = lm[27], rAn = lm[28];

    // Determine better visible side
    const lVis = ((lSh ? lSh.visibility : 0) + (lHp ? lHp.visibility : 0) + (lKn ? lKn.visibility : 0)) / 3;
    const rVis = ((rSh ? rSh.visibility : 0) + (rHp ? rHp.visibility : 0) + (rKn ? rKn.visibility : 0)) / 3;
    const useLeft = lVis >= rVis;

    const sh = useLeft ? lSh : rSh;
    const el = useLeft ? lEl : rEl;
    const wr = useLeft ? lWr : rWr;
    const hp = useLeft ? lHp : rHp;
    const kn = useLeft ? lKn : rKn;
    const an = useLeft ? lAn : rAn;

    // SQUATS & GOBLET SQUATS
    if (['squats', 'db-goblet-squat', 'wall-sit'].includes(exKey)) {
      const kneeAngle = calculateAngle(hp, kn, an);
      analysis.primaryAngle = kneeAngle;
      analysis.primaryAnglePoint = { x: kn.x * w, y: kn.y * h };

      if (exKey === 'wall-sit') {
        if (kneeAngle >= 80 && kneeAngle <= 105) {
          analysis.color = '#22c55e';
          state.correctFrames++;
          updateFeedback('correct', '✓ Perfect Wall-Sit Hold', 'Thighs parallel to floor!', `${kneeAngle}°`);
          recordHoldProgress();
        } else {
          analysis.color = '#ef4444';
          updateFeedback('wrong', '✕ Adjust Wall-Sit Depth', 'Lower until knees hit 90°', `${kneeAngle}°`);
        }
      } else {
        if (kneeAngle < 100) {
          analysis.color = '#22c55e';
          if (state.currentStage === 'up') {
            state.currentStage = 'down';
            updateFeedback('correct', '✓ Great Depth!', 'Drive up through your heels!', `${kneeAngle}°`);
          }
        } else if (kneeAngle > 155) {
          analysis.color = '#22c55e';
          if (state.currentStage === 'down') {
            state.currentStage = 'up';
            recordRepSuccess();
            updateFeedback('correct', '✓ Perfect Squat Rep!', 'Great job! Prepare for next rep.', `${kneeAngle}°`);
          } else {
            updateFeedback('info', '✦ Begin Squat', 'Lower hips down to 90° knee angle.', `${kneeAngle}°`);
          }
        } else {
          analysis.color = '#eab308';
          updateFeedback('warning', '⚡ Descending...', 'Reach 90° parallel knee angle.', `${kneeAngle}°`);
        }
      }
    }
    // PUSH-UPS & CHEST MOVEMENTS
    else if (['pushups', 'diamond-pushups', 'pike-pushups', 'tricep-dips', 'db-chest-press'].includes(exKey)) {
      const elbowAngle = calculateAngle(sh, el, wr);
      analysis.primaryAngle = elbowAngle;
      analysis.primaryAnglePoint = { x: el.x * w, y: el.y * h };

      if (elbowAngle < 95) {
        analysis.color = '#22c55e';
        if (state.currentStage === 'up') {
          state.currentStage = 'down';
          updateFeedback('correct', '✓ Perfect Chest Depth!', 'Press upwards firmly!', `${elbowAngle}°`);
        }
      } else if (elbowAngle > 155) {
        analysis.color = '#22c55e';
        if (state.currentStage === 'down') {
          state.currentStage = 'up';
          recordRepSuccess();
          updateFeedback('correct', '✓ Full Rep Lockout!', 'Great push! Keep core tight.', `${elbowAngle}°`);
        } else {
          updateFeedback('info', '✦ Ready to Press', 'Lower chest towards floor/diamond.', `${elbowAngle}°`);
        }
      } else {
        analysis.color = '#eab308';
        updateFeedback('warning', '⚡ Pressing...', 'Elbows tracking at 45° angle.', `${elbowAngle}°`);
      }
    }
    // LUNGES
    else if (['lunges', 'db-lunges'].includes(exKey)) {
      const kneeAngle = calculateAngle(hp, kn, an);
      analysis.primaryAngle = kneeAngle;
      analysis.primaryAnglePoint = { x: kn.x * w, y: kn.y * h };

      if (kneeAngle < 100) {
        analysis.color = '#22c55e';
        if (state.currentStage === 'up') {
          state.currentStage = 'down';
          updateFeedback('correct', '✓ Deep Lunge Position', 'Drive front heel into floor.', `${kneeAngle}°`);
        }
      } else if (kneeAngle > 155) {
        analysis.color = '#22c55e';
        if (state.currentStage === 'down') {
          state.currentStage = 'up';
          recordRepSuccess();
          updateFeedback('correct', '✓ Lunge Completed!', 'Alternate or repeat side.', `${kneeAngle}°`);
        } else {
          updateFeedback('info', '✦ Step Forward', 'Lower front knee to 90° angle.', `${kneeAngle}°`);
        }
      } else {
        analysis.color = '#eab308';
        updateFeedback('warning', '⚡ In Motion...', 'Keep tall posture.', `${kneeAngle}°`);
      }
    }
    // BICEP CURLS & HAMMER CURLS
    else if (['bicep-curls', 'db-bicep-curls', 'db-hammer-curls', 'db-tricep-kickback'].includes(exKey)) {
      const elbowAngle = calculateAngle(sh, el, wr);
      analysis.primaryAngle = elbowAngle;
      analysis.primaryAnglePoint = { x: el.x * w, y: el.y * h };

      if (elbowAngle < 65) {
        analysis.color = '#22c55e';
        if (state.currentStage === 'down') {
          state.currentStage = 'up';
          updateFeedback('correct', '✓ Peak Bicep Squeeze!', 'Lower dumbbells with control.', `${elbowAngle}°`);
        }
      } else if (elbowAngle > 140) {
        analysis.color = '#22c55e';
        if (state.currentStage === 'up') {
          state.currentStage = 'down';
          recordRepSuccess();
          updateFeedback('correct', '✓ Full Rep Extended!', 'Prepare next curl.', `${elbowAngle}°`);
        } else {
          updateFeedback('info', '✦ Ready to Curl', 'Curl weights up toward shoulders.', `${elbowAngle}°`);
        }
      } else {
        analysis.color = '#eab308';
        updateFeedback('warning', '⚡ Curling Up...', 'Pin elbows firmly against ribs.', `${elbowAngle}°`);
      }
    }
    // SHOULDER PRESS & LATERAL RAISES
    else if (['db-shoulder-press', 'db-lateral-raises', 'db-front-raises', 'db-overhead-ext'].includes(exKey)) {
      const armAngle = calculateAngle(hp, sh, el);
      analysis.primaryAngle = armAngle;
      analysis.primaryAnglePoint = { x: sh.x * w, y: sh.y * h };

      if (armAngle > 140) {
        analysis.color = '#22c55e';
        if (state.currentStage === 'down') {
          state.currentStage = 'up';
          updateFeedback('correct', '✓ Overhead Lockout!', 'Lower dumbbells under control.', `${armAngle}°`);
        }
      } else if (armAngle < 85) {
        analysis.color = '#22c55e';
        if (state.currentStage === 'up') {
          state.currentStage = 'down';
          recordRepSuccess();
          updateFeedback('correct', '✓ Shoulder Rep Done!', 'Drive upward with power.', `${armAngle}°`);
        } else {
          updateFeedback('info', '✦ Press Overhead', 'Drive dumbbells toward ceiling.', `${armAngle}°`);
        }
      } else {
        analysis.color = '#eab308';
        updateFeedback('warning', '⚡ Pressing...', 'Maintain core tightness.', `${armAngle}°`);
      }
    }
    // RDL & BENT-OVER ROWS
    else if (['db-rdl', 'db-bent-over-rows'].includes(exKey)) {
      const hipAngle = calculateAngle(sh, hp, kn);
      analysis.primaryAngle = hipAngle;
      analysis.primaryAnglePoint = { x: hp.x * w, y: hp.y * h };

      if (hipAngle < 125) {
        analysis.color = '#22c55e';
        if (state.currentStage === 'up') {
          state.currentStage = 'down';
          updateFeedback('correct', '✓ Deep Hip Hinge!', 'Squeeze glutes and stand tall.', `${hipAngle}°`);
        }
      } else if (hipAngle > 160) {
        analysis.color = '#22c55e';
        if (state.currentStage === 'down') {
          state.currentStage = 'up';
          recordRepSuccess();
          updateFeedback('correct', '✓ Perfect Hinge Rep!', 'Keep back straight on next rep.', `${hipAngle}°`);
        } else {
          updateFeedback('info', '✦ Hinge Hips Back', 'Push glutes back with neutral spine.', `${hipAngle}°`);
        }
      }
    }
    // JUMPING JACKS & CARDIO
    else if (['jumping-jacks', 'shadow-boxing', 'high-knees', 'butt-kicks', 'burpees'].includes(exKey)) {
      const armAngle = calculateAngle(hp, sh, wr);
      analysis.primaryAngle = armAngle;
      analysis.primaryAnglePoint = { x: sh.x * w, y: sh.y * h };

      if (armAngle > 140) {
        analysis.color = '#22c55e';
        if (state.currentStage === 'down') {
          state.currentStage = 'up';
          updateFeedback('correct', '✓ Overhead Reach!', 'Bounce back in cadence.', `${armAngle}°`);
        }
      } else if (armAngle < 50) {
        analysis.color = '#22c55e';
        if (state.currentStage === 'up') {
          state.currentStage = 'down';
          recordRepSuccess();
          updateFeedback('correct', '✓ Cardio Rep Complete!', 'Keep rhythm strong!', `${armAngle}°`);
        } else {
          updateFeedback('info', '✦ Start Cardio', 'Jump feet wide and clap overhead.', `${armAngle}°`);
        }
      }
    }
    // PLANKS & CORE HOLDS
    else if (['planks', 'side-plank', 'superman'].includes(exKey)) {
      const spineAngle = calculateAngle(sh, hp, an);
      analysis.primaryAngle = spineAngle;
      analysis.primaryAnglePoint = { x: hp.x * w, y: hp.y * h };

      if (spineAngle >= 160 && spineAngle <= 195) {
        analysis.color = '#22c55e';
        state.correctFrames++;
        updateFeedback('correct', '✓ Perfect Plank Line', 'Core engaged! Straight 180° line.', `${spineAngle}°`);
        recordHoldProgress();
      } else {
        analysis.color = '#ef4444';
        updateFeedback('wrong', '✕ Straighten Back', 'Do not let hips sag or pike up!', `${spineAngle}°`);
      }
    }
    // DEFAULT REPETITION TRACKER
    else {
      const genericAngle = calculateAngle(hp, kn, an);
      analysis.primaryAngle = genericAngle;
      analysis.primaryAnglePoint = { x: kn.x * w, y: kn.y * h };

      if (genericAngle < 105) {
        if (state.currentStage === 'up') state.currentStage = 'down';
      } else if (genericAngle > 155 && state.currentStage === 'down') {
        state.currentStage = 'up';
        recordRepSuccess();
      }
    }

    // Dynamic Accuracy score calculate
    if (analysis.color === '#22c55e') state.correctFrames++;
    if (state.totalFramesAnalyzed > 10) {
      state.formScore = Math.max(70, Math.min(100, Math.round((state.correctFrames / state.totalFramesAnalyzed) * 100)));
      if (formScoreEl) formScoreEl.textContent = `${state.formScore}%`;
      const fillEl = document.getElementById('accuracy-bar-fill');
      if (fillEl) fillEl.style.width = `${state.formScore}%`;
    }

    return analysis;
  }

  function recordHoldProgress() {
    if (!state.holdTimer) {
      state.holdTimer = setInterval(() => {
        if (state.cameraRunning) {
          state.holdSeconds++;
          if (state.holdSeconds % 5 === 0) {
            state.repCount = Math.floor(state.holdSeconds / 5);
            state.validReps = state.repCount;
            updateCounters();
            speakCoach(`${state.holdSeconds} seconds hold! Keep pushing!`, true);
            playBeep(1100, 'sine', 0.2);
          }
        }
      }, 1000);
    }
  }

  // =========================================================
  // 🎊 CONFETTI CELEBRATION ENGINE
  // =========================================================
  let confettiParticles = [];
  function triggerConfetti() {
    if (!confettiCanvasEl || !confettiCtx) return;
    confettiCanvasEl.width = confettiCanvasEl.clientWidth || 640;
    confettiCanvasEl.height = confettiCanvasEl.clientHeight || 480;

    const colors = ['#d4ff00', '#00f0ff', '#22c55e', '#f59e0b', '#ec4899', '#ffffff'];
    for (let i = 0; i < 65; i++) {
      confettiParticles.push({
        x: confettiCanvasEl.width / 2,
        y: confettiCanvasEl.height / 2,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.8) * 14,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 12,
        alpha: 1.0
      });
    }
  }

  function updateAndDrawConfetti() {
    if (!confettiCtx || confettiParticles.length === 0) return;
    confettiCtx.clearRect(0, 0, confettiCanvasEl.width, confettiCanvasEl.height);

    confettiParticles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35;
      p.rotation += p.vr;
      p.alpha -= 0.015;

      confettiCtx.save();
      confettiCtx.globalAlpha = Math.max(0, p.alpha);
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate((p.rotation * Math.PI) / 180);
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      confettiCtx.restore();
    });

    confettiParticles = confettiParticles.filter(p => p.alpha > 0);
  }

  // =========================================================
  // 👻 HOLOGRAPHIC GHOST SILHOUETTE ALIGNMENT GUIDE
  // =========================================================
  function renderGhostSilhouette() {
    if (!ghostCanvasEl || !ghostCtx || !state.ghostEnabled) return;
    const w = ghostCanvasEl.width;
    const h = ghostCanvasEl.height;
    ghostCtx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2 + 30;

    ghostCtx.save();
    ghostCtx.lineWidth = 3;
    ghostCtx.setLineDash([8, 8]);
    ghostCtx.strokeStyle = 'rgba(0, 240, 255, 0.28)';
    ghostCtx.shadowColor = '#00f0ff';
    ghostCtx.shadowBlur = 10;

    // Ghost Head
    ghostCtx.beginPath();
    ghostCtx.arc(cx, cy - 140, 22, 0, Math.PI * 2);
    ghostCtx.stroke();

    // Ghost Spine & Torso
    ghostCtx.beginPath();
    ghostCtx.moveTo(cx, cy - 118);
    ghostCtx.lineTo(cx, cy - 10);
    ghostCtx.stroke();

    // Ghost Shoulders & Arms
    ghostCtx.beginPath();
    ghostCtx.moveTo(cx - 45, cy - 90);
    ghostCtx.lineTo(cx + 45, cy - 90);
    ghostCtx.lineTo(cx + 60, cy - 30);
    ghostCtx.moveTo(cx - 45, cy - 90);
    ghostCtx.lineTo(cx - 60, cy - 30);
    ghostCtx.stroke();

    // Ghost Legs
    ghostCtx.beginPath();
    ghostCtx.moveTo(cx, cy - 10);
    ghostCtx.lineTo(cx - 35, cy + 70);
    ghostCtx.lineTo(cx - 35, cy + 140);
    ghostCtx.moveTo(cx, cy - 10);
    ghostCtx.lineTo(cx + 35, cy + 70);
    ghostCtx.lineTo(cx + 35, cy + 140);
    ghostCtx.stroke();

    ghostCtx.restore();
  }

  // =========================================================
  // 🎥 DUMMY VIDEO / BIOMECHANICAL ANIMATION DEMO ENGINE
  // =========================================================
  function startDemoAnimationLoop() {
    function animate() {
      if (demoCanvasEl && demoCtx && state.demoPlaying) {
        renderDemoFrame();
      }
      updateAndDrawConfetti();
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }

  function renderDemoFrame() {
    const w = demoCanvasEl.width;
    const h = demoCanvasEl.height;
    demoCtx.clearRect(0, 0, w, h);

    const ex = EXERCISES[state.selectedExercise] || EXERCISES.squats;
    const demoType = ex.demoType || 'squat';

    const now = Date.now();
    const period = 2600 / state.demoSpeed;
    const cycle = ((now % period) / period) * Math.PI * 2;
    const progress = (1 - Math.cos(cycle)) / 2;
    const isDescent = Math.sin(cycle) > 0;

    if (demoPhaseText) {
      if (['plank', 'side-plank', 'wall-sit', 'superman'].includes(demoType)) {
        demoPhaseText.textContent = 'Phase: Isometric Hold (Engaged)';
      } else {
        demoPhaseText.textContent = isDescent ? 'Phase: ⬇️ Eccentric (Lowering)' : 'Phase: ⬆️ Concentric (Driving Up)';
      }
    }

    demoCtx.save();
    demoCtx.lineWidth = 4;
    demoCtx.lineCap = 'round';
    demoCtx.lineJoin = 'round';
    demoCtx.strokeStyle = '#22c55e';
    demoCtx.shadowColor = '#22c55e';
    demoCtx.shadowBlur = 12;

    // Floor Reference
    demoCtx.save();
    demoCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    demoCtx.lineWidth = 1;
    demoCtx.setLineDash([4, 4]);
    demoCtx.beginPath();
    demoCtx.moveTo(20, h - 22);
    demoCtx.lineTo(w - 20, h - 22);
    demoCtx.stroke();
    demoCtx.restore();

    switch (demoType) {
      case 'squat': renderSquatDemo(w, h, progress); break;
      case 'pushup': renderPushupDemo(w, h, progress); break;
      case 'pike-pushup': renderPikeDemo(w, h, progress); break;
      case 'lunge': renderLungeDemo(w, h, progress); break;
      case 'plank': renderPlankDemo(w, h); break;
      case 'side-plank': renderSidePlankDemo(w, h); break;
      case 'glute-bridge': renderBridgeDemo(w, h, progress); break;
      case 'tricep-dip': renderDipDemo(w, h, progress); break;
      case 'wall-sit': renderWallSitDemo(w, h); break;
      case 'burpee': renderBurpeeDemo(w, h, progress); break;
      case 'mountain-climber': renderMountainClimberDemo(w, h, progress); break;
      case 'crunch': renderCrunchDemo(w, h, progress); break;
      case 'leg-raise': renderLegRaiseDemo(w, h, progress); break;
      case 'calf-raise': renderCalfRaiseDemo(w, h, progress); break;
      case 'superman': renderSupermanDemo(w, h, progress); break;
      case 'shoulder-press': renderShoulderPressDemo(w, h, progress); break;
      case 'lateral-raise': renderLateralRaiseDemo(w, h, progress); break;
      case 'bicep-curl': renderBicepCurlDemo(w, h, progress); break;
      case 'rdl': renderRDLDemo(w, h, progress); break;
      case 'row': renderRowDemo(w, h, progress); break;
      case 'jumping-jacks': renderJumpingJacksDemo(w, h, progress); break;
      case 'high-knees': renderHighKneesDemo(w, h, progress); break;
      case 'butt-kicks': renderButtKicksDemo(w, h, progress); break;
      case 'shadow-boxing': renderBoxingDemo(w, h, progress); break;
      default: renderSquatDemo(w, h, progress);
    }

    demoCtx.restore();
  }

  function drawMannequinBones(pts) {
    demoCtx.beginPath();
    pts.forEach((p, idx) => {
      if (idx === 0) demoCtx.moveTo(p.x, p.y);
      else demoCtx.lineTo(p.x, p.y);
    });
    demoCtx.stroke();

    pts.forEach(p => {
      demoCtx.beginPath();
      demoCtx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      demoCtx.fillStyle = '#ffffff';
      demoCtx.fill();
      demoCtx.strokeStyle = '#22c55e';
      demoCtx.lineWidth = 2;
      demoCtx.stroke();
    });
  }

  function drawHead(x, y, r = 10) {
    demoCtx.beginPath();
    demoCtx.arc(x, y, r, 0, Math.PI * 2);
    demoCtx.fillStyle = 'rgba(212, 255, 0, 0.18)';
    demoCtx.fill();
    demoCtx.strokeStyle = '#22c55e';
    demoCtx.lineWidth = 3;
    demoCtx.stroke();
  }

  function drawAngleTag(x, y, txt) {
    demoCtx.save();
    demoCtx.font = 'bold 11px Outfit, sans-serif';
    demoCtx.fillStyle = '#080b0f';
    demoCtx.fillRect(x - 18, y - 10, 36, 18);
    demoCtx.strokeStyle = '#22c55e';
    demoCtx.lineWidth = 1.5;
    demoCtx.strokeRect(x - 18, y - 10, 36, 18);
    demoCtx.fillStyle = '#22c55e';
    demoCtx.textAlign = 'center';
    demoCtx.fillText(txt, x, y + 3);
    demoCtx.restore();
  }

  function renderSquatDemo(w, h, p) {
    const cx = w / 2;
    const floorY = h - 22;
    const hipY = floorY - 80 + p * 40;
    const hipX = cx - p * 22;
    const headY = hipY - 60 + p * 12;
    const kneeY = floorY - 45 + p * 10;
    const kneeX = cx + 18 - p * 6;
    const ankle = { x: cx, y: floorY };
    const knee = { x: kneeX, y: kneeY };
    const hip = { x: hipX, y: hipY };
    const shoulder = { x: hipX + 15, y: headY + 16 };

    drawHead(shoulder.x + 4, headY);
    drawMannequinBones([shoulder, hip, knee, ankle]);
    drawMannequinBones([shoulder, { x: shoulder.x + 35, y: shoulder.y + 10 }]);
    drawAngleTag(knee.x + 22, knee.y, `${Math.round(170 - p * 80)}°`);
  }

  function renderPushupDemo(w, h, p) {
    const floorY = h - 35;
    const toe = { x: 70, y: floorY };
    const dip = p * 30;
    const hip = { x: 140, y: floorY - 26 + dip };
    const shoulder = { x: 220, y: floorY - 38 + dip };
    const wrist = { x: 220, y: floorY };
    const elbow = { x: 200 + p * 12, y: floorY - 18 + dip * 0.5 };

    drawHead(shoulder.x + 16, shoulder.y - 4);
    drawMannequinBones([toe, hip, shoulder]);
    drawMannequinBones([shoulder, elbow, wrist]);
    drawAngleTag(elbow.x - 20, elbow.y, `${Math.round(160 - p * 70)}°`);
  }

  function renderPikeDemo(w, h, p) {
    const floorY = h - 30;
    const feet = { x: 90, y: floorY };
    const hip = { x: 170, y: floorY - 85 };
    const dip = p * 24;
    const shoulder = { x: 220 + p * 10, y: floorY - 48 + dip };
    const head = { x: 236 + p * 14, y: floorY - 26 + dip };
    const wrist = { x: 240, y: floorY };

    drawHead(head.x, head.y);
    drawMannequinBones([feet, hip, shoulder, wrist]);
    drawAngleTag(hip.x, hip.y - 12, '80° Pike');
  }

  function renderLungeDemo(w, h, p) {
    const floorY = h - 22;
    const frontAnkle = { x: 220, y: floorY };
    const frontKnee = { x: 220, y: floorY - 45 + p * 20 };
    const hip = { x: 165, y: floorY - 80 + p * 35 };
    const backKnee = { x: 120, y: floorY - 40 + p * 35 };
    const backToe = { x: 90, y: floorY };
    const shoulder = { x: 165, y: hip.y - 50 };

    drawHead(shoulder.x, shoulder.y - 14);
    drawMannequinBones([frontAnkle, frontKnee, hip, backKnee, backToe]);
    drawMannequinBones([shoulder, hip]);
    drawAngleTag(frontKnee.x + 24, frontKnee.y, `${Math.round(160 - p * 70)}°`);
  }

  function renderPlankDemo(w, h) {
    const floorY = h - 35;
    const toe = { x: 70, y: floorY };
    const hip = { x: 160, y: floorY - 24 };
    const shoulder = { x: 240, y: floorY - 32 };
    const elbow = { x: 240, y: floorY };

    drawHead(shoulder.x + 16, shoulder.y - 2);
    drawMannequinBones([toe, hip, shoulder, elbow]);
    drawAngleTag(hip.x, hip.y - 14, '180° Flat');
  }

  function renderSidePlankDemo(w, h) {
    const floorY = h - 35;
    const ankle = { x: 75, y: floorY };
    const hip = { x: 160, y: floorY - 35 };
    const shoulder = { x: 235, y: floorY - 48 };
    const elbow = { x: 235, y: floorY };
    const topHand = { x: 220, y: shoulder.y - 30 };

    drawHead(shoulder.x + 14, shoulder.y - 10);
    drawMannequinBones([ankle, hip, shoulder, elbow]);
    drawMannequinBones([shoulder, topHand]);
    drawAngleTag(hip.x, hip.y - 14, '180°');
  }

  function renderBridgeDemo(w, h, p) {
    const floorY = h - 35;
    const head = { x: 80, y: floorY - 6 };
    const shoulder = { x: 100, y: floorY - 10 };
    const lift = p * 40;
    const hip = { x: 170, y: floorY - 10 - lift };
    const knee = { x: 230, y: floorY - 35 - lift * 0.3 };
    const heel = { x: 245, y: floorY };

    drawHead(head.x, head.y);
    drawMannequinBones([shoulder, hip, knee, heel]);
    drawAngleTag(hip.x, hip.y - 14, `${Math.round(120 + p * 60)}°`);
  }

  function renderDipDemo(w, h, p) {
    const floorY = h - 22;
    const feet = { x: 230, y: floorY };
    const dip = p * 32;
    const hip = { x: 155, y: floorY - 60 + dip };
    const shoulder = { x: 155, y: hip.y - 45 };
    const bench = { x: 110, y: floorY - 45 };
    const elbow = { x: 125, y: shoulder.y + dip * 0.6 };

    drawHead(shoulder.x, shoulder.y - 14);
    drawMannequinBones([feet, { x: 195, y: floorY - 40 }, hip, shoulder]);
    drawMannequinBones([shoulder, elbow, bench]);
    drawAngleTag(elbow.x - 22, elbow.y, `${Math.round(160 - p * 70)}°`);
  }

  function renderWallSitDemo(w, h) {
    const floorY = h - 22;
    const wallX = 120;
    const ankle = { x: 215, y: floorY };
    const knee = { x: 215, y: floorY - 50 };
    const hip = { x: wallX, y: floorY - 50 };
    const shoulder = { x: wallX, y: hip.y - 55 };

    drawHead(shoulder.x + 2, shoulder.y - 14);
    drawMannequinBones([shoulder, hip, knee, ankle]);
    drawAngleTag(knee.x + 22, knee.y, '90° Parallel');
  }

  function renderBurpeeDemo(w, h, p) {
    if (p < 0.5) {
      renderPushupDemo(w, h, p * 2);
    } else {
      const jumpP = (p - 0.5) * 2;
      const cx = w / 2;
      const floorY = h - 22;
      const jumpY = jumpP * 30;
      const feet = { x: cx, y: floorY - jumpY };
      const hip = { x: cx, y: floorY - 65 - jumpY };
      const shoulder = { x: cx, y: hip.y - 50 };
      const hand = { x: cx + 18, y: shoulder.y - 35 };

      drawHead(shoulder.x, shoulder.y - 14);
      drawMannequinBones([feet, hip, shoulder, hand]);
      drawAngleTag(shoulder.x + 28, shoulder.y - 10, 'Jump 180°');
    }
  }

  function renderMountainClimberDemo(w, h, p) {
    const floorY = h - 35;
    const backToe = { x: 70, y: floorY };
    const frontToe = { x: 70 + p * 60, y: floorY - p * 15 };
    const frontKnee = { x: 130 + p * 30, y: floorY - 30 };
    const hip = { x: 160, y: floorY - 25 };
    const shoulder = { x: 240, y: floorY - 35 };
    const wrist = { x: 240, y: floorY };

    drawHead(shoulder.x + 16, shoulder.y - 2);
    drawMannequinBones([backToe, hip, shoulder, wrist]);
    drawMannequinBones([hip, frontKnee, frontToe]);
    drawAngleTag(frontKnee.x, frontKnee.y - 12, 'Sprint Drive');
  }

  function renderCrunchDemo(w, h, p) {
    const floorY = h - 30;
    const hip = { x: 150, y: floorY - 10 };
    const knee = { x: 215, y: floorY - 45 };
    const feet = { x: 240, y: floorY };
    const curl = p * 28;
    const shoulder = { x: 100 + p * 15, y: floorY - 12 - curl };
    const head = { x: 75 + p * 18, y: floorY - 18 - curl };

    drawHead(head.x, head.y);
    drawMannequinBones([feet, knee, hip, shoulder]);
    drawAngleTag(shoulder.x, shoulder.y - 14, `${Math.round(160 - p * 40)}°`);
  }

  function renderLegRaiseDemo(w, h, p) {
    const floorY = h - 30;
    const head = { x: 80, y: floorY - 10 };
    const shoulder = { x: 110, y: floorY - 10 };
    const hip = { x: 165, y: floorY - 10 };
    const angleRad = (p * 85 * Math.PI) / 180;
    const legLen = 80;
    const feet = { x: hip.x + Math.cos(angleRad) * legLen, y: hip.y - Math.sin(angleRad) * legLen };

    drawHead(head.x, head.y);
    drawMannequinBones([head, shoulder, hip, feet]);
    drawAngleTag(hip.x + 15, hip.y - 25, `${Math.round(180 - p * 90)}°`);
  }

  function renderCalfRaiseDemo(w, h, p) {
    const cx = w / 2;
    const floorY = h - 22;
    const lift = p * 20;
    const toe = { x: cx, y: floorY };
    const ankle = { x: cx, y: floorY - 15 - lift };
    const knee = { x: cx, y: floorY - 65 - lift };
    const hip = { x: cx, y: floorY - 110 - lift };
    const shoulder = { x: cx, y: hip.y - 45 };

    drawHead(shoulder.x, shoulder.y - 14);
    drawMannequinBones([toe, ankle, knee, hip, shoulder]);
    drawAngleTag(ankle.x + 24, ankle.y, `${Math.round(155 + p * 25)}°`);
  }

  function renderSupermanDemo(w, h, p) {
    const floorY = h - 30;
    const hip = { x: 170, y: floorY - 6 };
    const arch = p * 22;
    const shoulder = { x: 115, y: floorY - 12 - arch };
    const head = { x: 85, y: floorY - 16 - arch };
    const feet = { x: 250, y: floorY - 10 - arch };

    drawHead(head.x, head.y);
    drawMannequinBones([head, shoulder, hip, feet]);
    drawAngleTag(hip.x, hip.y - 18, 'Hyper Extension');
  }

  function renderShoulderPressDemo(w, h, p) {
    const cx = w / 2;
    const floorY = h - 22;
    const hip = { x: cx, y: floorY - 75 };
    const shoulder = { x: cx, y: hip.y - 45 };
    const pressY = shoulder.y - 15 - p * 38;
    const lElbow = { x: cx - 28, y: shoulder.y + 12 - p * 25 };
    const rElbow = { x: cx + 28, y: shoulder.y + 12 - p * 25 };
    const lHand = { x: cx - 28, y: pressY };
    const rHand = { x: cx + 28, y: pressY };

    drawHead(shoulder.x, shoulder.y - 14);
    drawMannequinBones([{ x: cx, y: floorY }, hip, shoulder]);
    drawMannequinBones([shoulder, lElbow, lHand]);
    drawMannequinBones([shoulder, rElbow, rHand]);
    drawAngleTag(rElbow.x + 24, rElbow.y, `${Math.round(90 + p * 80)}°`);
  }

  function renderLateralRaiseDemo(w, h, p) {
    const cx = w / 2;
    const floorY = h - 22;
    const hip = { x: cx, y: floorY - 75 };
    const shoulder = { x: cx, y: hip.y - 45 };
    const rad = (p * 85 * Math.PI) / 180;
    const armLen = 45;
    const lHand = { x: shoulder.x - Math.sin(rad) * armLen, y: shoulder.y + Math.cos(rad) * armLen };
    const rHand = { x: shoulder.x + Math.sin(rad) * armLen, y: shoulder.y + Math.cos(rad) * armLen };

    drawHead(shoulder.x, shoulder.y - 14);
    drawMannequinBones([{ x: cx, y: floorY }, hip, shoulder]);
    drawMannequinBones([shoulder, lHand]);
    drawMannequinBones([shoulder, rHand]);
    drawAngleTag(rHand.x + 18, rHand.y, `${Math.round(20 + p * 70)}°`);
  }

  function renderBicepCurlDemo(w, h, p) {
    const cx = w / 2;
    const floorY = h - 22;
    const hip = { x: cx, y: floorY - 75 };
    const shoulder = { x: cx, y: hip.y - 45 };
    const elbow = { x: cx + 16, y: shoulder.y + 26 };
    const curlRad = ((160 - p * 120) * Math.PI) / 180;
    const wrist = { x: elbow.x + Math.sin(curlRad) * 28, y: elbow.y + Math.cos(curlRad) * 28 };

    drawHead(shoulder.x, shoulder.y - 14);
    drawMannequinBones([{ x: cx, y: floorY }, hip, shoulder, elbow, wrist]);
    drawAngleTag(elbow.x + 22, elbow.y, `${Math.round(160 - p * 120)}°`);
  }

  function renderRDLDemo(w, h, p) {
    const cx = w / 2 + 10;
    const floorY = h - 22;
    const ankle = { x: cx, y: floorY };
    const knee = { x: cx - 4, y: floorY - 45 };
    const hinge = p * 40;
    const hip = { x: cx - 18 - p * 18, y: floorY - 80 + hinge * 0.2 };
    const shoulder = { x: hip.x + 35 - hinge * 0.3, y: hip.y - 45 + hinge * 0.9 };
    const hand = { x: knee.x + 12, y: knee.y + p * 20 };

    drawHead(shoulder.x + 8, shoulder.y - 10);
    drawMannequinBones([ankle, knee, hip, shoulder, hand]);
    drawAngleTag(hip.x - 22, hip.y, `${Math.round(170 - p * 80)}° Hinge`);
  }

  function renderRowDemo(w, h, p) {
    const cx = w / 2 + 10;
    const floorY = h - 22;
    const ankle = { x: cx, y: floorY };
    const knee = { x: cx - 6, y: floorY - 45 };
    const hip = { x: cx - 24, y: floorY - 75 };
    const shoulder = { x: hip.x + 35, y: hip.y - 25 };
    const rowY = shoulder.y + 35 - p * 30;
    const elbow = { x: shoulder.x - 10, y: rowY };
    const hand = { x: shoulder.x + 10, y: rowY + 12 };

    drawHead(shoulder.x + 10, shoulder.y - 10);
    drawMannequinBones([ankle, knee, hip, shoulder, elbow, hand]);
    drawAngleTag(elbow.x - 20, elbow.y, `${Math.round(150 - p * 70)}°`);
  }

  function renderJumpingJacksDemo(w, h, p) {
    const cx = w / 2;
    const floorY = h - 22;
    const hip = { x: cx, y: floorY - 75 + p * 6 };
    const shoulder = { x: cx, y: hip.y - 45 };
    const legSpread = p * 32;
    const lFoot = { x: cx - legSpread, y: floorY };
    const rFoot = { x: cx + legSpread, y: floorY };
    const armRad = ((30 + p * 130) * Math.PI) / 180;
    const lHand = { x: shoulder.x - Math.sin(armRad) * 40, y: shoulder.y + Math.cos(armRad) * 40 };
    const rHand = { x: shoulder.x + Math.sin(armRad) * 40, y: shoulder.y + Math.cos(armRad) * 40 };

    drawHead(shoulder.x, shoulder.y - 14);
    drawMannequinBones([lFoot, hip, rFoot]);
    drawMannequinBones([hip, shoulder]);
    drawMannequinBones([lHand, shoulder, rHand]);
    drawAngleTag(shoulder.x + 28, shoulder.y - 10, `${Math.round(30 + p * 130)}°`);
  }

  function renderHighKneesDemo(w, h, p) {
    const cx = w / 2;
    const floorY = h - 22;
    const hip = { x: cx, y: floorY - 75 };
    const shoulder = { x: cx, y: hip.y - 45 };
    const rKneeY = floorY - 45 - p * 35;
    const rFoot = { x: cx + 18, y: rKneeY + 30 };

    drawHead(shoulder.x, shoulder.y - 14);
    drawMannequinBones([{ x: cx - 12, y: floorY }, hip, { x: cx + 18, y: rKneeY }, rFoot]);
    drawMannequinBones([hip, shoulder]);
    drawAngleTag(cx + 26, rKneeY, '90° Knee');
  }

  function renderButtKicksDemo(w, h, p) {
    const cx = w / 2;
    const floorY = h - 22;
    const hip = { x: cx, y: floorY - 75 };
    const shoulder = { x: cx, y: hip.y - 45 };
    const rHeelY = hip.y + 10 + (1 - p) * 45;
    const rHeel = { x: cx - 18, y: rHeelY };

    drawHead(shoulder.x, shoulder.y - 14);
    drawMannequinBones([{ x: cx + 12, y: floorY }, hip, { x: cx + 4, y: floorY - 45 }, rHeel]);
    drawMannequinBones([hip, shoulder]);
    drawAngleTag(cx - 26, rHeelY, 'Glute Flex');
  }

  function renderBoxingDemo(w, h, p) {
    const cx = w / 2 - 20;
    const floorY = h - 22;
    const hip = { x: cx, y: floorY - 75 };
    const shoulder = { x: cx, y: hip.y - 45 };
    const punchX = shoulder.x + 25 + p * 45;
    const rWrist = { x: punchX, y: shoulder.y };

    drawHead(shoulder.x, shoulder.y - 14);
    drawMannequinBones([{ x: cx - 15, y: floorY }, hip, { x: cx + 15, y: floorY }]);
    drawMannequinBones([hip, shoulder, rWrist]);
    drawAngleTag(rWrist.x, rWrist.y - 12, '160° Snap');
  }

  // =========================================================
  // SKELETON RENDERER WITH GREEN / RED LINES & REAL-TIME ANGLES
  // =========================================================
  function drawSkeleton(landmarks, w, h, analysis) {
    const lineColor = analysis.color || '#22c55e';

    const connections = [
      [11, 12],
      [11, 13], [13, 15],
      [12, 14], [14, 16],
      [11, 23], [12, 24],
      [23, 24],
      [23, 25], [25, 27],
      [24, 26], [26, 28],
      [27, 29], [28, 30]
    ];

    ctx.save();
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = lineColor;
    ctx.shadowColor = lineColor;
    ctx.shadowBlur = 14;

    connections.forEach(([i, j]) => {
      const p1 = landmarks[i];
      const p2 = landmarks[j];
      if (p1 && p2 && (p1.visibility || 0) > 0.35 && (p2.visibility || 0) > 0.35) {
        ctx.beginPath();
        ctx.moveTo(p1.x * w, p1.y * h);
        ctx.lineTo(p2.x * w, p2.y * h);
        ctx.stroke();
      }
    });

    landmarks.forEach((p, idx) => {
      if ((p.visibility || 0) > 0.4 && [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].includes(idx)) {
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, 7, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    });

    if (analysis.primaryAngle && analysis.primaryAnglePoint) {
      const pt = analysis.primaryAnglePoint;
      ctx.restore();
      ctx.save();
      ctx.font = 'bold 16px Outfit, sans-serif';
      ctx.fillStyle = '#080b0f';
      ctx.fillRect(pt.x + 12, pt.y - 24, 60, 26);
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(pt.x + 12, pt.y - 24, 60, 26);

      ctx.fillStyle = lineColor;
      ctx.fillText(`${analysis.primaryAngle}°`, pt.x + 20, pt.y - 6);
    }

    ctx.restore();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
