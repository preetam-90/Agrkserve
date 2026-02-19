// Comprehensive India location data for SEO geo targeting
// AgriServe - Agricultural equipment & labour booking platform

interface CityData {
  slug: string;
  name: string;
  nameHi: string;
  lat: number;
  lng: number;
}

interface StateData {
  slug: string;
  name: string;
  nameHi: string;
  capital: string;
  region: 'north' | 'west' | 'south' | 'east' | 'central' | 'northeast' | 'ut';
  coordinates: { lat: number; lng: number };
  majorCities: CityData[];
}

export const INDIA_STATES: StateData[] = [
  // ═══════════════════════════════════════════
  // NORTHERN INDIA (PRIMARY TARGET)
  // ═══════════════════════════════════════════
  {
    slug: 'punjab',
    name: 'Punjab',
    nameHi: 'पंजाब',
    capital: 'Chandigarh',
    region: 'north',
    coordinates: { lat: 31.1471, lng: 75.3412 },
    majorCities: [
      { slug: 'ludhiana', name: 'Ludhiana', nameHi: 'लुधियाना', lat: 30.901, lng: 75.8573 },
      { slug: 'amritsar', name: 'Amritsar', nameHi: 'अमृतसर', lat: 31.634, lng: 74.8723 },
      { slug: 'jalandhar', name: 'Jalandhar', nameHi: 'जालंधर', lat: 31.326, lng: 75.5762 },
      { slug: 'patiala', name: 'Patiala', nameHi: 'पटियाला', lat: 30.3398, lng: 76.3869 },
      { slug: 'bathinda', name: 'Bathinda', nameHi: 'बठिंडा', lat: 30.211, lng: 74.9455 },
      { slug: 'mohali', name: 'Mohali', nameHi: 'मोहाली', lat: 30.7046, lng: 76.7179 },
      { slug: 'pathankot', name: 'Pathankot', nameHi: 'पठानकोट', lat: 32.2643, lng: 75.6421 },
      { slug: 'moga', name: 'Moga', nameHi: 'मोगा', lat: 30.8162, lng: 75.1741 },
      { slug: 'barnala', name: 'Barnala', nameHi: 'बरनाला', lat: 30.3819, lng: 75.5472 },
      { slug: 'sangrur', name: 'Sangrur', nameHi: 'संगरूर', lat: 30.2427, lng: 75.8442 },
      { slug: 'muktsar', name: 'Muktsar', nameHi: 'मुक्तसर', lat: 30.4768, lng: 74.516 },
      { slug: 'fazilka', name: 'Fazilka', nameHi: 'फाजिल्का', lat: 30.4036, lng: 74.0289 },
      { slug: 'hoshiarpur', name: 'Hoshiarpur', nameHi: 'होशियारपुर', lat: 31.5143, lng: 75.9115 },
      { slug: 'kapurthala', name: 'Kapurthala', nameHi: 'कपूरथला', lat: 31.38, lng: 75.38 },
      { slug: 'ferozepur', name: 'Ferozepur', nameHi: 'फिरोजपुर', lat: 30.9331, lng: 74.6225 },
    ],
  },
  {
    slug: 'haryana',
    name: 'Haryana',
    nameHi: 'हरियाणा',
    capital: 'Chandigarh',
    region: 'north',
    coordinates: { lat: 29.0588, lng: 76.0856 },
    majorCities: [
      { slug: 'karnal', name: 'Karnal', nameHi: 'करनाल', lat: 29.6857, lng: 76.9905 },
      { slug: 'hisar', name: 'Hisar', nameHi: 'हिसार', lat: 29.1492, lng: 75.7217 },
      { slug: 'panipat', name: 'Panipat', nameHi: 'पानीपत', lat: 29.3909, lng: 76.9635 },
      { slug: 'ambala', name: 'Ambala', nameHi: 'अंबाला', lat: 30.3782, lng: 76.7767 },
      { slug: 'rohtak', name: 'Rohtak', nameHi: 'रोहतक', lat: 28.8955, lng: 76.5796 },
      { slug: 'sonipat', name: 'Sonipat', nameHi: 'सोनीपत', lat: 28.9931, lng: 77.0151 },
      { slug: 'gurugram', name: 'Gurugram', nameHi: 'गुरुग्राम', lat: 28.4595, lng: 77.0266 },
      { slug: 'faridabad', name: 'Faridabad', nameHi: 'फरीदाबाद', lat: 28.4089, lng: 77.3178 },
      { slug: 'sirsa', name: 'Sirsa', nameHi: 'सिरसा', lat: 29.5344, lng: 75.0268 },
      { slug: 'jind', name: 'Jind', nameHi: 'जींद', lat: 29.3165, lng: 76.3152 },
      { slug: 'kaithal', name: 'Kaithal', nameHi: 'कैथल', lat: 29.8015, lng: 76.3998 },
      {
        slug: 'kurukshetra',
        name: 'Kurukshetra',
        nameHi: 'कुरुक्षेत्र',
        lat: 29.9695,
        lng: 76.8783,
      },
      { slug: 'bhiwani', name: 'Bhiwani', nameHi: 'भिवानी', lat: 28.793, lng: 76.1319 },
      { slug: 'rewari', name: 'Rewari', nameHi: 'रेवाड़ी', lat: 28.197, lng: 76.6194 },
      { slug: 'fatehabad', name: 'Fatehabad', nameHi: 'फतेहाबाद', lat: 29.5152, lng: 75.4544 },
    ],
  },
  {
    slug: 'uttar-pradesh',
    name: 'Uttar Pradesh',
    nameHi: 'उत्तर प्रदेश',
    capital: 'Lucknow',
    region: 'north',
    coordinates: { lat: 26.8467, lng: 80.9462 },
    majorCities: [
      { slug: 'lucknow', name: 'Lucknow', nameHi: 'लखनऊ', lat: 26.8467, lng: 80.9462 },
      { slug: 'agra', name: 'Agra', nameHi: 'आगरा', lat: 27.1767, lng: 78.0081 },
      { slug: 'varanasi', name: 'Varanasi', nameHi: 'वाराणसी', lat: 25.3176, lng: 82.9739 },
      { slug: 'kanpur', name: 'Kanpur', nameHi: 'कानपुर', lat: 26.4499, lng: 80.3319 },
      { slug: 'prayagraj', name: 'Prayagraj', nameHi: 'प्रयागराज', lat: 25.4358, lng: 81.8463 },
      { slug: 'meerut', name: 'Meerut', nameHi: 'मेरठ', lat: 28.9845, lng: 77.7064 },
      { slug: 'aligarh', name: 'Aligarh', nameHi: 'अलीगढ़', lat: 27.8974, lng: 78.088 },
      { slug: 'bareilly', name: 'Bareilly', nameHi: 'बरेली', lat: 28.367, lng: 79.4304 },
      { slug: 'moradabad', name: 'Moradabad', nameHi: 'मुरादाबाद', lat: 28.8386, lng: 78.7733 },
      { slug: 'gorakhpur', name: 'Gorakhpur', nameHi: 'गोरखपुर', lat: 26.7606, lng: 83.3732 },
      { slug: 'jhansi', name: 'Jhansi', nameHi: 'झाँसी', lat: 25.4484, lng: 78.5685 },
      { slug: 'mathura', name: 'Mathura', nameHi: 'मथुरा', lat: 27.4924, lng: 77.6737 },
      { slug: 'saharanpur', name: 'Saharanpur', nameHi: 'सहारनपुर', lat: 29.968, lng: 77.546 },
      {
        slug: 'muzaffarnagar',
        name: 'Muzaffarnagar',
        nameHi: 'मुज़फ़्फ़रनगर',
        lat: 29.4727,
        lng: 77.7085,
      },
      { slug: 'bulandshahr', name: 'Bulandshahr', nameHi: 'बुलंदशहर', lat: 28.407, lng: 77.8498 },
    ],
  },
  {
    slug: 'rajasthan',
    name: 'Rajasthan',
    nameHi: 'राजस्थान',
    capital: 'Jaipur',
    region: 'north',
    coordinates: { lat: 27.0238, lng: 74.2179 },
    majorCities: [
      { slug: 'jaipur', name: 'Jaipur', nameHi: 'जयपुर', lat: 26.9124, lng: 75.7873 },
      { slug: 'jodhpur', name: 'Jodhpur', nameHi: 'जोधपुर', lat: 26.2389, lng: 73.0243 },
      { slug: 'udaipur', name: 'Udaipur', nameHi: 'उदयपुर', lat: 24.5854, lng: 73.7125 },
      { slug: 'kota', name: 'Kota', nameHi: 'कोटा', lat: 25.2138, lng: 75.8648 },
      { slug: 'ajmer', name: 'Ajmer', nameHi: 'अजमेर', lat: 26.4499, lng: 74.6399 },
      { slug: 'bikaner', name: 'Bikaner', nameHi: 'बीकानेर', lat: 28.0229, lng: 73.3119 },
      { slug: 'bhilwara', name: 'Bhilwara', nameHi: 'भीलवाड़ा', lat: 25.3407, lng: 74.6313 },
      { slug: 'alwar', name: 'Alwar', nameHi: 'अलवर', lat: 27.553, lng: 76.6346 },
      { slug: 'sikar', name: 'Sikar', nameHi: 'सीकर', lat: 27.6094, lng: 75.1399 },
      {
        slug: 'sri-ganganagar',
        name: 'Sri Ganganagar',
        nameHi: 'श्री गंगानगर',
        lat: 29.9038,
        lng: 73.8772,
      },
      { slug: 'bharatpur', name: 'Bharatpur', nameHi: 'भरतपुर', lat: 27.2152, lng: 77.503 },
      { slug: 'pali', name: 'Pali', nameHi: 'पाली', lat: 25.7711, lng: 73.3234 },
      { slug: 'nagaur', name: 'Nagaur', nameHi: 'नागौर', lat: 27.2024, lng: 73.735 },
      { slug: 'tonk', name: 'Tonk', nameHi: 'टोंक', lat: 26.1665, lng: 75.7885 },
      {
        slug: 'chittorgarh',
        name: 'Chittorgarh',
        nameHi: 'चित्तौड़गढ़',
        lat: 24.8887,
        lng: 74.6269,
      },
    ],
  },
  {
    slug: 'madhya-pradesh',
    name: 'Madhya Pradesh',
    nameHi: 'मध्य प्रदेश',
    capital: 'Bhopal',
    region: 'central',
    coordinates: { lat: 23.4733, lng: 77.9479 },
    majorCities: [
      { slug: 'bhopal', name: 'Bhopal', nameHi: 'भोपाल', lat: 23.2599, lng: 77.4126 },
      { slug: 'indore', name: 'Indore', nameHi: 'इंदौर', lat: 22.7196, lng: 75.8577 },
      { slug: 'gwalior', name: 'Gwalior', nameHi: 'ग्वालियर', lat: 26.2183, lng: 78.1828 },
      { slug: 'jabalpur', name: 'Jabalpur', nameHi: 'जबलपुर', lat: 23.1815, lng: 79.9864 },
      { slug: 'ujjain', name: 'Ujjain', nameHi: 'उज्जैन', lat: 23.1765, lng: 75.7885 },
      { slug: 'sagar', name: 'Sagar', nameHi: 'सागर', lat: 23.8388, lng: 78.7378 },
      { slug: 'dewas', name: 'Dewas', nameHi: 'देवास', lat: 22.9676, lng: 76.0534 },
      { slug: 'ratlam', name: 'Ratlam', nameHi: 'रतलाम', lat: 23.3341, lng: 75.0365 },
      { slug: 'rewa', name: 'Rewa', nameHi: 'रीवा', lat: 24.5373, lng: 81.3042 },
      { slug: 'satna', name: 'Satna', nameHi: 'सतना', lat: 24.6005, lng: 80.8322 },
      { slug: 'chhindwara', name: 'Chhindwara', nameHi: 'छिंदवाड़ा', lat: 22.0574, lng: 78.9382 },
      { slug: 'morena', name: 'Morena', nameHi: 'मुरैना', lat: 26.4981, lng: 77.9935 },
      { slug: 'vidisha', name: 'Vidisha', nameHi: 'विदिशा', lat: 23.5239, lng: 77.8061 },
      { slug: 'hoshangabad', name: 'Hoshangabad', nameHi: 'होशंगाबाद', lat: 22.7467, lng: 77.7337 },
      { slug: 'damoh', name: 'Damoh', nameHi: 'दमोह', lat: 23.8361, lng: 79.4421 },
    ],
  },
  {
    slug: 'bihar',
    name: 'Bihar',
    nameHi: 'बिहार',
    capital: 'Patna',
    region: 'east',
    coordinates: { lat: 25.0961, lng: 85.3131 },
    majorCities: [
      { slug: 'patna', name: 'Patna', nameHi: 'पटना', lat: 25.6093, lng: 85.1376 },
      { slug: 'gaya', name: 'Gaya', nameHi: 'गया', lat: 24.7955, lng: 84.9994 },
      { slug: 'bhagalpur', name: 'Bhagalpur', nameHi: 'भागलपुर', lat: 25.2425, lng: 86.9842 },
      {
        slug: 'muzaffarpur',
        name: 'Muzaffarpur',
        nameHi: 'मुज़फ़्फ़रपुर',
        lat: 26.1209,
        lng: 85.3647,
      },
      { slug: 'purnia', name: 'Purnia', nameHi: 'पूर्णिया', lat: 25.7771, lng: 87.4753 },
      { slug: 'darbhanga', name: 'Darbhanga', nameHi: 'दरभंगा', lat: 26.1542, lng: 85.8918 },
      { slug: 'begusarai', name: 'Begusarai', nameHi: 'बेगूसराय', lat: 25.4182, lng: 86.1272 },
      { slug: 'arrah', name: 'Arrah', nameHi: 'आरा', lat: 25.5541, lng: 84.6603 },
      { slug: 'katihar', name: 'Katihar', nameHi: 'कटिहार', lat: 25.5392, lng: 87.5719 },
      { slug: 'munger', name: 'Munger', nameHi: 'मुंगेर', lat: 25.3708, lng: 86.4735 },
      { slug: 'samastipur', name: 'Samastipur', nameHi: 'समस्तीपुर', lat: 25.8629, lng: 85.7811 },
      { slug: 'hajipur', name: 'Hajipur', nameHi: 'हाजीपुर', lat: 25.6859, lng: 85.2132 },
      { slug: 'buxar', name: 'Buxar', nameHi: 'बक्सर', lat: 25.5764, lng: 83.9785 },
      { slug: 'sitamarhi', name: 'Sitamarhi', nameHi: 'सीतामढ़ी', lat: 26.5955, lng: 85.4891 },
      { slug: 'madhubani', name: 'Madhubani', nameHi: 'मधुबनी', lat: 26.3542, lng: 86.0716 },
    ],
  },
  {
    slug: 'uttarakhand',
    name: 'Uttarakhand',
    nameHi: 'उत्तराखंड',
    capital: 'Dehradun',
    region: 'north',
    coordinates: { lat: 30.0668, lng: 79.0193 },
    majorCities: [
      { slug: 'dehradun', name: 'Dehradun', nameHi: 'देहरादून', lat: 30.3165, lng: 78.0322 },
      { slug: 'haridwar', name: 'Haridwar', nameHi: 'हरिद्वार', lat: 29.9457, lng: 78.1642 },
      { slug: 'haldwani', name: 'Haldwani', nameHi: 'हल्द्वानी', lat: 29.2183, lng: 79.513 },
      { slug: 'roorkee', name: 'Roorkee', nameHi: 'रुड़की', lat: 29.8543, lng: 77.888 },
      { slug: 'rishikesh', name: 'Rishikesh', nameHi: 'ऋषिकेश', lat: 30.0869, lng: 78.2676 },
      { slug: 'kashipur', name: 'Kashipur', nameHi: 'काशीपुर', lat: 29.2104, lng: 78.9619 },
      { slug: 'rudrapur', name: 'Rudrapur', nameHi: 'रुद्रपुर', lat: 28.9753, lng: 79.3999 },
      { slug: 'pithoragarh', name: 'Pithoragarh', nameHi: 'पिथौरागढ़', lat: 29.5829, lng: 80.2182 },
      {
        slug: 'udham-singh-nagar',
        name: 'Udham Singh Nagar',
        nameHi: 'उधम सिंह नगर',
        lat: 28.993,
        lng: 79.3735,
      },
      { slug: 'kotdwar', name: 'Kotdwar', nameHi: 'कोटद्वार', lat: 29.7461, lng: 78.5316 },
    ],
  },
  {
    slug: 'himachal-pradesh',
    name: 'Himachal Pradesh',
    nameHi: 'हिमाचल प्रदेश',
    capital: 'Shimla',
    region: 'north',
    coordinates: { lat: 31.1048, lng: 77.1734 },
    majorCities: [
      { slug: 'shimla', name: 'Shimla', nameHi: 'शिमला', lat: 31.1048, lng: 77.1734 },
      { slug: 'mandi', name: 'Mandi', nameHi: 'मंडी', lat: 31.7138, lng: 76.931 },
      { slug: 'solan', name: 'Solan', nameHi: 'सोलन', lat: 30.9045, lng: 77.0967 },
      { slug: 'kangra', name: 'Kangra', nameHi: 'कांगड़ा', lat: 32.0998, lng: 76.2691 },
      { slug: 'hamirpur', name: 'Hamirpur', nameHi: 'हमीरपुर', lat: 31.6862, lng: 76.5213 },
      { slug: 'bilaspur', name: 'Bilaspur', nameHi: 'बिलासपुर', lat: 31.3317, lng: 76.7591 },
      { slug: 'una', name: 'Una', nameHi: 'ऊना', lat: 31.4685, lng: 76.2708 },
      { slug: 'palampur', name: 'Palampur', nameHi: 'पालमपुर', lat: 32.1109, lng: 76.5363 },
      { slug: 'kullu', name: 'Kullu', nameHi: 'कुल्लू', lat: 31.9579, lng: 77.1095 },
      { slug: 'nahan', name: 'Nahan', nameHi: 'नाहन', lat: 30.5596, lng: 77.296 },
    ],
  },
  {
    slug: 'jharkhand',
    name: 'Jharkhand',
    nameHi: 'झारखंड',
    capital: 'Ranchi',
    region: 'east',
    coordinates: { lat: 23.6102, lng: 85.2799 },
    majorCities: [
      { slug: 'ranchi', name: 'Ranchi', nameHi: 'रांची', lat: 23.3441, lng: 85.3096 },
      { slug: 'jamshedpur', name: 'Jamshedpur', nameHi: 'जमशेदपुर', lat: 22.8046, lng: 86.2029 },
      { slug: 'dhanbad', name: 'Dhanbad', nameHi: 'धनबाद', lat: 23.7957, lng: 86.4304 },
      { slug: 'bokaro', name: 'Bokaro', nameHi: 'बोकारो', lat: 23.6693, lng: 86.1511 },
      { slug: 'deoghar', name: 'Deoghar', nameHi: 'देवघर', lat: 24.4764, lng: 86.6944 },
      { slug: 'hazaribagh', name: 'Hazaribagh', nameHi: 'हज़ारीबाग़', lat: 23.9966, lng: 85.3637 },
      { slug: 'giridih', name: 'Giridih', nameHi: 'गिरिडीह', lat: 24.1903, lng: 86.3007 },
      { slug: 'dumka', name: 'Dumka', nameHi: 'दुमका', lat: 24.2669, lng: 87.2499 },
      { slug: 'ramgarh', name: 'Ramgarh', nameHi: 'रामगढ़', lat: 23.634, lng: 85.5175 },
      { slug: 'chaibasa', name: 'Chaibasa', nameHi: 'चाईबासा', lat: 22.5545, lng: 85.806 },
    ],
  },
  {
    slug: 'chhattisgarh',
    name: 'Chhattisgarh',
    nameHi: 'छत्तीसगढ़',
    capital: 'Raipur',
    region: 'central',
    coordinates: { lat: 21.2787, lng: 81.8661 },
    majorCities: [
      { slug: 'raipur', name: 'Raipur', nameHi: 'रायपुर', lat: 21.2514, lng: 81.6296 },
      { slug: 'bilaspur', name: 'Bilaspur', nameHi: 'बिलासपुर', lat: 22.0797, lng: 82.1409 },
      { slug: 'durg', name: 'Durg', nameHi: 'दुर्ग', lat: 21.1904, lng: 81.2849 },
      { slug: 'korba', name: 'Korba', nameHi: 'कोरबा', lat: 22.3595, lng: 82.7501 },
      { slug: 'bhilai', name: 'Bhilai', nameHi: 'भिलाई', lat: 21.2094, lng: 81.3784 },
      { slug: 'rajnandgaon', name: 'Rajnandgaon', nameHi: 'राजनांदगांव', lat: 21.0974, lng: 81.03 },
      { slug: 'jagdalpur', name: 'Jagdalpur', nameHi: 'जगदलपुर', lat: 19.0866, lng: 82.0218 },
      { slug: 'ambikapur', name: 'Ambikapur', nameHi: 'अंबिकापुर', lat: 23.1221, lng: 83.1959 },
      { slug: 'raigarh', name: 'Raigarh', nameHi: 'रायगढ़', lat: 21.8974, lng: 83.395 },
      { slug: 'mahasamund', name: 'Mahasamund', nameHi: 'महासमुंद', lat: 21.1106, lng: 82.0958 },
    ],
  },

  // ═══════════════════════════════════════════
  // WESTERN INDIA
  // ═══════════════════════════════════════════
  {
    slug: 'maharashtra',
    name: 'Maharashtra',
    nameHi: 'महाराष्ट्र',
    capital: 'Mumbai',
    region: 'west',
    coordinates: { lat: 19.7515, lng: 75.7139 },
    majorCities: [
      { slug: 'pune', name: 'Pune', nameHi: 'पुणे', lat: 18.5204, lng: 73.8567 },
      { slug: 'nagpur', name: 'Nagpur', nameHi: 'नागपुर', lat: 21.1458, lng: 79.0882 },
      { slug: 'nashik', name: 'Nashik', nameHi: 'नासिक', lat: 20.0063, lng: 73.79 },
      { slug: 'aurangabad', name: 'Aurangabad', nameHi: 'औरंगाबाद', lat: 19.8762, lng: 75.3433 },
      { slug: 'kolhapur', name: 'Kolhapur', nameHi: 'कोल्हापुर', lat: 16.705, lng: 74.2433 },
      { slug: 'solapur', name: 'Solapur', nameHi: 'सोलापुर', lat: 17.6599, lng: 75.9064 },
      { slug: 'amravati', name: 'Amravati', nameHi: 'अमरावती', lat: 20.9374, lng: 77.7796 },
      { slug: 'akola', name: 'Akola', nameHi: 'अकोला', lat: 20.7072, lng: 77.0075 },
      { slug: 'latur', name: 'Latur', nameHi: 'लातूर', lat: 18.3968, lng: 76.5604 },
      { slug: 'jalgaon', name: 'Jalgaon', nameHi: 'जलगांव', lat: 21.0077, lng: 75.5626 },
      { slug: 'sangli', name: 'Sangli', nameHi: 'सांगली', lat: 16.8524, lng: 74.5815 },
      { slug: 'satara', name: 'Satara', nameHi: 'सातारा', lat: 17.6805, lng: 74.0183 },
      { slug: 'ahmednagar', name: 'Ahmednagar', nameHi: 'अहमदनगर', lat: 19.0948, lng: 74.748 },
      { slug: 'wardha', name: 'Wardha', nameHi: 'वर्धा', lat: 20.7453, lng: 78.6022 },
      { slug: 'yavatmal', name: 'Yavatmal', nameHi: 'यवतमाल', lat: 20.3899, lng: 78.1307 },
    ],
  },
  {
    slug: 'gujarat',
    name: 'Gujarat',
    nameHi: 'गुजरात',
    capital: 'Gandhinagar',
    region: 'west',
    coordinates: { lat: 22.2587, lng: 71.1924 },
    majorCities: [
      { slug: 'ahmedabad', name: 'Ahmedabad', nameHi: 'अहमदाबाद', lat: 23.0225, lng: 72.5714 },
      { slug: 'surat', name: 'Surat', nameHi: 'सूरत', lat: 21.1702, lng: 72.8311 },
      { slug: 'vadodara', name: 'Vadodara', nameHi: 'वडोदरा', lat: 22.3072, lng: 73.1812 },
      { slug: 'rajkot', name: 'Rajkot', nameHi: 'राजकोट', lat: 22.3039, lng: 70.8022 },
      { slug: 'bhavnagar', name: 'Bhavnagar', nameHi: 'भावनगर', lat: 21.7645, lng: 72.1519 },
      { slug: 'junagadh', name: 'Junagadh', nameHi: 'जूनागढ़', lat: 21.5222, lng: 70.4579 },
      { slug: 'mehsana', name: 'Mehsana', nameHi: 'मेहसाणा', lat: 23.588, lng: 72.3693 },
      { slug: 'anand', name: 'Anand', nameHi: 'आणंद', lat: 22.5645, lng: 72.9289 },
      { slug: 'bharuch', name: 'Bharuch', nameHi: 'भरूच', lat: 21.7051, lng: 72.9959 },
      { slug: 'navsari', name: 'Navsari', nameHi: 'नवसारी', lat: 20.9467, lng: 72.952 },
      { slug: 'morbi', name: 'Morbi', nameHi: 'मोरबी', lat: 22.8173, lng: 70.837 },
      {
        slug: 'surendranagar',
        name: 'Surendranagar',
        nameHi: 'सुरेंद्रनगर',
        lat: 22.7286,
        lng: 71.637,
      },
      { slug: 'palanpur', name: 'Palanpur', nameHi: 'पालनपुर', lat: 24.1725, lng: 72.4269 },
      { slug: 'amreli', name: 'Amreli', nameHi: 'अमरेली', lat: 21.6032, lng: 71.2166 },
      { slug: 'kutch', name: 'Kutch', nameHi: 'कच्छ', lat: 23.7337, lng: 69.8597 },
    ],
  },

  // ═══════════════════════════════════════════
  // SOUTHERN INDIA
  // ═══════════════════════════════════════════
  {
    slug: 'karnataka',
    name: 'Karnataka',
    nameHi: 'कर्नाटक',
    capital: 'Bengaluru',
    region: 'south',
    coordinates: { lat: 15.3173, lng: 75.7139 },
    majorCities: [
      { slug: 'bengaluru', name: 'Bengaluru', nameHi: 'बेंगलुरु', lat: 12.9716, lng: 77.5946 },
      { slug: 'hubli', name: 'Hubli', nameHi: 'हुबली', lat: 15.3647, lng: 75.124 },
      { slug: 'mysuru', name: 'Mysuru', nameHi: 'मैसूर', lat: 12.2958, lng: 76.6394 },
      { slug: 'belgaum', name: 'Belgaum', nameHi: 'बेलगाम', lat: 15.8497, lng: 74.4977 },
      { slug: 'gulbarga', name: 'Gulbarga', nameHi: 'गुलबर्गा', lat: 17.3297, lng: 76.8343 },
      { slug: 'davangere', name: 'Davangere', nameHi: 'दावणगेरे', lat: 14.4644, lng: 75.9218 },
      { slug: 'bellary', name: 'Bellary', nameHi: 'बेल्लारी', lat: 15.1394, lng: 76.9214 },
      { slug: 'shimoga', name: 'Shimoga', nameHi: 'शिमोगा', lat: 13.9299, lng: 75.5681 },
      { slug: 'raichur', name: 'Raichur', nameHi: 'रायचूर', lat: 16.2076, lng: 77.3463 },
      { slug: 'bidar', name: 'Bidar', nameHi: 'बीदर', lat: 17.9134, lng: 77.5296 },
      { slug: 'tumkur', name: 'Tumkur', nameHi: 'तुमकूर', lat: 13.3379, lng: 77.1173 },
      { slug: 'mandya', name: 'Mandya', nameHi: 'मंड्या', lat: 12.522, lng: 76.8953 },
      { slug: 'hassan', name: 'Hassan', nameHi: 'हासन', lat: 13.0073, lng: 76.0962 },
      {
        slug: 'chitradurga',
        name: 'Chitradurga',
        nameHi: 'चित्रदुर्ग',
        lat: 14.2226,
        lng: 76.3987,
      },
      { slug: 'gadag', name: 'Gadag', nameHi: 'गदग', lat: 15.4168, lng: 75.6267 },
    ],
  },
  {
    slug: 'tamil-nadu',
    name: 'Tamil Nadu',
    nameHi: 'तमिल नाडु',
    capital: 'Chennai',
    region: 'south',
    coordinates: { lat: 11.1271, lng: 78.6569 },
    majorCities: [
      { slug: 'chennai', name: 'Chennai', nameHi: 'चेन्नई', lat: 13.0827, lng: 80.2707 },
      { slug: 'coimbatore', name: 'Coimbatore', nameHi: 'कोयंबटूर', lat: 11.0168, lng: 76.9558 },
      { slug: 'madurai', name: 'Madurai', nameHi: 'मदुरै', lat: 9.9252, lng: 78.1198 },
      { slug: 'salem', name: 'Salem', nameHi: 'सेलम', lat: 11.6643, lng: 78.146 },
      {
        slug: 'tiruchirappalli',
        name: 'Tiruchirappalli',
        nameHi: 'तिरुचिरापल्ली',
        lat: 10.7905,
        lng: 78.7047,
      },
      { slug: 'erode', name: 'Erode', nameHi: 'इरोड', lat: 11.341, lng: 77.7172 },
      {
        slug: 'tirunelveli',
        name: 'Tirunelveli',
        nameHi: 'तिरुनेलवेली',
        lat: 8.7139,
        lng: 77.7567,
      },
      { slug: 'vellore', name: 'Vellore', nameHi: 'वेल्लूर', lat: 12.9165, lng: 79.1325 },
      { slug: 'thoothukudi', name: 'Thoothukudi', nameHi: 'तूतीकोरिन', lat: 8.7642, lng: 78.1348 },
      { slug: 'thanjavur', name: 'Thanjavur', nameHi: 'तंजावुर', lat: 10.787, lng: 79.1378 },
      { slug: 'dindigul', name: 'Dindigul', nameHi: 'डिंडीगुल', lat: 10.3624, lng: 77.9695 },
      { slug: 'namakkal', name: 'Namakkal', nameHi: 'नामक्कल', lat: 11.2189, lng: 78.1674 },
      { slug: 'villupuram', name: 'Villupuram', nameHi: 'विल्लुपुरम', lat: 11.9401, lng: 79.4861 },
      { slug: 'kanchipuram', name: 'Kanchipuram', nameHi: 'कांचीपुरम', lat: 12.8342, lng: 79.7036 },
      { slug: 'cuddalore', name: 'Cuddalore', nameHi: 'कडलूर', lat: 11.748, lng: 79.7714 },
    ],
  },
  {
    slug: 'andhra-pradesh',
    name: 'Andhra Pradesh',
    nameHi: 'आंध्र प्रदेश',
    capital: 'Amaravati',
    region: 'south',
    coordinates: { lat: 15.9129, lng: 79.74 },
    majorCities: [
      {
        slug: 'visakhapatnam',
        name: 'Visakhapatnam',
        nameHi: 'विशाखापत्तनम',
        lat: 17.6868,
        lng: 83.2185,
      },
      { slug: 'vijayawada', name: 'Vijayawada', nameHi: 'विजयवाड़ा', lat: 16.5062, lng: 80.648 },
      { slug: 'guntur', name: 'Guntur', nameHi: 'गुंटूर', lat: 16.3067, lng: 80.4365 },
      { slug: 'nellore', name: 'Nellore', nameHi: 'नेल्लूर', lat: 14.4426, lng: 79.9865 },
      { slug: 'kurnool', name: 'Kurnool', nameHi: 'कुर्नूल', lat: 15.8281, lng: 78.0373 },
      { slug: 'tirupati', name: 'Tirupati', nameHi: 'तिरुपति', lat: 13.6288, lng: 79.4192 },
      { slug: 'rajahmundry', name: 'Rajahmundry', nameHi: 'राजमुंद्री', lat: 17.0005, lng: 81.804 },
      { slug: 'kakinada', name: 'Kakinada', nameHi: 'काकीनाड़ा', lat: 16.9891, lng: 82.2475 },
      { slug: 'eluru', name: 'Eluru', nameHi: 'एलूरु', lat: 16.7107, lng: 81.0952 },
      { slug: 'ongole', name: 'Ongole', nameHi: 'ओंगोल', lat: 15.5057, lng: 80.0499 },
      { slug: 'anantapur', name: 'Anantapur', nameHi: 'अनंतपुर', lat: 14.6819, lng: 77.6006 },
      { slug: 'chittoor', name: 'Chittoor', nameHi: 'चित्तूर', lat: 13.2172, lng: 79.1003 },
      { slug: 'kadapa', name: 'Kadapa', nameHi: 'कडपा', lat: 14.4673, lng: 78.8242 },
      { slug: 'srikakulam', name: 'Srikakulam', nameHi: 'श्रीकाकुलम', lat: 18.2949, lng: 83.8938 },
      {
        slug: 'machilipatnam',
        name: 'Machilipatnam',
        nameHi: 'मछलीपट्टनम',
        lat: 16.1875,
        lng: 81.1389,
      },
    ],
  },
  {
    slug: 'telangana',
    name: 'Telangana',
    nameHi: 'तेलंगाना',
    capital: 'Hyderabad',
    region: 'south',
    coordinates: { lat: 18.1124, lng: 79.0193 },
    majorCities: [
      { slug: 'hyderabad', name: 'Hyderabad', nameHi: 'हैदराबाद', lat: 17.385, lng: 78.4867 },
      { slug: 'warangal', name: 'Warangal', nameHi: 'वारंगल', lat: 17.9784, lng: 79.5941 },
      { slug: 'nizamabad', name: 'Nizamabad', nameHi: 'निज़ामाबाद', lat: 18.6725, lng: 78.094 },
      { slug: 'karimnagar', name: 'Karimnagar', nameHi: 'करीमनगर', lat: 18.4386, lng: 79.1288 },
      { slug: 'khammam', name: 'Khammam', nameHi: 'खम्मम', lat: 17.2473, lng: 80.1514 },
      { slug: 'mahbubnagar', name: 'Mahbubnagar', nameHi: 'महबूबनगर', lat: 16.7488, lng: 77.993 },
      { slug: 'nalgonda', name: 'Nalgonda', nameHi: 'नलगोंडा', lat: 17.0583, lng: 79.2671 },
      { slug: 'adilabad', name: 'Adilabad', nameHi: 'आदिलाबाद', lat: 19.664, lng: 78.532 },
      { slug: 'suryapet', name: 'Suryapet', nameHi: 'सूर्यापेट', lat: 17.1383, lng: 79.627 },
      { slug: 'siddipet', name: 'Siddipet', nameHi: 'सिद्दीपेट', lat: 18.1019, lng: 78.852 },
    ],
  },
  {
    slug: 'kerala',
    name: 'Kerala',
    nameHi: 'केरल',
    capital: 'Thiruvananthapuram',
    region: 'south',
    coordinates: { lat: 10.8505, lng: 76.2711 },
    majorCities: [
      {
        slug: 'thiruvananthapuram',
        name: 'Thiruvananthapuram',
        nameHi: 'तिरुवनंतपुरम',
        lat: 8.5241,
        lng: 76.9366,
      },
      { slug: 'kochi', name: 'Kochi', nameHi: 'कोच्चि', lat: 9.9312, lng: 76.2673 },
      { slug: 'kozhikode', name: 'Kozhikode', nameHi: 'कोझिकोड', lat: 11.2588, lng: 75.7804 },
      { slug: 'thrissur', name: 'Thrissur', nameHi: 'त्रिशूर', lat: 10.5276, lng: 76.2144 },
      { slug: 'kollam', name: 'Kollam', nameHi: 'कोल्लम', lat: 8.8932, lng: 76.6141 },
      { slug: 'palakkad', name: 'Palakkad', nameHi: 'पालक्काड', lat: 10.7867, lng: 76.6548 },
      { slug: 'alappuzha', name: 'Alappuzha', nameHi: 'आलप्पुझा', lat: 9.4981, lng: 76.3388 },
      { slug: 'malappuram', name: 'Malappuram', nameHi: 'मलप्पुरम', lat: 11.051, lng: 76.0711 },
      { slug: 'kannur', name: 'Kannur', nameHi: 'कन्नूर', lat: 11.8745, lng: 75.3704 },
      { slug: 'kottayam', name: 'Kottayam', nameHi: 'कोट्टायम', lat: 9.5916, lng: 76.5222 },
    ],
  },

  // ═══════════════════════════════════════════
  // EASTERN INDIA
  // ═══════════════════════════════════════════
  {
    slug: 'west-bengal',
    name: 'West Bengal',
    nameHi: 'पश्चिम बंगाल',
    capital: 'Kolkata',
    region: 'east',
    coordinates: { lat: 22.9868, lng: 87.855 },
    majorCities: [
      { slug: 'kolkata', name: 'Kolkata', nameHi: 'कोलकाता', lat: 22.5726, lng: 88.3639 },
      { slug: 'siliguri', name: 'Siliguri', nameHi: 'सिलीगुड़ी', lat: 26.7271, lng: 88.3953 },
      { slug: 'asansol', name: 'Asansol', nameHi: 'आसनसोल', lat: 23.6739, lng: 86.9524 },
      { slug: 'durgapur', name: 'Durgapur', nameHi: 'दुर्गापुर', lat: 23.5204, lng: 87.3119 },
      { slug: 'bardhaman', name: 'Bardhaman', nameHi: 'बर्धमान', lat: 23.2324, lng: 87.8615 },
      { slug: 'howrah', name: 'Howrah', nameHi: 'हावड़ा', lat: 22.5958, lng: 88.2636 },
      { slug: 'malda', name: 'Malda', nameHi: 'मालदा', lat: 25.0108, lng: 88.1411 },
      { slug: 'bankura', name: 'Bankura', nameHi: 'बांकुड़ा', lat: 23.2324, lng: 87.0648 },
      { slug: 'jalpaiguri', name: 'Jalpaiguri', nameHi: 'जलपाईगुड़ी', lat: 26.5167, lng: 88.7333 },
      { slug: 'cooch-behar', name: 'Cooch Behar', nameHi: 'कूचबिहार', lat: 26.3452, lng: 89.4482 },
      { slug: 'purulia', name: 'Purulia', nameHi: 'पुरुलिया', lat: 23.3321, lng: 86.365 },
      { slug: 'medinipur', name: 'Medinipur', nameHi: 'मेदिनीपुर', lat: 22.4249, lng: 87.3191 },
      {
        slug: 'krishnanagar',
        name: 'Krishnanagar',
        nameHi: 'कृष्णनगर',
        lat: 23.4013,
        lng: 88.5016,
      },
      { slug: 'balurghat', name: 'Balurghat', nameHi: 'बालुरघाट', lat: 25.2271, lng: 88.7653 },
      { slug: 'raiganj', name: 'Raiganj', nameHi: 'रायगंज', lat: 25.6133, lng: 88.1239 },
    ],
  },
  {
    slug: 'odisha',
    name: 'Odisha',
    nameHi: 'ओडिशा',
    capital: 'Bhubaneswar',
    region: 'east',
    coordinates: { lat: 20.9517, lng: 85.0985 },
    majorCities: [
      { slug: 'bhubaneswar', name: 'Bhubaneswar', nameHi: 'भुवनेश्वर', lat: 20.2961, lng: 85.8245 },
      { slug: 'cuttack', name: 'Cuttack', nameHi: 'कटक', lat: 20.4625, lng: 85.883 },
      { slug: 'berhampur', name: 'Berhampur', nameHi: 'बरहामपुर', lat: 19.315, lng: 84.7941 },
      { slug: 'rourkela', name: 'Rourkela', nameHi: 'राउरकेला', lat: 22.2604, lng: 84.8536 },
      { slug: 'sambalpur', name: 'Sambalpur', nameHi: 'संबलपुर', lat: 21.4669, lng: 83.9812 },
      { slug: 'puri', name: 'Puri', nameHi: 'पुरी', lat: 19.8135, lng: 85.8312 },
      { slug: 'balasore', name: 'Balasore', nameHi: 'बालासोर', lat: 21.5095, lng: 86.9249 },
      { slug: 'bhadrak', name: 'Bhadrak', nameHi: 'भद्रक', lat: 21.0545, lng: 86.5156 },
      { slug: 'jharsuguda', name: 'Jharsuguda', nameHi: 'झारसुगुड़ा', lat: 21.8554, lng: 84.0063 },
      { slug: 'bargarh', name: 'Bargarh', nameHi: 'बरगढ़', lat: 21.3364, lng: 83.6194 },
      { slug: 'angul', name: 'Angul', nameHi: 'अंगुल', lat: 20.8408, lng: 85.1016 },
      { slug: 'koraput', name: 'Koraput', nameHi: 'कोरापुट', lat: 18.8135, lng: 82.7123 },
      { slug: 'rayagada', name: 'Rayagada', nameHi: 'रायगड़ा', lat: 19.1711, lng: 83.4165 },
      { slug: 'baripada', name: 'Baripada', nameHi: 'बारीपदा', lat: 21.935, lng: 86.7249 },
      { slug: 'dhenkanal', name: 'Dhenkanal', nameHi: 'ढेंकानाल', lat: 20.6617, lng: 85.5991 },
    ],
  },

  // ═══════════════════════════════════════════
  // NORTHEAST INDIA
  // ═══════════════════════════════════════════
  {
    slug: 'assam',
    name: 'Assam',
    nameHi: 'असम',
    capital: 'Dispur',
    region: 'northeast',
    coordinates: { lat: 26.2006, lng: 92.9376 },
    majorCities: [
      { slug: 'guwahati', name: 'Guwahati', nameHi: 'गुवाहाटी', lat: 26.1445, lng: 91.7362 },
      { slug: 'jorhat', name: 'Jorhat', nameHi: 'जोरहाट', lat: 26.7509, lng: 94.2037 },
      { slug: 'dibrugarh', name: 'Dibrugarh', nameHi: 'डिब्रूगढ़', lat: 27.4728, lng: 94.912 },
      { slug: 'silchar', name: 'Silchar', nameHi: 'सिलचर', lat: 24.8333, lng: 92.7789 },
      { slug: 'nagaon', name: 'Nagaon', nameHi: 'नगांव', lat: 26.3471, lng: 92.684 },
      { slug: 'tezpur', name: 'Tezpur', nameHi: 'तेजपुर', lat: 26.6528, lng: 92.7926 },
      { slug: 'tinsukia', name: 'Tinsukia', nameHi: 'तिनसुकिया', lat: 27.4889, lng: 95.3597 },
      { slug: 'bongaigaon', name: 'Bongaigaon', nameHi: 'बोंगाईगांव', lat: 26.4769, lng: 90.5584 },
      { slug: 'dhubri', name: 'Dhubri', nameHi: 'धुबरी', lat: 26.0219, lng: 89.988 },
      { slug: 'sivasagar', name: 'Sivasagar', nameHi: 'शिवसागर', lat: 26.9826, lng: 94.6425 },
    ],
  },

  // ═══════════════════════════════════════════
  // UNION TERRITORIES
  // ═══════════════════════════════════════════
  {
    slug: 'delhi',
    name: 'Delhi NCR',
    nameHi: 'दिल्ली एनसीआर',
    capital: 'New Delhi',
    region: 'ut',
    coordinates: { lat: 28.7041, lng: 77.1025 },
    majorCities: [
      { slug: 'new-delhi', name: 'New Delhi', nameHi: 'नई दिल्ली', lat: 28.6139, lng: 77.209 },
      { slug: 'noida', name: 'Noida', nameHi: 'नोएडा', lat: 28.5355, lng: 77.391 },
      { slug: 'ghaziabad', name: 'Ghaziabad', nameHi: 'ग़ाज़ियाबाद', lat: 28.6692, lng: 77.4538 },
      {
        slug: 'greater-noida',
        name: 'Greater Noida',
        nameHi: 'ग्रेटर नोएडा',
        lat: 28.4744,
        lng: 77.504,
      },
      { slug: 'faridabad', name: 'Faridabad', nameHi: 'फरीदाबाद', lat: 28.4089, lng: 77.3178 },
      { slug: 'gurugram', name: 'Gurugram', nameHi: 'गुरुग्राम', lat: 28.4595, lng: 77.0266 },
    ],
  },
  {
    slug: 'chandigarh',
    name: 'Chandigarh',
    nameHi: 'चंडीगढ़',
    capital: 'Chandigarh',
    region: 'ut',
    coordinates: { lat: 30.7333, lng: 76.7794 },
    majorCities: [
      { slug: 'chandigarh', name: 'Chandigarh', nameHi: 'चंडीगढ़', lat: 30.7333, lng: 76.7794 },
    ],
  },
  {
    slug: 'jammu-kashmir',
    name: 'Jammu & Kashmir',
    nameHi: 'जम्मू और कश्मीर',
    capital: 'Srinagar',
    region: 'ut',
    coordinates: { lat: 33.7782, lng: 76.5762 },
    majorCities: [
      { slug: 'jammu', name: 'Jammu', nameHi: 'जम्मू', lat: 32.7266, lng: 74.857 },
      { slug: 'srinagar', name: 'Srinagar', nameHi: 'श्रीनगर', lat: 34.0837, lng: 74.7973 },
      { slug: 'anantnag', name: 'Anantnag', nameHi: 'अनंतनाग', lat: 33.7311, lng: 75.1487 },
      { slug: 'baramulla', name: 'Baramulla', nameHi: 'बारामुला', lat: 34.2098, lng: 74.3436 },
      { slug: 'kathua', name: 'Kathua', nameHi: 'कठुआ', lat: 32.386, lng: 75.516 },
      { slug: 'udhampur', name: 'Udhampur', nameHi: 'उधमपुर', lat: 32.916, lng: 75.1419 },
    ],
  },
];

