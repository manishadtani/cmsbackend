import mongoose from "mongoose";
import dotenv from "dotenv";
import Page from "../models/pageModel.js";
import Section from "../models/sectionModel.js";

dotenv.config();

const seedAbout = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ MongoDB Connected");

        // Check if About page already exists
        const existingPage = await Page.findOne({ slug: "about" });
        if (existingPage) {
            console.log("⚠️ About page already exists. Skipping...");
            process.exit();
        }

        // CREATE ABOUT PAGE
        const aboutPage = await Page.create({
            slug: "about",
            title: "About Us",
            route: "/about",
            seo: {
                metaTitle: "About Us | The Varallo Group",
                metaDescription:
                    "Learn more about The Varallo Group, our leadership, values, and decades of experience supporting court reporting firms.",
                metaKeywords:
                    "about varallo group, court reporting experts, legal support services",
            },
            isActive: true,
        });

        console.log("✅ About Page Created");

        // SECTION 1: HERO
        await Section.create({
            pageSlug: "about",
            sectionKey: "hero",
            order: 1,
            isActive: true,
            content: {
                heading: "Your Business is Safe in Our Hands",

                description:
                    "Rooted in a legacy of court reporting since 1937, The Varallo Group blends time-honored values with modern innovation to protect, preserve, and elevate the legal record.",

                cta: {
                    label: "Learn More",
                    link: "/services",
                },

                image: {
                    url: "/images/about/hero.jpg",
                    alt: "The Varallo Group leadership team",
                },
            },
        });


        console.log("✅ About Hero Section Created");

        // SECTION 2: MISSION
        await Section.create({
            pageSlug: "about",
            sectionKey: "mission",
            order: 2,
            isActive: true,
            content: {
                statement:
                    "Our goal is to serve as a trusted partner, delivering expert services as an extension of your team. We make your operations simpler, your results stronger, and give you more time to focus on what truly matters to you.",
            },
        });

        console.log("✅ About Mission Section Created");


        // SECTION 3: vision
        await Section.create({
            pageSlug: "about",
            sectionKey: "vision",
            order: 3,
            isActive: true,
            content: {
                heading: "Shaping the Future",

                para1:
                    "We strive to be the trusted partner powering the court reporting community with an expert team and scalable support.",

                para2:
                    "We’re building a future where every firm, big or small, has access to proven solutions backed by experience. Through smart tech and passionate people, we’re supporting the industry, one partnership at a time.",

                image: {
                    url: "/images/about/vision.jpg",
                    alt: "Professionals reviewing legal documents"
                }
            },
        });

        console.log("✅ About Vision Section Created");


        // SECTION 4: journey
        await Section.create({
            pageSlug: "about",
            sectionKey: "journey",
            order: 4,
            isActive: true,
            content: {
                heading: "The Varallo Group’s Journey",
                subHeading: "A family name, a lifelong commitment to excellence.",

                blocks: [
                    {
                        key: "legacy",
                        title: "Our Legacy",
                        description:
                            "Founded in 2001 with a clear mission to deliver exceptional court reporting and legal support services rooted in professionalism, reliability, and personal attention. The Varallo Group builds on a family legacy dating back to 1937. For nearly 100 years, the Varallo name has been synonymous with excellence in the field.",
                        image: {
                            url: "/images/about/legacy.jpg",
                            alt: "The Varallo Group leadership team",
                        },
                        imagePosition: "left",
                    },

                    {
                        key: "commitment",
                        title: "Our Commitment",
                        description:
                            "From the start, The Varallo Group set out to be a different kind of court reporting firm. We've assembled a team of experts dedicated to upholding the highest standards of accuracy, responsiveness, and service. Whether handling routine depositions, high-profile cases, administration, or communications, we bring the same precision, discretion, and care to every client. Our founder, Nancy Varallo, a lifelong court reporter and respected industry leader, shaped the company’s client-first culture. Under her guidance, The Varallo Group has grown into a trusted partner for court reporting firms, government agencies, and organizations nationwide.",
                        image: {
                            url: "/images/about/commitment.jpg",
                            alt: "Professionals collaborating in a meeting",
                        },
                        imagePosition: "right",
                    },

                    {
                        key: "future",
                        title: "Our Future",
                        description:
                            "What truly sets us apart is the people behind the name. Our team is loyal, experienced, and empowered to deliver results. We continuously invest in technology, talent, and training to stay ahead in a rapidly evolving legal landscape — because our clients rely on us to get it right, every time. At The Varallo Group, we combine a proud legacy of excellence with forward-thinking innovation to meet tomorrow’s challenges.",
                        image: {
                            url: "/images/about/future.jpg",
                            alt: "Diverse professional team standing together",
                        },
                        imagePosition: "left",
                    },
                ],
            },
        });

        console.log("✅ Journey Section Created");


        // SECTION 5: founder

        await Section.create({
            pageSlug: "about",
            sectionKey: "founder",
            order: 5,
            isActive: true,
            content: {
                quote: {
                    startImage: {
                        url: "/images/about/quote-start.png",
                        alt: "Opening quote icon",
                    },

                    text:
                        "Our team is the heart of The Varallo Group. They bring dedication, professionalism, and integrity to everything they do. I’m constantly inspired by their commitment to our clients and to each other. It’s a privilege to work alongside such talented people who take real pride in delivering excellence every single day.",

                    endImage: {
                        url: "/images/about/quote-end.png",
                        alt: "Closing quote icon",
                    },
                },

                name: "Nancy Varallo",

                profile: {
                    image: {
                        url: "/images/about/nancy-varallo.png",
                        alt: "Nancy Varallo, Founder of The Varallo Group",
                    },

                    socialLinks: [
                        {
                            platform: "linkedin",
                            url: "https://www.linkedin.com/in/nancy-varallo",
                            icon: "linkedin",
                        },
                        {
                            platform: "facebook",
                            url: "https://www.facebook.com/nancy.varallo",
                            icon: "facebook",
                        },
                    ],
                },

                para1:
                    "Nancy Varallo launched her court reporting career in 1979 and founded The Varallo Group in 2001, combining decades of expertise with a bold vision for better, smarter legal support. With a family name rooted in court reporting since 1937, Nancy carries that legacy forward through her unwavering commitment to quality, service, and innovation.",

                para2:
                    "From serving as President of the National Court Reporters Association to co-founding the Project to Advance Stenographic Reporting (Project Steno), Nancy has been a powerful advocate for the profession, mentoring students, creating industry programs, and overseeing high-profile cases. Known affectionately as the “Fearless Leader,” she brings heart, leadership, and family-first values to every part of The Varallo Group.",
            },
        });

        console.log("✅ Founder section (correct visual flow) created");


        // SECTION 6: leadership team

        await Section.create({
            pageSlug: "about",
            sectionKey: "leadership_team",
            order: 6,
            isActive: true,
            content: {
                heading: "The Pillars of The Varallo Group",
                subHeading: "The thinkers, doers, and leaders shaping your future.",

                members: [
                    {
                        name: "Nancy Varallo",
                        designation: "Founder and CEO",
                        image: {
                            url: "/images/team/nancy-varallo.png",
                            alt: "Nancy Varallo",
                        },
                        linkedin: "https://www.linkedin.com/in/nancy-varallo-8346a248/",
                    },
                    {
                        name: "George Catugono",
                        designation: "COO",
                        image: {
                            url: "/images/team/george-catugono.png",
                            alt: "George Catugono",
                        },
                        linkedin: "https://www.linkedin.com/in/george-catuogno-2627a67/",
                    },
                    {
                        name: "Cedar Bushong",
                        designation: "Director of IT and Marketing",
                        image: {
                            url: "/images/team/cedar-bushong.png",
                            alt: "Cedar Bushong",
                        },
                        linkedin: "https://www.linkedin.com/in/cedar-bushong-27b96751/",
                    },

                    // ---- remaining 5 (dummy / replace later) ----
                    {
                        name: "Ellie Reinhardt",
                        designation: "Director of Financial Operations",
                        image: { url: "/images/team/member-4.png", alt: "Team member" },
                        linkedin: "https://www.linkedin.com/in/ellie-reinhardt-565252b6/",
                    },
                    {
                        name: "Mike Schena",
                        designation: "Director of Business Development",
                        image: { url: "/images/team/member-5.png", alt: "Team member" },
                        linkedin: "https://www.linkedin.com/in/michael-schena-iii-774146aa/",
                    },
                    {
                        name: "Sarah Moynihan",
                        designation: "Director of Court Reporting Operations",
                        image: { url: "/images/team/member-6.png", alt: "Team member" },
                        linkedin: "https://www.linkedin.com/in/sarah-moynihan/",
                    },
                    {
                        name: "Pat Blaskopf",
                        designation: "Director of Video Services",
                        image: { url: "/images/team/member-7.png", alt: "Team member" },
                        linkedin: "https://www.linkedin.com/in/patrick-blaskopf/",
                    },
                    {
                        name: "Amelia Schneider",
                        designation: "Director of Association Services",
                        image: { url: "/images/team/member-8.png", alt: "Team member" },
                        linkedin: "https://www.linkedin.com/in/amelia-schneider-012617/",
                    },
                ],
            },
        });

        console.log("✅ Leadership team section created");


        await Section.create({
            pageSlug: "about",
            sectionKey: "testimonials",
            order: 7,
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




        console.log("\n✅✅✅ ABOUT PAGE SEEDING COMPLETE ✅✅✅");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding Error:", error.message);
        process.exit(1);
    }
};

seedAbout();
