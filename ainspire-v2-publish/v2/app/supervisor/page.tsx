"use client";
import '../globals.css';
import dynamic from 'next/dynamic';
const Portal=dynamic(()=>import('../../src/components/HRPortal'),{ssr:false});
export default function Page(){return <Portal supervisor/>;}
