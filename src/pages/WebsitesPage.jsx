import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import WebsiteDetailsModal from '../components/WebsiteDetailsModal';
import ManageCategoriesModal from '../components/ManageCategoriesModal';
import ShareDocumentsModal from '../components/ShareDocumentsModal';
import FormattedContent from '../components/FormattedContent';
import { api } from '../services/api';
import { parseDocumentList } from '../utils/documentUtils';
import { 
  Globe, 
  Search, 
  Plus, 
  Trash2, 
  X, 
  AlertCircle,
  Tag,
  ShieldCheck,
  ShieldAlert,
  GraduationCap,
  HardHat,
  Landmark,
  Car,
  Plane,
  Award,
  Zap,
  Layers,
  Folder,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Copy,
  Check,
  FileText,
  CreditCard,
  DollarSign,
  Edit3,
  Info,
  Grid,
  List,
  Share2,
  HeartHandshake,
  MapPin,
  Briefcase
} from 'lucide-react';

const CATEGORY_META = {
  'E-Sevai': {
    icon: Landmark,
    color: '#0891b2',
    bg: '#ecfeff',
    border: '#a5f3fc',
    accentGradient: 'linear-gradient(90deg, #0891b2 0%, #06b6d4 100%)',
    gradient: 'linear-gradient(180deg, rgba(8, 145, 178, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(8, 145, 178, 0.16)',
    description: 'TNeGA e-Sevai, Revenue Certificates, Civil Registration & Citizen Services'
  },
  'E Sevai': {
    icon: Landmark,
    color: '#0891b2',
    bg: '#ecfeff',
    border: '#a5f3fc',
    accentGradient: 'linear-gradient(90deg, #0891b2 0%, #06b6d4 100%)',
    gradient: 'linear-gradient(180deg, rgba(8, 145, 178, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(8, 145, 178, 0.16)',
    description: 'TNeGA e-Sevai, Revenue Certificates, Civil Registration & Citizen Services'
  },
  'Pension Services': {
    icon: HeartHandshake,
    color: '#e11d48',
    bg: '#fff1f2',
    border: '#fecdd3',
    accentGradient: 'linear-gradient(90deg, #e11d48 0%, #f43f5e 100%)',
    gradient: 'linear-gradient(180deg, rgba(225, 29, 72, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(225, 29, 72, 0.16)',
    description: 'Social Security Pensions, Old Age, Widow, Differently Abled & Welfare Schemes'
  },
  'Pension Services (ஓய்வூதியத் திட்டங்கள்)': {
    icon: HeartHandshake,
    color: '#e11d48',
    bg: '#fff1f2',
    border: '#fecdd3',
    accentGradient: 'linear-gradient(90deg, #e11d48 0%, #f43f5e 100%)',
    gradient: 'linear-gradient(180deg, rgba(225, 29, 72, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(225, 29, 72, 0.16)',
    description: 'Social Security Pensions, Old Age, Widow, Differently Abled & Welfare Schemes'
  },
  'PAN Card Services': {
    icon: CreditCard,
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    accentGradient: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)',
    gradient: 'linear-gradient(180deg, rgba(37, 99, 235, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(37, 99, 235, 0.16)',
    description: 'New PAN Card (Form 49A), PAN Correction (CSF Form), e-KYC & Tax ID Services'
  },
  'PAN Card Services (பான் கார்டு சேவைகள்)': {
    icon: CreditCard,
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    accentGradient: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)',
    gradient: 'linear-gradient(180deg, rgba(37, 99, 235, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(37, 99, 235, 0.16)',
    description: 'New PAN Card (Form 49A), PAN Correction (CSF Form), e-KYC & Tax ID Services'
  },
  'Identity & Governance': {
    icon: ShieldCheck,
    color: '#4f46e5',
    bg: '#eef2ff',
    border: '#c7d2fe',
    accentGradient: 'linear-gradient(90deg, #4f46e5 0%, #6366f1 100%)',
    gradient: 'linear-gradient(180deg, rgba(79, 70, 229, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(79, 70, 229, 0.16)',
    description: 'Aadhaar, Voter ID, Civic IDs & Citizen Identity Services'
  },
  'Banking & Tax': {
    icon: Landmark,
    color: '#059669',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    accentGradient: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
    gradient: 'linear-gradient(180deg, rgba(5, 150, 105, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(5, 150, 105, 0.16)',
    description: 'PAN Card, Income Tax e-Filing, Net Banking & Tax Portals'
  },
  'Vehicle & Transport Services': {
    icon: Car,
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
    accentGradient: 'linear-gradient(90deg, #d97706 0%, #f59e0b 100%)',
    gradient: 'linear-gradient(180deg, rgba(217, 119, 6, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(217, 119, 6, 0.16)',
    description: 'Driving License, Sarathi, Vahan, RC, Insurance & Ticket Booking Portals'
  },
  'Vehicle & Transport Services (வாகனம் மற்றும் போக்குவரத்து சேவைகள்)': {
    icon: Car,
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
    accentGradient: 'linear-gradient(90deg, #d97706 0%, #f59e0b 100%)',
    gradient: 'linear-gradient(180deg, rgba(217, 119, 6, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(217, 119, 6, 0.16)',
    description: 'Driving License, Sarathi, Vahan, RC, Insurance & Ticket Booking Portals'
  },
  'Land & Property Services': {
    icon: MapPin,
    color: '#15803d',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    accentGradient: 'linear-gradient(90deg, #15803d 0%, #22c55e 100%)',
    gradient: 'linear-gradient(180deg, rgba(21, 128, 61, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(21, 128, 61, 0.16)',
    description: 'Patta, Chitta, FMB Sketch, Patta Transfer, EC, Certified Copy & Property Tax'
  },
  'Land & Property Services (நிலம் மற்றும் சொத்து சேவைகள்)': {
    icon: MapPin,
    color: '#15803d',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    accentGradient: 'linear-gradient(90deg, #15803d 0%, #22c55e 100%)',
    gradient: 'linear-gradient(180deg, rgba(21, 128, 61, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(21, 128, 61, 0.16)',
    description: 'Patta, Chitta, FMB Sketch, Patta Transfer, EC, Certified Copy & Property Tax'
  },
  'Land Records & Property': {
    icon: MapPin,
    color: '#15803d',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    accentGradient: 'linear-gradient(90deg, #15803d 0%, #22c55e 100%)',
    gradient: 'linear-gradient(180deg, rgba(21, 128, 61, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(21, 128, 61, 0.16)',
    description: 'Patta, Chitta, FMB Sketch, Patta Transfer, EC, Certified Copy & Property Tax'
  },
  'Land Services': {
    icon: MapPin,
    color: '#15803d',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    accentGradient: 'linear-gradient(90deg, #15803d 0%, #22c55e 100%)',
    gradient: 'linear-gradient(180deg, rgba(21, 128, 61, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(21, 128, 61, 0.16)',
    description: 'Patta, Chitta, FMB Sketch, Patta Transfer, EC, Certified Copy & Property Tax'
  },
  'Land': {
    icon: MapPin,
    color: '#15803d',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    accentGradient: 'linear-gradient(90deg, #15803d 0%, #22c55e 100%)',
    gradient: 'linear-gradient(180deg, rgba(21, 128, 61, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(21, 128, 61, 0.16)',
    description: 'Patta, Chitta, FMB Sketch, Patta Transfer, EC, Certified Copy & Property Tax'
  },
  'Business Services': {
    icon: Briefcase,
    color: '#0f766e',
    bg: '#f0fdfa',
    border: '#99f6e4',
    accentGradient: 'linear-gradient(90deg, #0f766e 0%, #14b8a6 100%)',
    gradient: 'linear-gradient(180deg, rgba(15, 118, 110, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(15, 118, 110, 0.16)',
    description: 'FSSAI Food Licence, GST Registration & Returns, Udyam MSME & Business Setup'
  },
  'Business Services (தொழில் மற்றும் வணிகச் சேவைகள்)': {
    icon: Briefcase,
    color: '#0f766e',
    bg: '#f0fdfa',
    border: '#99f6e4',
    accentGradient: 'linear-gradient(90deg, #0f766e 0%, #14b8a6 100%)',
    gradient: 'linear-gradient(180deg, rgba(15, 118, 110, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(15, 118, 110, 0.16)',
    description: 'FSSAI Food Licence, GST Registration & Returns, Udyam MSME & Business Setup'
  },
  'Business & Commerce': {
    icon: Briefcase,
    color: '#0f766e',
    bg: '#f0fdfa',
    border: '#99f6e4',
    accentGradient: 'linear-gradient(90deg, #0f766e 0%, #14b8a6 100%)',
    gradient: 'linear-gradient(180deg, rgba(15, 118, 110, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(15, 118, 110, 0.16)',
    description: 'FSSAI Food Licence, GST Registration & Returns, Udyam MSME & Business Setup'
  },
  'Transport & Vehicles': {
    icon: Car,
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
    accentGradient: 'linear-gradient(90deg, #d97706 0%, #f59e0b 100%)',
    gradient: 'linear-gradient(180deg, rgba(217, 119, 6, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(217, 119, 6, 0.16)',
    description: 'Driving License, Sarathi, Vahan, RC Transfer & RTO Portals'
  },
  'Travel & Identity': {
    icon: Plane,
    color: '#0284c7',
    bg: '#f0f9ff',
    border: '#bae6fd',
    accentGradient: 'linear-gradient(90deg, #0284c7 0%, #0ea5e9 100%)',
    gradient: 'linear-gradient(180deg, rgba(22, 132, 199, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(2, 132, 199, 0.16)',
    description: 'Passport Seva, Visa, Train / Flight & Tourism Services'
  },
  'Government Schemes': {
    icon: Award,
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    accentGradient: 'linear-gradient(90deg, #7c3aed 0%, #8b5cf6 100%)',
    gradient: 'linear-gradient(180deg, rgba(124, 58, 237, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(124, 58, 237, 0.16)',
    description: 'PM Kisan, DBT, Ration Card, Pensions & Welfare Schemes'
  },
  'Utilities & Bills': {
    icon: Zap,
    color: '#ea580c',
    bg: '#fff7ed',
    border: '#fed7aa',
    accentGradient: 'linear-gradient(90deg, #ea580c 0%, #f97316 100%)',
    gradient: 'linear-gradient(180deg, rgba(234, 88, 12, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(234, 88, 12, 0.16)',
    description: 'Electricity, Water, LPG Gas, Fastag & Bill Payments'
  },
  'Electricity & EB Services': {
    icon: Zap,
    color: '#ea580c',
    bg: '#fff7ed',
    border: '#fed7aa',
    accentGradient: 'linear-gradient(90deg, #ea580c 0%, #f97316 100%)',
    gradient: 'linear-gradient(180deg, rgba(234, 88, 12, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(234, 88, 12, 0.16)',
    description: 'TANGEDCO EB New Connection, Name Transfer, Aadhaar Link, Bill Payment & Solar'
  },
  'Electricity & EB Services (மின்சார சேவைகள்)': {
    icon: Zap,
    color: '#ea580c',
    bg: '#fff7ed',
    border: '#fed7aa',
    accentGradient: 'linear-gradient(90deg, #ea580c 0%, #f97316 100%)',
    gradient: 'linear-gradient(180deg, rgba(234, 88, 12, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(234, 88, 12, 0.16)',
    description: 'TANGEDCO EB New Connection, Name Transfer, Aadhaar Link, Bill Payment & Solar'
  },
  'EB Services': {
    icon: Zap,
    color: '#ea580c',
    bg: '#fff7ed',
    border: '#fed7aa',
    accentGradient: 'linear-gradient(90deg, #ea580c 0%, #f97316 100%)',
    gradient: 'linear-gradient(180deg, rgba(234, 88, 12, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(234, 88, 12, 0.16)',
    description: 'TANGEDCO EB New Connection, Name Transfer, Aadhaar Link, Bill Payment & Solar'
  },
  'EB Services (மின்சார வாரியச் சேவைகள்)': {
    icon: Zap,
    color: '#ea580c',
    bg: '#fff7ed',
    border: '#fed7aa',
    accentGradient: 'linear-gradient(90deg, #ea580c 0%, #f97316 100%)',
    gradient: 'linear-gradient(180deg, rgba(234, 88, 12, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(234, 88, 12, 0.16)',
    description: 'TANGEDCO EB New Connection, Name Transfer, Aadhaar Link, Bill Payment & Solar'
  },
  'EB': {
    icon: Zap,
    color: '#ea580c',
    bg: '#fff7ed',
    border: '#fed7aa',
    accentGradient: 'linear-gradient(90deg, #ea580c 0%, #f97316 100%)',
    gradient: 'linear-gradient(180deg, rgba(234, 88, 12, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(234, 88, 12, 0.16)',
    description: 'TANGEDCO EB New Connection, Name Transfer, Aadhaar Link, Bill Payment & Solar'
  },
  'FSSAI Food Safety Services': {
    icon: ShieldCheck,
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#86efac',
    accentGradient: 'linear-gradient(90deg, #16a34a 0%, #22c55e 100%)',
    gradient: 'linear-gradient(180deg, rgba(22, 163, 74, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(22, 163, 74, 0.16)',
    description: 'FSSAI New Registration, License Renewal, Modification, Annual Return & FSDB'
  },
  'FSSAI Food Safety Services (உணவுப் பாதுகாப்பு சேவைகள்)': {
    icon: ShieldCheck,
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#86efac',
    accentGradient: 'linear-gradient(90deg, #16a34a 0%, #22c55e 100%)',
    gradient: 'linear-gradient(180deg, rgba(22, 163, 74, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(22, 163, 74, 0.16)',
    description: 'FSSAI New Registration, License Renewal, Modification, Annual Return & FSDB'
  },
  'FSSAI Food Safety': {
    icon: ShieldCheck,
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#86efac',
    accentGradient: 'linear-gradient(90deg, #16a34a 0%, #22c55e 100%)',
    gradient: 'linear-gradient(180deg, rgba(22, 163, 74, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(22, 163, 74, 0.16)',
    description: 'FSSAI New Registration, License Renewal, Modification, Annual Return & FSDB'
  },
  'FSSAI Food Services': {
    icon: ShieldCheck,
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#86efac',
    accentGradient: 'linear-gradient(90deg, #16a34a 0%, #22c55e 100%)',
    gradient: 'linear-gradient(180deg, rgba(22, 163, 74, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(22, 163, 74, 0.16)',
    description: 'FSSAI New Registration, License Renewal, Modification, Annual Return & FSDB'
  },
  'FSSAI': {
    icon: ShieldCheck,
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#86efac',
    accentGradient: 'linear-gradient(90deg, #16a34a 0%, #22c55e 100%)',
    gradient: 'linear-gradient(180deg, rgba(22, 163, 74, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(22, 163, 74, 0.16)',
    description: 'FSSAI New Registration, License Renewal, Modification, Annual Return & FSDB'
  },
  'Police Services': {
    icon: ShieldAlert,
    color: '#1d4ed8',
    bg: '#eff6ff',
    border: '#93c5fd',
    accentGradient: 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 100%)',
    gradient: 'linear-gradient(180deg, rgba(30, 58, 138, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(30, 58, 138, 0.16)',
    description: 'TN Police Verification, Lost Document Report, Online Complaint, FIR, Cyber Crime & Kaaval Uthavi'
  },
  'Police Services (காவல்துறை சேவைகள்)': {
    icon: ShieldAlert,
    color: '#1d4ed8',
    bg: '#eff6ff',
    border: '#93c5fd',
    accentGradient: 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 100%)',
    gradient: 'linear-gradient(180deg, rgba(30, 58, 138, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(30, 58, 138, 0.16)',
    description: 'TN Police Verification, Lost Document Report, Online Complaint, FIR, Cyber Crime & Kaaval Uthavi'
  },
  'Police & Legal Services': {
    icon: ShieldAlert,
    color: '#1d4ed8',
    bg: '#eff6ff',
    border: '#93c5fd',
    accentGradient: 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 100%)',
    gradient: 'linear-gradient(180deg, rgba(30, 58, 138, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(30, 58, 138, 0.16)',
    description: 'TN Police Verification, Lost Document Report, Online Complaint, FIR, Cyber Crime & Kaaval Uthavi'
  },
  'Police': {
    icon: ShieldAlert,
    color: '#1d4ed8',
    bg: '#eff6ff',
    border: '#93c5fd',
    accentGradient: 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 100%)',
    gradient: 'linear-gradient(180deg, rgba(30, 58, 138, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(30, 58, 138, 0.16)',
    description: 'TN Police Verification, Lost Document Report, Online Complaint, FIR, Cyber Crime & Kaaval Uthavi'
  },
  'காவல்துறை சேவைகள்': {
    icon: ShieldAlert,
    color: '#1d4ed8',
    bg: '#eff6ff',
    border: '#93c5fd',
    accentGradient: 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 100%)',
    gradient: 'linear-gradient(180deg, rgba(30, 58, 138, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(30, 58, 138, 0.16)',
    description: 'TN Police Verification, Lost Document Report, Online Complaint, FIR, Cyber Crime & Kaaval Uthavi'
  },
  'Competitive Exams': {
    icon: GraduationCap,
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    accentGradient: 'linear-gradient(90deg, #6d28d9 0%, #8b5cf6 100%)',
    gradient: 'linear-gradient(180deg, rgba(109, 40, 217, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(109, 40, 217, 0.16)',
    description: 'TNPSC, TNUSRB, TRB, SSC, Railway (RRB), Banking (IBPS/SBI), UPSC & Agniveer Exams'
  },
  'Competitive Exams (போட்டித் தேர்வுகள்)': {
    icon: GraduationCap,
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    accentGradient: 'linear-gradient(90deg, #6d28d9 0%, #8b5cf6 100%)',
    gradient: 'linear-gradient(180deg, rgba(109, 40, 217, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(109, 40, 217, 0.16)',
    description: 'TNPSC, TNUSRB, TRB, SSC, Railway (RRB), Banking (IBPS/SBI), UPSC & Agniveer Exams'
  },
  'Government Exams': {
    icon: GraduationCap,
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    accentGradient: 'linear-gradient(90deg, #6d28d9 0%, #8b5cf6 100%)',
    gradient: 'linear-gradient(180deg, rgba(109, 40, 217, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(109, 40, 217, 0.16)',
    description: 'TNPSC, TNUSRB, TRB, SSC, Railway (RRB), Banking (IBPS/SBI), UPSC & Agniveer Exams'
  },
  'Exams': {
    icon: GraduationCap,
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    accentGradient: 'linear-gradient(90deg, #6d28d9 0%, #8b5cf6 100%)',
    gradient: 'linear-gradient(180deg, rgba(109, 40, 217, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(109, 40, 217, 0.16)',
    description: 'TNPSC, TNUSRB, TRB, SSC, Railway (RRB), Banking (IBPS/SBI), UPSC & Agniveer Exams'
  },
  'EXAM': {
    icon: GraduationCap,
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    accentGradient: 'linear-gradient(90deg, #6d28d9 0%, #8b5cf6 100%)',
    gradient: 'linear-gradient(180deg, rgba(109, 40, 217, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(109, 40, 217, 0.16)',
    description: 'TNPSC, TNUSRB, TRB, SSC, Railway (RRB), Banking (IBPS/SBI), UPSC & Agniveer Exams'
  },
  'போட்டித் தேர்வுகள்': {
    icon: GraduationCap,
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    accentGradient: 'linear-gradient(90deg, #6d28d9 0%, #8b5cf6 100%)',
    gradient: 'linear-gradient(180deg, rgba(109, 40, 217, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(109, 40, 217, 0.16)',
    description: 'TNPSC, TNUSRB, TRB, SSC, Railway (RRB), Banking (IBPS/SBI), UPSC & Agniveer Exams'
  },
  'Passport Services': {
    icon: Plane,
    color: '#0284c7',
    bg: '#f0f9ff',
    border: '#7dd3fc',
    accentGradient: 'linear-gradient(90deg, #0369a1 0%, #0284c7 100%)',
    gradient: 'linear-gradient(180deg, rgba(2, 132, 199, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(2, 132, 199, 0.16)',
    description: 'Fresh Passport, Re-issue, Renewal, Personal Particulars Change, PCC & Minor Passport'
  },
  'Passport Services (பாஸ்போர்ட் சேவைகள்)': {
    icon: Plane,
    color: '#0284c7',
    bg: '#f0f9ff',
    border: '#7dd3fc',
    accentGradient: 'linear-gradient(90deg, #0369a1 0%, #0284c7 100%)',
    gradient: 'linear-gradient(180deg, rgba(2, 132, 199, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(2, 132, 199, 0.16)',
    description: 'Fresh Passport, Re-issue, Renewal, Personal Particulars Change, PCC & Minor Passport'
  },
  'Passport': {
    icon: Plane,
    color: '#0284c7',
    bg: '#f0f9ff',
    border: '#7dd3fc',
    accentGradient: 'linear-gradient(90deg, #0369a1 0%, #0284c7 100%)',
    gradient: 'linear-gradient(180deg, rgba(2, 132, 199, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(2, 132, 199, 0.16)',
    description: 'Fresh Passport, Re-issue, Renewal, Personal Particulars Change, PCC & Minor Passport'
  },
  'PASSPORT': {
    icon: Plane,
    color: '#0284c7',
    bg: '#f0f9ff',
    border: '#7dd3fc',
    accentGradient: 'linear-gradient(90deg, #0369a1 0%, #0284c7 100%)',
    gradient: 'linear-gradient(180deg, rgba(2, 132, 199, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(2, 132, 199, 0.16)',
    description: 'Fresh Passport, Re-issue, Renewal, Personal Particulars Change, PCC & Minor Passport'
  },
  'பாஸ்போர்ட் சேவைகள்': {
    icon: Plane,
    color: '#0284c7',
    bg: '#f0f9ff',
    border: '#7dd3fc',
    accentGradient: 'linear-gradient(90deg, #0369a1 0%, #0284c7 100%)',
    gradient: 'linear-gradient(180deg, rgba(2, 132, 199, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(2, 132, 199, 0.16)',
    description: 'Fresh Passport, Re-issue, Renewal, Personal Particulars Change, PCC & Minor Passport'
  },
  'Welfare Board (நல வாரியம்)': {
    icon: HardHat,
    color: '#c2410c',
    bg: '#fff7ed',
    border: '#fed7aa',
    accentGradient: 'linear-gradient(90deg, #ea580c 0%, #c2410c 100%)',
    gradient: 'linear-gradient(180deg, rgba(194, 65, 12, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(194, 65, 12, 0.16)',
    description: 'TNUWWB Registration, Renewal, Education, Marriage, Maternity, Death, Pension & Schemes'
  },
  'Nalavariyam (நல வாரியம்)': {
    icon: HardHat,
    color: '#c2410c',
    bg: '#fff7ed',
    border: '#fed7aa',
    accentGradient: 'linear-gradient(90deg, #ea580c 0%, #c2410c 100%)',
    gradient: 'linear-gradient(180deg, rgba(194, 65, 12, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(194, 65, 12, 0.16)',
    description: 'TNUWWB Registration, Renewal, Education, Marriage, Maternity, Death, Pension & Schemes'
  },
  'Nalavariyam': {
    icon: HardHat,
    color: '#c2410c',
    bg: '#fff7ed',
    border: '#fed7aa',
    accentGradient: 'linear-gradient(90deg, #ea580c 0%, #c2410c 100%)',
    gradient: 'linear-gradient(180deg, rgba(194, 65, 12, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(194, 65, 12, 0.16)',
    description: 'TNUWWB Registration, Renewal, Education, Marriage, Maternity, Death, Pension & Schemes'
  },
  'NALAVARIYAM': {
    icon: HardHat,
    color: '#c2410c',
    bg: '#fff7ed',
    border: '#fed7aa',
    accentGradient: 'linear-gradient(90deg, #ea580c 0%, #c2410c 100%)',
    gradient: 'linear-gradient(180deg, rgba(194, 65, 12, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(194, 65, 12, 0.16)',
    description: 'TNUWWB Registration, Renewal, Education, Marriage, Maternity, Death, Pension & Schemes'
  },
  'நல வாரியம்': {
    icon: HardHat,
    color: '#c2410c',
    bg: '#fff7ed',
    border: '#fed7aa',
    accentGradient: 'linear-gradient(90deg, #ea580c 0%, #c2410c 100%)',
    gradient: 'linear-gradient(180deg, rgba(194, 65, 12, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(194, 65, 12, 0.16)',
    description: 'TNUWWB Registration, Renewal, Education, Marriage, Maternity, Death, Pension & Schemes'
  },
  'TNUWWB': {
    icon: HardHat,
    color: '#c2410c',
    bg: '#fff7ed',
    border: '#fed7aa',
    accentGradient: 'linear-gradient(90deg, #ea580c 0%, #c2410c 100%)',
    gradient: 'linear-gradient(180deg, rgba(194, 65, 12, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(194, 65, 12, 0.16)',
    description: 'TNUWWB Registration, Renewal, Education, Marriage, Maternity, Death, Pension & Schemes'
  }
};

