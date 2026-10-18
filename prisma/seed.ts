import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const CANONICAL_SOAP_CONTENT = {
  hpi: `John Smith, a 65-year-old male with a history of coronary artery disease, hypertension, and dyslipidemia, presents for routine follow-up. He reports feeling generally well since his last visit 6 months ago. He denies chest pain, palpitations, syncope, or dyspnea with his usual activities. He occasionally experiences mild shortness of breath when climbing more than one flight of stairs, which has been unchanged for several years.

The patient reports good medication adherence and has been monitoring his blood pressure at home with readings averaging 130s/80s. He walks 30 minutes daily for exercise and follows a low-sodium diet. He reports no issues with his weekly Ozempic injections and has been administering them as prescribed.

Medical History
- Hypertension (diagnosed 2015)
- Dyslipidemia (diagnosed 2015)
- Type 2 diabetes mellitus (diagnosed 2018)

Surgical History
- Percutaneous coronary intervention with stent placement to LAD (2020)
- Appendectomy (1985)

Medications and Supplements
- Aspirin 81 mg PO daily
- Atorvastatin 40 mg PO daily
- Lisinopril 20 mg PO daily
- Metoprolol succinate 25 mg PO twice daily
- Metformin 1000 mg PO twice daily
- Semaglutide (Ozempic) 1 mg SC once weekly

Allergies
- Penicillin (rash)

Family History
- Father: MI at age 60, deceased at 72
- Mother: Hypertension, deceased at 80 (stroke)
- Brother: Type 2 diabetes

Social History
- Tobacco: Former smoker, quit in 2019, 30 pack-year history
- Alcohol: Occasional, 1-2 drinks per week
- Exercise: Walks 30 minutes daily
- Diet: Following low-sodium, diabetic diet

Review of Systems
- General: Denies fatigue, fever, weight changes
- Cardiovascular: Mild shortness of breath with significant exertion, denies chest pain, palpitations, orthopnea, PND, syncope, edema
- Respiratory: Denies cough, wheezing
- Gastrointestinal: Denies abdominal pain, nausea, vomiting
- Neurological: Denies dizziness, headaches, focal weakness`,
  objective: `Vital Signs
- Blood Pressure: 132/78 mmHg
- Heart Rate: 68 bpm
- Respiratory Rate: 16/min
- Weight: 185 lbs (84 kg)
- BMI: 28.3

Physical Examination
- General: Well-appearing male in no apparent distress
- HEENT: Normocephalic, atraumatic. No carotid bruits
- Cardiovascular: Regular rate and rhythm. Normal S1, S2. No murmurs, gallops, or rubs. No JVD
- Respiratory: Clear to auscultation bilaterally. No wheezes, rales, or rhonchi
- Abdomen: Soft, non-tender, non-distended. No hepatosplenomegaly
- Extremities: No edema. Pulses 2+ and equal bilaterally

Laboratory, Imaging, and Diagnostic Test Results
- Date: April 12, 2026
  - Lipid Panel: Total Cholesterol 158 mg/dL, LDL 85 mg/dL, HDL 42 mg/dL, Triglycerides 140 mg/dL
  - HbA1c: 6.9%
  - BMP: Glucose 118 mg/dL, Creatinine 1.0 mg/dL, eGFR 74, Electrolytes WNL
- Date: May 10, 2026
  - EKG: Normal sinus rhythm, rate 65. No ST-T wave changes.`,
  anp: `65-year-old male with coronary artery disease status post PCI with stent to LAD (2020), hypertension, dyslipidemia, and type 2 diabetes mellitus, presenting for routine follow-up.

Coronary Artery Disease
Assessment: Currently asymptomatic with stable exercise tolerance. Recent echocardiogram shows normal regional wall motion without evidence of ischemia and preserved ejection fraction of 55%. Today's EKG shows normal sinus rhythm without ischemic changes. Patient remains adherent to guideline-directed medical therapy.
Plan:
- Continue aspirin 81 mg daily
- Continue atorvastatin 40 mg daily
- Continue metoprolol succinate 25 mg twice daily
- Schedule exercise stress test to assess functional capacity and for surveillance
- Follow up in 6 months with lipid panel and comprehensive metabolic panel prior to visit

Hypertension
Assessment: Blood pressure today is 132/78 mmHg, which is slightly above ADA target of <130/80 mmHg for diabetic patients.
Plan:
- Increase lisinopril to 30 mg daily
- Continue home blood pressure monitoring
- Reinforce sodium restriction and weight management

Dyslipidemia & Type 2 Diabetes Mellitus
Assessment: LDL well-controlled at 85 mg/dL on atorvastatin 40 mg; HbA1c at goal (6.9%) on metformin and weekly semaglutide.
Plan:
- Continue atorvastatin 40 mg daily, metformin 1000 mg BID, and semaglutide 1 mg weekly
- Reassess lipid panel and HbA1c in 6 months`,
  instructions: `Thank you for meeting with me today. Below is a summary of the items we discussed and the next steps in your care plan.

1. Keep taking your daily medicines exactly as prescribed: aspirin 81 mg once a day, atorvastatin 40 mg once a day, metoprolol 25 mg twice a day, metformin 1,000 mg twice a day, and your weekly Ozempic injection. Begin the new lisinopril dose of 30 mg once a day.
2. An exercise stress test has been ordered to check your heart's fitness. Our office will contact you with the appointment details.
3. Continue checking your blood pressure at home and aim for readings below 130 over 80. Bring your log of readings to the next visit.
4. Stay active by walking at least thirty minutes every day and keep following your low-sodium, heart-healthy diet.
5. Schedule your blood work (lipid panel, HbA1c, and comprehensive metabolic panel) one week before your next appointment in six months.

Call our office or go to the emergency room right away if you experience chest pain, severe shortness of breath, palpitations, dizziness, or swelling in your legs.

Best Regards,
Dr. Alex Rivera, MD`,
};

