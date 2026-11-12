/* Public permit page - MongoDB-backed, matching supplied reference layout */
const labels={permitNumber:"رقم التصريح",permitType:"نوع التصريح",declarationStartDate:"تاريخ بداية التصريح",declarationExpiryDate:"تاريخ انتهاء التصريح",residenceNumber:"رقم الهوية / الإقامة",employeeName:"اسم العامل",occupation:"المهنة",nationality:"الجنسية",dateOfBirth:"تاريخ الميلاد",sex:"الجنس",establishmentNumber:"رقم المنشأة",establishmentName:"اسم المنشأة"};
function esc(v){return String(v??"—").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function dataRow(lv,ll,rv,rl){return `<div class="data-row"><div class="data-pair left-pair"><div class="data-value">${esc(lv)}</div><div class="data-label">${esc(ll)}</div></div><div class="data-pair right-pair"><div class="data-value">${esc(rv)}</div><div class="data-label">${esc(rl)}</div></div></div>`;}
function section(title,rows){return `<section class="info-section"><div class="section-title">${title}</div>${rows.join("")}</section>`;}
(async function(){
 const number=decodeURIComponent(location.pathname.split("/").pop()||"");
 const content=document.getElementById("permitContent"),status=document.getElementById("permitStatus");
 try{
  const response=await fetch("/api/employees/public/"+encodeURIComponent(number));
  const data=await response.json();
  if(!response.ok) throw new Error(data.message||"لم يتم العثور على التصريح.");
  status.textContent=data.statusText||(data.active?"ساري المفعول":"غير نشط");
  status.classList.toggle("status-invalid",!data.active);
  content.innerHTML=
   section("بيانات التصريح",[
    dataRow(data.permitType,labels.permitType,data.permitNumber,labels.permitNumber),
    dataRow(data.declarationExpiryDate,labels.declarationExpiryDate,data.declarationStartDate,labels.declarationStartDate)])+
   section("بيانات العامل",[
    dataRow(data.employeeName,labels.employeeName,data.residenceNumber,labels.residenceNumber),
    dataRow(data.nationality,labels.nationality,data.occupation,labels.occupation),
    dataRow(data.sex,labels.sex,data.dateOfBirth,labels.dateOfBirth)])+
   section("بيانات المنشأة",[
    dataRow(data.establishmentName,labels.establishmentName,data.establishmentNumber,labels.establishmentNumber)]);
 }catch(error){
  status.textContent="تعذر التحقق";status.classList.add("status-invalid");
  content.innerHTML=`<p class="notice permit-warning-text">${esc(error.message||"لم يتم العثور على التصريح.")}</p>`;
 }
})();
