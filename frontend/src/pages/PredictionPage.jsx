import { useState } from "react";
import { useNavigate } from "react-router";

  const PredictionPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    height: "",
    weight: "",
    ap_hi: "",
    ap_lo: "",
    cholesterol: "",
    gluc: "",
    smoke: "",
    alco: "",
    active: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // navigate to ResultPage with formData
    navigate("/result", { state: formData });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-100 p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-semibold text-primary text-center mb-6">
          Health Data Input
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Age */}
          <div>
            <label className="label font-semibold">Age (years)</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="1"
              max="120"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Gender */}
          <div>
            <label className="label font-semibold">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="select select-bordered w-full"
              required
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Height */}
          <div>
            <label className="label font-semibold">Height (cm)</label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              min="100"
              max="250"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Weight */}
          <div>
            <label className="label font-semibold">Weight (kg)</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              min="30"
              max="200"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Systolic (ap_hi) */}
          <div>
            <label className="label font-semibold">Systolic BP</label>
            <input
              type="number"
              name="ap_hi"
              value={formData.ap_hi}
              onChange={handleChange}
              min="50"
              max="180"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Diastolic (ap_lo) */}
          <div>
            <label className="label font-semibold">Diastolic BP</label>
            <input
              type="number"
              name="ap_lo"
              value={formData.ap_lo}
              onChange={handleChange}
              min="30"
              max="120"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Cholesterol */}
          <div>
            <label className="label font-semibold">Cholesterol</label>
            <select
              name="cholesterol"
              value={formData.cholesterol}
              onChange={handleChange}
              className="select select-bordered w-full"
              required
            >
              <option value="">Select</option>
              <option value="1">1 - Normal (lower than 200 mg/dL)</option>
              <option value="2">2 - Above Normal (200-239 mg/dL)</option>
              <option value="3">3 - Well Above Normal (240 mg/dL or higher)</option>
            </select>
          </div>

          {/* Glucose */}
          <div>
            <label className="label font-semibold">Glucose</label>
            <select
              name="gluc"
              value={formData.gluc}
              onChange={handleChange}
              className="select select-bordered w-full"
              required
            >
              <option value="">Select</option>
              <option value="1">1 - Normal (70-99 mg/dL)</option>
              <option value="2">2 - Above Normal (100-125 mg/dL)</option>
              <option value="3">3 - Well Above Normal (126 mg/dL or higher)</option>
            </select>
          </div>

          {/* Smoke */}
          <div>
            <label className="label font-semibold">Do you smoke?</label>
            <select
              name="smoke"
              value={formData.smoke}
              onChange={handleChange}
              className="select select-bordered w-full"
              required
            >
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          {/* Alcohol */}
          <div>
            <label className="label font-semibold">Do you drink alcohol?</label>
            <select
              name="alco"
              value={formData.alco}
              onChange={handleChange}
              className="select select-bordered w-full"
              required
            >
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          {/* Active */}
          <div>
            <label className="label font-semibold">Are you physically active?</label>
            <select
              name="active"
              value={formData.active}
              onChange={handleChange}
              className="select select-bordered w-full"
              required
            >
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          {/* Submit button */}
          <div className="md:col-span-2 mt-4 flex justify-center">
            <button type="submit" className="btn btn-primary w-full md:w-1/2">
              Predict
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PredictionPage;