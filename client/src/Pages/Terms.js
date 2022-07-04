import React from 'react';
import '../style/index.css';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import '../style/buttons.css';

function Terms(props) {
    return (
        <div className={'App'}>
            <div className="rounded">
                <h3 style={{ fontSize: '25px', fontWeight: 'bold' }}>
                    Conditions of Use
                </h3>
                <br />
                <p>Last updated 04/15/2021</p>
                <br />
                <p>
                    We will provide their services to you, which are subject to
                    the conditions stated below in this document. Every time you
                    visit this website, use its services or make a purchase, you
                    accept the following conditions. This is why we urge you to
                    read them carefully.
                </p>
                <br />
                <p>
                    We do not allow teachers to use this site for graded
                    assignments or contests that give monetary prizes. We also
                    do not allow businesses to use this site for recruiting
                    purposes. All contests on our website must be created for
                    education or entertainment purposes.
                </p>
                <br></br>
                <h3 style={{ fontSize: '25px', fontWeight: 'bold' }}>
                    Privacy Policy
                </h3>
                <br />
                <p>
                    Before you continue using our website we advise you to read
                    our privacy policy regarding our user data collection. It
                    will help you better understand our practices.
                </p>
                <br />
                <h3 style={{ fontSize: '25px', fontWeight: 'bold' }}>
                    Copyright
                </h3>
                <br />
                <p>
                    Content published on this app and website (digital
                    downloads, images, texts, graphics, logos) is the property
                    of us and/or its content creators and protected by
                    international copyright laws. The entire compilation of the
                    content found on this website is the exclusive property of
                    us, with copyright authorship for this compilation by us.
                </p>
                <br />
                <h3 style={{ fontSize: '25px', fontWeight: 'bold' }}>
                    Communications
                </h3>
                <br />
                <p>
                    The entire communication with us is electronic. Every time
                    you send us an email or visit our website, you are going to
                    be communicating with us. You hereby consent to receive
                    communications from us. If you subscribe to the news on our
                    website, you are going to receive regular emails from us. We
                    will continue to communicate with you by posting news and
                    notices on our website and by sending you emails. You also
                    agree that all notices, disclosures, agreements and other
                    communications we provide to you electronically meet the
                    legal requirements that such communications be in writing.
                </p>
                <br />
                <h3 style={{ fontSize: '25px', fontWeight: 'bold' }}>
                    Applicable Law
                </h3>
                <br />
                <p>
                    By visiting this website, you agree that the laws of
                    Illinois, United States of America, without regard to
                    principles of conflict laws, will govern these terms of
                    service, or any dispute of any sort that might come between
                    us and you, or its business partners and associates.
                </p>
                <br />
                <h3 style={{ fontSize: '25px', fontWeight: 'bold' }}>
                    Disputes
                </h3>
                <br />
                <p>
                    Any dispute related in any way to your visit to this website
                    or to products you purchase from us shall be arbitrated by
                    state or federal court and you consent to exclusive
                    jurisdiction and venue of such courts.
                </p>
                <br />
                <h3 style={{ fontSize: '25px', fontWeight: 'bold' }}>
                    Comments, Reviews, and Emails
                </h3>
                <br />
                <p>
                    Visitors may post content as long as it is not obscene,
                    illegal, defamatory, threatening, infringing of intellectual
                    property rights, invasive of privacy or injurious in any
                    other way to third parties. Content has to be free of
                    software viruses, political campaign, and commercial
                    solicitation. We reserve all rights (but not the obligation)
                    to remove and/or edit such content. When you post your
                    content, you grant us non-exclusive, royalty-free and
                    irrevocable right to use, reproduce, publish, modify such
                    content throughout the world in any media.
                </p>
                <br />
                <h3 style={{ fontSize: '25px', fontWeight: 'bold' }}>
                    License and Site Access
                </h3>
                <br />
                <p>
                    We grant you a limited license to access and make personal
                    use of this website. You are not allowed to download or
                    modify it.{' '}
                </p>
                <br />
                <Link to="/">
                    <button className="red-btn" style={{ width: '300px' }}>
                        Back
                    </button>
                </Link>
                <br></br>
            </div>
            <br />
        </div>
    );
}

export default Terms;
