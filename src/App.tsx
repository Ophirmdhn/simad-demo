import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { MapContainer, TileLayer, CircleMarker, Polygon, Popup, useMap } from 'react-leaflet'
import { Building2, ChevronLeft, Layers3, LocateFixed, Plus, Search, X, Warehouse } from 'lucide-react'
import { assets as initialAssets, formatRupiah, type Asset, type AssetCondition } from './data'

const colorFor = (condition:string) => condition === 'Baik' ? '#10b981' : condition === 'Rusak Ringan' ? '#f59e0b' : '#ef4444'
const kibFor = (category:string) => category === 'Tanah' ? 'KIB-A' : category === 'Kendaraan' ? 'KIB-B' : 'KIB-C'

function rectangleFromDimensions(lat:number,lng:number,lengthM:number,widthM:number):[number,number][] {
  const latOffset = lengthM / 2 / 111320
  const lngOffset = widthM / 2 / (111320 * Math.cos(lat * Math.PI / 180))
  return [
    [lat-latOffset,lng-lngOffset],
    [lat-latOffset,lng+lngOffset],
    [lat+latOffset,lng+lngOffset],
    [lat+latOffset,lng-lngOffset]
  ]
}
function getPolygon(asset:Asset):[number,number][]|null {
  if (asset.polygon?.length) return asset.polygon
  if (asset.lengthM && asset.widthM && asset.category !== 'Kendaraan') {
    return rectangleFromDimensions(asset.lat,asset.lng,asset.lengthM,asset.widthM)
  }
  return null
}
function Recenter({asset}:{asset:Asset|null}) {
  const map=useMap()
  if(asset) map.flyTo([asset.lat,asset.lng],17,{duration:.65})
  return null
}

type AssetForm = {
  name:string; code:string; category:string; condition:AssetCondition; address:string; area:string
  lat:string; lng:string; lengthM:string; widthM:string; landAreaM2:string; buildingAreaM2:string
  year:string; value:string; description:string; polygonCoordinates:string
}
const emptyForm:AssetForm = {
  name:'',code:'',category:'Bangunan',condition:'Baik',address:'',area:'',
  lat:'',lng:'',lengthM:'',widthM:'',landAreaM2:'',buildingAreaM2:'',
  year:String(new Date().getFullYear()),value:'',description:'',polygonCoordinates:''
}

