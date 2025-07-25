import React from 'react';
import '../styles/pages/TermsOfService.css';

const TermsOfService = () => {
  return (
    <div className="terms-of-service">
      <div className="container">
        <div className="terms-header">
          <h1>Terms of Service</h1>
          <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="terms-content">
          <section className="terms-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using our online learning platform, you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="terms-section">
            <h2>2. Platform Description</h2>
            <p>
              Our platform provides online courses and educational content. We offer both free and paid courses across various subjects. 
              The platform connects instructors with students to facilitate online learning.
            </p>
          </section>

          <section className="terms-section">
            <h2>3. User Accounts</h2>
            <p>
              To access certain features of the platform, you must register for an account. You are responsible for maintaining the 
              confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
            </p>
            <ul>
              <li>You must provide accurate and complete information when creating your account</li>
              <li>You are responsible for keeping your login credentials secure</li>
              <li>You must notify us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>4. Course Content and Intellectual Property</h2>
            <p>
              All course content, including videos, text, images, and other materials, are protected by intellectual property rights. 
              You may not reproduce, distribute, or create derivative works without explicit permission.
            </p>
            <ul>
              <li>Course content is licensed for personal, non-commercial use only</li>
              <li>Instructors retain ownership of their course content</li>
              <li>Platform branding and design elements are owned by the platform</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>5. Payments and Refunds</h2>
            <p>
              Paid courses require payment before access is granted. All payments are processed securely through our payment partners.
            </p>
            <ul>
              <li>All course prices are listed in USD unless otherwise specified</li>
              <li>Refund requests must be made within 30 days of purchase</li>
              <li>Refunds are subject to our refund policy and instructor approval</li>
              <li>Payment information is handled securely and not stored on our servers</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>6. User Conduct</h2>
            <p>You agree not to use the platform for any unlawful purpose or in any way that could damage the platform or its users.</p>
            <p>Prohibited activities include:</p>
            <ul>
              <li>Sharing account credentials with others</li>
              <li>Attempting to circumvent payment systems</li>
              <li>Uploading malicious content or viruses</li>
              <li>Harassing other users or instructors</li>
              <li>Violating intellectual property rights</li>
              <li>Creating fake accounts or impersonating others</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>7. Instructor Responsibilities</h2>
            <p>Instructors who create and publish courses on our platform agree to:</p>
            <ul>
              <li>Provide accurate course descriptions and learning objectives</li>
              <li>Ensure they have rights to all content they upload</li>
              <li>Respond to student questions in a timely manner</li>
              <li>Maintain professional conduct in all interactions</li>
              <li>Comply with our content guidelines and quality standards</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>8. Privacy and Data Protection</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy to understand how we collect, 
              use, and protect your personal information.
            </p>
          </section>

          <section className="terms-section">
            <h2>9. Platform Availability</h2>
            <p>
              While we strive to maintain 24/7 availability, the platform may be temporarily unavailable due to 
              maintenance, updates, or technical issues. We are not liable for any losses resulting from platform downtime.
            </p>
          </section>

          <section className="terms-section">
            <h2>10. Limitation of Liability</h2>
            <p>
              The platform and its content are provided "as is" without warranties of any kind. We are not liable for any 
              direct, indirect, incidental, or consequential damages resulting from your use of the platform.
            </p>
          </section>

          <section className="terms-section">
            <h2>11. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your account at any time for violation of these terms. 
              You may also terminate your account at any time by contacting our support team.
            </p>
          </section>

          <section className="terms-section">
            <h2>12. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. 
              Your continued use of the platform constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="terms-section">
            <h2>13. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="contact-info">
              <p>Email: support@learningplatform.com</p>
              <p>Address: [Your Company Address]</p>
              <p>Phone: [Your Contact Number]</p>
            </div>
          </section>
        </div>

        <div className="terms-footer">
          <p>
            By using our platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;