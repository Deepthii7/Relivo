/*
 * RELIVO — Mock data layer ("Eco-Tech Glasshouse")
 * Simulates the backend entities described in the project handoff:
 * Users, Resources, Requests, Donations, Notifications, AI Recommendations, Analytics.
 * All frontend flows (auth, dashboards, browse, request, AI) work against this data.
 */

export type Role = "donor" | "recipient" | "admin";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  organization: string;
  location: string;
}

export type ResourceCondition = "Like New" | "Good" | "Fair" | "Needs Repair";
export type ResourceStatus = "Available" | "Reserved" | "Allocated" | "Picked Up" | "Delivered";

export interface Resource {
  id: number;
  title: string;
  category: string;
  description: string;
  quantity: number;
  condition: ResourceCondition;
  location: string;
  distanceKm: number;
  status: ResourceStatus;
  donorId: number;
  donorName: string;
  donorOrg: string;
  uploadedDaysAgo: number;
  imageUrl?: string;
  requestedCount: number;
}

export type RequestStatus = "Pending" | "Approved" | "Reserved" | "Pickup Scheduled" | "Completed" | "Rejected" | "Waitlisted";

export interface Request {
  id: number;
  resourceId: number;
  resourceTitle: string;
  recipientId: number;
  recipientName: string;
  recipientOrg: string;
  quantity: number;
  priority: number;
  status: RequestStatus;
  reason: string;
  createdAt: string;
}

export interface Donation {
  id: number;
  donorId: number;
  donorName: string;
  resourceTitle: string;
  quantity: number;
  date: string;
  status: ResourceStatus;
}

export type NotificationType = "approved" | "rejected" | "reserved" | "pickup" | "completed" | "ai";

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

export interface AIRecommendation {
  id: number;
  resourceTitle: string;
  recipientName: string;
  recipientOrg: string;
  score: number;
  reasons: string[];
  demandLevel: "High" | "Medium" | "Low";
  distanceKm: number;
  quantityRequired: number;
  urgency: "Critical" | "High" | "Normal";
  previousDonations: number;
}