export default function App(){
 const [query,setQuery]=useState('')
 const [assetList,setAssetList]=useState<Asset[]>(initialAssets)
 const [selected,setSelected]=useState<Asset|null>(initialAssets[0])
 const [sheet,setSheet]=useState<'closed'|'list'|'detail'>('closed')
 const [layersOpen,setLayersOpen]=useState(false)
 const [scope,setScope]=useState('Semua')
 const [showPolygons,setShowPolygons]=useState(true)
 const [showMarkers,setShowMarkers]=useState(true)
 const [formOpen,setFormOpen]=useState(false)
 const [form,setForm]=useState<AssetForm>(emptyForm)
 const [formError,setFormError]=useState('')
 const filtered=useMemo(()=>assetList.filter(a=>
  (scope==='Semua'||(scope==='Kolut'&&a.area!=='Luar Daerah')||(scope==='Luar Daerah'&&a.area==='Luar Daerah'))&&
  (a.name.toLowerCase().includes(query.toLowerCase())||a.code.toLowerCase().includes(query.toLowerCase())||a.area.toLowerCase().includes(query.toLowerCase()))
 ),[assetList,scope,query])

 const submitAsset=(event:FormEvent<HTMLFormElement>)=>{
  event.preventDefault()
  const lat=Number(form.lat),lng=Number(form.lng),lengthM=Number(form.lengthM),widthM=Number(form.widthM)
  if(!form.name.trim()||!form.code.trim()||!form.lat||!form.lng||!form.area.trim()){
   setFormError('Lengkapi nama, kode, wilayah, latitude, dan longitude.');return
  }
  if(!Number.isFinite(lat)||!Number.isFinite(lng)||lat < -90||lat > 90||lng < -180||lng > 180){
   setFormError('Koordinat tidak valid. Periksa latitude dan longitude.');return
  }
  if(form.category!=='Kendaraan'&&(!(lengthM>0)||!(widthM>0))){
   setFormError('Masukkan panjang dan lebar aset agar polygon dapat dibuat.');return
  }
  let polygon:[number,number][]|undefined
  if(form.category!=='Kendaraan'){
   if(form.polygonCoordinates.trim()){
    try {
     polygon=form.polygonCoordinates.trim().split('\n').map(line=>{
      const [pointLat,pointLng]=line.split(',').map(value=>Number(value.trim()))
      if(!Number.isFinite(pointLat)||!Number.isFinite(pointLng)||pointLat < -90||pointLat > 90||pointLng < -180||pointLng > 180) throw new Error('Koordinat polygon tidak valid')
      return [pointLat,pointLng] as [number,number]
     })
     if(polygon.length<3) throw new Error('Polygon membutuhkan minimal 3 titik')
    } catch {
     setFormError('Format koordinat polygon tidak valid. Gunakan satu titik per baris: latitude, longitude. Minimal 3 titik.');return
    }
   } else {
    polygon=rectangleFromDimensions(lat,lng,lengthM,widthM)
   }
  }
  const newAsset:Asset={
   id:`A-${String(Date.now()).slice(-6)}`,code:form.code.trim(),name:form.name.trim(),category:form.category,
   condition:form.condition,address:form.address.trim(),area:form.area.trim(),lat,lng,
   year:Number(form.year)||new Date().getFullYear(),value:Number(form.value)||0,description:form.description.trim(),
   lengthM:form.category==='Kendaraan'?undefined:lengthM,widthM:form.category==='Kendaraan'?undefined:widthM,
   landAreaM2:form.landAreaM2?Number(form.landAreaM2):form.category==='Tanah'?lengthM*widthM:undefined,
   buildingAreaM2:form.buildingAreaM2?Number(form.buildingAreaM2):form.category==='Bangunan'?lengthM*widthM:undefined,
   polygon
  }
  setAssetList(current=>[newAsset,...current])
  setSelected(newAsset);setQuery('');setScope('Semua');setSheet('detail')
  setForm(emptyForm);setFormError('');setFormOpen(false)
 }
 const updateForm=(key:keyof AssetForm,value:string)=>setForm(current=>({...current,[key]:value}))
 const polygons=filtered.map(a=>({asset:a,positions:getPolygon(a)})).filter((p):p is {asset:Asset;positions:[number,number][]}=>Boolean(p.positions))

 return <div className="gis-app">
  <MapContainer center={[-3.985,122.535]} zoom={12} zoomControl={false} className="gis-map">
   <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
   {showPolygons&&polygons.map(({asset,positions})=><Polygon key={asset.id} positions={positions} pathOptions={{color:asset.id===selected?.id?'#2563eb':colorFor(asset.condition),weight:asset.id===selected?.id?3:2,fillColor:asset.id===selected?.id?'#3b82f6':colorFor(asset.condition),fillOpacity:asset.id===selected?.id?0.32:0.20}}/>)}
   {showMarkers&&filtered.map(a=><CircleMarker key={a.id} center={[a.lat,a.lng]} radius={selected?.id===a.id?9:6} pathOptions={{color:'#fff',weight:2,fillColor:colorFor(a.condition),fillOpacity:1}} eventHandlers={{click:()=>{setSelected(a);setSheet('detail')}}}><Popup><div className="popup"><b>{a.name}</b><span>{kibFor(a.category)} · {a.condition}</span></div></Popup></CircleMarker>)}
   <Recenter asset={selected}/>
  </MapContainer>
  <header className="gis-header"><div className="gis-brand"><div className="brand-icon"><Building2 size={19}/></div><div><b>JAGA ASET KITA</b><small>SIG BARANG MILIK DAERAH</small></div></div><div className="header-actions"><span className="demo-label">DEMO PRESENTASI</span><button className="head-icon" onClick={()=>setLayersOpen(!layersOpen)}><Layers3 size={18}/></button></div></header>
  <aside className="left-panel">
   <div className="panel-intro"><span className="eyebrow">SIG BARANG MILIK DAERAH</span><h1>JAGA ASET KITA</h1><p>PEMETAAN ASET PEMERINTAH DAERAH</p><button className="add-asset-button" onClick={()=>setFormOpen(true)}><Plus size={15}/> Tambah Aset</button></div>
   <div className="scope-block"><div className="scope-heading"><b>CAKUPAN WILAYAH ASET</b><span>{scope==='Semua'?'SEMUA LOKASI':scope.toUpperCase()}</span></div><div className="scope-options">{['Semua','Kolut','Luar Daerah'].map((s,i)=><button key={s} onClick={()=>setScope(s)} className={scope===s?'scope-active':''}><b>{i===0?'◎':i===1?'📍':'▣'} {s==='Kolut'?'KOLUT (15 KEC)':s.toUpperCase()}</b><small>{i===0?assetList.length:i===1?assetList.length-1:1} Aset</small></button>)}</div></div>
   <div className="filter-area"><div className="search-box"><Search size={15}/><input placeholder="Cari nama aset, kode barang, sertifikat..." value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button onClick={()=>setQuery('')}><X size={13}/></button>}</div></div><div className="asset-list-head"><b>DAFTAR ASET TERFILTER</b><span>MENAMPILKAN {filtered.length} DARI {assetList.length} ASET</span></div>
   <div className="desktop-assets">{filtered.map(a=><AssetRow key={a.id} asset={a} active={selected?.id===a.id} onClick={()=>{setSelected(a);setSheet('detail')}}/>)}{!filtered.length&&<div className="no-results">Tidak ada aset ditemukan.</div>}</div>
  </aside>
  <button className="collapse-tab" aria-label="Toggle daftar aset" onClick={()=>setSheet(sheet==='list'?'closed':'list')}><ChevronLeft size={18}/></button>
  {selected&&<section className="detail-card"><button className="detail-close" onClick={()=>setSelected(null)}><X size={16}/></button><div className="detail-tags"><span className="kib-tag">▦ {kibFor(selected.category)} · {selected.category.toUpperCase()}</span><span className="status-tag" style={{color:colorFor(selected.condition)}}>● {selected.condition==='Baik'?'AMAN & BERSERTIFIKAT':selected.condition.toUpperCase()}</span></div><h2>{selected.name}</h2><div className="opd-line">OPD: Kecamatan {selected.area}</div><div className="detail-metrics"><div><small>KODE BARANG & REGISTER</small><b>{selected.code}</b></div><div><small>NILAI PEROLEHAN</small><b className="money">{formatRupiah(selected.value)}</b></div><div><small>KECAMATAN & WILAYAH</small><b>{selected.area}</b></div><div><small>LUAS TANAH</small><b>{selected.landAreaM2?`${selected.landAreaM2.toLocaleString('id-ID')} m²`:'-'}</b></div><div><small>LUAS BANGUNAN</small><b>{selected.buildingAreaM2?`${selected.buildingAreaM2.toLocaleString('id-ID')} m²`:'-'}</b></div><div><small>DIMENSI</small><b>{selected.lengthM&&selected.widthM?`${selected.lengthM} × ${selected.widthM} m`:'-'}</b></div></div><div className="detail-description"><b>STATUS HUKUM / SERTIFIKAT:</b><p>{selected.condition==='Baik'?'Sertifikat Hak Pakai No. 00003': 'Dokumen administrasi dalam proses verifikasi'}</p><b>KONDISI FISIK:</b><p>{selected.condition}</p><b>ALAMAT LOKASI:</b><p>{selected.address}, Sulawesi Tenggara</p><b>KOORDINAT:</b><p>{selected.lat.toFixed(6)}, {selected.lng.toFixed(6)}</p><b>KETERANGAN:</b><p>{selected.description}</p></div><div className="detail-buttons"><a href={`https://www.google.com/maps?q=${selected.lat},${selected.lng}`} target="_blank" rel="noreferrer">▣ Buka di Google Maps</a><button onClick={()=>setSelected(null)}>Tutup Detail</button></div></section>}
  <div className="map-tools"><button onClick={()=>setSelected(null)} title="Lepas pilihan"><LocateFixed size={18}/></button><button onClick={()=>setLayersOpen(!layersOpen)} title="Layer peta"><Layers3 size={18}/></button></div>
  {layersOpen&&<div className="layer-popover"><b>PENGATURAN LAYER</b><label><input type="checkbox" checked={showPolygons} onChange={e=>setShowPolygons(e.target.checked)}/> Polygon bidang aset</label><label><input type="checkbox" checked={showMarkers} onChange={e=>setShowMarkers(e.target.checked)}/> Marker lokasi aset</label><div className="layer-note">Basemap: OpenStreetMap</div></div>}
  <div className="map-legend"><b>STATUS PENGAMANAN & ASET</b><span><i style={{background:'#10b981'}}/>Aman & Bersertifikat Resmi</span><span><i style={{background:'#f59e0b'}}/>Proses Sertifikasi / Proyek</span><span><i style={{background:'#ef4444'}}/>Sengketa / Rawan / Rusak Berat</span><span><em className="polygon-key"/>Polygon Lahan dan Gedung</span><span><em className="line-key"/>Jalan & Saluran</span></div>
  <div className="mobile-top-controls"><div className="mobile-search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari aset, kode, atau wilayah..."/>{query&&<button onClick={()=>setQuery('')} aria-label="Hapus pencarian"><X size={14}/></button>}</div></div>
  <div className="mobile-bottom-bar"><button onClick={()=>setSheet(sheet==='list'?'closed':'list')}><Warehouse size={17}/><span>Daftar aset</span><b>{filtered.length}</b></button><button onClick={()=>setLayersOpen(!layersOpen)}><Layers3 size={17}/><span>Layer</span></button><button onClick={()=>setFormOpen(true)}><Plus size={17}/><span>Tambah</span></button></div>
  {sheet!=='closed'&&<div className="mobile-sheet-wrap" onClick={()=>setSheet('closed')}><section className={'mobile-sheet '+(sheet==='detail'?'sheet-detail':'sheet-list')} onClick={e=>e.stopPropagation()}><div className="sheet-grabber" onClick={()=>setSheet('closed')}/>{sheet==='list'?<><div className="sheet-title"><div><b>Daftar Aset Daerah</b><small>{filtered.length} aset ditemukan</small></div><button onClick={()=>setSheet('closed')}><X size={18}/></button></div><div className="sheet-assets">{filtered.map(a=><AssetRow key={a.id} asset={a} active={selected?.id===a.id} onClick={()=>{setSelected(a);setSheet('detail')}}/>)}</div></>:selected&&<><div className="sheet-title"><div><span className="eyebrow">DETAIL INFORMASI ASET</span><b>{selected.name}</b></div><button onClick={()=>setSheet('closed')}><X size={18}/></button></div><div className="mobile-detail-content"><div className="detail-tags"><span className="kib-tag">{kibFor(selected.category)}</span><span className="status-tag" style={{color:colorFor(selected.condition)}}>● {selected.condition}</span></div><div className="detail-metrics"><div><small>KODE BARANG</small><b>{selected.code}</b></div><div><small>NILAI PEROLEHAN</small><b className="money">{formatRupiah(selected.value)}</b></div><div><small>LUAS TANAH</small><b>{selected.landAreaM2?`${selected.landAreaM2.toLocaleString('id-ID')} m²`:'-'}</b></div><div><small>LUAS BANGUNAN</small><b>{selected.buildingAreaM2?`${selected.buildingAreaM2.toLocaleString('id-ID')} m²`:'-'}</b></div><div><small>DIMENSI</small><b>{selected.lengthM&&selected.widthM?`${selected.lengthM} × ${selected.widthM} m`:'-'}</b></div><div><small>WILAYAH</small><b>{selected.area}</b></div></div><div className="detail-description"><b>STATUS HUKUM / SERTIFIKAT</b><p>{selected.condition==='Baik'?'Sertifikat Hak Pakai No. 00003':'Dokumen dalam proses verifikasi'}</p><b>KONDISI FISIK</b><p>{selected.condition}</p><b>ALAMAT LOKASI</b><p>{selected.address}, Sulawesi Tenggara</p><b>KOORDINAT</b><p>{selected.lat.toFixed(6)}, {selected.lng.toFixed(6)}</p><b>KETERANGAN</b><p>{selected.description}</p></div><a className="mobile-map-link" href={`https://www.google.com/maps?q=${selected.lat},${selected.lng}`} target="_blank" rel="noreferrer">Buka di Google Maps</a></div></>}</section></div>}
  <div className="mobile-brand-mini"><span>JAGA ASET KITA</span><small>DEMO GIS</small></div>
  {formOpen&&<div className="asset-form-backdrop" onClick={()=>setFormOpen(false)}><section className="asset-form-modal" onClick={e=>e.stopPropagation()}><div className="form-modal-head"><div><span className="eyebrow">FORMULIR DATA SPASIAL</span><h2>Tambah Aset Daerah</h2><p>Masukkan koordinat dan dimensi untuk membentuk polygon pada peta.</p></div><button onClick={()=>setFormOpen(false)}><X size={19}/></button></div><form onSubmit={submitAsset}>
   <div className="form-section-title">INFORMASI ASET</div><div className="form-grid"><label className="span-2">Nama aset<input required value={form.name} onChange={e=>updateForm('name',e.target.value)} placeholder="Contoh: Kantor Kecamatan"/></label><label>Kode barang<input required value={form.code} onChange={e=>updateForm('code',e.target.value)} placeholder="BRG-008"/></label><label>Kategori<select value={form.category} onChange={e=>updateForm('category',e.target.value)}><option>Tanah</option><option>Bangunan</option><option>Kendaraan</option><option>Fasilitas Umum</option></select></label><label>Wilayah / Kecamatan<input required value={form.area} onChange={e=>updateForm('area',e.target.value)} placeholder="Contoh: Mandonga"/></label><label>Alamat<input value={form.address} onChange={e=>updateForm('address',e.target.value)} placeholder="Alamat aset"/></label><label>Kondisi<select value={form.condition} onChange={e=>updateForm('condition',e.target.value)}><option>Baik</option><option>Rusak Ringan</option><option>Rusak Berat</option></select></label><label>Tahun perolehan<input type="number" value={form.year} onChange={e=>updateForm('year',e.target.value)}/></label><label className="span-2">Nilai perolehan (Rp)<input type="number" min="0" value={form.value} onChange={e=>updateForm('value',e.target.value)} placeholder="Contoh: 2500000000"/></label></div>
   <div className="form-section-title">LOKASI DAN DIMENSI SPASIAL</div><div className="form-grid"><label>Latitude<input required type="number" step="any" value={form.lat} onChange={e=>updateForm('lat',e.target.value)} placeholder="-3.967500"/></label><label>Longitude<input required type="number" step="any" value={form.lng} onChange={e=>updateForm('lng',e.target.value)} placeholder="122.515800"/></label>{form.category!=='Kendaraan'&&<><label>Panjang bidang (m)<input required type="number" min="0.1" step="0.1" value={form.lengthM} onChange={e=>updateForm('lengthM',e.target.value)} placeholder="Contoh: 40"/></label><label>Lebar bidang (m)<input required type="number" min="0.1" step="0.1" value={form.widthM} onChange={e=>updateForm('widthM',e.target.value)} placeholder="Contoh: 25"/></label><label>Luas tanah (m²)<input type="number" min="0" step="0.01" value={form.landAreaM2} onChange={e=>updateForm('landAreaM2',e.target.value)} placeholder={form.lengthM&&form.widthM?`Estimasi ${Number(form.lengthM)*Number(form.widthM)} m²`:'Masukkan luas tanah'}/></label>{form.category==='Bangunan'&&<label>Luas bangunan (m²)<input type="number" min="0" step="0.01" value={form.buildingAreaM2} onChange={e=>updateForm('buildingAreaM2',e.target.value)} placeholder="Luas total lantai"/></label>}</>}</div>
   {form.category!=='Kendaraan'&&<div className="polygon-hint"><b>Preview dimensi polygon</b><span>{form.lengthM&&form.widthM?`${form.lengthM} m × ${form.widthM} m = ${Number(form.lengthM)*Number(form.widthM)} m² (estimasi bidang persegi panjang)`:'Isi panjang dan lebar untuk menghitung estimasi luas.'}</span><small>Polygon dibuat otomatis dari titik tengah koordinat dan dimensi. Untuk batas bidang yang tidak beraturan, diperlukan koordinat titik sudut polygon yang sebenarnya.</small></div>}
   {form.category!=='Kendaraan'&&<label className="description-field polygon-coordinates-field">Koordinat batas polygon (opsional)<textarea rows={3} value={form.polygonCoordinates} onChange={e=>updateForm('polygonCoordinates',e.target.value)} placeholder={'-3.967500, 122.515800\n-3.967500, 122.516200\n-3.968000, 122.516200\n-3.968000, 122.515800'}/><small>Masukkan minimal 3 titik, satu titik per baris dengan format latitude, longitude. Jika dikosongkan, sistem membuat polygon persegi panjang dari titik tengah, panjang, dan lebar.</small></label>}
   <label className="description-field">Keterangan<textarea rows={2} value={form.description} onChange={e=>updateForm('description',e.target.value)} placeholder="Keterangan tambahan aset"/></label>
   {formError&&<div className="form-error">{formError}</div>}<div className="form-actions"><button type="button" className="cancel-form" onClick={()=>setFormOpen(false)}>Batal</button><button type="submit" className="save-form">Simpan aset & tampilkan di peta</button></div>
  </form></section></div>}
 </div>
}
function AssetRow({asset,active,onClick}:{asset:Asset;active:boolean;onClick:()=>void}){
 return <button className={'asset-row '+(active?'asset-active':'')} onClick={onClick}><div className="asset-row-main"><b>{asset.name}</b><span className="kib-mini">{kibFor(asset.category)}</span></div><div className="asset-meta"><span style={{color:colorFor(asset.condition)}}>● {asset.condition==='Baik'?'Aman & Bersertifikat':'Perlu Perhatian'}</span><span>▣ {asset.area}</span></div><div className="asset-row-foot"><small>{asset.code}</small><b>{formatRupiah(asset.value)}</b></div></button>
}
