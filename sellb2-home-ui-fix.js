(function(){
'use strict';
const style=document.createElement('style');
style.textContent=`
/* Home hero secondary action: readable in both themes. */
.homehero .heroactions .btn.ghost{
  color:var(--text) !important;
  background:var(--surface) !important;
  border-color:var(--line) !important;
  text-shadow:none !important;
}
.homehero .heroactions .btn.ghost:hover,
.homehero .heroactions .btn.ghost:focus-visible{
  color:var(--text) !important;
  background:var(--surface2) !important;
}
`;
document.head.appendChild(style);
})();
