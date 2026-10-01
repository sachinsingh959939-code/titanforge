# Project Synopsis

## 1. Project Title

**TITAN FORGE: Fitness, Gym Management and Performance Coaching Web Application**

## 2. Introduction

Titan Forge is a modern, responsive web-based fitness platform designed to connect gym members, fitness learners and gym administrators through one integrated application. The system combines gym information, workout programs, diet guidance, health calculators, fitness videos, memberships, product shopping and administrative data management.

The application provides a convenient digital experience for users to discover nearby gym branches, compare membership plans, book fitness classes, submit reviews, calculate BMI and daily macro requirements, explore diet plans, purchase fitness products and claim a free trial pass. Administrators can manage orders, leads, memberships, bookings, reminders and reviews from a dedicated dashboard.

## 3. Problem Statement

Traditional gym operations often depend on disconnected processes such as manual enquiries, phone-based class bookings, separate product sales, paper records and limited nutrition guidance. Users may also find it difficult to locate a suitable branch, compare plans or follow a personalized fitness routine.

Titan Forge addresses these issues by providing a centralized web application for fitness discovery, member engagement, e-commerce and gym administration.

## 4. Objectives

- To develop a responsive and user-friendly fitness website.
- To provide information about gym programs, trainers, schedules and memberships.
- To help users locate nearby gym branches using state, city and locality filters.
- To provide BMI and calorie/macro calculators for basic fitness planning.
- To offer celebrity-inspired diet plans and practical Indian food alternatives.
- To provide an online fitness product store with cart and payment support.
- To allow users to claim VIP trial passes, book classes and submit branch reviews.
- To provide administrators with centralized management of operational records.
- To support MongoDB storage with a local JSON backup mechanism for reliability.

## 5. Scope of the Project

The project covers the following functional areas:

### User Module

- View the home page, programs, schedules, trainers and transformations.
- Explore membership plans and submit membership enrolment details.
- Claim a three-day VIP trial pass.
- Locate nearby Titan Forge branches and view map directions.
- View branch pricing, coaches, crowd information and reviews.
- Book available fitness classes.
- Submit ratings and reviews for a gym branch.

### Fitness and Nutrition Module

- Calculate Body Mass Index using metric or imperial units.
- Calculate estimated BMR, TDEE, calories and macronutrient targets.
- Browse celebrity and influencer-inspired diet plans.
- Search and filter diet plans by athlete, goal or diet style.
- Use the smart food-swap tool to find budget-friendly alternatives.
- Access workout and fitness videos through the video library.
- View a college women daily diet plan document.

### Store and Payment Module

- Browse fitness products and view product ratings.
- Add products to a shopping cart.
- Apply promotional codes and calculate order totals.
- Submit customer and delivery details.
- Support UPI, pay-at-gym and Razorpay test payment flows.
- Store order details for administrative review.

### Administration Module

- Monitor MongoDB connection status.
- View store orders, memberships, VIP leads and class bookings.
- View and moderate customer reviews.
- Create and send member reminders through available email or WhatsApp providers.
- View summary statistics such as order count, revenue and lead count.

## 6. Proposed System

The proposed system is a client-server web application. The frontend is built using HTML, CSS and JavaScript. The backend uses a lightweight Python HTTP server that serves frontend files and exposes REST-style API endpoints. MongoDB is used as the primary database when available, while `gym_backup.json` provides local data persistence when MongoDB is offline.

This architecture allows the application to work in local development mode and continue storing important records even when an external database connection is unavailable.

## 7. Technology Stack

| Layer | Technology |
|---|---|
| Frontend structure | HTML5 |
| Styling | CSS3, responsive layouts and custom CSS modules |
| Client-side logic | Vanilla JavaScript |
| Backend | Python `http.server` and `socketserver` |
| Database | MongoDB using PyMongo |
| Backup storage | JSON file (`gym_backup.json`) |
| Payment integration | Razorpay Checkout test integration |
| Maps | Embedded map view and map links |
| External data | Wikipedia REST API for selected profile information |
| Communication | SMTP, Twilio and WhatsApp provider support through environment variables |
| Development server | Python local server on port 8000 |

## 8. Main Modules

1. **Home and Gym Information Module**: Displays programs, trainers, schedules, transformations, FAQs and membership plans.
2. **Branch Locator Module**: Filters branches by state, district, locality and landmark and shows map directions.
3. **Fitness Calculator Module**: Calculates BMI, BMR, calorie targets and macro targets.
4. **Diet Lab Module**: Provides diet catalogues, search, filtering and economical food substitutions.
5. **Video Library Module**: Organizes workout videos and routines by fitness requirement.
6. **Membership and Lead Module**: Handles memberships and free-trial enquiries.
7. **Class Booking and Review Module**: Stores class bookings and branch reviews for moderation.
8. **E-commerce Module**: Provides product listing, cart, discounts, checkout and payment options.
9. **Admin Module**: Provides operational monitoring and management of application records.
10. **Notification Module**: Supports scheduled reminders through email and messaging providers.

## 9. Database Design

The application uses the following logical collections/tables:

