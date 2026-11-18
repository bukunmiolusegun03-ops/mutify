const products = [
 {id:1,name:"Everyday Wireless Headphones",category:"Electronics",price:28500,old:35000,tag:"BESTSELLER",rating:"4.8",emoji:"🎧",image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=85",desc:"Comfortable wireless headphones for music, calls and everyday listening. Sample product listing."},
 {id:2,name:"Minimal Ceramic Table Set",category:"Home & Kitchen",price:18500,old:22000,tag:"NEW",rating:"4.7",emoji:"☕",image:"https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=700&q=85",desc:"A clean, timeless ceramic set that brings a little calm to your everyday table."},
 {id:3,name:"Classic Everyday Sneakers",category:"Fashion",price:32000,old:39000,tag:"POPULAR",rating:"4.9",emoji:"👟",image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=85",desc:"Versatile everyday sneakers with a comfortable fit and simple modern styling."},
 {id:4,name:"Modern Smart Watch",category:"Electronics",price:45000,old:52000,tag:"TRENDING",rating:"4.6",emoji:"⌚",image:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=85",desc:"A modern watch-inspired accessory for keeping your day organised."},
 {id:5,name:"Daily Care Essentials Kit",category:"Beauty",price:12500,old:15000,tag:"GREAT VALUE",rating:"4.7",emoji:"🧴",image:"https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=700&q=85",desc:"A curated personal-care set for a simple everyday routine."},
 {id:6,name:"Compact Travel Backpack",category:"Fashion",price:27000,old:32000,tag:"FAVOURITE",rating:"4.8",emoji:"🎒",image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=85",desc:"A practical backpack for commuting, campus and weekend plans."},
 {id:7,name:"Wireless Desk Speaker",category:"Electronics",price:38000,old:44000,tag:"NEW",rating:"4.5",emoji:"🔊",image:"https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=700&q=85",desc:"A compact speaker with a clean design for your desk or living space."},
 {id:8,name:"Soft Lounge Cushion",category:"Home & Kitchen",price:9500,old:12000,tag:"COZY PICK",rating:"4.6",emoji:"🛋️",image:"https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=700&q=85",desc:"Add a comfortable accent to your favourite corner at home."},
 {id:9,name:"Fitness Training Bottle",category:"Sports",price:7500,old:9000,tag:"EVERYDAY",rating:"4.4",emoji:"🥤",image:"https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=700&q=85",desc:"A reusable bottle to keep hydration close while you are on the move."},
 {id:10,name:"Modern Desk Lamp",category:"Home & Kitchen",price:21500,old:26000,tag:"DESIGN PICK",rating:"4.8",emoji:"💡",image:"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=85",desc:"A minimal desk lamp for a focused workspace and warm evenings."},
 {id:11,name:"Everyday Crossbody Bag",category:"Fashion",price:19500,old:24000,tag:"POPULAR",rating:"4.7",emoji:"👜",image:"https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=85",desc:"A compact crossbody bag designed to carry your daily essentials."},
 {id:12,name:"Portable Power Bank",category:"Electronics",price:24000,old:29000,tag:"USEFUL FIND",rating:"4.6",emoji:"🔋",image:"https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=700&q=85",desc:"A portable charging companion for busy days and travel."}
];
const categories=[["All products","✳"],["Electronics","⌁"],["Fashion","◇"],["Home & Kitchen","⌂"],["Beauty","✿"],["Sports","↗"]];
const rates={NGN:1,USD:0.00067,GBP:0.00053,EUR:0.00062,GHS:0.0105};
const symbols={NGN:"₦",USD:"$",GBP:"£",EUR:"€",GHS:"GH₵"};
let currency=localStorage.getItem("mutify_currency")||"NGN";
let cart=JSON.parse(localStorage.getItem("mutify_cart")||"{}");
let wishlist=JSON.parse(localStorage.getItem("mutify_wishlist")||"[]");
let activeCategory="All products",searchTerm="",toastTimer;
const $=id=>document.getElementById(id);
function money(value){return symbols[currency]+new Intl.NumberFormat("en",{maximumFractionDigits:currency==="NGN"?0:2}).format(value*rates[currency]);}
function save(){localStorage.setItem("mutify_cart",JSON.stringify(cart));localStorage.setItem("mutify_wishlist",JSON.stringify(wishlist));localStorage.setItem("mutify_currency",currency);}
function notify(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2300);}
function countCart(){return Object.values(cart).reduce((a,b)=>a+b,0)}
function updateCounts(){$("cartCount").textContent=countCart();$("wishCount").textContent=wishlist.length;$("drawerCount").textContent="("+countCart()+")"}
function renderCategories(){
 $("categoryGrid").innerHTML=categories.slice(1).map(([name,icon])=>`<button class="category-card" data-category="${name}"><span class="category-icon">${icon}</span><b>${name}</b><small>${products.filter(p=>p.category===name).length} curated finds</small></button>`).join("");
 $("categoryGrid").querySelectorAll("button").forEach(b=>b.onclick=()=>setCategory(b.dataset.category));
}
function filteredProducts(){
 let list=products.filter(p=>(activeCategory==="All products"||p.category===activeCategory)&&(`${p.name} ${p.category} ${p.desc}`).toLowerCase().includes(searchTerm));
 const sort=$("sortSelect").value;
 if(sort==="low")list.sort((a,b)=>a.price-b.price);if(sort==="high")list.sort((a,b)=>b.price-a.price);if(sort==="name")list.sort((a,b)=>a.name.localeCompare(b.name));
 return list;
}
function renderProducts(){
 const list=filteredProducts();
 $("productHeading").textContent=searchTerm?`Search results for "${searchTerm}"`:activeCategory==="All products"?"Popular right now":activeCategory;
 $("activeFilter").textContent=activeCategory!=="All products"||searchTerm?`${list.length} product${list.length===1?"":"s"} found · ${activeCategory}`:"A few good things to get you started";
 $("productGrid").innerHTML=list.map(p=>`<article class="product-card" data-id="${p.id}">
 <div class="product-image"><img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.style.display='none';this.parentElement.insertAdjacentHTML('beforeend','<span style=&quot;font-size:65px&quot;>${p.emoji}</span>')"><span class="product-badge">${p.tag}</span><button class="quick-wish ${wishlist.includes(p.id)?"saved":""}" data-wish="${p.id}" aria-label="Save ${p.name}">${wishlist.includes(p.id)?"♥":"♡"}</button><button class="quick-add" data-add="${p.id}">＋ Add to bag</button></div>
 <div class="product-info"><span class="product-category">${p.category}</span><h3>${p.name}</h3><div class="price-row"><span class="price">${money(p.price)}</span><span class="old-price">${money(p.old)}</span></div><div class="rating">★ ${p.rating} <span style="color:#a0aaa2">· Sample rating</span></div></div></article>`).join("");
 $("emptyState").classList.toggle("hidden",list.length!==0);
 $("productGrid").classList.toggle("hidden",list.length===0);
 $("productGrid").querySelectorAll(".product-card").forEach(card=>card.addEventListener("click",e=>{if(e.target.closest("button"))return;openProduct(+card.dataset.id)}));
 $("productGrid").querySelectorAll("[data-add]").forEach(b=>b.onclick=e=>{e.stopPropagation();addCart(+b.dataset.add)});
 $("productGrid").querySelectorAll("[data-wish]").forEach(b=>b.onclick=e=>{e.stopPropagation();toggleWish(+b.dataset.wish)});
}
function setCategory(name){activeCategory=name;searchTerm="";$("searchInput").value="";renderProducts();document.querySelectorAll(".category-card").forEach(b=>b.style.borderColor=b.dataset.category===name?"#9bd2aa":"");$("shop").scrollIntoView({behavior:"smooth"});}
function addCart(id){cart[id]=(cart[id]||0)+1;save();updateCounts();renderCart();notify("Added to your bag");}
function toggleWish(id){wishlist=wishlist.includes(id)?wishlist.filter(x=>x!==id):[...wishlist,id];save();updateCounts();renderProducts();notify(wishlist.includes(id)?"Saved to your wishlist":"Removed from wishlist");}
function renderCart(){
 const entries=Object.entries(cart).filter(([id,q])=>q>0);
 $("cartItems").innerHTML=entries.length?entries.map(([id,q])=>{const p=products.find(x=>x.id===+id);return `<div class="cart-line"><img src="${p.image}" alt=""><div><h4>${p.name}</h4><small>${money(p.price)}</small><div class="qty"><button data-dec="${id}">−</button><span>${q}</span><button data-inc="${id}">+</button></div><button class="remove-line" data-remove="${id}">Remove</button></div><strong>${money(p.price*q)}</strong></div>`}).join(""):`<div class="cart-empty">Your bag is taking a little break.<br><br>Explore the store and add something you like.</div>`;
 const total=entries.reduce((sum,[id,q])=>sum+products.find(p=>p.id===+id).price*q,0);
 $("cartSubtotal").textContent=money(total);updateCounts();
 $("cartItems").querySelectorAll("[data-inc]").forEach(b=>b.onclick=()=>{cart[b.dataset.inc]++;save();renderCart()});
 $("cartItems").querySelectorAll("[data-dec]").forEach(b=>b.onclick=()=>{const id=b.dataset.dec;cart[id]--;if(cart[id]<=0)delete cart[id];save();renderCart()});
 $("cartItems").querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>{delete cart[b.dataset.remove];save();renderCart();notify("Item removed")});
}
function showCart(){renderCart();$("overlay").classList.remove("hidden");$("cartDrawer").classList.add("open");$("cartDrawer").setAttribute("aria-hidden","false")}
function hideCart(){$("cartDrawer").classList.remove("open");$("overlay").classList.add("hidden");$("cartDrawer").setAttribute("aria-hidden","true");}
function openProduct(id){const p=products.find(x=>x.id===id);$("modalContent").innerHTML=`<div class="modal-product"><img src="${p.image}" alt="${p.name}"><div><span class="eyebrow">${p.category.toUpperCase()}</span><h2>${p.name}</h2><div class="price">${money(p.price)} <span class="old-price">${money(p.old)}</span></div><div class="rating">★ ${p.rating} · Sample rating</div><p>${p.desc}</p><p><b>Availability:</b> Sample listing</p><button class="primary-btn" id="modalAdd">Add to bag ↗</button></div></div>`;$("productModal").classList.remove("hidden");$("overlay").classList.remove("hidden");$("modalAdd").onclick=()=>{addCart(id);closeModal()};}
function closeModal(){$("productModal").classList.add("hidden");if(!$("cartDrawer").classList.contains("open"))$("overlay").classList.add("hidden")}
function applyCurrency(){currency=$("currencySelect").value;save();renderProducts();renderCart();}
$("searchForm").addEventListener("submit",e=>{e.preventDefault();searchTerm=$("searchInput").value.trim().toLowerCase();activeCategory="All products";renderProducts();$("shop").scrollIntoView({behavior:"smooth"})});
$("searchInput").addEventListener("input",()=>{if(!$("searchInput").value.trim()){searchTerm="";renderProducts()}});
$("sortSelect").onchange=renderProducts;
$("currencySelect").value=currency;$("currencySelect").onchange=applyCurrency;
$("cartOpen").onclick=showCart;$("cartClose").onclick=hideCart;$("continueShopping").onclick=hideCart;$("overlay").onclick=()=>{hideCart();closeModal()};
$("modalClose").onclick=closeModal;
$("wishlistTop").onclick=()=>{activeCategory="All products";searchTerm="";renderProducts();const saved=products.filter(p=>wishlist.includes(p.id));$("productHeading").textContent="Your saved favourites";$("activeFilter").textContent=`${saved.length} saved item(s)`;$("productGrid").innerHTML=saved.map(p=>`<article class="product-card"><div class="product-image"><img src="${p.image}" alt="${p.name}"><button class="quick-wish saved" data-wish="${p.id}">♥</button><button class="quick-add" data-add="${p.id}">＋ Add to bag</button></div><div class="product-info"><span class="product-category">${p.category}</span><h3>${p.name}</h3><span class="price">${money(p.price)}</span></div></article>`).join("");$("productGrid").querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>addCart(+b.dataset.add));$("productGrid").querySelectorAll("[data-wish]").forEach(b=>b.onclick=()=>toggleWish(+b.dataset.wish));$("emptyState").classList.toggle("hidden",saved.length>0);$("productGrid").classList.toggle("hidden",saved.length===0);$("shop").scrollIntoView({behavior:"smooth"})};
$("resetFilters").onclick=()=>{activeCategory="All products";searchTerm="";$("searchInput").value="";renderProducts()};
$("checkoutBtn").onclick=()=>notify("Demo checkout only — payment and order placement are not connected yet.");
$("newsletterForm").onsubmit=e=>{e.preventDefault();notify("Thanks for your interest! Newsletter signup is a demo.");$("newsletterEmail").value=""};
$("year").textContent=new Date().getFullYear();
renderCategories();renderProducts();renderCart();