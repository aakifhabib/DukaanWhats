'use client'
export function DukaanWhatsLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#F8F7F5'}}>
      <div style={{position:'relative'}}>
        <div style={{width:64,height:64,background:'black',color:'white',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:28}}>D</div>
        <div style={{position:'absolute',top:-4,right:-4,width:12,height:12,background:'#E8FF86',borderRadius:999,border:'2px solid #F8F7F5'}}/>
      </div>
      <div style={{marginTop:16,fontWeight:700,fontSize:18}}>DukaanWhats<span style={{opacity:0.4}}>.pk</span></div>
      <div style={{marginTop:4,fontSize:12,color:'#71717a'}}>{message}</div>
      <div style={{marginTop:12,width:120,height:2,background:'#e4e4e7',borderRadius:999,overflow:'hidden'}}><div style={{width:'60%',height:'100%',background:'black',animation:'pulse 1.5s infinite'}}/></div>
    </div>
  )
}
