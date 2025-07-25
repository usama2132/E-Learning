import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages/PrivacyPolicy.css';

const PrivacyPolicy = () => {
  const [lastUpdated] = useState('January 15, 2025');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="privacy-policy-container">
      <div className="privacy-policy-content">
        <header className="policy-header">
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last updated: {lastUpdated}</p>
          <p className="policy-intro">
            At LearnHub, we take your privacy seriously. This Privacy Policy explains how we collect, 
            use, disclose, and safeguard your information when you use our online learning platform.
          </p>
        </header>

        <nav className="policy-nav">
          <h3>Table of Contents</h3>
          <ul>
            <li><a href="#information-collection">Information We Collect</a></li>
            <li><a href="#information-use">How We Use Your Information</a></li>
            <li><a href="#information-sharing">Information Sharing and Disclosure</a></li>
            <li><a href="#data-security">Data Security</a></li>
            <li><a href="#cookies">Cookies and Tracking Technologies</a></li>
            <li><a href="#third-party">Third-Party Services</a></li>
            <li><a href="#data-retention">Data Retention</a></li>
            <li><a href="#user-rights">Your Rights and Choices</a></li>
            <li><a href="#children-privacy">Children's Privacy</a></li>
            <li><a href="#international">International Data Transfers</a></li>
            <li><a href="#policy-changes">Changes to This Privacy Policy</a></li>
            <li><a href="#contact">Contact Information</a></li>
          </ul>
        </nav>

        <main className="policy-main">
          <section id="information-collection">
            <h2>1. Information We Collect</h2>
            
            <h3>1.1 Personal Information</h3>
            <p>We collect personal information that you voluntarily provide to us when you:</p>
            <ul>
              <li>Create an account on our platform</li>
              <li>Enroll in courses or make purchases</li>
              <li>Contact us for support or inquiries</li>
              <li>Participate in surveys or feedback forms</li>
              <li>Subscribe to our newsletter</li>
            </ul>
            
            <p>This information may include:</p>
            <ul>
              <li>Name and contact information (email address, phone number)</li>
              <li>Billing and payment information</li>
              <li>Profile information (bio, profession, location)</li>
              <li>Educational background and preferences</li>
              <li>Profile photo and other uploaded content</li>
            </ul>

            <h3>1.2 Usage Information</h3>
            <p>We automatically collect information about your interaction with our platform:</p>
            <ul>
              <li>Course progress and completion data</li>
              <li>Quiz and assignment submissions</li>
              <li>Time spent on lessons and platform usage patterns</li>
              <li>Device information and browser type</li>
              <li>IP address and location data</li>
              <li>Log files and analytics data</li>
            </ul>

            <h3>1.3 Communication Information</h3>
            <p>We collect information from your communications with us and other users:</p>
            <ul>
              <li>Messages sent through our platform</li>
              <li>Support tickets and correspondence</li>
              <li>Course reviews and ratings</li>
              <li>Discussion forum posts</li>
            </ul>
          </section>

          <section id="information-use">
            <h2>2. How We Use Your Information</h2>
            
            <p>We use the collected information for the following purposes:</p>
            
            <h3>2.1 Service Provision</h3>
            <ul>
              <li>Create and manage your account</li>
              <li>Provide access to courses and learning materials</li>
              <li>Process payments and transactions</li>
              <li>Track your learning progress and generate certificates</li>
              <li>Provide customer support</li>
            </ul>

            <h3>2.2 Communication</h3>
            <ul>
              <li>Send course updates and notifications</li>
              <li>Respond to your inquiries and support requests</li>
              <li>Send promotional materials (with your consent)</li>
              <li>Provide important platform announcements</li>
            </ul>

            <h3>2.3 Platform Improvement</h3>
            <ul>
              <li>Analyze usage patterns to improve our services</li>
              <li>Conduct research and analytics</li>
              <li>Develop new features and functionality</li>
              <li>Ensure platform security and prevent fraud</li>
            </ul>

            <h3>2.4 Legal Compliance</h3>
            <ul>
              <li>Comply with legal obligations</li>
              <li>Enforce our terms of service</li>
              <li>Protect our rights and the rights of other users</li>
              <li>Respond to legal requests and prevent misuse</li>
            </ul>
          </section>

          <section id="information-sharing">
            <h2>3. Information Sharing and Disclosure</h2>
            
            <p>We do not sell, trade, or rent your personal information to third parties. We may share your information in the following limited circumstances:</p>

            <h3>3.1 Service Providers</h3>
            <p>We may share information with trusted third-party service providers who assist us in:</p>
            <ul>
              <li>Payment processing (Stripe, PayPal)</li>
              <li>Email services and notifications</li>
              <li>Cloud storage and hosting</li>
              <li>Analytics and performance monitoring</li>
              <li>Customer support services</li>
            </ul>

            <h3>3.2 Course Instructors</h3>
            <p>We may share relevant information with course instructors including:</p>
            <ul>
              <li>Student enrollment information</li>
              <li>Progress and completion data</li>
              <li>Quiz and assignment submissions</li>
              <li>Questions and discussion participation</li>
            </ul>

            <h3>3.3 Legal Requirements</h3>
            <p>We may disclose your information when required by law or to:</p>
            <ul>
              <li>Comply with legal processes or government requests</li>
              <li>Enforce our agreements and policies</li>
              <li>Protect the rights, property, or safety of LearnHub, our users, or others</li>
              <li>Investigate and prevent fraud or security issues</li>
            </ul>

            <h3>3.4 Business Transfers</h3>
            <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</p>
          </section>

          <section id="data-security">
            <h2>4. Data Security</h2>
            
            <p>We implement appropriate technical and organizational measures to protect your personal information:</p>
            
            <h3>4.1 Security Measures</h3>
            <ul>
              <li>Encryption of data in transit and at rest</li>
              <li>Secure server infrastructure and regular security updates</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Regular security audits and monitoring</li>
              <li>Employee training on data protection</li>
            </ul>

            <h3>4.2 Payment Security</h3>
            <ul>
              <li>PCI DSS compliant payment processing</li>
              <li>Tokenization of payment information</li>
              <li>Secure payment gateways</li>
              <li>No storage of complete credit card information</li>
            </ul>

            <p className="security-notice">
              While we strive to protect your personal information, no method of transmission over the Internet 
              or electronic storage is 100% secure. We cannot guarantee absolute security but are committed to 
              protecting your data using industry best practices.
            </p>
          </section>

          <section id="cookies">
            <h2>5. Cookies and Tracking Technologies</h2>
            
            <h3>5.1 What Are Cookies</h3>
            <p>Cookies are small data files stored on your device when you visit our platform. We use cookies and similar technologies to enhance your experience.</p>

            <h3>5.2 Types of Cookies We Use</h3>
            <ul>
              <li><strong>Essential Cookies:</strong> Necessary for platform functionality and security</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how you use our platform</li>
              <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
            </ul>

            <h3>5.3 Cookie Control</h3>
            <p>You can control cookies through your browser settings. Note that disabling certain cookies may affect platform functionality.</p>
          </section>

          <section id="third-party">
            <h2>6. Third-Party Services</h2>
            
            <p>Our platform integrates with various third-party services:</p>
            
            <h3>6.1 Analytics Services</h3>
            <ul>
              <li>Google Analytics for usage analytics</li>
              <li>Hotjar for user behavior analysis</li>
              <li>Custom analytics tools for learning insights</li>
            </ul>

            <h3>6.2 Communication Services</h3>
            <ul>
              <li>Email service providers for notifications</li>
              <li>Video conferencing tools for live sessions</li>
              <li>Chat services for customer support</li>
            </ul>

            <h3>6.3 Content Delivery</h3>
            <ul>
              <li>Content delivery networks (CDNs)</li>
              <li>Video hosting and streaming services</li>
              <li>File storage and sharing platforms</li>
            </ul>

            <p>These third-party services have their own privacy policies and terms of use.</p>
          </section>

          <section id="data-retention">
            <h2>7. Data Retention</h2>
            
            <p>We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy:</p>
            
            <ul>
              <li><strong>Account Information:</strong> Retained while your account is active and for 30 days after deletion</li>
              <li><strong>Course Data:</strong> Retained for the duration of your enrollment plus 2 years for certificate verification</li>
              <li><strong>Payment Information:</strong> Retained as required by law and for fraud prevention (typically 7 years)</li>
              <li><strong>Communication Records:</strong> Retained for 3 years for support and legal purposes</li>
              <li><strong>Analytics Data:</strong> Aggregated and anonymized data may be retained indefinitely</li>
            </ul>

            <p>We may retain certain information longer when required by law or for legitimate business purposes.</p>
          </section>

          <section id="user-rights">
            <h2>8. Your Rights and Choices</h2>
            
            <p>You have the following rights regarding your personal information:</p>

            <h3>8.1 Access and Portability</h3>
            <ul>
              <li>Request access to your personal information</li>
              <li>Receive a copy of your data in a portable format</li>
              <li>View and download your course progress and certificates</li>
            </ul>

            <h3>8.2 Correction and Update</h3>
            <ul>
              <li>Update your profile information at any time</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Modify your communication preferences</li>
            </ul>

            <h3>8.3 Deletion and Restriction</h3>
            <ul>
              <li>Delete your account and associated data</li>
              <li>Request deletion of specific information</li>
              <li>Restrict processing of your data in certain circumstances</li>
            </ul>

            <h3>8.4 Communication Choices</h3>
            <ul>
              <li>Opt out of marketing communications</li>
              <li>Customize notification preferences</li>
              <li>Unsubscribe from newsletters</li>
            </ul>

            <p>To exercise these rights, please contact us using the information provided in the Contact section.</p>
          </section>

          <section id="children-privacy">
            <h2>9. Children's Privacy</h2>
            
            <p>Our platform is not intended for children under the age of 13, and we do not knowingly collect personal information from children under 13.</p>
            
            <p>If we become aware that we have collected personal information from a child under 13, we will take steps to delete that information promptly.</p>
            
            <p>For users between 13-18 years old, we recommend parental guidance and supervision when using our platform.</p>
          </section>

          <section id="international">
            <h2>10. International Data Transfers</h2>
            
            <p>Your information may be transferred to and processed in countries other than your own. When we transfer data internationally, we ensure appropriate safeguards are in place:</p>
            
            <ul>
              <li>Standard contractual clauses approved by relevant authorities</li>
              <li>Adequacy decisions for certain countries</li>
              <li>Certification schemes and codes of conduct</li>
              <li>Binding corporate rules where applicable</li>
            </ul>
          </section>

          <section id="policy-changes">
            <h2>11. Changes to This Privacy Policy</h2>
            
            <p>We may update this Privacy Policy from time to time to reflect changes in our practices or for legal and regulatory reasons.</p>
            
            <p>When we make changes, we will:</p>
            <ul>
              <li>Update the "Last Updated" date at the top of this policy</li>
              <li>Notify you via email if changes are material</li>
              <li>Post a notice on our platform about the updates</li>
              <li>Provide you with a clear summary of changes</li>
            </ul>
            
            <p>We encourage you to review this policy periodically to stay informed about how we protect your information.</p>
          </section>

          <section id="contact">
            <h2>12. Contact Information</h2>
            
            <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
            
            <div className="contact-info">
              <div className="contact-method">
                <h4>Email</h4>
                <p>privacy@learnhub.com</p>
              </div>
              
              <div className="contact-method">
                <h4>Mailing Address</h4>
                <p>
                  LearnHub Privacy Officer<br />
                  123 Learning Street<br />
                  Education City, EC 12345<br />
                  United States
                </p>
              </div>
              
              <div className="contact-method">
                <h4>Online</h4>
                <p>
                  <Link to="/contact">Submit a privacy inquiry</Link> through our contact form
                </p>
              </div>
              
              <div className="contact-method">
                <h4>Phone</h4>
                <p>1-800-LEARNHUB (1-800-532-7648)</p>
                <p className="phone-hours">Available Monday-Friday, 9 AM - 6 PM EST</p>
              </div>
            </div>
            
            <div className="response-time">
              <p>
                <strong>Response Time:</strong> We aim to respond to all privacy-related inquiries within 
                30 days of receipt. For urgent matters, please indicate "URGENT" in your subject line.
              </p>
            </div>
          </section>
        </main>

        <footer className="policy-footer">
          <div className="footer-links">
            <Link to="/terms">Terms of Service</Link>
            <Link to="/cookies">Cookie Policy</Link>
            <Link to="/security">Security Policy</Link>
            <Link to="/accessibility">Accessibility Statement</Link>
          </div>
          
          <div className="footer-note">
            <p>
              This Privacy Policy is effective as of {lastUpdated} and applies to all information 
              collected by LearnHub. By using our platform, you agree to the collection and use 
              of information in accordance with this policy.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;