// Importing assets
import appointment_img from './appointment_img.png';
import header_img from './header_img.png';
import group_profiles from './group_profiles.png';
import profile_pic from './profile_pic.png';
import contact_image from './contact_image.png';
import about_image from './about_image.png';
import logo from './logo.svg';
import dropdown_icon from './dropdown_icon.svg';
import menu_icon from './menu_icon.svg';
import cross_icon from './cross_icon.png';
import chats_icon from './chats_icon.svg';
import verified_icon from './verified_icon.svg';
import arrow_icon from './arrow_icon.svg';
import info_icon from './info_icon.svg';
import upload_icon from './upload_icon.png';
import stripe_logo from './stripe_logo.png';
import razorpay_logo from './razorpay_logo.png';
import doc1 from './doc1.png';
import doc2 from './doc2.png';
import doc3 from './doc3.png';
import doc4 from './doc4.png';
import doc5 from './doc5.png';
import doc6 from './doc6.png';
import doc7 from './doc7.png';
import doc8 from './doc8.png';
import doc9 from './doc9.png';
import doc10 from './doc10.png';
import doc11 from './doc11.png';
import doc12 from './doc12.png';
import doc13 from './doc13.png';
import doc14 from './doc14.png';
import doc15 from './doc15.png';
import Dermatologist from './Dermatologist.svg';
import Gastroenterologist from './Gastroenterologist.svg';
import General_physician from './General_physician.svg';
import Gynecologist from './Gynecologist.svg';
import Neurologist from './Neurologist.svg';
import Pediatricians from './Pediatricians.svg';

// Type definitions
export interface Address {
  line1: string;
  line2: string;
}

export interface Doctor {
  _id: string;
  name: string;
  image: string;
  speciality: string;
  degree: string;
  experience: string;
  about: string;
  fees: number;
  address: Address;
}

export interface SpecialityData {
  speciality: string;
  image: string;
}

// Exporting assets
export const assets = {
  appointment_img,
  header_img,
  group_profiles,
  logo,
  chats_icon,
  verified_icon,
  info_icon,
  profile_pic,
  arrow_icon,
  contact_image,
  about_image,
  menu_icon,
  cross_icon,
  dropdown_icon,
  upload_icon,
  stripe_logo,
  razorpay_logo,
};

// Exporting speciality data
export const specialityData: SpecialityData[] = [
  {
    speciality: 'GeneralPhysician',
    image: General_physician,
  },
  {
    speciality: 'Gynecologist',
    image: Gynecologist,
  },
  {
    speciality: 'Dermatologist',
    image: Dermatologist,
  },
  {
    speciality: 'Pediatricians',
    image: Pediatricians,
  },
  {
    speciality: 'Neurologist',
    image: Neurologist,
  },
  {
    speciality: 'Gastroenterologist',
    image: Gastroenterologist,
  },
];

