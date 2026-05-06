export interface TermsSection {
  title: string;
  items: string[];
}

export const termsIntro = `This site and all services offered herein are owned and operated by X FITNESS CENTRE (Business Registration No.: 202503023755, Old Registration No.: IP0604759-X) ("the Company").

While the official registered name is X FITNESS CENTRE, the brand is commonly referred to as X FITNESS across all signage, marketing materials, and social media platforms.

By checking this Terms & Conditions, you acknowledge and agree to be bound by the terms and conditions set forth below.`;

export const termsSections: TermsSection[] = [
  {
    title: 'Walk-In Access',
    items: [
      'Walk-in entry is valid for one-time access only.',
      'Fees paid are non-refundable and non-transferable.',
    ],
  },
  {
    title: 'Health & Safety',
    items: [
      'You confirm that you are fit to exercise and do not have any medical conditions that may endanger yourself or others.',
      'You use all equipment at your own risk.',
      'X FITNESS CENTRE is not responsible for any injuries or health issues that occur during your visit.',
      'Do not exercise under the influence of alcohol, drugs, or medication that affects physical ability.',
    ],
  },
  {
    title: 'Gym Conduct',
    items: [
      'Proper gym attire and sports shoes are required. No sandals or slippers.',
      'Return all equipment/tool to its original place after use.',
      'Re-rack your weight (dumbbell, bumper plate) from the equipment after use.',
      'Do not slam dumbbell on the floor unnecessarily or misuse equipment.',
      'Do not remove your shirt in the public area, except Posing Area.',
      'The use, possession, or distribution of steroids or any illegal performance-enhancing drugs is strictly prohibited within the gym premises.',
      'Disrespectful, dangerous, or disruptive behaviour may result in immediate removal from the facility without refund.',
    ],
  },
  {
    title: 'Equipment & Property',
    items: [
      'Any intentional damage to gym property will result in compensation charges and possible legal action.',
    ],
  },
  {
    title: 'Personal Belongings',
    items: [
      'Please keep your belongings secure. The gym is not responsible for loss, theft, or damage.',
    ],
  },
  {
    title: 'Photography & Recording',
    items: [
      'Recording other members without permission is strictly prohibited.',
    ],
  },
  {
    title: 'Age Requirement',
    items: [
      'Minimum entry age is 16 years old. Those below 16 must be accompanied by a guardian.',
    ],
  },
  {
    title: 'PDPA Notice',
    items: [
      'By submitting this form, you consent to the collection and use of your personal data in accordance with the Personal Data Protection Act (PDPA) 2010 for registration and safety purposes.',
    ],
  },
  {
    title: 'Final Rights',
    items: [
      'The Company reserves the right to refuse entry or remove any individual who violates these Terms & Conditions.',
    ],
  },
  {
    title: 'Personal Information Accuracy',
    items: [
      'You agree to provide accurate and truthful personal information (including your full name, IC/Passport number, and contact details) when completing this form.',
      'The information you provide may be used for identity verification, emergency response, insurance documentation, or when required by law.',
      'In the event of an accident, injury, medical emergency, property damage, or criminal incident, X FITNESS CENTRE reserves the right to provide your details to hospitals, emergency responders, insurance companies, or law enforcement authorities if necessary.',
      'Providing false information is strictly prohibited and may result in refusal of entry and/or legal action.',
    ],
  },
];
