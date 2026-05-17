import React from 'react';
import { FiMail, FiPhone, FiMessageCircle } from 'react-icons/fi';
import Card from '../ui/Card';

const FAQ = [
  { q: 'How do I raise a complaint?', a: 'Go to the Dashboard Home tab and click "Raise a Complaint". Upload a photo or video of the waste, and our AI will automatically classify it.' },
  { q: 'How do I earn reward points?', a: 'You earn points every time a complaint you reported gets resolved by our team. Points can be redeemed for community benefits.' },
  { q: 'How long does it take to resolve a complaint?', a: 'Most complaints are reviewed within 24-48 hours. Resolution time depends on the severity and location of the issue.' },
  { q: 'Can I track my complaint status?', a: 'Yes! Go to the "Requests" tab in your dashboard to see the status of all your submitted complaints.' },
  { q: 'What types of waste can I report?', a: 'You can report wet waste, dry waste, solid waste, mixed waste, and any other cleanliness issues in your area.' },
];

export default function GetHelp() {
  return (
    <div className="help-view">
      {/* FAQ Section */}
      <div className="help-section">
        <h3 className="help-section-title">Frequently Asked Questions</h3>
        <div className="help-faq-list">
          {FAQ.map((item, i) => (
            <Card key={i} className="help-faq-card">
              <p className="help-faq-question">{item.q}</p>
              <p className="help-faq-answer">{item.a}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="help-section">
        <h3 className="help-section-title">Contact Us</h3>
        <div className="help-contact-grid">
          <Card className="help-contact-card">
            <div className="help-contact-inner">
              <div className="help-contact-icon"><FiMail /></div>
              <p className="help-contact-label">Email</p>
              <p className="help-contact-value">support@cleancity.in</p>
            </div>
          </Card>
          <Card className="help-contact-card">
            <div className="help-contact-inner">
              <div className="help-contact-icon"><FiPhone /></div>
              <p className="help-contact-label">Phone</p>
              <p className="help-contact-value">1800-CLEAN-CITY</p>
            </div>
          </Card>
          <Card className="help-contact-card">
            <div className="help-contact-inner">
              <div className="help-contact-icon"><FiMessageCircle /></div>
              <p className="help-contact-label">Feedback</p>
              <p className="help-contact-value">Use the Feedback page</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