export const RESOURCES: Resource[] = [
  { id: 1, title: "Refurbished Laptops", category: "Electronics", description: "20 business-class laptops, freshly refurbished and tested with chargers. Ideal for computer labs.", quantity: 20, condition: "Good", location: "Koramangala, Bangalore", distanceKm: 3.2, status: "Available", donorId: 2, donorName: "Priya Sharma", donorOrg: "TechFlow Systems Pvt. Ltd.", uploadedDaysAgo: 2, requestedCount: 6, imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80" },
  { id: 2, title: "Classroom Desks & Chairs", category: "Furniture", description: "30 wooden student desks with attached chairs, sturdy condition, suitable for government schools.", quantity: 30, condition: "Fair", location: "HSR Layout, Bangalore", distanceKm: 5.8, status: "Available", donorId: 2, donorName: "Ravi Kumar", donorOrg: "Urban Furniture Co.", uploadedDaysAgo: 4, requestedCount: 4, imageUrl: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80" },
  { id: 3, title: "Library Books — Science & Math", category: "Books", description: "450 textbooks and reference books for grades 6–10, mostly recent editions.", quantity: 450, condition: "Good", location: "Jayanagar, Bangalore", distanceKm: 7.1, status: "Available", donorId: 3, donorName: "Meenakshi Iyer", donorOrg: "City Central Library", uploadedDaysAgo: 1, requestedCount: 9, imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80" },
  { id: 4, title: "Digital Projectors", category: "Electronics", description: "5 HD projectors with remotes and HDMI cables, retired from our conference rooms but fully functional.", quantity: 5, condition: "Like New", location: "Whitefield, Bangalore", distanceKm: 12.4, status: "Available", donorId: 4, donorName: "Arjun Menon", donorOrg: "Nimbus Cloud Services", uploadedDaysAgo: 6, requestedCount: 3, imageUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80" },
  { id: 5, title: "Sports Equipment Bundle", category: "Sports", description: "Cricket kits, footballs, volleyball nets, badminton rackets and mats for school physical education programs.", quantity: 120, condition: "Good", location: "Indiranagar, Bangalore", distanceKm: 4.5, status: "Available", donorId: 5, donorName: "Sneha Reddy", donorOrg: "Greenfield Sports Club", uploadedDaysAgo: 3, requestedCount: 5, imageUrl: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80" },
  { id: 6, title: "Science Lab Kits", category: "Educational", description: "Chemistry and physics lab kits: beakers, burners, circuit boards, optics sets. Perfect for rural school labs.", quantity: 15, condition: "Like New", location: "Electronic City, Bangalore", distanceKm: 14.6, status: "Available", donorId: 6, donorName: "Dr. Farhan Khan", donorOrg: "Apex Research Institute", uploadedDaysAgo: 7, requestedCount: 2, imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80" },
  { id: 7, title: "Office Chairs (Ergonomic)", category: "Furniture", description: "25 ergonomic office chairs with adjustable height, minor wear on upholstery.", quantity: 25, condition: "Fair", location: "MG Road, Bangalore", distanceKm: 6.3, status: "Reserved", donorId: 2, donorName: "Priya Sharma", donorOrg: "TechFlow Systems Pvt. Ltd.", uploadedDaysAgo: 5, requestedCount: 7, imageUrl: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80" },
  { id: 8, title: "Musical Instruments", category: "Educational", description: "Keyboards, tabla, harmoniums and veenas from a closed music academy — ready to teach again.", quantity: 18, condition: "Good", location: "Basavanagudi, Bangalore", distanceKm: 8.9, status: "Available", donorId: 7, donorName: "Lakshmi Narayan", donorOrg: "Swaralaya Music Academy", uploadedDaysAgo: 9, requestedCount: 1, imageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80" },
  { id: 9, title: "Fabric & Tailoring Materials", category: "Materials", description: "Rolls of cotton fabric, threads and sewing machine parts donated by a closing garment unit.", quantity: 80, condition: "Like New", location: "Peenya, Bangalore", distanceKm: 16.2, status: "Available", donorId: 8, donorName: "Suresh Gowda", donorOrg: "Lakshmi Garments", uploadedDaysAgo: 8, requestedCount: 2, imageUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80" },
  { id: 10, title: "Woodworking Tools", category: "Materials", description: "Hand saws, chisels, drills and safety equipment from a carpentry workshop upgrade.", quantity: 40, condition: "Good", location: "Yelahanka, Bangalore", distanceKm: 18.5, status: "Available", donorId: 9, donorName: "Imran Sheikh", donorOrg: "Sheikh Woodcrafts", uploadedDaysAgo: 10, requestedCount: 1, imageUrl: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80" },
  { id: 11, title: "Smart TVs for Learning", category: "Electronics", description: "8 smart TVs, 32-inch, with wall mounts. Great for digital classrooms.", quantity: 8, condition: "Like New", location: "Marathahalli, Bangalore", distanceKm: 11.0, status: "Allocated", donorId: 4, donorName: "Arjun Menon", donorOrg: "Nimbus Cloud Services", uploadedDaysAgo: 12, requestedCount: 8, imageUrl: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&q=80" },
  { id: 12, title: "Stationery Bulk Lot", category: "Stationery", description: "Notebooks, pens, geometry boxes and art supplies — enough to stock a small school for a term.", quantity: 500, condition: "Like New", location: "Vijayanagar, Bangalore", distanceKm: 9.7, status: "Available", donorId: 3, donorName: "Meenakshi Iyer", donorOrg: "City Central Library", uploadedDaysAgo: 2, requestedCount: 4, imageUrl: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800&q=80" },
];

export const REQUESTS: Request[] = [
  { id: 1, resourceId: 1, resourceTitle: "Refurbished Laptops", recipientId: 10, recipientName: "Zayed Ahmed", recipientOrg: "Government School No. 47, Bangalore", quantity: 10, priority: 95, status: "Pending", reason: "Computer lab upgrade for 450 students; no existing machines.", createdAt: "2026-08-13" },
  { id: 2, resourceId: 1, resourceTitle: "Refurbished Laptops", recipientId: 11, recipientName: "Kavitha Rao", recipientOrg: "Hope Foundation NGO", quantity: 8, priority: 88, status: "Pending", reason: "Digital literacy program for 200 underprivileged women.", createdAt: "2026-08-13" },
  { id: 3, resourceId: 3, resourceTitle: "Library Books — Science & Math", recipientId: 12, recipientName: "Ramesh Pillai", recipientOrg: "Rural Learning Center, Channapatna", quantity: 200, priority: 80, status: "Approved", reason: "Library has 40 books for 320 children.", createdAt: "2026-08-12" },
  { id: 4, resourceId: 5, resourceTitle: "Sports Equipment Bundle", recipientId: 10, recipientName: "Zayed Ahmed", recipientOrg: "Government School No. 47, Bangalore", quantity: 60, priority: 72, status: "Pickup Scheduled", reason: "Annual sports meet; no equipment budget this year.", createdAt: "2026-08-11" },
  { id: 5, resourceId: 4, resourceTitle: "Digital Projectors", recipientId: 13, recipientName: "Fatima Begum", recipientOrg: "Al-Noor Community Library", quantity: 3, priority: 90, status: "Completed", reason: "Digital storytelling sessions for children.", createdAt: "2026-08-09" },
  { id: 6, resourceId: 11, resourceTitle: "Smart TVs for Learning", recipientId: 12, recipientName: "Ramesh Pillai", recipientOrg: "Rural Learning Center, Channapatna", quantity: 6, priority: 84, status: "Reserved", reason: "Smart classroom pilot with state education board.", createdAt: "2026-08-10" },
  { id: 7, resourceId: 2, resourceTitle: "Classroom Desks & Chairs", recipientId: 10, recipientName: "Zayed Ahmed", recipientOrg: "Government School No. 47, Bangalore", quantity: 30, priority: 76, status: "Completed", reason: "Students currently sit on floor mats.", createdAt: "2026-08-08" },
  { id: 8, resourceId: 12, resourceTitle: "Stationery Bulk Lot", recipientId: 11, recipientName: "Kavitha Rao", recipientOrg: "Hope Foundation NGO", quantity: 300, priority: 68, status: "Pending", reason: "Back-to-school kit distribution for 150 children.", createdAt: "2026-08-14" },
];

export const DONATIONS: Donation[] = [
  { id: 1, donorId: 2, donorName: "TechFlow Systems Pvt. Ltd.", resourceTitle: "Refurbished Laptops", quantity: 20, date: "2026-08-13", status: "Available" },
  { id: 2, donorId: 2, donorName: "TechFlow Systems Pvt. Ltd.", resourceTitle: "Office Chairs (Ergonomic)", quantity: 25, date: "2026-08-10", status: "Reserved" },
  { id: 3, donorId: 2, donorName: "TechFlow Systems Pvt. Ltd.", resourceTitle: "Classroom Desks & Chairs", quantity: 30, date: "2026-08-06", status: "Delivered" },
  { id: 4, donorId: 3, donorName: "City Central Library", resourceTitle: "Library Books — Science & Math", quantity: 450, date: "2026-08-14", status: "Available" },
  { id: 5, donorId: 4, donorName: "Nimbus Cloud Services", resourceTitle: "Smart TVs for Learning", quantity: 8, date: "2026-08-03", status: "Allocated" },
];

export const NOTIFICATIONS: Notification[] = [
  { id: 1, userId: 10, title: "Request Approved", message: "Your request for 10 Refurbished Laptops from TechFlow Systems has been approved. Reservation window: 48 hours.", type: "approved", read: false, createdAt: "2026-08-14 09:12" },
  { id: 2, userId: 10, title: "AI Recommendation Ready", message: "A new AI match found: Hope Foundation NGO scored 88 for the 20 Laptop donation — nearby, high demand, no recent laptop donation.", type: "ai", read: false, createdAt: "2026-08-14 08:30" },
  { id: 3, userId: 10, title: "Pickup Scheduled", message: "Pickup for Sports Equipment Bundle (60 items) is scheduled for Aug 16, 10:00 AM at Greenfield Sports Club.", type: "pickup", read: true, createdAt: "2026-08-13 16:45" },
  { id: 4, userId: 10, title: "Resource Reserved", message: "Your request has moved to Reserved. Please confirm collection within the synchronization timeout to avoid release.", type: "reserved", read: true, createdAt: "2026-08-12 11:20" },
  { id: 5, userId: 10, title: "Donation Completed", message: "Digital Projectors ×3 delivered to Al-Noor Community Library. Thank you for reusing!", type: "completed", read: true, createdAt: "2026-08-11 14:05" },
  { id: 6, userId: 10, title: "Request Waitlisted", message: "A simultaneous request for Office Chairs was synchronized — your request is queued behind an approved reservation.", type: "rejected", read: true, createdAt: "2026-08-10 10:33" },
];

export const AI_RECOMMENDATIONS: AIRecommendation[] = [
  { id: 1, resourceTitle: "Refurbished Laptops (×20)", recipientName: "Zayed Ahmed", recipientOrg: "Government School No. 47, Bangalore", score: 95, reasons: ["High demand — 450 students, zero working machines", "Nearby location — 3.2 km from donor", "No recent laptop donation to this recipient", "Critical urgency flag raised by donor context"], demandLevel: "High", distanceKm: 3.2, quantityRequired: 10, urgency: "Critical", previousDonations: 1 },
  { id: 2, resourceTitle: "Refurbished Laptops (×20)", recipientName: "Kavitha Rao", recipientOrg: "Hope Foundation NGO", score: 88, reasons: ["Strong demand for digital literacy program", "5.1 km — moderate distance", "Last laptop donation over 8 months ago"], demandLevel: "High", distanceKm: 5.1, quantityRequired: 8, urgency: "High", previousDonations: 3 },
  { id: 3, resourceTitle: "Refurbished Laptops (×20)", recipientName: "Ramesh Pillai", recipientOrg: "Rural Learning Center, Channapatna", score: 72, reasons: ["Rural location raises priority weight", "24 km — transport cost considered", "Moderate demand level this quarter"], demandLevel: "Medium", distanceKm: 24.0, quantityRequired: 6, urgency: "Normal", previousDonations: 2 },
  { id: 4, resourceTitle: "Library Books (×450)", recipientName: "Ramesh Pillai", recipientOrg: "Rural Learning Center, Channapatna", score: 91, reasons: ["Library has only 40 books for 320 children", "Books are high-demand, low-weight items", "Rural education multiplier applied"], demandLevel: "High", distanceKm: 24.0, quantityRequired: 200, urgency: "High", previousDonations: 0 },
];

export const ANALYTICS = {
  stats: {
    totalUsers: 342,
    totalResources: 1284,
    pendingRequests: 47,
    completedDonations: 812,
    utilizationRate: 76,
    aiMatchesGenerated: 156,
  },
  monthlyDonations: [
    { month: "Mar", donations: 42, requests: 58 },
    { month: "Apr", donations: 55, requests: 64 },
    { month: "May", donations: 48, requests: 71 },
    { month: "Jun", donations: 74, requests: 69 },
    { month: "Jul", donations: 88, requests: 92 },
    { month: "Aug", donations: 101, requests: 87 },
  ],
  categoryDistribution: [
    { name: "Electronics", value: 320, fill: "var(--chart-1)" },
    { name: "Books", value: 285, fill: "var(--chart-2)" },
    { name: "Furniture", value: 246, fill: "var(--chart-3)" },
    { name: "Educational", value: 178, fill: "var(--chart-4)" },
    { name: "Sports", value: 124, fill: "var(--chart-5)" },
    { name: "Materials", value: 89, fill: "var(--chart-2)" },
    { name: "Stationery", value: 42, fill: "var(--chart-1)" },
  ],
  demandPrediction: [
    { month: "Sep", demand: 62 },
    { month: "Oct", demand: 74 },
    { month: "Nov", demand: 89 },
    { month: "Dec", demand: 95 },
    { month: "Jan", demand: 81 },
    { month: "Feb", demand: 70 },
  ],
  mostRequested: [
    { name: "Laptops", count: 134 },
    { name: "Textbooks", count: 112 },
    { name: "Desks", count: 87 },
    { name: "Projectors", count: 64 },
    { name: "Sports Gear", count: 52 },
    { name: "Stationery", count: 48 },
  ],
  statusBreakdown: [
    { name: "Available", value: 412, fill: "var(--chart-1)" },
    { name: "Reserved", value: 98, fill: "var(--chart-2)" },
    { name: "Allocated", value: 156, fill: "var(--chart-3)" },
    { name: "Delivered", value: 618, fill: "var(--chart-4)" },
  ],
};

export const CATEGORIES = ["All", "Electronics", "Books", "Furniture", "Educational", "Sports", "Materials", "Stationery"];
export const CONDITIONS: ResourceCondition[] = ["Like New", "Good", "Fair", "Needs Repair"];

export const DEMO_USERS: Record<Role, User> = {
  donor: { id: 2, name: "Priya Sharma", email: "priya@techflow.io", role: "donor", organization: "TechFlow Systems Pvt. Ltd.", location: "Koramangala, Bangalore" },
  recipient: { id: 10, name: "Zayed Ahmed", email: "zayed@school47.edu.in", role: "recipient", organization: "Government School No. 47, Bangalore", location: "HSR Layout, Bangalore" },
  admin: { id: 1, name: "Platform Admin", email: "admin@relivo.ai", role: "admin", organization: "RELIVO", location: "Bangalore, India" },
};
