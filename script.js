document.addEventListener('DOMContentLoaded',()=>{initThreeJS();initScrollReveal();initNavbar();initTilt();initCursor();initSmooth();initMenu();});

/* Project popup */
const projectData={
  fixify:{title:'Fixify — Hyperlocal Service Marketplace',img:'assets/fixify.png',github:'https://github.com/vivekmaddy16'},
  hireboost:{title:'HireBoost — Smart Resume Optimizer',img:'assets/hireboost.png',github:'https://github.com/vivekmaddy16'}
};
function openProjectPopup(id){
  const d=projectData[id];if(!d)return;
  document.getElementById('popupTitle').textContent=d.title;
  document.getElementById('popupImage').src=d.img;
  document.getElementById('popupGithub').href=d.github;
  document.getElementById('projectPopup').classList.add('active');
  document.body.style.overflow='hidden';
}
function closeProjectPopup(){
  document.getElementById('projectPopup').classList.remove('active');
  document.body.style.overflow='';
}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeProjectPopup();});

function initThreeJS(){
  const c=document.getElementById('hero-canvas');if(!c)return;
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
    mesh.userData={sp:cfg.sp,o:{x:cfg.x,y:cfg.y,z:cfg.z},ph:Math.random()*Math.PI*2,sz:cfg.s};
    scene.add(mesh);blobs.push(mesh);
  });
  scene.add(new THREE.AmbientLight(0xffffff,.6));
  const dl=new THREE.DirectionalLight(0xf4f7ec,.9);dl.position.set(5,5,5);scene.add(dl);
  const pl=new THREE.PointLight(0x8fad5a,.4,15);pl.position.set(-3,3,2);scene.add(pl);
  let mx=0,my=0;
  document.addEventListener('mousemove',e=>{mx=(e.clientX/innerWidth)*2-1;my=-(e.clientY/innerHeight)*2+1;});
  let t=0;
  (function animate(){
    requestAnimationFrame(animate);t+=.01;
    blobs.forEach(b=>{
      const{sp,o,ph,sz}=b.userData;
      b.position.x=o.x+Math.sin(t*sp*100+ph)*.5;
      b.position.y=o.y+Math.cos(t*sp*80+ph)*.4;
      b.position.z=o.z+Math.sin(t*sp*60+ph*.5)*.3;
      const p=b.geometry.attributes.position;
      for(let j=0;j<p.count;j++){
        const x=p.getX(j),y=p.getY(j),z=p.getZ(j),l=Math.sqrt(x*x+y*y+z*z);
        const n=Math.sin(x*2+t*2+ph)*Math.cos(y*2+t*1.5+ph)*Math.sin(z*2+t+ph)*.06;
        const s=(sz+n)/l;p.setXYZ(j,x*s,y*s,z*s);
      }
      p.needsUpdate=true;b.geometry.computeVertexNormals();
      b.rotation.x+=sp*.5;b.rotation.y+=sp*.3;
    });
    cam.position.x+=(mx*.3-cam.position.x)*.02;
    cam.position.y+=(my*.3-cam.position.y)*.02;
    cam.lookAt(scene.position);r.render(scene,cam);
  })();
  addEventListener('resize',()=>{cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();r.setSize(innerWidth,innerHeight);});
}

function initScrollReveal(){
  const o=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('active');});},{threshold:.1,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.reveal').forEach(el=>o.observe(el));
}

function initNavbar(){
  const n=document.getElementById('navbar');
  addEventListener('scroll',()=>n.classList.toggle('scrolled',scrollY>50));
}

function initTilt(){
  document.querySelectorAll('.p-card,.cert-card,.proj-card,.edu-card').forEach(c=>{
    c.addEventListener('mousemove',e=>{const r=c.getBoundingClientRect();const rx=(e.clientY-r.top-r.height/2)/r.height*-6;const ry=(e.clientX-r.left-r.width/2)/r.width*6;c.style.transform=`perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)`;});
    c.addEventListener('mouseleave',()=>{c.style.transform='';});
  });
}

function initCursor(){
  const c=document.getElementById('cursor');
  if(!c||'ontouchstart'in window){if(c)c.style.display='none';return;}
  document.addEventListener('mousemove',e=>{c.style.left=e.clientX+'px';c.style.top=e.clientY+'px';});
  document.querySelectorAll('a,button,.p-card,.cert-card,.proj-card,.edu-card').forEach(el=>{
    el.addEventListener('mouseenter',()=>c.classList.add('hover'));
    el.addEventListener('mouseleave',()=>c.classList.remove('hover'));
  });
}

function initSmooth(){
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',e=>{e.preventDefault();const t=document.querySelector(a.getAttribute('href'));if(t){t.scrollIntoView({behavior:'smooth'});document.getElementById('navMenu').classList.remove('active');}});
  });
}

function initMenu(){
  const b=document.getElementById('menuToggle'),m=document.getElementById('navMenu');
  if(b&&m)b.addEventListener('click',()=>m.classList.toggle('active'));
}
