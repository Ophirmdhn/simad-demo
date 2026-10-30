export type AssetCondition = 'Baik' | 'Rusak Ringan' | 'Rusak Berat'
export type Asset = {
  id: string
  code: string
  name: string
  category: string
  condition: AssetCondition
  address: string
  area: string
  lat: number
  lng: number
  year: number
  value: number
  description: string
  lengthM?: number
  widthM?: number
  landAreaM2?: number
  buildingAreaM2?: number
  polygon?: [number, number][]
}

export const assets: Asset[] = [
  {id:'A-001',code:'BRG-001',name:'Kantor Kecamatan Mandonga',category:'Bangunan',condition:'Baik',address:'Jl. Imam Bonjol, Mandonga',area:'Mandonga',lat:-3.9675,lng:122.5158,year:2018,value:2450000000,description:'Gedung kantor pelayanan administrasi kecamatan.',lengthM:42,widthM:28,landAreaM2:1176,buildingAreaM2:850},
  {id:'A-002',code:'TNH-002',name:'Tanah Lapangan Benu-Benua',category:'Tanah',condition:'Baik',address:'Benu-Benua, Kendari Barat',area:'Kendari Barat',lat:-3.9785,lng:122.5685,year:2012,value:1800000000,description:'Tanah milik pemerintah daerah yang dimanfaatkan sebagai ruang terbuka.',lengthM:50,widthM:32,landAreaM2:1600},
  {id:'A-003',code:'BRG-003',name:'Puskesmas Poasia',category:'Bangunan',condition:'Rusak Ringan',address:'Jl. Bunggasi, Poasia',area:'Poasia',lat:-4.0068,lng:122.5445,year:2016,value:3250000000,description:'Bangunan fasilitas pelayanan kesehatan masyarakat.',lengthM:38,widthM:25,landAreaM2:950,buildingAreaM2:620},
  {id:'A-004',code:'KDR-004',name:'Kendaraan Operasional Dinas',category:'Kendaraan',condition:'Baik',address:'Kompleks Perkantoran Wali Kota',area:'Mandonga',lat:-3.9738,lng:122.5132,year:2022,value:285000000,description:'Kendaraan operasional untuk mendukung kegiatan perangkat daerah.'},
  {id:'A-005',code:'FAS-005',name:'Gedung Olahraga KONI',category:'Fasilitas Umum',condition:'Rusak Berat',address:'Jl. Ahmad Yani, Kadia',area:'Kadia',lat:-3.9898,lng:122.5096,year:2010,value:4100000000,description:'Fasilitas olahraga milik pemerintah daerah.',lengthM:55,widthM:36,landAreaM2:1980,buildingAreaM2:1450},
  {id:'A-006',code:'TNH-006',name:'Lahan Ruang Terbuka Publik',category:'Tanah',condition:'Baik',address:'Area Anduonohu, Poasia',area:'Poasia',lat:-4.0352,lng:122.5555,year:2020,value:950000000,description:'Lahan cadangan untuk pengembangan fasilitas publik.',lengthM:45,widthM:30,landAreaM2:1350},
  {id:'A-007',code:'BRG-007',name:'Kantor Kelurahan Korumba',category:'Bangunan',condition:'Rusak Ringan',address:'Jl. Sao-Sao, Korumba',area:'Mandonga',lat:-3.9633,lng:122.5237,year:2014,value:875000000,description:'Gedung kantor pelayanan administrasi kelurahan.',lengthM:25,widthM:18,landAreaM2:450,buildingAreaM2:310}
]
export const formatRupiah = (value:number) => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(value)
