/* Site-wide lightweight help chatbot. Fixed to the bottom-left on desktop and Android/mobile. */
(() => {
  if (document.getElementById('permitChat')) return;
  const host = document.createElement('div');
  host.className = 'permit-chat';
  host.id = 'permitChat';
  host.innerHTML = `
    <section class="permit-chat-panel" id="permitChatPanel" aria-label="مساعد التصريح" hidden>
      <div class="permit-chat-head">
        <div><strong>مساعد التصريح</strong><small>المساعدة والاستفسارات</small></div>
        <button type="button" class="permit-chat-close" id="permitChatClose" aria-label="إغلاق المحادثة">×</button>
      </div>
      <div class="permit-chat-messages" id="permitChatMessages" aria-live="polite">
        <div class="permit-chat-message bot">مرحباً! كيف يمكنني مساعدتك؟</div>
      </div>
      <div class="permit-chat-quick">
        <button type="button" data-chat-question="كيف أتحقق من حالة التصريح؟">حالة التصريح</button>
        <button type="button" data-chat-question="ماذا أفعل إذا كانت البيانات غير صحيحة؟">بيانات غير صحيحة</button>
        <button type="button" data-chat-question="How can I contact support?">الدعم</button>
      </div>
      <form class="permit-chat-form" id="permitChatForm">
        <input id="permitChatInput" type="text" placeholder="اكتب سؤالك هنا..." autocomplete="off" aria-label="اكتب سؤالك">
        <button type="submit" aria-label="إرسال الرسالة">إرسال</button>
      </form>
      <p class="permit-chat-note">مساعد إرشادي بسيط، وليس جهة تحقق رسمية.</p>
    </section>
    <button type="button" class="permit-chat-launcher" id="permitChatLauncher" aria-label="فتح المساعدة" aria-expanded="false">
      <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 4.5c-6.4 0-11.5 4.6-11.5 10.3 0 2.2.8 4.2 2.3 5.9l-1 5 5.1-1.7c1.6.7 3.3 1.1 5.1 1.1 6.4 0 11.5-4.6 11.5-10.3S22.4 4.5 16 4.5Z"/><path d="M11 14.5h.1M16 14.5h.1M21 14.5h.1"/></svg>
    </button>`;
  document.body.appendChild(host);

  const launcher=host.querySelector('#permitChatLauncher');
  const panel=host.querySelector('#permitChatPanel');
  const close=host.querySelector('#permitChatClose');
  const form=host.querySelector('#permitChatForm');
  const input=host.querySelector('#permitChatInput');
  const messages=host.querySelector('#permitChatMessages');
  const answers=[
    {keys:['حالة','نشط','ساري','status','active','valid'],ar:'حالة التصريح موضحة في بطاقة التصريح. إذا كان التصريح غير نشط أو منتهي الصلاحية، يرجى التواصل مع الجهة المسؤولة.',en:'The permit status appears on the permit card. If it is inactive or expired, contact the responsible authority.'},
    {keys:['خطأ','غير صحيحة','تعديل','بيانات','incorrect','wrong','change','data'],ar:'إذا وجدت بيانات غير صحيحة، يرجى التواصل مع جهة العمل أو الجهة التي أصدرت التصريح لطلب التصحيح.',en:'If any information is incorrect, contact your employer or the authority that issued the permit.'},
    {keys:['دعم','تواصل','مساعدة','support','contact','help'],ar:'للمساعدة، يمكنك التواصل عبر البريد: support@ajeer.com.sa أو زيارة موقع أجير الرسمي.',en:'For assistance, email support@ajeer.com.sa or visit the Ajeer website.'},
    {keys:['رقم','تصريح','permit','number'],ar:'تأكد من استخدام رقم التصريح الصحيح. هذه الصفحة تعرض تفاصيل التصريح الذي فتحته.',en:'Make sure you use the correct permit number. This page displays the permit you opened.'}
  ];
  function addMessage(text,who){const el=document.createElement('div');el.className='permit-chat-message '+who;el.textContent=text;messages.appendChild(el);messages.scrollTop=messages.scrollHeight;}
  function reply(text){const q=text.toLowerCase();const found=answers.find(a=>a.keys.some(k=>q.includes(k)));const english=/[a-z]/i.test(text)&&!/[؀-ۿ]/.test(text);addMessage(found?(english?found.en:found.ar):(english?'I can help with permit status, incorrect information and support contact.':'يمكنني المساعدة بشأن حالة التصريح والبيانات غير الصحيحة والتواصل مع الدعم.'),'bot');}
  function send(text){const value=(text||'').trim();if(!value)return;addMessage(value,'user');reply(value);}
  function toggle(open){panel.hidden=!open;launcher.setAttribute('aria-expanded',String(open));if(open)input.focus();}
  launcher.addEventListener('click',()=>toggle(panel.hidden));
  close.addEventListener('click',()=>toggle(false));
  form.addEventListener('submit',e=>{e.preventDefault();send(input.value);input.value='';input.focus();});
  host.querySelectorAll('[data-chat-question]').forEach(button=>button.addEventListener('click',()=>send(button.dataset.chatQuestion)));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')toggle(false);});
})();
