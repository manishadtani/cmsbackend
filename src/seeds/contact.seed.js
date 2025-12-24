import mongoose from "mongoose";
import dotenv from "dotenv";
import Page from "../models/pageModel.js";
import Section from "../models/sectionModel.js";

dotenv.config();

const seedContact = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ MongoDB Connected");

        // Check if Contact page already exists
        const existingPage = await Page.findOne({ slug: "contact" });
        if (existingPage) {
            console.log("⚠️ Contact page already exists. Skipping...");
            process.exit();
        }

        // Create Contact Page
        const contactPage = await Page.create({
            slug: "contact",
            title: "Contact Us",
            route: "/contact",
            seo: {
                metaTitle: "Contact Us | The Varallo Group",
                metaDescription:
                    "Get in touch with The Varallo Group for court reporting, legal video, and administrative support services.",
                metaKeywords:
                    "contact, court reporting, legal services, varallo group",
            },
            isActive: true,
        });

        console.log("✅ Contact Page Created");

        // SECTION 1: CONTACT HERO
        
        const contactHeroSection = await Section.create({
            pageSlug: "contact",
            sectionKey: "contactHero",
            order: 1,
            isActive: true,
            content: {
                heading: "Start your journey with a conversation. Let's Connect!",
                description:
                    "Reach out today, we'll map the way forward with clear strategies and reliable legal assistance.",
                buttons: [
                    {
                        text: "Request a call back for other services",
                        link: "mailto:info@varallogroup.com",
                        type: "primary",
                    },
                    {
                        text: "Schedule a Deposition",
                        link: "#contact-main",
                        type: "link",
                        icon: "fal fa-external-link",
                    },
                ],
                mobileSlider: {
                    autoplay: true,
                    autoplaySpeed: 2000,
                    fade: true,
                    images: [
                        {
                            url: "/contact1.png",
                            alt: "Contact image 1",
                        },
                        {
                            url: "/contact2.png",
                            alt: "Contact image 2",
                        },
                        {
                            url: "/contact3.png",
                            alt: "Contact image 3",
                        },
                    ],
                },
                curvedSlider: {
                    enabled: true,
                    displayOn: "desktop",
                },
            },
        });


        console.log("✅ Contact Hero Section Created");

        // SECTION 2: CONTACT US FORM
         const contactUsFormSection = await Section.create({
            pageSlug: "contact",
            sectionKey: "contactUsForm",
            order: 2,
            isActive: true,
            content: {
                heading: "Contact Us",
                subHeading:
                    "Reach out today, we'll map the way forward with clear strategies and reliable assistance.",
                
                // Left Info Card
                infoCard: {
                    title: "You tell us. We Listen.",
                    description:
                        "Rely on our team to help your business succeed.",
                    
                    contactDetails: [
                        {
                            icon: "FiMapPin",
                            label: "Office Address:",
                            value: "34 Grafton Street, Suite 2\nMillbury, MA 01527",
                        },
                        {
                            icon: "FiPhone",
                            label: "Call us:",
                            value: "508.753.9282",
                        },
                        {
                            icon: "FiMail",
                            label: "Email us",
                            type: "dropdown",
                            subLabel: "Select services",
                            services: [
                                {
                                    name: "Scheduling",
                                    email: "schedule@thevarallogroup.com",
                                },
                                {
                                    name: "Production",
                                    email: "production@thevarallogroup.com",
                                },
                                {
                                    name: "Invoicing",
                                    email: "invoices@thevarallogroup.com",
                                },
                                {
                                    name: "Video",
                                    email: "video@thevarallogroup.com",
                                },
                                {
                                    name: "Marketing",
                                    email: "cedar@thevarallogroup.com",
                                },
                                {
                                    name: "General Inquiries",
                                    email: "info@thevarallogroup.com",
                                },
                            ],
                        },
                    ],
                    
                    socialLinks: [
                        {
                            icon: "FaLinkedin",
                            url: "#",
                            label: "LinkedIn",
                        },
                        {
                            icon: "FaFacebook",
                            url: "#",
                            label: "Facebook",
                        },
                    ],
                },
                
                // Map Configuration
                map: {
                    enabled: true,
                    embedUrl:
                        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2946.234567!2d-71.7575!3d42.1947!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89e3e8c8b2c0c9a3%3A0x123456789abcdef!2s34%20Grafton%20St%2C%20Millbury%2C%20MA%2001527!5e0!3m2!1sen!2sus!4v1700000000000",
                    height: "384px",
                },
                
                
            },
        });

        console.log("✅ Contact Us Form Section Created");

        console.log("🎉 Contact page seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding Error:", error.message);
        process.exit(1);
    }
};

seedContact();