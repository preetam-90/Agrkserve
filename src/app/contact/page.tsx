import { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact Us - AgriServe | Agricultural Equipment & Labour Support India',
  description:
    'Contact AgriServe for farm equipment rental, agricultural labour hiring, and booking support across India. Reach us for tractor rental, harvester booking, and agri-labour services in Punjab, Haryana, UP, Rajasthan, and all Indian states. कृषि उपकरण किराये और श्रमिक सेवा सहायता।',
  keywords: [
    'contact agriserve',
    'farm equipment support india',
    'agricultural labour helpline',
    'tractor rental support',
    'krishi seva sampark',
    'कृषि सहायता',
    'किसान हेल्पलाइन',
    'farm equipment booking help',
    'agriserve customer care',
  ],
  openGraph: {
    title: 'Contact AgriServe - Agricultural Equipment & Labour Support',
    description:
      'Get in touch with AgriServe for farm equipment rental and agricultural labour services across India.',
    url: 'https://agriserve.in/contact',
    type: 'website',
    locale: 'en_IN',
  },
  alternates: {
    canonical: 'https://agriserve.in/contact',
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
