import type {jsPDF} from 'jspdf';

export type EmployeeReportData={
 lang:'EN'|'BM';name:string;division:string;position:string;date:string;
 persona:string;confidence:string;narrative:string;reasoning:string;reflection:string;
 role:string;roleReason:string;roleTask:string;
 dimensions:{label:string;score:number}[];strengths:string[];growth:string[];
 learning:{title:string;description:string;videoUrl:string;videoTitle:string;videoLinkKind?:string}[];
 contributions:string[];logo?:string;fonts?:{normal:string;bold:string};
};

// Native PDF text retains a readable physical font size and accessible links.
// Content flows onto additional pages instead of scaling a screenshot to A4.
export function buildEmployeeReportPdf(pdf:jsPDF,data:EmployeeReportData){
 if(data.fonts){pdf.addFileToVFS('report-sans.ttf',data.fonts.normal);pdf.addFont('report-sans.ttf','ReportSans','normal');pdf.addFileToVFS('report-sans-bold.ttf',data.fonts.bold);pdf.addFont('report-sans-bold.ttf','ReportSans','bold');}
 const font=data.fonts?'ReportSans':'helvetica';
 const tr=(en:string,bm:string)=>data.lang==='BM'?bm:en;
 const clean=(text:string)=>text.replace(/[\u2010-\u2015]/g,'-').replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/\u2022|\u00b7/g,' / ').replace(/→|↗/g,'>').replace(/\u2026/g,'...');
 const left=17,width=176,bottom=272;let y=58;let currentTitle='';
 const header=()=>{
  pdf.setFillColor(11,27,46);pdf.rect(0,0,210,43,'F');
  if(data.logo)pdf.addImage(data.logo,'PNG',left,8,48,16);
  else{pdf.setFont(font,'bold');pdf.setFontSize(22);pdf.setTextColor(100,224,220);pdf.text('AiNspire',left,21);}
  pdf.setFont(font,'normal');pdf.setFontSize(10);pdf.setTextColor(230,238,247);
  pdf.text('Telekom Malaysia',193,16,{align:'right'});
  pdf.setFontSize(9);pdf.text(clean(data.date),193,23,{align:'right'});
  pdf.setFont(font,'bold');pdf.setFontSize(13);pdf.setTextColor(255,255,255);pdf.text(clean(currentTitle),left,35);
  y=55;
 };
 const newPage=(title:string)=>{currentTitle=title;if(pdf.getNumberOfPages()>1||y!==58)pdf.addPage();header();};
 const ensure=(height:number)=>{if(y+height>bottom){pdf.addPage();header();}};
 const text=(value:string,size=11.5,bold=false,color:[number,number,number]=[40,53,70])=>{
  pdf.setFont(font,bold?'bold':'normal');pdf.setFontSize(size);
  const lines=pdf.splitTextToSize(clean(value),width) as string[];
  for(const line of lines){ensure(6);pdf.setFont(font,bold?'bold':'normal');pdf.setFontSize(size);pdf.setTextColor(...color);pdf.text(line,left,y);y+=6;}
  y+=2;
 };
 const section=(title:string)=>{ensure(26);y+=2;pdf.setDrawColor(207,222,235);pdf.line(left,y,193,y);y+=6;text(title,14,true,[19,78,107]);};
 const bullet=(value:string)=>text('- '+value);
 newPage(tr('01 / Your AI Profile','01 / Profil AI Anda'));
 text(data.name||tr('TM Employee','Pekerja TM'),16,true);
 if(data.division)text(tr('Division: ','Bahagian: ')+data.division,10.5);
 if(data.position)text(tr('Company position: ','Jawatan syarikat: ')+data.position,10.5);
 section(tr('Your AI Persona','Persona AI Anda'));text(data.persona,23,true,[19,78,107]);
 text(tr('Profile confidence: ','Keyakinan profil: ')+data.confidence,12,true);
 text(tr('Confidence describes how consistently your assessment evidence supports this profile. It is not a capability percentage.','Keyakinan menerangkan keselarasan bukti penilaian yang menyokong profil ini. Ia bukan peratus keupayaan.'),10.5);
 section(tr('AI Assessment Narrative','Naratif Penilaian AI'));text(data.narrative);
 section(tr('AI Reasoning','Penaakulan AI'));
 const reasoning=data.reasoning.split(/\n+/).map(s=>s.trim()).filter(Boolean);
 reasoning.forEach(line=>text(line.replace(/^[-*]\s+/,'')));
 section(tr('Your Recommended Contribution Role','Peranan Sumbangan Disyorkan'));text(data.role,16,true);text(data.roleReason);text(data.roleTask);


 newPage(tr('02 / Your Strengths & Learning Needs','02 / Kekuatan & Keperluan Pembelajaran Anda'));
 text(tr('Your persona suggests contribution potential. Project involvement also requires relevant skills, available time and supervisor approval.','Persona anda menunjukkan potensi sumbangan. Penyertaan projek turut memerlukan kemahiran berkaitan, masa tersedia dan kelulusan penyelia.'),10.5);
 section(tr('AI Readiness Dimensions','Dimensi Kesediaan AI'));
 text(tr('Each score is out of 100. Use these scores to understand your strengths and learning needs.','Setiap skor adalah daripada 100. Gunakan skor ini untuk memahami kekuatan dan keperluan pembelajaran anda.'),10.5);
 for(const dimension of data.dimensions){
  ensure(23);text(dimension.label,11.5,true);
  pdf.setFillColor(229,237,243);pdf.roundedRect(left,y,138,3,1,1,'F');
  pdf.setFillColor(29,121,149);pdf.roundedRect(left,y,Math.max(0,Math.min(100,dimension.score))/100*138,3,1,1,'F');
  pdf.setFont(font,'bold');pdf.setFontSize(12);pdf.setTextColor(19,78,107);pdf.text(dimension.score+' / 100',193,y+3,{align:'right'});y+=12;
 }
 section(tr('Key Strengths','Kekuatan Utama'));data.strengths.forEach(bullet);
 section(tr('Growth Areas','Bidang Pembangunan'));data.growth.forEach(bullet);
 if(data.reflection){section(tr('Your Reflection','Refleksi Anda'));text(data.reflection);}

 newPage(tr('03 / Your Personalised Learning Pathway','03 / Laluan Pembelajaran Diperibadikan Anda'));
 text(tr('Learn at your pace. Apply what you learn to a practical task, with support where needed.','Belajar mengikut kadar anda. Gunakan pembelajaran dalam tugasan praktikal, dengan sokongan jika diperlukan.'));
 if(!data.learning.length)text(tr('Open your AI Profile to review your learning recommendations.','Buka Profil AI anda untuk menyemak cadangan pembelajaran.'));
 data.learning.forEach((rec,i)=>{
  pdf.setFont(font,'bold');pdf.setFontSize(14);
  const titleLines=pdf.splitTextToSize(clean(`${i+1}. ${rec.title}`),width).length;
  pdf.setFont(font,'normal');pdf.setFontSize(11.5);
  const descriptionLines=rec.description?pdf.splitTextToSize(clean(rec.description),width).length:0;
  pdf.setFontSize(10.5);
  const videoLines=rec.videoTitle?pdf.splitTextToSize(clean(rec.videoTitle),width).length:0;
  const cardHeight=16+(titleLines-1)*6+(descriptionLines?descriptionLines*6+2:0)+(videoLines?videoLines*6+2:0)+10;
  if(cardHeight<=bottom-55)ensure(cardHeight);
  section(`${i+1}. ${rec.title}`);if(rec.description)text(rec.description);
  const label=tr(rec.videoLinkKind==='search'?'Explore related YouTube videos':'Watch on YouTube',rec.videoLinkKind==='search'?'Teroka video YouTube berkaitan':'Tonton di YouTube');
  if(rec.videoTitle)text(rec.videoTitle,10.5);
  ensure(12);pdf.setFont(font,'bold');pdf.setFontSize(11.5);pdf.setTextColor(0,101,151);
  pdf.textWithLink(label,left,y,{url:rec.videoUrl});y+=10;
 });
 if(data.contributions.length){section(tr('Your Project Interest & Contribution Status','Status Minat & Sumbangan Projek Anda'));data.contributions.forEach(bullet);}
 const pages=pdf.getNumberOfPages();
 for(let page=1;page<=pages;page++){
  pdf.setPage(page);pdf.setDrawColor(207,222,235);pdf.line(left,279,193,279);
  pdf.setFont(font,'normal');pdf.setFontSize(8);pdf.setTextColor(82,97,113);
  pdf.text('Generated by AiNspire / Powered by IT as a Service (ITaaS)',left,285);
  pdf.text(`${page} / ${pages}`,193,285,{align:'right'});
 }
 pdf.setProperties({title:tr('AiNspire - Your AI Profile & Learning Pathway','AiNspire - Profil AI & Laluan Pembelajaran Anda'),author:'IT as a Service (ITaaS), GITD',subject:'Employee development report'});
 return pdf;
}
