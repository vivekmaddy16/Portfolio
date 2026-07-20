document.addEventListener('DOMContentLoaded',()=>{
  initThreeJS();
  initScrollReveal();
  initNavbar();
  initTilt();
  initCursor();
  initSmooth();
  initMenu();
});

/* Project popup data */
const projectData={
  lobiie:{title:'Lobiie — Real-Time Chat & Video Platform',img:'assets/lobiie.png',github:'https://github.com/vivekmaddy16'},
  fixify:{title:'Fixify — Hyperlocal Service Marketplace',img:'assets/fixify.png',github:'https://github.com/vivekmaddy16'},
  hireboost:{title:'HireBoost — Smart Resume Optimizer',img:'assets/hireboost.png',github:'https://github.com/vivekmaddy16'},
  briefly:{title:'Briefly — AI News Aggregator',img:'assets/briefly.png',github:'https://github.com/vivekmaddy16/Briefly'}
};

let previouslyFocusedElement = null;

function openProjectPopup(id){
  const d=projectData[id];if(!d)return;
  previouslyFocusedElement = document.activeElement;
  const modal = document.getElementById('projectPopup');
  document.getElementById('popupTitle').textContent=d.title;
  document.getElementById('popupImage').src=d.img;
  document.getElementById('popupGithub').href=d.github;
  if(modal){
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    const closeBtn = modal.querySelector('.proj-popup-close');
    if(closeBtn) closeBtn.focus();
  }
  document.body.style.overflow='hidden';
}

function closeProjectPopup(){
  const modal = document.getElementById('projectPopup');
  if(modal && modal.classList.contains('active')){
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow='';
  if(previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function'){
    previouslyFocusedElement.focus();
  }
}

// Trap focus inside modal & handle Escape key navigation
document.addEventListener('keydown', e => {
  const modal = document.getElementById('projectPopup');
  if (e.key === 'Escape') {
    closeProjectPopup();
    closeNavMenu();
  }
  if (e.key === 'Tab' && modal && modal.classList.contains('active')) {
    const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

function initThreeJS(){
  const c=document.getElementById('hero-canvas');if(!c)return;
  if(typeof THREE === 'undefined') return;
  
  const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,.1,1000);
  cam.position.z=5;
  const r=new THREE.WebGLRenderer({canvas:c,alpha:true,antialias:true});
  r.setSize(innerWidth,innerHeight);r.setPixelRatio(Math.min(devicePixelRatio,2));
  const blobs=[],cfgs=[
    {s:1.4,c:0x8fad5a,x:3,y:1.5,z:-2,sp:.003},{s:1,c:0x6b8c3e,x:-3,y:-1,z:-3,sp:.004},
    {s:.7,c:0xb8cc8e,x:4.5,y:-2,z:-1.5,sp:.005},{s:1.2,c:0x4a6b2a,x:-4,y:2.5,z:-4,sp:.002},
    {s:.5,c:0xd4dfc0,x:2,y:-3,z:-2.5,sp:.006},{s:.9,c:0x8fad5a,x:-1.5,y:3,z:-3.5,sp:.003},
    {s:.6,c:0xb8cc8e,x:5,y:.5,z:-1,sp:.007},{s:.4,c:0x6b8c3e,x:-5,y:-2.5,z:-2,sp:.005}
  ];
  cfgs.forEach(cfg=>{
    const g=new THREE.IcosahedronGeometry(cfg.s,4);
    const m=new THREE.MeshPhysicalMaterial({color:cfg.c,roughness:.25,metalness:.05,transparent:true,opacity:.5,clearcoat:.5,clearcoatRoughness:.15});
    const mesh=new THREE.Mesh(g,m);mesh.position.set(cfg.x,cfg.y,cfg.z);
    /* Store original vertex positions so deformation doesn't compound */
    const origPositions=new Float32Array(g.attributes.position.array);
    mesh.userData={sp:cfg.sp,o:{x:cfg.x,y:cfg.y,z:cfg.z},ph:Math.random()*Math.PI*2,sz:cfg.s,origPositions};
    scene.add(mesh);blobs.push(mesh);
  });
  scene.add(new THREE.AmbientLight(0xffffff,.6));
  const dl=new THREE.DirectionalLight(0xf4f7ec,.9);dl.position.set(5,5,5);scene.add(dl);
  const pl=new THREE.PointLight(0x8fad5a,.4,15);pl.position.set(-3,3,2);scene.add(pl);
  let mx=0,my=0;
  document.addEventListener('mousemove',e=>{mx=(e.clientX/innerWidth)*2-1;my=-(e.clientY/innerHeight)*2+1;});
  let t=0, isVisible=true, animFrameId=null;

  function animate(){
    if(!isVisible) return;
    animFrameId=requestAnimationFrame(animate);t+=.01;
    blobs.forEach(b=>{
      const{sp,o,ph,sz,origPositions}=b.userData;
      b.position.x=o.x+Math.sin(t*sp*100+ph)*.5;
      b.position.y=o.y+Math.cos(t*sp*80+ph)*.4;
      b.position.z=o.z+Math.sin(t*sp*60+ph*.5)*.3;
      const p=b.geometry.attributes.position;
      for(let j=0;j<p.count;j++){
        const ox=origPositions[j*3],oy=origPositions[j*3+1],oz=origPositions[j*3+2];
        const l=Math.sqrt(ox*ox+oy*oy+oz*oz);
        const n=Math.sin(ox*2+t*2+ph)*Math.cos(oy*2+t*1.5+ph)*Math.sin(oz*2+t+ph)*.06;
        const s=(sz+n)/l;
        p.setXYZ(j,ox*s,oy*s,oz*s);
      }
      p.needsUpdate=true;
      b.rotation.x+=sp*.5;b.rotation.y+=sp*.3;
    });
    cam.position.x+=(mx*.3-cam.position.x)*.02;
    cam.position.y+=(my*.3-cam.position.y)*.02;
    cam.lookAt(scene.position);r.render(scene,cam);
  }

  // IntersectionObserver to pause animation loop when hero canvas is off-screen
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting && !document.hidden;
      if (isVisible) {
        if (!animFrameId) animate();
      } else {
        if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
      }
    });
  }, { threshold: 0.05 });
  observer.observe(c);

  document.addEventListener('visibilitychange', () => {
    isVisible = !document.hidden && c.getBoundingClientRect().bottom > 0;
    if (isVisible) {
      if (!animFrameId) animate();
    } else {
      if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
    }
  });

  animate();

  let lastWidth = window.innerWidth;
  addEventListener('resize',()=>{
    if(window.innerWidth !== lastWidth){
      lastWidth = window.innerWidth;
      cam.aspect=innerWidth/innerHeight;
      cam.updateProjectionMatrix();
      r.setSize(innerWidth,innerHeight);
    }
  });
}

