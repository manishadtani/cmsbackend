import mongoose from "mongoose";
import dotenv from "dotenv";

import Page from "../models/pageModel.js";
import Section from "../models/sectionModel.js";

dotenv.config();

const seedServices = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ MongoDB connected");

        /* ------------------------------
           1️⃣ SERVICES PARENT PAGE
        ------------------------------ */

        const servicesPage = await Page.findOneAndUpdate(
            { slug: "services" },
            {
                slug: "services",
                title: "Services",
                route: "/services",
                parentSlug: null,
                showInNavbar: true,
                order: 2,
                seo: {
                    metaTitle: "Our Services | The Varallo Group",
                    metaDescription:
                        "Explore The Varallo Group’s full suite of court reporting and legal support services.",
                },
            },
            { upsert: true, new: true }
        );

        console.log("✅ Services parent page seeded");

        /* ------------------------------
           2️⃣ SERVICES CHILD PAGES
        ------------------------------ */

        const services = [
            {
                slug: "tvg-management",
                title: "TVG Management",
                order: 1,
            },

            {
                slug: "tvg-stream",
                title: "TVG Stream",
                order: 2,
            },
            {
                slug: "tvg-books",
                title: "TVG Books",
                order: 3,
            },
            {
                slug: "tvg-connect",
                title: "TVG Connect",
                order: 4,
            },
            {
                slug: "tvg-verify",
                title: "TVG Verify",
                order: 5,
            },
            {
                slug: "tvg-reporting",
                title: "TVG Reporting",
                order: 6,
            },
        ];

        for (const service of services) {
            await Page.findOneAndUpdate(
                { slug: service.slug },
                {
                    slug: service.slug,
                    title: service.title,
                    route: `/services/${service.slug}`,
                    parentSlug: "services",
                    showInNavbar: false, // hover me ayega
                    order: service.order,
                    seo: {
                        metaTitle: `${service.title} | The Varallo Group`,
                        metaDescription: `Learn more about ${service.title} services at The Varallo Group.`,
                    },
                },
                { upsert: true, new: true }
            );
        }

        console.log("✅ All service pages seeded");

        /* ------------------------------
           3️⃣ OPTIONAL: SERVICES HERO SECTION
           (Only for /services page)
        ------------------------------ */

        await Section.findOneAndUpdate(
            {
                pageSlug: "services",
                sectionKey: "services-hero",
            },
            {
                pageSlug: "services",
                sectionKey: "services-hero",
                order: 2, // after the main hero section
                isActive: true,
                content: {
                    leftImage: {
                        url: "/images/services/hero-left.png",
                        alt: "TVG Services overview",
                    },
                    centerContent: {
                        heading: "A Support Company That Understands Your Business",
                        circularImage: {
                            url: "/images/services/hero-circular.png",
                            alt: "Integrated services ecosystem",
                        },
                        description:
                            "At The Varallo Group, we bring together six specialized sub-brands under one clear vision. We are your single source for smarter, effective, and scalable success.",
                        cta: {
                            label: "Schedule a call now",
                            link: "/contact",
                            icon: true,
                        },
                    },
                    rightImage: {
                        url: "/images/services/hero-right.png",
                        alt: "Professional legal support",
                    },
                },
            },
            { upsert: true, new: true }
        );

        console.log("✅ Services parent hero section seeded");


        console.log("✅ Services hero section seeded");

        console.log("🎉 SERVICES SEED COMPLETED SUCCESSFULLY");
        process.exit(0);
    } catch (error) {
        console.error("❌ Services seed failed:", error);
        process.exit(1);
    }
};

seedServices();









