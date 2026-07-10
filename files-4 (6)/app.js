// Menú móvil
document.addEventListener('DOMContentLoaded', function(){
  var burger = document.querySelector('.burger');
  var nav = document.querySelector('nav.main');
  if(burger && nav){
    burger.addEventListener('click', function(){ nav.classList.toggle('open'); });
  }
});

// ---------- Catálogo de servicios ----------
function initServiceCatalog(){
  var root = document.getElementById('svc-catalog');
  if(!root) return;
  var PAGE_SIZE = 24;
  var page = 1;
  var data = [];

  function ready(json){
    data = json;
    buildCategoryOptions(data);
    render();
  }
  if(window.SVC_DATA){
    ready(window.SVC_DATA);
  } else {
    fetch('assets/data-servicios.json').then(r=>r.json()).then(ready);
  }

  function buildCategoryOptions(items){
    var cats = Array.from(new Set(items.map(i=>i.c))).sort();
    var sel = document.getElementById('svc-cat');
    cats.forEach(function(c){
      var o = document.createElement('option');
      o.value = c; o.textContent = c + ' (' + items.filter(i=>i.c===c).length + ')';
      sel.appendChild(o);
    });
  }

  function filtered(){
    var q = (document.getElementById('svc-search').value || '').toLowerCase();
    var cat = document.getElementById('svc-cat').value;
    return data.filter(function(i){
      var matchQ = !q || i.n.toLowerCase().indexOf(q) > -1 || i.d.toLowerCase().indexOf(q) > -1;
      var matchC = !cat || i.c === cat;
      return matchQ && matchC;
    });
  }

  function render(){
    var items = filtered();
    var total = items.length;
    var pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if(page > pages) page = pages;
    var start = (page-1)*PAGE_SIZE;
    var slice = items.slice(start, start+PAGE_SIZE);

    document.getElementById('svc-meta').textContent =
      total + ' servicios encontrados — página ' + page + ' de ' + pages;

    root.innerHTML = slice.map(function(i){
      var price = i.p ? ('$ ' + i.p.toLocaleString('es-AR') + ' ARS') : 'Cotizar';
      return '<div class="svc-card">' +
        '<span class="cat">' + escapeHtml(i.c) + '</span>' +
        '<h4>' + escapeHtml(i.n) + '</h4>' +
        '<p>' + escapeHtml(i.d || 'Solución a medida para tu negocio.') + '</p>' +
        '<div class="price">' + price + '</div>' +
        '</div>';
    }).join('');

    renderPager(pages);
  }

  function renderPager(pages){
    var pager = document.getElementById('svc-pager');
    var html = '';
    html += '<button ' + (page<=1?'disabled':'') + ' onclick="svcGoto(' + (page-1) + ')">← Anterior</button>';
    var windowSize = 5;
    var startP = Math.max(1, page - Math.floor(windowSize/2));
    var endP = Math.min(pages, startP + windowSize - 1);
    startP = Math.max(1, endP - windowSize + 1);
    for(var p=startP; p<=endP; p++){
      html += '<button class="' + (p===page?'active':'') + '" onclick="svcGoto(' + p + ')">' + p + '</button>';
    }
    html += '<button ' + (page>=pages?'disabled':'') + ' onclick="svcGoto(' + (page+1) + ')">Siguiente →</button>';
    pager.innerHTML = html;
  }

  window.svcGoto = function(p){ page = p; render(); window.scrollTo({top: document.getElementById('svc-catalog').offsetTop - 100, behavior:'smooth'}); };

  document.getElementById('svc-search').addEventListener('input', function(){ page=1; render(); });
  document.getElementById('svc-cat').addEventListener('change', function(){ page=1; render(); });
}

// ---------- Catálogo de cursos ----------
function initCourseCatalog(){
  var root = document.getElementById('course-catalog');
  if(!root) return;
  var PAGE_SIZE = 18;
  var page = 1;
  var data = [];

  function ready(json){
    data = json;
    render();
  }
  if(window.COURSE_DATA){
    ready(window.COURSE_DATA);
  } else {
    fetch('assets/data-cursos.json').then(r=>r.json()).then(ready);
  }

  function filtered(){
    var q = (document.getElementById('course-search').value || '').toLowerCase();
    return data.filter(function(i){
      return !q || i.t.toLowerCase().indexOf(q) > -1 || i.d.toLowerCase().indexOf(q) > -1;
    });
  }

  function render(){
    var items = filtered();
    var total = items.length;
    var pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if(page > pages) page = pages;
    var start = (page-1)*PAGE_SIZE;
    var slice = items.slice(start, start+PAGE_SIZE);

    document.getElementById('course-meta').textContent =
      total + ' cursos disponibles — página ' + page + ' de ' + pages;

    root.innerHTML = slice.map(function(i){
      return '<div class="course-card">' +
        '<span class="course-badge">Academia Viaweb</span>' +
        '<h4>' + escapeHtml(i.t) + '</h4>' +
        '<p>' + escapeHtml((i.d||'').slice(0,140)) + (i.d && i.d.length>140?'…':'') + '</p>' +
        '</div>';
    }).join('');
    renderPager(pages);
  }

  function renderPager(pages){
    var pager = document.getElementById('course-pager');
    var html = '';
    html += '<button ' + (page<=1?'disabled':'') + ' onclick="courseGoto(' + (page-1) + ')">← Anterior</button>';
    var windowSize = 5;
    var startP = Math.max(1, page - Math.floor(windowSize/2));
    var endP = Math.min(pages, startP + windowSize - 1);
    startP = Math.max(1, endP - windowSize + 1);
    for(var p=startP; p<=endP; p++){
      html += '<button class="' + (p===page?'active':'') + '" onclick="courseGoto(' + p + ')">' + p + '</button>';
    }
    html += '<button ' + (page>=pages?'disabled':'') + ' onclick="courseGoto(' + (page+1) + ')">Siguiente →</button>';
    pager.innerHTML = html;
  }

  window.courseGoto = function(p){ page = p; render(); window.scrollTo({top: document.getElementById('course-catalog').offsetTop - 100, behavior:'smooth'}); };

  document.getElementById('course-search').addEventListener('input', function(){ page=1; render(); });
}

function escapeHtml(s){
  return (s||'').replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

document.addEventListener('DOMContentLoaded', function(){
  initServiceCatalog();
  initCourseCatalog();

  // Contact form (demo, no backend)
  var form = document.getElementById('contact-form');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var ok = document.getElementById('form-ok');
      form.style.display = 'none';
      ok.style.display = 'block';
    });
  }
});
