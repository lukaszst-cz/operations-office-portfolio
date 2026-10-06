document.querySelectorAll(".preview-tab").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".preview-tab").forEach(x=>x.classList.remove("active"));
    document.querySelectorAll(".preview").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("preview-"+btn.dataset.preview).classList.add("active");
  });
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
