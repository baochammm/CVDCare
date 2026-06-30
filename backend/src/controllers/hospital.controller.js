// Constants — defined outside handler to avoid recreating on every request
const INCLUDE_SPECIALITIES = [
  "cardiology", // tim mạch
  "cardiac_surgery", // phẫu thuật tim
  "cardiothoracic_surgery", // tim + lồng ngực
  "angiology", // mạch máu
  "vascular_surgery", // phẫu thuật mạch máu
  "interventional_cardiology", // can thiệp tim mạch (stent, cath)
  "internal_medicine", // nội tổng quát (hay khám CVD ban đầu)
  "hypertension", // tăng huyết áp
  "stroke_unit", // đơn vị đột quỵ
  "neurology", // thần kinh (liên quan đột quỵ)
];

const EXCLUDE_SPECIALITIES = [
  "ophthalmology",
  "dental",
  "dentistry",
  "dermatology",
  "plastic_surgery",
  "cosmetology",
  "gynaecology",
  "obstetrics",
  "otolaryngology",
  "psychiatry",
  "oncology",
  "naturopathy",
  "yoga_therapy",
  "paediatrics",
  "pediatrics",
  "neonatology",
  "orthopaedics",
  "orthopedics",
  "traumatology",
  "sports_medicine",
  "pharmacy", // nhà thuốc
  "laboratory", // phòng thí nghiệm / xét nghiệm
  "blood_bank", // ngân hàng máu / hiến máu
  "vaccination", // trung tâm tiêm chủng
  "dialysis", // lọc thận (không liên quan CVD trực tiếp)
];

// Tiếng Việt — safety net cho OSM data VN còn thưa tag speciality
// Tiếng Anh đã được cover bởi EXCLUDE_SPECIALITIES
const NAME_BLACKLIST_VI = [
  "chỉnh hình",
  "chấn thương",
  "nhi đồng",
  "nhi khoa",
  "trẻ em",
  "mắt",
  "răng hàm mặt",
  "da liễu",
  "thẩm mỹ",
  "phụ sản",
  "sản khoa",
  "từ dũ",
  "tâm thần",
  "ung bướu",
  "ung thư",
  "tai mũi họng",
  "tiêm chủng",
  "thể thao",
  "hiến máu",
  "phòng thí nghiệm",
  "kiểm tra sức khoẻ",
  "kiểm tra sức khỏe",
  "nhà thuốc",
];

// Haversine distance
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// GET /api/hospitals/nearby
export const getNearbyHospitals = async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: "lat and lng are required" });
  }

  try {
    const apiKey = process.env.GEOAPIFY_API_KEY;

    // Lấy place_id của thành phố từ tọa độ
    const reverseUrl = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${apiKey}`;
    const reverseRes = await fetch(reverseUrl);
    const reverseData = await reverseRes.json();
    const cityFeature = reverseData.features?.[0];
    const cityPlaceId =
      cityFeature?.properties?.city_place_id ||
      cityFeature?.properties?.place_id;

    // Build filter — dùng boundary thành phố nếu có, fallback về 50km
    const filter = cityPlaceId
      ? `place:${cityPlaceId}`
      : `circle:${lng},${lat},50000`;

    const url = `https://api.geoapify.com/v2/places?categories=healthcare.hospital&filter=${filter}&limit=50&apiKey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.features) {
      return res.status(500).json({ message: "Failed to fetch hospitals" });
    }

    const hospitals = data.features
      .map((feature) => {
        const props = feature.properties;
        const raw = props.datasource?.raw;
        const [eLng, eLat] = feature.geometry.coordinates;
        const specialityRaw = raw?.["healthcare:speciality"] || "";
        const specialities = specialityRaw
          ? specialityRaw.split(";").map((s) => s.trim())
          : [];

        return {
          name: props.name || "Unknown Hospital",
          address: props.address_line2 || props.formatted || "",
          lat: eLat,
          lng: eLng,
          dist: getDistance(parseFloat(lat), parseFloat(lng), eLat, eLng),
          specialities,
        };
      })
      .filter((h) => h.name !== "Unknown Hospital")
      .filter((h) => {
        const nameLower = h.name.toLowerCase();

        // Blacklist tiếng Việt — loại bệnh viện chuyên khoa không liên quan CVD
        // Safety net cho OSM data VN thiếu speciality tag
        if (NAME_BLACKLIST_VI.some((kw) => nameLower.includes(kw)))
          return false;

        // Không có speciality tag -> đa khoa, giữ lại
        if (h.specialities.length === 0) return true;

        // Có ít nhất 1 speciality liên quan CVD -> giữ lại
        if (h.specialities.some((s) => INCLUDE_SPECIALITIES.includes(s)))
          return true;

        // Toàn bộ speciality đều bị loại trừ -> bỏ
        if (h.specialities.every((s) => EXCLUDE_SPECIALITIES.includes(s)))
          return false;

        // Bước 5: Còn lại -> giữ
        return true;
      })
      .sort((a, b) => a.dist - b.dist);

    res.status(200).json({ hospitals });
  } catch (err) {
    console.error("Hospital fetch error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
