/**
 * Common UAE areas for the branch finder, so typical searches resolve instantly
 * without a network lookup. Coordinates are area centres.
 */
export const PLACES: { name: string; lat: number; lng: number }[] = [
  // Abu Dhabi
  { name: "Abu Dhabi", lat: 24.4539, lng: 54.3773 }, { name: "Khalifa City", lat: 24.4199, lng: 54.5786 },
  { name: "Mohammed Bin Zayed City", lat: 24.3489, lng: 54.5394 }, { name: "Mussafah", lat: 24.3527, lng: 54.5034 },
  { name: "Al Shamkha", lat: 24.3868, lng: 54.7153 }, { name: "Al Falah", lat: 24.44, lng: 54.712 },
  { name: "Bani Yas", lat: 24.312, lng: 54.629 }, { name: "Al Wathba", lat: 24.2545, lng: 54.6124 },
  { name: "Al Reem Island", lat: 24.4991, lng: 54.4055 }, { name: "Yas Island", lat: 24.4888, lng: 54.6086 },
  { name: "Saadiyat Island", lat: 24.5416, lng: 54.4337 }, { name: "Al Raha", lat: 24.4485, lng: 54.6115 },
  { name: "Al Ain", lat: 24.2075, lng: 55.7447 }, { name: "Madinat Zayed", lat: 23.6852, lng: 53.7083 },
  // Dubai
  { name: "Dubai", lat: 25.2048, lng: 55.2708 }, { name: "Deira", lat: 25.2711, lng: 55.3075 },
  { name: "Bur Dubai", lat: 25.2532, lng: 55.2925 }, { name: "Karama", lat: 25.2461, lng: 55.3053 },
  { name: "Al Qusais", lat: 25.2756, lng: 55.3797 }, { name: "Al Nahda Dubai", lat: 25.2895, lng: 55.3707 },
  { name: "Mirdif", lat: 25.2195, lng: 55.4205 }, { name: "Al Warqa", lat: 25.193, lng: 55.411 },
  { name: "Al Mizhar", lat: 25.244, lng: 55.419 }, { name: "Al Khawaneej", lat: 25.237, lng: 55.48 },
  { name: "Jumeirah", lat: 25.2048, lng: 55.2456 }, { name: "Umm Suqeim", lat: 25.155, lng: 55.215 },
  { name: "Al Barsha", lat: 25.1124, lng: 55.1963 }, { name: "Al Quoz", lat: 25.1414, lng: 55.2367 },
  { name: "Dubai Marina", lat: 25.0805, lng: 55.1403 }, { name: "JLT", lat: 25.0693, lng: 55.1413 },
  { name: "JVC", lat: 25.0597, lng: 55.2079 }, { name: "Downtown Dubai", lat: 25.1972, lng: 55.2744 },
  { name: "Business Bay", lat: 25.1857, lng: 55.2726 }, { name: "Dubai Silicon Oasis", lat: 25.1185, lng: 55.3901 },
  { name: "International City", lat: 25.1636, lng: 55.4083 }, { name: "Nad Al Sheba", lat: 25.1597, lng: 55.3294 },
  { name: "Al Rashidiya", lat: 25.2266, lng: 55.3886 }, { name: "Hatta", lat: 24.7963, lng: 56.1179 },
  // Sharjah
  { name: "Sharjah", lat: 25.3463, lng: 55.4209 }, { name: "Al Majaz", lat: 25.3245, lng: 55.3878 },
  { name: "Al Nahda Sharjah", lat: 25.3013, lng: 55.3719 }, { name: "Al Khan", lat: 25.3256, lng: 55.3695 },
  { name: "Al Taawun", lat: 25.3093, lng: 55.3692 }, { name: "Al Qasimia", lat: 25.3448, lng: 55.3923 },
  { name: "Rolla", lat: 25.3573, lng: 55.3881 }, { name: "Muwaileh", lat: 25.3, lng: 55.455 },
  { name: "University City", lat: 25.2867, lng: 55.4797 }, { name: "Al Qarayen", lat: 25.293, lng: 55.476 },
  { name: "Bu Daniq", lat: 25.322, lng: 55.398 }, { name: "Al Rahmaniya", lat: 25.2656, lng: 55.5243 },
  { name: "Al Nasserya", lat: 25.357, lng: 55.398 }, { name: "Khor Fakkan", lat: 25.3392, lng: 56.3581 },
  { name: "Kalba", lat: 25.0516, lng: 56.355 }, { name: "Dhaid", lat: 25.2885, lng: 55.8816 },
  // Northern Emirates
  { name: "Ajman", lat: 25.4052, lng: 55.5136 }, { name: "Al Nuaimiya", lat: 25.392, lng: 55.454 },
  { name: "Al Jurf", lat: 25.4095, lng: 55.5175 }, { name: "Al Rashidiya Ajman", lat: 25.4118, lng: 55.4446 },
  { name: "Umm Al Quwain", lat: 25.5647, lng: 55.5552 }, { name: "Ras Al Khaimah", lat: 25.7895, lng: 55.9432 },
  { name: "Al Nakheel", lat: 25.7913, lng: 55.9468 }, { name: "Al Dhait", lat: 25.7546, lng: 55.9646 },
  { name: "Fujairah", lat: 25.1288, lng: 56.3265 }, { name: "Dibba", lat: 25.6196, lng: 56.2729 },
];

export const normalise = (s: string) =>
  s.toLowerCase().replace(/\b(al|el)[\s-]+/g, "").replace(/[^a-z0-9]+/g, " ").trim();