async function main() {
  console.log('Seeding Freed AI Medical Scribe database...');

  const passwordHash = await bcrypt.hash('FreedDemo!2026', 10);
  const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const user = await prisma.user.upsert({
    where: { email: 'dr.alex.rivera@getfreed.ai' },
    update: {},
    create: {
      id: 'user-alex-rivera',
      email: 'dr.alex.rivera@getfreed.ai',
      passwordHash,
      firstName: 'Alex',
      lastName: 'Rivera',
      clinicalTitle: 'MD',
      role: 'admin',
      roleAtPractice: 'Clinical staff',
      specialty: 'Family Medicine',
      specialtyGroup: 'Medicine',
      practiceSize: '2 to 9',
      profileEhrType: 'athenahealth',
      onboardingCompleted: true,
      planTier: 'premier',
      billingCycle: 'monthly',
      trialEndsAt: trialEnd,
      totalSeats: 3,
      retentionDays: 30,
      patientTitle: 'Patient',
      aiDisclosureEnabled: true,
      hideEmptyHeaders: false,
      themeMode: 'light',
    },
  });

  // Clean existing child records for idempotent re-seeding
  await prisma.evidenceMessage.deleteMany({});
  await prisma.visit.deleteMany({ where: { userId: user.id } });
  await prisma.template.deleteMany({});
  await prisma.dotPhrase.deleteMany({ where: { userId: user.id } });
  await prisma.teamMember.deleteMany({ where: { ownerId: user.id } });
  await prisma.billingInvoice.deleteMany({ where: { userId: user.id } });

  // 1. Create User Templates (Learned & Structural)
  const returningTemplate = await prisma.template.create({
    data: {
      id: 'tmpl-returning-patient',
      userId: user.id,
      name: 'Returning Patient',
      description: 'Comprehensive internal/family medicine follow-up note with problem-based Assessment & Plan',
      templateType: 'canonical',
      specialty: 'Family Medicine',
      specialtyGroup: 'Medicine',
      source: 'User',
      isFavorite: true,
      isDefault: true,
      autoLearnEnabled: true,
      contentJson: JSON.stringify(CANONICAL_SOAP_CONTENT),
    },
  });

  await prisma.template.create({
    data: {
      id: 'tmpl-new-patient',
      userId: user.id,
      name: 'New Patient',
      description: 'Comprehensive initial intake note with full PMH, PSH, Family/Social Hx, and Review of Systems',
      templateType: 'canonical',
      specialty: 'Family Medicine',
      specialtyGroup: 'Medicine',
      source: 'User',
      isFavorite: true,
      isDefault: false,
      autoLearnEnabled: true,
      contentJson: JSON.stringify(CANONICAL_SOAP_CONTENT),
    },
  });

  const structuralSections = {
    hpi: [
      { type: 'chief_complaints', header: 'Chief Complaint', format: 'paragraph', enabled: true, showHeader: true },
      { type: 'history_of_present_illness', header: 'History of Present Illness', format: 'paragraph', enabled: true, showHeader: true },
      { type: 'medical_history', header: 'Medical History', format: 'list', enabled: true, showHeader: true },
      { type: 'current_past_medications_and_supplements', header: 'Medications and Supplements', format: 'list', enabled: true, showHeader: true },
      { type: 'allergies', header: 'Allergies', format: 'list', enabled: true, showHeader: true },
      { type: 'review_of_systems', header: 'Review of Systems', format: 'list', enabled: true, showHeader: true },
    ],
    objective: [
      { type: 'vital_signs', header: 'Vital Signs', format: 'list', enabled: true, showHeader: true },
      { type: 'physical_examination', header: 'Physical Examination', format: 'list', enabled: true, showHeader: true },
      { type: 'laboratory_imaging_and_diagnostic_test_results', header: 'Lab & Diagnostic Results', format: 'list', enabled: true, showHeader: true },
    ],
    anp: [
      {
        type: 'grouped_anp',
        header: 'Problem Based Assessment and Plan',
        format: 'paragraph',
        enabled: true,
        showHeader: false,
        innerSections: [
          { type: 'problem', format: 'paragraph', enabled: true, showHeader: true },
          { type: 'assessment', format: 'paragraph', enabled: true, showHeader: true },
          { type: 'plan', format: 'list', enabled: true, showHeader: true },
        ],
      },
    ],
  };

  await prisma.template.create({
    data: {
      id: 'tmpl-follow-up-structural',
      userId: user.id,
      name: 'Follow-Up Visit (Structured)',
      description: 'Ongoing monitoring and treatment for a returning patient with configurable section blocks.',
      templateType: 'structural',
      specialty: 'Family Medicine',
      specialtyGroup: 'Medicine',
      source: 'User',
      isFavorite: false,
      isDefault: false,
      autoLearnEnabled: false,
      contentJson: JSON.stringify(structuralSections),
    },
  });

  // 2. Freed Specialty Library Templates
  const freedSpecialties = [
    { name: 'Family Medicine Comprehensive SOAP', specialty: 'Family Medicine', group: 'Primary Care', desc: 'Tuned for preventive care, chronic disease management, and acute complaints.' },
    { name: 'Internal Medicine Complex Follow-Up', specialty: 'Internal Medicine', group: 'Medicine', desc: 'Problem-oriented adult medicine template with diagnostic synthesis and MDM justification.' },
    { name: 'Pediatric Well-Child & Acute Check', specialty: 'Pediatrics', group: 'Pediatrics', desc: 'Includes growth milestones, anticipatory guidance, immunization review, and parent instructions.' },
    { name: 'Psychiatry Initial & Med Management', specialty: 'Psychiatry', group: 'Behavioral Health', desc: 'Comprehensive psychiatric ROS, Mental Status Exam (MSE), safety risk assessment, and psychopharmacology plan.' },
    { name: 'Mental Health Counseling DAP / BIRP', specialty: 'Mental Health Counseling', group: 'Behavioral Health', desc: 'Structured therapy progress note with Data, Assessment, Response, and Plan.' },
    { name: 'Cardiology Consultation & Consultative Follow-Up', specialty: 'Cardiology', group: 'Medicine', desc: 'Focused on NYHA class, ischemic workup, echo/EKG interpretation, and GDMT titration.' },
    { name: 'Endocrinology Diabetes & Thyroid Note', specialty: 'Endocrinology', group: 'Medicine', desc: 'CGM/HbA1c trends, insulin/GLP-1 titration, microvascular screening, and thyroid panel review.' },
    { name: 'Gastroenterology Clinic & Endoscopy Eval', specialty: 'Gastroenterology', group: 'Medicine', desc: 'GI symptom characterization, alarm features, colonoscopy/EGD surveillance, and dietary plan.' },
    { name: 'Dermatology Skin Exam & Lesion Biopsy', specialty: 'Dermatology', group: 'Specialty', desc: 'Lesion morphology, anatomical distribution, dermoscopy findings, and biopsy/topical regimen.' },
    { name: 'Obstetrics & Gynecology Prenatal / Annual', specialty: 'Obstetrics and Gynecology', group: 'Surgical', desc: 'GTPAL history, gestational age tracking, fetal heart tones, cervical screening, and counseling.' },
    { name: 'Orthopedic Surgery MSK & Joint Evaluation', specialty: 'Orthopedic Surgery', group: 'Surgical', desc: 'Range of motion, special provocative tests, weight-bearing imaging review, and rehab/surgical plan.' },
    { name: 'Allergy and Immunology Evaluation', specialty: 'Allergy and Immunology', group: 'Medicine', desc: 'Environmental/food triggers, spirometry, skin prick test interpretation, and immunotherapy plan.' },
  ];

  for (const item of freedSpecialties) {
    await prisma.template.create({
      data: {
        name: item.name,
        description: item.desc,
        templateType: 'canonical',
        specialty: item.specialty,
        specialtyGroup: item.group,
        source: 'Freed',
        isFavorite: false,
        isDefault: false,
        autoLearnEnabled: true,
        contentJson: JSON.stringify(CANONICAL_SOAP_CONTENT),
      },
    });
  }

  // 3. Seed Dot-Phrases (`/shortcut`)
  const phrases = [
    {
      shortcut: 'pe',
      content: 'General: Alert, oriented, in no acute distress.\nHEENT: Normocephalic, atraumatic, PERRLA, EOMI.\nCardiovascular: Regular rate and rhythm, normal S1/S2, no murmurs, rubs, or gallops.\nRespiratory: Clear to auscultation bilaterally, no wheezes, rales, or rhonchi.\nAbdomen: Soft, non-tender, non-distended, normal bowel sounds.',
      visibility: 'team',
    },
    {
      shortcut: 'ros',
      content: 'A 10-point Review of Systems was completed and is negative except as documented in the HPI above.',
      visibility: 'team',
    },
    {
      shortcut: 'bp',
      content: 'Reviewed home blood pressure monitoring technique: seated quietly for 5 minutes, feet flat on floor, arm supported at heart level, targeting <130/80 mmHg.',
      visibility: 'personal',
    },
    {
      shortcut: 'warn',
      content: 'Strict return precautions discussed: patient instructed to seek immediate emergency care for chest pain, severe shortness of breath, focal neurologic deficits, high fever, or worsening symptoms.',
      visibility: 'team',
    },
  ];

  for (const p of phrases) {
    await prisma.dotPhrase.create({
      data: {
        userId: user.id,
        shortcut: p.shortcut,
        content: p.content,
        visibility: p.visibility,
      },
    });
  }

  // 4. Seed Demo Visits (John Smith + 2 additional clinical visits)
  const johnCoding = {
    emLevel: {
      code: '99214',
      title: 'Established Patient Office Visit (Moderate MDM, 30-39 min)',
      justification: '2+ stable chronic illnesses (CAD, dyslipidemia, T2DM) + 1 chronic illness with mild exacerbation/inadequate control (Hypertension 132/78 above <130/80 ADA goal requiring lisinopril dose escalation) + independent review of labs/EKG.',
    },
    icd10: [
      { code: 'I25.10', description: 'Atherosclerotic heart disease of native coronary artery without angina pectoris', confidence: '99%', linkedSection: 'Coronary Artery Disease' },
      { code: 'I10', description: 'Essential (primary) hypertension', confidence: '99%', linkedSection: 'Hypertension' },
      { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', confidence: '98%', linkedSection: 'Type 2 Diabetes Mellitus' },
      { code: 'E78.5', description: 'Hyperlipidemia, unspecified', confidence: '97%', linkedSection: 'Dyslipidemia' },
      { code: 'Z95.5', description: 'Presence of coronary angioplasty implant and graft', confidence: '96%', linkedSection: 'Surgical History (PCI to LAD)' },
    ],
    cpt: [
      { code: '99214', description: 'Office/outpatient visit, established patient, moderate complexity', category: 'E/M' },
      { code: '93000', description: 'Electrocardiogram, routine ECG with at least 12 leads; with interpretation and report', category: 'Diagnostic' },
      { code: '3074F', description: 'Most recent systolic blood pressure <130 mmHg (or 3075F 130-139 mmHg)', category: 'Quality / MIPS' },
    ],
    specificityTips: [
      'Specify whether Type 2 Diabetes has any CKD or ophthalmic manifestations (e.g., E11.22 vs E11.9) to strengthen HCC risk adjustment.',
      'Document exact date and vessel of prior coronary stent (LAD, 2020) — already captured in HPI and A&P.',
    ],
  };

  const johnLetters = {
    referral: `Date: October 18, 2026
To: Cardiology Diagnostics & Stress Testing Center
Re: John Smith (65yo Male) — Referral for Surveillance Exercise Stress Test

Dear Cardiology Colleague,

I am referring my patient, Mr. John Smith, a 65-year-old male with a history of coronary artery disease s/p PCI with stent placement to the LAD (2020), hypertension, dyslipidemia, and type 2 diabetes mellitus, for a surveillance exercise treadmill stress test.

He is currently chest-pain free on aspirin 81 mg daily, atorvastatin 40 mg daily, metoprolol succinate 25 mg BID, and lisinopril (titrated today to 30 mg daily). He notes mild baseline exertional dyspnea when climbing more than one flight of stairs. Resting 12-lead ECG shows normal sinus rhythm at 65 bpm without ischemic ST-T changes, and prior TTE demonstrates LVEF 55%.

Please forward the stress test report and any recommendations to our clinic.

Sincerely,
Dr. Alex Rivera, MD
Family Medicine`,
    excuse: `Date: October 18, 2026
To Whom It May Concern:

Please excuse John Smith from work/scheduled activities on October 18, 2026, as he was seen in our medical clinic today for a scheduled medical evaluation and diagnostic testing. He may return to his normal work duties without restriction tomorrow.

Sincerely,
Dr. Alex Rivera, MD`,
    priorAuth: `Date: October 18, 2026
To: Medical Utilization Review / Pharmacy Benefits
Re: Prior Authorization Continuation for Semaglutide (Ozempic) 1 mg SC Weekly
Patient: John Smith | Diagnosis: Type 2 Diabetes Mellitus (E11.9) & Established ASCVD / CAD s/p LAD Stent (I25.10)

Clinical Justification:
1. Patient has established atherosclerotic cardiovascular disease (history of PCI with stent to LAD in 2020) and Type 2 Diabetes Mellitus.
2. Current ADA and ACC/AHA guidelines strongly recommend a GLP-1 receptor agonist with proven cardiovascular benefit (semaglutide) independent of baseline HbA1c.
3. On combination therapy with Metformin 1000 mg BID and Semaglutide 1 mg weekly, patient's HbA1c has improved to 6.9% with zero hypoglycemic episodes and full adherence.

Sincerely,
Dr. Alex Rivera, MD`,
  };

  const johnTranscript = `[00:00] Dr. Alex Rivera: Good morning, John! Good to see you back for your six-month checkup. How have you been feeling overall since our last visit?
[00:10] John Smith: Morning, Dr. Rivera. Honestly, I've been feeling pretty good overall. No chest pain, no racing heart, no fainting or anything like that during my normal routine.
[00:24] Dr. Alex Rivera: How about your breathing when you're walking or climbing stairs?
[00:29] John Smith: I still get a little winded if I climb more than one flight of stairs quickly, but that hasn't changed in years. I'm walking 30 minutes every day in the neighborhood without any trouble.
[00:42] Dr. Alex Rivera: That's great consistency. How have your home blood pressure readings and medications been going?
[00:49] John Smith: I haven't missed any doses—taking the aspirin 81, atorvastatin 40, metoprolol 25 twice a day, metformin 1000 twice a day, and my lisinopril 20. The weekly Ozempic 1 mg injection has been totally fine, no nausea. My home blood pressures have been running in the 130s over 80s.
[01:12] Dr. Alex Rivera: Looking at your vitals today, your blood pressure is 132 over 78, heart rate 68, weight 185 pounds, BMI 28.3. Your lungs and heart sound completely clear today, no ankle swelling, and your EKG shows normal sinus rhythm at 65. Your recent labs from April look solid too—LDL is 85, A1c is 6.9%, kidney function is normal with eGFR 74.
[01:39] Dr. Alex Rivera: Because you have diabetes and coronary artery disease, our target blood pressure is under 130 over 80. Let's bump your lisinopril from 20 mg up to 30 mg once daily, and I'd also like to order a routine surveillance exercise stress test and see you back in six months with repeat labs.`;

  const johnVisit = await prisma.visit.create({
    data: {
      id: 'visit-john-smith-demo',
      userId: user.id,
      patientName: 'John Smith',
      pronouns: 'He/Him',
      visitDate: new Date(),
      visitMode: 'in-person',
      status: 'completed',
      durationSeconds: 118,
      isDemo: true,
      templateId: returningTemplate.id,
      templateName: 'Returning Patient',
      preChartNotes: '65M w/ CAD s/p LAD stent (2020), HTN, HLD, T2DM on Ozempic 1mg + Metformin. Recent LDL 85, HbA1c 6.9%, eGFR 74.',
      transcript: johnTranscript,
      oneLiner: '65-year-old male with coronary artery disease status post PCI with stent to LAD (2020), hypertension, dyslipidemia, and type 2 diabetes mellitus, presenting for routine follow-up.',
      hpi: CANONICAL_SOAP_CONTENT.hpi,
      objective: CANONICAL_SOAP_CONTENT.objective,
      anp: CANONICAL_SOAP_CONTENT.anp,
      instructions: CANONICAL_SOAP_CONTENT.instructions,
      instructionsLang: 'English',
      codingJson: JSON.stringify(johnCoding),
      lettersJson: JSON.stringify(johnLetters),
      ehrPushStatus: 'not_pushed',
      ehrTarget: 'athenahealth',
    },
  });

  // Seed initial Clinical Evidence message on John Smith visit (matching what we observed on secure.getfreed.ai!)
  await prisma.evidenceMessage.createMany({
    data: [
      {
        visitId: johnVisit.id,
        role: 'user',
        mode: 'evidence',
        content: 'What is the target BP for this patient with diabetes and hypertension?',
        citationsJson: '[]',
      },
      {
        visitId: johnVisit.id,
        role: 'assistant',
        mode: 'evidence',
        content: 'For most adults with diabetes and hypertension, the general target is <130/80 mmHg if safely tolerated. Because Mr. Smith also has established ASCVD (CAD s/p LAD stent) and today\'s blood pressure is 132/78 mmHg with home readings in the 130s/80s, titrating his ACE inhibitor (lisinopril 20 mg -> 30 mg daily) aligns with ADA and ACC/AHA guidelines. Monitor serum creatinine and potassium within 2-4 weeks after ACEi dose escalation.',
        citationsJson: JSON.stringify([
          {
            source: 'ADA Standards of Care in Diabetes (diabetesjournals.org)',
            title: 'Cardiovascular Disease and Risk Management: Blood Pressure Target <130/80 mmHg',
            url: 'https://diabetesjournals.org/care',
            year: '2026',
          },
          {
            source: 'ACC/AHA High Blood Pressure Guideline (PubMed)',
            title: ' Secondary Prevention in Patients with Stable Ischemic Heart Disease & Diabetes',
            url: 'https://pubmed.ncbi.nlm.nih.gov/',
            year: '2025',
          },
        ]),
      },
    ],
  });

  // Create a second active visit (Elena Rostova - Acute Asthma & URI)
  await prisma.visit.create({
    data: {
      id: 'visit-elena-rostova',
      userId: user.id,
      patientName: 'Elena Rostova',
      pronouns: 'She/Her',
      visitDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
      visitMode: 'telehealth',
      status: 'completed',
      durationSeconds: 340,
      isDemo: false,
      templateId: returningTemplate.id,
      templateName: 'Returning Patient',
      preChartNotes: '34F w/ mild intermittent asthma presenting via telehealth for 4 days of productive cough, wheezing after viral URI.',
      transcript: `[00:00] Dr. Alex Rivera: Hi Elena, thanks for joining on telehealth today. Tell me about this cough and wheezing that started four days ago.
[00:12] Elena Rostova: Hi Dr. Rivera. My daughter had a cold last week and four days ago I started getting nasal congestion and a cough. Last night I started wheezing and had to use my albuterol inhaler three times.
[00:28] Dr. Alex Rivera: Are you having any fevers, chest pain, or shortness of breath speaking in full sentences right now?
[00:35] Elena Rostova: No fever—temp was 98.9 at home, pulse ox was 97%. I can speak full sentences, just feel tight in my chest when I cough.`,
      oneLiner: '34-year-old female with mild intermittent asthma presenting with an acute viral upper respiratory infection complicated by a mild-to-moderate asthma exacerbation.',
      hpi: `Elena Rostova, a 34-year-old female with a history of mild intermittent asthma, presents via telehealth for 4 days of nasal congestion, cough, and 24 hours of wheezing and chest tightness following a household viral URI exposure. She required albuterol rescue inhaler 3 times over the past 24 hours with partial relief. Denies fever, chills, hemoptysis, or resting dyspnea. Home SpO2 is 97% on room air.`,
      objective: `Vital Signs (Patient-Reported / Telehealth)
- Temperature: 98.9 °F
- SpO2: 97% on room air
- Heart Rate: 82 bpm

Physical Examination (Telehealth Video)
- General: Alert, speaking in full sentences without accessory muscle use
- Respiratory: Audible end-expiratory wheeze on forced exhalation; no stridor or tachypnea`,
      anp: `34-year-old female with mild intermittent asthma presenting with an acute asthma exacerbation triggered by a viral URI.

Mild-to-Moderate Asthma Exacerbation
Assessment: Triggered by viral URI with increased rescue SABA use (3x in 24h) and end-expiratory wheezing, but preserved oxygenation (SpO2 97%) and speaking in full sentences.
Plan:
- Start Prednisone 40 mg PO daily for 5 days (no taper required)
- Initiate Budesonide-Formoterol (Symbicort) 160/4.5 mcg 2 puffs BID + PRN per GINA AIR/SMART guidelines
- Review asthma action plan and peak flow monitoring
- Follow up in 48-72 hours or sooner if worsening dyspnea`,
      instructions: `1. Take Prednisone 40 mg once daily with food in the morning for 5 days to calm the airway inflammation.
2. Begin using your new Symbicort inhaler 2 puffs twice daily.
3. Seek urgent care or go to the nearest ER if your oxygen drops below 94%, you cannot speak in full sentences, or your inhaler is not helping within 15 minutes.`,
      instructionsLang: 'English',
      codingJson: JSON.stringify({
        emLevel: { code: '99214', title: 'Established Patient Telehealth Visit (Moderate MDM)', justification: 'Acute complicated illness / asthma exacerbation requiring systemic corticosteroid prescription.' },
        icd10: [
          { code: 'J45.21', description: 'Mild intermittent asthma with (acute) exacerbation', confidence: '99%', linkedSection: 'Asthma Exacerbation' },
          { code: 'J06.9', description: 'Acute upper respiratory infection, unspecified', confidence: '95%', linkedSection: 'Viral URI Trigger' },
        ],
        cpt: [
          { code: '99214-95', description: 'Synchronous Telemedicine Office Visit, Moderate MDM', category: 'E/M Telehealth' },
        ],
        specificityTips: ['Include modifier -95 and POS 10/02 for synchronous audio-video telehealth reimbursement.'],
      }),
      lettersJson: JSON.stringify({
        referral: 'Pulmonology referral draft ready if recurrent exacerbations occur.',
        excuse: 'Please excuse Elena Rostova from work from October 18 to October 20, 2026 due to an acute respiratory illness.',
        priorAuth: 'GINA 2025 Step 1-2 preferred ICS-formoterol controller & reliever therapy justification for Budesonide-Formoterol.',
      }),
      ehrPushStatus: 'pushed',
      ehrPushedAt: new Date(Date.now() - 90 * 60 * 1000),
      ehrTarget: 'athenahealth',
    },
  });

  // 5. Seed Team Members
  await prisma.teamMember.createMany({
    data: [
      {
        ownerId: user.id,
        name: 'Alex Rivera, MD',
        email: 'dr.alex.rivera@getfreed.ai',
        role: 'Admin',
        status: 'Active',
        daysLeftInTrial: 7,
      },
      {
        ownerId: user.id,
        name: 'Maya Lin, NP',
        email: 'maya.lin@getfreed.ai',
        role: 'Clinician',
        status: 'Active',
        daysLeftInTrial: 7,
      },
      {
        ownerId: user.id,
        name: 'Jordan Brooks, CMA',
        email: 'jordan.brooks@getfreed.ai',
        role: 'Medical Assistant',
        status: 'Active',
        daysLeftInTrial: 7,
      },
    ],
  });

  // 6. Seed Billing Invoices
  await prisma.billingInvoice.createMany({
    data: [
      {
        userId: user.id,
        planTier: 'premier',
        billingCycle: 'monthly',
        seats: 3,
        amountCents: 0,
        status: 'trial',
        invoiceDate: new Date(),
      },
    ],
  });

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