function initScrollReveal(){
  const o=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('active');});},{threshold:.1,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.reveal').forEach(el=>o.observe(el));
}

function initNavbar(){
  const n=document.getElementById('navbar');
  if(n){
    addEventListener('scroll',()=>n.classList.toggle('scrolled',scrollY>50));
  }
}

function initTilt(){
  document.querySelectorAll('.p-card,.cert-card,.proj-card,.edu-card').forEach(c=>{
    c.addEventListener('mousemove',e=>{const r=c.getBoundingClientRect();const rx=(e.clientY-r.top-r.height/2)/r.height*-6;const ry=(e.clientX-r.left-r.width/2)/r.width*6;c.style.transform=`perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)`;});
    c.addEventListener('mouseleave',()=>{c.style.transform='';});
  });
}

function initCursor(){
  const c=document.getElementById('cursor');
  if(!c||'ontouchstart'in window||matchMedia('(pointer: coarse)').matches){if(c)c.style.display='none';return;}
  let mouseX = -100, mouseY = -100;
  let cursorX = -100, cursorY = -100;

  document.addEventListener('mousemove',e=>{
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function updateCursor(){
    cursorX += (mouseX - cursorX) * 0.4;
    cursorY += (mouseY - cursorY) * 0.4;
    c.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(updateCursor);
  }
  requestAnimationFrame(updateCursor);

  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button, .p-card, .cert-card, .proj-card, .edu-card, .hero-cta, .contact-chip')) {
      c.classList.add('hover');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a, button, .p-card, .cert-card, .proj-card, .edu-card, .hero-cta, .contact-chip')) {
      c.classList.remove('hover');
    }
  });
}

function closeNavMenu(){
  const m=document.getElementById('navMenu');
  const b=document.getElementById('menuToggle');
  if(m && m.classList.contains('active')){
    m.classList.remove('active');
    if(b) b.setAttribute('aria-expanded', 'false');
  }
}

function initSmooth(){
  document.querySelectorAll('a[href="#"]').forEach(a=>{
    a.addEventListener('click',e=>{
      e.preventDefault();
      window.scrollTo({top:0,behavior:'smooth'});
      closeNavMenu();
    });
  });
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(a=>{
    a.addEventListener('click',e=>{
      const href = a.getAttribute('href');
      if(!href || href.length < 2) return;
      e.preventDefault();
      try {
        const t=document.querySelector(href);
        if(t){t.scrollIntoView({behavior:'smooth'});closeNavMenu();}
      } catch(err){
        console.warn('Invalid scroll selector:', href);
      }
    });
  });
}

function initMenu(){
  const b=document.getElementById('menuToggle'),m=document.getElementById('navMenu');
  if(b&&m){
    b.addEventListener('click',(e)=>{
      e.stopPropagation();
      const isActive = m.classList.toggle('active');
      b.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    });
    b.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){
        e.preventDefault();
        const isActive = m.classList.toggle('active');
        b.setAttribute('aria-expanded', isActive ? 'true' : 'false');
      }
    });
    document.addEventListener('click', (e)=>{
      if(!m.contains(e.target) && !b.contains(e.target)){
        closeNavMenu();
      }
    });
  }
}