const getCategoryMeta = (catName) => {
  if (CATEGORY_META[catName]) return CATEGORY_META[catName];
  return {
    icon: Folder,
    color: '#4f46e5',
    bg: '#eef2ff',
    border: '#c7d2fe',
    accentGradient: 'linear-gradient(90deg, #4f46e5 0%, #6366f1 100%)',
    gradient: 'linear-gradient(180deg, rgba(79, 70, 229, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    glow: 'rgba(79, 70, 229, 0.16)',
    description: `${catName} portals and service methods`
  };
};

const SUGGESTED_DOCUMENTS = [
  "Aadhaar Card",
  "PAN Card",
  "Passport Photo",
  "Bank Passbook",
  "Mobile No (OTP)",
  "Existing PAN Card (பான் கார்டு நகல்)",
  "Gazette / Marriage Certificate",
  "RC Book (பதிவு புத்தகம்)",
  "Original DL (அசல் ஓட்டுநர் உரிமம்)",
  "Medical Certificate (Form 1A)",
  "Vehicle Insurance Policy Copy",
  "Electricity Bill",
  "Consumer Number (நுகர்வோர் எண்)",
  "Latest EB Bill (சமீபத்திய மின் கட்டண ரசீது)",
  "Wiring Completion Certificate",
  "Building Completion Certificate",
  "14 Digit FSSAI License Copy",
  "Water Test Report (நீர் ஆய்வு அறிக்கை)",
  "Machinery & Equipment List",
  "Annual Turnover Declaration",
  "Lost Document Details (பத்திரம்/RC/DL/IMEI எண்)",
  "CSR / FIR Number (மனு / எஃப்.ஐ.ஆர் எண்)",
  "Bank Statement with UTR No (சைபர் கிரைம் அறிக்கை)",
  "Police Verification Offer Letter / Company Letter",
  "PSTM Certificate (தமிழ் வழிக் கல்வி)",
  "Degree / Provisional Certificate",
  "Typewriting / Shorthand Certificate",
  "Central OBC-NCL / EWS Certificate",
  "Left Thumb Impression & Declaration",
  "Nativity / Domicile Certificate",
  "Old Original Passport (பழைய அசல் பாஸ்போர்ட்)",
  "Annexure 'D' (பெற்றோர் ஒப்புதல் படிவம்)",
  "PCC Offer Letter / Visa Copy",
  "10th Marksheet (ECNR / Non-ECR Proof)",
  "TNUWWB Member Card (நல வாரிய அட்டை)",
  "VAO Employment Certificate (தொழில் சான்று)",
  "Bonafide Certificate (படிப்புச் சான்றிதழ்)",
  "Wedding Invitation (திருமண அழைப்பிதழ்)",
  "RCH ID / PICME Copy (தாய்-சேய் நல அட்டை)",
  "Spectacles Doctor Prescription & GST Bill",
  "Ration Card",
  "Income Certificate",
  "Caste Certificate",
  "Birth Certificate",
  "Death Certificate",
  "School TC",
  "Patta / Chitta",
  "Sale Deed (கிரயப் பத்திரம்)",
  "Parent Document (தாய் பத்திரம்)",
  "Encumbrance Certificate (EC - வில்லங்கச் சான்று)",
  "Previous Patta Copy (முந்தைய பட்டா)",
  "Property Tax Receipt (சொத்து வரி ரசீது)",
  "Layout Plan / Sketch (மனை வரைபடம்)",
  "Rental Agreement (வாடகை ஒப்பந்தம்)",
  "Cancelled Cheque / Bank Statement",
  "Business Address Proof (EB Bill)",
  "UDID Card",
  "CMUPT Card",
  "Unmarried Certificate",
  "10th Marksheet",
  "Driving License"
];

