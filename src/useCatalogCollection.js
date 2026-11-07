import {useState,useRef,useCallback} from 'react';
import {api,updated} from './api';
export function useCatalogCollection(kind,onError){
 const [rows,setRows]=useState([]); const current=useRef([]); const saving=useRef(false);
 const load=useCallback(data=>{current.current=data;setRows(data);},[]);
 const save=async next=>{
  if(saving.current){onError('Espera a que termine el guardado y vuelve a cargar los datos.');return;}
  saving.current=true;
  try{
   const previous=current.current;const desired=typeof next==='function'?next(previous):next;
   const upserts=desired.filter(x=>!previous.some(p=>String(p.id)===String(x.id)&&JSON.stringify(p)===JSON.stringify(x)));
   const deleted=previous.filter(p=>!desired.some(x=>String(p.id)===String(x.id))).map(x=>x.id);
   await api('/manage/'+kind,{method:'PUT',body:{upserts,deleted}});load(desired);updated();
  }catch(e){onError(e.message);}finally{saving.current=false;}
 };
 return [rows,save,load];
}
