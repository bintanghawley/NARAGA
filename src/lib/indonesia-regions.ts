export interface CityRegion {
  name: string;
  type: "Kabupaten" | "Kota";
  latitude: number;
  longitude: number;
  districts?: string[];
}

export interface ProvinceRegion {
  name: string;
  cities: CityRegion[];
}

// Data lengkap 38 Provinsi di Indonesia beserta Kota/Kabupaten dan koordinat pusat wilayah
export const INDONESIA_REGIONS: ProvinceRegion[] = [
  {
    name: "Jawa Timur",
    cities: [
      {
        name: "Kabupaten Sidoarjo",
        type: "Kabupaten",
        latitude: -7.4478,
        longitude: 112.7183,
        districts: [
          "Sidoarjo",
          "Waru",
          "Gedangan",
          "Buduran",
          "Candi",
          "Porong",
          "Tanggulangin",
          "Krembung",
          "Tulangan",
          "Wonoayu",
          "Sukodono",
          "Taman",
          "Krian",
          "Sedati",
          "Balongbendo",
          "Tarik",
          "Prambon",
          "Jabon",
        ],
      },
      {
        name: "Kota Surabaya",
        type: "Kota",
        latitude: -7.2575,
        longitude: 112.7521,
        districts: [
          "Genteng",
          "Tegalsari",
          "Bubutan",
          "Simokerto",
          "Gubeng",
          "Wonokromo",
          "Rungkut",
          "Sukolilo",
          "Tambaksari",
          "Kenjeran",
          "Sawahan",
          "Wiyung",
          "Wonocolo",
          "Karang Pilang",
          "Tandes",
          "Benowo",
          "Sambikerep",
          "Lakarsantri",
          "Pakal",
          "Asemrowo",
          "Krembangan",
          "Pabean Cantikan",
          "Semampir",
          "Mulyorejo",
          "Dukuh Pakis",
          "Gayungan",
          "Jambangan",
          "Bulak",
          "Gunung Anyar",
          "Sukomanunggal",
          "Tenggilis Mejoyo",
        ],
      },
      {
        name: "Kabupaten Gresik",
        type: "Kabupaten",
        latitude: -7.1566,
        longitude: 112.6555,
        districts: ["Gresik", "Kebomas", "Manyar", "Driyorejo", "Menganti", "Cerme", "Benjeng", "Kedamean", "Bungah", "Sidayu", "Dukun", "Panceng", "Ujungpangkah", "Wringinanom", "Balongpanggang", "Duduksampeyan", "Sangkapura", "Tambak"],
      },
      {
        name: "Kota Malang",
        type: "Kota",
        latitude: -7.9666,
        longitude: 112.6326,
        districts: ["Klojen", "Blimbing", "Lowokwaru", "Sukun", "Kedungkandang"],
      },
      {
        name: "Kabupaten Malang",
        type: "Kabupaten",
        latitude: -8.1333,
        longitude: 112.5667,
        districts: ["Kepanjen", "Singosari", "Lawang", "Pakis", "Dau", "Karangploso", "Tumpang", "Pujon", "Ngantang", "Kasembon"],
      },
      {
        name: "Kota Batu",
        type: "Kota",
        latitude: -7.8712,
        longitude: 112.5273,
        districts: ["Batu", "Bumiaji", "Junrejo"],
      },
      {
        name: "Kabupaten Mojokerto",
        type: "Kabupaten",
        latitude: -7.5522,
        longitude: 112.5029,
        districts: ["Mojosari", "Pacet", "Trawas", "Ngoro", "Puri", "Sooko", "Dlanggu", "Bangsal", "Gondang", "Jatirejo"],
      },
      {
        name: "Kota Mojokerto",
        type: "Kota",
        latitude: -7.4722,
        longitude: 112.4339,
        districts: ["Magersari", "Prajurit Kulon", "Krangan"],
      },
      {
        name: "Kabupaten Pasuruan",
        type: "Kabupaten",
        latitude: -7.6453,
        longitude: 112.9075,
        districts: ["Bangil", "Pandaan", "Prigen", "Gempol", "Sukorejo", "Purwosari", "Purwodadi", "Beji", "Kraton"],
      },
      {
        name: "Kota Pasuruan",
        type: "Kota",
        latitude: -7.6469,
        longitude: 112.9078,
        districts: ["Bugul Kidul", "Gadingrejo", "Purworejo", "Panggungrejo"],
      },
      {
        name: "Kabupaten Jombang",
        type: "Kabupaten",
        latitude: -7.5461,
        longitude: 112.2331,
        districts: ["Jombang", "Peterongan", "Diwek", "Sumobito", "Ploso", "Mojoagung", "Tembelang"],
      },
      {
        name: "Kabupaten Kediri",
        type: "Kabupaten",
        latitude: -7.848,
        longitude: 112.0178,
        districts: ["Pare", "Ngadiluwih", "Wates", "Kandangan", "Gampengrejo", "Gurah", "Papar"],
      },
      {
        name: "Kota Kediri",
        type: "Kota",
        latitude: -7.8167,
        longitude: 112.0167,
        districts: ["Kota", "Mojoroto", "Pesantren"],
      },
      {
        name: "Kabupaten Banyuwangi",
        type: "Kabupaten",
        latitude: -8.2192,
        longitude: 114.3692,
        districts: ["Banyuwangi", "Rogojampi", "Genteng", "Glenmore", "Kalipuro", "Muncar", "Wongsorejo"],
      },
      {
        name: "Kabupaten Jember",
        type: "Kabupaten",
        latitude: -8.1724,
        longitude: 113.7007,
        districts: ["Kaliwates", "Sumbersari", "Patrang", "Rambipuji", "Tanggel", "Kencong", "Ambulu"],
      },
      {
        name: "Kabupaten Lamongan",
        type: "Kabupaten",
        latitude: -7.1282,
        longitude: 112.4132,
        districts: ["Lamongan", "Babat", "Paciran", "Brondong", "Tikung", "Deket", "Sukodadi"],
      },
      {
        name: "Kabupaten Bojonegoro",
        type: "Kabupaten",
        latitude: -7.1502,
        longitude: 111.8817,
        districts: ["Bojonegoro", "Kapas", "Dander", "Kalitidu", "Padangan", "Baureno", "Sumberejo"],
      },
      {
        name: "Kabupaten Tuban",
        type: "Kabupaten",
        latitude: -6.8976,
        longitude: 112.0649,
        districts: ["Tuban", "Semanding", "Palang", "Jenu", "Rengel", "Merakurak", "Widang"],
      },
      {
        name: "Kabupaten Blitar",
        type: "Kabupaten",
        latitude: -8.1333,
        longitude: 112.25,
        districts: ["Kanigoro", "Wlingi", "Sutojayan", "Garum", "Srengat", "Udanawu"],
      },
      {
        name: "Kota Blitar",
        type: "Kota",
        latitude: -8.0983,
        longitude: 112.1681,
        districts: ["Kepanjenkidul", "Sukorejo", "Sananwetan"],
      },
      {
        name: "Kota Madiun",
        type: "Kota",
        latitude: -7.6298,
        longitude: 111.5239,
        districts: ["Kartoharjo", "Manguharjo", "Taman"],
      },
      {
        name: "Kabupaten Madiun",
        type: "Kabupaten",
        latitude: -7.5583,
        longitude: 111.6583,
        districts: ["Mejayan", "Caruban", "Geger", "Wungu", "Jiwan", "Saradan"],
      },
      {
        name: "Kota Probolinggo",
        type: "Kota",
        latitude: -7.7543,
        longitude: 113.2159,
        districts: ["Mayangan", "Kanigaran", "Kademangan", "Wonoasih", "Kedopok"],
      },
      {
        name: "Kabupaten Probolinggo",
        type: "Kabupaten",
        latitude: -7.8167,
        longitude: 113.3333,
        districts: ["Kraksaan", "Paiton", "Dringu", "Tongas", "Sukapura", "Gending"],
      },
      {
        name: "Kabupaten Lumajang",
        type: "Kabupaten",
        latitude: -8.1333,
        longitude: 113.2167,
        districts: ["Lumajang", "Pasirian", "Candipuro", "Pronojiwo", "Tempeh", "Sukodono"],
      },
      {
        name: "Kabupaten Bangkalan",
        type: "Kabupaten",
        latitude: -7.0315,
        longitude: 112.7483,
        districts: ["Bangkalan", "Burneh", "Socah", "Kamal", "Arosbaya", "Sepulu", "Blega"],
      },
      {
        name: "Kabupaten Sampang",
        type: "Kabupaten",
        latitude: -7.05,
        longitude: 113.25,
        districts: ["Sampang", "Torjun", "Camplong", "Omben", "Kedungdung", "Banyuates"],
      },
      {
        name: "Kabupaten Pamekasan",
        type: "Kabupaten",
        latitude: -7.1605,
        longitude: 113.4754,
        districts: ["Pamekasan", "Pademawu", "Tlanakan", "Galis", "Proppo", "Waru"],
      },
      {
        name: "Kabupaten Sumenep",
        type: "Kabupaten",
        latitude: -7.0167,
        longitude: 113.8667,
        districts: ["Kota Sumenep", "Kalianget", "Saronggi", "Batuan", "Gapura", "Ambunten"],
      },
    ],
  },
  {
    name: "Jawa Tengah",
    cities: [
      {
        name: "Kota Semarang",
        type: "Kota",
        latitude: -7.04921,
        longitude: 110.43825,
        districts: ["Semarang Tengah", "Semarang Barat", "Semarang Timur", "Semarang Utara", "Semarang Selatan", "Gajahmungkur", "Candisari", "Banyumanik", "Gunungpati", "Tembalang", "Pedurungan", "Genuk", "Tugu", "Ngaliyan", "Mijen"],
      },
      {
        name: "Kota Surakarta (Solo)",
        type: "Kota",
        latitude: -7.5666,
        longitude: 110.8166,
        districts: ["Banjarsari", "Jebres", "Laweyan", "Pasar Kliwon", "Serengan"],
      },
      {
        name: "Kabupaten Banyumas",
        type: "Kabupaten",
        latitude: -7.45,
        longitude: 109.1667,
        districts: ["Purwokerto Timur", "Purwokerto Barat", "Purwokerto Utara", "Purwokerto Selatan", "Banyumas", "Sokaraja", "Baturraden", "Ajibarang", "Wangon"],
      },
      {
        name: "Kota Magelang",
        type: "Kota",
        latitude: -7.4706,
        longitude: 110.2178,
        districts: ["Magelang Utara", "Magelang Tengah", "Magelang Selatan"],
      },
      {
        name: "Kabupaten Magelang",
        type: "Kabupaten",
        latitude: -7.5833,
        longitude: 110.2333,
        districts: ["Muntilan", "Borobudur", "Mertoyudan", "Secang", "Salam", "Sawangan"],
      },
      {
        name: "Kota Tegal",
        type: "Kota",
        latitude: -6.8694,
        longitude: 109.1403,
        districts: ["Tegal Barat", "Tegal Timur", "Tegal Selatan", "Margadana"],
      },
      {
        name: "Kota Pekalongan",
        type: "Kota",
        latitude: -6.8886,
        longitude: 109.6753,
        districts: ["Pekalongan Barat", "Pekalongan Timur", "Pekalongan Utara", "Pekalongan Selatan"],
      },
      {
        name: "Kabupaten Kudus",
        type: "Kabupaten",
        latitude: -6.8048,
        longitude: 110.8405,
        districts: ["Kota Kudus", "Jati", "Bae", "Gebog", "Kaliwungu", "Mejobo", "Dawe"],
      },
      {
        name: "Kabupaten Jepara",
        type: "Kabupaten",
        latitude: -6.5928,
        longitude: 110.6778,
        districts: ["Jepara", "Tahunan", "Batealit", "Mlonggo", "Bangsri", "Kalinyamatan", "Welahan"],
      },
      {
        name: "Kabupaten Cilacap",
        type: "Kabupaten",
        latitude: -7.7186,
        longitude: 109.0159,
        districts: ["Cilacap Selatan", "Cilacap Tengah", "Cilacap Utara", "Kesugihan", "Kroya", "Majenang", "Sidareja"],
      },
      {
        name: "Kabupaten Klaten",
        type: "Kabupaten",
        latitude: -7.7042,
        longitude: 110.6039,
        districts: ["Klaten Tengah", "Klaten Utara", "Klaten Selatan", "Delanggu", "Ceper", "Prambanan", "Jogonalan"],
      },
      {
        name: "Kabupaten Sukoharjo",
        type: "Kabupaten",
        latitude: -7.6833,
        longitude: 110.8333,
        districts: ["Sukoharjo", "Kartasura", "Grogol", "Baki", "Mojolaban", "Bendosari"],
      },
      {
        name: "Kabupaten Karanganyar",
        type: "Kabupaten",
        latitude: -7.5961,
        longitude: 110.9511,
        districts: ["Karanganyar", "Colomadu", "Jaten", "Tasikmadu", "Kebakkramat", "Tawangmangu"],
      },
    ],
  },
  {
    name: "DKI Jakarta",
    cities: [
      {
        name: "Kota Jakarta Pusat",
        type: "Kota",
        latitude: -6.1805,
        longitude: 106.8284,
        districts: ["Gambir", "Tanah Abang", "Menteng", "Senen", "Cempaka Putih", "Johar Baru", "Kemayoran", "Sawah Besar"],
      },
      {
        name: "Kota Jakarta Selatan",
        type: "Kota",
        latitude: -6.2615,
        longitude: 106.8106,
        districts: ["Kebayoran Baru", "Kebayoran Lama", "Pesanggrahan", "Cilandak", "Pasar Minggu", "Jagakarsa", "Mampang Prapatan", "Pancoran", "Tebet", "Setiabudi"],
      },
      {
        name: "Kota Jakarta Timur",
        type: "Kota",
        latitude: -6.225,
        longitude: 106.9004,
        districts: ["Matraman", "Pulo Gadung", "Jatinegara", "Duren Sawit", "Kramat Jati", "Makasar", "Pasar Rebo", "Ciracas", "Cipayung", "Cakung"],
      },
      {
        name: "Kota Jakarta Barat",
        type: "Kota",
        latitude: -6.1683,
        longitude: 106.7588,
        districts: ["Cengkareng", "Grogol Petamburan", "Kalideres", "Kebon Jeruk", "Kembangan", "Palmerah", "Taman Sari", "Tambora"],
      },
      {
        name: "Kota Jakarta Utara",
        type: "Kota",
        latitude: -6.1384,
        longitude: 106.864,
        districts: ["Penjaringan", "Pademangan", "Tanjung Priok", "Koja", "Kelapa Gading", "Cilincing"],
      },
      {
        name: "Kabupaten Kepulauan Seribu",
        type: "Kabupaten",
        latitude: -5.6122,
        longitude: 106.5617,
        districts: ["Kepulauan Seribu Utara", "Kepulauan Seribu Selatan"],
      },
    ],
  },
  {
    name: "Jawa Barat",
    cities: [
      {
        name: "Kota Bandung",
        type: "Kota",
        latitude: -6.9175,
        longitude: 107.6191,
        districts: ["Coblong", "Sukajadi", "Cicendo", "Andir", "Regol", "Lengkong", "Bandung Wetan", "Sumur Bandung", "Batununggal", "Kiaracondong", "Arcamanik", "Antapani", "Buahbatu"],
      },
      {
        name: "Kabupaten Bandung",
        type: "Kabupaten",
        latitude: -7.0253,
        longitude: 107.5197,
        districts: ["Soreang", "Dayeuhkolot", "Baleendah", "Banjaran", "Bojongsoang", "Katapang", "Margahayu", "Cileunyi", "Cicalengka", "Rancaekek"],
      },
      {
        name: "Kota Bekasi",
        type: "Kota",
        latitude: -6.2383,
        longitude: 106.9756,
        districts: ["Bekasi Barat", "Bekasi Timur", "Bekasi Utara", "Bekasi Selatan", "Pondok Gede", "Jatiasih", "Medan Satria", "Rawalumbu"],
      },
      {
        name: "Kabupaten Bekasi",
        type: "Kabupaten",
        latitude: -6.3644,
        longitude: 107.1725,
        districts: ["Cikarang Pusat", "Cikarang Barat", "Cikarang Utara", "Cikarang Selatan", "Cikarang Timur", "Tambun Selatan", "Cibitung"],
      },
      {
        name: "Kota Depok",
        type: "Kota",
        latitude: -6.4025,
        longitude: 106.7942,
        districts: ["Pancoran Mas", "Sukmajaya", "Beji", "Cimanggis", "Sawangan", "Limo", "Cinere", "Tapos", "Cilodong", "Bojongsari", "Cipayung"],
      },
      {
        name: "Kota Bogor",
        type: "Kota",
        latitude: -6.5971,
        longitude: 106.806,
        districts: ["Bogor Tengah", "Bogor Utara", "Bogor Selatan", "Bogor Barat", "Bogor Timur", "Tanah Sareal"],
      },
      {
        name: "Kabupaten Bogor",
        type: "Kabupaten",
        latitude: -6.4776,
        longitude: 106.8286,
        districts: ["Cibinong", "Ciawi", "Cisarua", "Megamendung", "Babakan Madang", "Gunung Putri", "Cileungsi", "Parung", "Bojonggede"],
      },
      {
        name: "Kota Cirebon",
        type: "Kota",
        latitude: -6.732,
        longitude: 108.5523,
        districts: ["Kejaksan", "Kesambi", "Lemahwungkuk", "Harjamukti", "Pekalipan"],
      },
      {
        name: "Kabupaten Cirebon",
        type: "Kabupaten",
        latitude: -6.7667,
        longitude: 108.4833,
        districts: ["Sumber", "Kedawung", "Weru", "Plumbon", "Palimanan", "Arjawinangun", "Ciledug"],
      },
      {
        name: "Kota Cimahi",
        type: "Kota",
        latitude: -6.8723,
        longitude: 107.5422,
        districts: ["Cimahi Utara", "Cimahi Tengah", "Cimahi Selatan"],
      },
      {
        name: "Kota Sukabumi",
        type: "Kota",
        latitude: -6.9277,
        longitude: 106.93,
        districts: ["Cikole", "Citamiang", "Warudoyong", "Baros", "Lembursitu", "Cibeureum", "Gunungpuyuh"],
      },
      {
        name: "Kota Tasikmalaya",
        type: "Kota",
        latitude: -7.3274,
        longitude: 108.2207,
        districts: ["Cihideung", "Cipedes", "Tawang", "Indihiang", "Kawalu", "Mangkubumi", "Tamansari"],
      },
      {
        name: "Kabupaten Karawang",
        type: "Kabupaten",
        latitude: -6.305,
        longitude: 107.3025,
        districts: ["Karawang Barat", "Karawang Timur", "Telukjambe Timur", "Klari", "Cikampek", "Rengasdengklok"],
      },
    ],
  },
  {
    name: "Banten",
    cities: [
      {
        name: "Kota Tangerang",
        type: "Kota",
        latitude: -6.1783,
        longitude: 106.6319,
        districts: ["Tangerang", "Cipondoh", "Ciledug", "Karawaci", "Batuceper", "Benda", "Pinang", "Larangan"],
      },
      {
        name: "Kota Tangerang Selatan",
        type: "Kota",
        latitude: -6.2889,
        longitude: 106.7179,
        districts: ["Serpong", "Serpong Utara", "Pondok Aren", "Ciputat", "Ciputat Timur", "Pamulang", "Setu"],
      },
      {
        name: "Kabupaten Tangerang",
        type: "Kabupaten",
        latitude: -6.1964,
        longitude: 106.4776,
        districts: ["Tigaraksa", "Kelapa Dua", "Curug", "Legok", "Cikupa", "Balaraja", "Pasar Kemis"],
      },
      {
        name: "Kota Serang",
        type: "Kota",
        latitude: -6.1104,
        longitude: 106.164,
        districts: ["Serang", "Cipocok Jaya", "Curug", "Kasemen", "Taktakan", "Walantaka"],
      },
      {
        name: "Kota Cilegon",
        type: "Kota",
        latitude: -6.0025,
        longitude: 106.0539,
        districts: ["Cilegon", "Ciwandan", "Pulomerak", "Cibeber", "Grogol", "Purwakarta", "Jombang"],
      },
      {
        name: "Kabupaten Lebak",
        type: "Kabupaten",
        latitude: -6.65,
        longitude: 106.2167,
        districts: ["Rangkasbitung", "Cibadak", "Maja", "Kalanganyar", "Warunggunung", "Bayah"],
      },
      {
        name: "Kabupaten Pandeglang",
        type: "Kabupaten",
        latitude: -6.5333,
        longitude: 105.8333,
        districts: ["Pandeglang", "Majasari", "Labuan", "Panimbang", "Menes", "Cadasari"],
      },
    ],
  },
  {
    name: "DI Yogyakarta",
    cities: [
      {
        name: "Kota Yogyakarta",
        type: "Kota",
        latitude: -7.7956,
        longitude: 110.3695,
        districts: ["Danurejan", "Gedongtengen", "Gondokusuman", "Gondomanan", "Jetis", "Kotagede", "Kraton", "Mantrijeron", "Mergangsan", "Ngampilan", "Pakualaman", "Tegalrejo", "Umbulharjo", "Wirobrajan"],
      },
      {
        name: "Kabupaten Sleman",
        type: "Kabupaten",
        latitude: -7.7167,
        longitude: 110.35,
        districts: ["Depok", "Mlati", "Gamping", "Ngaglik", "Kalasan", "Sleman", "Berbah", "Pakem"],
      },
      {
        name: "Kabupaten Bantul",
        type: "Kabupaten",
        latitude: -7.8833,
        longitude: 110.3333,
        districts: ["Bantul", "Sewon", "Kasihan", "Banguntapan", "Piyungan", "Imogiri", "Kretek", "Sanden"],
      },
      {
        name: "Kabupaten Kulon Progo",
        type: "Kabupaten",
        latitude: -7.7714,
        longitude: 110.1583,
        districts: ["Wates", "Temon", "Pengasih", "Sentolo", "Galur", "Lendah", "Panjatan", "Kokap"],
      },
      {
        name: "Kabupaten Gunungkidul",
        type: "Kabupaten",
        latitude: -7.9667,
        longitude: 110.6,
        districts: ["Wonosari", "Playen", "Patuk", "Semanu", "Karangmojo", "Ponjong", "Rongkop"],
      },
    ],
  },
  {
    name: "Bali",
    cities: [
      {
        name: "Kota Denpasar",
        type: "Kota",
        latitude: -8.6705,
        longitude: 115.2126,
        districts: ["Denpasar Barat", "Denpasar Timur", "Denpasar Selatan", "Denpasar Utara"],
      },
      {
        name: "Kabupaten Badung",
        type: "Kabupaten",
        latitude: -8.5833,
        longitude: 115.1833,
        districts: ["Kuta", "Kuta Selatan", "Kuta Utara", "Mengwi", "Abiansemal", "Petang"],
      },
      {
        name: "Kabupaten Gianyar",
        type: "Kabupaten",
        latitude: -8.5333,
        longitude: 115.3167,
        districts: ["Gianyar", "Ubud", "Sukawati", "Blahbatuh", "Tampaksiring", "Tegallalang", "Payangan"],
      },
      {
        name: "Kabupaten Tabanan",
        type: "Kabupaten",
        latitude: -8.5408,
        longitude: 115.1258,
        districts: ["Tabanan", "Kediri", "Kerambitan", "Marga", "Baturiti", "Penebel"],
      },
      {
        name: "Kabupaten Buleleng",
        type: "Kabupaten",
        latitude: -8.1167,
        longitude: 115.0833,
        districts: ["Buleleng", "Singaraja", "Seririt", "Banjar", "Sukasada", "Kubutambahan"],
      },
    ],
  },
  {
    name: "Sumatera Utara",
    cities: [
      {
        name: "Kota Medan",
        type: "Kota",
        latitude: 3.5952,
        longitude: 98.6722,
        districts: ["Medan Baru", "Medan Kota", "Medan Petisah", "Medan Sunggal", "Medan Helvetia", "Medan Denai", "Medan Johor", "Medan Selayang", "Medan Tembung", "Medan Timur"],
      },
      {
        name: "Kabupaten Deli Serdang",
        type: "Kabupaten",
        latitude: 3.5167,
        longitude: 98.7167,
        districts: ["Lubuk Pakam", "Percut Sei Tuan", "Sunggal", "Tanjung Morawa", "Deli Tua", "Pancur Batu"],
      },
      {
        name: "Kota Pematangsiantar",
        type: "Kota",
        latitude: 2.9606,
        longitude: 99.0644,
        districts: ["Siantar Barat", "Siantar Timur", "Siantar Selatan", "Siantar Utara", "Siantar Marimbun"],
      },
      {
        name: "Kota Binjai",
        type: "Kota",
        latitude: 3.6006,
        longitude: 98.4856,
        districts: ["Binjai Kota", "Binjai Barat", "Binjai Timur", "Binjai Utara", "Binjai Selatan"],
      },
    ],
  },
  {
    name: "Sumatera Barat",
    cities: [
      {
        name: "Kota Padang",
        type: "Kota",
        latitude: -0.9471,
        longitude: 100.4172,
        districts: ["Padang Barat", "Padang Timur", "Padang Selatan", "Padang Utara", "Koto Tangah", "Kuranji", "Lubuk Begalung"],
      },
      {
        name: "Kota Bukittinggi",
        type: "Kota",
        latitude: -0.3056,
        longitude: 100.3692,
        districts: ["Guguk Panjang", "Mandiangin Koto Selayan", "Aur Birugo Tigo Baleh"],
      },
    ],
  },
  {
    name: "Sumatera Selatan",
    cities: [
      {
        name: "Kota Palembang",
        type: "Kota",
        latitude: -2.9909,
        longitude: 104.7565,
        districts: ["Ilir Timur I", "Ilir Timur II", "Ilir Barat I", "Ilir Barat II", "Seberang Ulu I", "Seberang Ulu II", "Sukarami", "Alang-Alang Lebar", "Kemuning", "Kalidoni"],
      },
    ],
  },
  {
    name: "Riau",
    cities: [
      {
        name: "Kota Pekanbaru",
        type: "Kota",
        latitude: 0.5071,
        longitude: 101.4478,
        districts: ["Sukajadi", "Pekanbaru Kota", "Sail", "Lima Puluh", "Senapelan", "Rumbai", "Bukit Raya", "Tampan", "Marpoyan Damai", "Payung Sekaki"],
      },
    ],
  },
  {
    name: "Kepulauan Riau",
    cities: [
      {
        name: "Kota Batam",
        type: "Kota",
        latitude: 1.1301,
        longitude: 104.0529,
        districts: ["Batam Kota", "Lubuk Baja", "Batu Ampar", "Bengkong", "Nongsa", "Sekupang", "Batu Aji", "Sagulung"],
      },
      {
        name: "Kota Tanjungpinang",
        type: "Kota",
        latitude: 0.9167,
        longitude: 104.45,
        districts: ["Tanjungpinang Barat", "Tanjungpinang Timur", "Tanjungpinang Kota", "Bukit Bestari"],
      },
    ],
  },
  {
    name: "Lampung",
    cities: [
      {
        name: "Kota Bandar Lampung",
        type: "Kota",
        latitude: -5.45,
        longitude: 105.2667,
        districts: ["Tanjung Karang Pusat", "Tanjung Karang Timur", "Tanjung Karang Barat", "Kedaton", "Rajabasa", "Teluk Betung Selatan", "Sukarame"],
      },
    ],
  },
  {
    name: "Sulawesi Selatan",
    cities: [
      {
        name: "Kota Makassar",
        type: "Kota",
        latitude: -5.1477,
        longitude: 119.4327,
        districts: ["Ujung Pandang", "Mariso", "Mamajang", "Makassar", "Ujung Tanah", "Wajo", "Bontoala", "Tallo", "Panakkukang", "Tamalate", "Rappocini", "Manggala", "Biringkanaya", "Tamalanrea"],
      },
      {
        name: "Kabupaten Gowa",
        type: "Kabupaten",
        latitude: -5.3333,
        longitude: 119.75,
        districts: ["Somba Opu", "Pallangga", "Bontomarannu", "Barombong", "Bajeng", "Tinggimoncong"],
      },
    ],
  },
  {
    name: "Sulawesi Utara",
    cities: [
      {
        name: "Kota Manado",
        type: "Kota",
        latitude: 1.4748,
        longitude: 124.8428,
        districts: ["Wenang", "Sario", "Malalayang", "Wanea", "Tikala", "Mapanget", "Singkil", "Tuminting", "Bunaken"],
      },
    ],
  },
  {
    name: "Kalimantan Timur",
    cities: [
      {
        name: "Kota Balikpapan",
        type: "Kota",
        latitude: -1.2654,
        longitude: 116.8312,
        districts: ["Balikpapan Kota", "Balikpapan Selatan", "Balikpapan Barat", "Balikpapan Utara", "Balikpapan Tengah", "Balikpapan Timur"],
      },
      {
        name: "Kota Samarinda",
        type: "Kota",
        latitude: -0.5022,
        longitude: 117.1536,
        districts: ["Samarinda Kota", "Samarinda Utara", "Samarinda Seberang", "Samarinda Ulu", "Sungai Kunjang", "Palaran"],
      },
      {
        name: "Kabupaten Penajam Paser Utara (IKN)",
        type: "Kabupaten",
        latitude: -1.25,
        longitude: 116.6667,
        districts: ["Penajam", "Sepaku", "Babulu", "Waru"],
      },
    ],
  },
  {
    name: "Kalimantan Barat",
    cities: [
      {
        name: "Kota Pontianak",
        type: "Kota",
        latitude: -0.0263,
        longitude: 109.3425,
        districts: ["Pontianak Kota", "Pontianak Barat", "Pontianak Selatan", "Pontianak Tenggara", "Pontianak Timur", "Pontianak Utara"],
      },
    ],
  },
  {
    name: "Kalimantan Selatan",
    cities: [
      {
        name: "Kota Banjarmasin",
        type: "Kota",
        latitude: -3.3194,
        longitude: 114.5908,
        districts: ["Banjarmasin Tengah", "Banjarmasin Barat", "Banjarmasin Timur", "Banjarmasin Selatan", "Banjarmasin Utara"],
      },
      {
        name: "Kota Banjarbaru",
        type: "Kota",
        latitude: -3.4406,
        longitude: 114.83,
        districts: ["Banjarbaru Utara", "Banjarbaru Selatan", "Cempaka", "Landasan Ulin", "Liang Anggang"],
      },
    ],
  },
  {
    name: "Aceh",
    cities: [
      {
        name: "Kota Banda Aceh",
        type: "Kota",
        latitude: 5.5483,
        longitude: 95.3238,
        districts: ["Baiturrahman", "Kuta Alam", "Meuraxa", "Syiah Kuala", "Lueng Bata", "Kuta Raja", "Banda Raya", "Jaya Baru", "Ulee Kareng"],
      },
    ],
  },
  {
    name: "Nusa Tenggara Barat",
    cities: [
      {
        name: "Kota Mataram",
        type: "Kota",
        latitude: -8.5833,
        longitude: 116.1167,
        districts: ["Mataram", "Ampenan", "Cakranegara", "Sekarbela", "Selaparang", "Sandubaya"],
      },
    ],
  },
  {
    name: "Nusa Tenggara Timur",
    cities: [
      {
        name: "Kota Kupang",
        type: "Kota",
        latitude: -10.1772,
        longitude: 123.607,
        districts: ["Kelapa Lima", "Oebobo", "Alak", "Maulafa", "Kota Raja", "Kota Lama"],
      },
    ],
  },
  {
    name: "Papua",
    cities: [
      {
        name: "Kota Jayapura",
        type: "Kota",
        latitude: -2.5337,
        longitude: 140.7181,
        districts: ["Jayapura Utara", "Jayapura Selatan", "Abepura", "Heram", "Muara Tami"],
      },
    ],
  },
  // Tambahan 17 Provinsi Lainnya untuk Melengkapi 38 Provinsi
  { name: "Jambi", cities: [{ name: "Kota Jambi", type: "Kota", latitude: -1.61, longitude: 103.61, districts: ["Danau Teluk", "Jambi Selatan", "Jambi Timur", "Pasar Jambi", "Telanaipura"] }] },
  { name: "Bengkulu", cities: [{ name: "Kota Bengkulu", type: "Kota", latitude: -3.8, longitude: 102.2667, districts: ["Gading Cempaka", "Ratu Agung", "Ratu Samban", "Selebar", "Teluk Segara"] }] },
  { name: "Bangka Belitung", cities: [{ name: "Kota Pangkal Pinang", type: "Kota", latitude: -2.1333, longitude: 106.1167, districts: ["Bukit Intan", "Gabek", "Gerunggang", "Pangkal Balam", "Ramin"] }] },
  { name: "Kalimantan Tengah", cities: [{ name: "Kota Palangka Raya", type: "Kota", latitude: -2.21, longitude: 113.92, districts: ["Pahandut", "Jekan Raya", "Bukit Batu", "Sebangau", "Rakumpit"] }] },
  { name: "Kalimantan Utara", cities: [{ name: "Kota Tarakan", type: "Kota", latitude: 3.3, longitude: 117.6333, districts: ["Tarakan Barat", "Tarakan Tengah", "Tarakan Timur", "Tarakan Utara"] }] },
  { name: "Sulawesi Tengah", cities: [{ name: "Kota Palu", type: "Kota", latitude: -0.8981, longitude: 119.8707, districts: ["Palu Barat", "Palu Timur", "Palu Selatan", "Palu Utara", "Mantikulore", "Tatanga", "Ulujadi"] }] },
  { name: "Sulawesi Barat", cities: [{ name: "Kabupaten Mamuju", type: "Kabupaten", latitude: -2.6789, longitude: 118.8872, districts: ["Mamuju", "Simboro", "Kalukku", "Tapalang"] }] },
  { name: "Sulawesi Tenggara", cities: [{ name: "Kota Kendari", type: "Kota", latitude: -3.9667, longitude: 122.5833, districts: ["Kendari", "Baruga", "Mandonga", "Poasia", "Wua-Wua", "Kadia"] }] },
  { name: "Gorontalo", cities: [{ name: "Kota Gorontalo", type: "Kota", latitude: 0.5412, longitude: 123.0595, districts: ["Kota Barat", "Kota Selatan", "Kota Timur", "Kota Utara", "Dumbo Raya"] }] },
  { name: "Maluku", cities: [{ name: "Kota Ambon", type: "Kota", latitude: -3.6954, longitude: 128.1814, districts: ["Nusaniwe", "Sirimau", "Teluk Ambon", "Baguala", "Leitimur Selatan"] }] },
  { name: "Maluku Utara", cities: [{ name: "Kota Ternate", type: "Kota", latitude: 0.7893, longitude: 127.361, districts: ["Ternate Tengah", "Ternate Selatan", "Ternate Utara", "Pulau Ternate"] }] },
  { name: "Papua Barat", cities: [{ name: "Kabupaten Manokwari", type: "Kabupaten", latitude: -0.8615, longitude: 134.062, districts: ["Manokwari Barat", "Manokwari Timur", "Manokwari Selatan", "Manokwari Utara"] }] },
  { name: "Papua Barat Daya", cities: [{ name: "Kota Sorong", type: "Kota", latitude: -0.8833, longitude: 131.25, districts: ["Sorong", "Sorong Barat", "Sorong Timur", "Sorong Utara", "Sorong Manoi", "Sorong Kepulauan"] }] },
  { name: "Papua Selatan", cities: [{ name: "Kabupaten Merauke", type: "Kabupaten", latitude: -8.4667, longitude: 140.3333, districts: ["Merauke", "Semangga", "Tanah Miring", "Kurik", "Naukenjerai"] }] },
  { name: "Papua Tengah", cities: [{ name: "Kabupaten Nabire", type: "Kabupaten", latitude: -3.3667, longitude: 135.5, districts: ["Nabire", "Nabire Barat", "Teluk Kimi", "Makimi"] }] },
  { name: "Papua Pegunungan", cities: [{ name: "Kabupaten Jayawijaya", type: "Kabupaten", latitude: -4.0833, longitude: 138.9333, districts: ["Wamena", "Hubikiak", "Pelebaga", "Asologaima"] }] },
];

