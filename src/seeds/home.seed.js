import mongoose from "mongoose";
import dotenv from "dotenv";
import Page from "../models/pageModel.js";
import Section from "../models/sectionModel.js";

dotenv.config();

const seedHome = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ MongoDB Connected");

        // Check if Home page already exists
        const existingPage = await Page.findOne({ slug: "home" });
        if (existingPage) {
            console.log("⚠️ Home page already exists. Skipping...");
            process.exit();
        }

        // Create Home Page
        const homePage = await Page.create({
            slug: "home",
            title: "Home",
            route: "/",
            seo: {
                metaTitle: "Court Reporting Services | The Varallo Group",
                metaDescription:
                    "Trusted court reporting, legal video and administrative support services.",
                metaKeywords:
                    "court reporting, legal video, administration, varallo",
            },
            isActive: true,
        });

        console.log("✅ Home Page Created");

        // SECTION 1: HERO
        const heroSection = await Section.create({
            pageSlug: "home",
            sectionKey: "hero",
            order: 1,
            isActive: true,
            content: {
                heading: "Court Reporting",
                subHeading:
                    "Focused Expertise to Support You Every Step of the Way",
                description:
                    "Your trusted partner for court reporting, legal video, association management, and administrative support services.",
                button: {
                    label: "Learn more",
                    link: "/about",
                },
                image: {
                    url: "/images/home/hero-main.jpg",
                    alt: "Court reporting professional",
                },
            },
        });

        console.log("✅ Hero Section Created");

        // SECTION 2: EXPERIENCE
        const experienceSection = await Section.create({
            pageSlug: "home",
            sectionKey: "experience",
            order: 2,
            isActive: true,
            content: {
                title: "Decades of Experience. One Trusted Team.",
                subHeading:
                    "Delivering Solutions to Court Reporting Firms Across the U.S.",
                description:
                    "Delivering Solutions to Court Reporting Firms Across the U.S. Backed by over 50 years of leadership and expertise in the court reporting industry, The Varallo Group combines a rich legacy, unwavering commitment, and forward-thinking innovation to empower and support your firm every step of the way.",

                image: {
                    url: "/images/home/experience.jpg",
                    alt: "Professional team",
                },

                whatSetsUsApart: {
                    heading: "What Sets Us Apart",
                    description:
                        "Our handpicked team draws from decades of experience, delivering service with precision and professionalism. Think of us as a trusted extension of your team, dedicated to driving results together.",
                },

                highlights: [
                    {
                        icon: "/images/home/ab-1.png",
                        title: "Technology-Driven",
                        description:
                            "We leverage advanced tools to streamline scheduling, delivery, and communication so you can scale with confidence.",
                    },
                    {
                        icon: "/images/home/ab-2.png",
                        title: "Confidential & Reliable",
                        description:
                            "We recognize the trust you’ve placed in us, and we’re dedicated to protecting the confidentiality of your private company information.",
                    },
                    {
                        icon: "/images/home/ab-3.png",
                        title: "People First",
                        description:
                            "It’s not just what we do, it’s about the people we serve. Our dedicated team brings genuine passion to help your business thrive and succeed.",
                    },
                ],
            },
        });


        console.log("✅ Experience Section Created");

        // SECTION 3: SERVICES
        const servicesSection = await Section.create({
            pageSlug: "home",
            sectionKey: "services",
            order: 3,
            isActive: true,
            content: {
                title: "Smart Support. Smart Solutions.",
                button: {
                    label: "Let's Get Started",
                    link: "/contact",
                },
                paragraph1: [
                    "Our team is the heart of The Varallo Group. They bring dedication, professionalism, and integrity to everything they do. I’m constantly inspired by their commitment to our clients and to each other. It's a privilege to work alongside such talented people who take real pride in delivering excellence every single day.",
                ],
                paragraph2: [
                    "At The Varallo Group, our services are built to simplify, strengthen, and scale your operations. Whether you're a court reporting firm, a professional organization, or an individual, our expertise meets your needs right where you are and right when you need it.",
                ],
                cards: [
                    {
                        title: "TVG Verify",
                        description:
                            "Let us ensure your hiring is secure with reliable background screening and compliance checks.",
                        image: "/images/home/verify.jpg",
                    },
                    {
                        title: "TVG Management",
                        description:
                            "Comprehensive agency management support focused on optimizing day-to-day operations.",
                        image: "/images/home/management.jpg",
                    },
                    {
                        title: "TVG Legal Video",
                        description: "High-quality legal video services to support your cases.",
                        image: "/images/home/legal-video.jpg",
                    },
                    {
                        title: "TVG Scheduling",
                        description: "Smart scheduling solutions built for efficiency.",
                        image: "/images/home/scheduling.jpg",
                    },
                    {
                        title: "TVG Support",
                        description: "Dedicated support teams that scale with your firm.",
                        image: "/images/home/support.jpg",
                    },
                    {
                        title: "TVG Compliance",
                        description: "Compliance services you can trust.",
                        image: "/images/home/compliance.jpg",
                    },
                ],
            },
        });

        console.log("✅ Services Section Created");


        // SECTION 4: TRUST / EXPERIENCE SUPPORT
        const trustSection = await Section.create({
            pageSlug: "home",
            sectionKey: "trust",
            order: 4,
            isActive: true,
            content: {
                heading: "Experience That Performs. Support You Deserve.",
                description:
                    "For court reporting firms that value reliability, accuracy, and confidentiality, our team delivers more than just services; we deliver peace of mind.",
                image: {
                    url: "/images/home/trust.jpg",
                    alt: "Hands typing on stenography machine",
                },
                cards: [
                    {
                        text: "Decades of expertise, led by Nancy Varallo. Teacher. Mentor. Industry Leader.",
                        learnMore: {
                            label: "Learn More",
                            url: "/services",
                        },
                    },
                    {
                        text: "Precision in every word. Because in law, details matter.",
                        learnMore: {
                            label: "Learn More",
                            url: "/services",
                        },
                    },
                ],
                stats: [
                    {
                        value: "500+",
                        label: "Court reporting firms served",
                    },
                    {
                        value: "40K+",
                        label: "Attorneys assisted by our team",
                    },
                    {
                        value: "24+",
                        label: "Years in business",
                    },
                    {
                        value: "2.5M+",
                        label: "Depositions Handled",
                    },
                ],
            },
        });

        console.log("✅ Trust Section Created");


        // SECTION 5: CAPABILITIES / OFFERINGS
        const capabilitiesSection = await Section.create({
            pageSlug: "home",
            sectionKey: "capabilities",
            order: 5,
            isActive: true,
            content: {
                heading: "Our Capabilities",
                description: "Delivering expert solutions across the nation with technology and human insight.",
                cards: [
                    {
                        title: "Nationwide Reach. Local Expertise.",
                        body: "Trusted with skilled professionals across all 50 states, we offer personalized court reporting and legal services backed by decades of regional expertise.",
                        image: {
                            url: "/images/home/capability-1.jpg",
                            alt: "Group of professionals smiling",
                        },
                        learnMore: {
                            label: "Learn More",
                            url: "/services",
                        },
                    },
                    {
                        title: "One Team. Multiple Solutions.",
                        body: "From court reporting coverage to administrative and business support, our team offers a comprehensive range of services customized to meet your firm's unique needs.",
                        image: {
                            url: "/images/home/capability-2.jpg",
                            alt: "Two professionals working on a tablet with scales",
                        },
                        learnMore: {
                            label: "Learn More",
                            url: "/services",
                        },
                    },
                    {
                        title: "Tech Driven. People Focused.",
                        body: "We combine advanced technology with genuine human insight to deliver efficient, secure, and attentive support. Because behind every service is a team that truly cares.",
                        image: {
                            url: "/images/home/capability-3.jpg",
                            alt: "Camera crew filming studio discussion",
                        },
                        learnMore: {
                            label: "Learn More",
                            url: "/services",
                        },
                    },
                ],
            },
        });

        console.log("✅ Capabilities Section Created");

        // SECTION 6: TESTIMONIALS / CLIENT TRUST
        const testimonialsSection = await Section.create({
            pageSlug: "home",
            sectionKey: "testimonials",
            order: 6,
            isActive: true,
            content: {
                heading: "Why Our Clients Choose Us Again & Again",
                cards: [
                    {
                        name: "Pam Owen",
                        company: "BOSS Reporters",
                        text: "I am so appreciative of what you have taught me and for all of your efforts. I am very pleased with the progress we've made together and grateful for your positivity and eagerness to get all the ducks in a row. I am optimistic and very excited about the future, and know I am lucky to have found you."
                    },
                    {
                        name: "Mary Beth Johnson",
                        company: "Community College of Allegheny County",
                        text: "May I begin by thanking you for a lifetime of work on behalf of Steno reporting. Your brilliance in creating A to Z and Basic Training saved our profession. As a result of your initiative, we now teach students from Oregon to Atlanta. You had vision, and I am grateful for your foresight."
                    },
                    {
                        name: "Michael Lewis",
                        company: "Discovery Legal Services",
                        text: "Working with The Varallo Group and Cedar Bushong has been an excellent experience. Their team handled our website development with precision, creating a site that truly reflects our brand and meets our needs. Beyond the initial development, their ongoing support has been invaluable. They are consistently responsive and supportive, addressing any issues promptly and helping us adapt our site as our business evolves. We couldn't be happier with their dedication and commitment to our success. Highly recommend!"
                    },
                    {
                        name: "Michael Scire",
                        company: "Florida Court Reporters Association",
                        text: "Such a great experience working with The Varallo Group. I cannot say enough wonderful things about each of you. You are all professional, helpful, efficient, and respectful. You all jumped right in and often offered help when I didn't realize I needed it. The conference ran seamlessly. Thank you from the bottom of my heart."
                    },
                    {
                        name: "Ray Catuogno, Jr.",
                        company: "Real Time Court Reporting",
                        text: "I don't get an opportunity to say it often enough, but I really appreciate the effort and hard work that everyone puts into making my business operations run smoothly. My work to establish the business was done long ago, and now it's everyone else's work that continues to make the business a success. So thanks for the big things that are a pain to do, and thanks for the little things that don't get as much notice but are just as important."
                    },
                ],
            },
        });
        console.log("✅ Testimonials Section Created");


       

        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding Error:", error.message);
        process.exit(1);
    }
};

seedHome();
