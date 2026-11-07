export async function api(path, options={}) {
 const response=await fetch('/api'+path,{credentials:'include',...options,headers:{'Content-Type':'application/json',...options.headers},body:options.body===undefined?undefined:JSON.stringify(options.body)});
 const data=await response.json().catch(()=>({message:'El backend local no responde. Inicia npm run dev en Backend.'}));
 if(!response.ok)throw new Error(data.message || 'No se pudo guardar.'); return data;
}
export const updated=()=>window.dispatchEvent(new Event('nenufares:updated'));
