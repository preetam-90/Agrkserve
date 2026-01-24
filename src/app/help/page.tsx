'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Mail, Phone, MessageSquare, FileText, HelpCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqCategories = [
  {
    id: 'general',
    title: 'General',
    questions: [
      {
        q: 'What is AgriServe?',
        a: 'AgriServe is a platform that connects farmers with equipment providers and agricultural laborers. It helps farmers find necessary resources easily and allows providers/laborers to find work.'
      },
      {
        q: 'Is AgriServe free to use?',
        a: 'Creating an account and browsing listings is free. We charge a small service fee on successful bookings to maintain the platform.'
      },
      {
        q: 'How do I change my language?',
        a: 'You can change your preferred language from the Settings page. We currently support English, Hindi, and Marathi.'
      }
    ]
  },
  {
    id: 'bookings',
    title: 'Bookings & Rentals',
    questions: [
      {
        q: 'How do I book equipment?',
        a: 'Search for the equipment you need, select a provider, choose your dates, and click "Book Now". You can chat with the provider to confirm details before booking.'
      },
      {
        q: 'Can I cancel a booking?',
        a: 'Yes, you can cancel a booking from your dashboard. Cancellation fees may apply depending on how close to the booking date you cancel. Check the specific cancellation policy of the provider.'
      },
      {
        q: 'How do I pay?',
        a: 'We support various payment methods including UPI, Net Banking, and Credit/Debit cards. Payments are held securely and released to the provider upon successful completion of the service.'
      }
    ]
  },
  {
    id: 'providers',
    title: 'For Providers & Labour',
    questions: [
      {
        q: 'How do I list my equipment?',
        a: 'Go to your Provider Dashboard, click on "My Equipment", and select "Add New". Fill in the details, upload photos, set your price, and publish.'
      },
      {
        q: 'When do I get paid?',
        a: 'Payments are processed to your linked bank account within 24-48 hours after the service is marked as "Completed" by the renter.'
      },
      {
        q: 'How can I improve my ranking?',
        a: 'Complete your profile, add high-quality photos, respond quickly to messages, and maintain a high rating from renters to appear higher in search results.'
      }
    ]
  }
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left font-medium transition-all hover:text-green-600 focus:outline-none"
      >
        <span className="pr-8">{question}</span>
        <ChevronDown className={cn("h-5 w-5 text-gray-400 transition-transform duration-200 shrink-0", isOpen && "rotate-180 text-green-600")} />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100 pb-4" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <p className="text-sm text-gray-500 leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">How can we help you?</h1>
        <p className="text-lg text-gray-600 mb-8">
          Find answers to common questions or get in touch with our support team.
        </p>

        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            className="pl-12 h-12 text-lg shadow-sm rounded-full border-gray-200 focus:border-green-500 focus:ring-green-500"
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="hover:shadow-md transition-shadow cursor-pointer border-none shadow-sm bg-blue-50/50">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Guides</h3>
            <p className="text-sm text-gray-500">Step-by-step tutorials on how to use the platform.</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer border-none shadow-sm bg-green-50/50">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Community</h3>
            <p className="text-sm text-gray-500">Join discussions and ask questions to other farmers.</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer border-none shadow-sm bg-purple-50/50">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4">
              <HelpCircle className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Support</h3>
            <p className="text-sm text-gray-500">Contact our support team for specific issues.</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>

        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-2 text-green-700">{category.title}</h3>
              <div className="divide-y divide-gray-100">
                {category.questions.map((item, index) => (
                  <FaqItem key={index} question={item.q} answer={item.a} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500">No results found for "{searchQuery}"</p>
          </div>
        )}
      </div>

      <div className="mt-16 bg-[#1a1a1a] text-white rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Still need help?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Our support team is available Monday to Saturday, 9:00 AM to 6:00 PM IST.
            We are here to assist you with any questions or issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white gap-2 h-12 px-8">
              <Mail className="h-5 w-5" />
              Email Support
            </Button>
            <Button size="lg" variant="outline" className="text-black bg-white hover:bg-gray-100 border-none gap-2 h-12 px-8">
              <Phone className="h-5 w-5" />
              +91 1800-123-4567
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