// ═══════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════

export function getStateBySlug(slug: string): StateData | undefined {
  return INDIA_STATES.find((state) => state.slug === slug);
}

export function getCityBySlug(
  stateSlug: string,
  citySlug: string
): { state: StateData; city: CityData } | undefined {
  const state = getStateBySlug(stateSlug);
  if (!state) return undefined;
  const city = state.majorCities.find((c) => c.slug === citySlug);
  if (!city) return undefined;
  return { state, city };
}

export function getAllStateSlugs(): string[] {
  return INDIA_STATES.map((state) => state.slug);
}

export function getAllCitySlugs(): { stateSlug: string; citySlug: string }[] {
  const slugs: { stateSlug: string; citySlug: string }[] = [];
  for (const state of INDIA_STATES) {
    for (const city of state.majorCities) {
      slugs.push({ stateSlug: state.slug, citySlug: city.slug });
    }
  }
  return slugs;
}

function getNorthernStates(): StateData[] {
  return INDIA_STATES.filter((state) => state.region === 'north' || state.region === 'ut');
}

function getStatesByRegion(region: StateData['region']): StateData[] {
  return INDIA_STATES.filter((state) => state.region === region);
}

// Equipment categories for geo pages
export const EQUIPMENT_CATEGORIES = [
  {
    slug: 'tractors',
    name: 'Tractors',
    nameHi: 'ट्रैक्टर',
    icon: '🚜',
    description: 'Rent powerful tractors for ploughing, tilling, and transportation',
  },
  {
    slug: 'harvesters',
    name: 'Harvesters',
    nameHi: 'हार्वेस्टर',
    icon: '🌾',
    description: 'Combined harvesters for wheat, rice, and other crop harvesting',
  },
  {
    slug: 'cultivators',
    name: 'Cultivators',
    nameHi: 'कल्टीवेटर',
    icon: '⚙️',
    description: 'Cultivators for soil preparation and weed control',
  },
  {
    slug: 'rotavators',
    name: 'Rotavators',
    nameHi: 'रोटावेटर',
    icon: '🔄',
    description: 'Rotavators for efficient soil mixing and land preparation',
  },
  {
    slug: 'seed-drills',
    name: 'Seed Drills',
    nameHi: 'सीड ड्रिल',
    icon: '🌱',
    description: 'Precision seed drills for uniform sowing and planting',
  },
  {
    slug: 'ploughs',
    name: 'Ploughs',
    nameHi: 'हल',
    icon: '🪨',
    description: 'Heavy-duty ploughs for deep soil turning and preparation',
  },
  {
    slug: 'threshers',
    name: 'Threshers',
    nameHi: 'थ्रेशर',
    icon: '🌿',
    description: 'Threshers for separating grain from stalks after harvesting',
  },
  {
    slug: 'sprayers',
    name: 'Sprayers',
    nameHi: 'स्प्रेयर',
    icon: '💧',
    description: 'Agricultural sprayers for pesticide and fertilizer application',
  },
];