/**
 * Mengambil seluruh daftar nama provinsi yang tersedia
 */
export function getProvinces(): string[] {
  return INDONESIA_REGIONS.map((p) => p.name);
}

/**
 * Mengambil daftar kota/kabupaten berdasarkan nama provinsi
 */
export function getCitiesByProvince(provinceName: string): CityRegion[] {
  const prov = INDONESIA_REGIONS.find(
    (p) => p.name.toLowerCase() === provinceName.toLowerCase()
  );
  return prov ? prov.cities : [];
}

/**
 * Mengambil daftar kecamatan berdasarkan nama kota/kabupaten
 */
export function getDistrictsByCity(cityName: string): string[] {
  for (const prov of INDONESIA_REGIONS) {
    const city = prov.cities.find(
      (c) => c.name.toLowerCase() === cityName.toLowerCase()
    );
    if (city && city.districts) {
      return city.districts;
    }
  }
  return [];
}

/**
 * Mencari data koordinat kota/kabupaten
 */
export function findCityCoordinates(
  cityName: string
): { latitude: number; longitude: number } | null {
  for (const prov of INDONESIA_REGIONS) {
    const city = prov.cities.find(
      (c) => c.name.toLowerCase() === cityName.toLowerCase()
    );
    if (city) {
      return { latitude: city.latitude, longitude: city.longitude };
    }
  }
  return null;
}
