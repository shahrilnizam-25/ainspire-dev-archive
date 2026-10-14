"use client";
import dynamic from "next/dynamic";
const AiNspire = dynamic(() => import("../src/App"), { ssr: false });
export default function Page() { return <AiNspire />; }