// Labour service categories for geo pages
export const LABOUR_SERVICES = [
  {
    slug: 'harvesting',
    name: 'Harvesting',
    nameHi: 'कटाई',
    icon: '🌾',
    description: 'Skilled workers for crop harvesting and collection',
  },
  {
    slug: 'planting-sowing',
    name: 'Planting & Sowing',
    nameHi: 'बुवाई और रोपाई',
    icon: '🌱',
    description: 'Experienced labourers for seed sowing and transplanting',
  },
  {
    slug: 'land-preparation',
    name: 'Land Preparation',
    nameHi: 'भूमि तैयारी',
    icon: '🪨',
    description: 'Workers for field clearing, leveling, and soil preparation',
  },
  {
    slug: 'irrigation',
    name: 'Irrigation Management',
    nameHi: 'सिंचाई प्रबंधन',
    icon: '💧',
    description: 'Experts in irrigation setup, maintenance, and water management',
  },
  {
    slug: 'crop-spraying',
    name: 'Crop Spraying',
    nameHi: 'फसल छिड़काव',
    icon: '🧪',
    description: 'Trained workers for pesticide and fertilizer spraying',
  },
  {
    slug: 'weeding',
    name: 'Weeding',
    nameHi: 'निराई',
    icon: '🌿',
    description: 'Labourers for manual and assisted weed removal',
  },
  {
    slug: 'loading-transport',
    name: 'Loading & Transportation',
    nameHi: 'लोडिंग और परिवहन',
    icon: '🚛',
    description: 'Workers for crop loading, unloading, and field transportation',
  },
];