// Exporting doctor data
export const doctors: Doctor[] = [
  {
    _id: 'doc1',
    name: 'Dr. Richard James',
    image: doc1,
    speciality: 'General physician',
    degree: 'MBBS',
    experience: '4 Years',
    about:
      'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
    fees: 50,
    address: {
      line1: '17th Cross, Richmond',
      line2: 'Circle, Ring Road, London',
    },
  },
  {
    _id: 'doc2',
    name: 'Dr. Emily Larson',
    image: doc2,
    speciality: 'Gynecologist',
    degree: 'MBBS',
    experience: '3 Years',
    about:
      'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
    fees: 60,
    address: {
      line1: '27th Cross, Richmond',
      line2: 'Circle, Ring Road, London',
    },
  },
  {
    _id: 'doc3',
    name: 'Dr. Sarah Patel',
    image: doc3,
    speciality: 'Dermatologist',
    degree: 'MBBS',
    experience: '1 Year',
    about:
      'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
    fees: 30,
    address: {
      line1: '37th Cross, Richmond',
      line2: 'Circle, Ring Road, London',
    },
  },
  {
    _id: 'doc4',
    name: 'Dr. Christopher Lee',
    image: doc4,
    speciality: 'Pediatricians',
    degree: 'MBBS',
    experience: '2 Years',
    about:
      'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
    fees: 40,
    address: {
      line1: '47th Cross, Richmond',
      line2: 'Circle, Ring Road, London',
    },
  },
  {
    _id: 'doc5',
    name: 'Dr. Amanda Smith',
    image: doc5,
    speciality: 'Neurologist',
    degree: 'MBBS',
    experience: '5 Years',
    about:
      'Dr. Amanda is passionate about neurology and specializes in treating a wide range of neurological conditions with precision and care.',
    fees: 70,
    address: {
      line1: '57th Cross, Richmond',
      line2: 'Circle, Ring Road, London',
    },
  },
  {
    _id: 'doc6',
    name: 'Dr. Robert Wilson',
    image: doc6,
    speciality: 'Gastroenterologist',
    degree: 'MBBS',
    experience: '6 Years',
    about:
      'Dr. Robert is dedicated to providing the best care in diagnosing and treating digestive system disorders.',
    fees: 80,
    address: {
      line1: '67th Cross, Richmond',
      line2: 'Circle, Ring Road, London',
    },
  },
  {
    _id: 'doc7',
    name: 'Dr. Katherine Johnson',
    image: doc7,
    speciality: 'Dermatologist',
    degree: 'MBBS',
    experience: '4 Years',
    about:
      'Dr. Katherine is an expert in skincare, helping patients achieve healthier and radiant skin through advanced treatments.',
    fees: 60,
    address: {
      line1: '77th Cross, Richmond',
      line2: 'Circle, Ring Road, London',
    },
  },
  {
    _id: 'doc8',
    name: 'Dr. Daniel Thompson',
    image: doc8,
    speciality: 'Pediatricians',
    degree: 'MBBS',
    experience: '3 Years',
    about:
      'Dr. Daniel has a deep understanding of child health and development, ensuring quality pediatric care.',
    fees: 45,
    address: {
      line1: '87th Cross, Richmond',
      line2: 'Circle, Ring Road, London',
    },
  },
  {
    _id: 'doc9',
    name: 'Dr. Olivia Martinez',
    image: doc9,
    speciality: 'Gynecologist',
    degree: 'MBBS',
    experience: '2 Years',
    about:
      'Dr. Olivia provides compassionate and expert care for women’s health issues with a focus on holistic wellness.',
    fees: 65,
    address: {
      line1: '97th Cross, Richmond',
      line2: 'Circle, Ring Road, London',
    },
  },
  {
    _id: 'doc10',
    name: 'Dr. Ethan Walker',
    image: doc10,
    speciality: 'Neurologist',
    degree: 'MBBS',
    experience: '7 Years',
    about:
      'Dr. Ethan specializes in treating neurological disorders, providing cutting-edge care for complex cases.',
    fees: 85,
    address: {
      line1: '107th Cross, Richmond',
      line2: 'Circle, Ring Road, London',
    },
  },
  {
    _id: 'doc11',
    name: 'Dr. Isabella Garcia',
    image: doc11,
    speciality: 'General physician',
    degree: 'MBBS',
    experience: '3 Years',
    about:
      'Dr. Isabella is dedicated to providing patient-centered primary care with a focus on preventive measures.',
    fees: 50,
    address: {
      line1: '117th Cross, Richmond',
      line2: 'Circle, Ring Road, London',
    },
  },
  {
    _id: 'doc12',
    name: 'Dr. Lucas Adams',
    image: doc12,
    speciality: 'Gastroenterologist',
    degree: 'MBBS',
    experience: '8 Years',
    about:
      'Dr. Lucas has extensive experience in treating complex digestive system disorders with personalized care.',
    fees: 90,
    address: {
      line1: '127th Cross, Richmond',
      line2: 'Circle, Ring Road, London',
    },
  },
  {
    _id: 'doc13',
    name: 'Dr. Mia Hernandez',
    image: doc13,
    speciality: 'Dermatologist',
    degree: 'MBBS',
    experience: '5 Years',
    about:
      'Dr. Mia helps patients enhance their skin health through innovative and evidence-based treatments.',
    fees: 70,
    address: {
      line1: '137th Cross, Richmond',
      line2: 'Circle, Ring Road, London',
    },
  },
  {
    _id: 'doc14',
    name: 'Dr. Liam White',
    image: doc14,
    speciality: 'Pediatricians',
    degree: 'MBBS',
    experience: '4 Years',
    about:
      'Dr. Liam is dedicated to providing nurturing care for children of all ages, ensuring their well-being.',
    fees: 55,
    address: {
      line1: '147th Cross, Richmond',
      line2: 'Circle, Ring Road, London',
    },
  },
  {
    _id: 'doc15',
    name: 'Dr. Sophia King',
    image: doc15,
    speciality: 'Gynecologist',
    degree: 'MBBS',
    experience: '6 Years',
    about:
      'Dr. Sophia offers expert care for women’s health, specializing in gynecological surgery and preventive care.',
    fees: 75,
    address: {
      line1: '157th Cross, Richmond',
      line2: 'Circle, Ring Road, London',
    },
  },
];
