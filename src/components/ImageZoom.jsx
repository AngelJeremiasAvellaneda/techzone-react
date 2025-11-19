import { useRef } from "react";

export default function ImageZoom({ src, zoomLevel = 2 }) {
  const mainImgRef = useRef();
  const lensRef = useRef();

  const moveLens = e => {
    const main = mainImgRef.current;
    const lens = lensRef.current;
    const rect = main.getBoundingClientRect();
    const lensSize = lens.offsetWidth / 2;
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    if(x<lensSize) x=lensSize;
    if(x>rect.width-lensSize) x=rect.width-lensSize;
    if(y<lensSize) y=lensSize;
    if(y>rect.height-lensSize) y=rect.height-lensSize;

    lens.style.left = `${x-lensSize}px`;
    lens.style.top = `${y-lensSize}px`;
    lens.style.backgroundPosition = `-${(x*zoomLevel)-lensSize}px -${(y*zoomLevel)-lensSize}px`;
  }

  return (
    <div className="relative inline-block">
      <img ref={mainImgRef} src={src} className="block" 
           onMouseMove={moveLens} 
           onMouseEnter={() => lensRef.current.style.display='block'}
           onMouseLeave={() => lensRef.current.style.display='none'} 
      />
      <div ref={lensRef} className="absolute w-32 h-32 border border-gray-300 rounded-lg bg-no-repeat hidden pointer-events-none" 
           style={{backgroundImage: `url(${src})`, backgroundSize: `${100*zoomLevel}%`}}></div>
    </div>
  );
}
