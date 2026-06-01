export type Technician = {
  id: string;
  name: string;
  location: string;
  distanceKm: number;
  expertise: string[];
  certifications: string[];
  availability: string;
  rating: number;
};

export type Part = {
  id: string;
  name: string;
  category: string;
  supplier: string;
  supplierLocation: string;
  stock: number;
  leadTime: string;
  price: string;
  logistics: string;
};

export type JobRequest = {
  id: string;
  title: string;
  location: string;
  equipment: string;
  priority: string;
  description: string;
  requestedBy: string;
  status: string;
  createdAt: string;
};

export type Quote = {
  id: string;
  jobId: string;
  technician: string;
  amount: string;
  leadTime: string;
  message: string;
  submittedAt: string;
};

export type Client = {
  id: string;
  name: string;
  company: string;
  role: string;
  location: string;
  phone: string;
  email: string;
  status: string;
};

export const technicians: Technician[] = [
  {
    id: 'tech-1',
    name: 'Amina Okafor',
    location: 'Lagos, NG',
    distanceKm: 18,
    expertise: ['sanitary pumps', 'valve repair', 'process hygiene'],
    certifications: ['ISO 22000', 'HACCP'],
    availability: 'Available now',
    rating: 4.9,
  },
  {
    id: 'tech-2',
    name: 'Sipho Maseko',
    location: 'Johannesburg, ZA',
    distanceKm: 22,
    expertise: ['stainless welding', 'seals', 'pump alignment'],
    certifications: ['SANS 347', 'NEBB'],
    availability: 'Next-day',
    rating: 4.8,
  },
  {
    id: 'tech-3',
    name: 'Nadia Kamau',
    location: 'Nairobi, KE',
    distanceKm: 55,
    expertise: ['motor rebuilds', 'control panels', 'sanitary valves'],
    certifications: ['IEC', 'OSHA-30'],
    availability: '2 days',
    rating: 4.7,
  },
  {
    id: 'tech-4',
    name: 'Omar Hassan',
    location: 'Cairo, EG',
    distanceKm: 110,
    expertise: ['pump systems', 'process piping', 'cleaning in place'],
    certifications: ['CIP', 'AIAG'],
    availability: 'Next-week',
    rating: 4.6,
  },
];

export const parts: Part[] = [
  {
    id: 'part-1',
    name: 'Sanitary Diaphragm Valve Kit',
    category: 'Valves',
    supplier: 'AquaPro Supplies',
    supplierLocation: 'Johannesburg, ZA',
    stock: 18,
    leadTime: '2 days',
    price: '$375',
    logistics: 'Pickup / Local delivery',
  },
  {
    id: 'part-2',
    name: 'CIP Pump Seal Cartridge',
    category: 'Seals',
    supplier: 'Nile Flow Systems',
    supplierLocation: 'Cairo, EG',
    stock: 7,
    leadTime: 'Next-day',
    price: '$145',
    logistics: 'Expedited freight',
  },
  {
    id: 'part-3',
    name: 'Stainless Conveyor Belt',
    category: 'Belts',
    supplier: 'Kenya Process Components',
    supplierLocation: 'Nairobi, KE',
    stock: 11,
    leadTime: '3 days',
    price: '$220',
    logistics: 'Drop shipment',
  },
  {
    id: 'part-4',
    name: 'Tri-Clamp Pump Rotor',
    category: 'Pumps',
    supplier: 'Accra Hygiene Tech',
    supplierLocation: 'Accra, GH',
    stock: 4,
    leadTime: '5 days',
    price: '$985',
    logistics: 'Standard carrier',
  },
  {
    id: 'part-5',
    name: 'Motor Rebuild Kit',
    category: 'Motors',
    supplier: 'Lagos Industrial Parts',
    supplierLocation: 'Lagos, NG',
    stock: 9,
    leadTime: '2 days',
    price: '$540',
    logistics: 'Local pickup',
  },
];

export const clients: Client[] = [
  {
    id: 'client-1',
    name: 'Mwangi Njoroge',
    company: 'Nairobi Meat Works',
    role: 'Maintenance Manager',
    location: 'Nairobi, KE',
    phone: '+254 723 456 789',
    email: 'mwangi@nairobi-meat.co.ke',
    status: 'Key account',
  },
  {
    id: 'client-2',
    name: 'Lerato Ndlovu',
    company: 'Jozi Food Processors',
    role: 'Operations Lead',
    location: 'Johannesburg, ZA',
    phone: '+27 11 234 5678',
    email: 'lerato@jozifoods.co.za',
    status: 'Preferred',
  },
  {
    id: 'client-3',
    name: 'Kwame Mensah',
    company: 'Accra Agro Supply',
    role: 'Plant Engineer',
    location: 'Accra, GH',
    phone: '+233 20 123 4567',
    email: 'kwame@accraagro.com',
    status: 'Active',
  },
  {
    id: 'client-4',
    name: 'Farida Ali',
    company: 'Cairo Food Systems',
    role: 'Quality Specialist',
    location: 'Cairo, EG',
    phone: '+20 100 987 6543',
    email: 'farida@cairofoodsys.eg',
    status: 'New',
  },
];

export const jobs: JobRequest[] = [
  {
    id: 'job-1',
    title: 'Sanitary valve seal failure',
    location: 'Lagos, NG',
    equipment: 'Butterfly valve assembly',
    priority: 'Urgent',
    description: 'Sanitary valve on packaging line 2 is leaking and requires immediate seal replacement and hygiene validation.',
    requestedBy: 'Coast Foods',
    status: 'Open',
    createdAt: '2 hours ago',
  },
  {
    id: 'job-2',
    title: 'CIP pump vibration',
    location: 'Nairobi, KE',
    equipment: 'CIP circulation pump',
    priority: 'High',
    description: 'Pump vibrates during wash cycle and needs shaft alignment plus seal inspection.',
    requestedBy: 'Nairobi Meat Works',
    status: 'Open',
    createdAt: '1 day ago',
  },
];

export const quotes: Quote[] = [
  {
    id: 'quote-1',
    jobId: 'job-1',
    technician: 'Amina Okafor',
    amount: '$450',
    leadTime: '24 hours',
    message: 'Can attend today with replacement seals and hygiene check included.',
    submittedAt: '30 minutes ago',
  },
  {
    id: 'quote-2',
    jobId: 'job-2',
    technician: 'Nadia Kamau',
    amount: '$310',
    leadTime: 'Tomorrow',
    message: 'Recommend pump alignment and coupling inspection. Parts available locally.',
    submittedAt: '3 hours ago',
  },
];
