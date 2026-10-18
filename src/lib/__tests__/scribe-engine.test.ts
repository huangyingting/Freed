import { describe, it, expect } from 'vitest';
import {
  validateEmailDeliverability,
  generateClinicalSoapNote,
  generateClinicalSoapNoteWithOptionalLLM,
  answerClinicalEvidenceOrMagicEdit,
  learnTemplateFromSampleNote,
  translatePatientInstructions,
} from '@/lib/scribe-engine';

describe('Freed AI Medical Scribe Engine', () => {
  it('validates clinician email deliverability and blocks disposable domains', () => {
    expect(validateEmailDeliverability('dr.smith@clinic.org').result).toBe('deliverable');
    expect(validateEmailDeliverability('invalid-email').result).toBe('undeliverable');
    expect(validateEmailDeliverability('temp@mailinator.com').is_disposable_address).toBe(true);
  });

  it('synthesizes structured SOAP notes, ICD-10/CPT codes, and referral letters from transcripts', () => {
    const result = generateClinicalSoapNote({
      patientName: 'John Smith',
      pronouns: 'He/Him',
      visitMode: 'in-person',
      specialty: 'Cardiology',
      templateName: 'Cardiology Follow-up',
      preChartNotes: '58yo male with hypertension and T2DM',
      transcript:
        'Clinician: Your blood pressure averaged 142/88 and A1c is 7.4% on Lisinopril 10mg and Metformin.',
    });

    expect(result.hpi).toContain('Hypertension');
    expect(result.anp.toLowerCase()).toContain('lisinopril');
    const codingObj = JSON.parse(result.codingJson);
    expect(codingObj.icd10.some((c: { code: string }) => c.code === 'I10')).toBe(true);
    expect(result.lettersJson).toContain('John Smith');
  });

  it('de-identifies PHI and returns peer-reviewed citations in Clinical Evidence mode', () => {
    const res = answerClinicalEvidenceOrMagicEdit({
      query: 'What are the ADA 2026 blood pressure targets for John Smith?',
      mode: 'evidence',
      visit: {
        patientName: 'John Smith',
        hpi: 'BP 142/88, A1c 7.4%',
        objective: 'BP 138/84',
        anp: 'Titrate Lisinopril',
        instructions: 'Monitor BP',
      },
    });

    expect(res.reply).toContain('ADA Standards of Care');
    expect(res.citations.length).toBeGreaterThan(0);
  });

  it('transforms note sections in Magic Edit mode', () => {
    const res = answerClinicalEvidenceOrMagicEdit({
      query: 'Make Assessment & Plan concise bullet points',
      mode: 'magic_edit',
      visit: {
        patientName: 'John Smith',
        hpi: 'Hypertension follow-up',
        objective: 'BP 138/84',
        anp: 'Assessment: Essential Hypertension\nAssessment: Type 2 Diabetes',
        instructions: 'Follow up in 3 months',
      },
    });

    expect(res.updatedFields?.anp).toContain('- Assessment: Essential Hypertension');
  });

  it('learns canonical template sections from a sample note', () => {
    const learned = learnTemplateFromSampleNote({
      name: 'Custom Derm Note',
      specialty: 'Dermatology',
      sampleNoteText:
        'Subjective: Patient presents with erythematous scaly plaques on extensor elbows.\n\nObjective: Well-demarcated silvery plaques on bilateral elbows.\n\nAssessment: Start topical clobetasol 0.05% ointment BID x 2 weeks.',
    });

    expect(learned.hpi).toContain('erythematous');
    expect(learned.objective).toContain('silvery plaques');
    expect(learned.anp).toContain('clobetasol');
  });

  it('translates patient instructions into Spanish, Mandarin, and French', () => {
    const english = 'Hello John Smith,\nTake Lisinopril 20 mg daily.';
    const spanish = translatePatientInstructions('John Smith', 'Spanish', english);
    const mandarin = translatePatientInstructions('John Smith', 'Mandarin', english);
    const french = translatePatientInstructions('John Smith', 'French', english);

    expect(spanish).toContain('Gracias por reunirse conmigo hoy');
    expect(mandarin).toContain('感谢您今天的就诊');
    expect(french).toContain("Merci de m'avoir consulté aujourd'hui");
    expect(translatePatientInstructions('John Smith', 'English', english)).toBe(english);
  });

  it('supports async LLM-capable SOAP synthesis with deterministic fallback', async () => {
    const result = await generateClinicalSoapNoteWithOptionalLLM({
      patientName: 'Elena Rostova',
      pronouns: 'She/Her',
      visitMode: 'telehealth',
      specialty: 'Primary Care',
      templateName: 'Standard SOAP Note',
      preChartNotes: 'Asthma follow-up',
      transcript: 'Patient reports wheezing 3 times this week and albuterol rescue use.',
    });

    expect(result.hpi.toLowerCase()).toContain('asthma');
    const codingObj = JSON.parse(result.codingJson);
    expect(codingObj.emLevel.code).toBe('99214');
  });
});
