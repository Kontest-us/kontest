import React from 'react';
import '../style/index.css';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import '../style/buttons.css';

function Privacy(props) {
    return (
        <div className={'App'}>
            <h1 style={{ fontSize: '25px', fontWeight: 'bold' }}>
                Privacy Policy
            </h1>
            <br />
            <p>Last updated 04/15/2021</p>
            <br />
            <h4>
                Thank you for choosing to use Kontest. We are committed to
                protecting your personal information and your right to privacy.
                <br />
                <br />
                <br />
                When you visit our website, and use our services, you trust us
                with your personal information. We take your privacy very
                seriously. In this privacy policy, we seek to explain to you in
                the clearest way possible what information we collect, how we
                use it and what rights you have in relation to it. We hope you
                take some time to read through it carefully, as it is important.
                If there are any terms in this privacy policy that you do not
                agree with, please discontinue use of our Apps and our services.
                <br />
                <br />
                <br />
                This privacy policy applies to all information collected through
                website and/or any related services, sales, marketing or events
                (we refer to them collectively in this privacy policy as the
                "Services").
                <br />
                <br />
                <br />
                Please read this privacy policy carefully as it will help you
                make informed decisions about sharing your personal information
                with us.
            </h4>
            <br />
            <h2 style={{ fontSize: '25px', fontWeight: 'bold' }}>
                WHAT INFORMATION DO WE COLLECT?
            </h2>
            <br />
            <p>
                We collect first name, last name, school ID, email addresses,
                school name and other similar data.
                <br />
                <br />
                We do not store any confidential information, such as passwords,
                credit card information, and other similar data.
                <br />
                <br />
                All personal information that you provide to us must be true,
                complete and accurate, and you must notify us of any changes to
                such personal information.
                <br />
                <br />
            </p>
            <br />
            <h2 style={{ fontSize: '25px', fontWeight: 'bold' }}>
                HOW DO WE USE YOUR INFORMATION?
            </h2>
            <br />
            <p>We use the information we collect or receive for:</p>
            <li>To allow teachers to create accounts and manage contests.</li>
            <li>
                To manage user accounts. We may use your information for the
                purposes of managing our account and keeping it in working
                order.
            </li>
            <li>To allow students to play contests.</li>
            <br />
            <h2 style={{ fontSize: '25px', fontWeight: 'bold' }}>
                WILL YOUR INFORMATION BE SHARED WITH ANYONE?
            </h2>
            <br />
            <p>
                We will not share your information with anyone outside of our
                organization.
            </p>
            <br />
            <p>
                We may process or share data based on the following legal basis:
            </p>
            <li>
                Consent: We may process your data if you have given us specific
                consent to use your personal information in a specific purpose.
            </li>
            <br />
            <li>
                Legitimate Interests: We may process your data when it is
                reasonably necessary to achieve our legitimate business
                interests.
            </li>
            <br />
            <li>
                Performance of a Contract: Where we have entered into a contract
                with you, we may process your personal information to fulfill
                the terms of our contract.
            </li>
            <br />
            <li>
                Legal Obligations: We may disclose your information where we are
                legally required to do so in order to comply with applicable
                law, governmental requests, a judicial proceeding, court order,
                or legal process, such as in response to a court order or a
                subpoena (including in response to public authorities to meet
                national security or law enforcement requirements).
            </li>
            <br />
            <li>
                Vital Interests: We may disclose your information where we
                believe it is necessary to investigate, prevent, or take action
                regarding potential violations of our policies, suspected fraud,
                situations involving potential threats to the safety of any
                person and illegal activities, or as evidence in litigation in
                which we are involved.
            </li>
            <br />
            <h2 style={{ fontSize: '25px', fontWeight: 'bold' }}>
                HOW LONG DO WE KEEP YOUR INFORMATION?
            </h2>
            <br />
            <p>
                We keep your information for as long as necessary to fulfill the
                purposes outlined in this privacy policy unless otherwise
                required by law.
                <br />
                In other words, as long as you hold an account on our app and
                your account is active.
            </p>
            <br />
            <h2 style={{ fontSize: '25px', fontWeight: 'bold' }}>
                HOW DO WE KEEP YOUR INFORMATION SAFE?
            </h2>
            <br />
            <p>
                We have implemented appropriate technical and organizational
                security measures designed to protect the security of any
                personal information we process. However, please also remember
                that we cannot guarantee that the internet itself is 100%
                secure. Although we will do our best to protect your personal
                information, transmission of personal information to and from
                our Apps is at your own risk. You should only access the
                services within a secure environment.
            </p>
            <br />
            <h2 style={{ fontSize: '25px', fontWeight: 'bold' }}>
                WHAT ARE YOUR PRIVACY RIGHTS?
            </h2>
            <br />
            <p>
                You may review or change your account at any time.
                <br />
                <br />
                If you are resident in the European Economic Area and you
                believe we are unlawfully processing your personal information,
                you also have the right to complain to your local data
                protection supervisory authority. You can find their contact
                details{' '}
                <a href="http://ec.europa.eu/justice/data-protection/bodies/authorities/index_en.htm">
                    here
                </a>
                .
            </p>
            <br />
            <h2 style={{ fontSize: '25px', fontWeight: 'bold' }}>
                CONTROLS FOR DO-NOT-TRACK FEATURES
            </h2>
            <br />
            <p>
                Most web browsers and some mobile operating systems and mobile
                applications include a Do-Not-Track (“DNT”) feature or setting
                you can activate to signal your privacy preference not to have
                data about your online browsing activities monitored and
                collected. No uniform technology standard for recognizing and
                implementing DNT signals has been finalized. As such, we do not
                currently respond to DNT browser signals or any other mechanism
                that automatically communicates your choice not to be tracked
                online. If a standard for online tracking is adopted that we
                must follow in the future, we will inform you about that
                practice in a revised version of this privacy policy.
            </p>
            <br />
            <h2 style={{ fontSize: '25px', fontWeight: 'bold' }}>
                DO CALIFORNIA RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?
            </h2>
            <br />
            <p>
                California Civil Code Section 1798.83, also known as the “Shine
                The Light” law, permits our users who are California residents
                to request and obtain from us, once a year and free of charge,
                information about categories of personal information (if any) we
                disclosed to third parties for direct marketing purposes and the
                names and addresses of all third parties with which we shared
                personal information in the immediately preceding calendar year.
                If you are a California resident and would like to make such a
                request, please submit your request in writing to us using the
                contact information provided below.
                <br />
                <br />
                If you are under 18 years of age, reside in California, and have
                a registered account with the Apps, you have the right to
                request removal of unwanted data that you publicly post on the
                Apps. To request removal of such data, please contact us using
                the contact information provided below, and include the email
                address associated with your account and a statement that you
                reside in California. We will make sure the data is not publicly
                displayed on the Apps, but please be aware that the data may not
                be completely or comprehensively removed from our systems.
            </p>
            <br />
            <h2 style={{ fontSize: '25px', fontWeight: 'bold' }}>
                DO WE MAKE UPDATES TO THIS POLICY?
            </h2>
            <br />
            <p>
                We may update this privacy policy from time to time. The updated
                version will be indicated by an updated “Revised” date and the
                updated version will be effective as soon as it is accessible.
                If we make material changes to this privacy policy, we may
                notify you either by prominently posting a notice of such
                changes or by directly sending you a notification. We encourage
                you to review this privacy policy frequently to be informed of
                how we are protecting your information.
            </p>
            <br />
            <h2 style={{ fontSize: '25px', fontWeight: 'bold' }}>
                HOW CAN YOU CONTACT US ABOUT THIS POLICY?
            </h2>
            <br />
            <p>
                If you have questions or comments about this policy, you may
                email us at{' '}
                <a href="mailto:@labdhijain753@gmail.com">this address</a>.
            </p>
            <br />
            <Link to="/">
                <button className="red-btn" style={{ width: '300px' }}>
                    Back
                </button>
            </Link>
            <br></br>
        </div>
    );
}

export default Privacy;
