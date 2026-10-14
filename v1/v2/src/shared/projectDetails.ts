import type {LocalText,RoleId} from './poc';
const t=(EN:string,BM:string):LocalText=>({EN,BM});
const contexts:Record<string,LocalText>={
 dataops:t('data pipeline incidents','insiden saluran data'),bfsi:t('financial intelligence APIs','API risikan kewangan'),
 'ai-assist':t('IT incident support','sokongan insiden IT'),aura:t('patching and recovery','tampalan dan pemulihan'),
 engineering:t('developer tools','alat pembangun'),ekyc:t('identity verification','pengesahan identiti'),
 saring:t('document screening','saringan dokumen'),uniqa:t('customer journeys','perjalanan pelanggan'),
};
const domainTasks:Record<string,LocalText[]>={
 bfsi:[t('Gather financial data requirements.','Kumpulkan keperluan data kewangan.'),t('Review sample data and business rules.','Semak data sampel dan peraturan perniagaan.')],
 'ai-assist':[t('Review past incidents and troubleshooting knowledge.','Semak insiden lalu dan pengetahuan penyelesaian masalah.'),t('Identify content gaps and suggest improvements.','Kenal pasti jurang kandungan dan cadangkan penambahbaikan.')],
 ekyc:[t('Review document verification criteria.','Semak kriteria pengesahan dokumen.'),t('Capture findings from onboarding tests.','Rekod dapatan ujian onboarding.')],
 saring:[t('Help define document validation rules.','Bantu takrifkan peraturan pengesahan dokumen.'),t('Review screening results with domain experts.','Semak hasil saringan bersama pakar domain.')],
};
export function projectTasks(projectId:string,roleId:RoleId):LocalText[]{
 const c=contexts[projectId]??t('the pilot','rintis ini');
 if(roleId==='R2'&&domainTasks[projectId])return domainTasks[projectId];
 switch(roleId){
 case 'R1':return [t(`Define a use case for ${c.EN}.`,`Takrifkan kes penggunaan untuk ${c.BM}.`),t('Agree success measures with the project team.','Persetujui ukuran kejayaan bersama pasukan projek.')];
 case 'R3':return [t(`Build a small prototype for ${c.EN}.`,`Bina prototaip kecil untuk ${c.BM}.`),t('Test its inputs, outputs and failure cases.','Uji input, output dan senario kegagalan.')];
 case 'R4':return [t(`Connect components supporting ${c.EN}.`,`Sambungkan komponen yang menyokong ${c.BM}.`),t('Test integration and document issues.','Uji integrasi dan dokumentasikan isu.')];
 case 'R5':return [t(`Evaluate AI outputs for ${c.EN}.`,`Nilai output AI untuk ${c.BM}.`),t('Record quality and control issues with specialists.','Rekod isu kualiti dan kawalan bersama pakar.')];
 case 'R6':return [t(projectId==='uniqa'?'Test common customer scenarios.':`Try pilot scenarios for ${c.EN}.`,projectId==='uniqa'?'Uji senario pelanggan lazim.':`Cuba senario rintis untuk ${c.BM}.`),t('Record feedback and improvement suggestions.','Rekod maklum balas dan cadangan penambahbaikan.')];
 case 'R7':return [t(`Capture the baseline for ${c.EN}.`,`Rekod garis dasar untuk ${c.BM}.`),t('Measure outcomes and collect supporting evidence.','Ukur hasil dan kumpulkan bukti sokongan.')];
 default:return [t(`Gather domain information for ${c.EN}.`,`Kumpulkan maklumat domain untuk ${c.BM}.`),t('Review sample data and record findings.','Semak data sampel dan rekod dapatan.')];
 }
}
export const projectRequirements:Record<string,LocalText>={
 dataops:t('Data operations knowledge','Pengetahuan operasi data'),bfsi:t('Financial data knowledge','Pengetahuan data kewangan'),
 'ai-assist':t('IT support knowledge','Pengetahuan sokongan IT'),aura:t('IT operations knowledge','Pengetahuan operasi IT'),
 engineering:t('Software development knowledge','Pengetahuan pembangunan perisian'),ekyc:t('Onboarding or document knowledge','Pengetahuan onboarding atau dokumen'),
 saring:t('Finance, HR or document knowledge','Pengetahuan kewangan, HR atau dokumen'),uniqa:t('Customer journey knowledge','Pengetahuan perjalanan pelanggan'),
};