export default function WebsitesPage() {
  const [websites, setWebsites] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  // Router history sync for mobile swipe/back button and PC browser back button
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Modal states (Declared first so effects can safely reference them)
  const [selectedDetailsWebsite, setSelectedDetailsWebsite] = useState(null);
  const [sharingWebsite, setSharingWebsite] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState(null);
  const [deletingWebsite, setDeletingWebsite] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isPreviewingDescription, setIsPreviewingDescription] = useState(false);

  // View mode & copy state (Category Directory Groups view by default)
  const [viewMode, setViewMode] = useState('groups'); // 'groups' | 'separate' | 'grid'
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [expandedAccordionCats, setExpandedAccordionCats] = useState({});

  // Inline New Category creation state inside Add/Edit form
  const [isAddingNewCategoryInline, setIsAddingNewCategoryInline] = useState(false);
  const [inlineCategoryInput, setInlineCategoryInput] = useState('');

  const selectedCategory = searchParams.get('category') || 'All';

  const setSelectedCategory = (catName) => {
    if (!catName || catName === 'All') {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('category');
      setSearchParams(nextParams);
    } else {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('category', catName);
      setSearchParams(nextParams);
    }
  };

  const handleBackToCategories = () => {
    if (window.history.length > 1 && searchParams.get('category')) {
      navigate(-1);
    } else {
      setSelectedCategory('All');
    }
  };

  // Keyboard shortcut: PC Escape key and Alt + Left Arrow to go back
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        (e.key === 'Escape' || (e.altKey && e.key === 'ArrowLeft')) &&
        selectedCategory !== 'All' &&
        !selectedDetailsWebsite &&
        !isAddModalOpen &&
        !isManageCategoriesOpen &&
        !sharingWebsite
      ) {
        e.preventDefault();
        handleBackToCategories();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCategory, selectedDetailsWebsite, isAddModalOpen, isManageCategoriesOpen, sharingWebsite]);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    category: 'Identity & Governance',
    description: '',
    documentRequirements: [],
    customDocInput: '',
    payFee: '',
    charges: '',
    notes: '',
    urls: [{ label: 'Official Portal', url: '' }]
  });

  const fetchWebsitesAndCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const [webRes, catRes] = await Promise.all([
        api.getWebsites(),
        api.getCategories()
      ]);

      if (webRes.success && Array.isArray(webRes.data)) {
        const normalized = webRes.data.map(site => ({
          ...site,
          documentRequirements: parseDocumentList(site.documentRequirements)
        }));
        setWebsites(normalized);
      } else {
        setError(webRes.error || 'Failed to load websites');
      }

      if (catRes.success && Array.isArray(catRes.data)) {
        const cleanCats = catRes.data.filter(c => c && String(c).trim().toLowerCase() !== 'other');
        setCategories(cleanCats);
      }
    } catch (err) {
      setError(err.message || 'Error fetching website directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsitesAndCategories();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const toggleAccordionCat = (catName) => {
    setExpandedAccordionCats(prev => ({
      ...prev,
      [catName]: !prev[catName]
    }));
  };

  const handleCopyMethodUrl = (url, label) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    showToast(`Copied ${label || 'link'}!`);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // Available categories list (excluding 'Other')
  const allCategoryTabs = useMemo(() => {
    return ['All', ...categories.filter(c => c && String(c).trim().toLowerCase() !== 'other')];
  }, [categories]);

  // Group portals by category for Category Group UI (excluding 'Other')
  const categoryGroups = useMemo(() => {
    return categories
      .filter(cat => cat && String(cat).trim().toLowerCase() !== 'other')
      .map(cat => {
        const sites = websites.filter(site => site.category === cat);
        const totalMethods = sites.reduce((acc, site) => acc + (Array.isArray(site.urls) ? site.urls.length : 0), 0);
        return {
          name: cat,
          sites,
          portalCount: sites.length,
          methodCount: totalMethods,
          meta: getCategoryMeta(cat)
        };
      });
  }, [categories, websites]);

  // Filter websites based on search query and category
  const filteredWebsites = useMemo(() => {
    return websites.filter(site => {
      const matchesCategory = selectedCategory === 'All' || site.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const docText = Array.isArray(site.documentRequirements) 
        ? site.documentRequirements.join(' ') 
        : String(site.documentRequirements || '');
      
      const urlText = Array.isArray(site.urls)
        ? site.urls.map(u => `${u.label} ${u.url}`).join(' ')
        : '';

      const matchesSearch = 
        site.name.toLowerCase().includes(query) ||
        (site.description && site.description.toLowerCase().includes(query)) ||
        (site.category && site.category.toLowerCase().includes(query)) ||
        docText.toLowerCase().includes(query) ||
        urlText.toLowerCase().includes(query) ||
        (site.payFee && site.payFee.toLowerCase().includes(query)) ||
        (site.charges && site.charges.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [websites, searchQuery, selectedCategory]);

  // Modal Handlers

  const handleInsertDescriptionTemplate = (template) => {
    setFormData(prev => ({
      ...prev,
      description: prev.description ? `${prev.description}\n\n${template}` : template
    }));
  };

  const handleOpenAddModal = () => {
    setEditingWebsite(null);
    setIsPreviewingDescription(false);
    setIsAddingNewCategoryInline(false);
    setInlineCategoryInput('');
    setFormData({
      name: '',
      category: categories[0] || 'Identity & Governance',
      description: '',
      documentRequirements: [],
      customDocInput: '',
      payFee: 'Free',
      charges: '₹50 Service Charge',
      notes: '',
      urls: [
        { label: 'Official Portal', url: '' },
        { label: 'Link', url: '' }
      ]
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (site) => {
    setEditingWebsite(site);
    setIsPreviewingDescription(false);
    setIsAddingNewCategoryInline(false);
    setInlineCategoryInput('');
    setFormData({
      name: site.name || '',
      category: site.category || categories[0] || 'Identity & Governance',
      description: site.description || '',
      documentRequirements: parseDocumentList(site.documentRequirements),
      customDocInput: '',
      payFee: site.payFee || '',
      charges: site.charges || '',
      notes: site.notes || '',
      urls: Array.isArray(site.urls) && site.urls.length > 0 
        ? site.urls.map(u => ({ ...u }))
        : [{ label: 'Official Portal', url: '' }]
    });
    setIsAddModalOpen(true);
  };

  const handleCreateCategoryInline = async () => {
    const trimmed = inlineCategoryInput.trim();
    if (!trimmed) return;
    const res = await api.addCategory(trimmed);
    if (res.success) {
      showToast(`Created category "${trimmed}"`);
      setCategories(res.data);
      setFormData(prev => ({ ...prev, category: trimmed }));
      setIsAddingNewCategoryInline(false);
      setInlineCategoryInput('');
    } else {
      alert(res.error || 'Failed to create category');
    }
  };

  const handleAddUrlField = () => {
    setFormData(prev => ({
      ...prev,
      urls: [...prev.urls, { label: '', url: '' }]
    }));
  };

  const handleRemoveUrlField = (index) => {
    setFormData(prev => ({
      ...prev,
      urls: prev.urls.filter((_, i) => i !== index)
    }));
  };

  const handleUrlChange = (index, field, value) => {
    setFormData(prev => {
      const newUrls = [...prev.urls];
      newUrls[index][field] = value;
      return { ...prev, urls: newUrls };
    });
  };

  const handleAddDocTag = (docInput) => {
    if (!docInput) return;
    const newItems = parseDocumentList(docInput);
    if (newItems.length === 0) return;
    setFormData(prev => {
      const existing = new Set(prev.documentRequirements);
      const combined = [...prev.documentRequirements];
      for (const item of newItems) {
        if (!existing.has(item)) {
          combined.push(item);
          existing.add(item);
        }
      }
      return {
        ...prev,
        documentRequirements: combined,
        customDocInput: ''
      };
    });
  };

  const handleRemoveDocTag = (docToRemove) => {
    setFormData(prev => ({
      ...prev,
      documentRequirements: prev.documentRequirements.filter(d => d !== docToRemove)
    }));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Please enter Website / Portal Name.");
      return;
    }

    // Filter valid URLs
    const validUrls = formData.urls.filter(u => u.url.trim().length > 0).map(u => ({
      label: u.label.trim() || 'Portal Link',
      url: u.url.trim().startsWith('http') ? u.url.trim() : `https://${u.url.trim()}`
    }));

    if (validUrls.length === 0) {
      alert("Please add at least one valid URL link.");
      return;
    }

    // Automatically parse any typed text left in customDocInput as well
    let allDocs = [...formData.documentRequirements];
    if (formData.customDocInput && formData.customDocInput.trim()) {
      const pendingDocs = parseDocumentList(formData.customDocInput);
      for (const d of pendingDocs) {
        if (!allDocs.includes(d)) allDocs.push(d);
      }
    }
    const cleanedDocumentRequirements = parseDocumentList(allDocs);

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      description: formData.description.trim(),
      documentRequirements: cleanedDocumentRequirements,
      payFee: formData.payFee.trim() || 'N/A',
      charges: formData.charges.trim() || 'N/A',
      notes: formData.notes.trim(),
      urls: validUrls
    };

    if (editingWebsite) {
      const res = await api.updateWebsite(editingWebsite.id, payload);
      if (res.success) {
        showToast("Website updated successfully!");
        fetchWebsitesAndCategories();
        setIsAddModalOpen(false);
      } else {
        alert(res.error || "Failed to update website");
      }
    } else {
      const res = await api.addWebsite(payload);
      if (res.success) {
        showToast("New website added to directory!");
        fetchWebsitesAndCategories();
        setIsAddModalOpen(false);
      } else {
        alert(res.error || "Failed to add website");
      }
    }
  };

  const handleDeleteWebsite = async () => {
    if (!deletingWebsite) return;
    const res = await api.deleteWebsite(deletingWebsite.id);
    if (res.success) {
      showToast("Website removed from directory");
      fetchWebsitesAndCategories();
      setDeletingWebsite(null);
    } else {
      alert(res.error || "Failed to delete website");
    }
  };

  const renderPortalAppBox = (site, currentMeta) => {
    const meta = currentMeta || getCategoryMeta(site.category);
    return (
      <div 
        key={site.id} 
        className="website-app-box-card"
        style={{
          border: `2px solid ${meta.color || '#4f46e5'}`,
          background: `linear-gradient(180deg, #ffffff 40%, ${meta.bg || '#f5f3ff'} 100%)`,
          boxShadow: `0 4px 16px ${meta.glow || 'rgba(79, 70, 229, 0.08)'}`,
          position: 'relative',
          overflow: 'hidden',
          paddingTop: '1.25rem'
        }}
      >
        {/* Top 4px Category Accent Stripe */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: meta.accentGradient || meta.color || '#4f46e5'
        }} />

        {/* Box Header: App Icon + Category Tag + Actions */}
        <div className="app-box-header">
          <div 
            className="app-box-icon" 
            style={{ 
              backgroundColor: meta.bg || '#eef2ff', 
              color: meta.color || '#4f46e5',
              border: `1.5px solid ${meta.border || '#c7d2fe'}`
            }}
          >
            <Globe size={22} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <button 
              type="button" 
              className="btn-icon-subtle" 
              onClick={(e) => { e.stopPropagation(); setSharingWebsite(site); }}
              title="Share Document Requirements on WhatsApp"
              style={{ color: '#25D366' }}
            >
              <Share2 size={15} />
            </button>
            <button 
              type="button" 
              className="btn-icon-subtle" 
              onClick={(e) => { e.stopPropagation(); handleOpenEditModal(site); }}
              title="Edit Portal"
            >
              <Edit3 size={15} />
            </button>
            <button 
              type="button" 
              className="btn-icon-subtle danger" 
              onClick={(e) => { e.stopPropagation(); setDeletingWebsite(site); }}
              title="Delete Portal"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* App Box Title & Badges */}
        <div className="app-box-content">
          <h3 className="app-box-title" title={site.name}>
            {site.name}
          </h3>
          <div className="app-box-badges">
            <span className="app-box-badge fee">
              <CreditCard size={11} /> {site.payFee || 'Free'}
            </span>
            <span className="app-box-badge charge">
              <DollarSign size={11} /> {site.charges || '₹0'}
            </span>
            {Array.isArray(site.documentRequirements) && site.documentRequirements.length > 0 && (
              <span className="app-box-badge fee" style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#059669', borderColor: 'rgba(16, 185, 129, 0.25)' }}>
                <FileText size={11} /> {site.documentRequirements.length} {site.documentRequirements.length === 1 ? 'Doc' : 'Docs'}
              </span>
            )}
            {site.category && (
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: meta.color, backgroundColor: meta.bg, padding: '0.15rem 0.45rem', borderRadius: '0.35rem', border: `1px solid ${meta.border}` }}>
                {site.category}
              </span>
            )}
          </div>
        </div>

        {/* Action Methods List inside the App Box */}
        {Array.isArray(site.urls) && site.urls.length > 0 && (
          <div className="app-box-methods-container" style={{ border: `1.5px solid ${meta.border || '#e2e8f0'}`, backgroundColor: '#ffffff' }}>
            <div className="app-box-methods-header" style={{ color: meta.color || 'var(--primary-color)' }}>
              <ExternalLink size={11} color={meta.color || 'var(--primary-color)'} />
              <span>Action Methods ({site.urls.length})</span>
            </div>
            <div className="app-box-methods-list">
              {site.urls.slice(0, 3).map((method, mIdx) => (
                <div key={mIdx} className="app-box-method-item" style={{ border: `1px solid ${meta.border || 'var(--border-color)'}` }}>
                  <span className="app-box-method-name" title={method.label || 'Link'}>
                    {method.label || 'Link'}
                  </span>
                  <div className="app-box-method-actions">
                    <a 
                      href={method.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="app-box-link-btn"
                      title={`Open ${method.label || 'Link'}`}
                    >
                      Open <ExternalLink size={10} />
                    </a>
                    <button 
                      type="button"
                      onClick={() => handleCopyMethodUrl(method.url, method.label)}
                      className="app-box-copy-btn"
                      title="Copy URL"
                    >
                      {copiedUrl === method.url ? <Check size={11} color="var(--success)" /> : <Copy size={11} />}
                    </button>
                  </div>
                </div>
              ))}
              {site.urls.length > 3 && (
                <button 
                  type="button" 
                  onClick={() => setSelectedDetailsWebsite(site)}
                  style={{ background: 'none', border: 'none', color: meta.color || 'var(--primary-color)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', textAlign: 'center', paddingTop: '0.2rem' }}
                >
                  +{site.urls.length - 3} more methods...
                </button>
              )}
            </div>
          </div>
        )}

        {/* Box Footer Button */}
        <div style={{ display: 'flex', gap: '0.4rem', marginTop: 'auto' }}>
          <button 
            type="button" 
            className="app-box-footer-btn"
            onClick={() => setSelectedDetailsWebsite(site)}
            style={{ 
              flex: 1, 
              border: `1.5px solid ${meta.border || 'var(--border-color)'}`,
              fontWeight: 700 
            }}
          >
            <Info size={13} color={meta.color} /> Full Guide & Info
          </button>
          <button
            type="button"
            className="app-box-footer-btn"
            onClick={(e) => { e.stopPropagation(); setSharingWebsite(site); }}
            style={{ 
              width: 'auto', 
              padding: '0.45rem 0.65rem', 
              color: '#15803d', 
              backgroundColor: '#f0fdf4',
              borderColor: '#86efac',
              borderWidth: '1.5px',
              borderStyle: 'solid',
              flexShrink: 0
            }}
            title="Share Document Requirements on WhatsApp"
          >
            <Share2 size={13} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        {/* Top Header & Search Content (Hidden when a category is selected) */}
        {selectedCategory === 'All' && (
          <>
            {/* Optimized Top Action & Search Bar */}
            <div className="card" style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem', borderRadius: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Search Box */}
                <div className="search-box" style={{ flex: '1 1 280px' }}>
                  <Search className="search-icon" size={18} />
                  <input 
                    type="text" 
                    className="search-input" 
                    placeholder="Search portals, methods, documents, or fees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Actions: Manage & Add Portal */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <button 
                    type="button"
                    className="btn btn-secondary" 
                    onClick={() => setIsManageCategoriesOpen(true)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 0.9rem', fontSize: '0.85rem', fontWeight: 600, borderRadius: '0.55rem' }}
                    title="Manage Categories"
                  >
                    <Tag size={15} color="var(--primary-color)" /> Manage Categories
                  </button>

                  <button 
                    type="button"
                    className="btn btn-primary" 
                    onClick={handleOpenAddModal}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', fontSize: '0.85rem', fontWeight: 600, borderRadius: '0.55rem' }}
                  >
                    <Plus size={16} /> Add Web Portal
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.55rem', paddingTop: '0.55rem', borderTop: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                <span>{categoryGroups.length} Categories • {websites.length} Portals Total</span>
              </div>
            </div>
          </>
        )}

        {/* Loading / Error States */}
        {loading ? (
          <Loader text="Loading web apps directory..." />
        ) : error ? (
          <div className="card" style={{ color: 'var(--danger)', textAlign: 'center', padding: '3rem' }}>
            <AlertCircle size={36} style={{ marginBottom: '0.5rem' }} />
            <p>{error}</p>
            <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={fetchWebsitesAndCategories}>
              Retry
            </button>
          </div>
        ) : searchQuery.trim().length > 0 ? (
          /* Search Results View */
          <div>
            <div className="category-breadcrumb-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Search size={18} color="var(--primary-color)" />
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Search Results for "{searchQuery}"
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '1rem' }}>
                  {filteredWebsites.length} Portals Found
                </span>
              </div>
              <button 
                type="button"
                className="btn btn-secondary" 
                onClick={() => setSearchQuery('')}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              >
                Clear Search
              </button>
            </div>

            {filteredWebsites.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <Globe size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                <h3 style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>No results matched "{searchQuery}"</h3>
                <p style={{ fontSize: '0.875rem' }}>Try searching by portal name, method name, document requirement, or fee.</p>
              </div>
            ) : (
              <div className="portal-app-box-grid">
                {filteredWebsites.map(site => renderPortalAppBox(site))}
              </div>
            )}
          </div>
        ) : selectedCategory === 'All' ? (
          /* CHROME LAUNCHER SHORTCUTS DIRECTORY (List of Categories) */
          <div className="card" style={{ padding: '1.75rem 1.25rem', marginBottom: '1.5rem', backgroundColor: '#ffffff', borderRadius: '1.25rem', boxShadow: '0 2px 14px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0 0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Folder size={20} color="var(--primary-color)" />
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                  Category Shortcuts
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-color)', backgroundColor: 'var(--primary-light)', padding: '0.15rem 0.55rem', borderRadius: '1rem', border: '1px solid var(--primary-border)' }}>
                  {categoryGroups.length}
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Tap any icon to view portals & details
              </span>
            </div>

            <div className="chrome-shortcuts-grid">
              {categoryGroups.map(group => {
                const IconComponent = group.meta.icon || Folder;
                return (
                  <button
                    key={group.name}
                    type="button"
                    onClick={() => setSelectedCategory(group.name)}
                    className="chrome-shortcut-item"
                    title={`Open ${group.name} (${group.portalCount} portals)`}
                  >
                    {/* Chrome Style Circular Icon */}
                    <div 
                      className="chrome-shortcut-circle"
                      style={{
                        width: '58px',
                        height: '58px',
                        borderRadius: '50%',
                        backgroundColor: group.meta.bg,
                        color: group.meta.color,
                        border: `2px solid ${group.meta.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 4px 14px ${group.meta.glow || 'rgba(0,0,0,0.06)'}`,
                        transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                        marginBottom: '0.55rem',
                        position: 'relative'
                      }}
                    >
                      <IconComponent size={26} strokeWidth={2.2} />

                      {/* Small Count Badge on Top Right */}
                      <span style={{
                        position: 'absolute',
                        top: '-3px',
                        right: '-3px',
                        backgroundColor: group.meta.color,
                        color: '#ffffff',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.18)',
                        border: '2px solid #ffffff'
                      }}>
                        {group.portalCount}
                      </span>
                    </div>

                    {/* Chrome Style Label Below Icon */}
                    <span 
                      className="chrome-shortcut-label"
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        textAlign: 'center',
                        lineHeight: 1.25,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordBreak: 'break-word',
                        maxWidth: '92px'
                      }}
                    >
                      {group.name}
                    </span>
                  </button>
                );
              })}

              {/* Add / Manage Categories Shortcut Icon (Chrome + Style) */}
              <button
                type="button"
                onClick={() => setIsManageCategoriesOpen(true)}
                className="chrome-shortcut-item"
                title="Manage Categories"
              >
                <div 
                  className="chrome-shortcut-circle"
                  style={{
                    width: '58px',
                    height: '58px',
                    borderRadius: '50%',
                    backgroundColor: '#f8fafc',
                    color: 'var(--text-muted)',
                    border: '2px dashed #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.55rem',
                    transition: 'all 0.22s ease'
                  }}
                >
                  <Plus size={24} />
                </div>
                <span 
                  className="chrome-shortcut-label"
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                    maxWidth: '92px'
                  }}
                >
                  Manage
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* SUB LIST VIEW WITH METHODS (When Category is clicked / selected) */
          <div>
            {(() => {
              const currentMeta = getCategoryMeta(selectedCategory);
              const CurrentIcon = currentMeta.icon || Folder;
              const sitesInCategory = websites.filter(site => site.category === selectedCategory);
              const totalMethodsInCategory = sitesInCategory.reduce((acc, site) => acc + (Array.isArray(site.urls) ? site.urls.length : 0), 0);

              return (
                <div>
                  {/* Category Navigation Breadcrumb Bar with Back Button */}
                  <div className="category-breadcrumb-bar" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.1rem 1.35rem',
                    backgroundColor: '#ffffff',
                    border: `1.5px solid ${currentMeta.border}`,
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: `0 4px 16px ${currentMeta.glow || 'rgba(0,0,0,0.04)'}`,
                    marginBottom: '1.5rem',
                    position: 'relative',
                    overflow: 'hidden',
                    flexWrap: 'wrap',
                    gap: '0.85rem'
                  }}>
                    {/* Top 4px Color Bar */}
                    <div style={{ height: '4px', background: currentMeta.accentGradient, position: 'absolute', top: 0, left: 0, right: 0 }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flexWrap: 'wrap' }}>
                      <button 
                        type="button"
                        className="btn btn-secondary back-btn-responsive" 
                        onClick={handleBackToCategories}
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '0.45rem', 
                          padding: '0.55rem 1rem', 
                          fontSize: '0.85rem', 
                          fontWeight: 700,
                          borderRadius: '0.6rem',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                        }}
                        title="Back to All Categories Directory"
                      >
                        <ArrowLeft size={16} /> Back to All Categories
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '0.65rem', backgroundColor: currentMeta.bg, color: currentMeta.color, border: `1.5px solid ${currentMeta.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CurrentIcon size={22} />
                        </div>
                        <div>
                          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                            {selectedCategory}
                          </h2>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {currentMeta.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: currentMeta.color, backgroundColor: currentMeta.bg, border: `1px solid ${currentMeta.border}`, padding: '0.25rem 0.65rem', borderRadius: '1rem' }}>
                        {sitesInCategory.length} {sitesInCategory.length === 1 ? 'Portal' : 'Portals'}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', backgroundColor: '#f1f5f9', padding: '0.25rem 0.65rem', borderRadius: '1rem' }}>
                        {totalMethodsInCategory} Action Methods
                      </span>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, category: selectedCategory }));
                          setIsAddModalOpen(true);
                        }}
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem', fontWeight: 600 }}
                      >
                        <Plus size={15} /> Add Portal
                      </button>
                    </div>
                  </div>

                  {/* Sub-List Cards */}
                  {sitesInCategory.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                      <CurrentIcon size={44} style={{ color: currentMeta.color, opacity: 0.4, marginBottom: '0.75rem' }} />
                      <h3 style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                        No web portals in "{selectedCategory}" yet
                      </h3>
                      <p style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                        Add services to this category using the button below.
                      </p>
                      <button type="button" className="btn btn-primary" onClick={handleOpenAddModal}>
                        <Plus size={16} /> Add Portal to {selectedCategory}
                      </button>
                    </div>
                  ) : (
                    <div className="portal-app-box-grid">
                      {sitesInCategory.map(site => renderPortalAppBox(site, currentMeta))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </main>

      {/* Website Full Details Modal View */}
      {selectedDetailsWebsite && (
        <WebsiteDetailsModal 
          website={selectedDetailsWebsite}
          onClose={() => setSelectedDetailsWebsite(null)}
          onEdit={(site) => handleOpenEditModal(site)}
          onDelete={(site) => setDeletingWebsite(site)}
          showToast={showToast}
        />
      )}

      {/* Share Document Requirements Modal */}
      {sharingWebsite && (
        <ShareDocumentsModal 
          website={sharingWebsite}
          onClose={() => setSharingWebsite(null)}
          showToast={showToast}
        />
      )}

      {/* Admin Manage Categories Modal */}
      {isManageCategoriesOpen && (
        <ManageCategoriesModal 
          categories={categories}
          onClose={() => setIsManageCategoriesOpen(false)}
          onRefresh={fetchWebsitesAndCategories}
          showToast={showToast}
        />
      )}

      {/* Add / Edit Website Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                {editingWebsite ? 'Edit Web Portal' : 'Add New Web Portal'}
              </h2>
              <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Web Name */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Web / Portal Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. UIDAI Aadhaar Portal or Passport Seva"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Dynamic Category Selector with Inline Category Creator */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Category *</label>
                  {!isAddingNewCategoryInline ? (
                    <button 
                      type="button" 
                      onClick={() => setIsAddingNewCategoryInline(true)}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      + Create New Category
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      onClick={() => setIsAddingNewCategoryInline(false)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {!isAddingNewCategoryInline ? (
                  <select 
                    className="form-select" 
                    value={formData.category} 
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Type new category name..."
                      value={inlineCategoryInput}
                      onChange={e => setInlineCategoryInput(e.target.value)}
                    />
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={handleCreateCategoryInline}
                      style={{ flexShrink: 0, padding: '0.5rem 0.85rem' }}
                    >
                      Save Category
                    </button>
                  </div>
                )}
              </div>

              {/* Description & Formatted UI Editor */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Description / Content UI</label>
                  <button
                    type="button"
                    onClick={() => setIsPreviewingDescription(!isPreviewingDescription)}
                    style={{ 
                      background: isPreviewingDescription ? 'rgba(79, 70, 229, 0.1)' : 'transparent', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '0.35rem', 
                      padding: '0.2rem 0.55rem', 
                      fontSize: '0.75rem', 
                      fontWeight: 600, 
                      color: isPreviewingDescription ? 'var(--primary-color)' : 'var(--text-muted)', 
                      cursor: 'pointer' 
                    }}
                  >
                    {isPreviewingDescription ? '✏️ Edit Raw Text' : '👁️ View Rendered UI'}
                  </button>
                </div>

                {/* Quick Insert Templates */}
                {!isPreviewingDescription && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.45rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center' }}>
                      Insert:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleInsertDescriptionTemplate('H1: Main Title\n')}
                      style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', backgroundColor: '#f8fafc', cursor: 'pointer' }}
                    >
                      + H1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertDescriptionTemplate('H2: Sub-Heading\n')}
                      style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', backgroundColor: '#f8fafc', cursor: 'pointer' }}
                    >
                      + H2
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertDescriptionTemplate('H3: Paragraph Header\n')}
                      style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', backgroundColor: '#f8fafc', cursor: 'pointer' }}
                    >
                      + H3
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertDescriptionTemplate('---\n')}
                      style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', backgroundColor: '#f8fafc', cursor: 'pointer' }}
                    >
                      + Divider (---)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertDescriptionTemplate('table:\nOrganization$TNPSC\nPost Name$Combined Technical Services\nLink$*LINK(Link)->https://apply.tnpscexams.in/\n')}
                      style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', borderRadius: '0.25rem', border: '1px solid rgba(16, 185, 129, 0.4)', backgroundColor: '#ecfdf5', cursor: 'pointer', fontWeight: 600, color: '#047857' }}
                    >
                      + Green Table ($)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertDescriptionTemplate('*LINK(Link)->https://apply.tnpscexams.in/\n')}
                      style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', borderRadius: '0.25rem', border: '1px solid rgba(16, 185, 129, 0.4)', backgroundColor: '#ecfdf5', cursor: 'pointer', fontWeight: 600, color: '#047857' }}
                    >
                      + *LINK Shortcut
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertDescriptionTemplate('H1: Main Title\nH2: Sub-Heading\nH3: Paragraph Header\n---\ntable:\nOrganization$TNPSC\nPost Name$Combined Technical Services\nLink$*LINK(Link)->https://apply.tnpscexams.in/\n')}
                      style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '0.25rem', border: '1px solid var(--primary-color)', backgroundColor: 'rgba(79, 70, 229, 0.08)', cursor: 'pointer', fontWeight: 600, color: 'var(--primary-color)', marginLeft: 'auto' }}
                    >
                      📋 Paste Sample
                    </button>
                  </div>
                )}

                {!isPreviewingDescription ? (
                  <textarea 
                    className="form-input" 
                    rows={5} 
                    placeholder="H1: Main Title&#10;H2: Sub-Heading&#10;H3: Paragraph Header&#10;---&#10;table:&#10;Organization$TNPSC&#10;Post Name$Combined Technical Services&#10;Link$*LINK(Link)->https://apply.tnpscexams.in/"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                  />
                ) : (
                  <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px solid var(--border-color)', minHeight: '110px' }}>
                    {formData.description ? (
                      <FormattedContent content={formData.description} />
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>
                        No description content entered yet. Switch back to Edit to paste or type content.
                      </p>
                    )}
                  </div>
                )}

                {/* Formatting Guide Box */}
                <div className="formatting-guide-card">
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    💡 Formatting Guide:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    <li><strong>H1: Title | H2: Heading | H3: Sub-Heading</strong></li>
                    <li><strong>---</strong> (3 hyphens for horizontal divider line)</li>
                    <li><strong>table:</strong> followed by lines separated by <strong>$</strong> (or <strong>,</strong> ) for green tables</li>
                    <li><strong>*LINK(label)-&gt;http...</strong> (Custom shortcut button for URLs e.g. <code>*LINK(Link)-&gt;https://...</code>)</li>
                    <li>Direct URLs starting with <strong>https://</strong> automatically convert into clickable links!</li>
                  </ul>
                </div>
              </div>

              {/* Document Requirements Tags Input */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                  <label className="form-label" style={{ marginBottom: 0, fontWeight: 700 }}>
                    Document Requirements ({formData.documentRequirements.length})
                  </label>
                  {formData.documentRequirements.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, documentRequirements: [] }))}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                    >
                      Clear All
                    </button>
                  )}
                </div>
                
                {/* Selected Document Tags - Displayed one by one with numbered badges */}
                {formData.documentRequirements.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.75rem', padding: '0.65rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.6rem' }}>
                    {formData.documentRequirements.map((doc, idx) => (
                      <span 
                        key={idx} 
                        style={{ 
                          backgroundColor: '#ffffff', 
                          color: 'var(--text-main)', 
                          border: '1.5px solid #cbd5e1', 
                          padding: '0.3rem 0.6rem', 
                          borderRadius: '0.45rem', 
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                        }}
                      >
                        <span style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: 700, 
                          backgroundColor: 'rgba(79, 70, 229, 0.12)', 
                          color: 'var(--primary-color)',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {idx + 1}
                        </span>
                        <span>{doc}</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveDocTag(doc)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0 0.1rem', display: 'flex', alignItems: 'center' }}
                          title="Remove document"
                          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                          onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                    No documents added yet. Type below or pick suggestions.
                  </div>
                )}

                {/* Custom Doc Input - Supports typing a b c on separate lines, pasting numbered lists, etc. */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ position: 'relative' }}>
                    <textarea 
                      className="form-input" 
                      rows={2}
                      placeholder="Type or paste documents (e.g. type 'a' [Enter] 'b' [Enter] 'c', or numbered list '1. Photo 2. Aadhar Card')..."
                      value={formData.customDocInput}
                      onChange={e => setFormData({ ...formData, customDocInput: e.target.value })}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                          handleAddDocTag(formData.customDocInput);
                        }
                      }}
                      style={{ 
                        resize: 'vertical', 
                        minHeight: '64px', 
                        lineHeight: 1.45, 
                        fontSize: '0.85rem',
                        paddingRight: '80px'
                      }}
                    />
                    <button 
                      type="button" 
                      className="btn btn-primary" 
                      onClick={() => handleAddDocTag(formData.customDocInput)}
                      disabled={!formData.customDocInput.trim()}
                      style={{ 
                        position: 'absolute', 
                        right: '8px', 
                        bottom: '8px',
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.8rem',
                        fontWeight: 700
                      }}
                    >
                      + Add
                    </button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      💡 Tip: Each line or numbered item (a, b, c) automatically splits into a separate document item!
                    </span>
                    {formData.customDocInput.trim() && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                        Press "+ Add" or Ctrl+Enter to split
                      </span>
                    )}
                  </div>
                </div>

                {/* Suggested Quick Add Badges */}
                <div style={{ marginTop: '0.65rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                    Quick suggestions (click to add):
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {SUGGESTED_DOCUMENTS.map(sDoc => {
                      const isSelected = formData.documentRequirements.includes(sDoc);
                      return (
                        <button
                          key={sDoc}
                          type="button"
                          onClick={() => handleAddDocTag(sDoc)}
                          disabled={isSelected}
                          style={{
                            fontSize: '0.725rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '0.35rem',
                            border: isSelected ? '1px solid #e2e8f0' : '1px solid #cbd5e1',
                            backgroundColor: isSelected ? '#f1f5f9' : '#ffffff',
                            color: isSelected ? '#94a3b8' : 'var(--text-main)',
                            fontWeight: isSelected ? 500 : 600,
                            cursor: isSelected ? 'default' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          {isSelected ? '✓' : '+'} {sDoc}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Pay Fee & Charges */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Pay Fee (Govt Fee)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. ₹50 (PVC Card) or Free"
                    value={formData.payFee}
                    onChange={e => setFormData({ ...formData, payFee: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Service Charges</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. ₹100 Service Fee"
                    value={formData.charges}
                    onChange={e => setFormData({ ...formData, charges: e.target.value })}
                  />
                </div>
              </div>

              {/* Multiple URLs & Labels Manager */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Website URLs & Custom Link Labels *</label>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleAddUrlField}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                  >
                    + Add Link
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {formData.urls.map((urlObj, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Link Label (e.g. Link)"
                        value={urlObj.label}
                        onChange={e => handleUrlChange(idx, 'label', e.target.value)}
                        style={{ width: '35%' }}
                      />
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="https://example.com"
                        value={urlObj.url}
                        onChange={e => handleUrlChange(idx, 'url', e.target.value)}
                        style={{ width: '55%' }}
                      />
                      {formData.urls.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveUrlField(idx)}
                          className="btn-icon" 
                          style={{ color: 'var(--danger)', padding: '0.35rem' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Notes / Instructions (Optional)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. OTP mandatory, appointment timing details..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingWebsite ? 'Save Changes' : 'Add Web Portal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingWebsite && (
        <div className="modal-overlay" onClick={() => setDeletingWebsite(null)}>
          <div className="modal-content" style={{ maxWidth: '420px', padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--danger)', marginBottom: '0.5rem' }}>
              Delete Web Portal?
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Are you sure you want to remove <strong>{deletingWebsite.name}</strong> from your website directory?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setDeletingWebsite(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteWebsite}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