// SEO-friendly state descriptions for geo pages
export const STATE_DESCRIPTIONS: Record<string, { en: string; crops: string[] }> = {
  punjab: {
    en: 'Punjab, known as the "Granary of India," is a leading agricultural state producing wheat, rice, cotton, and sugarcane. AgriServe connects farmers across Punjab with modern farm equipment and skilled agricultural labour.',
    crops: ['Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Maize', 'Potatoes'],
  },
  haryana: {
    en: "Haryana is one of India's most productive agricultural states, leading in wheat, rice, and mustard production. AgriServe helps Haryana farmers access affordable equipment rentals and experienced farm workers.",
    crops: ['Wheat', 'Rice', 'Mustard', 'Sugarcane', 'Cotton', 'Bajra'],
  },
  'uttar-pradesh': {
    en: "Uttar Pradesh is India's largest agricultural producer, growing sugarcane, wheat, rice, and potatoes across its fertile Gangetic plains. AgriServe serves farmers in every district of UP with equipment and labour on demand.",
    crops: ['Sugarcane', 'Wheat', 'Rice', 'Potatoes', 'Pulses', 'Mustard'],
  },
  rajasthan: {
    en: "Rajasthan's agriculture thrives on crops like bajra, mustard, wheat, and pulses. Despite arid conditions, Rajasthani farmers achieve excellent yields with modern equipment available on AgriServe.",
    crops: ['Bajra', 'Mustard', 'Wheat', 'Pulses', 'Groundnut', 'Cumin'],
  },
  'madhya-pradesh': {
    en: 'Madhya Pradesh, the "Soya State of India," is a major producer of soybean, wheat, and pulses. AgriServe connects MP\'s farmers with tractors, harvesters, and agricultural labour across all districts.',
    crops: ['Soybean', 'Wheat', 'Pulses', 'Rice', 'Gram', 'Maize'],
  },
  bihar: {
    en: "Bihar's rich alluvial soil supports diverse agriculture including rice, wheat, maize, and vegetables. AgriServe empowers Bihar's farmers with easy access to modern farming equipment and skilled workers.",
    crops: ['Rice', 'Wheat', 'Maize', 'Sugarcane', 'Jute', 'Vegetables'],
  },
  uttarakhand: {
    en: "Uttarakhand's diverse terrain supports hill farming and plains agriculture. From Haridwar's fertile fields to mountain terraces, AgriServe provides equipment and labour for every farming need.",
    crops: ['Rice', 'Wheat', 'Sugarcane', 'Soybean', 'Pulses', 'Fruits'],
  },
  'himachal-pradesh': {
    en: 'Himachal Pradesh is famous for apple orchards, wheat, and maize cultivation. AgriServe helps hill farmers access specialized equipment for terrace farming and orchard management.',
    crops: ['Apples', 'Wheat', 'Maize', 'Rice', 'Barley', 'Potatoes'],
  },
  jharkhand: {
    en: "Jharkhand's agriculture centers on rice, pulses, and vegetables. AgriServe bridges the gap between modern farming technology and Jharkhand's hardworking farmers.",
    crops: ['Rice', 'Pulses', 'Maize', 'Vegetables', 'Oilseeds', 'Wheat'],
  },
  chhattisgarh: {
    en: 'Chhattisgarh, known as the "Rice Bowl of India," produces large quantities of rice along with maize and pulses. AgriServe connects Chhattisgarh farmers with affordable equipment and workers.',
    crops: ['Rice', 'Maize', 'Pulses', 'Oilseeds', 'Sugarcane', 'Wheat'],
  },
  maharashtra: {
    en: "Maharashtra is a leading agricultural state producing sugarcane, cotton, soybean, and fruits. AgriServe serves Maharashtra's diverse farming community with equipment and labour solutions.",
    crops: ['Sugarcane', 'Cotton', 'Soybean', 'Rice', 'Jowar', 'Onions'],
  },
  gujarat: {
    en: "Gujarat excels in cotton, groundnut, tobacco, and dairy farming. AgriServe helps Gujarat's progressive farmers access cutting-edge agricultural equipment and skilled workers.",
    crops: ['Cotton', 'Groundnut', 'Tobacco', 'Rice', 'Wheat', 'Cumin'],
  },
  karnataka: {
    en: "Karnataka's agriculture spans coffee plantations, rice paddies, and sugarcane fields. AgriServe supports Karnataka farmers with equipment rentals and labour across all districts.",
    crops: ['Rice', 'Ragi', 'Sugarcane', 'Cotton', 'Coffee', 'Coconut'],
  },
  'tamil-nadu': {
    en: 'Tamil Nadu is a major rice and sugarcane producing state with advanced agricultural practices. AgriServe connects Tamil Nadu farmers with modern equipment and experienced workers.',
    crops: ['Rice', 'Sugarcane', 'Cotton', 'Groundnut', 'Banana', 'Coconut'],
  },
  'andhra-pradesh': {
    en: 'Andhra Pradesh leads in rice, chilli, and tobacco production. AgriServe empowers AP farmers with easy access to farm equipment and agricultural labour.',
    crops: ['Rice', 'Chillies', 'Tobacco', 'Cotton', 'Sugarcane', 'Pulses'],
  },
  telangana: {
    en: "Telangana's agriculture centers on rice, cotton, and maize with increasing mechanization. AgriServe supports Telangana's farmers with equipment and skilled labour on demand.",
    crops: ['Rice', 'Cotton', 'Maize', 'Soybean', 'Turmeric', 'Chillies'],
  },
  kerala: {
    en: "Kerala's unique agriculture includes rubber, coconut, tea, and spice plantations. AgriServe helps Kerala's farmers access specialized equipment for diverse farming needs.",
    crops: ['Rubber', 'Coconut', 'Tea', 'Spices', 'Rice', 'Cashew'],
  },
  'west-bengal': {
    en: "West Bengal is a major rice and jute producing state with rich agricultural traditions. AgriServe serves Bengal's farmers with modern equipment and experienced agricultural workers.",
    crops: ['Rice', 'Jute', 'Tea', 'Potatoes', 'Wheat', 'Vegetables'],
  },
  odisha: {
    en: "Odisha's agriculture revolves around rice, pulses, and oilseeds. AgriServe connects Odisha's farming community with affordable equipment rentals and skilled workers.",
    crops: ['Rice', 'Pulses', 'Oilseeds', 'Jute', 'Sugarcane', 'Vegetables'],
  },
  assam: {
    en: "Assam is famous for its tea gardens, rice paddies, and jute cultivation. AgriServe supports Assam's farmers with modern equipment and labour solutions.",
    crops: ['Tea', 'Rice', 'Jute', 'Sugarcane', 'Potatoes', 'Fruits'],
  },
  delhi: {
    en: "Delhi NCR's peri-urban agriculture includes vegetables, flowers, and dairy farming. AgriServe connects Delhi NCR farmers with equipment and labour for urban-fringe farming.",
    crops: ['Vegetables', 'Flowers', 'Wheat', 'Rice', 'Fruits', 'Dairy'],
  },
  chandigarh: {
    en: "Chandigarh's surrounding areas feature wheat and rice cultivation. AgriServe provides equipment and labour services for the Chandigarh region.",
    crops: ['Wheat', 'Rice', 'Vegetables', 'Fruits'],
  },
  'jammu-kashmir': {
    en: 'Jammu & Kashmir is known for apple orchards, saffron, walnuts, and rice cultivation. AgriServe helps J&K farmers access specialized equipment for hill and valley farming.',
    crops: ['Apples', 'Saffron', 'Walnuts', 'Rice', 'Maize', 'Wheat'],
  },
};
