ONE MEDI – Product Requirements Document (PRD)
1. Project Overview

ONE MEDI is a healthcare e-commerce platform tailored for India (starting with Kurnool). It provides medicines, lab tests, scans, homecare, diabetes care, physiotherapy, hospitals, insurance, blood banks, and ambulance services. The ecosystem includes:

Frontend Web App & Mobile App (customer-facing)

Admin Panel (business operators, service managers)

Backend Services (Node.js + PostgreSQL + MongoDB, APIs, authentication, payments, etc.)

The UI should be modern, mobile-first, intuitive, and visually aligned with healthcare trust factors (clean fonts, friendly icons, reliable colors: blue, green, white).

The design inspiration will be taken from your uploaded screenshots (clean layout, category cards, promotional banners, trending products section) and best practices from top e-commerce players like Amazon (search, filtering, personalization), Shopify (admin configurability), and Alibaba (bulk pricing, categories).

2. Target Users

Customers (patients, caregivers, general users)

Admin/Staff (managing catalog, services, inventory, orders, users, finances)

Partners (diagnostic centers, hospitals, doctors – may be added later with partner dashboards)

3. Frontend (Customer App) – Modules & Pages
3.1 Home Page

Top bar: Greeting (“Hello Karthik”), dropdown for city selection.

Search bar: with text + voice + camera search (medicine scanning).

Banners: promotional offers, seasonal health packs (dynamic from Admin).

Categories: (Cosmetics, Face Care, Body Care, etc. – scalable).

Quick links: Book Lab Test, Upload Prescription, Shop Medicines.

Trending products: horizontally scrollable list with product cards.

Best practices from Amazon:

Personalized recommendations.

“Buy it again” option for repeat orders.

Smart filters (by price, brand, delivery time).

3.2 Medicines Module

Categories → Subcategories → Product listing.

Product details page:

Name, brand, generic alternatives, dosage.

Price, MRP, discount, savings auto-calculated.

Delivery toggles: Express, Same-day, Standard Courier.

Expiry date, batch number, GST info.

Add to cart & Buy now.

Upload prescription (mandatory for Rx drugs).

Cart & checkout flow with payment options (UPI, cards, COD).

3.3 Lab Tests & Scans

Search by test/scan name, organ, disease.

Packages (Full body, Diabetes checkup, etc.).

Each test/scan linked to multiple diagnostic centers:

Price, discount, TAT (renamed to "Reports available in duration").

Waiting time, center details.

Booking flow: select center → slot → payment → order confirmation.

Reports upload/download section.

3.4 Other Healthcare Modules

Homecare & Physiotherapy Services: categories (elderly care, nursing, post-surgery care), caretaker profiles, booking by location.

Diabetes Care: care plans, glucose monitoring devices, packages.

Hospitals Listing: by city, specialties, doctors available.

Insurance Plans: comparison, benefits, buy/renew.

Blood Banks: availability by location, request form.

Ambulance Booking: real-time availability, request & track.

3.5 Orders & Invoices

My Orders page (filter by type: medicines, lab, services).

Order tracking: real-time (Socket.IO).

Auto-generated invoices (download PDF, share via WhatsApp/email).

3.6 Profile & Account

Login/Signup with email/phone OTP.

Role-based features (customer vs partner later).

Addresses, payment methods, health records.

Loyalty points, offers, wallet integration.

4. Admin Panel – Modules & Pages
4.1 Dashboard

KPIs: orders, revenue, active users, inventory alerts.

Graphs: sales trends, top-selling products/services.

4.2 Medicines Management

Products, categories, subcategories, manufacturers.

Bulk import/export (CSV/Excel).

Add/Edit fields: expiry, batch no, GST, alternatives.

Image uploads for categories/products.

Delivery settings (express/same-day/courier).

4.3 Lab Tests & Scans Management

Tests/Scans catalog with categories.

Multiple centers mapping with variable pricing/discounts.

Fields: TAT, waiting time, description, images.

Auto savings calculation.

Center management: name, address, city assignment.

4.4 Services Management

Homecare, diabetes care, physiotherapy.

Categories, caretaker profiles, locations, offers.

4.5 Other Modules

Hospitals listing: add hospital, specialties, assign doctors.

Insurance plans: provider, plan details, pricing.

Ambulance services: vendor, city assignment.

Blood banks: name, address, availability.

4.6 Orders & Invoices

All orders (medicines, lab, services).

Invoice templates (customizable, branded).

Download, share invoices.

Auto-generation with each order.

4.7 Users & Roles

Customers, staff, partners.

Role-based permissions.

Block/unblock, activity logs.

4.8 Marketing & CMS

Banner management.

Promo codes, referral campaigns.

SEO settings (title, meta, slug).

Notifications (email, SMS, push).

4.9 Business Settings

Basic Settings: store info, branding, logos.

Advanced Settings: payment gateways, tax rules, delivery zones.

Integrations: WhatsApp API, payment providers.

5. Backend Requirements

Stack: Node.js (Express/NestJS) + PostgreSQL + MongoDB.

APIs: REST + OpenAPI docs, JWT-based auth.

Real-time: Socket.IO for order tracking.

File storage: for prescriptions, reports, invoices.

Invoice engine: PDF generation.

Search & filtering: ElasticSearch (optional).

Security: RLS equivalent policies in backend, role-based APIs.

Scalability: microservices-ready architecture.

6. Design & UX

Mobile-first responsive design (like screenshots).

Consistent theme: clean cards, banners, gradient highlights.

Smooth navigation: breadcrumbs, back buttons, sticky cart.

Accessibility: large buttons, local language toggle.

7. Adopted Best Practices (Amazon, Shopify, WooCommerce, Alibaba)
smart recommendations, robust filtering, subscription orders.
 admin configurability, marketing automation.
 flexible product categorization, coupons.


8. Non-Functional Requirements

Performance: <2s page load.

Security: OWASP compliance, encryption.

Reliability: 99.9% uptime.

Scalability: support millions of SKUs.

Compliance: Indian telemedicine/e-pharmacy laws.

✅ This PRD covers frontend, backend, and admin panel with all modules. It also integrates your uploaded UI design style and industry best practice
