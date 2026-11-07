import { useState } from 'react';
import './CatalogImage.css';

import { fallbackImage, imageSource } from './imageSources';
export default function CatalogImage({image,title='',category='',kind='product',compact=false}) {
 const [failed,setFailed]=useState('');
 const fallback=fallbackImage({title,category,kind});
 const preferred=imageSource(image,{title,category,kind});
 const src=failed===preferred?fallback:preferred;
 return <><img className="catalog-photo" src={src} alt={`${title} — fotografía ilustrativa`} loading="lazy" decoding="async" onError={()=>{if(src!==fallback)setFailed(preferred);}}/>{!compact&&<span className="catalog-photo-label">Imagen ilustrativa</span>}</>;
}