- `orders`: Customer orders, purchased products, payment references and delivery details.
- `vip_leads`: Free-pass enquiries and customer contact information.
- `memberships`: Membership tier, customer information, payment mode and transaction reference.
- `class_bookings`: Member details and selected class information.
- `reviews`: Branch reviews, ratings, moderation status and timestamps.
- `reminders`: Member reminder messages, scheduled time and provider status.

When MongoDB is unavailable, the same operational data is stored in `gym_backup.json` so that local development and basic data continuity can continue.

## 10. API Endpoints

- `GET /api/status` - Returns server and database connection status.
- `GET /api/orders` and `POST /api/orders` - Retrieves and stores store orders.
- `GET /api/leads` and `POST /api/leads` - Retrieves and stores VIP leads.
- `GET /api/memberships` and `POST /api/memberships` - Retrieves and stores memberships.
- `GET /api/bookings` and `POST /api/bookings` - Retrieves and stores class bookings.
- `GET /api/reviews` and `POST /api/reviews` - Retrieves and stores branch reviews.
- `PATCH /api/reviews` - Approves or rejects a review.
- `GET /api/reminders` and `POST /api/reminders` - Retrieves and stores reminders.
- `POST /api/reminders/send` - Sends or simulates a member reminder.

## 11. Functional Requirements

- The system shall display responsive pages on desktop and mobile devices.
- The system shall allow users to search and filter gym branches.
- The system shall calculate BMI and estimated nutrition requirements from user input.
- The system shall allow users to browse diet plans and fitness videos.
- The system shall allow users to add products to a cart and place orders.
- The system shall store leads, bookings, memberships, reviews and orders.
- The system shall allow administrators to view and moderate records.
- The system shall use MongoDB when connected and local JSON backup otherwise.
- The system shall validate basic form inputs before submission.

## 12. Non-Functional Requirements

- **Usability:** Interfaces should be clear, responsive and easy to navigate.
- **Performance:** Static pages and client-side tools should load quickly on a local network.
- **Reliability:** Local backup storage should reduce data loss during database outages.
- **Maintainability:** Features are separated into page-specific JavaScript and CSS modules.
- **Scalability:** MongoDB collections and REST endpoints can support future member and branch expansion.
- **Security:** Payment credentials and communication credentials should be supplied through secure environment configuration rather than hard-coded production secrets.

## 13. Feasibility Study

### Technical Feasibility

The project uses commonly available technologies including HTML, CSS, JavaScript, Python and MongoDB. It can run locally using Python and can be extended to a hosted server in the future.

### Economic Feasibility

The core application uses open-source technologies and can be developed with minimal infrastructure cost. Optional services such as Razorpay, email, WhatsApp and cloud MongoDB may introduce operational charges.

### Operational Feasibility

The system is designed for simple use by gym visitors, members and administrators. The admin panel provides a single location for monitoring routine gym operations.

## 14. Testing Plan

- Test navigation between all pages and sections.
- Test responsive layout on desktop, tablet and mobile screen sizes.
- Test valid and invalid inputs in all forms.
- Test BMI and macro calculator outputs with known sample values.
- Test branch filtering, searching and map link generation.
- Test cart quantity, discount and total calculations.
- Test order, membership, lead and booking API storage.
- Test review submission and admin approval/rejection.
- Test MongoDB mode and local backup mode separately.
- Test graceful behaviour when payment or external messaging providers are unavailable.

## 15. Limitations

- The payment gateway is configured for test/demo usage and requires production credentials for live payments.
- Fitness calculations are estimates and are not a substitute for professional medical or dietetic advice.
- Live crowd information and branch availability may require integration with real-time operational data.
- Authentication and role-based access control should be strengthened before public production deployment.
- Email, WhatsApp and SMS delivery depends on correctly configured external provider credentials.

## 16. Future Enhancements

- Add secure user registration, login and role-based access control.
- Add a member dashboard containing attendance, payments and workout progress.
- Add trainer dashboards and personalized workout plan assignment.
- Integrate live class capacity, attendance and branch crowd data.
- Add real-time notifications through push notifications or SMS.
- Add production payment verification and automated invoices.
- Add advanced analytics for retention, revenue and membership trends.
- Deploy the backend and database to a secure cloud environment.
- Add automated test coverage and API authentication.

## 17. Expected Outcome

The completed Titan Forge application will provide a unified digital platform for gym discovery, fitness education, nutrition assistance, product purchases and gym administration. It will reduce dependence on manual processes, improve user engagement and provide administrators with better visibility into daily operations.

## 18. Conclusion

Titan Forge demonstrates how a fitness organization can use a modern web application to combine customer-facing services with internal gym management. By integrating branch discovery, fitness calculators, diet resources, video content, memberships, e-commerce and administrative tools, the system creates a complete and practical digital fitness ecosystem.

## 19. Student Details

- **Student Name:** ______________________________
- **Enrollment/Roll Number:** ____________________
- **Course/Semester:** ___________________________
- **College/Institute:** __________________________
- **Project Guide:** ______________________________
- **Academic Year:** 2026-2027
