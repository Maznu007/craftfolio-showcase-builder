
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQ = () => {
  const faqs = [
    {
      question: 'How do I get started with CRAFTFOLIO?',
      answer: 'Getting started is simple. Just sign up for a free account, choose a template, and start customizing your portfolio. You can import your projects from GitHub or your experience from LinkedIn to speed up the process.'
    },
    {
      question: 'Can I use my own domain name?',
      answer: 'Yes! Both free and premium plans allow you to connect your own custom domain. However, free plan users will have a small CRAFTFOLIO badge displayed on their portfolio.'
    },
    {
      question: 'How do I connect my GitHub account?',
      answer: 'After signing up, go to your Profile settings and click on "Connect GitHub". Follow the authentication process to connect your GitHub account and start importing your projects.'
    },
    {
      question: 'Can I switch templates after creating my portfolio?',
      answer: 'Yes, you can switch between templates at any time without losing your content. All your information will automatically adapt to the new template layout.'
    },
    {
      question: 'What\'s the difference between free and premium plans?',
      answer: 'The free plan includes basic templates, one portfolio site, and GitHub integration. The premium plan offers unlimited portfolios, all premium templates, both GitHub and LinkedIn integration, and removes the CRAFTFOLIO badge from your site.'
    },
    {
      question: 'Is there a limit to how many projects I can showcase?',
      answer: 'No, there is no limit to the number of projects you can showcase in your portfolio, regardless of whether you\'re on the free or premium plan.'
    }
  ];

  return (
    <div className="py-16 px-4" id="faq">
      <div className="text-center mb-12">
        <h2 className="handwritten text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
        <p className="text-lg max-w-2xl mx-auto">Find answers to common questions about CRAFTFOLIO</p>
      </div>
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-lg font-medium">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-gray-600">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default FAQ;
