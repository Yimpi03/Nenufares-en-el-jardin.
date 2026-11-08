const folder='/images/catalogo/';
export function fallbackImage({title='',category='',kind='product'}={}) {
 const words=`${category} ${title}`.toLowerCase();
 if(/semilla/.test(words))return folder+'semillas.jpg';
 if(/koi|pez|peces|carpa/.test(words))return folder+'koi.jpg';
 if(/loto|lotus|zen/.test(words))return folder+'loto.jpg';
 if(/blanc/.test(words))return folder+'nenufar-blanco.jpg';
 return folder+(kind==='event'?'nenufar':'nenufar')+'.jpg';
}
export function imageSource(image, details={}) {
 if(typeof image!=='string')return fallbackImage(details);
 if(image.startsWith('/images/'))return image;
 // Original img-* values were CSS names without a corresponding image.
 if(image.startsWith('img-'))return fallbackImage({...details,title:details.title||image});
 // Replace the two generic seed URLs (a garden and an unrelated image).
 if(/images\.unsplash\.com\/photo-(1585320806297-9794b3e4eeae|1511516246830-1c6ce4b38d38)/.test(image))return fallbackImage(details);
 if(/^https?:\/\//i.test(image))return image;
 return fallbackImage(details);
}
